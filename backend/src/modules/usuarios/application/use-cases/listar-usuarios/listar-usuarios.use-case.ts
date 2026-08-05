import { Injectable, Inject } from '@nestjs/common';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../../domain/ports/usuario-repository.interface';
import { PaginationMeta } from '../../../../../common/interfaces/api-response.interface';
import { UsuarioMapper } from '../../../infrastructure/persistence/usuario.mapper';
import { ListarUsuariosQueryDto } from '../../dtos/listar-usuarios-query.dto';
import { UsuarioListItemDto } from '../../dtos/usuario-list-item.dto';

export interface ListarUsuariosResult {
  items: UsuarioListItemDto[];
  pagination: PaginationMeta;
}

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(query: ListarUsuariosQueryDto): Promise<ListarUsuariosResult> {
    const { items, total } = await this.usuarioRepo.findMany(query);

    const totalPages = total === 0 ? 1 : Math.ceil(total / query.limit);

    return {
      items: items.map(UsuarioMapper.toListItemDto),
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
