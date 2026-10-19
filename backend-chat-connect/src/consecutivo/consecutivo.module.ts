import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsecutivoController } from './controllers/consecutivo.controller.js';
import { ConsecutivoModel } from './models/consecutivo.model.js';
import { ConsecutivoRepository } from './repositories/consecutivo.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([ConsecutivoModel])],
  controllers: [ConsecutivoController],
  providers: [ConsecutivoRepository],
  exports: [ConsecutivoRepository],
})
export class ConsecutivoModule {}
