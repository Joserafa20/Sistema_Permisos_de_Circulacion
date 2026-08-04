import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionEntity } from './infrastructure/persistence/notificacion.entity';
import { NotificacionesService } from './notificaciones.service';

/**
 * Módulo de notificaciones desacoplado.
 * En Fase 2 solo persiste registros en tabla `notificaciones` con estado PENDIENTE.
 * El envío real (SMTP/BullMQ) se implementará en un bloque posterior.
 */
@Module({
  imports: [TypeOrmModule.forFeature([NotificacionEntity])],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
