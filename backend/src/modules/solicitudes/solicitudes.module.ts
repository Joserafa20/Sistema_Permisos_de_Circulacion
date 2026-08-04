import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { CiudadanosModule } from '../ciudadanos/ciudadanos.module';
import { MotocicletasModule } from '../motocicletas/motocicletas.module';
import { MotivosModule } from '../motivos/motivos.module';
import { SolicitudEntity } from './infrastructure/persistence/solicitud.entity';
import { HistorialEstadoEntity } from './infrastructure/persistence/historial-estado.entity';
import { DocumentoEntity } from './infrastructure/persistence/documento.entity';
import { TypeOrmSolicitudRepository } from './infrastructure/persistence/typeorm-solicitud.repository';
import { SOLICITUD_REPOSITORY_TOKEN } from './domain/ports/solicitud-repository.interface';
import { SolicitudBusquedaService } from './application/services/solicitud-busqueda.service';

/**
 * Módulo central del trámite ciudadano.
 *
 * Dependencias de módulos externos (todos via servicios exportados):
 * - CiudadanosModule  → CiudadanoBusquedaService  (buscar/upsert ciudadano)
 * - MotocicletasModule→ MotocicletaBusquedaService (buscar/upsert moto, RN-18)
 * - MotivosModule     → MotivoBusquedaService      (validar motivoId activo)
 * - AuditoriaModule   → AuditoriaService           (registro transversal)
 *
 * TypeORM: registra SolicitudEntity, HistorialEstadoEntity y DocumentoEntity.
 * Las entidades de ciudadano, motocicleta y motivo son referenciadas vía FK
 * desde SolicitudEntity; NO se registran aquí (pertenecen a sus propios módulos).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudEntity, HistorialEstadoEntity, DocumentoEntity]),
    AuditoriaModule,
    CiudadanosModule,
    MotocicletasModule,
    MotivosModule,
  ],
  providers: [
    SolicitudBusquedaService,
    { provide: SOLICITUD_REPOSITORY_TOKEN, useClass: TypeOrmSolicitudRepository },
  ],
  // SolicitudBusquedaService exportado para PermisosModule y futuros módulos
  // que necesiten consultar el estado de una solicitud sin acceder al repo directamente.
  exports: [SolicitudBusquedaService],
})
export class SolicitudesModule {}
