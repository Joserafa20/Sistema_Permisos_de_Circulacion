import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotivoEntity } from './infrastructure/persistence/motivo.entity';
import { TypeOrmMotivoRepository } from './infrastructure/persistence/typeorm-motivo.repository';
import { MOTIVO_REPOSITORY_TOKEN } from './domain/ports/motivo-repository.interface';
import { MotivoBusquedaService } from './application/services/motivo-busqueda.service';

@Module({
  imports: [TypeOrmModule.forFeature([MotivoEntity])],
  providers: [
    MotivoBusquedaService,
    { provide: MOTIVO_REPOSITORY_TOKEN, useClass: TypeOrmMotivoRepository },
  ],
  // MotivoBusquedaService exportado para que SolicitudesModule lo inyecte
  // al validar motivoId activo en la creación de solicitudes.
  exports: [MotivoBusquedaService],
})
export class MotivosModule {}
