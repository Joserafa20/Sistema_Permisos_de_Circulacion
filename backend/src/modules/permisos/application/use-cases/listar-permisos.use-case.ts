import { Inject, Injectable } from '@nestjs/common';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';
import { ListarPermisosQueryDto } from '../dtos/listar-permisos-query.dto';
import { PaginatedPermisosDto, PermisoListItemDto } from '../dtos/permiso-list-item.dto';

@Injectable()
export class ListarPermisosUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
  ) {}

  async ejecutar(query: ListarPermisosQueryDto): Promise<PaginatedPermisosDto> {
    const { items, total } = await this.permisoRepo.findMany(query);

    const totalPages = Math.ceil(total / query.limit);

    const dtos: PermisoListItemDto[] = items.map((p) => ({
      id: p.id,
      codigoPermiso: p.codigoPermiso,
      estado: p.estado,
      ciudadano: {
        nombre: `${p.snapshotCiudadano.nombre} ${p.snapshotCiudadano.apellido}`,
        numeroDocumento: p.snapshotCiudadano.numeroDocumento,
      },
      motocicleta: { placa: p.snapshotMotocicleta.placa },
      motivo: p.snapshotMotivo.nombre,
      fechaExpedicion: p.fechaExpedicion.toISOString(),
      fechaVencimiento: p.fechaVencimiento,
      funcionario: {
        nombre: p.funcionarioNombre ?? '',
        apellido: p.funcionarioApellido ?? '',
      },
    }));

    return {
      items: dtos,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    };
  }
}
