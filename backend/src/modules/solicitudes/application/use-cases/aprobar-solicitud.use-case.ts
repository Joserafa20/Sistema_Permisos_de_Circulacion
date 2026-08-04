import { Inject, Injectable } from '@nestjs/common';
import {
  ISolicitudRepository,
  SOLICITUD_REPOSITORY_TOKEN,
} from '../../domain/ports/solicitud-repository.interface';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { NotificacionesService } from '../../../notificaciones/notificaciones.service';
import { GenerarPermisoUseCase } from '../../../permisos/application/use-cases/generar-permiso.use-case';
import { SolicitudStateMachine } from '../../domain/services/solicitud-state-machine';
import { AccionSolicitudResponseDto } from '../dtos/accion-solicitud-response.dto';
import { AccionAuditoria, EstadoSolicitud, TipoNotificacion } from '../../../../common/enums';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';
import { ConflictException } from '../../../../common/exceptions/conflict.exception';

/** COT timezone helper (RN-13). */
function todayCOT(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
}

const ESTADOS_APROBABLES: EstadoSolicitud[] = [
  EstadoSolicitud.EN_REVISION,
  EstadoSolicitud.PENDIENTE_CORRECCION,
];

@Injectable()
export class AprobarSolicitudUseCase {
  constructor(
    private readonly solicitudBusquedaService: SolicitudBusquedaService,
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
    private readonly auditoriaService: AuditoriaService,
    private readonly generarPermisoUseCase: GenerarPermisoUseCase,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async ejecutar(
    solicitudId: string,
    usuarioId: string,
    ipAddress: string | null,
  ): Promise<AccionSolicitudResponseDto> {
    const solicitud = await this.solicitudBusquedaService.buscarPorId(solicitudId);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada', 'SOLICITUD_NO_ENCONTRADA');
    }

    // RN-15 — Validar transición en_revision/pendiente_correccion → aprobada
    try {
      SolicitudStateMachine.validar(solicitud.estado, EstadoSolicitud.APROBADA);
    } catch {
      throw new BusinessRuleException(
        `La solicitud no puede aprobarse porque su estado actual es '${solicitud.estado}'`,
        'SOLICITUD_ESTADO_INVALIDO',
      );
    }

    // RN-17 — Verificar solapamiento con permisos vigentes de la misma moto
    const { solapamiento, codigoPermiso } =
      await this.solicitudRepo.tienePermisoVigenteConSolapamiento(
        solicitud.motocicletaId,
        solicitud.fechaInicio,
        solicitud.fechaFin,
      );

    if (solapamiento) {
      throw new ConflictException(
        `La motocicleta ya tiene un permiso vigente (${codigoPermiso}) con fechas que se solapan con esta solicitud`,
        'PERMISO_VIGENTE_SOLAPAMIENTO',
      );
    }

    // RN-01 — Si fechaInicio < hoy (COT), ajustar al día actual
    const hoy = todayCOT();
    const fechaInicioAjustada = solicitud.fechaInicio < hoy ? hoy : undefined;

    const estadoAnterior = solicitud.estado;

    const transicionada = await this.solicitudRepo.cambiarEstado({
      id: solicitudId,
      estadoNuevo: EstadoSolicitud.APROBADA,
      estadosPermitidos: ESTADOS_APROBABLES,
      motivo: null,
      camposCorreccion: null,
      usuarioId,
      ipAddress,
      fechaInicioAjustada,
    });

    if (!transicionada) {
      throw new BusinessRuleException(
        `La solicitud no pudo ser aprobada. Es posible que su estado haya cambiado concurrentemente.`,
        'SOLICITUD_ESTADO_INVALIDO',
      );
    }

    void this.auditoriaService.registrar({
      accion: AccionAuditoria.APROBAR,
      entidad: 'solicitudes',
      entidadId: solicitudId,
      datosAnteriores: { estado: estadoAnterior, fechaInicio: solicitud.fechaInicio },
      datosNuevos: {
        estado: EstadoSolicitud.APROBADA,
        fechaInicio: fechaInicioAjustada ?? solicitud.fechaInicio,
      },
      ipAddress,
      usuarioId,
    });

    // Generar permiso (PDF + QR + MinIO + DB) de forma sincrónica
    const permiso = await this.generarPermisoUseCase.ejecutar(solicitudId, usuarioId, ipAddress);

    // Notificar al ciudadano (fire-and-forget — RN-76)
    if (solicitud.ciudadanoEmail) {
      void this.notificacionesService.encolar({
        tipo: TipoNotificacion.APROBADA,
        destinatario: solicitud.ciudadanoEmail,
        asunto: `Permiso aprobado — ${permiso.codigoPermiso}`,
        solicitudId,
        permisoId: permiso.id,
        contexto: {
          nombreCiudadano: `${solicitud.ciudadanoNombre} ${solicitud.ciudadanoApellido}`,
          numeroRadicado: solicitud.numeroRadicado,
          codigoPermiso: permiso.codigoPermiso,
          fechaVencimiento: permiso.fechaVencimiento,
        },
      });
    }

    return {
      solicitudId,
      numeroRadicado: solicitud.numeroRadicado,
      estado: EstadoSolicitud.APROBADA,
      mensaje: 'La solicitud fue aprobada. El permiso está siendo generado.',
    };
  }
}
