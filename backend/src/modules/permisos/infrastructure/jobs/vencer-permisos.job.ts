import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AccionAuditoria } from '../../../../common/enums';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';

/**
 * Job diario que marca como VENCIDO los permisos vigentes cuya
 * fecha_vencimiento < CURRENT_DATE (RN-08, RN-31).
 * Se ejecuta a las 05:01 UTC = 00:01 COT (RN-13).
 */
@Injectable()
export class VencerPermisosJob {
  private readonly logger = new Logger(VencerPermisosJob.name);

  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  @Cron('1 5 * * *', { timeZone: 'UTC', name: 'vencer-permisos' })
  async ejecutar(): Promise<void> {
    const hoy = new Date().toISOString().split('T')[0];
    this.logger.log(`[VencerPermisosJob] Iniciando para fecha ${hoy}`);

    try {
      const idsVencidos = await this.permisoRepo.marcarVencidos(hoy);

      if (idsVencidos.length === 0) {
        this.logger.log('[VencerPermisosJob] No hay permisos que vencer hoy');
        return;
      }

      this.logger.log(`[VencerPermisosJob] ${idsVencidos.length} permisos marcados como vencido`);

      // Registrar una auditoría por cada permiso vencido
      for (const permisoId of idsVencidos) {
        void this.auditoriaService.registrar({
          usuarioId: null,
          accion: AccionAuditoria.VENCIMIENTO_AUTOMATICO,
          entidad: 'permiso',
          entidadId: permisoId,
          datosNuevos: { estado: 'vencido', fechaProceso: hoy },
        });
      }
    } catch (err) {
      this.logger.error({ err }, '[VencerPermisosJob] Error al procesar vencimientos');
    }
  }
}
