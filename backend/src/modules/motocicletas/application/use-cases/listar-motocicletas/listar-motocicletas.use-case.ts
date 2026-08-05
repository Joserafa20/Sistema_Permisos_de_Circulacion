import { Inject, Injectable } from '@nestjs/common';
import { AccionAuditoria } from '../../../../../common/enums';
import { PaginationMeta } from '../../../../../common/interfaces/api-response.interface';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import {
  IMotocicletaRepository,
  MOTOCICLETA_REPOSITORY_TOKEN,
} from '../../../domain/ports/motocicleta-repository.interface';
import { MotocicletaMapper } from '../../../infrastructure/persistence/motocicleta.mapper';
import { ListarMotocicletasQueryDto } from '../../dtos/listar-motocicletas-query.dto';
import { MotocicletaListItemDto } from '../../dtos/motocicleta-list-item.dto';

export interface ListarMotocicletasCommand {
  query: ListarMotocicletasQueryDto;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface ListarMotocicletasResult {
  items: MotocicletaListItemDto[];
  pagination: PaginationMeta;
}

@Injectable()
export class ListarMotocicletasUseCase {
  constructor(
    @Inject(MOTOCICLETA_REPOSITORY_TOKEN)
    private readonly motoRepo: IMotocicletaRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ListarMotocicletasCommand): Promise<ListarMotocicletasResult> {
    const { query, actorId, ipAddress, userAgent } = command;

    const { items, total } = await this.motoRepo.findMany(query);

    const totalPages = total === 0 ? 1 : Math.ceil(total / query.limit);

    await this.auditoriaService
      .registrar({
        accion: AccionAuditoria.LISTADO_MOTOS,
        entidad: 'motocicletas',
        entidadId: null,
        datosAnteriores: null,
        datosNuevos: {
          filtros: {
            placa: query.placa,
            ciudadanoId: query.ciudadanoId,
            activo: query.activo,
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
      items: items.map(MotocicletaMapper.toListItemDto),
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
