import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { PermisoEntity } from './infrastructure/persistence/permiso.entity';
import { SolicitudEntity } from '../solicitudes/infrastructure/persistence/solicitud.entity';
import { ConfiguracionInstitucionalEntity } from '../configuracion-institucional/infrastructure/persistence/configuracion-institucional.entity';
import { QrValidacionEntity } from './infrastructure/persistence/qr-validacion.entity';
import { TypeOrmPermisoRepository } from './infrastructure/persistence/typeorm-permiso.repository';
import { QrValidacionRepository } from './infrastructure/persistence/qr-validacion.repository';
import { PERMISO_REPOSITORY_TOKEN } from './domain/ports/permiso-repository.interface';
import { QrCodeService } from './infrastructure/services/qr-code.service';
import { CodigoPermisoService } from './infrastructure/services/codigo-permiso.service';
import { PdfGeneratorService } from './infrastructure/services/pdf-generator.service';
import { MinioStorageAdapter } from './infrastructure/services/minio-storage.adapter';
import { GenerarPermisoUseCase } from './application/use-cases/generar-permiso.use-case';
import { ObtenerPermisoPorIdUseCase } from './application/use-cases/obtener-permiso-por-id.use-case';
import { ListarPermisosUseCase } from './application/use-cases/listar-permisos.use-case';
import { ObtenerPdfPermisoUseCase } from './application/use-cases/obtener-pdf-permiso.use-case';
import { RevocarPermisoUseCase } from './application/use-cases/revocar-permiso.use-case';
import { ActualizarCondicionesPermisoUseCase } from './application/use-cases/actualizar-condiciones-permiso.use-case';
import { VerificarQrUseCase } from './application/use-cases/verificar-qr.use-case';
import { PermisosController } from './infrastructure/controllers/permisos.controller';
import { PermisosPublicController } from './infrastructure/controllers/permisos-public.controller';
import { VencerPermisosJob } from './infrastructure/jobs/vencer-permisos.job';

/**
 * Módulo completo de permisos de circulación.
 * B6: generación PDF+QR, listado, detalle, descarga.
 * B7: revocación (admin), condiciones (funcionario), verificación pública QR, job de vencimiento.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermisoEntity,
      SolicitudEntity,
      ConfiguracionInstitucionalEntity,
      QrValidacionEntity,
    ]),
    ScheduleModule.forRoot(),
    AuditoriaModule,
    NotificacionesModule,
  ],
  controllers: [PermisosController, PermisosPublicController],
  providers: [
    { provide: PERMISO_REPOSITORY_TOKEN, useClass: TypeOrmPermisoRepository },
    QrCodeService,
    CodigoPermisoService,
    PdfGeneratorService,
    MinioStorageAdapter,
    QrValidacionRepository,
    GenerarPermisoUseCase,
    ObtenerPermisoPorIdUseCase,
    ListarPermisosUseCase,
    ObtenerPdfPermisoUseCase,
    RevocarPermisoUseCase,
    ActualizarCondicionesPermisoUseCase,
    VerificarQrUseCase,
    VencerPermisosJob,
  ],
  exports: [GenerarPermisoUseCase],
})
export class PermisosModule {}
