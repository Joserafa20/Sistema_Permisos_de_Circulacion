import { Inject, Injectable } from '@nestjs/common';
import {
  ISolicitudRepository,
  SOLICITUD_REPOSITORY_TOKEN,
} from '../../domain/ports/solicitud-repository.interface';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { AccionSolicitudResponseDto } from '../dtos/accion-solicitud-response.dto';
import { AccionAuditoria, EstadoSolicitud } from '../../../../common/enums';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';

const ESTADOS_ENVIABLES: EstadoSolicitud[] = [
  EstadoSolicitud.EN_REVISION,
  EstadoSolicitud.PENDIENTE_CORRECCION,
];

@Injectable()
export class EnviarAprobacionUseCase {
  constructor(
    private readonly solicitudBusquedaService: SolicitudBusquedaService,
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(
    solicitudId: string,
    usuarioId: string,
    ipAddress: string | null,
    observaciones?: string,
  ): Promise<AccionSolicitudResponseDto> {
    const solicitud = await this.solicitudBusquedaService.buscarPorId(solicitudId);
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada', 'SOLICITUD_NOT_FOUND');

    if (!ESTADOS_ENVIABLES.includes(solicitud.estado as EstadoSolicitud)) {
      throw new BusinessRuleException(
        `La solicitud debe estar en revisión para enviarse a aprobación (actual: ${solicitud.estado})`,
        'ESTADO_INVALIDO',
      );
    }

    const motivo = observaciones?.trim()
      ? `Enviada a aprobación por funcionario. Observaciones: ${observaciones.trim()}`
      : 'Enviada a aprobación por funcionario';

    await this.solicitudRepo.cambiarEstado({
      id: solicitudId,
      estadoNuevo: EstadoSolicitud.PENDIENTE_APROBACION,
      estadosPermitidos: ESTADOS_ENVIABLES,
      motivo,
      camposCorreccion: null,
      usuarioId,
      ipAddress,
    });

    void this.auditoriaService.registrar({
      accion: AccionAuditoria.EDITAR,
      entidad: 'solicitud',
      entidadId: solicitudId,
      datosNuevos: { estado: EstadoSolicitud.PENDIENTE_APROBACION, observaciones },
      usuarioId,
      ipAddress,
    });

    return {
      solicitudId,
      numeroRadicado: solicitud.numeroRadicado,
      estado: EstadoSolicitud.PENDIENTE_APROBACION,
      mensaje: 'Solicitud enviada al administrador para aprobación.',
    };
  }
}
