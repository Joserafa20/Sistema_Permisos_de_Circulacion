import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AccionAuditoria } from '../../../../common/enums';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import {
  ISolicitudRepository,
  SOLICITUD_REPOSITORY_TOKEN,
} from '../../domain/ports/solicitud-repository.interface';
import { ConfiguracionSistemaService } from '../services/configuracion-sistema.service';

/**
 * Job diario que marca como VENCIDA las solicitudes que superaron su plazo (RN-08):
 * - RECIBIDA con created_at > plazo_revision_horas
 * - PENDIENTE_CORRECCION con updated_at > plazo_correccion_dias
 * Se ejecuta a las 05:01 UTC = 00:01 COT (RN-13).
 */
@Injectable()
export class VencerSolicitudesJob {
  private readonly logger = new Logger(VencerSolicitudesJob.name);

  constructor(
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
    private readonly auditoriaService: AuditoriaService,
    private readonly configService: ConfiguracionSistemaService,
  ) {}

  @Cron('1 5 * * *', { timeZone: 'UTC', name: 'vencer-solicitudes' })
  async ejecutar(): Promise<void> {
    this.logger.log('[VencerSolicitudesJob] Iniciando proceso de vencimiento de solicitudes');

    try {
      const [plazoRevisionHoras, plazoCorreccionDias] = await Promise.all([
        this.configService.obtenerPlazoRevisionHoras(),
        this.configService.obtenerPlazoCorreccionDias(),
      ]);

      const idsVencidas = await this.solicitudRepo.marcarVencidas({
        plazoRevisionHoras,
        plazoCorreccionDias,
      });

      if (idsVencidas.length === 0) {
        this.logger.log('[VencerSolicitudesJob] No hay solicitudes que vencer');
        return;
      }

      this.logger.log(
        `[VencerSolicitudesJob] ${idsVencidas.length} solicitudes marcadas como vencidas`,
      );

      for (const solicitudId of idsVencidas) {
        void this.auditoriaService.registrar({
          usuarioId: null,
          accion: AccionAuditoria.VENCIMIENTO_AUTOMATICO,
          entidad: 'solicitudes',
          entidadId: solicitudId,
          datosNuevos: { estado: 'vencida', fechaProceso: new Date().toISOString() },
        });
      }
    } catch (err) {
      this.logger.error({ err }, '[VencerSolicitudesJob] Error al procesar vencimientos');
    }
  }
}
