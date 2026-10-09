import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ClienteController } from './controllers/cliente.controller.js';
import { ClienteRepository } from './repositories/cliente.repository.js';

@Module({
  imports: [DatabaseModule],
  controllers: [ClienteController],
  providers: [ClienteRepository],
  exports: [ClienteRepository],
})
export class ClienteModule {}
