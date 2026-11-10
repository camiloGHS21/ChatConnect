import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import {
  CategoriaModel,
  SubcategoriaModel,
  MarcaModel,
  ImpuestoModel,
  ListaPrecioModel,
  AtributoModel,
  AtributoComponenteModel,
} from '../models/producto.model.js';
import { CatalogoConfigRepository } from './catalogo-config.repository.js';
import { RetencionRepository } from './retencion.repository.js';

@Injectable()
export class CatalogoRepository {
  private readonly logger = new Logger(CatalogoRepository.name);

  constructor(
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

    private readonly dataSource: DataSource,
    private readonly catalogoConfigRepo: CatalogoConfigRepository,
    private readonly retencionRepo: RetencionRepository,
  ) { }

  /**
   * Garantiza que cada empresa tenga los impuestos oficiales de la DIAN por defecto
   * y la unidad de medida con código 94 de la DIAN.
   */
  async asegurarConfiguracionDianPorDefecto(empresaId = 1): Promise<void> {
    return this.catalogoConfigRepo.asegurarConfiguracionDianPorDefecto(empresaId);
  }

  /**
   * Obtiene todos los catálogos maestros reales desde PostgreSQL.
   */
  async getCatalogos(empresaId = 1) {
    try {
      await this.retencionRepo.asegurarPorDefecto(empresaId);
      await this.asegurarConfiguracionDianPorDefecto(empresaId);
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
        this.retencionRepo.listar(empresaId, true),
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

  async getCatalogosConfiguracion(empresaId = 1) {
    return this.catalogoConfigRepo.getCatalogosConfiguracion(empresaId);
  }

  async actualizarCategoria(id: number, dto: { nombre?: string; estado?: string }, empresaId = 1) {
    const cat = await this.categoriaRepo.findOne({ where: { id, empresaId } });
    if (!cat) throw new NotFoundException('La categoría no existe');
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      if (!nombre) throw new BadRequestException('El nombre de la categoría es requerido');
      const dup = await this.categoriaRepo.findOne({ where: { empresaId, nombre: ILike(nombre) } });
      if (dup && Number(dup.id) !== Number(id)) {
        throw new BadRequestException(`Ya existe una categoría con el nombre "${nombre}"`);
      }
      cat.nombre = nombre;
    }
    if (dto.estado !== undefined) cat.estado = dto.estado;
    const saved = await this.categoriaRepo.save(cat);
    return { id: Number(saved.id), nombre: saved.nombre, estado: saved.estado };
  }

  async actualizarMarca(id: number, dto: { nombre?: string; estado?: string }, empresaId = 1) {
    const marca = await this.marcaRepo.findOne({ where: { id, empresaId } });
    if (!marca) throw new NotFoundException('La marca no existe');
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      if (!nombre) throw new BadRequestException('El nombre de la marca es requerido');
      const dup = await this.marcaRepo.findOne({ where: { empresaId, nombre: ILike(nombre) } });
      if (dup && Number(dup.id) !== Number(id)) {
        throw new BadRequestException(`Ya existe una marca con el nombre "${nombre}"`);
      }
      marca.nombre = nombre;
    }
    if (dto.estado !== undefined) marca.estado = dto.estado;
    const saved = await this.marcaRepo.save(marca);
    return { id: Number(saved.id), nombre: saved.nombre, estado: saved.estado };
  }

