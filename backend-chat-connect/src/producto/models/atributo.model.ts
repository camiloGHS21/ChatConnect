import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
