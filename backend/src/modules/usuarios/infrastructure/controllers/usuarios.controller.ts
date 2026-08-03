import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { ListarUsuariosQueryDto } from '../../application/dtos/listar-usuarios-query.dto';
import { UsuarioListItemDto } from '../../application/dtos/usuario-list-item.dto';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios/listar-usuarios.use-case';

@ApiTags('usuarios')
@Controller('usuarios')
@Roles(UserRole.ADMINISTRADOR)
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class UsuariosController {
  constructor(private readonly listarUsuariosUseCase: ListarUsuariosUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description:
      'Retorna la lista paginada de usuarios del sistema. Soporta búsqueda por nombre, apellido o email, y filtros por rol, dependencia y estado. Solo el Administrador puede acceder.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de usuarios obtenido correctamente',
    type: UsuarioListItemDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — se requiere Administrador' })
  async listar(@Query() query: ListarUsuariosQueryDto): Promise<unknown> {
    return this.listarUsuariosUseCase.execute(query);
  }
}
