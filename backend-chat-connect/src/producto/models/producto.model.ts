import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CategoriaModel, MarcaModel } from './catalogo.model.js';

// Re-export all models for seamless compatibility
export * from './catalogo.model.js';
export * from './atributo.model.js';
export * from './geografia.model.js';
export * from './canal-secuencia.model.js';

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
