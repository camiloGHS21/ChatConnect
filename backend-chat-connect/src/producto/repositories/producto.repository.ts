import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
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
  CanalModel,
  DepartamentoModel,
  CiudadModel,
} from '../models/producto.model.js';
import { CreateProductoDto } from '../dto/create-producto.dto.js';
import { UpdateProductoDto } from '../dto/update-producto.dto.js';
import { CreateColeccionDto } from '../dto/create-coleccion.dto.js';
import { EnviarColeccionWhatsAppDto } from '../dto/enviar-coleccion-whatsapp.dto.js';

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

    @InjectRepository(CanalModel)
    private readonly canalRepo: Repository<CanalModel>,

    @InjectRepository(DepartamentoModel)
    private readonly departamentoRepo: Repository<DepartamentoModel>,

    @InjectRepository(CiudadModel)
    private readonly ciudadRepo: Repository<CiudadModel>,

    private readonly dataSource: DataSource,
  ) { }

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
   * ============================================================================
   * CATÁLOGOS MAESTROS: LISTADO PARA EL MÓDULO DE CONFIGURACIONES
   * ============================================================================
   * Devuelve todos los registros (activos e inactivos) para poder administrarlos.
   */
  async getCatalogosConfiguracion(empresaId = 1) {
    try {
      const [categorias, marcas, listasPrecios, impuestos, departamentos, ciudades] = await Promise.all([
        this.categoriaRepo.find({ where: { empresaId }, order: { nombre: 'ASC' } }),
        this.marcaRepo.find({ where: { empresaId }, order: { nombre: 'ASC' } }),
        this.listaPrecioRepo.find({ where: { empresaId }, order: { nombre: 'ASC' } }),
        this.impuestoRepo.find({ where: { empresaId }, order: { nombre: 'ASC' } }),
        this.departamentoRepo.find({ where: { estado: 'activo' }, order: { nombre: 'ASC' } }),
        this.ciudadRepo.find({ where: { estado: 'activo' }, order: { nombre: 'ASC' } }),
      ]);

      return {
        categorias: categorias.map(c => ({ id: Number(c.id), nombre: c.nombre, estado: c.estado })),
        marcas: marcas.map(m => ({ id: Number(m.id), nombre: m.nombre, estado: m.estado })),
        listasPrecios: listasPrecios.map(l => ({ id: Number(l.id), nombre: l.nombre, estado: l.estado })),
        impuestos: impuestos.map(i => ({
          id: Number(i.id),
          codigo: i.codigo,
          nombre: i.nombre,
          porcentaje: Number(i.porcentaje) || 0,
          valor: i.valor === null || i.valor === undefined ? null : Number(i.valor),
          tipo: i.tipo,
          estado: i.estado,
        })),
        departamentos: departamentos.map(d => ({ id: Number(d.id), codigo: d.codigo, nombre: d.nombre })),
        ciudades: ciudades.map(c => ({
          id: Number(c.id),
          id_departamento: Number(c.idDepartamento),
          codigo: c.codigo,
          nombre: c.nombre,
        })),
      };
    } catch (error: any) {
      this.logger.error(`Error al obtener catálogos de configuración: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al cargar los catálogos de configuración');
    }
  }

  /**
   * Actualiza (renombra) una categoría existente.
   */
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

  /**
   * Actualiza (renombra) una marca existente.
   */
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

  /**
   * Actualiza (renombra) una lista de precios existente.
   */
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

  /**
   * Actualiza un impuesto: nombre, tasa/valor fijo y estado.
   */
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

  /**
   * Lista los departamentos activos del catálogo geográfico.
   */
  async getDepartamentos() {
    const rows = await this.departamentoRepo.find({ where: { estado: 'activo' }, order: { nombre: 'ASC' } });
    return rows.map(d => ({ id: Number(d.id), codigo: d.codigo, nombre: d.nombre }));
  }

  /**
   * Lista las ciudades, opcionalmente filtradas por departamento (relación 1:N).
   */
  async getCiudades(departamentoId?: number) {
    const where = departamentoId ? { idDepartamento: departamentoId, estado: 'activo' } : { estado: 'activo' };
    const rows = await this.ciudadRepo.find({ where, order: { nombre: 'ASC' } });
    return rows.map(c => ({
      id: Number(c.id),
      id_departamento: Number(c.idDepartamento),
      codigo: c.codigo,
      nombre: c.nombre,
    }));
  }

  /**
   * Crea un nuevo departamento (catálogo geográfico, no depende de empresa).
   */
  async crearDepartamento(dto: { codigo?: string; nombre: string }) {
    const nombre = (dto.nombre || '').trim();
    if (!nombre) throw new BadRequestException('El nombre del departamento es requerido');
    const codigo = (dto.codigo || nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'DEP').toUpperCase();

    const existing = await this.departamentoRepo.findOne({ where: { codigo: ILike(codigo) } });
    if (existing) return { id: Number(existing.id), codigo: existing.codigo, nombre: existing.nombre };

    const created = await this.departamentoRepo.save({ codigo, nombre, estado: 'activo' });
    return { id: Number(created.id), codigo: created.codigo, nombre: created.nombre };
  }

  /**
   * Crea una nueva ciudad validando la existencia de su departamento.
   */
  async crearCiudad(dto: { id_departamento: number; codigo?: string; nombre: string }) {
    const nombre = (dto.nombre || '').trim();
    const idDepartamento = Number(dto.id_departamento);
    if (!nombre || !idDepartamento) {
      throw new BadRequestException('El departamento y el nombre de la ciudad son requeridos');
    }
    const codigo = (dto.codigo || nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'CIU').toUpperCase();

    const dept = await this.departamentoRepo.findOne({ where: { id: idDepartamento } });
    if (!dept) throw new BadRequestException('El departamento indicado no existe');

    const existing = await this.ciudadRepo.findOne({ where: { idDepartamento, codigo: ILike(codigo) } });
    if (existing) {
      return { id: Number(existing.id), id_departamento: Number(existing.idDepartamento), codigo: existing.codigo, nombre: existing.nombre };
    }

    const created = await this.ciudadRepo.save({ idDepartamento, codigo, nombre, estado: 'activo' });
    return { id: Number(created.id), id_departamento: Number(created.idDepartamento), codigo: created.codigo, nombre: created.nombre };
  }

  /**
   * Crea un nuevo proveedor (tercero) evitando duplicados.
   * Para persona natural separa `nombre` y `apellido`; para jurídica usa `razon_social`.
   */
  async crearProveedor(dto: any, empresaId = 1) {
    const esNatural = dto.tipo_persona === 'natural';
    const nombre = (dto.nombre || '').trim();
    const apellido = (dto.apellido || '').trim();
    const razonSocial = (dto.razon_social || '').trim();
    const nombreCompleto = esNatural
      ? [nombre, apellido].filter(Boolean).join(' ')
      : (razonSocial || nombre);

    if (!nombreCompleto) {
      throw new BadRequestException(
        esNatural ? 'El nombre y el apellido del proveedor son requeridos' : 'La razón social del proveedor es requerida',
      );
    }
    const doc = (dto.numero_documento || '').trim();

    const existing = await this.dataSource.query(
      `SELECT id_tercero AS id,
              COALESCE(razon_social, TRIM(CONCAT(COALESCE(nombre, ''), ' ', COALESCE(apellido, '')))) AS nombre,
              numero_documento, estado
       FROM public.tercero
       WHERE empresa_id = $1
         AND ((numero_documento IS NOT NULL AND numero_documento = $2)
              OR (tipo_persona = 'juridica' AND LOWER(TRIM(COALESCE(razon_social, ''))) = LOWER(TRIM($3))))
       LIMIT 1`,
      [empresaId, doc || '---', nombreCompleto],
    );
    if (existing && existing.length > 0) {
      return { ...existing[0], id: Number(existing[0].id) };
    }

    const idDep = dto.id_departamento ? Number(dto.id_departamento) : null;
    const idCiu = dto.id_ciudad ? Number(dto.id_ciudad) : null;
    const nombreDep = await this.resolverNombreDepartamento(dto, empresaId);
    const nombreCiu = await this.resolverNombreCiudad(dto, empresaId);

    const res = await this.dataSource.query(
      `INSERT INTO public.tercero (
         empresa_id, tipo_persona, tipo_tercero, tipo_documento, numero_documento, digito_verificacion,
         nombre, apellido, razon_social, email, telefono, whatsapp,
         id_departamento, id_ciudad, departamento, ciudad, direccion, estado
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'activo')
       RETURNING id_tercero AS id,
                 COALESCE(razon_social, TRIM(CONCAT(COALESCE(nombre, ''), ' ', COALESCE(apellido, '')))) AS nombre,
                 numero_documento, estado;`,
      [
        empresaId,
        esNatural ? 'natural' : 'juridica',
        this.normalizarTipoTercero(dto.tipo_tercero),
        dto.tipo_documento || (esNatural ? 'CC' : 'NIT'),
        doc || null,
        dto.digito_verificacion || null,
        esNatural ? (nombre || null) : null,
        esNatural ? (apellido || null) : null,
        esNatural ? null : (razonSocial || nombre || null),
        dto.email || null,
        dto.telefono || null,
        dto.whatsapp || dto.telefono || null,
        idDep,
        idCiu,
        nombreDep,
        nombreCiu,
        dto.direccion || null,
      ],
    );
    return { ...res[0], id: Number(res[0].id) };
  }

  /**
   * Normaliza el tipo de tercero a los valores admitidos por el CHECK de la BD.
   */
  private normalizarTipoTercero(val?: string): string {
    const v = String(val || '').toLowerCase();
    if (v === 'proveedor' || v === 'cliente' || v === 'ambos') return v;
    return 'proveedor';
  }

  /**
   * Resuelve el nombre del departamento desde su id (creándolo si aún no existe).
   */
  private async resolverNombreDepartamento(dto: any, empresaId: number): Promise<string | null> {
    const depId = Number(dto.id_departamento || dto.departamento_id);
    if (depId) {
      const dep = await this.departamentoRepo.findOne({ where: { id: depId } });
      if (dep) return dep.nombre;
    }
    if (!dto.departamento) return null;
    const nombreDep = String(dto.departamento).trim();
    if (!nombreDep) return null;
    const dep = await this.crearDepartamento({ nombre: nombreDep });
    return dep.nombre;
  }

  /**
   * Resuelve el nombre de la ciudad desde su id (creándola si aún no existe).
   */
  private async resolverNombreCiudad(dto: any, empresaId: number): Promise<string | null> {
    const ciudadId = Number(dto.id_ciudad || dto.ciudad_id);
    if (ciudadId) {
      const ciu = await this.ciudadRepo.findOne({ where: { id: ciudadId } });
      if (ciu) return ciu.nombre;
    }
    if (!dto.ciudad) return null;
    const nombreCiudad = String(dto.ciudad).trim();
    if (!nombreCiudad) return null;

    const nombreDep = await this.resolverNombreDepartamento(dto, empresaId);
    const dept = nombreDep
      ? await this.departamentoRepo.findOne({ where: { nombre: ILike(nombreDep) } })
      : null;
    if (!dept) return nombreCiudad;

    const existing = await this.ciudadRepo.findOne({
      where: { idDepartamento: Number(dept.id), nombre: ILike(nombreCiudad) },
    });
    if (existing) return existing.nombre;

    const created = await this.crearCiudad({ id_departamento: Number(dept.id), nombre: nombreCiudad });
    return created.nombre;
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
   * Resuelve cualquier URL local de assets o base64 a una URL pública CDN permanente para Meta.
   */
  async resolverUrlPublicaImagen(urlOPath?: string | null): Promise<string> {
    if (!urlOPath || !urlOPath.trim()) {
      return 'https://iili.io/nYj72us.jpg';
    }

    const trimmed = urlOPath.trim();

    // 1. Si ya es una URL pública HTTPS válida (que no sea localhost, dummy example.com ni Unsplash genérico)
    if (
      /^https?:\/\//i.test(trimmed) &&
      !trimmed.includes('localhost') &&
      !trimmed.includes('127.0.0.1') &&
      !trimmed.includes('example.com') &&
      !trimmed.includes('cdn.example.com') &&
      !trimmed.includes('photo-1581235720704') &&
      !trimmed.includes('photo-1533473359331')
    ) {
      return trimmed;
    }

    try {
      let fileBuffer: Buffer | null = null;
      let fileName = 'producto.png';
      let mimeType = 'image/png';

      // 2. Si es formato base64
      if (trimmed.startsWith('data:image/')) {
        const parts = trimmed.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) mimeType = mimeMatch[1];
        fileBuffer = Buffer.from(parts[1], 'base64');
        fileName = `upload_${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
      } else {
        // 3. Es ruta local de assets o relativa
        const cleanPath = trimmed.replace(/^\//, '');
        const possiblePaths = [
          path.resolve('c:/Users/Administrator/Desktop/crm-whatssap-practica', cleanPath),
          path.resolve(process.cwd(), '..', cleanPath),
          path.resolve(process.cwd(), cleanPath),
          path.resolve('c:/Users/Administrator/Desktop/crm-whatssap-practica/src/assets/images/products', path.basename(cleanPath)),
        ];

        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            fileBuffer = fs.readFileSync(p);
            fileName = path.basename(p);
            if (p.endsWith('.jpg') || p.endsWith('.jpeg')) mimeType = 'image/jpeg';
            else if (p.endsWith('.webp')) mimeType = 'image/webp';
            break;
          }
        }
      }

      if (fileBuffer) {
        const form = new FormData();
        form.append('key', '6d207e02198a847aa98d0a2a901485a5');
        form.append('action', 'upload');
        form.append('format', 'json');
        form.append('source', new Blob([fileBuffer as any], { type: mimeType }), fileName);

        const uploadRes = await fetch('https://freeimage.host/api/1/upload', {
          method: 'POST',
          body: form,
        });
        const uploadData: any = await uploadRes.json();
        if (uploadData?.image?.url) {
          this.logger.log(`✓ [MetaImages] Imagen local "${fileName}" subida a CDN permanente: ${uploadData.image.url}`);
          return uploadData.image.url;
        }
      }
    } catch (err: any) {
      this.logger.warn(`[MetaCatalog] Advertencia resolviendo URL de imagen pública: ${err.message}`);
    }

    return 'https://iili.io/nYj72us.jpg';
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
      // 1. Asignación del código interno mediante la función / trigger de PostgreSQL
      if (!dto.codigo_interno || !dto.codigo_interno.trim()) {
        const codigoGen = await queryRunner.query(
          `SELECT public.generar_codigo_producto($1) AS codigo;`,
          [empresaId],
        );
        dto.codigo_interno = codigoGen[0]?.codigo;
      } else {
        // Verificación de unicidad del código interno manual
        const existingProduct = await queryRunner.query(
          `SELECT id_producto FROM public.producto WHERE empresa_id = $1 AND codigo_interno = $2 LIMIT 1;`,
          [empresaId, dto.codigo_interno.trim()],
        );
        if (existingProduct && existingProduct.length > 0) {
          throw new BadRequestException(`El código interno '${dto.codigo_interno}' ya se encuentra registrado`);
        }
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

      // 6. Referencias del Producto (DOC 02)
      const referenciasToInsert: { referencia: string; descripcion?: string | null; estado?: string | null }[] = [];
      if (dto.referencia && typeof dto.referencia === 'string' && dto.referencia.trim()) {
        referenciasToInsert.push({ referencia: dto.referencia.trim(), descripcion: 'Referencia principal', estado: 'activo' });
      }
      if (dto.referencias && Array.isArray(dto.referencias)) {
        for (const r of dto.referencias) {
          const code = (r.referencia || '').trim();
          if (code && !referenciasToInsert.some(item => item.referencia.toLowerCase() === code.toLowerCase())) {
            referenciasToInsert.push({
              referencia: code,
              descripcion: r.descripcion || null,
              estado: r.estado || 'activo',
            });
          }
        }
      }
      for (const ref of referenciasToInsert) {
        await queryRunner.query(
          `INSERT INTO public.producto_referencia (producto_id, referencia, descripcion, estado)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (producto_id, referencia) DO NOTHING;`,
          [productoId, ref.referencia, ref.descripcion || null, ref.estado || 'activo'],
        );
      }

      // 7. Códigos de Barras
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

      // 8. Proveedor Principal
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

      // 9. Imágenes (Resueltas a URLs públicas CDN permanentes para Meta / WhatsApp)
      if (dto.imagenes && dto.imagenes.length > 0) {
        for (let i = 0; i < dto.imagenes.length; i++) {
          const img = dto.imagenes[i];
          if (img.url) {
            const publicUrl = await this.resolverUrlPublicaImagen(img.url);
            await queryRunner.query(
              `INSERT INTO public.producto_imagen (producto_id, url, nombre, orden, principal, estado)
               VALUES ($1, $2, $3, $4, $5, 'activo');`,
              [
                productoId,
                publicUrl || img.url,
                img.nombre || `Imagen ${i + 1}`,
                Number(img.orden) || i + 1,
                Boolean(img.principal !== undefined ? img.principal : i === 0),
              ],
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

      // 11. Variantes del Producto y vinculación a componentes (variante_componente)
      if (dto.variantes && dto.variantes.length > 0) {
        for (const v of dto.variantes) {
          if (v.sku) {
            const varRes = await queryRunner.query(
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
            const varId = varRes[0]?.id_producto_variante;
            if (varId) {
              const insertedCompIds = new Set<number>();
              if (v.componentes && Array.isArray(v.componentes)) {
                for (const c of v.componentes) {
                  const compId = Number(c.componenteId || c.id_atributo_componente || c.comp_id || c.id);
                  if (compId && !isNaN(compId)) {
                    await queryRunner.query(
                      `INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id)
                       VALUES ($1, $2)
                       ON CONFLICT DO NOTHING;`,
                      [varId, compId],
                    );
                    insertedCompIds.add(compId);
                  }
                }
              }
              if (insertedCompIds.size === 0) {
                const assignedComps = await queryRunner.query(
                  `SELECT pac.atributo_componente_id, ac.nombre, ac.codigo
                   FROM public.producto_atributo_componente pac
                   JOIN public.producto_atributo pa ON pa.id_producto_atributo = pac.producto_atributo_id
                   JOIN public.atributo_componente ac ON ac.id_atributo_componente = pac.atributo_componente_id
                   WHERE pa.producto_id = $1 AND pac.estado = 'activo';`,
                  [productoId],
                );
                const matchTarget = `${v.sku || ''} ${v.combinacion || ''} ${v.referencia || ''}`.toLowerCase();
                for (const ac of assignedComps) {
                  const compName = (ac.nombre || '').toLowerCase().trim();
                  const compCode = (ac.codigo || '').toLowerCase().trim();
                  if (
                    (compName && matchTarget.includes(compName)) ||
                    (compCode && matchTarget.includes(compCode)) ||
                    (compName.includes('negro') && (matchTarget.includes('neg') || matchTarget.includes('black'))) ||
                    (compName.includes('amarillo') && (matchTarget.includes('ama') || matchTarget.includes('yellow'))) ||
                    (compName.includes('blanco') && (matchTarget.includes('bla') || matchTarget.includes('white'))) ||
                    (compName.includes('azul') && (matchTarget.includes('azu') || matchTarget.includes('blue'))) ||
                    (compName.includes('20v') && matchTarget.includes('20v'))
                  ) {
                    await queryRunner.query(
                      `INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id)
                       VALUES ($1, $2)
                       ON CONFLICT DO NOTHING;`,
                      [varId, ac.atributo_componente_id],
                    );
                  }
                }
              }
            }
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
      await queryRunner.release();
      this.logger.log(`✓ Producto creado exitosamente: ID ${productoId}, Código ${producto.codigo_interno}`);

      // Sincronización automática con Meta Catalog en tiempo real
      let metaResult: any = null;
      try {
        metaResult = await this.sincronizarConMetaCatalog(productoId, empresaId);
      } catch (metaErr: any) {
        this.logger.error(`Error en sincronización background con Meta Catalog: ${metaErr.message}`);
      }

      return {
        success: true,
        producto: {
          ...producto,
          id: Number(producto.id_producto),
          fb_product_id: metaResult?.fb_product_id || null,
          meta_sync_status: metaResult?.success ? 'sincronizado' : 'error',
        },
      };
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`Error al crear producto: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Error al persistir el producto en la base de datos');
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Obtiene la lista completa de productos para la vista de catálogo.
   */
  async getProductos(empresaId = 1) {
    try {
      const sql = `
        SELECT
          p.id_producto AS id,
          p.codigo_interno AS sku,
          p.nombre,
          COALESCE(c.nombre, 'Sin Categoría') AS categoria,
          p.categoria_id,
          COALESCE(sc.nombre, '') AS subcategoria,
          p.subcategoria_id,
          COALESCE(m.nombre, '') AS marca,
          (
            SELECT pr.referencia
            FROM public.producto_referencia pr
            WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo'
            ORDER BY pr.id_producto_referencia ASC
            LIMIT 1
          ) AS referencia,
          p.precio_base AS precio,
          p.precio_impuesto,
          p.costo_base,
          COALESCE(inv.existencia, 0) AS existencia,
          COALESCE(inv.reservado, 0) AS reservado,
          GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible,
          p.estado_producto = 'activo' AS activo,
          p.fb_product_id,
          p.meta_sync_status,
          p.meta_sync_error,
          p.meta_synced_at,
          img.url AS imagen_principal,
          p.created_at
        FROM public.producto p
        LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
        LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
        LEFT JOIN public.marca m ON m.id_marca = p.marca_id
        LEFT JOIN (
          SELECT DISTINCT ON (producto_id) producto_id, url
          FROM public.producto_imagen
          WHERE estado = 'activo'
          ORDER BY producto_id, principal DESC, orden ASC, id_producto_imagen ASC
        ) img ON img.producto_id = p.id_producto
        LEFT JOIN (
          SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
          FROM public.inventario
          WHERE empresa_id = $1
          GROUP BY producto_id
        ) inv ON inv.producto_id = p.id_producto
        WHERE p.empresa_id = $1
        ORDER BY p.id_producto DESC;
      `;
      return await this.dataSource.query(sql, [empresaId]);
    } catch (error: any) {
      this.logger.error(`Error al listar productos: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al consultar catálogo de productos');
    }
  }

  /**
   * Obtiene un producto completo por su ID para edición o consulta detallada.
   */
  async getProductoPorId(productoId: number, empresaId = 1) {
    const prodRows = await this.dataSource.query(
      `SELECT
         p.*,
         COALESCE(c.nombre, '') AS categoria_nombre,
         COALESCE(sc.nombre, '') AS subcategoria_nombre,
         COALESCE(m.nombre, '') AS marca_nombre,
         (
           SELECT pr.referencia
           FROM public.producto_referencia pr
           WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo'
           ORDER BY pr.id_producto_referencia ASC
           LIMIT 1
         ) AS referencia_principal,
         GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible,
         COALESCE(inv.existencia, 0) AS existencia_actual
       FROM public.producto p
       LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
       LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
       LEFT JOIN public.marca m ON m.id_marca = p.marca_id
       LEFT JOIN (
         SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
         FROM public.inventario
         WHERE empresa_id = $1
         GROUP BY producto_id
       ) inv ON inv.producto_id = p.id_producto
       WHERE p.id_producto = $2 AND p.empresa_id = $1
       LIMIT 1;`,
      [empresaId, productoId],
    );

    const prod = prodRows[0];
    if (!prod) {
      throw new NotFoundException(`El producto con ID ${productoId} no fue encontrado`);
    }

    const [
      impuestosCompra,
      impuestosVenta,
      listasPrecios,
      retenciones,
      referencias,
      codigosBarras,
      proveedores,
      seoIa,
      imagenes,
      atributosAsignados,
      variantes,
    ] = await Promise.all([
      this.dataSource.query(
        `SELECT pic.impuesto_id, i.codigo, i.nombre, i.porcentaje, i.valor AS valor_fijo, i.tipo AS tipo_calculo, pic.valor_impuesto
         FROM public.producto_impuesto_compra pic
         JOIN public.impuesto i ON i.id_impuesto = pic.impuesto_id
         WHERE pic.producto_id = $1 AND pic.estado = 'activo'
         ORDER BY pic.impuesto_id ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT piv.impuesto_id, i.codigo, i.nombre, i.porcentaje, i.valor AS valor_fijo, i.tipo AS tipo_calculo, piv.valor_impuesto
         FROM public.producto_impuesto_venta piv
         JOIN public.impuesto i ON i.id_impuesto = piv.impuesto_id
         WHERE piv.producto_id = $1 AND piv.estado = 'activo'
         ORDER BY piv.impuesto_id ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT plp.lista_precio_id, lp.nombre AS nombre_lista, plp.precio_base, plp.utilidad_porcentaje, plp.utilidad_valor, plp.precio_venta, plp.estado
         FROM public.producto_lista_precio plp
         JOIN public.lista_precio lp ON lp.id_lista_precio = plp.lista_precio_id
         WHERE plp.producto_id = $1 AND plp.estado = 'activo'
         ORDER BY plp.lista_precio_id ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT pr.retencion_id, r.nombre AS nombre_retencion, pr.tipo, pr.porcentaje, pr.valor_fijo, pr.estado
         FROM public.producto_retencion pr
         JOIN public.retencion r ON r.id_retencion = pr.retencion_id
         WHERE pr.producto_id = $1 AND pr.estado = 'activo'
         ORDER BY pr.retencion_id ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT id_producto_referencia AS id, referencia, descripcion, estado
         FROM public.producto_referencia
         WHERE producto_id = $1 AND estado = 'activo'
         ORDER BY id_producto_referencia ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT id_producto_codigo_barras AS id, codigo_barras, descripcion, principal, estado
         FROM public.producto_codigo_barras
         WHERE producto_id = $1 AND estado = 'activo'
         ORDER BY id_producto_codigo_barras ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT pp.proveedor_id, COALESCE(t.razon_social, t.nombre || ' ' || COALESCE(t.apellido, '')) AS nombre_proveedor, pp.referencia_proveedor, pp.principal
         FROM public.producto_proveedor pp
         JOIN public.tercero t ON t.id_tercero = pp.proveedor_id
         WHERE pp.producto_id = $1;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT titulo_seo, slug, descripcion_seo, palabras_clave, indexable
         FROM public.producto_seo_ia
         WHERE producto_id = $1
         LIMIT 1;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT id_producto_imagen AS id, url, nombre, orden, principal
         FROM public.producto_imagen
         WHERE producto_id = $1 AND estado = 'activo'
         ORDER BY principal DESC, orden ASC, id_producto_imagen ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT
           pa.id_producto_atributo,
           pa.atributo_id AS id_atributo,
           a.nombre,
           a.codigo,
           pa.obligatorio,
           pa.orden,
           COALESCE(
             ARRAY_AGG(pac.atributo_componente_id) FILTER (WHERE pac.atributo_componente_id IS NOT NULL),
             '{}'
           ) AS componentes_seleccionados
         FROM public.producto_atributo pa
         JOIN public.atributo a ON a.id_atributo = pa.atributo_id
         LEFT JOIN public.producto_atributo_componente pac ON pac.producto_atributo_id = pa.id_producto_atributo AND pac.estado = 'activo'
         WHERE pa.producto_id = $1 AND pa.estado = 'activo'
         GROUP BY pa.id_producto_atributo, pa.atributo_id, a.nombre, a.codigo, pa.obligatorio, pa.orden
         ORDER BY pa.orden ASC;`,
        [productoId],
      ),
      this.dataSource.query(
        `SELECT
           pv.id_producto_variante AS id,
           pv.sku,
           pv.codigo_barras,
           pv.referencia,
           pv.precio,
           pv.estado,
           COALESCE(
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id_atributo_componente', ac.id_atributo_componente,
                 'componenteId', ac.id_atributo_componente,
                 'nombre', ac.nombre,
                 'atributoId', a.id_atributo,
                 'atributoNombre', a.nombre
               )
             ) FILTER (WHERE ac.id_atributo_componente IS NOT NULL),
             '[]'::json
           ) AS componentes
         FROM public.producto_variante pv
         LEFT JOIN public.variante_componente vc ON vc.producto_variante_id = pv.id_producto_variante
         LEFT JOIN public.atributo_componente ac ON ac.id_atributo_componente = vc.atributo_componente_id
         LEFT JOIN public.atributo a ON a.id_atributo = ac.atributo_id
         WHERE pv.producto_id = $1 AND pv.estado = 'activo'
         GROUP BY pv.id_producto_variante, pv.sku, pv.codigo_barras, pv.referencia, pv.precio, pv.estado
         ORDER BY pv.id_producto_variante ASC;`,
        [productoId],
      ),
    ]);

    const seo = seoIa[0] || {};

    return {
      id: Number(prod.id_producto),
      id_producto: Number(prod.id_producto),
      codigo_interno: prod.codigo_interno || '',
      nombre: prod.nombre || '',
      referencia: prod.referencia_principal || prod.codigo_interno || '',
      categoria_id: prod.categoria_id ? String(prod.categoria_id) : '',
      categoria: prod.categoria_nombre || '',
      subcategoria_id: prod.subcategoria_id ? String(prod.subcategoria_id) : '',
      subcategoria: prod.subcategoria_nombre || '',
      marca_id: prod.marca_id ? String(prod.marca_id) : '',
      marca: prod.marca_nombre || '',
      descripcion_corta: prod.descripcion_corta || '',
      descripcion_larga: prod.descripcion_larga || '',
      ficha_tecnica: prod.ficha_tecnica || '',
      estado_producto: prod.estado_producto || 'activo',
      estado_publicacion: prod.estado_publicacion || 'publicado',

      costo_base: Number(prod.costo_base) || 0,
      costo_impuesto: Number(prod.costo_impuesto) || 0,
      precio_base: Number(prod.precio_base) || 0,
      precio_impuesto: Number(prod.precio_impuesto) || 0,
      utilidad_valor: Number(prod.utilidad_valor) || 0,
      utilidad_porcentaje: Number(prod.utilidad_porcentaje) || 0,

      impuestos_compra: impuestosCompra.map((i: any) => ({
        id: Number(i.impuesto_id),
        impuesto_id: Number(i.impuesto_id),
        codigo: i.codigo,
        nombre: i.nombre,
        tipo_calculo: i.tipo_calculo || 'PORCENTAJE',
        porcentaje: Number(i.porcentaje) || 0,
        valor_fijo: Number(i.valor_fijo) || 0,
        valor_impuesto: Number(i.valor_impuesto) || 0,
      })),
      impuestos_venta: impuestosVenta.map((i: any) => ({
        id: Number(i.impuesto_id),
        impuesto_id: Number(i.impuesto_id),
        codigo: i.codigo,
        nombre: i.nombre,
        tipo_calculo: i.tipo_calculo || 'PORCENTAJE',
        porcentaje: Number(i.porcentaje) || 0,
        valor_fijo: Number(i.valor_fijo) || 0,
        valor_impuesto: Number(i.valor_impuesto) || 0,
      })),
      listas_precios: listasPrecios.map((lp: any) => ({
        id: Number(lp.lista_precio_id),
        lista_precio_id: String(lp.lista_precio_id),
        nombre_lista: lp.nombre_lista,
        precio_base: Number(lp.precio_base) || 0,
        utilidad_porcentaje: Number(lp.utilidad_porcentaje) || 0,
        utilidad_valor: Number(lp.utilidad_valor) || 0,
        precio_venta: Number(lp.precio_venta) || 0,
        estado: lp.estado,
      })),
      retenciones: retenciones.map((r: any) => ({
        id: Number(r.retencion_id),
        retencion_id: String(r.retencion_id),
        nombre_retencion: r.nombre_retencion,
        tipo: r.tipo || 'PORCENTAJE',
        porcentaje: Number(r.porcentaje) || 0,
        valor_fijo: Number(r.valor_fijo) || 0,
        estado: r.estado,
      })),

      maneja_inventario: Boolean(prod.maneja_inventario),
      tipo_inventario_id: prod.tipo_inventario_id ? String(prod.tipo_inventario_id) : '',
      medida_id: prod.medida_id ? String(prod.medida_id) : '',
      presentacion: prod.presentacion || '',
      stock_minimo: Number(prod.stock_minimo) || 0,
      stock_maximo: Number(prod.stock_maximo) || 0,
      existencia_inicial: Number(prod.existencia_actual) || 0,

      referencias: referencias.map((r: any) => ({
        id: Number(r.id),
        referencia: r.referencia,
        descripcion: r.descripcion || '',
        estado: r.estado || 'activo',
      })),
      codigos_barras: codigosBarras.map((cb: any) => ({
        id: Number(cb.id),
        codigo_barras: cb.codigo_barras,
        tipo: cb.tipo || 'EAN-13 Comercial',
        descripcion: cb.descripcion || '',
        principal: Boolean(cb.principal),
        estado: cb.estado || 'activo',
      })),
      proveedores: proveedores.map((pv: any) => ({
        id: Number(pv.proveedor_id),
        proveedor_id: String(pv.proveedor_id),
        nombre_proveedor: pv.nombre_proveedor,
        referencia_proveedor: pv.referencia_proveedor || '',
        principal: Boolean(pv.principal),
      })),

      atributos_asignados: atributosAsignados.map((a: any) => ({
        id_atributo: Number(a.id_atributo),
        nombre: a.nombre,
        codigo: a.codigo,
        obligatorio: Boolean(a.obligatorio),
        orden: Number(a.orden) || 1,
        componentes_seleccionados: (a.componentes_seleccionados || []).map(Number),
      })),
      variantes: variantes.map((v: any) => ({
        id: Number(v.id),
        sku: v.sku,
        combinacion: Array.isArray(v.componentes)
          ? v.componentes.map((c: any) => `${c.atributoNombre || ''}: ${c.nombre || ''}`).filter(Boolean).join(' | ')
          : '',
        componentes: v.componentes,
        codigo_barras: v.codigo_barras || '',
        referencia: v.referencia || '',
        precio: Number(v.precio) || 0,
        stock: Number(prod.disponible) || 0,
        estado: v.estado || 'activo',
      })),

      titulo_seo: seo.titulo_seo || '',
      slug: seo.slug || '',
      descripcion_seo: seo.descripcion_seo || '',
      palabras_clave: seo.palabras_clave || '',
      indexable: seo.indexable !== undefined ? Boolean(seo.indexable) : true,

      imagenes: imagenes.map((img: any) => ({
        id: Number(img.id),
        url: img.url,
        nombre: img.nombre || '',
        principal: Boolean(img.principal),
        orden: Number(img.orden) || 1,
      })),

      fb_product_id: prod.fb_product_id,
      meta_sync_status: prod.meta_sync_status,
      meta_sync_error: prod.meta_sync_error,
      meta_synced_at: prod.meta_synced_at,
    };
  }

  /**
   * Actualiza un producto existente en PostgreSQL y sincroniza en Meta WhatsApp
   * ÚNICAMENTE los campos que hayan cambiado (diff update granular).
   */
  async actualizarProducto(productoId: number, dto: UpdateProductoDto, empresaId = 1) {
    const oldRows = await this.dataSource.query(
      `SELECT
         p.*,
         COALESCE(c.nombre, '') AS categoria_nombre,
         COALESCE(sc.nombre, '') AS subcategoria_nombre,
         COALESCE(m.nombre, '') AS marca_nombre,
         (
           SELECT pr.referencia
           FROM public.producto_referencia pr
           WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo'
           ORDER BY pr.id_producto_referencia ASC
           LIMIT 1
         ) AS referencia_principal,
         GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible,
         img.url AS imagen_url
       FROM public.producto p
       LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
       LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
       LEFT JOIN public.marca m ON m.id_marca = p.marca_id
       LEFT JOIN (
         SELECT DISTINCT ON (producto_id) producto_id, url
         FROM public.producto_imagen
         WHERE estado = 'activo'
         ORDER BY producto_id, principal DESC, orden ASC, id_producto_imagen ASC
       ) img ON img.producto_id = p.id_producto
       LEFT JOIN (
         SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
         FROM public.inventario
         WHERE empresa_id = $1
         GROUP BY producto_id
       ) inv ON inv.producto_id = p.id_producto
       WHERE p.id_producto = $2 AND p.empresa_id = $1
       LIMIT 1;`,
      [empresaId, productoId],
    );

    const oldProd = oldRows[0];
    if (!oldProd) {
      throw new NotFoundException(`El producto con ID ${productoId} no fue encontrado`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const costoBase = dto.costo_base !== undefined ? Number(dto.costo_base) : Number(oldProd.costo_base);
      const costoImpuesto = dto.costo_impuesto !== undefined ? Number(dto.costo_impuesto) : Number(oldProd.costo_impuesto);
      const precioBase = dto.precio_base !== undefined ? Number(dto.precio_base) : Number(oldProd.precio_base);
      const precioImpuesto = dto.precio_impuesto !== undefined ? Number(dto.precio_impuesto) : Number(oldProd.precio_impuesto);
      const utilidadValor = dto.utilidad_valor !== undefined ? Number(dto.utilidad_valor) : Number(oldProd.utilidad_valor);
      const utilidadPorcentaje = dto.utilidad_porcentaje !== undefined ? Number(dto.utilidad_porcentaje) : Number(oldProd.utilidad_porcentaje);

      // 1. Actualizar tabla principal producto
      await queryRunner.query(
        `UPDATE public.producto SET
           categoria_id = CASE WHEN $1::int IS NOT NULL THEN $1::int ELSE categoria_id END,
           subcategoria_id = CASE WHEN $2::int IS NOT NULL THEN $2::int ELSE subcategoria_id END,
           marca_id = CASE WHEN $3::int IS NOT NULL THEN $3::int ELSE marca_id END,
           nombre = COALESCE($4, nombre),
           descripcion_corta = COALESCE($5, descripcion_corta),
           descripcion_larga = COALESCE($6, descripcion_larga),
           ficha_tecnica = COALESCE($7, ficha_tecnica),
           costo_base = $8,
           costo_impuesto = $9,
           precio_base = $10,
           precio_impuesto = $11,
           utilidad_valor = $12,
           utilidad_porcentaje = $13,
           maneja_inventario = CASE WHEN $14::boolean IS NOT NULL THEN $14::boolean ELSE maneja_inventario END,
           tipo_inventario_id = CASE WHEN $15::int IS NOT NULL THEN $15::int ELSE tipo_inventario_id END,
           stock_minimo = CASE WHEN $16::numeric IS NOT NULL THEN $16::numeric ELSE stock_minimo END,
           stock_maximo = CASE WHEN $17::numeric IS NOT NULL THEN $17::numeric ELSE stock_maximo END,
           medida_id = CASE WHEN $18::int IS NOT NULL THEN $18::int ELSE medida_id END,
           presentacion = COALESCE($19, presentacion),
           estado_producto = COALESCE($20, estado_producto),
           estado_publicacion = COALESCE($21, estado_publicacion),
           updated_at = NOW()
         WHERE id_producto = $22 AND empresa_id = $23;`,
        [
          dto.categoria_id !== undefined ? (dto.categoria_id ? Number(dto.categoria_id) : null) : null,
          dto.subcategoria_id !== undefined ? (dto.subcategoria_id ? Number(dto.subcategoria_id) : null) : null,
          dto.marca_id !== undefined ? (dto.marca_id ? Number(dto.marca_id) : null) : null,
          dto.nombre ? dto.nombre.trim() : null,
          dto.descripcion_corta !== undefined ? dto.descripcion_corta : null,
          dto.descripcion_larga !== undefined ? dto.descripcion_larga : null,
          dto.ficha_tecnica !== undefined ? dto.ficha_tecnica : null,
          costoBase,
          costoImpuesto,
          precioBase,
          precioImpuesto,
          utilidadValor,
          utilidadPorcentaje,
          dto.maneja_inventario !== undefined ? Boolean(dto.maneja_inventario) : null,
          dto.tipo_inventario_id !== undefined ? (dto.tipo_inventario_id ? Number(dto.tipo_inventario_id) : null) : null,
          dto.stock_minimo !== undefined ? Number(dto.stock_minimo) : null,
          dto.stock_maximo !== undefined ? Number(dto.stock_maximo) : null,
          dto.medida_id !== undefined ? (dto.medida_id ? Number(dto.medida_id) : null) : null,
          dto.presentacion !== undefined ? dto.presentacion : null,
          dto.estado_producto !== undefined ? dto.estado_producto : null,
          dto.estado_publicacion !== undefined ? dto.estado_publicacion : null,
          productoId,
          empresaId,
        ],
      );

      // 2. Inventario
      if (dto.existencia_inicial !== undefined) {
        await queryRunner.query(
          `INSERT INTO public.inventario (empresa_id, producto_id, existencia, reservado)
           VALUES ($1, $2, $3, 0)
           ON CONFLICT (empresa_id, producto_id) DO UPDATE SET existencia = EXCLUDED.existencia, updated_at = NOW();`,
          [empresaId, productoId, Number(dto.existencia_inicial) || 0],
        );
      }

      // 3. Impuestos Compra
      if (dto.impuestos_compra !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_impuesto_compra WHERE producto_id = $1;`, [productoId]);
        for (const imp of dto.impuestos_compra) {
          if (imp.impuesto_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_impuesto_compra (producto_id, impuesto_id, valor_impuesto, estado)
               VALUES ($1, $2, $3, 'activo')
               ON CONFLICT (producto_id, impuesto_id) DO UPDATE SET valor_impuesto = EXCLUDED.valor_impuesto;`,
              [productoId, Number(imp.impuesto_id), Number(imp.valor_impuesto) || 0],
            );
          }
        }
      }

      // 4. Impuestos Venta
      if (dto.impuestos_venta !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_impuesto_venta WHERE producto_id = $1;`, [productoId]);
        for (const imp of dto.impuestos_venta) {
          if (imp.impuesto_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_impuesto_venta (producto_id, impuesto_id, valor_impuesto, estado)
               VALUES ($1, $2, $3, 'activo')
               ON CONFLICT (producto_id, impuesto_id) DO UPDATE SET valor_impuesto = EXCLUDED.valor_impuesto;`,
              [productoId, Number(imp.impuesto_id), Number(imp.valor_impuesto) || 0],
            );
          }
        }
      }

      // 5. Listas de Precios
      if (dto.listas_precios !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_lista_precio WHERE producto_id = $1;`, [productoId]);
        for (const lp of dto.listas_precios) {
          if (lp.lista_precio_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_lista_precio (
                 producto_id, lista_precio_id, precio_base, utilidad_valor, utilidad_porcentaje, precio_venta, estado
               ) VALUES ($1, $2, $3, $4, $5, $6, 'activo');`,
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

      // 6. Retenciones
      if (dto.retenciones !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_retencion WHERE producto_id = $1;`, [productoId]);
        for (const ret of dto.retenciones) {
          if (ret.retencion_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_retencion (producto_id, retencion_id, tipo, porcentaje, valor_fijo, estado)
               VALUES ($1, $2, $3, $4, $5, 'activo');`,
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

      // 7. Referencias
      if (dto.referencias !== undefined || dto.referencia !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_referencia WHERE producto_id = $1;`, [productoId]);
        const refsToInsert: { referencia: string; descripcion?: string | null; estado?: string | null }[] = [];
        if (dto.referencia && typeof dto.referencia === 'string' && dto.referencia.trim()) {
          refsToInsert.push({ referencia: dto.referencia.trim(), descripcion: 'Referencia principal', estado: 'activo' });
        }
        if (dto.referencias && Array.isArray(dto.referencias)) {
          for (const r of dto.referencias) {
            const code = (r.referencia || '').trim();
            if (code && !refsToInsert.some(item => item.referencia.toLowerCase() === code.toLowerCase())) {
              refsToInsert.push({ referencia: code, descripcion: r.descripcion || null, estado: r.estado || 'activo' });
            }
          }
        }
        for (const ref of refsToInsert) {
          await queryRunner.query(
            `INSERT INTO public.producto_referencia (producto_id, referencia, descripcion, estado)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (producto_id, referencia) DO NOTHING;`,
            [productoId, ref.referencia, ref.descripcion || null, ref.estado || 'activo'],
          );
        }
      }

      // 8. Códigos de barras
      if (dto.codigos_barras !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_codigo_barras WHERE producto_id = $1;`, [productoId]);
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

      // 9. Proveedores
      if (dto.proveedores !== undefined) {
        await queryRunner.query(`DELETE FROM public.producto_proveedor WHERE producto_id = $1;`, [productoId]);
        for (const prov of dto.proveedores) {
          if (prov.proveedor_id) {
            await queryRunner.query(
              `INSERT INTO public.producto_proveedor (producto_id, proveedor_id, referencia_proveedor, principal)
               VALUES ($1, $2, $3, $4);`,
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

      // 10. SEO
      if (dto.titulo_seo || dto.descripcion_seo || dto.palabras_clave || dto.slug) {
        const slug =
          dto.slug && dto.slug.trim()
            ? dto.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : `${(dto.nombre || oldProd.nombre).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productoId}`;

        await queryRunner.query(
          `INSERT INTO public.producto_seo_ia (
             producto_id, titulo_seo, descripcion_seo, palabras_clave, slug, indexable
           ) VALUES ($1, $2, $3, $4, $5, true)
           ON CONFLICT (producto_id) DO UPDATE SET
             titulo_seo = EXCLUDED.titulo_seo,
             descripcion_seo = EXCLUDED.descripcion_seo,
             palabras_clave = EXCLUDED.palabras_clave,
             slug = EXCLUDED.slug;`,
          [productoId, dto.titulo_seo || dto.nombre || oldProd.nombre, dto.descripcion_seo || null, dto.palabras_clave || null, slug],
        );
      }

      // 11. Imágenes
      if (dto.imagenes !== undefined && dto.imagenes.length > 0) {
        await queryRunner.query(`DELETE FROM public.producto_imagen WHERE producto_id = $1;`, [productoId]);
        for (let i = 0; i < dto.imagenes.length; i++) {
          const img = dto.imagenes[i];
          if (img.url) {
            const publicUrl = await this.resolverUrlPublicaImagen(img.url);
            await queryRunner.query(
              `INSERT INTO public.producto_imagen (producto_id, url, nombre, orden, principal, estado)
               VALUES ($1, $2, $3, $4, $5, 'activo');`,
              [
                productoId,
                publicUrl || img.url,
                img.nombre || `Imagen ${i + 1}`,
                Number(img.orden) || i + 1,
                Boolean(img.principal !== undefined ? img.principal : i === 0),
              ],
            );
          }
        }
      }

      // 12. Atributos y componentes
      if (dto.atributos_asignados !== undefined) {
        const oldProdAttrs = await queryRunner.query(
          `SELECT id_producto_atributo FROM public.producto_atributo WHERE producto_id = $1;`,
          [productoId],
        );
        for (const pa of oldProdAttrs) {
          await queryRunner.query(
            `DELETE FROM public.producto_atributo_componente WHERE producto_atributo_id = $1;`,
            [pa.id_producto_atributo],
          );
        }
        await queryRunner.query(`DELETE FROM public.producto_atributo WHERE producto_id = $1;`, [productoId]);

        for (const attr of dto.atributos_asignados) {
          if (attr.id_atributo) {
            const attrRes = await queryRunner.query(
              `INSERT INTO public.producto_atributo (producto_id, atributo_id, obligatorio, orden, estado)
               VALUES ($1, $2, $3, $4, 'activo')
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

      // 13. Variantes
      if (dto.variantes !== undefined) {
        const currentVars = await queryRunner.query(
          `SELECT id_producto_variante FROM public.producto_variante WHERE producto_id = $1;`,
          [productoId],
        );
        for (const cv of currentVars) {
          await queryRunner.query(
            `DELETE FROM public.variante_componente WHERE producto_variante_id = $1;`,
            [cv.id_producto_variante],
          );
        }
        await queryRunner.query(`DELETE FROM public.producto_variante WHERE producto_id = $1;`, [productoId]);

        for (const v of dto.variantes) {
          if (v.sku) {
            const varRes = await queryRunner.query(
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
            const varId = varRes[0]?.id_producto_variante;
            if (varId) {
              const insertedCompIds = new Set<number>();
              if (v.componentes && Array.isArray(v.componentes)) {
                for (const c of v.componentes) {
                  const compId = Number(c.componenteId || c.id_atributo_componente || c.comp_id || c.id);
                  if (compId && !isNaN(compId)) {
                    await queryRunner.query(
                      `INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id)
                       VALUES ($1, $2)
                       ON CONFLICT DO NOTHING;`,
                      [varId, compId],
                    );
                    insertedCompIds.add(compId);
                  }
                }
              }
              if (insertedCompIds.size === 0) {
                const assignedComps = await queryRunner.query(
                  `SELECT pac.atributo_componente_id, ac.nombre, ac.codigo
                   FROM public.producto_atributo_componente pac
                   JOIN public.producto_atributo pa ON pa.id_producto_atributo = pac.producto_atributo_id
                   JOIN public.atributo_componente ac ON ac.id_atributo_componente = pac.atributo_componente_id
                   WHERE pa.producto_id = $1 AND pac.estado = 'activo';`,
                  [productoId],
                );
                const matchTarget = `${v.sku || ''} ${v.combinacion || ''} ${v.referencia || ''}`.toLowerCase();
                for (const ac of assignedComps) {
                  const compName = (ac.nombre || '').toLowerCase().trim();
                  const compCode = (ac.codigo || '').toLowerCase().trim();
                  if (
                    (compName && matchTarget.includes(compName)) ||
                    (compCode && matchTarget.includes(compCode)) ||
                    (compName.includes('negro') && (matchTarget.includes('neg') || matchTarget.includes('black'))) ||
                    (compName.includes('amarillo') && (matchTarget.includes('ama') || matchTarget.includes('yellow'))) ||
                    (compName.includes('blanco') && (matchTarget.includes('bla') || matchTarget.includes('white'))) ||
                    (compName.includes('azul') && (matchTarget.includes('azu') || matchTarget.includes('blue'))) ||
                    (compName.includes('20v') && matchTarget.includes('20v'))
                  ) {
                    await queryRunner.query(
                      `INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id)
                       VALUES ($1, $2)
                       ON CONFLICT DO NOTHING;`,
                      [varId, ac.atributo_componente_id],
                    );
                  }
                }
              }
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`✓ Producto ${productoId} actualizado en PostgreSQL.`);
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`Error al actualizar producto ${productoId}: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Error al actualizar el producto en la base de datos');
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }

    // 14. Sincronización en Meta / WhatsApp Catalog: ÚNICAMENTE los campos modificados
    const metaModificaciones: Record<string, any> = {};
    const metaToken =
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const businessId = process.env.META_BUSINESS_ID;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    if (metaToken && businessId) {
      try {
        const updatedRows = await this.dataSource.query(
          `SELECT
             p.*,
             COALESCE(c.nombre, '') AS categoria_nombre,
             COALESCE(sc.nombre, '') AS subcategoria_nombre,
             COALESCE(m.nombre, '') AS marca_nombre,
             (
               SELECT pr.referencia
               FROM public.producto_referencia pr
               WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo'
               ORDER BY pr.id_producto_referencia ASC
               LIMIT 1
             ) AS referencia_principal,
             GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible,
             img.url AS imagen_url
           FROM public.producto p
           LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
           LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
           LEFT JOIN public.marca m ON m.id_marca = p.marca_id
           LEFT JOIN (
             SELECT DISTINCT ON (producto_id) producto_id, url
             FROM public.producto_imagen
             WHERE estado = 'activo'
             ORDER BY producto_id, principal DESC, orden ASC, id_producto_imagen ASC
           ) img ON img.producto_id = p.id_producto
           LEFT JOIN (
             SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
             FROM public.inventario
             WHERE empresa_id = $1
             GROUP BY producto_id
           ) inv ON inv.producto_id = p.id_producto
           WHERE p.id_producto = $2 AND p.empresa_id = $1
           LIMIT 1;`,
          [empresaId, productoId],
        );
        const newProd = updatedRows[0];

        const canalRows = await this.dataSource.query(
          `SELECT catalog_id, phone_number_id, waba_id, configuracion FROM public.canal WHERE empresa_id = $1 AND tipo = 'whatsapp' LIMIT 1;`,
          [empresaId],
        );
        const catalogId = canalRows[0]?.catalog_id;
        const phoneId = canalRows[0]?.phone_number_id || canalRows[0]?.configuracion?.phone_number_id || process.env.META_PHONE_NUMBER_ID;
        const wabaId = canalRows[0]?.waba_id || canalRows[0]?.configuracion?.waba_id || process.env.META_WABA_ID;

        // Acelerar activación de WhatsApp Commerce inmediatamente al inicio
        if (phoneId && catalogId) {
          this.activarComercioWhatsApp(phoneId, catalogId, metaToken, apiVersion, wabaId);
        }

        if (!catalogId) {
          await this.sincronizarConMetaCatalog(productoId, empresaId);
        } else {
          // Consultar productos del catálogo en Meta
          const metaProductsRes = await fetch(
            `https://graph.facebook.com/${apiVersion}/${catalogId}/products?fields=id,retailer_id,name,description,price,sale_price,image_url,availability,inventory,brand,category,product_type,color,size,item_group_id`,
            { headers: { Authorization: `Bearer ${metaToken}` } },
          );
          const metaProductsData: any = await metaProductsRes.json();
          const metaItems: any[] = metaProductsData?.data || [];
          const metaByRetailer = new Map<string, any>();
          for (const item of metaItems) {
            if (item.retailer_id) metaByRetailer.set(item.retailer_id, item);
          }

          // Consultar imágenes del producto para asignación contextual a variantes
          const prodImages = await this.dataSource.query(
            `SELECT id_producto_imagen AS id, url, nombre, principal, orden
             FROM public.producto_imagen
             WHERE producto_id = $1 AND estado = 'activo'
             ORDER BY principal DESC, orden ASC, id_producto_imagen ASC;`,
            [productoId],
          );

          const varRows = await this.dataSource.query(
            `SELECT
               pv.id_producto_variante,
               pv.sku,
               pv.codigo_barras,
               pv.referencia,
               pv.precio,
               pv.estado,
               COALESCE(
                 JSON_AGG(
                   JSON_BUILD_OBJECT(
                     'attr_nombre', a.nombre,
                     'comp_nombre', ac.nombre
                   )
                 ) FILTER (WHERE a.id_atributo IS NOT NULL),
                 '[]'::json
               ) AS componentes
             FROM public.producto_variante pv
             LEFT JOIN public.variante_componente vc ON vc.producto_variante_id = pv.id_producto_variante
             LEFT JOIN public.atributo_componente ac ON ac.id_atributo_componente = vc.atributo_componente_id
             LEFT JOIN public.atributo a ON a.id_atributo = ac.atributo_id
             WHERE pv.producto_id = $1 AND pv.estado = 'activo'
             GROUP BY pv.id_producto_variante, pv.sku, pv.codigo_barras, pv.referencia, pv.precio, pv.estado
             ORDER BY pv.id_producto_variante ASC;`,
            [productoId],
          );

          const itemGroupId = newProd.codigo_interno || `PROD-${newProd.id_producto}`;
          const taxonomyBreadcrumb = [newProd.categoria_nombre, newProd.subcategoria_nombre].filter(Boolean).join(' > ') || 'General';
          const newPrecioFinal = Number(newProd.precio_impuesto || newProd.precio_base) || 0;
          const newPriceInCents = Math.round(newPrecioFinal * 100);

          if (varRows && varRows.length > 0) {
            const currentRetailerIds = new Set(varRows.map((v: any) => (v.sku || v.referencia || '').trim()).filter(Boolean));

            for (const v of varRows) {
              const vRetailerId = (v.sku || v.referencia || `${itemGroupId}-VAR-${v.id_producto_variante}`).trim();
              const existingMetaItem = metaByRetailer.get(vRetailerId);

              const vPrecio = Number(v.precio || newPrecioFinal);
              const vPriceInCents = Math.round(vPrecio * 100);

              let vColor: string | undefined = undefined;
              let vSize: string | undefined = undefined;
              const comps: any[] = Array.isArray(v.componentes) ? v.componentes : [];
              const vSpecsDetails: string[] = [];
              for (const c of comps) {
                const attrName = (c.attr_nombre || '').toLowerCase();
                const compVal = (c.comp_nombre || '').trim();
                if (attrName.includes('color')) {
                  vColor = compVal;
                  vSpecsDetails.push(`🎨 Color: ${compVal}`);
                } else if (attrName.includes('talla') || attrName.includes('tamaño') || attrName.includes('tamano')) {
                  vSize = compVal;
                  vSpecsDetails.push(`📏 Talla: ${compVal}`);
                } else {
                  const icon = attrName.includes('volt') || attrName.includes('energ') ? '⚡' : '⚙️';
                  vSpecsDetails.push(`${icon} ${c.attr_nombre}: ${compVal}`);
                }
              }

              let vImageUrl = newProd.imagen_url;
              if (prodImages && prodImages.length > 0) {
                const vMatch = prodImages.find((img: any) => {
                  const str = `${img.nombre || ''} ${img.url || ''}`.toLowerCase();
                  if (vColor && str.includes(vColor.toLowerCase())) return true;
                  if (vColor?.toLowerCase().includes('amarillo') && (str.includes('amarillo') || str.includes('yellow') || str.includes('ama'))) return true;
                  if (vColor?.toLowerCase().includes('negro') && (str.includes('negro') || str.includes('black') || str.includes('neg'))) return true;
                  if (vColor?.toLowerCase().includes('blanco') && (str.includes('blanco') || str.includes('white') || str.includes('bla'))) return true;
                  if (vColor?.toLowerCase().includes('azul') && (str.includes('azul') || str.includes('blue') || str.includes('azu'))) return true;
                  return false;
                });
                if (vMatch?.url) {
                  vImageUrl = vMatch.url;
                }
              }

              if (existingMetaItem) {
                const diff: Record<string, any> = {};

                // Solo si el nombre cambió
                if (newProd.nombre && newProd.nombre !== oldProd.nombre) {
                  diff.title = newProd.nombre.substring(0, 100);
                  diff.name = newProd.nombre.substring(0, 100);
                }

                // Descripción estructurada con jerarquía visual de WhatsApp
                const descBase = (newProd.descripcion_corta || newProd.descripcion_larga || newProd.nombre || '').trim();
                const vBreadcrumbs: string[] = [];
                if (newProd.categoria_nombre) vBreadcrumbs.push(`📁 Categoría: ${newProd.categoria_nombre}`);
                if (newProd.subcategoria_nombre) vBreadcrumbs.push(`📂 Subcategoría: ${newProd.subcategoria_nombre}`);
                if (vRetailerId) vBreadcrumbs.push(`🔖 Referencia: ${vRetailerId}`);
                if (newProd.marca_nombre) vBreadcrumbs.push(`🏷️ Marca: ${newProd.marca_nombre}`);
                if (vSpecsDetails.length > 0) vBreadcrumbs.push(...vSpecsDetails);

                const expectedDesc = [
                  descBase,
                  vBreadcrumbs.join('\n'),
                  newProd.ficha_tecnica ? `📋 Ficha Técnica:\n${newProd.ficha_tecnica}` : '',
                ].filter(Boolean).join('\n\n').substring(0, 5000);

                if (
                  newProd.descripcion_corta !== oldProd.descripcion_corta ||
                  newProd.descripcion_larga !== oldProd.descripcion_larga ||
                  newProd.ficha_tecnica !== oldProd.ficha_tecnica ||
                  existingMetaItem.description !== expectedDesc
                ) {
                  diff.description = expectedDesc;
                }

                // Solo si el precio cambió
                const rawMetaDigits = String(existingMetaItem.price || '').replace(/[^0-9]/g, '');
                const metaPriceNum = rawMetaDigits ? Number(rawMetaDigits) : 0;
                const isVarPriceChanged = metaPriceNum > 0
                  ? (metaPriceNum !== Math.round(vPrecio) && metaPriceNum !== vPriceInCents)
                  : true;
                if (isVarPriceChanged) {
                  diff.price = vPriceInCents;
                  diff.sale_price = vPriceInCents;
                }

                // Solo si la marca cambió
                if (newProd.marca_nombre && newProd.marca_nombre !== oldProd.marca_nombre) {
                  diff.brand = newProd.marca_nombre;
                }

                // Categoría y subcategoría
                if (
                  newProd.categoria_nombre !== oldProd.categoria_nombre ||
                  newProd.subcategoria_nombre !== oldProd.subcategoria_nombre
                ) {
                  diff.category = newProd.subcategoria_nombre || newProd.categoria_nombre || 'General';
                  diff.product_type = taxonomyBreadcrumb;
                  diff.custom_label_0 = newProd.categoria_nombre.substring(0, 100);
                  diff.custom_label_1 = newProd.subcategoria_nombre.substring(0, 100);
                }

                // Imagen de variante
                if (vImageUrl && vImageUrl !== existingMetaItem.image_url) {
                  diff.image_url = vImageUrl;
                }

                // Color o talla
                if (vColor && vColor !== existingMetaItem.color) diff.color = vColor;
                if (vSize && vSize !== existingMetaItem.size) diff.size = vSize;

                // Asegurar disponibilidad y visibilidad inmediata en WhatsApp
                diff.visibility = 'published';
                diff.availability = 'in stock';

                if (Object.keys(diff).length > 0) {
                  this.logger.log(`[MetaCatalog] Actualizando en Meta variante "${vRetailerId}" (Campos modificados: ${Object.keys(diff).join(', ')})`);
                  await fetch(`https://graph.facebook.com/${apiVersion}/${existingMetaItem.id}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(diff),
                  });
                  metaModificaciones[vRetailerId] = Object.keys(diff);
                } else {
                  this.logger.log(`[MetaCatalog] Sin cambios para variante "${vRetailerId}" en Meta. Omitiendo llamada.`);
                }
              } else {
                await this.sincronizarConMetaCatalog(productoId, empresaId);
                metaModificaciones[vRetailerId] = ['creada_en_meta'];
                break;
              }
            }

            for (const item of metaItems) {
              if (item.item_group_id === itemGroupId && item.retailer_id && !currentRetailerIds.has(item.retailer_id)) {
                this.logger.log(`[MetaCatalog] Retirando variante obsoleta de Meta: ${item.retailer_id} (ID: ${item.id})`);
                await fetch(`https://graph.facebook.com/${apiVersion}/${item.id}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${metaToken}` },
                });
                metaModificaciones[item.retailer_id] = ['eliminada_de_meta'];
              }
            }
          } else {
            const retailerId = (newProd.referencia_principal || newProd.codigo_interno || `PROD-${newProd.id_producto}`).trim();
            const existingMetaItem = metaByRetailer.get(retailerId) || metaItems.find(it => it.id === newProd.fb_product_id);

            if (existingMetaItem) {
              const diff: Record<string, any> = {};
              if (newProd.nombre && newProd.nombre !== oldProd.nombre) {
                diff.title = newProd.nombre.substring(0, 100);
                diff.name = newProd.nombre.substring(0, 100);
              }
              const descBase = (newProd.descripcion_corta || newProd.descripcion_larga || newProd.nombre || '').trim();
              const simpleBreadcrumbs: string[] = [];
              if (newProd.categoria_nombre) simpleBreadcrumbs.push(`📁 Categoría: ${newProd.categoria_nombre}`);
              if (newProd.subcategoria_nombre) simpleBreadcrumbs.push(`📂 Subcategoría: ${newProd.subcategoria_nombre}`);
              if (retailerId) simpleBreadcrumbs.push(`🔖 Referencia: ${retailerId}`);
              if (newProd.marca_nombre) simpleBreadcrumbs.push(`🏷️ Marca: ${newProd.marca_nombre}`);

              const expectedSimpleDesc = [
                descBase,
                simpleBreadcrumbs.join('\n'),
                newProd.ficha_tecnica ? `📋 Ficha Técnica:\n${newProd.ficha_tecnica}` : '',
              ].filter(Boolean).join('\n\n').substring(0, 5000);

              if (
                newProd.descripcion_corta !== oldProd.descripcion_corta ||
                newProd.descripcion_larga !== oldProd.descripcion_larga ||
                newProd.ficha_tecnica !== oldProd.ficha_tecnica ||
                existingMetaItem.description !== expectedSimpleDesc
              ) {
                diff.description = expectedSimpleDesc;
              }
              const rawSimpleDigits = String(existingMetaItem.price || '').replace(/[^0-9]/g, '');
              const metaSimplePriceNum = rawSimpleDigits ? Number(rawSimpleDigits) : 0;
              const isSimplePriceChanged = metaSimplePriceNum > 0
                ? (metaSimplePriceNum !== Math.round(newPrecioFinal) && metaSimplePriceNum !== newPriceInCents)
                : true;
              if (isSimplePriceChanged) {
                diff.price = newPriceInCents;
                diff.sale_price = newPriceInCents;
              }
              if (newProd.marca_nombre && newProd.marca_nombre !== oldProd.marca_nombre) {
                diff.brand = newProd.marca_nombre;
              }
              if (
                newProd.categoria_nombre !== oldProd.categoria_nombre ||
                newProd.subcategoria_nombre !== oldProd.subcategoria_nombre
              ) {
                diff.category = newProd.subcategoria_nombre || newProd.categoria_nombre || 'General';
                diff.product_type = taxonomyBreadcrumb;
                diff.custom_label_0 = newProd.categoria_nombre.substring(0, 100);
                diff.custom_label_1 = newProd.subcategoria_nombre.substring(0, 100);
              }
              if (newProd.imagen_url && newProd.imagen_url !== oldProd.imagen_url) {
                diff.image_url = newProd.imagen_url;
              }

              diff.visibility = 'published';
              diff.availability = 'in stock';

              if (Object.keys(diff).length > 0) {
                this.logger.log(`[MetaCatalog] Actualizando producto simple ${productoId} en Meta (Campos: ${Object.keys(diff).join(', ')})`);
                await fetch(`https://graph.facebook.com/${apiVersion}/${existingMetaItem.id}`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify(diff),
                });
                metaModificaciones['producto_simple'] = Object.keys(diff);
              } else {
                this.logger.log(`[MetaCatalog] Producto simple sin cambios para Meta. Omitiendo llamada.`);
              }
            } else {
              await this.sincronizarConMetaCatalog(productoId, empresaId);
              metaModificaciones['producto_simple'] = ['creado_en_meta'];
            }
          }

          // Asegurar colecciones jerárquicas y reactivar comercio WhatsApp
          await this.asegurarProductSets(catalogId, newProd.categoria_nombre, newProd.subcategoria_nombre, metaToken, apiVersion);
          if (phoneId) {
            await this.activarComercioWhatsApp(phoneId, catalogId, metaToken, apiVersion, wabaId);
          }

          await this.dataSource.query(
            `UPDATE public.producto
             SET meta_sync_status = 'sincronizado',
                 meta_sync_error = NULL,
                 meta_synced_at = NOW()
             WHERE id_producto = $1;`,
            [productoId],
          );
        }
      } catch (metaErr: any) {
        this.logger.error(`[MetaCatalog] Error al actualizar en Meta: ${metaErr.message}`, metaErr.stack);
        await this.dataSource.query(
          `UPDATE public.producto
           SET meta_sync_status = 'error',
               meta_sync_error = $1
           WHERE id_producto = $2;`,
          [`Error actualizando en Meta: ${metaErr.message}`, productoId],
        );
      }
    }

    const updatedProd = await this.getProductoPorId(productoId, empresaId);
    return {
      success: true,
      producto: updatedProd,
      meta_diff_actualizados: metaModificaciones,
    };
  }

  /**
   * Elimina un producto de la base de datos y del catálogo de WhatsApp / Meta.
   */
  async eliminarProducto(productoId: number, empresaId = 1) {
    const prodRows = await this.dataSource.query(
      `SELECT id_producto, codigo_interno, nombre, fb_product_id
       FROM public.producto
       WHERE id_producto = $1 AND empresa_id = $2
       LIMIT 1;`,
      [productoId, empresaId],
    );

    const prod = prodRows[0];
    if (!prod) {
      throw new NotFoundException(`El producto con ID ${productoId} no fue encontrado`);
    }

    const metaToken =
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    let deletedFromMeta = false;

    // 1. Eliminar de Meta / WhatsApp Commerce Catalog si existe fb_product_id
    if (metaToken && prod.fb_product_id) {
      try {
        this.logger.log(`[MetaCatalog] Eliminando producto ${productoId} (FB ID: ${prod.fb_product_id}) de Meta WhatsApp...`);
        const delRes = await fetch(`https://graph.facebook.com/${apiVersion}/${prod.fb_product_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${metaToken}`,
          },
        });
        const delData: any = await delRes.json();
        if (delRes.ok && (delData.success || !delData.error)) {
          deletedFromMeta = true;
          this.logger.log(`✓ [MetaCatalog] Producto ${productoId} eliminado exitosamente de Meta WhatsApp`);
        } else {
          this.logger.warn(`[MetaCatalog] Advertencia al eliminar de Meta: ${JSON.stringify(delData)}`);
        }
      } catch (metaErr: any) {
        this.logger.error(`[MetaCatalog] Error comunicando con Meta para eliminar producto: ${metaErr.message}`);
      }
    }

    // 2. Si la empresa tiene catálogo, eliminar también todas las variantes y productos asociados de Meta
    if (metaToken) {
      try {
        const canalRows = await this.dataSource.query(
          `SELECT catalog_id FROM public.canal WHERE empresa_id = $1 AND tipo = 'whatsapp' LIMIT 1;`,
          [empresaId],
        );
        const catalogId = canalRows[0]?.catalog_id;
        const retailerId = prod.codigo_interno || `PROD-${prod.id_producto}`;
        if (catalogId) {
          const varRows = await this.dataSource.query(
            `SELECT sku, referencia FROM public.producto_variante WHERE producto_id = $1;`,
            [productoId],
          );
          const retailerIdsToDelete = new Set<string>();
          if (retailerId) retailerIdsToDelete.add(retailerId);
          for (const v of varRows) {
            const vRetId = (v.sku || v.referencia || '').trim();
            if (vRetId) retailerIdsToDelete.add(vRetId);
          }

          // Consultar productos del catálogo de Meta para obtener los FB IDs exactos y eliminarlos
          const metaItemsRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?fields=id,retailer_id,item_group_id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          });
          const metaItemsData: any = await metaItemsRes.json();
          const metaItems = metaItemsData?.data || [];
          for (const item of metaItems) {
            if (retailerIdsToDelete.has(item.retailer_id) || item.item_group_id === retailerId || item.id === prod.fb_product_id) {
              await fetch(`https://graph.facebook.com/${apiVersion}/${item.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${metaToken}` },
              });
              this.logger.log(`✓ [MetaCatalog] Item ${item.id} (${item.retailer_id}) eliminado de Meta`);
            }
          }
        }
      } catch (errVar: any) {
        this.logger.warn(`[MetaCatalog] Advertencia eliminando variantes de Meta: ${errVar.message}`);
      }
    }

    // 3. Eliminación o inactivación en PostgreSQL
    const orderRows = await this.dataSource.query(
      `SELECT count(*)::int AS count FROM public.pedido_detalle WHERE producto_id = $1;`,
      [productoId],
    );

    if (orderRows[0]?.count > 0) {
      // Tiene pedidos asociados (preservar trazabilidad con estado inactivo)
      await this.dataSource.query(
        `UPDATE public.producto
         SET estado_producto = 'inactivo',
             estado_publicacion = 'no_publicado',
             fb_product_id = NULL,
             meta_sync_status = 'eliminado',
             meta_sync_error = NULL,
             meta_synced_at = NOW(),
             updated_at = NOW()
         WHERE id_producto = $1 AND empresa_id = $2;`,
        [productoId, empresaId],
      );
      this.logger.log(`✓ Producto ${productoId} inactivado y retirado de WhatsApp (posee pedidos asociados)`);
    } else {
      // Eliminación física completa en cascada de todas las tablas hijas
      await this.dataSource.query(`DELETE FROM public.variante_componente WHERE producto_variante_id IN (SELECT id_producto_variante FROM public.producto_variante WHERE producto_id = $1);`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_variante WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_atributo_componente WHERE producto_atributo_id IN (SELECT id_producto_atributo FROM public.producto_atributo WHERE producto_id = $1);`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_atributo WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_imagen WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_impuesto_compra WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_impuesto_venta WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_lista_precio WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_retencion WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_proveedor WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_seo_ia WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_codigo_barras WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.carrito_detalle WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.inventario WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.precio WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto_referencia WHERE producto_id = $1;`, [productoId]);
      await this.dataSource.query(`DELETE FROM public.producto WHERE id_producto = $1 AND empresa_id = $2;`, [productoId, empresaId]);
      this.logger.log(`✓ Producto ${productoId} y sus dependencias eliminados completamente de PostgreSQL y de WhatsApp`);
    }

    return {
      success: true,
      message: 'Producto eliminado correctamente de la base de datos y del catálogo de WhatsApp',
      id: productoId,
      deleted_from_meta: deletedFromMeta,
    };
  }

  /**
   * Elimina TODOS los productos de la empresa tanto en PostgreSQL como en el catálogo de Meta WhatsApp.
   */
  async eliminarTodosLosProductos(empresaId = 1): Promise<{ ok: boolean; eliminados: number; meta_eliminados: number; message: string }> {
    this.logger.log(`[EliminarTodos] Iniciando vaciado total de productos para empresa ${empresaId}...`);

    let metaEliminados = 0;
    try {
      const metaToken =
        process.env.META_PERMANENT_TOKEN ||
        process.env.META_SYSTEM_TOKEN ||
        process.env.META_ACCESS_TOKEN;
      const apiVersion = process.env.META_API_VERSION || 'v21.0';

      const canalRows = await this.dataSource.query(
        `SELECT catalog_id FROM public.canal WHERE empresa_id = $1 AND tipo = 'whatsapp' LIMIT 1;`,
        [empresaId],
      );
      const catalogId = canalRows[0]?.catalog_id || process.env.META_CATALOG_ID || '912267985057130';

      // 1. Eliminar todos los productos y grupos del catálogo de Meta WhatsApp
      if (metaToken && catalogId) {
        this.logger.log(`[EliminarTodos] Consultando productos y grupos en catálogo Meta ${catalogId}...`);
        const [metaProdsRes, metaGroupsRes] = await Promise.all([
          fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?limit=1000&fields=id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          }),
          fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_groups?limit=1000&fields=id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          }),
        ]);

        const metaProdsData: any = await metaProdsRes.json();
        const metaGroupsData: any = await metaGroupsRes.json();
        const items: any[] = metaProdsData?.data || [];
        const groups: any[] = metaGroupsData?.data || [];

        this.logger.log(`[EliminarTodos] Eliminando ${items.length} productos y ${groups.length} grupos de Meta WhatsApp...`);

        // Eliminar productos en bloques concurrentes de 10
        const chunkSize = 10;
        for (let i = 0; i < items.length; i += chunkSize) {
          const chunk = items.slice(i, i + chunkSize);
          await Promise.all(
            chunk.map(it =>
              fetch(`https://graph.facebook.com/${apiVersion}/${it.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${metaToken}` },
              }).catch(() => null)
            )
          );
          metaEliminados += chunk.length;
        }

        // Eliminar grupos de variantes
        for (let i = 0; i < groups.length; i += chunkSize) {
          const chunk = groups.slice(i, i + chunkSize);
          await Promise.all(
            chunk.map(g =>
              fetch(`https://graph.facebook.com/${apiVersion}/${g.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${metaToken}` },
              }).catch(() => null)
            )
          );
        }

        // Refrescar caché de WhatsApp Commerce (vitrina oculta, carrito activo para mensajes interactivos)
        const phoneId = process.env.META_PHONE_NUMBER_ID || '1305340429332213';
        await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/whatsapp_commerce_settings`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_catalog_visible: false, is_cart_enabled: true }),
        }).catch(() => null);

        this.logger.log(`✓ [EliminarTodos] Catálogo de Meta vaciado exitosamente (${metaEliminados} items eliminados)`);
      }
    } catch (metaErr: any) {
      this.logger.error(`[EliminarTodos] Error vaciando catálogo en Meta: ${metaErr.message}`);
    }

    // 2. Eliminar en PostgreSQL: todas las tablas hijas y productos de la empresa
    await this.dataSource.query(`DELETE FROM public.variante_componente WHERE producto_variante_id IN (SELECT id_producto_variante FROM public.producto_variante WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1));`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_variante WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_atributo_componente WHERE producto_atributo_id IN (SELECT id_producto_atributo FROM public.producto_atributo WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1));`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_atributo WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_imagen WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_impuesto_compra WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_impuesto_venta WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_lista_precio WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_retencion WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_proveedor WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_seo_ia WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_codigo_barras WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.carrito_detalle WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.inventario WHERE empresa_id = $1;`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.precio WHERE empresa_id = $1;`, [empresaId]).catch(() => null);
    await this.dataSource.query(`DELETE FROM public.producto_referencia WHERE producto_id IN (SELECT id_producto FROM public.producto WHERE empresa_id = $1);`, [empresaId]).catch(() => null);

    const deleteRes = await this.dataSource.query(`DELETE FROM public.producto WHERE empresa_id = $1 RETURNING id_producto;`, [empresaId]);
    const totalEliminados = deleteRes.length;

    this.logger.log(`✓ [EliminarTodos] ${totalEliminados} productos eliminados de PostgreSQL`);

    return {
      ok: true,
      eliminados: totalEliminados,
      meta_eliminados: metaEliminados,
      message: `Se eliminaron ${totalEliminados} productos de la base de datos y ${metaEliminados} del catálogo de WhatsApp.`,
    };
  }

  /**
   * ============================================================================
   * SINCRONIZACIÓN AUTOMÁTICA CON META COMMERCE CATALOG (Facebook / WhatsApp)
   * ============================================================================
   * 1. Consulta si la empresa tiene canal y catalog_id asignado en PostgreSQL.
   * 2. Si no tiene catálogo, lo crea automáticamente en Meta por API con el
   *    Token Permanente y lo vincula al WhatsApp Commerce del número telefónico.
   * 3. Sube el producto con sus campos exactos requeridos por Meta Commerce API:
   *    categoría, subcategoría (product_type/custom labels) y referencia principal (retailer_id).
   * 4. Registra trazabilidad completa en public.producto (fb_product_id, estado, errores).
   */
  async sincronizarConMetaCatalog(
    productoId: number,
    empresaId = 1,
    cachedContext?: {
      metaToken?: string;
      businessId?: string;
      apiVersion?: string;
      catalogId?: string;
      wabaId?: string;
      phoneId?: string;
      existingByRetailer?: Map<string, string>;
      existingGroupByRetailer?: Map<string, string>;
      skipPostOperations?: boolean;
    },
  ) {
    const metaToken =
      cachedContext?.metaToken ||
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const businessId = cachedContext?.businessId || process.env.META_BUSINESS_ID;
    const apiVersion = cachedContext?.apiVersion || process.env.META_API_VERSION || 'v21.0';

    if (!metaToken || !businessId) {
      await this.dataSource.query(
        `UPDATE public.producto
         SET meta_sync_status = 'pendiente',
             meta_sync_error = 'Meta Cloud API no configurada: defina META_BUSINESS_ID y META_PERMANENT_TOKEN en .env'
         WHERE id_producto = $1;`,
        [productoId],
      );
      this.logger.warn(`[MetaCatalog] META_BUSINESS_ID o META_PERMANENT_TOKEN no configurados en .env`);
      return { success: false, reason: 'unconfigured_env' };
    }

    try {
      let catalogId = cachedContext?.catalogId;
      let wabaId = cachedContext?.wabaId;
      let phoneId = cachedContext?.phoneId;

      if (!catalogId) {
        // 1. Obtener o crear el canal para esta empresa
        const canalRows = await this.dataSource.query(
          `SELECT id_canal, phone_number, phone_number_id, waba_id, catalog_id, configuracion
           FROM public.canal
           WHERE empresa_id = $1 AND tipo = 'whatsapp'
           ORDER BY id_canal ASC
           LIMIT 1;`,
          [empresaId],
        );

        let canal = canalRows[0];
        if (!canal) {
          // Auto-crear el canal por defecto para la empresa si aún no existe
          const empRows = await this.dataSource.query(
            `SELECT nombre_comercial, whatsapp FROM public.empresa WHERE id_empresa = $1 LIMIT 1;`,
            [empresaId],
          );
          const emp = empRows[0];
          const newCanal = await this.dataSource.query(
            `INSERT INTO public.canal (empresa_id, tipo, proveedor, phone_number, estado, configuracion)
             VALUES ($1, 'whatsapp', 'meta', $2, 'activo', '{}')
             RETURNING id_canal, phone_number, phone_number_id, waba_id, catalog_id, configuracion;`,
            [empresaId, emp?.whatsapp || null],
          );
          canal = newCanal[0];
        }

        catalogId = canal.catalog_id;

        // 2. Si la empresa aún no tiene catálogo en Meta, crearlo automáticamente por API
        if (!catalogId) {
          const empRows = await this.dataSource.query(
            `SELECT nombre_comercial FROM public.empresa WHERE id_empresa = $1 LIMIT 1;`,
            [empresaId],
          );
          const catalogName = `Catálogo - ${empRows[0]?.nombre_comercial || `Empresa ${empresaId}`}`;

          this.logger.log(`[MetaCatalog] Creando catálogo en Meta para empresa ${empresaId}: "${catalogName}"...`);
          const catRes = await fetch(`https://graph.facebook.com/${apiVersion}/${businessId}/owned_product_catalogs`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${metaToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: catalogName }),
          });

          const catData: any = await catRes.json();
          if (!catRes.ok || !catData.id) {
            const errMsg = catData.error?.message || JSON.stringify(catData);
            this.logger.error(`[MetaCatalog] Error al crear catálogo en Meta: ${errMsg}`);
            await this.dataSource.query(
              `UPDATE public.producto
               SET meta_sync_status = 'error',
                   meta_sync_error = $1
               WHERE id_producto = $2;`,
              [`Error al crear catálogo en Meta: ${errMsg}`, productoId],
            );
            return { success: false, error: errMsg };
          }

          catalogId = catData.id;
          this.logger.log(`✓ [MetaCatalog] Catálogo creado en Meta exitosamente con ID: ${catalogId}`);

          await this.dataSource.query(
            `UPDATE public.canal SET catalog_id = $1, updated_at = NOW() WHERE id_canal = $2;`,
            [catalogId, canal.id_canal],
          );
        }

        // Asegurar vinculación del Catálogo con WABA y WhatsApp Commerce
        wabaId = canal.waba_id || canal.configuracion?.waba_id || process.env.META_WABA_ID;
        phoneId = canal.phone_number_id || canal.configuracion?.phone_number_id || process.env.META_PHONE_NUMBER_ID;

        if (!wabaId && businessId) {
          try {
            const wabaRes = await fetch(`https://graph.facebook.com/${apiVersion}/${businessId}/owned_whatsapp_business_accounts`, {
              headers: { Authorization: `Bearer ${metaToken}` },
            });
            const wabaData: any = await wabaRes.json();
            if (wabaData?.data && wabaData.data.length > 0) {
              wabaId = wabaData.data[0].id;
              await this.dataSource.query(
                `UPDATE public.canal SET waba_id = $1, updated_at = NOW() WHERE id_canal = $2;`,
                [wabaId, canal.id_canal],
              );
              this.logger.log(`✓ [MetaCatalog] WABA detectada y asignada automáticamente: ${wabaId}`);
            }
          } catch (wabaErr: any) {
            this.logger.warn(`[MetaCatalog] No se pudo auto-detectar WABA: ${wabaErr.message}`);
          }
        }

        // Acelerar activación de WhatsApp Commerce inmediatamente al inicio
        if (phoneId && catalogId && !cachedContext?.skipPostOperations) {
          this.activarComercioWhatsApp(phoneId, catalogId, metaToken, apiVersion, wabaId);
        }
      }

      // 1. Consultar datos completos del producto incluyendo categoría, subcategoría y referencias
      const prodRows = await this.dataSource.query(
        `SELECT
           p.id_producto,
           p.codigo_interno,
           p.nombre,
           p.descripcion_corta,
           p.descripcion_larga,
           p.ficha_tecnica,
           p.costo_base,
           p.costo_impuesto,
           p.precio_base,
           p.precio_impuesto,
           p.fb_product_id,
           COALESCE(m.nombre, '') AS marca_nombre,
           COALESCE(c.nombre, '') AS categoria_nombre,
           COALESCE(sc.nombre, '') AS subcategoria_nombre,
           (
             SELECT pr.referencia
             FROM public.producto_referencia pr
             WHERE pr.producto_id = p.id_producto AND pr.estado = 'activo'
             ORDER BY pr.id_producto_referencia ASC
             LIMIT 1
           ) AS referencia_principal,
           GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible,
           img.url AS imagen_url
         FROM public.producto p
         LEFT JOIN public.marca m ON m.id_marca = p.marca_id
         LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
         LEFT JOIN public.subcategoria sc ON sc.id_subcategoria = p.subcategoria_id
         LEFT JOIN (
           SELECT DISTINCT ON (producto_id) producto_id, url
           FROM public.producto_imagen
           WHERE estado = 'activo'
           ORDER BY producto_id, principal DESC, orden ASC, id_producto_imagen ASC
         ) img ON img.producto_id = p.id_producto
         LEFT JOIN (
           SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
           FROM public.inventario
           WHERE empresa_id = $1
           GROUP BY producto_id
         ) inv ON inv.producto_id = p.id_producto
         WHERE p.id_producto = $2 AND p.empresa_id = $1
         LIMIT 1;`,
        [empresaId, productoId],
      );

      const prod = prodRows[0];
      if (!prod) {
        throw new Error(`Producto ${productoId} no encontrado en empresa ${empresaId}`);
      }

      // 4. Consultar atributos y componentes configurados en el producto (Color, Voltaje, Talla, etc.)
      const attrRows = await this.dataSource.query(
        `SELECT
           a.id_atributo,
           TRIM(a.nombre) AS attr_nombre,
           LOWER(TRIM(a.codigo)) AS attr_codigo,
           ac.id_atributo_componente,
           TRIM(ac.nombre) AS comp_nombre,
           TRIM(ac.codigo) AS comp_codigo
         FROM public.producto_atributo pa
         JOIN public.atributo a ON a.id_atributo = pa.atributo_id
         JOIN public.producto_atributo_componente pac ON pac.producto_atributo_id = pa.id_producto_atributo
         JOIN public.atributo_componente ac ON ac.id_atributo_componente = pac.atributo_componente_id
         WHERE pa.producto_id = $1 AND pa.estado = 'activo' AND pac.estado = 'activo'
         ORDER BY pa.orden, pac.orden;`,
        [productoId],
      );

      // Agrupar componentes por nombre de atributo
      const attrsMap = new Map<string, { id: number; nombre: string; codigo: string; opciones: Set<string> }>();
      for (const row of attrRows) {
        const key = row.attr_nombre.toLowerCase().trim();
        if (!attrsMap.has(key)) {
          attrsMap.set(key, {
            id: row.id_atributo,
            nombre: row.attr_nombre,
            codigo: row.attr_codigo || '',
            opciones: new Set<string>(),
          });
        }
        if (row.comp_nombre) {
          attrsMap.get(key)!.opciones.add(row.comp_nombre.trim());
        }
      }

      // 5. Consultar variantes registradas en PostgreSQL con sus componentes exactos vía JSON_AGG
      const varRows = await this.dataSource.query(
        `SELECT
           pv.id_producto_variante,
           pv.sku,
           pv.codigo_barras,
           pv.referencia,
           pv.precio,
           pv.estado,
           COALESCE(
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'attr_id', a.id_atributo,
                 'attr_nombre', a.nombre,
                 'attr_codigo', a.codigo,
                 'comp_id', ac.id_atributo_componente,
                 'comp_nombre', ac.nombre
               )
             ) FILTER (WHERE a.id_atributo IS NOT NULL),
             '[]'::json
           ) AS componentes
         FROM public.producto_variante pv
         LEFT JOIN public.variante_componente vc ON vc.producto_variante_id = pv.id_producto_variante
         LEFT JOIN public.atributo_componente ac ON ac.id_atributo_componente = vc.atributo_componente_id
         LEFT JOIN public.atributo a ON a.id_atributo = ac.atributo_id
         WHERE pv.producto_id = $1 AND pv.estado = 'activo'
         GROUP BY pv.id_producto_variante, pv.sku, pv.codigo_barras, pv.referencia, pv.precio, pv.estado
         ORDER BY pv.id_producto_variante ASC;`,
        [productoId],
      );

      // 6. Construir identificadores y taxonomía
      const refPrincipal = (prod.referencia_principal || prod.codigo_interno || '').trim();
      const retailerId = refPrincipal || `PROD-${prod.id_producto}`;
      const itemGroupId = prod.codigo_interno || `PROD-${prod.id_producto}`;

      const catNombre = (prod.categoria_nombre || '').trim();
      const subcatNombre = (prod.subcategoria_nombre || '').trim();
      const taxonomyBreadcrumb = [catNombre, subcatNombre].filter(Boolean).join(' > ') || 'General';

      // PRECIOS: En Meta WhatsApp Catalog 'price' debe ser estrictamente el Precio Final de Venta
      const precioFinalDeVenta = Number(prod.precio_impuesto || prod.precio_base) || 0;
      const priceInCents = Math.round(precioFinalDeVenta * 100);

      // IMAGEN: Resolver a URL pública permanente accesible por el crawler de Meta
      const rawImageUrl = prod.imagen_url;
      const imageUrl = await this.resolverUrlPublicaImagen(rawImageUrl);
      if (imageUrl && imageUrl !== rawImageUrl && rawImageUrl && !rawImageUrl.startsWith('http')) {
        await this.dataSource.query(
          `UPDATE public.producto_imagen SET url = $1 WHERE producto_id = $2 AND url = $3;`,
          [imageUrl, productoId, rawImageUrl],
        );
      }

      // Sanitización profunda para el robot y políticas de comercio de Meta (WhatsApp)
      const sanitizeMetaText = (txt: string, isTitle: boolean = false): string => {
        if (!txt) return '';
        let clean = txt
          // 1. Eliminar URLs, dominios y enlaces de WhatsApp
          .replace(/https?:\/\/\S+/gi, '')
          .replace(/\b(www\.[a-z0-9.-]+\.[a-z]{2,})/gi, '')
          .replace(/wa\.me\/\S+/gi, '')
          // 2. Eliminar números de teléfono y correos que activan filtros de contacto en catálogo
          .replace(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g, '')
          // 3. Neutralizar términos de alto riesgo comercial (falsificaciones y marcas)
          .replace(/\b(r[eé]plica|copia\s+exacta|imitaci[oó]n|clon|falsificaci[oó]n)\b/gi, 'Compatible con')
          // 4. Neutralizar términos químicos / tóxicos en ferretería para evitar falsos positivos
          .replace(/\b[aá]cido\s+muri[aá]tico\b/gi, 'Limpiador Desincrustante')
          .replace(/\bveneno(\s+para\s+ratas)?\b/gi, 'Cebo de Control')
          .replace(/\bpesticida|plaguicida\b/gi, 'Protector de Cultivo')
          .replace(/\bp[oó]lvora\b/gi, 'Material Propulsor')
          .replace(/\bfulminante\b/gi, 'Dispositivo de Fijación')
          .replace(/\b(droga|estupefaciente|narc[oó]tico|marihuana|cannabis|cigarrillo|vapeador|vape)\b/gi, '')
          // 5. Limpieza de espaciado y puntuación repetitiva
          .replace(/[!¡?¿$]{2,}/g, '!')
          .replace(/[ \t]+/g, ' ')
          .trim();

        // 6. Si es título y está en MAYÚSCULAS sostenidas, convertir a formato estándar Capitalizado
        if (isTitle) {
          const lettersOnly = clean.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
          if (lettersOnly.length > 5 && lettersOnly === lettersOnly.toUpperCase()) {
            clean = clean.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
          }
          return clean.substring(0, 100);
        }

        return clean.substring(0, 5000);
      };

      // Formatear descripción detallada para WhatsApp Catalog (estrictamente limpia para Meta)
      let descBase = sanitizeMetaText(prod.descripcion_corta || prod.descripcion_larga || prod.nombre || '');
      const detailsList: string[] = [];
      if (refPrincipal) detailsList.push(`🔖 Referencia: ${refPrincipal}`);
      if (catNombre) detailsList.push(`🏷️ Categoría: ${catNombre}`);
      if (subcatNombre) detailsList.push(`📁 Subcategoría: ${subcatNombre}`);
      if (prod.marca_nombre) detailsList.push(`🏷️ Marca: ${prod.marca_nombre}`);

      for (const [, attr] of attrsMap.entries()) {
        const ops = Array.from(attr.opciones);
        if (ops.length > 0) {
          const lower = attr.nombre.toLowerCase();
          const icon = lower.includes('color') ? '🎨' : lower.includes('talla') ? '📏' : lower.includes('volt') ? '⚡' : '⚙️';
          detailsList.push(`${icon} ${attr.nombre}: ${ops.join(', ')}`);
        }
      }

      if (prod.ficha_tecnica) detailsList.push(`\n📋 Ficha Técnica:\n${sanitizeMetaText(prod.ficha_tecnica)}`);

      let fullDescription = descBase;
      if (detailsList.length > 0) {
        fullDescription = `${descBase}\n\n${detailsList.join('\n')}`.trim();
      }

      const productTitle = sanitizeMetaText(prod.nombre || 'Producto', true);

      let fbProductId = prod.fb_product_id;

      // 4. Consultar productos y grupos existentes en Meta en paralelo
      let existingByRetailer = cachedContext?.existingByRetailer;
      let existingGroupByRetailer = cachedContext?.existingGroupByRetailer;
      let existingItems: any[] = [];

      if (!existingByRetailer || !existingGroupByRetailer) {
        const [existingMetaRes, existingGroupsRes] = await Promise.all([
          fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?limit=1000&fields=id,retailer_id,name,item_group_id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          }),
          fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_groups?limit=1000&fields=id,retailer_id`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          }),
        ]);

        const existingMetaData: any = await existingMetaRes.json();
        existingItems = existingMetaData?.data || [];
        existingByRetailer = new Map<string, string>();
        for (const it of existingItems) {
          if (it.retailer_id) existingByRetailer.set(it.retailer_id, it.id);
        }

        const existingGroupsData: any = await existingGroupsRes.json();
        const existingGroups: any[] = existingGroupsData?.data || [];
        existingGroupByRetailer = new Map<string, string>();
        for (const g of existingGroups) {
          if (g.retailer_id) existingGroupByRetailer.set(g.retailer_id, g.id);
        }
      }

      if (varRows && varRows.length > 0) {
        // EL PRODUCTO TIENE VARIANTES:
        // Se agrupan bajo un único ProductGroup en Meta para que WhatsApp las muestre como una sola tarjeta
        // con selector de variantes y precios independientes.
        this.logger.log(`[MetaCatalog] Sincronizando ${varRows.length} variantes para producto ${productoId} ("${productTitle}")...`);

        // Si existe un producto base huérfano con retailer_id que no corresponde a una variante activa, retirarlo
        const activeVarRetailerIds = new Set(varRows.map((v: any) => (v.sku || v.referencia || '').trim()).filter(Boolean));
        const orphanDeletes: Promise<any>[] = [];
        for (const it of existingItems) {
          if (it.retailer_id === retailerId && !activeVarRetailerIds.has(retailerId)) {
            orphanDeletes.push(
              fetch(`https://graph.facebook.com/${apiVersion}/${it.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${metaToken}` },
              })
            );
          }
        }
        if (orphanDeletes.length > 0) {
          await Promise.all(orphanDeletes);
          this.logger.log(`✓ [MetaCatalog] Retirados ${orphanDeletes.length} producto(s) base obsoletos de Meta`);
        }

        // Obtener o crear el ProductGroup correspondiente a este producto con sus dimensiones correctas
        let productGroupId = existingGroupByRetailer.get(itemGroupId) || null;
        if (!productGroupId) {
          const variantDimensions: any[] = [];
          for (const [key, attr] of attrsMap.entries()) {
            const ops = Array.from(attr.opciones);
            if (ops.length === 0) continue;

            if (key.includes('color')) {
              variantDimensions.push({
                label: attr.nombre,
                product_field: 'color',
                options: ops,
              });
            } else if (key.includes('talla') || key.includes('tamaño') || key.includes('tamano')) {
              variantDimensions.push({
                label: attr.nombre,
                product_field: 'size',
                options: ops,
              });
            } else if (key.includes('material')) {
              variantDimensions.push({
                label: attr.nombre,
                product_field: 'material',
                options: ops,
              });
            } else if (key.includes('estampado') || key.includes('diseño') || key.includes('diseno') || key.includes('patron')) {
              variantDimensions.push({
                label: attr.nombre,
                product_field: 'pattern',
                options: ops,
              });
            } else {
              // Atributos técnicos/específicos (ej. Voltaje, Capacidad, etc.)
              variantDimensions.push({
                label: attr.nombre,
                product_field: `custom_data:${attr.nombre}`,
                options: ops,
              });
            }
          }

          if (variantDimensions.length === 0) {
            variantDimensions.push({
              label: 'Opción',
              product_field: 'size',
              options: varRows.map((v: any) => (v.sku || v.referencia || `VAR-${v.id_producto_variante}`).trim()),
            });
          }

          try {
            const createGroupRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_groups`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                retailer_id: itemGroupId,
                variants: variantDimensions,
              }),
            });
            const createGroupData: any = await createGroupRes.json();
            if (createGroupData?.id) {
              productGroupId = createGroupData.id;
              this.logger.log(`✓ [MetaCatalog] ProductGroup creado para "${itemGroupId}" con FB ID: ${productGroupId}`);
            }
          } catch (gErr: any) {
            this.logger.warn(`[MetaCatalog] Error creando ProductGroup: ${gErr.message}`);
          }
        }

        // Consultar todas las imágenes del producto para asignación contextual a variantes
        const prodImages = await this.dataSource.query(
          `SELECT id_producto_imagen AS id, url, nombre, principal, orden
           FROM public.producto_imagen
           WHERE producto_id = $1 AND estado = 'activo'
           ORDER BY principal DESC, orden ASC, id_producto_imagen ASC;`,
          [productoId],
        );

        // Subir o actualizar todas las variantes concurrentemente en paralelo
        const varUploadPromises = varRows.map(async (v: any) => {
          const vRetailerId = (v.sku || v.referencia || `${retailerId}-VAR-${v.id_producto_variante}`).trim();

          const comps: any[] = Array.isArray(v.componentes) ? v.componentes : [];
          let vColor: string | undefined = undefined;
          let vSize: string | undefined = undefined;
          let vMaterial: string | undefined = undefined;
          let vPattern: string | undefined = undefined;
          const vAdditionalAttrs: Record<string, string> = {};
          const vSpecsDetails: string[] = [];

          for (const c of comps) {
            const cAttrName = (c.attr_nombre || '').trim();
            const cCompName = (c.comp_nombre || '').trim();
            const lowerName = cAttrName.toLowerCase();

            if (lowerName.includes('color')) {
              vColor = cCompName;
              vSpecsDetails.push(`🎨 Color: ${cCompName}`);
            } else if (lowerName.includes('talla') || lowerName.includes('tamaño') || lowerName.includes('tamano')) {
              vSize = cCompName;
              vSpecsDetails.push(`📏 Talla: ${cCompName}`);
            } else if (lowerName.includes('material')) {
              vMaterial = cCompName;
              vSpecsDetails.push(`🧵 Material: ${cCompName}`);
            } else if (lowerName.includes('estampado') || lowerName.includes('diseño') || lowerName.includes('diseno') || lowerName.includes('patron')) {
              vPattern = cCompName;
              vSpecsDetails.push(`✨ Diseño: ${cCompName}`);
            } else {
              // Atributo específico (Voltaje, etc.) -> A additional_variant_attributes
              vAdditionalAttrs[cAttrName] = cCompName;
              const icon = lowerName.includes('volt') || lowerName.includes('energ') || lowerName.includes('potenc') ? '⚡' : '⚙️';
              vSpecsDetails.push(`${icon} ${cAttrName}: ${cCompName}`);
            }
          }

          // Asignar imagen específica de la variante según coincidencia con color o SKU
          let vImageUrl = imageUrl;
          if (prodImages && prodImages.length > 0) {
            const vMatch = prodImages.find((img: any) => {
              const str = `${img.nombre || ''} ${img.url || ''}`.toLowerCase();
              if (vColor && str.includes(vColor.toLowerCase())) return true;
              if (vColor?.toLowerCase().includes('amarillo') && (str.includes('amarillo') || str.includes('yellow') || str.includes('ama'))) return true;
              if (vColor?.toLowerCase().includes('negro') && (str.includes('negro') || str.includes('black') || str.includes('neg'))) return true;
              if (vColor?.toLowerCase().includes('blanco') && (str.includes('blanco') || str.includes('white') || str.includes('bla'))) return true;
              if (vColor?.toLowerCase().includes('azul') && (str.includes('azul') || str.includes('blue') || str.includes('azu'))) return true;
              return false;
            });
            if (vMatch?.url) {
              vImageUrl = vMatch.url;
            }
          }

          const vPrecio = Number(v.precio || precioFinalDeVenta);
          const vPriceInCents = Math.round(vPrecio * 100);

          // Descripción enriquecida con jerarquía visual para WhatsApp
          const vBreadcrumbs: string[] = [];
          if (catNombre) vBreadcrumbs.push(`📁 Categoría: ${catNombre}`);
          if (subcatNombre) vBreadcrumbs.push(`📂 Subcategoría: ${subcatNombre}`);
          if (vRetailerId) vBreadcrumbs.push(`🔖 Referencia: ${vRetailerId}`);
          if (prod.marca_nombre) vBreadcrumbs.push(`🏷️ Marca: ${prod.marca_nombre}`);
          if (vSpecsDetails.length > 0) vBreadcrumbs.push(...vSpecsDetails);

          const variantDesc = sanitizeMetaText([
            descBase,
            vBreadcrumbs.join('\n'),
            prod.ficha_tecnica ? `📋 Ficha Técnica:\n${sanitizeMetaText(prod.ficha_tecnica)}` : '',
          ].filter(Boolean).join('\n\n'));

          const varPayload: any = {
            retailer_id: vRetailerId,
            item_group_id: itemGroupId,
            title: productTitle,
            name: productTitle,
            description: variantDesc,
            visibility: 'published',
            availability: 'in stock',
            inventory: 15,
            condition: 'new',
            price: vPriceInCents,
            sale_price: vPriceInCents,
            currency: 'COP',
            image_url: vImageUrl,
            brand: prod.marca_nombre || 'Genérica',
            category: subcatNombre || catNombre || 'General',
            product_type: taxonomyBreadcrumb,
            color: vColor || undefined,
            size: vSize || undefined,
            material: vMaterial || undefined,
            pattern: vPattern || undefined,
            additional_variant_attributes: Object.keys(vAdditionalAttrs).length > 0 ? vAdditionalAttrs : undefined,
            custom_label_0: catNombre.substring(0, 100),
            custom_label_1: subcatNombre.substring(0, 100),
            custom_label_2: vRetailerId.substring(0, 100),
            custom_label_3: (vColor || '').substring(0, 100) || undefined,
            custom_label_4: (vSize || Object.values(vAdditionalAttrs)[0] || '').substring(0, 100) || undefined,
          };

          const existingVarId = existingByRetailer.get(vRetailerId);
          if (existingVarId) {
            await fetch(`https://graph.facebook.com/${apiVersion}/${existingVarId}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(varPayload),
            });
            return existingVarId;
          } else {
            const postUrl = productGroupId
              ? `https://graph.facebook.com/${apiVersion}/${productGroupId}/products`
              : `https://graph.facebook.com/${apiVersion}/${catalogId}/products`;
            const createVarRes = await fetch(postUrl, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(varPayload),
            });
            const createVarData: any = await createVarRes.json();
            return createVarData?.id || null;
          }
        });

        const syncedVarIds = await Promise.all(varUploadPromises);
        fbProductId = syncedVarIds.find(Boolean) || fbProductId;
        this.logger.log(`✓ [MetaCatalog] ${varRows.length} variantes sincronizadas exitosamente en paralelo`);
      } else {
        // PRODUCTO SIMPLE (Sin variantes):
        const simpleBreadcrumbs: string[] = [];
        if (catNombre) simpleBreadcrumbs.push(`📁 Categoría: ${catNombre}`);
        if (subcatNombre) simpleBreadcrumbs.push(`📂 Subcategoría: ${subcatNombre}`);
        if (retailerId) simpleBreadcrumbs.push(`🔖 Referencia: ${retailerId}`);
        if (prod.marca_nombre) simpleBreadcrumbs.push(`🏷️ Marca: ${prod.marca_nombre}`);

        const simpleDesc = sanitizeMetaText([
          descBase,
          simpleBreadcrumbs.join('\n'),
          prod.ficha_tecnica ? `📋 Ficha Técnica:\n${sanitizeMetaText(prod.ficha_tecnica)}` : '',
        ].filter(Boolean).join('\n\n'));

        const metaPayload: any = {
          retailer_id: retailerId,
          item_group_id: itemGroupId,
          title: productTitle,
          name: productTitle,
          description: simpleDesc,
          visibility: 'published',
          availability: 'in stock',
          inventory: Math.max(1, Number(prod.disponible) || 10),
          condition: 'new',
          price: priceInCents,
          sale_price: priceInCents,
          currency: 'COP',
          image_url: imageUrl,
          brand: prod.marca_nombre || 'Genérica',
          category: subcatNombre || catNombre || 'General',
          product_type: taxonomyBreadcrumb,
          color: attrsMap.get('color')?.opciones ? Array.from(attrsMap.get('color')!.opciones)[0] : undefined,
          size: (attrsMap.get('talla')?.opciones || attrsMap.get('tamaño')?.opciones) ? Array.from((attrsMap.get('talla') || attrsMap.get('tamaño'))!.opciones)[0] : undefined,
          custom_label_0: catNombre.substring(0, 100),
          custom_label_1: subcatNombre.substring(0, 100),
          custom_label_2: refPrincipal.substring(0, 100),
        };

        if (fbProductId) {
          await fetch(`https://graph.facebook.com/${apiVersion}/${fbProductId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(metaPayload),
          });
          this.logger.log(`✓ [MetaCatalog] Producto simple ${productoId} actualizado en Meta`);
        } else {
          const prodRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(metaPayload),
          });
          const prodData: any = await prodRes.json();
          if (prodData?.id) {
            fbProductId = prodData.id;
            existingByRetailer?.set(retailerId, fbProductId);
          }
          this.logger.log(`✓ [MetaCatalog] Producto simple ${productoId} subido en Meta con FB ID: ${fbProductId}`);
        }
      }

      // 5. Vincular Catálogo a WABA y Configurar WhatsApp Commerce (sin vitrina pública, carrito activo para mensajes interactivos)
      if (!cachedContext?.skipPostOperations) {
        const postOperations: Promise<any>[] = [];

        // A. Vincular Catálogo a WABA
        if (wabaId && catalogId) {
          postOperations.push(
            fetch(`https://graph.facebook.com/${apiVersion}/${wabaId}/product_catalogs`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ catalog_id: catalogId }),
            }).catch((wabaLinkErr: any) => this.logger.warn(`[MetaCatalog] Error vinculando catálogo a WABA: ${wabaLinkErr.message}`))
          );
        }

        // B. Configurar WhatsApp Commerce (is_catalog_visible: false, is_cart_enabled: true)
        if (phoneId && catalogId) {
          postOperations.push(
            this.activarComercioWhatsApp(phoneId, catalogId, metaToken, apiVersion, wabaId)
          );
        }

        await Promise.all(postOperations);
        this.logger.log(`✓ [MetaCatalog] Operaciones post-sincronización completadas`);
      }

      await this.dataSource.query(
        `UPDATE public.producto
         SET fb_product_id = $1,
             meta_sync_status = 'sincronizado',
             meta_sync_error = NULL,
             meta_synced_at = NOW()
         WHERE id_producto = $2;`,
        [fbProductId, productoId],
      );

      return {
        success: true,
        catalog_id: catalogId,
        fb_product_id: fbProductId,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCatalog] Excepción al sincronizar producto: ${err.message}`, err.stack);
      await this.dataSource.query(
        `UPDATE public.producto
         SET meta_sync_status = 'error',
             meta_sync_error = $1
         WHERE id_producto = $2;`,
        [err.message || 'Error desconocido al sincronizar', productoId],
      );
      return { success: false, error: err.message };
    }
  }

  /**
   * Activa inmediatamente el comercio y carrito de WhatsApp para refrescar la caché del dispositivo
   */
  private async activarComercioWhatsApp(
    phoneId: string,
    catalogId: string,
    metaToken: string,
    apiVersion: string,
    wabaId?: string,
  ) {
    if (!phoneId || !catalogId) return;
    try {
      // 1. Re-vincular Catálogo a WABA para forzar re-indexación en la cuenta comercial
      if (wabaId) {
        await fetch(`https://graph.facebook.com/${apiVersion}/${wabaId}/product_catalogs`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ catalog_id: catalogId }),
        }).catch(() => null);
      }

      // 2. Ocultar vitrina estática del perfil (is_catalog_visible: false) y habilitar carrito para mensajes interactivos
      const res = await fetch(
        `https://graph.facebook.com/${apiVersion}/${phoneId}/whatsapp_commerce_settings`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            is_cart_enabled: true,
            is_catalog_visible: false,
          }),
        },
      );
      const data: any = await res.json();
      if (data?.success) {
        this.logger.log(`✓ [MetaCatalog] WhatsApp Commerce configurado: vitrina estática oculta y mensajes interactivos habilitados`);
      }
    } catch (err: any) {
      this.logger.warn(`[MetaCatalog] Advertencia activando WhatsApp Commerce: ${err.message}`);
    }
  }

  /**
   * Garantiza que las colecciones (Product Sets) aparezcan en WhatsApp de forma estructurada y jerárquica:
   * 1. Colección de Categoría: "${catNombre}"
   * 2. Colección de Subcategoría: "${catNombre} › ${subcatNombre}"
   */
  private async asegurarProductSets(
    catalogId: string,
    catNombre: string,
    subcatNombre: string,
    metaToken: string,
    apiVersion: string,
  ) {
    if (!catalogId || (!catNombre && !subcatNombre)) return;
    try {
      const setsRes = await fetch(
        `https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets?fields=id,name,filter`,
        { headers: { Authorization: `Bearer ${metaToken}` } },
      );
      const setsData: any = await setsRes.json();
      const existingSets: any[] = setsData?.data || [];

      // A. Colección para Categoría Principal
      if (catNombre) {
        const catSet = existingSets.find(
          (s: any) => s.name?.toLowerCase().trim() === catNombre.toLowerCase().trim(),
        );
        if (!catSet) {
          const createCatRes = await fetch(
            `https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: catNombre,
                filter: { product_type: { contains: catNombre } },
              }),
            },
          );
          const createCatData: any = await createCatRes.json();
          if (createCatData?.id) {
            this.logger.log(`✓ [MetaCatalog] Colección Categoría "${catNombre}" creada en WhatsApp`);
          } else if (createCatData?.error?.code === 100) {
            await new Promise(r => setTimeout(r, 1200));
            await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: catNombre,
                filter: { product_type: { contains: catNombre } },
              }),
            }).catch(() => null);
          }
        }
      }

      // B. Colección para Subcategoría (formato jerárquico visual: "Categoría - Subcategoría")
      if (subcatNombre) {
        const subcatSetName = catNombre ? `${catNombre} - ${subcatNombre}` : subcatNombre;
        const exactSubSet = existingSets.find(
          (s: any) => s.name?.toLowerCase().trim() === subcatSetName.toLowerCase().trim(),
        );
        const legacySubSet = existingSets.find(
          (s: any) => s.name?.toLowerCase().trim() === subcatNombre.toLowerCase().trim(),
        );

        if (legacySubSet && !exactSubSet) {
          // Renombrar a formato jerárquico si existía con el nombre simple anterior
          await fetch(`https://graph.facebook.com/${apiVersion}/${legacySubSet.id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: subcatSetName }),
          });
          this.logger.log(`✓ [MetaCatalog] Colección renombrada a jerarquía: "${subcatSetName}"`);
        } else if (!exactSubSet) {
          const createSubRes = await fetch(
            `https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: subcatSetName,
                filter: { category: { eq: subcatNombre } },
              }),
            },
          );
          const createSubData: any = await createSubRes.json();
          if (createSubData?.id) {
            this.logger.log(`✓ [MetaCatalog] Colección Subcategoría "${subcatSetName}" creada en WhatsApp`);
          } else if (createSubData?.error?.code === 100) {
            await new Promise(r => setTimeout(r, 1200));
            await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: subcatSetName,
                filter: { category: { eq: subcatNombre } },
              }),
            }).catch(() => null);
          }
        }
      }
    } catch (setErr: any) {
      this.logger.warn(`[MetaCatalog] Advertencia gestionando colecciones jerárquicas: ${setErr.message}`);
    }
  }

  // ==========================================================================
  // SEED DE FERRETERÍA (48 productos demo con catálogos completos y Meta)
  // ==========================================================================

  /**
   * Sincroniza un lote de productos con Meta Catalog y asegura todas las colecciones (Product Sets)
   * correspondientes a las categorías y subcategorías activas en WhatsApp.
   */
  async sincronizarLoteConMetaCatalog(
    productoIds: number[],
    empresaId = 1,
  ): Promise<{ total: number; exitosos: number; fallidos: number }> {
    const metaToken =
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const businessId = process.env.META_BUSINESS_ID;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    if (!metaToken || !businessId) {
      this.logger.warn(`[MetaCatalog] META_BUSINESS_ID o META_PERMANENT_TOKEN no configurados en .env`);
      return { total: productoIds.length, exitosos: 0, fallidos: productoIds.length };
    }

    try {
      // 1. Obtener canal de la empresa
      const canalRows = await this.dataSource.query(
        `SELECT id_canal, phone_number, phone_number_id, waba_id, catalog_id, configuracion
         FROM public.canal
         WHERE empresa_id = $1 AND tipo = 'whatsapp'
         ORDER BY id_canal ASC
         LIMIT 1;`,
        [empresaId],
      );

      let canal = canalRows[0];
      if (!canal) {
        const empRows = await this.dataSource.query(
          `SELECT nombre_comercial, whatsapp FROM public.empresa WHERE id_empresa = $1 LIMIT 1;`,
          [empresaId],
        );
        const emp = empRows[0];
        const newCanal = await this.dataSource.query(
          `INSERT INTO public.canal (empresa_id, tipo, proveedor, phone_number, estado, configuracion)
           VALUES ($1, 'whatsapp', 'meta', $2, 'activo', '{}')
           RETURNING id_canal, phone_number, phone_number_id, waba_id, catalog_id, configuracion;`,
          [empresaId, emp?.whatsapp || null],
        );
        canal = newCanal[0];
      }

      let catalogId = canal?.catalog_id;
      let wabaId = canal?.waba_id || canal?.configuracion?.waba_id || process.env.META_WABA_ID;
      const phoneId = canal?.phone_number_id || canal?.configuracion?.phone_number_id || process.env.META_PHONE_NUMBER_ID;

      if (!catalogId) {
        const empRows = await this.dataSource.query(
          `SELECT nombre_comercial FROM public.empresa WHERE id_empresa = $1 LIMIT 1;`,
          [empresaId],
        );
        const catalogName = `Catálogo - ${empRows[0]?.nombre_comercial || `Empresa ${empresaId}`}`;
        const catRes = await fetch(`https://graph.facebook.com/${apiVersion}/${businessId}/owned_product_catalogs`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: catalogName }),
        });
        const catData: any = await catRes.json();
        if (catData?.id) {
          catalogId = catData.id;
          await this.dataSource.query(
            `UPDATE public.canal SET catalog_id = $1, updated_at = NOW() WHERE id_canal = $2;`,
            [catalogId, canal.id_canal],
          );
        }
      }

      if (!catalogId) {
        this.logger.error(`[MetaCatalog] No se pudo obtener ni crear catalogId en Meta`);
        return { total: productoIds.length, exitosos: 0, fallidos: productoIds.length };
      }

      // 2. Consultar items y grupos existentes en Meta una sola vez
      const [existingMetaRes, existingGroupsRes] = await Promise.all([
        fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?limit=1000&fields=id,retailer_id,name,item_group_id`, {
          headers: { Authorization: `Bearer ${metaToken}` },
        }),
        fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_groups?limit=1000&fields=id,retailer_id`, {
          headers: { Authorization: `Bearer ${metaToken}` },
        }),
      ]);

      const existingMetaData: any = await existingMetaRes.json();
      const existingItems: any[] = existingMetaData?.data || [];
      const existingByRetailer = new Map<string, string>();
      for (const it of existingItems) {
        if (it.retailer_id) existingByRetailer.set(it.retailer_id, it.id);
      }

      const existingGroupsData: any = await existingGroupsRes.json();
      const existingGroups: any[] = existingGroupsData?.data || [];
      const existingGroupByRetailer = new Map<string, string>();
      for (const g of existingGroups) {
        if (g.retailer_id) existingGroupByRetailer.set(g.retailer_id, g.id);
      }

      const cachedContext = {
        metaToken,
        businessId,
        apiVersion,
        catalogId,
        wabaId,
        phoneId,
        existingByRetailer,
        existingGroupByRetailer,
        skipPostOperations: true,
      };

      // 4. Sincronizar todos los productos en lotes concurrentes (concurrency = 5)
      this.logger.log(`[MetaCatalog] Iniciando subida de ${productoIds.length} productos a Meta Catalog...`);
      let exitosos = 0;
      let fallidos = 0;
      const concurrency = 5;

      for (let i = 0; i < productoIds.length; i += concurrency) {
        const chunk = productoIds.slice(i, i + concurrency);
        const results = await Promise.all(
          chunk.map(async (id) => {
            try {
              const res = await this.sincronizarConMetaCatalog(id, empresaId, cachedContext);
              return res.success;
            } catch (err: any) {
              this.logger.error(`Error sincronizando producto ${id} en lote: ${err.message}`);
              return false;
            }
          }),
        );
        for (const r of results) {
          if (r) exitosos++;
          else fallidos++;
        }
      }

      // 5. Vincular Catálogo a WABA y Refrescar WhatsApp Commerce una sola vez al final
      if (wabaId && catalogId) {
        await fetch(`https://graph.facebook.com/${apiVersion}/${wabaId}/product_catalogs`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ catalog_id: catalogId }),
        }).catch(() => null);
      }

      if (phoneId && catalogId) {
        await this.activarComercioWhatsApp(phoneId, catalogId, metaToken, apiVersion, wabaId);
      }

      this.logger.log(`✓ [MetaCatalog] Sincronización en lote terminada: ${exitosos} exitosos, ${fallidos} fallidos de ${productoIds.length} productos.`);
      return { total: productoIds.length, exitosos, fallidos };
    } catch (err: any) {
      this.logger.error(`[MetaCatalog] Excepción en sincronización en lote: ${err.message}`, err.stack);
      return { total: productoIds.length, exitosos: 0, fallidos: productoIds.length };
    }
  }

  /**
   * Ejecuta el script SQL de seed integral de ferretería dentro de una
   * transacción. Carga 48 productos con todas sus relaciones:
   * categorías, subcategorías, marcas, impuestos, variantes, inventario,
   * códigos de barras, proveedores, atributos, imágenes y SEO/IA.
   * Y sincroniza automáticamente los productos y sus colecciones en Meta WhatsApp Catalog.
   */
  async seedFerreteria(empresaId = 1): Promise<{ ok: boolean; productos: number; meta_sincronizados: number; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      this.logger.log('[Seed] Iniciando seed integral de ferretería en PostgreSQL...');

      // Leer el archivo SQL del seed de forma compatible con Node.js ESM
      const possiblePaths = [
        path.resolve(process.cwd(), 'dist', 'producto', 'seeds', 'seed-ferreteria.sql'),
        path.resolve(process.cwd(), 'src', 'producto', 'seeds', 'seed-ferreteria.sql'),
        path.resolve('c:/Users/Administrator/Desktop/crm-whatssap-practica/backend-chat-connect/src/producto/seeds/seed-ferreteria.sql'),
        path.resolve('c:/Users/Administrator/Desktop/crm-whatssap-practica/backend-chat-connect/dist/producto/seeds/seed-ferreteria.sql'),
      ];

      let sql = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          sql = fs.readFileSync(p, 'utf8');
          this.logger.log(`[Seed] Archivo SQL cargado desde: ${p}`);
          break;
        }
      }

      if (!sql) {
        throw new Error('No se encontró el archivo seed-ferreteria.sql en ninguna de las rutas esperadas');
      }

      // Ejecutar el SQL completo dentro de la transacción
      await queryRunner.query(sql);

      await queryRunner.commitTransaction();

      // Contar los productos insertados
      const prods = await this.dataSource.query(
        `SELECT id_producto FROM public.producto WHERE empresa_id = $1 ORDER BY id_producto ASC;`,
        [empresaId],
      );
      const prodIds = prods.map((p: any) => Number(p.id_producto));

      this.logger.log(`[Seed] Seed SQL completado exitosamente: ${prodIds.length} productos en base de datos. Iniciando sincronización con Meta WhatsApp...`);

      // Sincronizar todos los productos cargados con Meta Catalog para mensajes interactivos
      const syncResult = await this.sincronizarLoteConMetaCatalog(prodIds, empresaId);

      return {
        ok: true,
        productos: prodIds.length,
        meta_sincronizados: syncResult.exitosos,
        message: `Seed de ferretería completado: ${prodIds.length} productos cargados en PostgreSQL y sincronizados con Meta WhatsApp para mensajes interactivos (${syncResult.exitosos} sincronizados).`,
      };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Seed] Error al ejecutar seed: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Error al ejecutar seed de ferretería: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================================================
  // GESTIÓN DE COLECCIONES DE PRODUCTOS EN WHATSAPP (META GRAPH API & COMMERCE)
  // ==========================================================================

  /**
   * Obtiene la configuración de Meta Cloud API y el Catálogo para la empresa.
   */
  private async getMetaCatalogContext(empresaId = 1) {
    const metaToken =
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const businessId = process.env.META_BUSINESS_ID;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    const canalRows = await this.dataSource.query(
      `SELECT id_canal, phone_number, phone_number_id, waba_id, catalog_id, configuracion
       FROM public.canal
       WHERE empresa_id = $1 AND tipo = 'whatsapp'
       ORDER BY id_canal ASC
       LIMIT 1;`,
      [empresaId],
    );

    const canal = canalRows[0];
    const catalogId = canal?.catalog_id || '912267985057130';
    const phoneId = canal?.phone_number_id || canal?.configuracion?.phone_number_id || process.env.META_PHONE_NUMBER_ID || '1305340429332213';
    const wabaId = canal?.waba_id || canal?.configuracion?.waba_id || process.env.META_WABA_ID;

    return {
      metaToken,
      businessId,
      apiVersion,
      catalogId,
      phoneId,
      wabaId,
      canal,
    };
  }

  /**
   * Lista todas las colecciones (Product Sets) configuradas en Meta Commerce Catalog para WhatsApp.
   */
  async getColeccionesMeta(empresaId = 1) {
    const { metaToken, apiVersion, catalogId } = await this.getMetaCatalogContext(empresaId);

    if (!metaToken || !catalogId) {
      throw new BadRequestException('Meta Cloud API o Catálogo no configurado en el servidor');
    }

    try {
      this.logger.log(`[MetaCollections] Consultando colecciones (Product Sets) en Meta Catalog ${catalogId}...`);
      const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets?fields=id,name,filter,product_count&limit=100`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${metaToken}` },
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Error al consultar Product Sets en Meta');
      }

      const sets: any[] = data.data || [];

      // Consultar categorías locales para correlación
      const catRows = await this.dataSource.query(
        `SELECT id_categoria, nombre FROM public.categoria WHERE empresa_id = $1 AND estado = 'activo';`,
        [empresaId],
      );
      const catNames = new Set(catRows.map((c: any) => c.nombre.toLowerCase().trim()));

      const enrichedSets = sets.map((s) => {
        let filterObj: any = null;
        try {
          filterObj = typeof s.filter === 'string' ? JSON.parse(s.filter) : s.filter;
        } catch {
          filterObj = s.filter;
        }

        let tipo = 'personalizada';
        const nameLower = (s.name || '').toLowerCase().trim();
        if (s.name === 'All Products') {
          tipo = 'catalogo_completo';
        } else if (catNames.has(nameLower)) {
          tipo = 'categoria';
        } else if (s.name.includes(' - ') || s.name.includes(' › ')) {
          tipo = 'subcategoria';
        }

        return {
          id: s.id,
          name: s.name,
          product_count: s.product_count ?? 0,
          filter: filterObj,
          tipo,
          catalog_id: catalogId,
        };
      });

      return {
        catalog_id: catalogId,
        total: enrichedSets.length,
        colecciones: enrichedSets,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error consultando colecciones: ${err.message}`);
      throw new InternalServerErrorException(`Error al consultar colecciones en Meta: ${err.message}`);
    }
  }

  /**
   * Obtiene los productos pertenecientes a una colección específica en Meta.
   */
  async getProductosDeColeccionMeta(productSetId: string, empresaId = 1) {
    const { metaToken, apiVersion } = await this.getMetaCatalogContext(empresaId);

    if (!metaToken || !productSetId) {
      throw new BadRequestException('Parámetros de consulta de colección inválidos');
    }

    try {
      this.logger.log(`[MetaCollections] Obteniendo productos del Product Set ${productSetId}...`);
      const url = `https://graph.facebook.com/${apiVersion}/${productSetId}/products?fields=id,retailer_id,name,price,image_url,description,availability&limit=50`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${metaToken}` },
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Error al obtener productos de la colección en Meta');
      }

      const rawProducts: any[] = data.data || [];

      // Enriquecer con inventario local de PostgreSQL
      const retailerIds = rawProducts.map((p) => p.retailer_id).filter(Boolean);
      let localProdsMap = new Map<string, any>();

      if (retailerIds.length > 0) {
        const placeholders = retailerIds.map((_, i) => `$${i + 2}`).join(',');
        const localRows = await this.dataSource.query(
          `SELECT p.id_producto, p.codigo_interno, p.nombre, p.precio_impuesto,
                  GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible
           FROM public.producto p
           LEFT JOIN (
             SELECT producto_id, SUM(existencia) AS existencia, SUM(reservado) AS reservado
             FROM public.inventario WHERE empresa_id = $1 GROUP BY producto_id
           ) inv ON inv.producto_id = p.id_producto
           WHERE p.empresa_id = $1 AND (
             p.codigo_interno IN (${placeholders}) OR
             EXISTS (
               SELECT 1 FROM public.producto_referencia pr
               WHERE pr.producto_id = p.id_producto AND pr.referencia IN (${placeholders})
             )
           );`,
          [empresaId, ...retailerIds],
        );

        for (const lp of localRows) {
          if (lp.codigo_interno) localProdsMap.set(lp.codigo_interno, lp);
        }
      }

      const productosEnriquecidos = rawProducts.map((p) => {
        const local = localProdsMap.get(p.retailer_id);
        return {
          id: p.id,
          retailer_id: p.retailer_id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          description: p.description,
          availability: p.availability,
          stock_local: local ? local.disponible : null,
          id_producto_local: local ? local.id_producto : null,
        };
      });

      return {
        product_set_id: productSetId,
        total: productosEnriquecidos.length,
        productos: productosEnriquecidos,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error obteniendo productos de colección: ${err.message}`);
      throw new InternalServerErrorException(`Error al obtener productos de la colección: ${err.message}`);
    }
  }

  /**
   * Crea una nueva colección (Product Set) en Meta Commerce Catalog.
   */
  async crearColeccionMeta(dto: CreateColeccionDto, empresaId = 1) {
    const { metaToken, apiVersion, catalogId } = await this.getMetaCatalogContext(empresaId);

    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('El nombre de la colección es obligatorio');
    }

    let filter: any = {};
    if (dto.tipo === 'categoria' && dto.categoriaNombre) {
      filter = { product_type: { contains: dto.categoriaNombre.trim() } };
    } else if (dto.tipo === 'subcategoria' && dto.subcategoriaNombre) {
      filter = { category: { eq: dto.subcategoriaNombre.trim() } };
    } else if (dto.tipo === 'productos_seleccionados' && dto.retailerIds && dto.retailerIds.length > 0) {
      filter = { retailer_id: { is_any: dto.retailerIds } };
    } else {
      // Filtro por nombre o tipo por defecto
      filter = { product_type: { contains: dto.name.trim() } };
    }

    try {
      this.logger.log(`[MetaCollections] Creando colección "${dto.name}" en Meta Catalog ${catalogId}...`);
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: dto.name.trim(),
          filter,
        }),
      });

      const data: any = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error?.message || 'Error al crear Product Set en Meta');
      }

      this.logger.log(`✓ [MetaCollections] Colección creada en Meta con ID: ${data.id}`);

      return {
        ok: true,
        id: data.id,
        name: dto.name.trim(),
        filter,
        message: `Colección "${dto.name}" creada exitosamente en Meta Commerce y WhatsApp`,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error al crear colección: ${err.message}`);
      throw new BadRequestException(`No se pudo crear la colección en Meta: ${err.message}`);
    }
  }

  /**
   * Elimina una colección (Product Set) de Meta Commerce Catalog.
   */
  async eliminarColeccionMeta(productSetId: string, empresaId = 1) {
    const { metaToken, apiVersion } = await this.getMetaCatalogContext(empresaId);

    try {
      this.logger.log(`[MetaCollections] Eliminando Product Set ${productSetId} en Meta...`);
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${productSetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${metaToken}` },
      });

      const data: any = await res.json();
      if (!res.ok || data.success !== true) {
        throw new Error(data.error?.message || 'Error al eliminar Product Set en Meta');
      }

      this.logger.log(`✓ [MetaCollections] Colección ${productSetId} eliminada en Meta`);

      return {
        ok: true,
        id: productSetId,
        message: 'Colección eliminada exitosamente del catálogo de WhatsApp',
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error al eliminar colección: ${err.message}`);
      throw new BadRequestException(`Error al eliminar la colección en Meta: ${err.message}`);
    }
  }

  /**
   * Sincroniza y asegura todas las colecciones basadas en las categorías y subcategorías activas.
   */
  async sincronizarColeccionesMeta(empresaId = 1) {
    const { metaToken, apiVersion, catalogId } = await this.getMetaCatalogContext(empresaId);

    try {
      this.logger.log(`[MetaCollections] Sincronizando colecciones jerárquicas con Meta...`);

      const catSubRows = await this.dataSource.query(
        `SELECT DISTINCT c.nombre AS categoria, sc.nombre AS subcategoria
         FROM public.categoria c
         LEFT JOIN public.subcategoria sc ON sc.categoria_id = c.id_categoria AND sc.empresa_id = c.empresa_id AND sc.estado = 'activo'
         WHERE c.empresa_id = $1 AND c.estado = 'activo'
         ORDER BY c.nombre, sc.nombre;`,
        [empresaId],
      );

      const setsRes = await fetch(
        `https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets?fields=id,name,filter&limit=200`,
        { headers: { Authorization: `Bearer ${metaToken}` } },
      );
      const setsData: any = await setsRes.json();
      const existingSets: any[] = setsData?.data || [];
      const setNamesLower = new Set(existingSets.map((s: any) => (s.name || '').toLowerCase().trim()));

      let creadas = 0;
      const categoriesDone = new Set<string>();

      for (const row of catSubRows) {
        const catName = (row.categoria || '').trim();
        const subcatName = (row.subcategoria || '').trim();

        if (catName && !categoriesDone.has(catName.toLowerCase())) {
          categoriesDone.add(catName.toLowerCase());
          if (!setNamesLower.has(catName.toLowerCase())) {
            const createRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: catName,
                filter: { product_type: { contains: catName } },
              }),
            });
            const cData: any = await createRes.json();
            if (cData?.id) {
              setNamesLower.add(catName.toLowerCase());
              creadas++;
            }
          }
        }

        if (subcatName) {
          const subSetName = catName ? `${catName} - ${subcatName}` : subcatName;
          if (!setNamesLower.has(subSetName.toLowerCase())) {
            const scRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: subSetName,
                filter: { category: { eq: subcatName } },
              }),
            });
            const scData: any = await scRes.json();
            if (scData?.id) {
              setNamesLower.add(subSetName.toLowerCase());
              creadas++;
            }
          }
        }
      }

      return {
        ok: true,
        creadas,
        total_existentes: existingSets.length + creadas,
        message: `Sincronización de colecciones finalizada: ${creadas} nuevas creadas, ${existingSets.length + creadas} activas en WhatsApp.`,
      };
    } catch (err: any) {
      this.logger.error(`[MetaCollections] Error en sincronización masiva: ${err.message}`);
      throw new InternalServerErrorException(`Error al sincronizar colecciones: ${err.message}`);
    }
  }

  /**
   * Envía una colección interactiva (Multi-Product Message o Catalog Message)
   * directamente al WhatsApp de un cliente usando la Meta Cloud API oficial.
   */
  async enviarColeccionWhatsApp(dto: EnviarColeccionWhatsAppDto, empresaId = 1) {
    const { metaToken, apiVersion, catalogId, phoneId } = await this.getMetaCatalogContext(empresaId);

    if (!dto.telefono) {
      throw new BadRequestException('El número de WhatsApp de destino es obligatorio');
    }

    const cleanPhone = dto.telefono.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      throw new BadRequestException('Número de teléfono inválido');
    }

    try {
      let payload: any = null;
      let productosEnviadosCount = 0;
      let descripcionEnvio = '';

      if (dto.tipoMensaje === 'catalog_message') {
        // Mensaje de Catálogo Completo con Miniatura
        let thumbId = dto.retailerIds?.[0];
        if (!thumbId) {
          const thumbRow = await this.dataSource.query(
            `SELECT codigo_interno FROM public.producto WHERE empresa_id = $1 AND fb_product_id IS NOT NULL LIMIT 1;`,
            [empresaId],
          );
          thumbId = thumbRow[0]?.codigo_interno || 'FER-0001-220-KIT';
        }

        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'interactive',
          interactive: {
            type: 'catalog_message',
            body: {
              text: dto.cuerpo || 'Explora nuestro catálogo oficial en WhatsApp con todas las colecciones y productos disponibles:',
            },
            footer: {
              text: 'ChatConnect Ferretería',
            },
            action: {
              name: 'catalog_message',
              parameters: {
                thumbnail_product_retailer_id: thumbId,
              },
            },
          },
        };
        descripcionEnvio = 'Catálogo completo de WhatsApp con todas las colecciones';
      } else if (dto.tipoMensaje === 'multi_seccion' || dto.coleccionId === 'todas_las_categorias') {
        // Mensaje Multi-Colección con Secciones por Categoría
        const catProds = await this.dataSource.query(
          `SELECT c.nombre AS categoria, p.codigo_interno
           FROM public.producto p
           INNER JOIN public.categoria c ON c.id_categoria = p.categoria_id
           WHERE p.empresa_id = $1 AND p.fb_product_id IS NOT NULL AND c.estado = 'activo'
           ORDER BY c.nombre, p.id_producto;`,
          [empresaId],
        );

        const sectionsMap = new Map<string, { product_retailer_id: string }[]>();
        let totalCount = 0;
        for (const row of catProds) {
          const cat = (row.categoria || 'General').substring(0, 24);
          if (!sectionsMap.has(cat)) {
            if (sectionsMap.size >= 10) continue;
            sectionsMap.set(cat, []);
          }
          const items = sectionsMap.get(cat)!;
          if (items.length < 3 && totalCount < 30) {
            items.push({ product_retailer_id: row.codigo_interno });
            totalCount++;
          }
        }

        const sections = Array.from(sectionsMap.entries())
          .filter(([, items]) => items.length > 0)
          .map(([title, product_items]) => ({ title, product_items }));

        if (sections.length === 0) {
          throw new BadRequestException('No hay productos sincronizados con Meta para enviar por secciones');
        }

        productosEnviadosCount = totalCount;
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'interactive',
          interactive: {
            type: 'product_list',
            header: {
              type: 'text',
              text: (dto.titulo || 'Catálogo de Ferretería').substring(0, 60),
            },
            body: {
              text: dto.cuerpo || 'Explora nuestras colecciones organizadas por categoría y realiza tu pedido directo:',
            },
            footer: {
              text: 'ChatConnect Ferretería',
            },
            action: {
              catalog_id: catalogId,
              sections,
            },
          },
        };
        descripcionEnvio = `Catálogo Multi-Categoría (${sections.length} secciones, ${productosEnviadosCount} productos)`;
      } else {
        // Mensaje de Colección Multi-Producto (product_list)
        let productItems: { product_retailer_id: string }[] = [];

        if (dto.retailerIds && dto.retailerIds.length > 0) {
          productItems = dto.retailerIds.slice(0, 30).map((id) => ({ product_retailer_id: id }));
        } else if (dto.coleccionId) {
          // Obtener los productos desde Meta API para este Product Set
          const prodsRes = await fetch(
            `https://graph.facebook.com/${apiVersion}/${dto.coleccionId}/products?fields=id,retailer_id,name&limit=30`,
            { headers: { Authorization: `Bearer ${metaToken}` } },
          );
          const prodsData: any = await prodsRes.json();
          const items: any[] = prodsData?.data || [];
          productItems = items.filter((p) => p.retailer_id).slice(0, 30).map((p) => ({ product_retailer_id: p.retailer_id }));
        }

        if (productItems.length === 0) {
          // Fallback a productos locales sincronizados con Meta
          const dbProds = await this.dataSource.query(
            `SELECT codigo_interno FROM public.producto
             WHERE empresa_id = $1 AND fb_product_id IS NOT NULL
             ORDER BY id_producto ASC LIMIT 10;`,
            [empresaId],
          );
          productItems = dbProds.map((p: any) => ({ product_retailer_id: p.codigo_interno }));
        }

        if (productItems.length === 0) {
          throw new BadRequestException('No hay productos aprobados en esta colección para enviar por WhatsApp');
        }

        productosEnviadosCount = productItems.length;
        const nombreCol = (dto.nombreColeccion || 'Colección de Productos').substring(0, 24);

        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'interactive',
          interactive: {
            type: 'product_list',
            header: {
              type: 'text',
              text: dto.titulo || `Colección: ${dto.nombreColeccion}`,
            },
            body: {
              text: dto.cuerpo || `Descubre nuestra selección de ${dto.nombreColeccion} disponibles para pedido inmediato con entrega rápida.`,
            },
            footer: {
              text: 'ChatConnect Ferretería',
            },
            action: {
              catalog_id: catalogId,
              sections: [
                {
                  title: nombreCol,
                  product_items: productItems,
                },
              ],
            },
          },
        };
        descripcionEnvio = `Colección "${dto.nombreColeccion}" (${productosEnviadosCount} productos)`;
      }

      this.logger.log(`[WhatsAppMPM] Enviando colección a WhatsApp ${cleanPhone}...`);
      const sendRes = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const sendData: any = await sendRes.json();
      if (!sendRes.ok) {
        const errorMsg = sendData.error?.message || JSON.stringify(sendData);
        this.logger.error(`[WhatsAppMPM] Error enviando colección por Meta API: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const wamid = sendData.messages?.[0]?.id;
      this.logger.log(`✓ [WhatsAppMPM] Colección enviada con éxito. WAMID: ${wamid}`);

      // Registrar el mensaje en public.mensaje y actualizar conversación en PostgreSQL
      let convId = dto.conversacionId;
      if (!convId) {
        // Buscar conversación existente por teléfono
        const convRows = await this.dataSource.query(
          `SELECT c.id_conversacion FROM public.conversacion c
           JOIN public.tercero t ON t.id_tercero = c.tercero_id
           WHERE c.empresa_id = $1 AND (t.whatsapp = $2 OR t.telefono = $2)
           ORDER BY c.id_conversacion DESC LIMIT 1;`,
          [empresaId, cleanPhone],
        );
        convId = convRows[0]?.id_conversacion;
      }

      if (convId) {
        await this.dataSource.query(
          `INSERT INTO public.mensaje (empresa_id, conversacion_id, direccion, tipo, contenido, metadata, created_at)
           VALUES ($1, $2, 'outbound', 'interactive', $3, $4, NOW());`,
          [
            empresaId,
            convId,
            `📦 Colección enviada por WhatsApp: ${descripcionEnvio}`,
            JSON.stringify({
              wamid,
              tipo_interactivo: dto.tipoMensaje || 'product_list',
              coleccion_id: dto.coleccionId,
              nombre_coleccion: dto.nombreColeccion,
              productos_count: productosEnviadosCount,
            }),
          ],
        );

        await this.dataSource.query(
          `UPDATE public.conversacion
           SET fecha_ultima_interaccion = NOW(), updated_at = NOW()
           WHERE id_conversacion = $1;`,
          [convId],
        );
      }

      return {
        ok: true,
        wamid,
        telefono: cleanPhone,
        productos_enviados: productosEnviadosCount,
        message: `Colección enviada con éxito al WhatsApp +${cleanPhone}`,
      };
    } catch (err: any) {
      this.logger.error(`[WhatsAppMPM] Error: ${err.message}`);
      throw new BadRequestException(`No se pudo enviar la colección por WhatsApp: ${err.message}`);
    }
  }

  // ==========================================================================
  // CONVERSACIONES Y CHAT EN TIEMPO REAL (PostgreSQL Single Source of Truth)
  // ==========================================================================

  /**
   * Valida si la ventana de atención de servicio de 24 horas de WhatsApp está activa.
   * Según políticas oficiales de Meta, las respuestas libres e interactivas solo son gratuitas / tarifa de servicio
   * dentro de las 24 horas del último mensaje entrante del cliente.
   */
  async verificarVentanaServicio24h(conversacionId: number, empresaId = 1) {
    const res = await this.dataSource.query(
      `SELECT MAX(created_at) as ultimo_mensaje_cliente_at
       FROM public.mensaje
       WHERE conversacion_id = $1 AND empresa_id = $2 AND direccion = 'inbound';`,
      [conversacionId, empresaId],
    );

    const lastCustomerMsg = res[0]?.ultimo_mensaje_cliente_at ? new Date(res[0].ultimo_mensaje_cliente_at) : null;
    const now = new Date();
    let activa = false;
    let minutosRestantes = 0;
    let expiraAt: Date | null = null;

    if (lastCustomerMsg) {
      const diffMs = now.getTime() - lastCustomerMsg.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const total24hMin = 24 * 60; // 1440 min
      if (diffMin < total24hMin) {
        activa = true;
        minutosRestantes = total24hMin - diffMin;
        expiraAt = new Date(lastCustomerMsg.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    return {
      activa,
      minutosRestantes,
      ultimoMensajeClienteAt: lastCustomerMsg,
      expiraAt,
    };
  }

  /**
   * Obtiene la lista de conversaciones activas desde PostgreSQL, enriquecida con el estado de la ventana de 24 horas.
   */
  async getConversacionesChat(empresaId = 1) {
    try {
      const rows = await this.dataSource.query(
        `SELECT
           c.id_conversacion AS id,
           c.empresa_id,
           c.tercero_id,
           c.canal_id,
           c.estado,
           COALESCE(c.modo, 'ia') AS modo,
           c.fecha_ultima_interaccion,
           COALESCE(NULLIF(TRIM(t.nombre), ''), NULLIF(TRIM(t.razon_social), ''), t.whatsapp, 'Cliente WhatsApp') AS nombre,
           COALESCE(t.whatsapp, t.telefono, '') AS whatsapp,
           t.email,
           m.contenido AS ultimo_mensaje,
           m.tipo AS ultimo_tipo,
           m.created_at AS hora_ultimo_mensaje,
           m_in.created_at AS ultimo_mensaje_cliente_at
         FROM public.conversacion c
         LEFT JOIN public.tercero t ON t.id_tercero = c.tercero_id
         LEFT JOIN LATERAL (
           SELECT contenido, tipo, created_at
           FROM public.mensaje
           WHERE conversacion_id = c.id_conversacion
           ORDER BY id_mensaje DESC
           LIMIT 1
         ) m ON true
         LEFT JOIN LATERAL (
           SELECT created_at
           FROM public.mensaje
           WHERE conversacion_id = c.id_conversacion AND direccion = 'inbound'
           ORDER BY id_mensaje DESC
           LIMIT 1
         ) m_in ON true
         WHERE c.empresa_id = $1
         ORDER BY c.fecha_ultima_interaccion DESC NULLS LAST;`,
        [empresaId],
      );

      const now = new Date();
      return rows.map((r: any) => {
        const lastInbound = r.ultimo_mensaje_cliente_at ? new Date(r.ultimo_mensaje_cliente_at) : null;
        let ventanaActiva = false;
        let minutosRestantes = 0;
        let expiraAt: string | null = null;
        if (lastInbound) {
          const diffMs = now.getTime() - lastInbound.getTime();
          const diffMin = Math.floor(diffMs / (1000 * 60));
          if (diffMin < 24 * 60) {
            ventanaActiva = true;
            minutosRestantes = 24 * 60 - diffMin;
            expiraAt = new Date(lastInbound.getTime() + 24 * 60 * 60 * 1000).toISOString();
          }
        }

        return {
          id: Number(r.id),
          cliente_id: Number(r.tercero_id),
          nombre: r.nombre,
          whatsapp: r.whatsapp || '+573182483607',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(r.nombre)}`,
          modo: r.modo,
          estado: r.estado,
          ultimo_mensaje: r.ultimo_mensaje || 'Conversación iniciada',
          hora: r.hora_ultimo_mensaje ? new Date(r.hora_ultimo_mensaje).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
          ventana_servicio: {
            activa: ventanaActiva,
            minutos_restantes: minutosRestantes,
            expira_at: expiraAt,
            ultimo_cliente_at: lastInbound ? lastInbound.toISOString() : null,
          },
        };
      });
    } catch (err: any) {
      this.logger.error(`[Chat] Error al consultar conversaciones: ${err.message}`);
      throw new InternalServerErrorException('Error al consultar conversaciones de chat');
    }
  }

  /**
   * Obtiene los productos y categorías disponibles en PostgreSQL y sincronizados con Meta para enviar en el chat.
   */
  async getCatalogoDisponibleChat(empresaId = 1) {
    try {
      const catRows = await this.dataSource.query(
        `SELECT
           c.id_categoria,
           c.nombre,
           COUNT(p.id_producto) FILTER (WHERE p.fb_product_id IS NOT NULL) AS total_productos
         FROM public.categoria c
         LEFT JOIN public.producto p ON p.categoria_id = c.id_categoria AND p.empresa_id = c.empresa_id
         WHERE c.empresa_id = $1 AND c.estado = 'activo'
         GROUP BY c.id_categoria, c.nombre
         HAVING COUNT(p.id_producto) FILTER (WHERE p.fb_product_id IS NOT NULL) > 0
         ORDER BY c.nombre ASC;`,
        [empresaId],
      );

      const prodRows = await this.dataSource.query(
        `SELECT
           p.id_producto,
           p.codigo_interno,
           p.nombre,
           p.descripcion_corta AS descripcion,
           COALESCE(p.precio_impuesto, p.precio_base, 0) AS precio,
           img.url AS imagen_principal,
           p.categoria_id,
           c.nombre AS categoria_nombre,
           p.fb_product_id,
           GREATEST(0, COALESCE(inv.existencia, 0) - COALESCE(inv.reservado, 0)) AS disponible
         FROM public.producto p
         LEFT JOIN public.categoria c ON c.id_categoria = p.categoria_id
         LEFT JOIN public.inventario inv ON inv.producto_id = p.id_producto
         LEFT JOIN LATERAL (
           SELECT url FROM public.producto_imagen
           WHERE producto_id = p.id_producto AND estado = 'activo'
           ORDER BY principal DESC, orden ASC
           LIMIT 1
         ) img ON true
         WHERE p.empresa_id = $1 AND p.fb_product_id IS NOT NULL
         ORDER BY c.nombre, p.nombre ASC;`,
        [empresaId],
      );

      return {
        categorias: catRows.map((c: any) => ({
          id: Number(c.id_categoria),
          nombre: c.nombre,
          total_productos: Number(c.total_productos),
        })),
        productos: prodRows.map((p: any) => ({
          id: Number(p.id_producto),
          codigo_interno: p.codigo_interno,
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          precio: Number(p.precio) || 0,
          imagen_principal: p.imagen_principal || null,
          categoria_id: p.categoria_id ? Number(p.categoria_id) : null,
          categoria_nombre: p.categoria_nombre || 'General',
          disponible: Number(p.disponible) || 0,
        })),
      };
    } catch (err: any) {
      this.logger.error(`[Chat] Error al obtener catálogo disponible: ${err.message}`);
      throw new InternalServerErrorException('Error al consultar productos para el chat');
    }
  }

  /**
   * Obtiene los mensajes de una conversación desde PostgreSQL.
   */
  async getMensajesConversacionChat(conversacionId: number, empresaId = 1) {
    try {
      const rows = await this.dataSource.query(
        `SELECT
           id_mensaje AS id,
           conversacion_id,
           direccion,
           tipo,
           contenido,
           media_url,
           media_mime_type,
           metadata,
           created_at
         FROM public.mensaje
         WHERE conversacion_id = $1 AND empresa_id = $2
         ORDER BY id_mensaje ASC;`,
        [conversacionId, empresaId],
      );

      return rows.map((m: any) => ({
        id: Number(m.id),
        emisor: m.direccion === 'inbound' ? 'cliente' : m.metadata?.enviado_por_tool ? 'ia' : 'asesor',
        tipo: m.tipo,
        texto: m.contenido,
        media_url: m.media_url,
        metadata: m.metadata,
        hora: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    } catch (err: any) {
      this.logger.error(`[Chat] Error al consultar mensajes: ${err.message}`);
      throw new InternalServerErrorException('Error al consultar mensajes de la conversación');
    }
  }

  /**
   * Alterna el modo de atención ('ia' vs 'humano') para una conversación.
   */
  async cambiarModoConversacion(conversacionId: number, modo: 'ia' | 'humano', empresaId = 1) {
    try {
      await this.dataSource.query(
        `UPDATE public.conversacion
         SET modo = $1, updated_at = NOW()
         WHERE id_conversacion = $2 AND empresa_id = $3;`,
        [modo, conversacionId, empresaId],
      );
      return { ok: true, conversacionId, modo };
    } catch (err: any) {
      this.logger.error(`[Chat] Error al cambiar modo: ${err.message}`);
      throw new InternalServerErrorException('Error al cambiar modo de atención');
    }
  }

  /**
   * Envía un mensaje de texto por WhatsApp vía Meta Cloud API y lo persiste en PostgreSQL.
   * Valida estrictamente que la ventana de servicio de 24 horas esté abierta para evitar cobros de marketing.
   */
  async enviarMensajeTextoChat(conversacionId: number, texto: string, empresaId = 1) {
    const ventana = await this.verificarVentanaServicio24h(conversacionId, empresaId);
    if (!ventana.activa) {
      throw new BadRequestException(
        'Ventana de atención de 24 horas cerrada. Para evitar cobros adicionales de marketing de Meta, solo puedes contestar cuando el cliente te haya escrito en las últimas 24 horas.',
      );
    }

    const { metaToken, apiVersion, phoneId } = await this.getMetaCatalogContext(empresaId);

    if (!texto || !texto.trim()) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }

    // Obtener teléfono del cliente
    const convRows = await this.dataSource.query(
      `SELECT t.whatsapp, t.telefono
       FROM public.conversacion c
       JOIN public.tercero t ON t.id_tercero = c.tercero_id
       WHERE c.id_conversacion = $1 AND c.empresa_id = $2;`,
      [conversacionId, empresaId],
    );

    const conv = convRows[0];
    const phone = conv?.whatsapp || conv?.telefono;
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      throw new BadRequestException('No se encontró número de WhatsApp para este contacto');
    }

    try {
      // 1. Enviar por Meta WhatsApp Cloud API
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { body: texto.trim() },
        }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        const errText = data.error?.message || JSON.stringify(data);
        this.logger.error(`[Chat] Error enviando mensaje a WhatsApp: ${errText}`);
        throw new Error(errText);
      }

      const wamid = data.messages?.[0]?.id;

      // 2. Persistir en public.mensaje
      const insertRes = await this.dataSource.query(
        `INSERT INTO public.mensaje (empresa_id, conversacion_id, direccion, tipo, contenido, metadata, created_at)
         VALUES ($1, $2, 'outbound', 'text', $3, $4, NOW())
         RETURNING id_mensaje, created_at;`,
        [empresaId, conversacionId, texto.trim(), JSON.stringify({ wamid, origen: 'crm_asesor' })],
      );

      // 3. Actualizar conversación
      await this.dataSource.query(
        `UPDATE public.conversacion
         SET fecha_ultima_interaccion = NOW(), updated_at = NOW()
         WHERE id_conversacion = $1;`,
        [conversacionId],
      );

      return {
        ok: true,
        id: Number(insertRes[0]?.id_mensaje),
        wamid,
        hora: new Date(insertRes[0]?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        texto: texto.trim(),
      };
    } catch (err: any) {
      this.logger.error(`[Chat] Error al enviar mensaje: ${err.message}`);
      throw new BadRequestException(`No se pudo enviar el mensaje por WhatsApp: ${err.message}`);
    }
  }

  /**
   * Envía un Producto Individual (Single Product Message - SPM) por WhatsApp.
   * Valida estrictamente la ventana de servicio de 24h.
   */
  async enviarProductoChat(conversacionId: number, dto: any, empresaId = 1) {
    const ventana = await this.verificarVentanaServicio24h(conversacionId, empresaId);
    if (!ventana.activa) {
      throw new BadRequestException(
        'Ventana de atención de 24 horas cerrada. Para evitar cobros adicionales de marketing de Meta, solo puedes contestar cuando el cliente te haya escrito en las últimas 24 horas.',
      );
    }

    if (!dto.codigo_interno) {
      throw new BadRequestException('Debes especificar el código interno del producto');
    }

    const prodRows = await this.dataSource.query(
      `SELECT id_producto, codigo_interno, nombre, COALESCE(precio_impuesto, precio_base, 0) AS precio, fb_product_id
       FROM public.producto
       WHERE codigo_interno = $1 AND empresa_id = $2;`,
      [dto.codigo_interno, empresaId],
    );

    const prod = prodRows[0];
    if (!prod) {
      throw new BadRequestException(`No se encontró el producto con código ${dto.codigo_interno}`);
    }
    if (!prod.fb_product_id) {
      throw new BadRequestException(`El producto "${prod.nombre}" no está sincronizado con Meta Catalog`);
    }

    const { metaToken, apiVersion, phoneId, catalogId } = await this.getMetaCatalogContext(empresaId);

    const convRows = await this.dataSource.query(
      `SELECT t.whatsapp, t.telefono
       FROM public.conversacion c
       JOIN public.tercero t ON t.id_tercero = c.tercero_id
       WHERE c.id_conversacion = $1 AND c.empresa_id = $2;`,
      [conversacionId, empresaId],
    );

    const conv = convRows[0];
    const cleanPhone = (conv?.whatsapp || conv?.telefono || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      throw new BadRequestException('No se encontró número de WhatsApp para este contacto');
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'interactive',
      interactive: {
        type: 'product',
        body: {
          text: dto.texto?.trim() || `Aquí tienes los detalles de ${prod.nombre}:`,
        },
        footer: {
          text: 'ChatConnect Ferretería',
        },
        action: {
          catalog_id: catalogId,
          product_retailer_id: prod.codigo_interno,
        },
      },
    };

    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${metaToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json();
    if (!res.ok) {
      const errText = data.error?.message || JSON.stringify(data);
      this.logger.error(`[ChatSPM] Error enviando producto a WhatsApp: ${errText}`);
      throw new BadRequestException(`Error de Meta al enviar producto: ${errText}`);
    }

    const wamid = data.messages?.[0]?.id;

    const insertRes = await this.dataSource.query(
      `INSERT INTO public.mensaje (empresa_id, conversacion_id, direccion, tipo, contenido, metadata, created_at)
       VALUES ($1, $2, 'outbound', 'interactive', $3, $4, NOW())
       RETURNING id_mensaje, created_at;`,
      [
        empresaId,
        conversacionId,
        `📦 Producto enviado: ${prod.nombre} (${prod.codigo_interno}) - $${Number(prod.precio).toLocaleString('es-CO')}`,
        JSON.stringify({
          wamid,
          tipo_interactivo: 'product',
          producto_id: prod.id_producto,
          codigo_interno: prod.codigo_interno,
          nombre: prod.nombre,
        }),
      ],
    );

    await this.dataSource.query(
      `UPDATE public.conversacion
       SET fecha_ultima_interaccion = NOW(), updated_at = NOW()
       WHERE id_conversacion = $1;`,
      [conversacionId],
    );

    return {
      ok: true,
      id: Number(insertRes[0]?.id_mensaje),
      wamid,
      hora: new Date(insertRes[0]?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      texto: `📦 Producto enviado: ${prod.nombre} (${prod.codigo_interno})`,
      producto: prod.nombre,
    };
  }

  /**
   * Envía productos agrupados por 1 o varias categorías (Multi-Product Message - MPM).
   * Valida estrictamente la ventana de servicio de 24 horas.
   */
  async enviarCategoriasChat(conversacionId: number, dto: any, empresaId = 1) {
    const ventana = await this.verificarVentanaServicio24h(conversacionId, empresaId);
    if (!ventana.activa) {
      throw new BadRequestException(
        'Ventana de atención de 24 horas cerrada. Para evitar cobros adicionales de marketing de Meta, solo puedes contestar cuando el cliente te haya escrito en las últimas 24 horas.',
      );
    }

    const catIds = Array.isArray(dto.categoria_ids) ? dto.categoria_ids.map(Number).filter(Boolean) : [];
    if (catIds.length === 0) {
      throw new BadRequestException('Debes seleccionar al menos una categoría');
    }

    const placeholders = catIds.map((_id: number, i: number) => `$${i + 2}`).join(',');
    const prodRows = await this.dataSource.query(
      `SELECT
         c.id_categoria,
         c.nombre AS categoria,
         p.id_producto,
         p.codigo_interno,
         p.nombre AS producto
       FROM public.producto p
       INNER JOIN public.categoria c ON c.id_categoria = p.categoria_id
       WHERE p.empresa_id = $1 AND p.fb_product_id IS NOT NULL AND c.id_categoria IN (${placeholders})
       ORDER BY c.nombre, p.id_producto ASC;`,
      [empresaId, ...catIds],
    );

    if (prodRows.length === 0) {
      throw new BadRequestException('Las categorías seleccionadas no tienen productos aprobados en Meta');
    }

    const sectionsMap = new Map<string, { product_retailer_id: string }[]>();
    let totalItems = 0;

    for (const r of prodRows) {
      const catTitle = (r.categoria || 'Productos').substring(0, 24);
      if (!sectionsMap.has(catTitle)) {
        if (sectionsMap.size >= 10) continue;
        sectionsMap.set(catTitle, []);
      }
      const items = sectionsMap.get(catTitle)!;
      if (items.length < 10 && totalItems < 30) {
        items.push({ product_retailer_id: r.codigo_interno });
        totalItems++;
      }
    }

    const sections = Array.from(sectionsMap.entries())
      .filter(([, items]) => items.length > 0)
      .map(([title, product_items]) => ({ title, product_items }));

    if (sections.length === 0) {
      throw new BadRequestException('No se pudieron construir las secciones del catálogo');
    }

    const { metaToken, apiVersion, phoneId, catalogId } = await this.getMetaCatalogContext(empresaId);

    const convRows = await this.dataSource.query(
      `SELECT t.whatsapp, t.telefono
       FROM public.conversacion c
       JOIN public.tercero t ON t.id_tercero = c.tercero_id
       WHERE c.id_conversacion = $1 AND c.empresa_id = $2;`,
      [conversacionId, empresaId],
    );

    const conv = convRows[0];
    const cleanPhone = (conv?.whatsapp || conv?.telefono || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      throw new BadRequestException('No se encontró número de WhatsApp para este contacto');
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'interactive',
      interactive: {
        type: 'product_list',
        header: {
          type: 'text',
          text: (dto.titulo?.trim() || 'Catálogo de Productos').substring(0, 60),
        },
        body: {
          text: dto.texto?.trim() || 'Consulta los artículos disponibles en las siguientes categorías y realiza tu pedido directo:',
        },
        footer: {
          text: 'ChatConnect Ferretería',
        },
        action: {
          catalog_id: catalogId,
          sections,
        },
      },
    };

    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${metaToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json();
    if (!res.ok) {
      const errText = data.error?.message || JSON.stringify(data);
      this.logger.error(`[ChatMPM] Error enviando categorías a WhatsApp: ${errText}`);
      throw new BadRequestException(`Error de Meta al enviar catálogo: ${errText}`);
    }

    const wamid = data.messages?.[0]?.id;
    const catNombres = Array.from(sectionsMap.keys()).join(', ');

    const insertRes = await this.dataSource.query(
      `INSERT INTO public.mensaje (empresa_id, conversacion_id, direccion, tipo, contenido, metadata, created_at)
       VALUES ($1, $2, 'outbound', 'interactive', $3, $4, NOW())
       RETURNING id_mensaje, created_at;`,
      [
        empresaId,
        conversacionId,
        `📦 Catálogo enviado (${sections.length} categorías: ${catNombres} - ${totalItems} productos)`,
        JSON.stringify({
          wamid,
          tipo_interactivo: 'product_list',
          secciones: sections.length,
          categorias: catNombres,
          total_productos: totalItems,
        }),
      ],
    );

    await this.dataSource.query(
      `UPDATE public.conversacion
       SET fecha_ultima_interaccion = NOW(), updated_at = NOW()
       WHERE id_conversacion = $1;`,
      [conversacionId],
    );

    return {
      ok: true,
      id: Number(insertRes[0]?.id_mensaje),
      wamid,
      hora: new Date(insertRes[0]?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      texto: `📦 Catálogo enviado (${sections.length} categorías: ${catNombres} - ${totalItems} productos)`,
      categorias_enviadas: sections.length,
      productos_enviados: totalItems,
    };
  }

  /**
   * Envía automáticamente el catálogo multi-categoría dividido en secciones a la conversación.
   */
  async enviarCatalogoMultiCategoria(conversacionId: number, empresaId = 1) {
    const ventana = await this.verificarVentanaServicio24h(conversacionId, empresaId);
    if (!ventana.activa) {
      throw new BadRequestException(
        'Ventana de atención de 24 horas cerrada. Para evitar cobros adicionales de marketing de Meta, solo puedes contestar cuando el cliente te haya escrito en las últimas 24 horas.',
      );
    }

    const convRows = await this.dataSource.query(
      `SELECT t.whatsapp, t.telefono
       FROM public.conversacion c
       JOIN public.tercero t ON t.id_tercero = c.tercero_id
       WHERE c.id_conversacion = $1 AND c.empresa_id = $2;`,
      [conversacionId, empresaId],
    );

    const conv = convRows[0];
    const phone = conv?.whatsapp || conv?.telefono;
    if (!phone) {
      throw new BadRequestException('No se encontró número de WhatsApp para este contacto');
    }

    return await this.enviarColeccionWhatsApp(
      {
        telefono: phone,
        nombreColeccion: 'Catálogo por Categorías',
        tipoMensaje: 'multi_seccion',
        titulo: 'Catálogo de Productos',
        cuerpo: 'Explora nuestras colecciones organizadas por categoría y realiza tu pedido directo:',
        conversacionId,
        empresa_id: empresaId,
      },
      empresaId,
    );
  }
}

