import { Injectable } from '@nestjs/common';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { EstadoPublicoSolicitudDto } from '../dtos/estado-publico-solicitud.dto';
import { EstadoSolicitud } from '../../../../common/enums';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';

const ESTADO_DESCRIPCION: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.RECIBIDA]: 'Su solicitud fue recibida y está en espera de revisión.',
  [EstadoSolicitud.EN_REVISION]: 'Su solicitud está siendo revisada por un funcionario.',
  [EstadoSolicitud.PENDIENTE_CORRECCION]:
    'Se han solicitado correcciones a su solicitud. Revise los detalles para proceder.',
  [EstadoSolicitud.APROBADA]:
    'Su solicitud fue aprobada. Puede descargar su permiso de circulación.',
  [EstadoSolicitud.RECHAZADA]:
    'Su solicitud fue rechazada. Puede crear una nueva solicitud con la información correcta.',
  [EstadoSolicitud.VENCIDA]:
    'Su solicitud ha vencido. El plazo de revisión o corrección fue superado.',
};

@Injectable()
export class ConsultarEstadoPublicoUseCase {
  constructor(private readonly solicitudBusquedaService: SolicitudBusquedaService) {}

  /**
   * Consulta pública (RN-20): verifica radicado + número de documento.
   * La respuesta es idéntica si no existe o si el documento no coincide —
   * nunca revela si el radicado existe sin el documento correcto.
   */
  async ejecutar(radicado: string, documento: string): Promise<EstadoPublicoSolicitudDto> {
    const solicitud = await this.solicitudBusquedaService.buscarPorRadicadoYDocumento(
      radicado.trim().toUpperCase(),
      documento.trim(),
    );

    if (!solicitud) {
      throw new NotFoundException(
        'No se encontró ninguna solicitud con ese número de radicado y documento',
        'SOLICITUD_NO_ENCONTRADA',
      );
    }

    return {
      numeroRadicado: solicitud.numeroRadicado,
      estado: solicitud.estado,
      estadoDescripcion: ESTADO_DESCRIPCION[solicitud.estado],
      fechaSolicitud: solicitud.createdAt.toISOString().slice(0, 10),
      motivo: solicitud.motivoNombre,
      motocicleta: { placa: solicitud.motocicletaPlaca },
      fechaInicio: solicitud.fechaInicio,
      fechaFin: solicitud.fechaFin,
      // Populated by PermisosModule once the solicitud is approved (Bloque B6)
      permiso: null,
      ultimaActualizacion: (solicitud.updatedAt ?? solicitud.createdAt).toISOString(),
    };
  }
}
