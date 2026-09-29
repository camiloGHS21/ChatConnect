import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Categoria (`public.categoria`)
 * =============================================================================
 */
@Entity('categoria', { schema: 'public' })
export class CategoriaModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_categoria' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Subcategoria (`public.subcategoria`)
 * =============================================================================
 */
@Entity('subcategoria', { schema: 'public' })
export class SubcategoriaModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_subcategoria' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'bigint', name: 'categoria_id' })
  categoriaId: number;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Marca (`public.marca`)
 * =============================================================================
 */
@Entity('marca', { schema: 'public' })
export class MarcaModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_marca' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Impuesto (`public.impuesto`)
 * =============================================================================
 */
@Entity('impuesto', { schema: 'public' })
export class ImpuestoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_impuesto' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 20, name: 'codigo' })
  codigo: string;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'numeric', precision: 8, scale: 4, name: 'porcentaje', default: 0 })
  porcentaje: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'valor', nullable: true })
  valor?: number;

  @Column({ type: 'varchar', length: 30, name: 'tipo', default: 'PORCENTAJE' })
  tipo: string;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: ListaPrecio (`public.lista_precio`)
 * =============================================================================
 * NOTA: La tabla lista_precio NO tiene columnas created_at / updated_at
 * según el esquema DOC 02.
 */
@Entity('lista_precio', { schema: 'public' })
export class ListaPrecioModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_lista_precio' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Atributo (`public.atributo`)
 * =============================================================================
 */
@Entity('atributo', { schema: 'public' })
export class AtributoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_atributo' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 50, name: 'codigo' })
  codigo: string;

  @Column({ type: 'text', name: 'descripcion', nullable: true })
  descripcion?: string;

  @Column({ type: 'boolean', name: 'permite_multiples', default: true })
  permiteMultiples: boolean;

  @Column({ type: 'boolean', name: 'genera_variante', default: true })
  generaVariante: boolean;

  @Column({ type: 'boolean', name: 'obligatorio', default: false })
  obligatorio: boolean;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: AtributoComponente (`public.atributo_componente`)
 * =============================================================================
 */
@Entity('atributo_componente', { schema: 'public' })
export class AtributoComponenteModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_atributo_componente' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'bigint', name: 'atributo_id' })
  atributoId: number;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 50, name: 'codigo' })
  codigo: string;

  @Column({ type: 'varchar', length: 150, name: 'valor', nullable: true })
  valor?: string;

  @Column({ type: 'text', name: 'descripcion', nullable: true })
  descripcion?: string;

  @Column({ type: 'integer', name: 'orden', default: 1 })
  orden: number;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Secuencia (`public.secuencia`)
 * =============================================================================
 * DOC 02: id, empresa_id, modulo, prefijo, consecutivo_actual, longitud, estado.
 * La tabla se llama `secuencia` (NO `secuencia_empresa`).
 */
@Entity('secuencia', { schema: 'public' })
export class SecuenciaModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_secuencia' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 100, name: 'modulo' })
  modulo: string;

  @Column({ type: 'varchar', length: 50, name: 'prefijo', nullable: true })
  prefijo?: string;

  @Column({ type: 'bigint', name: 'consecutivo_actual', default: 0 })
  consecutivoActual: number;

  @Column({ type: 'integer', name: 'longitud', default: 6 })
  longitud: number;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Producto (`public.producto`)
 * =============================================================================
 */
