import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { NotificacionEntity } from './infrastructure/persistence/notificacion.entity';
import { NotificacionesService } from './notificaciones.service';
import { EmailProcessor } from './infrastructure/processors/email.processor';
import { EmailModule } from '../email/email.module';
import { EMAIL_NOTIFICATIONS_QUEUE, EMAIL_NOTIFICATIONS_DLQ } from '../redis/redis.constants';

/**
 * Módulo de notificaciones — envío real de correos vía BullMQ + SMTP (B10).
 *
 * Flujo completo:
 *   Evento de negocio → NotificacionesService.encolar()
 *     → persiste en DB (estado PENDIENTE)
 *     → añade job a cola BullMQ
 *       → EmailProcessor.process()
 *         → PlantillaEmailService.renderizar()
 *         → IEmailProvider.enviar() (SmtpEmailProvider)
 *         → actualiza DB (ENVIADO | ERROR)
 *         → en último fallo: mueve a DLQ
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([NotificacionEntity]),
    BullModule.registerQueue(
      { name: EMAIL_NOTIFICATIONS_QUEUE },
      { name: EMAIL_NOTIFICATIONS_DLQ },
    ),
    EmailModule,
  ],
  providers: [NotificacionesService, EmailProcessor],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
