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
 * MODELO / ENTIDAD TYPEORM: Departamento (`public.departamento`)
 * =============================================================================
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
