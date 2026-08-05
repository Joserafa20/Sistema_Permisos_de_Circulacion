import { Injectable } from '@nestjs/common';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { HistorialCompletoItemDto } from '../dtos/historial-completo-item.dto';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';

@Injectable()
export class ObtenerHistorialUseCase {
  constructor(private readonly solicitudBusquedaService: SolicitudBusquedaService) {}

  async ejecutar(solicitudId: string): Promise<HistorialCompletoItemDto[]> {
    const solicitud = await this.solicitudBusquedaService.buscarPorId(solicitudId);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada', 'SOLICITUD_NO_ENCONTRADA');
    }

    return (solicitud.historial ?? []).map((h) => ({
      id: h.id,
      estadoAnterior: h.estadoAnterior,
      estadoNuevo: h.estadoNuevo,
      motivo: h.motivo,
      camposCorreccion: h.camposCorreccion,
      usuario: h.usuarioNombre
        ? {
            id: h.usuarioId ?? '',
            nombre: `${h.usuarioNombre} ${h.usuarioApellido ?? ''}`.trim(),
            rol: h.usuarioRol,
          }
        : null,
      ipAddress: h.ipAddress,
      createdAt: h.createdAt.toISOString(),
    }));
  }
}
