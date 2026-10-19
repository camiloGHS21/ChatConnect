import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Secuencia (`public.secuencia`)
 * =============================================================================
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
  prefijo?: string | null;

  @Column({ type: 'bigint', name: 'consecutivo_actual', default: 0 })
  consecutivoActual: number;

  @Column({ type: 'integer', name: 'longitud', default: 6 })
  longitud: number;

  @Column({ type: 'varchar', length: 30, name: 'estado', default: 'activo' })
  estado: string;
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
