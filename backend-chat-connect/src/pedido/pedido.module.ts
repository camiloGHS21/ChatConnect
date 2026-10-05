import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoController } from './controllers/pedido.controller.js';
import { PedidoRepository } from './repositories/pedido.repository.js';
import {
  PedidoModel,
  PedidoDetalleModel,
  PedidoDetalleImpuestoModel,
  PedidoEstadoModel,
  TerceroPedidoModel,
  ProductoPedidoModel,
} from './models/pedido.model.js';
import { DatabaseModule } from '../database/database.module.js';

/**
 * ============================================================================
 * MÓDULO DE PEDIDOS (Controller ──► Repository ──► PostgreSQL)
 * ============================================================================
 * Registra entidades TypeORM para pedidos, detalles e historial de estados.
 * Inyecta directamente PedidoRepository sin capa Service intermedia.
 */
@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      PedidoModel,
      PedidoDetalleModel,
      PedidoDetalleImpuestoModel,
      PedidoEstadoModel,
      TerceroPedidoModel,
      ProductoPedidoModel,
    ]),
  ],
  controllers: [PedidoController],
  providers: [PedidoRepository],
  exports: [PedidoRepository, TypeOrmModule],
})
export class PedidoModule {}