  async actualizarListaPrecio(id: number, dto: { nombre?: string; estado?: string }, empresaId = 1) {
    const lista = await this.listaPrecioRepo.findOne({ where: { id, empresaId } });
    if (!lista) throw new NotFoundException('La lista de precios no existe');
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      if (!nombre) throw new BadRequestException('El nombre de la lista de precios es requerido');
      const dup = await this.listaPrecioRepo.findOne({ where: { empresaId, nombre: ILike(nombre) } });
      if (dup && Number(dup.id) !== Number(id)) {
        throw new BadRequestException(`Ya existe una lista de precios con el nombre "${nombre}"`);
      }
      lista.nombre = nombre;
    }
    if (dto.estado !== undefined) lista.estado = dto.estado;
    const saved = await this.listaPrecioRepo.save(lista);
    return { id: Number(saved.id), nombre: saved.nombre, estado: saved.estado };
  }

  async actualizarImpuesto(
    id: number,
    dto: { nombre?: string; porcentaje?: number; valor?: number; tipo?: string; estado?: string },
    empresaId = 1,
  ) {
    const imp = await this.impuestoRepo.findOne({ where: { id, empresaId } });
    if (!imp) throw new NotFoundException('El impuesto no existe');
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      if (!nombre) throw new BadRequestException('El nombre del impuesto es requerido');
      imp.nombre = nombre;
    }
    if (dto.tipo !== undefined) imp.tipo = dto.tipo;
    if (dto.porcentaje !== undefined) imp.porcentaje = Number(dto.porcentaje) || 0;
    if (dto.valor !== undefined) imp.valor = dto.valor === null ? undefined : Number(dto.valor) || 0;
    if (dto.estado !== undefined) imp.estado = dto.estado;
    const saved = await this.impuestoRepo.save(imp);
    return {
      id: Number(saved.id),
      codigo: saved.codigo,
      nombre: saved.nombre,
      porcentaje: Number(saved.porcentaje) || 0,
      valor: saved.valor === null ? null : Number(saved.valor),
      tipo: saved.tipo,
      estado: saved.estado,
    };
  }

  async eliminarCategoria(id: number, empresaId = 1) {
    const cat = await this.categoriaRepo.findOne({ where: { id, empresaId } });
    if (!cat) throw new NotFoundException('La categoría no existe');

    const resCount = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total
       FROM public.producto
       WHERE empresa_id = $1
         AND (categoria_id = $2
              OR subcategoria_id IN (SELECT id_subcategoria FROM public.subcategoria WHERE categoria_id = $2 AND empresa_id = $1));`,
      [empresaId, id],
    );
    const total = Number(resCount[0]?.total || 0);
    if (total > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría "${cat.nombre}" porque tiene ${total} producto(s) asociado(s). Desvincule o reasigne los productos primero.`,
      );
    }

    await this.dataSource.query(
      `DELETE FROM public.subcategoria WHERE categoria_id = $1 AND empresa_id = $2;`,
      [id, empresaId],
    );
    await this.categoriaRepo.delete({ id, empresaId });

    return { success: true, message: `Categoría "${cat.nombre}" eliminada exitosamente`, id };
  }

  async eliminarMarca(id: number, empresaId = 1) {
    const marca = await this.marcaRepo.findOne({ where: { id, empresaId } });
    if (!marca) throw new NotFoundException('La marca no existe');

    const resCount = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.producto WHERE empresa_id = $1 AND marca_id = $2;`,
      [empresaId, id],
    );
    const total = Number(resCount[0]?.total || 0);
    if (total > 0) {
      throw new BadRequestException(
        `No se puede eliminar la marca "${marca.nombre}" porque tiene ${total} producto(s) asociado(s). Desvincule o reasigne los productos primero.`,
      );
    }

    await this.marcaRepo.delete({ id, empresaId });
    return { success: true, message: `Marca "${marca.nombre}" eliminada exitosamente`, id };
  }

  async eliminarListaPrecio(id: number, empresaId = 1) {
    const lista = await this.listaPrecioRepo.findOne({ where: { id, empresaId } });
    if (!lista) throw new NotFoundException('La lista de precios no existe');

    const resCount = await this.dataSource.query(
      `SELECT (
         (SELECT COUNT(*) FROM public.producto_lista_precio WHERE lista_precio_id = $1) +
         (SELECT COUNT(*) FROM public.precio WHERE empresa_id = $2 AND lista_precio_id = $1)
       )::int AS total;`,
      [id, empresaId],
    );
    const total = Number(resCount[0]?.total || 0);
    if (total > 0) {
      throw new BadRequestException(
        `No se puede eliminar la lista de precios "${lista.nombre}" porque tiene ${total} producto(s) o precio(s) asociado(s).`,
      );
    }

    await this.dataSource.query(
      `DELETE FROM public.producto_lista_precio WHERE lista_precio_id = $1;`,
      [id],
    );
    await this.dataSource.query(
      `DELETE FROM public.precio WHERE lista_precio_id = $1 AND empresa_id = $2;`,
      [id, empresaId],
    );
    await this.listaPrecioRepo.delete({ id, empresaId });
    return { success: true, message: `Lista de precios "${lista.nombre}" eliminada exitosamente`, id };
  }
}
