import { Inject, Injectable } from '@nestjs/common';
import { PaginationMeta } from '../../../../../common/interfaces/api-response.interface';
import { AccionAuditoria } from '../../../../../common/enums';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import {
  ICiudadanoRepository,
  CIUDADANO_REPOSITORY_TOKEN,
} from '../../../domain/ports/ciudadano-repository.interface';
import { CiudadanoMapper } from '../../../infrastructure/persistence/ciudadano.mapper';
import { ListarCiudadanosQueryDto } from '../../dtos/listar-ciudadanos-query.dto';
import { CiudadanoListItemDto } from '../../dtos/ciudadano-list-item.dto';

export interface ListarCiudadanosCommand {
  query: ListarCiudadanosQueryDto;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface ListarCiudadanosResult {
  items: CiudadanoListItemDto[];
  pagination: PaginationMeta;
}

@Injectable()
export class ListarCiudadanosUseCase {
  constructor(
    @Inject(CIUDADANO_REPOSITORY_TOKEN)
    private readonly ciudadanoRepo: ICiudadanoRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ListarCiudadanosCommand): Promise<ListarCiudadanosResult> {
    const { query, actorId, ipAddress, userAgent } = command;

    const { items, total } = await this.ciudadanoRepo.findMany(query);

    const totalPages = total === 0 ? 1 : Math.ceil(total / query.limit);

    await this.auditoriaService
      .registrar({
        accion: AccionAuditoria.LISTADO_CIUDADANOS,
        entidad: 'ciudadanos',
        entidadId: null,
        datosAnteriores: null,
        datosNuevos: {
          filtros: {
            busqueda: query.busqueda,
            tipoDocumento: query.tipoDocumento,
            municipioId: query.municipioId,
          },
          page: query.page,
          limit: query.limit,
          total,
        },
        ipAddress,
        userAgent,
        usuarioId: actorId,
      })
      .catch(() => undefined);

    return {
      items: items.map(CiudadanoMapper.toListItemDto),
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    };
  }
}
