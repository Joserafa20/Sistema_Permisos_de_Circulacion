import { Inject, Injectable } from '@nestjs/common';
import {
  ISolicitudRepository,
  SOLICITUD_REPOSITORY_TOKEN,
} from '../../domain/ports/solicitud-repository.interface';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { SolicitudStateMachine } from '../../domain/services/solicitud-state-machine';
import { RechazarSolicitudDto } from '../dtos/rechazar-solicitud.dto';
import { AccionSolicitudResponseDto } from '../dtos/accion-solicitud-response.dto';
import { AccionAuditoria, EstadoSolicitud } from '../../../../common/enums';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';

const ESTADOS_RECHAZABLES: EstadoSolicitud[] = [
  EstadoSolicitud.EN_REVISION,
  EstadoSolicitud.PENDIENTE_CORRECCION,
];

@Injectable()
export class RechazarSolicitudUseCase {
  constructor(
    private readonly solicitudBusquedaService: SolicitudBusquedaService,
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(
    solicitudId: string,
    dto: RechazarSolicitudDto,
    usuarioId: string,
    ipAddress: string | null,
  ): Promise<AccionSolicitudResponseDto> {
    const solicitud = await this.solicitudBusquedaService.buscarPorId(solicitudId);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada', 'SOLICITUD_NO_ENCONTRADA');
    }

    // RN-15 — Validar transición
    try {
      SolicitudStateMachine.validar(solicitud.estado, EstadoSolicitud.RECHAZADA);
    } catch {
      throw new BusinessRuleException(
        `La solicitud no puede rechazarse porque su estado actual es '${solicitud.estado}'`,
        'SOLICITUD_ESTADO_INVALIDO',
      );
    }

    const estadoAnterior = solicitud.estado;

    const transicionada = await this.solicitudRepo.cambiarEstado({
      id: solicitudId,
      estadoNuevo: EstadoSolicitud.RECHAZADA,
      estadosPermitidos: ESTADOS_RECHAZABLES,
      motivo: dto.motivo,
      camposCorreccion: null,
      usuarioId,
      ipAddress,
    });

    if (!transicionada) {
      throw new BusinessRuleException(
        'La solicitud no pudo ser rechazada. Es posible que su estado haya cambiado concurrentemente.',
        'SOLICITUD_ESTADO_INVALIDO',
      );
    }

    void this.auditoriaService.registrar({
      accion: AccionAuditoria.RECHAZAR,
      entidad: 'solicitudes',
      entidadId: solicitudId,
      datosAnteriores: { estado: estadoAnterior },
      datosNuevos: { estado: EstadoSolicitud.RECHAZADA, motivo: dto.motivo },
      ipAddress,
      usuarioId,
    });

    return {
      solicitudId,
      numeroRadicado: solicitud.numeroRadicado,
      estado: EstadoSolicitud.RECHAZADA,
      mensaje: null,
    };
  }
}
