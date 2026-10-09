import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { InventarioController } from './controllers/inventario.controller.js';
import { InventarioRepository } from './repositories/inventario.repository.js';

@Module({
  imports: [DatabaseModule],
  controllers: [InventarioController],
  providers: [InventarioRepository],
  exports: [InventarioRepository],
})
export class InventarioModule {}
