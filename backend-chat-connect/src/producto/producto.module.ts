import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoController } from './controllers/producto.controller.js';
import { ProductoRepository } from './repositories/producto.repository.js';
import { CatalogoRepository } from './repositories/catalogo.repository.js';
import { CatalogoConfigRepository } from './repositories/catalogo-config.repository.js';
import { GeografiaProveedorRepository } from './repositories/geografia-proveedor.repository.js';
import { ProductoQueryRepository } from './repositories/producto-query.repository.js';
import { ProductoCreateRepository } from './repositories/producto-create.repository.js';
import { ProductoUpdateRepository } from './repositories/producto-update.repository.js';
import { ProductoDeleteRepository } from './repositories/producto-delete.repository.js';
import { MetaSyncRepository } from './repositories/meta-sync.repository.js';
import { MetaCatalogRepository } from './repositories/meta-catalog.repository.js';
import { MetaColeccionRepository } from './repositories/meta-coleccion.repository.js';
import { ChatWhatsappRepository } from './repositories/chat-whatsapp.repository.js';
import { ChatCatalogoRepository } from './repositories/chat-catalogo.repository.js';
import { EmpresaLimpiezaController } from './controllers/empresa-limpieza.controller.js';
import { EmpresaLimpiezaRepository } from './repositories/empresa-limpieza.repository.js';
import {
  ProductoModel,
  CategoriaModel,
  SubcategoriaModel,
  MarcaModel,
  ImpuestoModel,
  ListaPrecioModel,
  AtributoModel,
  AtributoComponenteModel,
  SecuenciaModel,
  CanalModel,
  DepartamentoModel,
  CiudadModel,
  PedidoModel,
  PedidoDetalleModel,
  PedidoDetalleImpuestoModel,
  PedidoEstadoModel,
} from './models/producto.model.js';
import { DatabaseModule } from '../database/database.module.js';

const repositories = [
  ProductoRepository,
  CatalogoRepository,
  CatalogoConfigRepository,
  GeografiaProveedorRepository,
  ProductoQueryRepository,
  ProductoCreateRepository,
  ProductoUpdateRepository,
  ProductoDeleteRepository,
  MetaSyncRepository,
  MetaCatalogRepository,
  MetaColeccionRepository,
  ChatWhatsappRepository,
  ChatCatalogoRepository,
  EmpresaLimpiezaRepository,
];

/**
 * ============================================================================
 * MÓDULO DE PRODUCTOS (Controller ──► Repository ──► PostgreSQL)
 * ============================================================================
 * Estructurado con TypeORM Repository Pattern idéntico a LoginModule (SIN Service).
 */
@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      ProductoModel,
      CategoriaModel,
      SubcategoriaModel,
      MarcaModel,
      ImpuestoModel,
      ListaPrecioModel,
      AtributoModel,
      AtributoComponenteModel,
      SecuenciaModel,
      CanalModel,
      DepartamentoModel,
      CiudadModel,
      PedidoModel,
      PedidoDetalleModel,
      PedidoDetalleImpuestoModel,
      PedidoEstadoModel,
    ]),
  ],
  controllers: [ProductoController, EmpresaLimpiezaController],
  providers: repositories,
  exports: repositories,
})
export class ProductoModule { }
