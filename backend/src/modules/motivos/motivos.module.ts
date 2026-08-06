import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotivoEntity } from './infrastructure/persistence/motivo.entity';
import { TypeOrmMotivoRepository } from './infrastructure/persistence/typeorm-motivo.repository';
import { MOTIVO_REPOSITORY_TOKEN } from './domain/ports/motivo-repository.interface';
import { MotivoBusquedaService } from './application/services/motivo-busqueda.service';
import { MotivosController } from './infrastructure/controllers/motivos.controller';
import { MotivosPublicController } from './infrastructure/controllers/motivos-public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MotivoEntity])],
  controllers: [MotivosController, MotivosPublicController],
  providers: [
    MotivoBusquedaService,
    { provide: MOTIVO_REPOSITORY_TOKEN, useClass: TypeOrmMotivoRepository },
  ],
  exports: [MotivoBusquedaService],
})
export class MotivosModule {}
