import { Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { NotificacionEntity } from '../persistence/notificacion.entity';
import { EstadoEnvioNotificacion } from '../../../../common/enums';
import {
  IEmailProvider,
  EMAIL_PROVIDER,
  type EmailAttachment,
} from '../../../email/domain/ports/email-provider.interface';
import { PlantillaEmailService } from '../../../email/infrastructure/services/plantilla-email.service';
import { EMAIL_NOTIFICATIONS_QUEUE, EMAIL_NOTIFICATIONS_DLQ } from '../../../redis/redis.constants';

export interface EmailJobPayload {
  notificacionId: string;
}

/**
 * Worker BullMQ que consume la cola 'email-notifications'.
 *
 * Flujo:
 * 1. Carga la entidad NotificacionEntity por ID (contiene contexto snapshot).
 * 2. Renderiza el HTML con PlantillaEmailService (branding institucional + contexto).
 * 3. Envía via IEmailProvider (SmtpEmailProvider).
 * 4. Actualiza estadoEnvio → ENVIADO.
 *
 * En fallo (lanzar excepción): BullMQ reintenta con backoff configurado.
 * Evento 'failed' (último intento agotado): mueve al DLQ y marca ERROR en DB.
 *
 * Reintentos (RN-76): 3 intentos · backoff 1 min / 5 min / 15 min.
 */
@Processor(
  { name: EMAIL_NOTIFICATIONS_QUEUE },
  {
    concurrency: 5,
    settings: {
      backoffStrategy: (attemptsMade: number): number => {
        const delays = [60_000, 300_000, 900_000]; // 1 min · 5 min · 15 min
        return delays[attemptsMade - 1] ?? 900_000;
      },
    },
  },
)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @InjectRepository(NotificacionEntity)
    private readonly notificacionRepo: Repository<NotificacionEntity>,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
    private readonly plantillaService: PlantillaEmailService,
    @InjectQueue(EMAIL_NOTIFICATIONS_DLQ)
    private readonly dlqQueue: Queue<EmailJobPayload>,
  ) {
    super();
  }

  async process(job: Job<EmailJobPayload>): Promise<void> {
    const { notificacionId } = job.data;
    const inicio = Date.now();

    const notificacion = await this.notificacionRepo.findOne({
      where: { id: notificacionId },
    });

    if (!notificacion) {
      this.logger.warn({ notificacionId }, 'Notificación no encontrada — se descarta el job');
      return;
    }

    // Incrementar contador e intento antes de enviar (idempotencia en retries)
    await this.notificacionRepo.update(notificacionId, {
      intentos: () => 'intentos + 1',
      ultimoIntento: new Date(),
    });

    try {
      const contexto = notificacion.contexto ?? {};
      const html = await this.plantillaService.renderizar(notificacion.tipo, contexto);

      const attachments: EmailAttachment[] = [];
      if (contexto['pdfBase64'] && contexto['pdfFilename']) {
        attachments.push({
          filename: contexto['pdfFilename'],
          content: Buffer.from(contexto['pdfBase64'], 'base64'),
          contentType: 'application/pdf',
        });
      }

      await this.emailProvider.enviar({
        to: notificacion.destinatario,
        subject: notificacion.asunto,
        html,
        ...(attachments.length > 0 && { attachments }),
      });

      await this.notificacionRepo.update(notificacionId, {
        estadoEnvio: EstadoEnvioNotificacion.ENVIADO,
        errorDetalle: null,
      });

      this.logger.log(
        {
          notificacionId,
          tipo: notificacion.tipo,
          destinatario: notificacion.destinatario,
          duracionMs: Date.now() - inicio,
          intento: job.attemptsMade + 1,
        },
        'Email enviado correctamente',
      );
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        {
          notificacionId,
          tipo: notificacion.tipo,
          destinatario: notificacion.destinatario,
          intento: job.attemptsMade + 1,
          error: mensaje,
        },
        'Fallo al enviar email — BullMQ reintentará',
      );

      // Propagar el error para que BullMQ gestione el reintento
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  async onJobFailed(job: Job<EmailJobPayload>, error: Error): Promise<void> {
    const maxAttempts = job.opts.attempts ?? 3;
    const isLastAttempt = job.attemptsMade >= maxAttempts;

    if (!isLastAttempt) return;

    const { notificacionId } = job.data;

    this.logger.error(
      {
        notificacionId,
        intentos: job.attemptsMade,
        error: error.message,
      },
      'Email fallido definitivamente — moviendo a DLQ',
    );

    // Marcar como ERROR en la base de datos
    await this.notificacionRepo.update(notificacionId, {
      estadoEnvio: EstadoEnvioNotificacion.ERROR,
      errorDetalle: error.message.slice(0, 2000),
    });

    // Mover al Dead Letter Queue para intervención manual
    await this.dlqQueue.add(
      'dlq-email',
      { notificacionId },
      { removeOnComplete: false, removeOnFail: false },
    );
  }

  @OnWorkerEvent('completed')
  onJobCompleted(job: Job<EmailJobPayload>): void {
    this.logger.debug({ jobId: job.id, notificacionId: job.data.notificacionId }, 'Job completado');
  }
}
