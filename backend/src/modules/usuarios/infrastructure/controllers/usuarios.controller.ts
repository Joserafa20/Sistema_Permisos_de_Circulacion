import { Controller, Get, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { AuthUser } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { ListarUsuariosQueryDto } from '../../application/dtos/listar-usuarios-query.dto';
import { UsuarioDetalleDto } from '../../application/dtos/usuario-detalle.dto';
import { UsuarioListItemDto } from '../../application/dtos/usuario-list-item.dto';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios/listar-usuarios.use-case';
import { ObtenerUsuarioPorIdUseCase } from '../../application/use-cases/obtener-usuario-por-id/obtener-usuario-por-id.use-case';

@ApiTags('usuarios')
@Controller('usuarios')
@Roles(UserRole.ADMINISTRADOR)
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class UsuariosController {
  constructor(
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase,
    private readonly obtenerUsuarioPorIdUseCase: ObtenerUsuarioPorIdUseCase,
  ) {}

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

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description:
      'Retorna el detalle completo de un usuario por su UUID. Incluye intentosFallidos y expiración de contraseña. Nunca expone campos sensibles (hash, historial, bloqueadoHasta). Solo el Administrador puede acceder. Registra auditoría.',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario', type: String })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido correctamente',
    type: UsuarioDetalleDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — se requiere Administrador' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async obtenerPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<UsuarioDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.obtenerUsuarioPorIdUseCase.execute({ id, actorId: actor.id, ipAddress, userAgent });
  }
}
