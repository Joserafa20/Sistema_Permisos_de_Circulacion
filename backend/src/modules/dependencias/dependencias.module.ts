import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DependenciaEntity } from './infrastructure/persistence/dependencia.entity';
import { DependenciasController } from './infrastructure/controllers/dependencias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DependenciaEntity])],
  controllers: [DependenciasController],
})
export class DependenciasModule {}
