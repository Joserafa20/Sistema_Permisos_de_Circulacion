import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { CiudadanosModule } from '../ciudadanos/ciudadanos.module';
import { MotocicletasModule } from '../motocicletas/motocicletas.module';
import { MotivosModule } from '../motivos/motivos.module';
import { SolicitudEntity } from './infrastructure/persistence/solicitud.entity';
import { HistorialEstadoEntity } from './infrastructure/persistence/historial-estado.entity';
import { DocumentoEntity } from './infrastructure/persistence/documento.entity';
import { ConfiguracionEntity } from '../configuracion/infrastructure/persistence/configuracion.entity';
import { TypeOrmSolicitudRepository } from './infrastructure/persistence/typeorm-solicitud.repository';
import { SOLICITUD_REPOSITORY_TOKEN } from './domain/ports/solicitud-repository.interface';
import { SolicitudBusquedaService } from './application/services/solicitud-busqueda.service';
import { CrearSolicitudUseCase } from './application/use-cases/crear-solicitud.use-case';
import { RecaptchaService } from './infrastructure/services/recaptcha.service';
import { ConfiguracionSistemaService } from './infrastructure/services/configuracion-sistema.service';
import { SolicitudTransaccionService } from './infrastructure/services/solicitud-transaccion.service';
import { SolicitudesController } from './infrastructure/controllers/solicitudes.controller';

/**
 * Módulo central del trámite ciudadano.
 *
 * Dependencias de módulos externos (todos via servicios exportados):
 * - CiudadanosModule  → CiudadanoBusquedaService  (buscar/upsert ciudadano)
 * - MotocicletasModule→ MotocicletaBusquedaService (buscar/upsert moto, RN-18)
 * - MotivosModule     → MotivoBusquedaService      (validar motivoId activo)
 * - AuditoriaModule   → AuditoriaService           (registro transversal)
 *
 * ConfiguracionEntity: importada directamente (sin ConfiguracionModule) para
 * que ConfiguracionSistemaService lea dias_max_permiso (RN-02).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolicitudEntity,
      HistorialEstadoEntity,
      DocumentoEntity,
      ConfiguracionEntity,
    ]),
    AuditoriaModule,
    CiudadanosModule,
    MotocicletasModule,
    MotivosModule,
  ],
  controllers: [SolicitudesController],
  providers: [
    SolicitudBusquedaService,
    { provide: SOLICITUD_REPOSITORY_TOKEN, useClass: TypeOrmSolicitudRepository },
    CrearSolicitudUseCase,
    RecaptchaService,
    ConfiguracionSistemaService,
    SolicitudTransaccionService,
  ],
  // SolicitudBusquedaService exportado para PermisosModule y futuros módulos
  // que necesiten consultar el estado de una solicitud sin acceder al repo directamente.
  exports: [SolicitudBusquedaService],
})
export class SolicitudesModule {}
