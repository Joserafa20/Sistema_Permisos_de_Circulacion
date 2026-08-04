import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { NotificacionEntity } from './infrastructure/persistence/notificacion.entity';
import { TipoNotificacion, EstadoEnvioNotificacion } from '../../common/enums';
import { EMAIL_NOTIFICATIONS_QUEUE } from '../redis/redis.constants';
import type { EmailJobPayload } from './infrastructure/processors/email.processor';

export interface EncolarNotificacionParams {
  tipo: TipoNotificacion;
  destinatario: string;
  asunto: string;
  solicitudId?: string;
  permisoId?: string;
  /** Variables de contexto para renderizar el template HTML. */
  contexto?: Record<string, string>;
}

/**
 * Persiste la notificación en DB y la encola en BullMQ para envío real (RN-76).
 *
 * El doble paso (DB primero, luego cola) garantiza:
 * - Audit trail completo aunque BullMQ falle al arrancar.
 * - El worker puede recuperar el contexto completo desde la DB en cada reintento.
 * - El error en la cola nunca bloquea la operación de negocio que disparó la notificación.
 */
@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(NotificacionEntity)
    private readonly repo: Repository<NotificacionEntity>,
    @InjectQueue(EMAIL_NOTIFICATIONS_QUEUE)
    private readonly emailQueue: Queue<EmailJobPayload>,
  ) {}

  async encolar(params: EncolarNotificacionParams): Promise<void> {
    try {
      const entity = this.repo.create({
        tipo: params.tipo,
        destinatario: params.destinatario,
        asunto: params.asunto,
        estadoEnvio: EstadoEnvioNotificacion.PENDIENTE,
        intentos: 0,
        contexto: params.contexto ?? null,
        solicitud: params.solicitudId ? { id: params.solicitudId } : null,
        permiso: params.permisoId ? { id: params.permisoId } : null,
      });

      const guardada = await this.repo.save(entity);

      // Encolar en BullMQ con retry policy (RN-76)
      await this.emailQueue.add(
        'send-email',
        { notificacionId: guardada.id },
        {
          attempts: 3,
          backoff: { type: 'custom' },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 200 },
        },
      );
    } catch (err) {
      // La notificación nunca debe bloquear la operación principal
      this.logger.error({ err, params }, 'Error al encolar notificación');
    }
  }
}
