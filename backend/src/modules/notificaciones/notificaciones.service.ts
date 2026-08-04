import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificacionEntity } from './infrastructure/persistence/notificacion.entity';
import { TipoNotificacion, EstadoEnvioNotificacion } from '../../common/enums';

export interface EncolarNotificacionParams {
  tipo: TipoNotificacion;
  destinatario: string;
  asunto: string;
  solicitudId?: string;
  permisoId?: string;
}

/**
 * Persiste notificaciones pendientes en la tabla `notificaciones`.
 * El envío efectivo por correo es responsabilidad de un worker/job futuro (BullMQ).
 * Esta arquitectura desacopla el trigger del envío real (RN-36, RN-76).
 */
@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(NotificacionEntity)
    private readonly repo: Repository<NotificacionEntity>,
  ) {}

  async encolar(params: EncolarNotificacionParams): Promise<void> {
    try {
      const entity = this.repo.create({
        tipo: params.tipo,
        destinatario: params.destinatario,
        asunto: params.asunto,
        estadoEnvio: EstadoEnvioNotificacion.PENDIENTE,
        intentos: 0,
        solicitud: params.solicitudId ? { id: params.solicitudId } : null,
        permiso: params.permisoId ? { id: params.permisoId } : null,
      });
      await this.repo.save(entity);
    } catch (err) {
      // No propaga el error — la notificación fallida nunca debe bloquear la operación principal
      this.logger.error({ err, params }, 'Error al encolar notificación');
    }
  }
}
