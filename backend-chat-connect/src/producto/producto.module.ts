import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoController } from './controllers/producto.controller.js';
import { ProductoRepository } from './repositories/producto.repository.js';
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
} from './models/producto.model.js';
import { DatabaseModule } from '../database/database.module.js';

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
    ]),
  ],
  controllers: [ProductoController],
  providers: [ProductoRepository],
  exports: [ProductoRepository],
})
export class ProductoModule { }
