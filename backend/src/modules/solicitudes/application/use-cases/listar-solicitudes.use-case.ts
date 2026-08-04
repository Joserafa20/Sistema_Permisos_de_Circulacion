import { Injectable } from '@nestjs/common';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { SolicitudMapper } from '../../infrastructure/persistence/solicitud.mapper';
import { ListarSolicitudesQueryDto } from '../dtos/listar-solicitudes-query.dto';
import { SolicitudListItemDto } from '../dtos/solicitud-list-item.dto';

export interface PaginatedSolicitudesDto {
  data: SolicitudListItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class ListarSolicitudesUseCase {
  constructor(private readonly solicitudBusquedaService: SolicitudBusquedaService) {}

  async ejecutar(query: ListarSolicitudesQueryDto): Promise<PaginatedSolicitudesDto> {
    const { items, total } = await this.solicitudBusquedaService.listar({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      estados: query.estado,
      fechaDesde: query.fechaInicio,
      fechaHasta: query.fechaFin,
      documento: query.documento,
      placa: query.placa,
      radicado: query.radicado,
      motivoId: query.motivoId,
    });

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: items.map((s) => SolicitudMapper.toListItemDto(s)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    };
  }
}
