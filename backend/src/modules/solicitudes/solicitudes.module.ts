import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { CiudadanosModule } from '../ciudadanos/ciudadanos.module';
import { MotocicletasModule } from '../motocicletas/motocicletas.module';
import { MotivosModule } from '../motivos/motivos.module';
import { PermisosModule } from '../permisos/permisos.module';
import { SolicitudEntity } from './infrastructure/persistence/solicitud.entity';
import { HistorialEstadoEntity } from './infrastructure/persistence/historial-estado.entity';
import { DocumentoEntity } from './infrastructure/persistence/documento.entity';
import { ConfiguracionEntity } from '../configuracion/infrastructure/persistence/configuracion.entity';
import { TypeOrmSolicitudRepository } from './infrastructure/persistence/typeorm-solicitud.repository';
import { SOLICITUD_REPOSITORY_TOKEN } from './domain/ports/solicitud-repository.interface';
import { SolicitudBusquedaService } from './application/services/solicitud-busqueda.service';
import { ConfiguracionSistemaService } from './infrastructure/services/configuracion-sistema.service';
import { RecaptchaService } from './infrastructure/services/recaptcha.service';
import { SolicitudTransaccionService } from './infrastructure/services/solicitud-transaccion.service';
import { SolicitudesController } from './infrastructure/controllers/solicitudes.controller';
import { SolicitudesFuncionarioController } from './infrastructure/controllers/solicitudes-funcionario.controller';
import { CrearSolicitudUseCase } from './application/use-cases/crear-solicitud.use-case';
import { ListarSolicitudesUseCase } from './application/use-cases/listar-solicitudes.use-case';
import { ObtenerSolicitudPorIdUseCase } from './application/use-cases/obtener-solicitud-por-id.use-case';
import { ObtenerHistorialUseCase } from './application/use-cases/obtener-historial.use-case';
import { ListarDocumentosUseCase } from './application/use-cases/listar-documentos.use-case';
import { ConsultarEstadoPublicoUseCase } from './application/use-cases/consultar-estado-publico.use-case';
import { AprobarSolicitudUseCase } from './application/use-cases/aprobar-solicitud.use-case';
import { RechazarSolicitudUseCase } from './application/use-cases/rechazar-solicitud.use-case';
import { SolicitarCorreccionUseCase } from './application/use-cases/solicitar-correccion.use-case';
import { AdjuntarDocumentoUseCase } from './application/use-cases/adjuntar-documento.use-case';
import { ObtenerUrlDocumentoUseCase } from './application/use-cases/obtener-url-documento.use-case';
import { VencerSolicitudesJob } from './infrastructure/jobs/vencer-solicitudes.job';

/**
 * Módulo central del trámite ciudadano.
 *
 * Dependencias de módulos externos (todos via servicios exportados):
 * - CiudadanosModule  → CiudadanoBusquedaService  (buscar/upsert ciudadano)
 * - MotocicletasModule→ MotocicletaBusquedaService (buscar/upsert moto, RN-18)
 * - MotivosModule     → MotivoBusquedaService      (validar motivoId activo)
 * - AuditoriaModule   → AuditoriaService           (registro transversal)
 * - StorageModule     → MinioStorageAdapter        (@Global — sin importar explícitamente)
 *
 * ConfiguracionEntity: importada directamente (sin ConfiguracionModule) para
 * que ConfiguracionSistemaService lea parametros de plazo (RN-08).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolicitudEntity,
      HistorialEstadoEntity,
      DocumentoEntity,
      ConfiguracionEntity,
    ]),
    ScheduleModule.forRoot(),
    AuditoriaModule,
    CiudadanosModule,
    MotocicletasModule,
    MotivosModule,
    forwardRef(() => PermisosModule),
  ],
  controllers: [SolicitudesController, SolicitudesFuncionarioController],
  providers: [
    SolicitudBusquedaService,
    { provide: SOLICITUD_REPOSITORY_TOKEN, useClass: TypeOrmSolicitudRepository },
    ConfiguracionSistemaService,
    RecaptchaService,
    SolicitudTransaccionService,
    CrearSolicitudUseCase,
    ListarSolicitudesUseCase,
    ObtenerSolicitudPorIdUseCase,
    ObtenerHistorialUseCase,
    ListarDocumentosUseCase,
    ConsultarEstadoPublicoUseCase,
    AprobarSolicitudUseCase,
    RechazarSolicitudUseCase,
    SolicitarCorreccionUseCase,
    AdjuntarDocumentoUseCase,
    ObtenerUrlDocumentoUseCase,
    VencerSolicitudesJob,
    // GenerarPermisoUseCase: provisto por PermisosModule (exportado), no declarar aquí
  ],
  // SolicitudBusquedaService exportado para PermisosModule y futuros módulos
  // que necesiten consultar el estado de una solicitud sin acceder al repo directamente.
  exports: [SolicitudBusquedaService],
})
export class SolicitudesModule {}
