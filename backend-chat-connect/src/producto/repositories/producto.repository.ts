import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import {
  ProductoModel,
  CategoriaModel,
  SubcategoriaModel,
  MarcaModel,
  ImpuestoModel,
  ListaPrecioModel,
  AtributoModel,
  AtributoComponenteModel,
  SecuenciaModel,
} from '../models/producto.model.js';
import { CreateProductoDto } from '../dto/create-producto.dto.js';

/**
 * ============================================================================
 * REPOSITORIO DE PRODUCTOS Y CATÁLOGOS (Patrón TypeORM Repository)
 * ============================================================================
 * Encapsula de forma exclusiva todas las operaciones sobre la base de datos
 * PostgreSQL (DOC 02), idéntico a LoginRepository.
 */
@Injectable()
export class ProductoRepository {
  private readonly logger = new Logger(ProductoRepository.name);

  constructor(
    @InjectRepository(ProductoModel)
    private readonly productoRepo: Repository<ProductoModel>,

    @InjectRepository(CategoriaModel)
    private readonly categoriaRepo: Repository<CategoriaModel>,

    @InjectRepository(SubcategoriaModel)
    private readonly subcategoriaRepo: Repository<SubcategoriaModel>,

    @InjectRepository(MarcaModel)
    private readonly marcaRepo: Repository<MarcaModel>,

    @InjectRepository(ImpuestoModel)
    private readonly impuestoRepo: Repository<ImpuestoModel>,

    @InjectRepository(ListaPrecioModel)
    private readonly listaPrecioRepo: Repository<ListaPrecioModel>,

    @InjectRepository(AtributoModel)
    private readonly atributoRepo: Repository<AtributoModel>,

    @InjectRepository(AtributoComponenteModel)
    private readonly componenteRepo: Repository<AtributoComponenteModel>,

    @InjectRepository(SecuenciaModel)
    private readonly secuenciaRepo: Repository<SecuenciaModel>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene todos los catálogos maestros reales desde PostgreSQL.
   */
  async getCatalogos(empresaId = 1) {
    try {
      const [
        categorias,
        subcategorias,
        marcas,
        impuestos,
        listasPrecios,
        atributos,
        atributosComponentes,
        retenciones,
        tiposInventario,
        medidas,
        proveedores,
      ] = await Promise.all([
        this.categoriaRepo.find({ where: { empresaId, estado: 'activo' }, order: { nombre: 'ASC' } }),
        this.subcategoriaRepo.find({ where: { empresaId, estado: 'activo' }, order: { nombre: 'ASC' } }),
        this.marcaRepo.find({ where: { empresaId, estado: 'activo' }, order: { nombre: 'ASC' } }),
        this.impuestoRepo.find({ where: { empresaId, estado: 'activo' }, order: { id: 'ASC' } }),
        this.listaPrecioRepo.find({ where: { empresaId, estado: 'activo' }, order: { id: 'ASC' } }),
        this.atributoRepo.find({ where: { empresaId, estado: 'activo' }, order: { nombre: 'ASC' } }),
        this.componenteRepo.find({ where: { empresaId, estado: 'activo' }, order: { orden: 'ASC', nombre: 'ASC' } }),
        this.dataSource.query(
          `SELECT id_retencion AS id, nombre FROM public.retencion WHERE empresa_id = $1 AND estado = 'activo' ORDER BY nombre`,
          [empresaId],
        ),
        this.dataSource.query(
          `SELECT id_tipo_inventario AS id, nombre, descripcion FROM public.tipo_inventario WHERE empresa_id = $1 AND estado = 'activo' ORDER BY nombre`,
          [empresaId],
        ),
        this.dataSource.query(
          `SELECT id_medida AS id, codigo, nombre FROM public.medida WHERE empresa_id = $1 AND estado = 'activo' ORDER BY nombre`,
          [empresaId],
        ),
        this.dataSource.query(
          `SELECT id_tercero AS id, COALESCE(razon_social, nombre || ' ' || COALESCE(apellido, '')) AS nombre, numero_documento FROM public.tercero WHERE empresa_id = $1 AND estado = 'activo' AND tipo_tercero IN ('proveedor', 'ambos') ORDER BY nombre`,
          [empresaId],
        ),
      ]);

      return {
        categorias: categorias.map(c => ({ id: Number(c.id), nombre: c.nombre })),
        subcategorias: subcategorias.map(s => ({ id: Number(s.id), categoria_id: Number(s.categoriaId), nombre: s.nombre })),
        marcas: marcas.map(m => ({ id: Number(m.id), nombre: m.nombre })),
        impuestos: impuestos.map(i => ({
          id: Number(i.id),
          codigo: i.codigo,
          nombre: i.nombre,
          porcentaje: i.porcentaje,
          valor: i.valor,
          tipo: i.tipo,
        })),
        retenciones,
        listasPrecios: listasPrecios.map(l => ({ id: Number(l.id), nombre: l.nombre })),
        tiposInventario,
        medidas,
        proveedores,
        atributos: atributos.map(a => ({
          id: Number(a.id),
          nombre: a.nombre,
          codigo: a.codigo,
          descripcion: a.descripcion,
          permite_multiples: a.permiteMultiples,
          genera_variante: a.generaVariante,
          obligatorio: a.obligatorio,
        })),
        atributosComponentes: atributosComponentes.map(ac => ({
          id: Number(ac.id),
          atributo_id: Number(ac.atributoId),
          nombre: ac.nombre,
          codigo: ac.codigo,
          valor: ac.valor,
          descripcion: ac.descripcion,
          orden: ac.orden,
        })),
      };
    } catch (error: any) {
      this.logger.error(`Error al obtener catálogos en repositorio: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al cargar catálogos maestros desde la base de datos');
    }
  }

  /**
   * Obtiene la vista previa del siguiente código autosecuencial oficial.
   */
  async getSiguienteCodigo(empresaId = 1): Promise<{ codigo: string }> {
    try {
      const rows = await this.dataSource.query(
        `SELECT COALESCE(prefijo, '') || LPAD((consecutivo_actual + 1)::TEXT, longitud, '0') AS codigo
         FROM public.secuencia
         WHERE empresa_id = $1 AND UPPER(modulo) IN ('PRODUCTO','PRODUCTOS') AND estado = 'activo'
         LIMIT 1`,
        [empresaId],
      );
      if (rows && rows.length > 0) {
        return { codigo: rows[0].codigo };
      }
      return { codigo: 'PRD-0001' };
    } catch (error: any) {
      this.logger.error(`Error al consultar secuencia: ${error.message}`);
      return { codigo: 'PRD-0001' };
    }
  }

  /**
   * Crea una nueva categoría evitando duplicados.
   */
  async crearCategoria(dto: { nombre: string }, empresaId = 1) {
    const nombre = (dto.nombre || '').trim();
    if (!nombre) throw new BadRequestException('El nombre de la categoría es requerido');

    const existing = await this.categoriaRepo.findOne({
      where: { empresaId, nombre: ILike(nombre) },
    });
    if (existing) {
      return { id: Number(existing.id), nombre: existing.nombre, estado: existing.estado, subcategorias: [] };
    }

    const created = await this.categoriaRepo.save({
      empresaId,
      nombre,
      estado: 'activo',
    });
    return { id: Number(created.id), nombre: created.nombre, estado: created.estado, subcategorias: [] };
  }

  /**
   * Crea una nueva subcategoría vinculada a su categoría padre.
   */
  async crearSubcategoria(dto: { categoria_id: number; nombre: string }, empresaId = 1) {
    const nombre = (dto.nombre || '').trim();
    const categoriaId = Number(dto.categoria_id);
    if (!nombre || !categoriaId) throw new BadRequestException('La categoría padre y el nombre son requeridos');

    const existing = await this.subcategoriaRepo.findOne({
      where: { empresaId, categoriaId, nombre: ILike(nombre) },
    });
    if (existing) {
      return { id: Number(existing.id), categoria_id: Number(existing.categoriaId), nombre: existing.nombre, estado: existing.estado };
    }

    const created = await this.subcategoriaRepo.save({
      empresaId,
      categoriaId,
      nombre,
      estado: 'activo',
    });
    return { id: Number(created.id), categoria_id: Number(created.categoriaId), nombre: created.nombre, estado: created.estado };
  }

  /**
   * Crea una nueva marca evitando duplicados.
   */
  async crearMarca(dto: { nombre: string }, empresaId = 1) {
    const nombre = (dto.nombre || '').trim();
    if (!nombre) throw new BadRequestException('El nombre de la marca es requerido');

    const existing = await this.marcaRepo.findOne({
      where: { empresaId, nombre: ILike(nombre) },
    });
    if (existing) {
      return { id: Number(existing.id), nombre: existing.nombre, estado: existing.estado };
    }

    const created = await this.marcaRepo.save({
      empresaId,
      nombre,
      estado: 'activo',
    });
    return { id: Number(created.id), nombre: created.nombre, estado: created.estado };
  }

  /**
   * Crea un nuevo impuesto evitando duplicados.
   */
  async crearImpuesto(dto: { codigo?: string; nombre: string; porcentaje?: number; valor?: number; tipo?: string }, empresaId = 1) {
    const nombre = (dto.nombre || '').trim();
    const codigo = (dto.codigo || nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)).toUpperCase();
    if (!nombre) throw new BadRequestException('El nombre del impuesto es requerido');

    const existing = await this.impuestoRepo.findOne({
      where: [{ empresaId, nombre: ILike(nombre) }, { empresaId, codigo: ILike(codigo) }],
    });
    if (existing) {
      return {
        id: Number(existing.id),
        codigo: existing.codigo,
        nombre: existing.nombre,
        porcentaje: existing.porcentaje,
        valor: existing.valor,
        tipo: existing.tipo,
      };
    }

    const created = await this.impuestoRepo.save({
      empresaId,
      codigo,
      nombre,
      porcentaje: Number(dto.porcentaje) || 0,
      valor: Number(dto.valor) || 0,
      tipo: dto.tipo || 'PORCENTAJE',
      estado: 'activo',
    });
    return {
      id: Number(created.id),
      codigo: created.codigo,
      nombre: created.nombre,
      porcentaje: created.porcentaje,
      valor: created.valor,
      tipo: created.tipo,
    };
  }

  /**
   * Crea una nueva lista de precios evitando duplicados.
   */
  async crearListaPrecio(dto: { nombre: string }, empresaId = 1) {
    const nombre = (dto.nombre || '').trim();
    if (!nombre) throw new BadRequestException('El nombre de la lista de precios es requerido');

    const existing = await this.listaPrecioRepo.findOne({
      where: { empresaId, nombre: ILike(nombre) },
    });
    if (existing) {
      return { id: Number(existing.id), nombre: existing.nombre, estado: existing.estado };
    }

    const created = await this.listaPrecioRepo.save({
      empresaId,
      nombre,
      estado: 'activo',
    });
    return { id: Number(created.id), nombre: created.nombre, estado: created.estado };
  }

  /**
   * Crea un nuevo proveedor (tercero) evitando duplicados.
   */
  async crearProveedor(dto: any, empresaId = 1) {
    const nombre = (dto.nombre || dto.razon_social || '').trim();
    const doc = (dto.numero_documento || '').trim();
    if (!nombre) throw new BadRequestException('El nombre del proveedor es requerido');

    const existing = await this.dataSource.query(
      `SELECT id_tercero AS id, COALESCE(razon_social, nombre || ' ' || COALESCE(apellido, '')) AS nombre, numero_documento
       FROM public.tercero WHERE empresa_id = $1 AND ((numero_documento IS NOT NULL AND numero_documento = $2) OR LOWER(TRIM(nombre)) = LOWER(TRIM($3))) LIMIT 1`,
      [empresaId, doc || '---', nombre],
    );
    if (existing && existing.length > 0) {
      return { ...existing[0], id: Number(existing[0].id) };
    }

    const res = await this.dataSource.query(
      `INSERT INTO public.tercero (
         empresa_id, tipo_persona, tipo_tercero, tipo_documento, numero_documento, digito_verificacion,
         nombre, apellido, razon_social, email, telefono, whatsapp, departamento, ciudad, direccion, estado
       ) VALUES ($1, $2, 'proveedor', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'activo')
       RETURNING id_tercero AS id, COALESCE(razon_social, nombre || ' ' || COALESCE(apellido, '')) AS nombre, numero_documento, estado;`,
      [
        empresaId,
        dto.tipo_persona || 'juridica',
        dto.tipo_documento || 'NIT',
        doc || null,
        dto.digito_verificacion || null,
        dto.nombre || null,
        dto.apellido || null,
        dto.razon_social || dto.nombre || null,
        dto.email || null,
        dto.telefono || null,
        dto.whatsapp || dto.telefono || null,
        dto.departamento || null,
        dto.ciudad || null,
        dto.direccion || null,
      ],
    );
    return { ...res[0], id: Number(res[0].id) };
  }

  /**
   * Crea un nuevo atributo y opcionalmente sus componentes rápidos.
   */
  async crearAtributo(dto: any, empresaId = 1) {
    const nombre = (dto.nombre || '').trim();
    if (!nombre) throw new BadRequestException('El nombre del atributo es requerido');
    const codigo = (dto.codigo || nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'ATTR').toUpperCase();

    const existing = await this.atributoRepo.findOne({
      where: [{ empresaId, nombre: ILike(nombre) }, { empresaId, codigo: ILike(codigo) }],
    });
    if (existing) {
      const comps = await this.componenteRepo.find({
        where: { empresaId, atributoId: Number(existing.id), estado: 'activo' },
        order: { orden: 'ASC', nombre: 'ASC' },
      });
      return {
        id: Number(existing.id),
        nombre: existing.nombre,
        codigo: existing.codigo,
        descripcion: existing.descripcion,
        permite_multiples: existing.permiteMultiples,
        genera_variante: existing.generaVariante,
        obligatorio: existing.obligatorio,
        componentes: comps.map(c => ({
          id: Number(c.id),
          atributo_id: Number(c.atributoId),
          nombre: c.nombre,
          codigo: c.codigo,
          valor: c.valor,
          orden: c.orden,
        })),
      };
    }

    const created = await this.atributoRepo.save({
      empresaId,
      nombre,
      codigo,
      descripcion: dto.descripcion || null,
      permiteMultiples: dto.permite_multiples !== undefined ? Boolean(dto.permite_multiples) : true,
      generaVariante: dto.genera_variante !== undefined ? Boolean(dto.genera_variante) : true,
      obligatorio: Boolean(dto.obligatorio),
      estado: 'activo',
    });

    const createdComps: any[] = [];
    if (dto.componentes_rapidos && typeof dto.componentes_rapidos === 'string') {
      const parts = dto.componentes_rapidos.split(',').map((s: string) => s.trim()).filter(Boolean);
      for (let i = 0; i < parts.length; i++) {
        const cName = parts[i];
        const cCode = (cName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || `C${i + 1}`).toUpperCase();
        const comp = await this.componenteRepo.save({
          empresaId,
          atributoId: Number(created.id),
          nombre: cName,
          codigo: cCode,
          valor: cName,
          orden: i + 1,
          estado: 'activo',
        });
        createdComps.push({
          id: Number(comp.id),
          atributo_id: Number(comp.atributoId),
          nombre: comp.nombre,
          codigo: comp.codigo,
          valor: comp.valor,
          orden: comp.orden,
        });
      }
    }

    return {
      id: Number(created.id),
      nombre: created.nombre,
      codigo: created.codigo,
      descripcion: created.descripcion,
      permite_multiples: created.permiteMultiples,
      genera_variante: created.generaVariante,
      obligatorio: created.obligatorio,
      componentes: createdComps,
    };
  }

  /**
   * Crea un nuevo componente de atributo.
   */
  async crearComponente(dto: { atributo_id: number; nombre: string; codigo?: string; valor?: string; orden?: number }, empresaId = 1) {
    const nombre = (dto.nombre || '').trim();
    const atributoId = Number(dto.atributo_id);
    if (!nombre || !atributoId) throw new BadRequestException('El atributo padre y el nombre son requeridos');
    const codigo = (dto.codigo || nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || 'VAL').toUpperCase();

    const existing = await this.componenteRepo.findOne({
      where: { empresaId, atributoId, nombre: ILike(nombre) },
    });
    if (existing) {
      return {
        id: Number(existing.id),
        atributo_id: Number(existing.atributoId),
        nombre: existing.nombre,
        codigo: existing.codigo,
        valor: existing.valor,
        orden: existing.orden,
      };
    }

    const created = await this.componenteRepo.save({
      empresaId,
      atributoId,
      nombre,
      codigo,
      valor: dto.valor || nombre,
      orden: Number(dto.orden) || 99,
      estado: 'activo',
    });

    return {
      id: Number(created.id),
      atributo_id: Number(created.atributoId),
      nombre: created.nombre,
      codigo: created.codigo,
      valor: created.valor,
      orden: created.orden,
    };
  }

  /**
   * Persiste un producto completo con todas sus entidades hijas en una única transacción atómica.
   */
  async crearProducto(dto: CreateProductoDto, empresaId = 1) {
    if (!dto.nombre || !dto.nombre.trim()) {
      throw new BadRequestException('El nombre del producto es obligatorio');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Secuencia autoincremental oficial de la empresa
      if (!dto.codigo_interno || !dto.codigo_interno.trim()) {
        const secRows = await queryRunner.query(
          `SELECT id_secuencia, prefijo, consecutivo_actual, longitud
           FROM public.secuencia
           WHERE empresa_id = $1 AND UPPER(modulo) IN ('PRODUCTO','PRODUCTOS') AND estado = 'activo'
           FOR UPDATE;`,
          [empresaId],
        );

        if (secRows && secRows.length > 0) {
          const sec = secRows[0];
          const nuevoConsecutivo = Number(sec.consecutivo_actual) + 1;
          const prefijo = sec.prefijo || '';
          dto.codigo_interno = `${prefijo}${String(nuevoConsecutivo).padStart(sec.longitud, '0')}`;

          await queryRunner.query(
            `UPDATE public.secuencia
             SET consecutivo_actual = $1
             WHERE id_secuencia = $2;`,
            [nuevoConsecutivo, sec.id_secuencia],
          );
        } else {
          dto.codigo_interno = `PRD-${Date.now().toString().slice(-4)}`;
        }
      }

      // Verificación de unicidad del código interno
      const existingProduct = await queryRunner.query(
        `SELECT id_producto FROM public.producto WHERE empresa_id = $1 AND codigo_interno = $2 LIMIT 1;`,
        [empresaId, dto.codigo_interno.trim()],
      );
      if (existingProduct && existingProduct.length > 0) {
        throw new BadRequestException(`El código interno '${dto.codigo_interno}' ya se encuentra registrado`);
      }

      const costoBase = Number(dto.costo_base) || 0;
      const costoImpuesto = Number(dto.costo_impuesto) || costoBase;
      const precioBase = Number(dto.precio_base) || 0;
      const precioImpuesto = Number(dto.precio_impuesto) || precioBase;
      const utilidadValor = Number(dto.utilidad_valor) || Math.max(0, precioBase - costoBase);
      const utilidadPorcentaje =
        Number(dto.utilidad_porcentaje) || (costoBase > 0 ? ((precioBase - costoBase) / costoBase) * 100 : 0);

      // Inserción del producto principal
      const prodResult = await queryRunner.query(
        `INSERT INTO public.producto (
           empresa_id, categoria_id, subcategoria_id, marca_id,
           codigo_interno, nombre, descripcion_corta, descripcion_larga, ficha_tecnica,
           costo_base, costo_impuesto, precio_base, precio_impuesto, utilidad_valor, utilidad_porcentaje,
           maneja_inventario, tipo_inventario_id, stock_minimo, stock_maximo,
           medida_id, presentacion, estado_producto, estado_publicacion
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
         RETURNING *;`,
        [
          empresaId,
          dto.categoria_id ? Number(dto.categoria_id) : null,
          dto.subcategoria_id ? Number(dto.subcategoria_id) : null,
          dto.marca_id ? Number(dto.marca_id) : null,
          dto.codigo_interno ? dto.codigo_interno.trim() : null,
          dto.nombre.trim(),
          dto.descripcion_corta || null,
          dto.descripcion_larga || null,
          dto.ficha_tecnica || null,
          costoBase,
          costoImpuesto,
          precioBase,
          precioImpuesto,
          utilidadValor,
          utilidadPorcentaje,
          dto.maneja_inventario !== undefined ? Boolean(dto.maneja_inventario) : true,
          dto.tipo_inventario_id ? Number(dto.tipo_inventario_id) : null,
          Number(dto.stock_minimo) || 0,
          Number(dto.stock_maximo) || 0,
          dto.medida_id ? Number(dto.medida_id) : null,
          dto.presentacion || null,
          dto.estado_producto || 'activo',
          dto.estado_publicacion || 'publicado',
        ],
      );

      const producto = prodResult[0];
      const productoId = producto.id_producto;

      // 2. Impuestos de Compra
      if (dto.impuestos_compra && dto.impuestos_compra.length > 0) {
        for (const imp of dto.impuestos_compra) {
          if (imp.impuesto_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_impuesto_compra (producto_id, impuesto_id, valor_impuesto, estado)
               VALUES ($1, $2, $3, 'activo')
               ON CONFLICT (producto_id, impuesto_id) DO NOTHING;`,
              [productoId, Number(imp.impuesto_id), Number(imp.valor_impuesto) || 0],
            );
          }
        }
      }

      // 3. Impuestos de Venta
      if (dto.impuestos_venta && dto.impuestos_venta.length > 0) {
        for (const imp of dto.impuestos_venta) {
          if (imp.impuesto_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_impuesto_venta (producto_id, impuesto_id, valor_impuesto, estado)
               VALUES ($1, $2, $3, 'activo')
               ON CONFLICT (producto_id, impuesto_id) DO NOTHING;`,
              [productoId, Number(imp.impuesto_id), Number(imp.valor_impuesto) || 0],
            );
          }
        }
      }

      // 4. Listas de Precios
      if (dto.listas_precios && dto.listas_precios.length > 0) {
        for (const lp of dto.listas_precios) {
          if (lp.lista_precio_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_lista_precio (
                 producto_id, lista_precio_id, precio_base, utilidad_valor, utilidad_porcentaje, precio_venta, estado
               ) VALUES ($1, $2, $3, $4, $5, $6, 'activo')
               ON CONFLICT (producto_id, lista_precio_id) DO UPDATE SET
                 precio_base = EXCLUDED.precio_base,
                 precio_venta = EXCLUDED.precio_venta;`,
              [
                productoId,
                Number(lp.lista_precio_id),
                Number(lp.precio_base) || precioBase,
                Number(lp.utilidad_valor) || utilidadValor,
                Number(lp.utilidad_porcentaje) || utilidadPorcentaje,
                Number(lp.precio_venta) || precioImpuesto,
              ],
            );
          }
        }
      }

