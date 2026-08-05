import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionInstitucionalEntity } from './infrastructure/persistence/configuracion-institucional.entity';
import { TypeOrmConfiguracionInstitucionalRepository } from './infrastructure/persistence/typeorm-configuracion-institucional.repository';
import { CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN } from './domain/ports/configuracion-institucional.repository.interface';
import { ObtenerConfiguracionInstitucionalUseCase } from './application/use-cases/obtener-configuracion-institucional/obtener-configuracion-institucional.use-case';
import { ActualizarConfiguracionInstitucionalUseCase } from './application/use-cases/actualizar-configuracion-institucional/actualizar-configuracion-institucional.use-case';
import { ObtenerConfiguracionPublicaUseCase } from './application/use-cases/obtener-configuracion-publica/obtener-configuracion-publica.use-case';
import {
  ConfiguracionInstitucionalController,
  ConfiguracionInstitucionalPublicController,
} from './infrastructure/controllers/configuracion-institucional.controller';
import { ConfiguracionInstitucionalSeeder } from './infrastructure/persistence/configuracion-institucional.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionInstitucionalEntity])],
  controllers: [ConfiguracionInstitucionalController, ConfiguracionInstitucionalPublicController],
  providers: [
    ObtenerConfiguracionInstitucionalUseCase,
    ActualizarConfiguracionInstitucionalUseCase,
    ObtenerConfiguracionPublicaUseCase,
    ConfiguracionInstitucionalSeeder,
    {
      provide: CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN,
      useClass: TypeOrmConfiguracionInstitucionalRepository,
    },
  ],
  exports: [ObtenerConfiguracionInstitucionalUseCase, ObtenerConfiguracionPublicaUseCase],
})
export class ConfiguracionInstitucionalModule {}
