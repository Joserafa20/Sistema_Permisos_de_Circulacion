import { Injectable } from '@nestjs/common';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { DocumentoItemDto } from '../dtos/documento-item.dto';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';

@Injectable()
export class ListarDocumentosUseCase {
  constructor(private readonly solicitudBusquedaService: SolicitudBusquedaService) {}

  async ejecutar(solicitudId: string): Promise<DocumentoItemDto[]> {
    const solicitud = await this.solicitudBusquedaService.buscarPorId(solicitudId);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada', 'SOLICITUD_NO_ENCONTRADA');
    }

    return (solicitud.documentos ?? []).map((d) => ({
      id: d.id,
      tipoDocumento: d.tipoDocumento,
      nombreOriginal: d.nombreOriginal,
      mimeType: d.mimeType,
      tamanoBytes: d.tamanoBytes,
      activo: d.activo,
      createdAt: d.createdAt.toISOString(),
    }));
  }
}
