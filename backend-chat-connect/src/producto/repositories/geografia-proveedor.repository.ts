import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import {
  DepartamentoModel,
  CiudadModel,
  AtributoModel,
  AtributoComponenteModel,
} from '../models/producto.model.js';

@Injectable()
export class GeografiaProveedorRepository {
  private readonly logger = new Logger(GeografiaProveedorRepository.name);

  constructor(
    @InjectRepository(DepartamentoModel)
    private readonly departamentoRepo: Repository<DepartamentoModel>,

    @InjectRepository(CiudadModel)
    private readonly ciudadRepo: Repository<CiudadModel>,

    @InjectRepository(AtributoModel)
    private readonly atributoRepo: Repository<AtributoModel>,

    @InjectRepository(AtributoComponenteModel)
    private readonly componenteRepo: Repository<AtributoComponenteModel>,

    private readonly dataSource: DataSource,
  ) { }

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

  private normalizarTipoTercero(val?: string): string {
    const v = String(val || '').toLowerCase();
    if (v === 'proveedor' || v === 'cliente' || v === 'ambos') return v;
    return 'proveedor';
  }

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
}
