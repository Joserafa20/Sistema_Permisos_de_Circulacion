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

@Injectable()
export class IniciarRevisionUseCase {
  constructor(
    private readonly solicitudBusquedaService: SolicitudBusquedaService,
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(solicitudId: string, usuarioId: string): Promise<AccionSolicitudResponseDto> {
    const solicitud = await this.solicitudBusquedaService.buscarPorId(solicitudId);
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada', 'SOLICITUD_NOT_FOUND');

    if (solicitud.estado !== EstadoSolicitud.RECIBIDA) {
      throw new BusinessRuleException(
        `Solo se puede iniciar revisión desde estado recibida (actual: ${solicitud.estado})`,
        'ESTADO_INVALIDO',
      );
    }

    await this.solicitudRepo.cambiarEstado(
      solicitudId,
      EstadoSolicitud.EN_REVISION,
      usuarioId,
      'Revisión iniciada por funcionario',
    );

    void this.auditoriaService.registrar({
      accion: AccionAuditoria.EDITAR,
      entidad: 'solicitud',
      entidadId: solicitudId,
      datosNuevos: { estado: EstadoSolicitud.EN_REVISION },
      usuarioId,
      ipAddress: null,
    });

    return {
      solicitudId,
      numeroRadicado: solicitud.numeroRadicado,
      estado: EstadoSolicitud.EN_REVISION,
      mensaje: 'Revisión iniciada correctamente.',
    };
  }
}
