import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { MotocicletaEntity } from './infrastructure/persistence/motocicleta.entity';
import { TypeOrmMotocicletaRepository } from './infrastructure/persistence/typeorm-motocicleta.repository';
import { MOTOCICLETA_REPOSITORY_TOKEN } from './domain/ports/motocicleta-repository.interface';
import { MotocicletaBusquedaService } from './application/services/motocicleta-busqueda.service';
import { ListarMotocicletasUseCase } from './application/use-cases/listar-motocicletas/listar-motocicletas.use-case';
import { ObtenerMotocicletaPorIdUseCase } from './application/use-cases/obtener-motocicleta-por-id/obtener-motocicleta-por-id.use-case';
import { ObtenerMotocicletaPorPlacaUseCase } from './application/use-cases/obtener-motocicleta-por-placa/obtener-motocicleta-por-placa.use-case';
import { MotocicletasController } from './infrastructure/controllers/motocicletas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MotocicletaEntity]), AuditoriaModule],
  controllers: [MotocicletasController],
  providers: [
    ListarMotocicletasUseCase,
    ObtenerMotocicletaPorIdUseCase,
    ObtenerMotocicletaPorPlacaUseCase,
    MotocicletaBusquedaService,
    {
      provide: MOTOCICLETA_REPOSITORY_TOKEN,
      useClass: TypeOrmMotocicletaRepository,
    },
  ],
  // MotocicletaBusquedaService exportado para que SolicitudesModule lo inyecte
  // con buscarPorPlaca() en el flujo de creación de solicitud (RN-18).
  exports: [MotocicletaBusquedaService],
})
export class MotocicletasModule {}
