import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudEntity } from '../solicitudes/infrastructure/persistence/solicitud.entity';
import { PermisoEntity } from '../permisos/infrastructure/persistence/permiso.entity';
import { ReportesController } from './reportes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudEntity, PermisoEntity])],
  controllers: [ReportesController],
})
export class ReportesModule {}
