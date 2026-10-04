import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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
