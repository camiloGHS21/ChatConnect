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
 * MODELO TYPEORM: TerceroPedidoModel (`public.tercero`)
 * =============================================================================
 * Proyección liviana del tercero para consultas optimizadas de pedidos.
 */
@Entity('tercero', { schema: 'public' })
export class TerceroPedidoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_tercero' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 150, name: 'nombre', nullable: true })
  nombre: string | null;

  @Column({ type: 'varchar', length: 150, name: 'apellido', nullable: true })
  apellido: string | null;

  @Column({ type: 'varchar', length: 200, name: 'razon_social', nullable: true })
  razonSocial: string | null;

  @Column({ type: 'varchar', length: 150, name: 'email', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, name: 'telefono', nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 30, name: 'whatsapp', nullable: true })
  whatsapp: string | null;

  @Column({ type: 'text', name: 'direccion', nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 100, name: 'ciudad', nullable: true })
  ciudad: string | null;

  @Column({ type: 'varchar', length: 100, name: 'departamento', nullable: true })
  departamento: string | null;
}

/**
 * =============================================================================
 * MODELO TYPEORM: ProductoPedidoModel (`public.producto`)
 * =============================================================================
 * Proyección liviana del producto asociado al detalle del pedido.
 */
@Entity('producto', { schema: 'public' })
export class ProductoPedidoModel {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_producto' })
  id: number;

  @Column({ type: 'bigint', name: 'empresa_id' })
  empresaId: number;

  @Column({ type: 'varchar', length: 50, name: 'codigo_interno', nullable: true })
  codigoInterno: string | null;

  @Column({ type: 'varchar', length: 250, name: 'nombre' })
  nombre: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'precio_base', default: 0 })
  precioBase: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'precio_impuesto', default: 0 })
  precioImpuesto: number;
}

/**
 * =============================================================================
 * MODELO TYPEORM: PedidoModel (`public.pedido`)
 * =============================================================================
 * Entidad cabecera de la orden formalizada desde WhatsApp o CRM.
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

  @Column({ type: 'varchar', length: 50, name: 'numero_pedido' })
  numeroPedido: string;

  @Column({ type: 'varchar', length: 30, name: 'tipo_entrega', nullable: true })
  tipoEntrega: string | null;

  @Column({ type: 'text', name: 'direccion_entrega', nullable: true })
  direccionEntrega: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, name: 'latitud', nullable: true })
  latitud: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, name: 'longitud', nullable: true })
  longitud: number | null;

  @Column({ type: 'bigint', name: 'punto_venta_id', nullable: true })
  puntoVentaId: number | null;

  @Column({ type: 'date', name: 'fecha_entrega', nullable: true })
  fechaEntrega: string | null;

  @Column({ type: 'time', name: 'hora_entrega', nullable: true })
  horaEntrega: string | null;

  @Column({ type: 'date', name: 'fecha_recogida', nullable: true })
  fechaRecogida: string | null;

  @Column({ type: 'time', name: 'hora_recogida', nullable: true })
  horaRecogida: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'subtotal', default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'descuento', default: 0 })
  descuento: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'impuesto', default: 0 })
  impuesto: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'envio', default: 0 })
  envio: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'total', default: 0 })
  total: number;

  @Column({ type: 'varchar', length: 40, name: 'estado', default: 'pendiente' })
  estado: string;

  @Column({ type: 'text', name: 'nota', nullable: true })
  nota: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TerceroPedidoModel, { eager: true, nullable: true })
  @JoinColumn({ name: 'tercero_id' })
  tercero?: TerceroPedidoModel;

  @OneToMany(() => PedidoDetalleModel, (detalle) => detalle.pedido, { cascade: true })
  detalles: PedidoDetalleModel[];

  @OneToMany(() => PedidoEstadoModel, (estado) => estado.pedido, { cascade: true })
  estados: PedidoEstadoModel[];
}

/**
 * =============================================================================
 * MODELO TYPEORM: PedidoDetalleModel (`public.pedido_detalle`)
 * =============================================================================
 * Ítems o líneas de producto incluidas en cada pedido.
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

  @ManyToOne(() => ProductoPedidoModel, { eager: true, nullable: true })
  @JoinColumn({ name: 'producto_id' })
  producto?: ProductoPedidoModel;

  @OneToMany(() => PedidoDetalleImpuestoModel, (pdi) => pdi.pedidoDetalle, { cascade: true })
  impuestos: PedidoDetalleImpuestoModel[];
}

/**
 * =============================================================================
 * MODELO TYPEORM: PedidoDetalleImpuestoModel (`public.pedido_detalle_impuesto`)
 * =============================================================================
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
 * MODELO TYPEORM: PedidoEstadoModel (`public.pedido_estado`)
 * =============================================================================
 * Trazabilidad histórica de cambios de estado del pedido.
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

  @ManyToOne(() => PedidoModel, (pedido) => pedido.estados, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: PedidoModel;
}
