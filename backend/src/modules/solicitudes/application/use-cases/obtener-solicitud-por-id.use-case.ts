import { Inject, Injectable } from '@nestjs/common';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import {
  ISolicitudRepository,
  SOLICITUD_REPOSITORY_TOKEN,
} from '../../domain/ports/solicitud-repository.interface';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { SolicitudMapper } from '../../infrastructure/persistence/solicitud.mapper';
import { SolicitudDetalleDto } from '../dtos/solicitud-detalle.dto';
import { AccionAuditoria, EstadoSolicitud } from '../../../../common/enums';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';

@Injectable()
export class ObtenerSolicitudPorIdUseCase {
  constructor(
    private readonly solicitudBusquedaService: SolicitudBusquedaService,
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(
    id: string,
    usuarioId: string,
    ipAddress: string | null,
  ): Promise<SolicitudDetalleDto> {
    const solicitud = await this.solicitudBusquedaService.buscarPorId(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada', 'SOLICITUD_NO_ENCONTRADA');
    }

    // Efecto secundario documentado en PRD §13: recibida → en_revision al abrir el detalle
    if (solicitud.estado === EstadoSolicitud.RECIBIDA) {
      const transicionada = await this.solicitudRepo.marcarEnRevision(id, usuarioId, ipAddress);

      if (transicionada) {
        solicitud.estado = EstadoSolicitud.EN_REVISION;

        void this.auditoriaService.registrar({
          accion: AccionAuditoria.EDITAR,
          entidad: 'solicitudes',
          entidadId: id,
          datosAnteriores: { estado: EstadoSolicitud.RECIBIDA },
          datosNuevos: { estado: EstadoSolicitud.EN_REVISION },
          ipAddress,
          usuarioId,
        });
      }
    }

    return SolicitudMapper.toDetalleDto(solicitud);
  }
}
