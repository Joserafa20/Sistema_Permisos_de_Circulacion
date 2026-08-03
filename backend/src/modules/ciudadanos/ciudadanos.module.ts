import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { CiudadanoEntity } from './infrastructure/persistence/ciudadano.entity';
import { SolicitudEntity } from '../solicitudes/infrastructure/persistence/solicitud.entity';
import { TypeOrmCiudadanoRepository } from './infrastructure/persistence/typeorm-ciudadano.repository';
import { CIUDADANO_REPOSITORY_TOKEN } from './domain/ports/ciudadano-repository.interface';
import { ListarCiudadanosUseCase } from './application/use-cases/listar-ciudadanos/listar-ciudadanos.use-case';
import { ObtenerCiudadanoPorIdUseCase } from './application/use-cases/obtener-ciudadano-por-id/obtener-ciudadano-por-id.use-case';
import { CiudadanosController } from './infrastructure/controllers/ciudadanos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CiudadanoEntity, SolicitudEntity]), AuditoriaModule],
  controllers: [CiudadanosController],
  providers: [
    ListarCiudadanosUseCase,
    ObtenerCiudadanoPorIdUseCase,
    {
      provide: CIUDADANO_REPOSITORY_TOKEN,
      useClass: TypeOrmCiudadanoRepository,
    },
  ],
})
export class CiudadanosModule {}
