import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type RetencionGrupo = 'RENTA' | 'IVA' | 'ICA' | 'OTRO';
export type RetencionBase = 'PAGO' | 'IVA' | 'AIU' | 'ESPECIAL';
export type RetencionEstado = 'activo' | 'inactivo';

@Entity('retencion', { schema: 'public' })
@Index('retencion_empresa_nombre_unique', ['empresaId', 'nombre'], { unique: true })
@Index('retencion_empresa_codigo_unique', ['empresaId', 'codigo'], {
  unique: true,
  where: 'codigo IS NOT NULL',
})
export class RetencionModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_retencion' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 30, default: 'activo' })
  estado: RetencionEstado;

  @Column({ type: 'varchar', length: 80, nullable: true })
  codigo: string | null;

  @Column({ type: 'varchar', length: 10, default: 'OTRO' })
  grupo: RetencionGrupo;

  @Column({ type: 'varchar', length: 30, default: 'PORCENTAJE' })
  tipo: string;

  @Column({ type: 'numeric', precision: 9, scale: 4, nullable: true })
  porcentaje: number | null;

  @Column({ type: 'varchar', length: 10, name: 'base_calculo', default: 'ESPECIAL' })
  baseCalculo: RetencionBase;

  @Column({ type: 'numeric', precision: 14, scale: 4, name: 'base_minima_uvt', nullable: true })
  baseMinimaUvt: number | null;

  @Column({ type: 'text', nullable: true })
  condicion: string | null;

  @Column({ type: 'text', nullable: true })
  norma: string | null;

  @Column({ type: 'text', name: 'fuente_url', nullable: true })
  fuenteUrl: string | null;

  @Column({ type: 'boolean', default: true })
  seleccionable: boolean;

  @Column({ type: 'date', name: 'verificado_en', nullable: true })
  verificadoEn: string | null;
}
