import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PermisoEntity } from './infrastructure/persistence/permiso.entity';
import { SolicitudEntity } from '../solicitudes/infrastructure/persistence/solicitud.entity';
import { ConfiguracionInstitucionalEntity } from '../configuracion-institucional/infrastructure/persistence/configuracion-institucional.entity';
import { TypeOrmPermisoRepository } from './infrastructure/persistence/typeorm-permiso.repository';
import { PERMISO_REPOSITORY_TOKEN } from './domain/ports/permiso-repository.interface';
import { QrCodeService } from './infrastructure/services/qr-code.service';
import { CodigoPermisoService } from './infrastructure/services/codigo-permiso.service';
import { PdfGeneratorService } from './infrastructure/services/pdf-generator.service';
import { MinioStorageAdapter } from './infrastructure/services/minio-storage.adapter';
import { GenerarPermisoUseCase } from './application/use-cases/generar-permiso.use-case';
import { ObtenerPermisoPorIdUseCase } from './application/use-cases/obtener-permiso-por-id.use-case';
import { ListarPermisosUseCase } from './application/use-cases/listar-permisos.use-case';
import { ObtenerPdfPermisoUseCase } from './application/use-cases/obtener-pdf-permiso.use-case';
import { PermisosController } from './infrastructure/controllers/permisos.controller';

/**
 * Módulo de generación y gestión de permisos de circulación.
 *
 * Exporta GenerarPermisoUseCase para que SolicitudesModule lo inyecte
 * en AprobarSolicitudUseCase sin crear dependencia circular.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PermisoEntity, SolicitudEntity, ConfiguracionInstitucionalEntity]),
    AuditoriaModule,
  ],
  controllers: [PermisosController],
  providers: [
    { provide: PERMISO_REPOSITORY_TOKEN, useClass: TypeOrmPermisoRepository },
    QrCodeService,
    CodigoPermisoService,
    PdfGeneratorService,
    MinioStorageAdapter,
    GenerarPermisoUseCase,
    ObtenerPermisoPorIdUseCase,
    ListarPermisosUseCase,
    ObtenerPdfPermisoUseCase,
  ],
  exports: [GenerarPermisoUseCase],
})
export class PermisosModule {}
