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
    if (!dto.departamento) return null;
    const depId = Number(dto.departamento_id);
    if (depId) {
      const dep = await this.departamentoRepo.findOne({ where: { id: depId } });
      if (dep) return dep.nombre;
    }
    const nombreDep = String(dto.departamento).trim();
    if (!nombreDep) return null;
    const dep = await this.crearDepartamento({ nombre: nombreDep });
    return dep.nombre;
  }

  /**
   * Resuelve el nombre de la ciudad desde su id (creándola si aún no existe).
   */
  private async resolverNombreCiudad(dto: any, empresaId: number): Promise<string | null> {
    if (!dto.ciudad) return null;
    const nombreDep = await this.resolverNombreDepartamento(dto, empresaId);
    const ciudadId = Number(dto.ciudad_id);
    if (ciudadId) {
      const ciu = await this.ciudadRepo.findOne({ where: { id: ciudadId } });
      if (ciu) return ciu.nombre;
    }
    const nombreCiudad = String(dto.ciudad).trim();
    if (!nombreCiudad) return null;

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
      return 'https://iili.io/nYMyIMF.png';
    }

    const trimmed = urlOPath.trim();

    // 1. Si ya es una URL pública HTTPS válida (que no sea localhost ni Unsplash genérico)
    if (
      /^https?:\/\//i.test(trimmed) &&
      !trimmed.includes('localhost') &&
      !trimmed.includes('127.0.0.1') &&
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

    return 'https://iili.io/nYMyIMF.png';
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
            if (varId && v.componentes && Array.isArray(v.componentes)) {
              for (const c of v.componentes) {
                const compId = Number(c.componenteId || c.id_atributo_componente);
                if (compId && !isNaN(compId)) {
                  await queryRunner.query(
                    `INSERT INTO public.variante_componente (producto_variante_id, atributo_componente_id)
                     VALUES ($1, $2)
                     ON CONFLICT DO NOTHING;`,
                    [varId, compId],
                  );
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
  async sincronizarConMetaCatalog(productoId: number, empresaId = 1) {
    const metaToken =
      process.env.META_PERMANENT_TOKEN ||
      process.env.META_SYSTEM_TOKEN ||
      process.env.META_ACCESS_TOKEN;
    const businessId = process.env.META_BUSINESS_ID;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';

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

      let catalogId = canal.catalog_id;

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
      let wabaId = canal.waba_id || canal.configuracion?.waba_id || process.env.META_WABA_ID;
      const phoneId = canal.phone_number_id || canal.configuracion?.phone_number_id;

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

      // 4. Consultar atributos y componentes configurados en el producto (Color, Voltaje, etc.)
      const attrRows = await this.dataSource.query(
        `SELECT
           a.id_atributo,
           LOWER(TRIM(a.nombre)) AS attr_nombre,
           LOWER(TRIM(a.codigo)) AS attr_codigo,
           ac.id_atributo_componente,
           ac.nombre AS comp_nombre,
           ac.codigo AS comp_codigo
         FROM public.producto_atributo pa
         JOIN public.atributo a ON a.id_atributo = pa.atributo_id
         JOIN public.producto_atributo_componente pac ON pac.producto_atributo_id = pa.id_producto_atributo
         JOIN public.atributo_componente ac ON ac.id_atributo_componente = pac.atributo_componente_id
         WHERE pa.producto_id = $1 AND pa.estado = 'activo' AND pac.estado = 'activo'
         ORDER BY pa.orden, pac.orden;`,
        [productoId],
      );

      const colorComps = attrRows
        .filter((r: any) => r.attr_nombre.includes('color') || r.attr_codigo.includes('color'))
        .map((r: any) => r.comp_nombre);

      const sizeComps = attrRows
        .filter((r: any) =>
          r.attr_nombre.includes('voltaje') ||
          r.attr_nombre.includes('talla') ||
          r.attr_nombre.includes('tamaño') ||
          r.attr_nombre.includes('tamano') ||
          r.attr_nombre.includes('medida') ||
          r.attr_codigo.includes('volt') ||
          r.attr_codigo.includes('talla')
        )
        .map((r: any) => r.comp_nombre);

      // 5. Consultar variantes registradas en PostgreSQL
      const varRows = await this.dataSource.query(
        `SELECT
           pv.id_producto_variante,
           pv.sku,
           pv.codigo_barras,
           pv.referencia,
           pv.precio,
           pv.estado,
           STRING_AGG(DISTINCT ac.nombre, ', ') AS componentes_nombres
         FROM public.producto_variante pv
         LEFT JOIN public.variante_componente vc ON vc.producto_variante_id = pv.id_producto_variante
         LEFT JOIN public.atributo_componente ac ON ac.id_atributo_componente = vc.atributo_componente_id
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

      const publicBaseUrl = process.env.PUBLIC_APP_URL || 'https://chatconnect.app';
      const productWebUrl = `${publicBaseUrl}/productos/${prod.id_producto}`;

      // Formatear descripción detallada para WhatsApp Catalog
      let descBase = (prod.descripcion_corta || prod.descripcion_larga || prod.nombre || '').trim();
      const detailsList: string[] = [];
      if (refPrincipal) detailsList.push(`🔖 Referencia: ${refPrincipal}`);
      if (catNombre) detailsList.push(`🏷️ Categoría: ${catNombre}`);
      if (subcatNombre) detailsList.push(`📁 Subcategoría: ${subcatNombre}`);
      if (prod.marca_nombre) detailsList.push(`🏷️ Marca: ${prod.marca_nombre}`);
      if (colorComps.length > 0) detailsList.push(`🎨 Color: ${colorComps.join(', ')}`);
      if (sizeComps.length > 0) detailsList.push(`⚡ Voltaje / Talla: ${sizeComps.join(', ')}`);
      if (prod.ficha_tecnica) detailsList.push(`\n📋 Ficha Técnica:\n${prod.ficha_tecnica}`);

      let fullDescription = descBase;
      if (detailsList.length > 0) {
        fullDescription = `${descBase}\n\n${detailsList.join('\n')}`.trim();
      }

      const mainColor = colorComps[0] || (colorComps.length > 0 ? colorComps.join(' / ') : undefined);
      const mainSize = sizeComps[0] || (sizeComps.length > 0 ? sizeComps.join(' / ') : undefined);
      const productTitle = (prod.nombre || 'Producto').substring(0, 100);

      let fbProductId = prod.fb_product_id;

      // 4. Consultar productos existentes en Meta para mapear FB IDs por retailer_id
      const existingMetaRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products?fields=id,retailer_id,name,item_group_id`, {
        headers: { Authorization: `Bearer ${metaToken}` },
      });
      const existingMetaData: any = await existingMetaRes.json();
      const existingItems: any[] = existingMetaData?.data || [];
      const existingByRetailer = new Map<string, string>();
      for (const it of existingItems) {
        if (it.retailer_id) existingByRetailer.set(it.retailer_id, it.id);
      }

      if (varRows && varRows.length > 0) {
        // EL PRODUCTO TIENE VARIANTES:
        // Cada variante se sube con el MISMO título ('name' y 'title') y el MISMO 'item_group_id',
        // con su 'color', 'size' y 'price' correspondientes para que WhatsApp las agrupe bajo una sola ficha.
        this.logger.log(`[MetaCatalog] Sincronizando ${varRows.length} variantes para producto ${productoId} ("${productTitle}")...`);

        // Si existe un producto base huérfano con retailer_id que no corresponde a una variante activa, eliminarlo de Meta
        const activeVarRetailerIds = new Set(varRows.map((v: any) => (v.sku || v.referencia || '').trim()).filter(Boolean));
        for (const it of existingItems) {
          if (it.retailer_id === retailerId && !activeVarRetailerIds.has(retailerId)) {
            await fetch(`https://graph.facebook.com/${apiVersion}/${it.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${metaToken}` },
            });
            this.logger.log(`✓ [MetaCatalog] Producto base duplicado ${it.id} retirado de Meta`);
          }
        }

        for (let vi = 0; vi < varRows.length; vi++) {
          const v = varRows[vi];
          const vRetailerId = (v.sku || v.referencia || `${retailerId}-VAR-${v.id_producto_variante}`).trim();

          let vColor = colorComps.find((c: string) =>
            (v.componentes_nombres || '').toLowerCase().includes(c.toLowerCase()) ||
            vRetailerId.toLowerCase().includes(c.toLowerCase().slice(0, 3))
          );
          if (!vColor && colorComps.length > 0) {
            vColor = colorComps[vi % colorComps.length];
          }

          let vSize = sizeComps.find((s: string) =>
            (v.componentes_nombres || '').toLowerCase().includes(s.toLowerCase()) ||
            vRetailerId.toLowerCase().includes(s.toLowerCase().replace(/[^a-z0-9]/g, ''))
          );
          if (!vSize && sizeComps.length > 0) {
            vSize = sizeComps[vi % sizeComps.length];
          }

          const vPrecio = Number(v.precio || precioFinalDeVenta);
          const vPriceInCents = Math.round(vPrecio * 100);

          const varPayload: any = {
            retailer_id: vRetailerId,
            item_group_id: itemGroupId,
            title: productTitle, // EXACTAMENTE el mismo título para agrupación nativa de variantes en WhatsApp
            name: productTitle,
            description: `${fullDescription}\n\nVariante: ${vRetailerId}\nColor: ${vColor || 'Estándar'}\nVoltaje/Talla: ${vSize || 'Estándar'}`.substring(0, 5000),
            availability: 'in stock',
            inventory: 15,
            condition: 'new',
            price: vPriceInCents,
            sale_price: vPriceInCents,
            currency: 'COP',
            image_url: imageUrl,
            brand: prod.marca_nombre || 'Genérica',
            category: subcatNombre || catNombre || 'General',
            product_type: taxonomyBreadcrumb,
            color: vColor || undefined,
            size: vSize || undefined,
            custom_label_0: catNombre.substring(0, 100),
            custom_label_1: subcatNombre.substring(0, 100),
            custom_label_2: vRetailerId.substring(0, 100),
            custom_label_3: (vColor || '').substring(0, 100) || undefined,
            custom_label_4: (vSize || '').substring(0, 100) || undefined,
            url: productWebUrl,
          };

          const existingVarId = existingByRetailer.get(vRetailerId);
          if (existingVarId) {
            await fetch(`https://graph.facebook.com/${apiVersion}/${existingVarId}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(varPayload),
            });
            if (vi === 0) fbProductId = existingVarId;
            this.logger.log(`✓ [MetaCatalog] Variante "${vRetailerId}" (${existingVarId}) actualizada con Precio de Venta COP ${vPrecio}`);
          } else {
            const createVarRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(varPayload),
            });
            const createVarData: any = await createVarRes.json();
            if (createVarData?.id) {
              if (vi === 0) fbProductId = createVarData.id;
              this.logger.log(`✓ [MetaCatalog] Variante "${vRetailerId}" subida exitosamente con FB ID: ${createVarData.id}`);
            }
          }
        }
      } else {
        // PRODUCTO SIMPLE (Sin variantes):
        const metaPayload: any = {
          retailer_id: retailerId,
          item_group_id: itemGroupId,
          title: productTitle,
          name: productTitle,
          description: fullDescription.substring(0, 5000),
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
          color: mainColor,
          size: mainSize,
          custom_label_0: catNombre.substring(0, 100),
          custom_label_1: subcatNombre.substring(0, 100),
          custom_label_2: refPrincipal.substring(0, 100),
          custom_label_3: colorComps.join(', ').substring(0, 100) || undefined,
          custom_label_4: sizeComps.join(', ').substring(0, 100) || undefined,
          url: productWebUrl,
        };

        if (fbProductId) {
          await fetch(`https://graph.facebook.com/${apiVersion}/${fbProductId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(metaPayload),
          });
          this.logger.log(`✓ [MetaCatalog] Producto simple ${productoId} actualizado en Meta con Precio de Venta COP ${precioFinalDeVenta}`);
        } else {
          const prodRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/products`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(metaPayload),
          });
          const prodData: any = await prodRes.json();
          if (prodData?.id) fbProductId = prodData.id;
          this.logger.log(`✓ [MetaCatalog] Producto simple ${productoId} subido en Meta con FB ID: ${fbProductId}`);
        }
      }

      // 5. Asegurar colecciones en Meta para la categoría y la subcategoría (Product Sets de WhatsApp)
      if (catalogId) {
        try {
          const setsRes = await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets?fields=id,name`, {
            headers: { Authorization: `Bearer ${metaToken}` },
          });
          const setsData: any = await setsRes.json();
          const existingSets = setsData?.data || [];

          if (catNombre && !existingSets.some((s: any) => s.name?.toLowerCase() === catNombre.toLowerCase())) {
            await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: catNombre,
                filter: { product_type: { contains: catNombre } },
              }),
            });
            this.logger.log(`✓ [MetaCatalog] Colección de Categoría "${catNombre}" creada en Meta`);
          }

          if (subcatNombre && !existingSets.some((s: any) => s.name?.toLowerCase() === subcatNombre.toLowerCase())) {
            await fetch(`https://graph.facebook.com/${apiVersion}/${catalogId}/product_sets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: subcatNombre,
                filter: { category: { eq: subcatNombre } },
              }),
            });
            this.logger.log(`✓ [MetaCatalog] Colección de Subcategoría "${subcatNombre}" creada en Meta`);
          }
        } catch (setErr: any) {
          this.logger.warn(`[MetaCatalog] Advertencia gestionando colecciones: ${setErr.message}`);
        }
      }

      // 6. ACTIVAR TIENDA Y CARRITO EN WHATSAPP (Se ejecuta DESPUÉS de subir/actualizar los productos)
      // Esto asegura que Meta evalúe la tienda con productos reales (>0) y nunca la oculte o desvincule.
      if (wabaId && catalogId) {
        try {
          await fetch(`https://graph.facebook.com/${apiVersion}/${wabaId}/product_catalogs`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ catalog_id: catalogId }),
          });
          this.logger.log(`✓ [MetaCatalog] Catálogo ${catalogId} vinculado a WABA ${wabaId}`);
        } catch (wabaLinkErr: any) {
          this.logger.warn(`[MetaCatalog] Error vinculando catálogo a WABA: ${wabaLinkErr.message}`);
        }
      }

      if (phoneId) {
        try {
          await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/whatsapp_commerce_settings`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${metaToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              is_cart_enabled: true,
              is_catalog_visible: true,
              catalog_id: catalogId,
            }),
          });
          this.logger.log(`✓ [MetaCatalog] Tienda y carrito activados en WhatsApp phone_number_id ${phoneId} con catalog_id ${catalogId}`);
        } catch (phoneErr: any) {
          this.logger.warn(`[MetaCatalog] Advertencia configurando WhatsApp Commerce: ${phoneErr.message}`);
        }
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
}
