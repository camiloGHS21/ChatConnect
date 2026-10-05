import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: Pedido (`public.pedido`)
 * =============================================================================
 */
@Entity('pedido', { schema: 'public' })
export class PedidoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_pedido' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'bigint', name: 'tercero_id' })
  terceroId: number;

  @Column({ type: 'bigint', name: 'conversacion_id', nullable: true })
  conversacionId: number | null;

  @Column({ type: 'bigint', name: 'canal_id', nullable: true })
  canalId: number | null;

  @Column({ type: 'varchar', length: 50, name: 'codigo_pedido' })
  codigoPedido: string;

  @Column({ type: 'varchar', length: 40, name: 'estado', default: 'PENDIENTE' })
  estado: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'subtotal', default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'descuento', default: 0 })
  descuento: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'impuesto', default: 0 })
  impuesto: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'total', default: 0 })
  total: number;

  @Column({ type: 'varchar', length: 50, name: 'metodo_pago', nullable: true })
  metodoPago: string | null;

  @Column({ type: 'varchar', length: 40, name: 'estado_pago', default: 'PENDIENTE' })
  estadoPago: string;

  @Column({ type: 'text', name: 'direccion_envio', nullable: true })
  direccionEnvio: string | null;

  @Column({ type: 'text', name: 'nota', nullable: true })
  nota: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PedidoDetalleModel, (detalle) => detalle.pedido)
  detalles: PedidoDetalleModel[];
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: PedidoDetalle (`public.pedido_detalle`)
 * =============================================================================
 * Representa la línea de producto en el pedido.
 * El campo `impuesto` almacena el total sumado de todos sus impuestos individuales.
 */
@Entity('pedido_detalle', { schema: 'public' })
export class PedidoDetalleModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_pedido_detalle' })
  id: number;

  @Column({ type: 'bigint', name: 'pedido_id' })
  pedidoId: number;

  @Column({ type: 'bigint', name: 'producto_id' })
  productoId: number;

  @Column({ type: 'integer', name: 'cantidad' })
  cantidad: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'precio_unitario' })
  precioUnitario: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'descuento', default: 0 })
  descuento: number;

  /** Total de la sumatoria de impuestos para este ítem */
  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'impuesto', default: 0 })
  impuesto: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'total' })
  total: number;

  @Column({ type: 'text', name: 'nota', nullable: true })
  nota: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PedidoModel, (pedido) => pedido.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: PedidoModel;

  /** Relación con los impuestos agregados a este ítem */
  @OneToMany(() => PedidoDetalleImpuestoModel, (pdi) => pdi.pedidoDetalle, { cascade: true })
  impuestos: PedidoDetalleImpuestoModel[];
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: PedidoDetalleImpuesto (`public.pedido_detalle_impuesto`)
 * =============================================================================
 * Almacena de forma granular cada impuesto individual aplicado a un ítem de pedido.
 */
@Entity('pedido_detalle_impuesto', { schema: 'public' })
export class PedidoDetalleImpuestoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_pedido_detalle_impuesto' })
  id: number;

  @Column({ type: 'bigint', name: 'pedido_detalle_id' })
  pedidoDetalleId: number;

  @Column({ type: 'bigint', name: 'impuesto_id' })
  impuestoId: number;

  @Column({ type: 'varchar', length: 100, name: 'nombre_impuesto' })
  nombreImpuesto: string;

  @Column({ type: 'varchar', length: 30, name: 'tipo', default: 'PORCENTAJE' })
  tipo: string;

  @Column({ type: 'numeric', precision: 9, scale: 4, name: 'porcentaje', nullable: true })
  porcentaje: number | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'valor_fijo', nullable: true })
  valorFijo: number | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'base_impuesto', default: 0 })
  baseImpuesto: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'valor_impuesto', default: 0 })
  valorImpuesto: number;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PedidoDetalleModel, (pd) => pd.impuestos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_detalle_id' })
  pedidoDetalle: PedidoDetalleModel;
}

/**
 * =============================================================================
 * MODELO / ENTIDAD TYPEORM: PedidoEstado (`public.pedido_estado`)
 * =============================================================================
 */
@Entity('pedido_estado', { schema: 'public' })
export class PedidoEstadoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_pedido_estado' })
  id: number;

  @Column({ type: 'bigint', name: 'pedido_id' })
  pedidoId: number;

  @Column({ type: 'varchar', length: 40, name: 'estado' })
  estado: string;

  @Column({ type: 'text', name: 'comentario', nullable: true })
  comentario: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PedidoModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: PedidoModel;
}
