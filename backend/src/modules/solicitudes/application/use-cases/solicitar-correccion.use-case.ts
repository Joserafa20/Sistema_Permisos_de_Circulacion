import { Inject, Injectable } from '@nestjs/common';
import {
  ISolicitudRepository,
  SOLICITUD_REPOSITORY_TOKEN,
} from '../../domain/ports/solicitud-repository.interface';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { SolicitudStateMachine } from '../../domain/services/solicitud-state-machine';
import { SolicitarCorreccionDto } from '../dtos/solicitar-correccion.dto';
import { AccionSolicitudResponseDto } from '../dtos/accion-solicitud-response.dto';
import { AccionAuditoria, EstadoSolicitud } from '../../../../common/enums';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';

@Injectable()
export class SolicitarCorreccionUseCase {
  constructor(
    private readonly solicitudBusquedaService: SolicitudBusquedaService,
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(
    solicitudId: string,
    dto: SolicitarCorreccionDto,
    usuarioId: string,
    ipAddress: string | null,
  ): Promise<AccionSolicitudResponseDto> {
    const solicitud = await this.solicitudBusquedaService.buscarPorId(solicitudId);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada', 'SOLICITUD_NO_ENCONTRADA');
    }

    // RN-15 — Solo desde en_revision
    try {
      SolicitudStateMachine.validar(solicitud.estado, EstadoSolicitud.PENDIENTE_CORRECCION);
    } catch {
      throw new BusinessRuleException(
        `La solicitud no puede marcarse para corrección porque su estado actual es '${solicitud.estado}'`,
        'SOLICITUD_ESTADO_INVALIDO',
      );
    }

    const estadoAnterior = solicitud.estado;

    const transicionada = await this.solicitudRepo.cambiarEstado({
      id: solicitudId,
      estadoNuevo: EstadoSolicitud.PENDIENTE_CORRECCION,
      estadosPermitidos: [EstadoSolicitud.EN_REVISION],
      motivo: dto.motivo,
      camposCorreccion: { items: dto.camposCorreccion } as Record<string, unknown>,
      usuarioId,
      ipAddress,
    });

    if (!transicionada) {
      throw new BusinessRuleException(
        'La solicitud no pudo ser marcada para corrección. Es posible que su estado haya cambiado concurrentemente.',
        'SOLICITUD_ESTADO_INVALIDO',
      );
    }

    void this.auditoriaService.registrar({
      accion: AccionAuditoria.SOLICITAR_CORRECCION,
      entidad: 'solicitudes',
      entidadId: solicitudId,
      datosAnteriores: { estado: estadoAnterior },
      datosNuevos: {
        estado: EstadoSolicitud.PENDIENTE_CORRECCION,
        motivo: dto.motivo,
        camposCorreccion: dto.camposCorreccion,
      },
      ipAddress,
      usuarioId,
    });

    return {
      solicitudId,
      numeroRadicado: solicitud.numeroRadicado,
      estado: EstadoSolicitud.PENDIENTE_CORRECCION,
      mensaje: null,
    };
  }
}
