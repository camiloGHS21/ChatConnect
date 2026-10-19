import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaController } from './controllers/empresa.controller.js';
import { EmpresaModel } from './models/empresa.model.js';
import { EmpresaRepository } from './repositories/empresa.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([EmpresaModel])],
  controllers: [EmpresaController],
  providers: [EmpresaRepository],
  exports: [EmpresaRepository],
})
export class EmpresaModule {}