@Entity('producto', { schema: 'public' })
export class ProductoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_producto' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'bigint', name: 'categoria_id', nullable: true })
  categoriaId?: number;

  @Column({ type: 'bigint', name: 'subcategoria_id', nullable: true })
  subcategoriaId?: number;

  @Column({ type: 'bigint', name: 'marca_id', nullable: true })
  marcaId?: number;

  @Column({ type: 'varchar', length: 50, name: 'codigo_interno', nullable: true })
  codigoInterno?: string;

  @Column({ type: 'varchar', length: 250, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 500, name: 'descripcion_corta', nullable: true })
  descripcionCorta?: string;

  @Column({ type: 'text', name: 'descripcion_larga', nullable: true })
  descripcionLarga?: string;

  @Column({ type: 'text', name: 'ficha_tecnica', nullable: true })
  fichaTecnica?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'costo_base', default: 0 })
  costoBase: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'costo_impuesto', default: 0 })
  costoImpuesto: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'precio_base', default: 0 })
  precioBase: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'precio_impuesto', default: 0 })
  precioImpuesto: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'utilidad_valor', default: 0 })
  utilidadValor: number;

  @Column({ type: 'numeric', precision: 8, scale: 4, name: 'utilidad_porcentaje', default: 0 })
  utilidadPorcentaje: number;

  @Column({ type: 'boolean', name: 'maneja_inventario', default: true })
  manejaInventario: boolean;

  @Column({ type: 'bigint', name: 'tipo_inventario_id', nullable: true })
  tipoInventarioId?: number;

  @Column({ type: 'integer', name: 'stock_minimo', default: 0 })
  stockMinimo: number;

  @Column({ type: 'integer', name: 'stock_maximo', default: 0 })
  stockMaximo: number;

  @Column({ type: 'bigint', name: 'medida_id', nullable: true })
  medidaId?: number;

  @Column({ type: 'varchar', length: 100, name: 'presentacion', nullable: true })
  presentacion?: string;

  @Column({ type: 'varchar', length: 30, name: 'estado_producto', default: 'activo' })
  estadoProducto: string;

  @Column({ type: 'varchar', length: 30, name: 'estado_publicacion', default: 'publicado' })
  estadoPublicacion: string;

  @Column({ type: 'varchar', length: 100, name: 'fb_product_id', nullable: true })
  fbProductId?: string;

  @Column({ type: 'varchar', length: 30, name: 'meta_sync_status', default: 'pendiente' })
  metaSyncStatus: string;

  @Column({ type: 'text', name: 'meta_sync_error', nullable: true })
  metaSyncError?: string;

  @Column({ type: 'timestamp with time zone', name: 'meta_synced_at', nullable: true })
  metaSyncedAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CategoriaModel)
  @JoinColumn({ name: 'categoria_id' })
  categoria?: CategoriaModel;

  @ManyToOne(() => MarcaModel)
  @JoinColumn({ name: 'marca_id' })
  marca?: MarcaModel;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Canal (`public.canal`)
 * =============================================================================
 */
@Entity('canal', { schema: 'public' })
export class CanalModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_canal' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 50, name: 'tipo', default: 'whatsapp' })
  tipo: string;

  @Column({ type: 'varchar', length: 50, name: 'proveedor', default: 'meta' })
  proveedor: string;

  @Column({ type: 'varchar', length: 50, name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 100, name: 'phone_number_id', nullable: true })
  phoneNumberId?: string;

  @Column({ type: 'varchar', length: 100, name: 'waba_id', nullable: true })
  wabaId?: string;

  @Column({ type: 'varchar', length: 100, name: 'business_account_id', nullable: true })
  businessAccountId?: string;

  @Column({ type: 'varchar', length: 100, name: 'app_id', nullable: true })
  appId?: string;

  @Column({ type: 'varchar', length: 100, name: 'catalog_id', nullable: true })
  catalogId?: string;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @Column({ type: 'jsonb', name: 'configuracion', nullable: true })
  configuracion?: any;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Departamento (`public.departamento`)
 * =============================================================================
 * Catálogo geográfico base. Relación 1:N con Ciudad.
 */
@Entity('departamento', { schema: 'public' })
export class DepartamentoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 20, name: 'codigo' })
  codigo: string;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Ciudad (`public.ciudad`)
 * =============================================================================
 * Pertenece a un departamento (relación N:1 → DepartamentoModel).
 */
@Entity('ciudad', { schema: 'public' })
export class CiudadModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column({ type: 'bigint', name: 'id_departamento' })
  idDepartamento: number;

  @Column({ type: 'varchar', length: 20, name: 'codigo' })
  codigo: string;

  @Column({ type: 'varchar', length: 150, name: 'nombre' })
  nombre: string;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => DepartamentoModel)
  @JoinColumn({ name: 'id_departamento' })
  departamento?: DepartamentoModel;
}