      // 5. Retenciones
      if (dto.retenciones && dto.retenciones.length > 0) {
        for (const ret of dto.retenciones) {
          if (ret.retencion_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_retencion (
                 producto_id, retencion_id, tipo, porcentaje, valor_fijo, estado
               ) VALUES ($1, $2, $3, $4, $5, 'activo')
               ON CONFLICT (producto_id, retencion_id) DO NOTHING;`,
              [
                productoId,
                Number(ret.retencion_id),
                ret.tipo || 'PORCENTAJE',
                ret.tipo === 'PORCENTAJE' ? Number(ret.porcentaje) || 0 : null,
                ret.tipo === 'VALOR_FIJO' ? Number(ret.valor_fijo) || 0 : null,
              ],
            );
          }
        }
      }

      // 6. Códigos de Barras
      if (dto.codigos_barras && dto.codigos_barras.length > 0) {
        for (const cb of dto.codigos_barras) {
          if (cb.codigo_barras && cb.codigo_barras.trim()) {
            await queryRunner.query(
              `INSERT INTO public.producto_codigo_barras (producto_id, codigo_barras, descripcion, principal, estado)
               VALUES ($1, $2, $3, $4, 'activo');`,
              [productoId, cb.codigo_barras.trim(), cb.descripcion || null, Boolean(cb.principal)],
            );
          }
        }
      }

      // 7. Proveedor Principal
      if (dto.proveedores && dto.proveedores.length > 0) {
        for (const prov of dto.proveedores) {
          if (prov.proveedor_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_proveedor (producto_id, proveedor_id, referencia_proveedor, principal)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (producto_id, proveedor_id) DO NOTHING;`,
              [
                productoId,
                Number(prov.proveedor_id),
                prov.referencia_proveedor || null,
                prov.principal !== undefined ? Boolean(prov.principal) : true,
              ],
            );
          }
        }
      }

      // 8. SEO e IA
      if (dto.titulo_seo || dto.descripcion_seo || dto.palabras_clave || dto.slug) {
        const slug =
          dto.slug && dto.slug.trim()
            ? dto.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : `${dto.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productoId}`;

        await queryRunner.query(
          `INSERT INTO public.producto_seo_ia (
             producto_id, titulo_seo, descripcion_seo, palabras_clave, slug, indexable
           ) VALUES ($1, $2, $3, $4, $5, true)
           ON CONFLICT (producto_id) DO UPDATE SET
             titulo_seo = EXCLUDED.titulo_seo,
             descripcion_seo = EXCLUDED.descripcion_seo;`,
          [productoId, dto.titulo_seo || dto.nombre, dto.descripcion_seo || null, dto.palabras_clave || null, slug],
        );
      }

      // 9. Imágenes
      if (dto.imagenes && dto.imagenes.length > 0) {
        for (let i = 0; i < dto.imagenes.length; i++) {
          const img = dto.imagenes[i];
          if (img.url) {
            await queryRunner.query(
              `INSERT INTO public.producto_imagen (producto_id, url, nombre, orden, principal, estado)
               VALUES ($1, $2, $3, $4, $5, 'activo');`,
              [productoId, img.url, img.nombre || `Imagen ${i + 1}`, Number(img.orden) || i, Boolean(img.principal !== undefined ? img.principal : i === 0)],
            );
          }
        }
      }

      // 10. Atributos asignados y componentes
      if (dto.atributos_asignados && dto.atributos_asignados.length > 0) {
        for (const attr of dto.atributos_asignados) {
          if (attr.id_atributo) {
            const attrRes = await queryRunner.query(
              `INSERT INTO public.producto_atributo (producto_id, atributo_id, obligatorio, orden, estado)
               VALUES ($1, $2, $3, $4, 'activo')
               ON CONFLICT (producto_id, atributo_id) DO UPDATE SET obligatorio = EXCLUDED.obligatorio
               RETURNING id_producto_atributo;`,
              [productoId, Number(attr.id_atributo), Boolean(attr.obligatorio), Number(attr.orden) || 1],
            );
            const prodAttrId = attrRes[0]?.id_producto_atributo;
            if (prodAttrId && attr.componentes_seleccionados && attr.componentes_seleccionados.length > 0) {
              for (let ci = 0; ci < attr.componentes_seleccionados.length; ci++) {
                const cId = Number(attr.componentes_seleccionados[ci]);
                if (!isNaN(cId)) {
                  await queryRunner.query(
                    `INSERT INTO public.producto_atributo_componente (producto_atributo_id, atributo_componente_id, orden, estado)
                     VALUES ($1, $2, $3, 'activo')
                     ON CONFLICT DO NOTHING;`,
                    [prodAttrId, cId, ci + 1],
                  );
                }
              }
            }
          }
        }
      }

      // 11. Variantes del Producto
      if (dto.variantes && dto.variantes.length > 0) {
        for (const v of dto.variantes) {
          if (v.sku) {
            await queryRunner.query(
              `INSERT INTO public.producto_variante (producto_id, sku, codigo_barras, referencia, precio, estado)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id_producto_variante;`,
              [
                productoId,
                v.sku.trim(),
                v.codigo_barras || null,
                v.referencia || null,
                Number(v.precio) || precioImpuesto,
                v.estado || 'activo',
              ],
            );
          }
        }
      }

      // 12. Inventario Inicial
      const existencia = Number(dto.existencia_inicial) || 0;
      await queryRunner.query(
        `INSERT INTO public.inventario (empresa_id, producto_id, existencia, reservado)
         VALUES ($1, $2, $3, 0);`,
        [empresaId, productoId, existencia],
      );

      await queryRunner.commitTransaction();
      this.logger.log(`✓ Producto creado exitosamente: ID ${productoId}, Código ${producto.codigo_interno}`);

      return {
        success: true,
        producto: {
          ...producto,
          id: Number(producto.id_producto),
        },
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error al crear producto: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Error al persistir el producto en la base de datos');
    } finally {
      await queryRunner.release();
    }
  }
}
