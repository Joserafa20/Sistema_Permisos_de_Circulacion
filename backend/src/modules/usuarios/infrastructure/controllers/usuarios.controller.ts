import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { AuthUser } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { CrearUsuarioDto } from '../../application/dtos/crear-usuario.dto';
import { ListarUsuariosQueryDto } from '../../application/dtos/listar-usuarios-query.dto';
import { UsuarioCreadoDto } from '../../application/dtos/usuario-creado.dto';
import { UsuarioDetalleDto } from '../../application/dtos/usuario-detalle.dto';
import { UsuarioListItemDto } from '../../application/dtos/usuario-list-item.dto';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario/crear-usuario.use-case';
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
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear usuario',
    description:
      'Crea un nuevo usuario en el sistema. El sistema genera una contraseña temporal que el administrador comunica al usuario; esta se muestra una única vez en la respuesta y nunca se almacena en texto plano. El usuario deberá cambiarla en el primer inicio de sesión. Solo el Administrador puede acceder.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Usuario creado correctamente. Incluye contraseña temporal (solo visible una vez).',
    type: UsuarioCreadoDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — se requiere Administrador' })
  @ApiResponse({ status: 404, description: 'Rol o dependencia no encontrados' })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya está registrado (EMAIL_IN_USE)',
  })
  @ApiResponse({
    status: 422,
    description: 'Regla de negocio violada (rol o dependencia inactivos)',
  })
  async crear(
    @Body() dto: CrearUsuarioDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<UsuarioCreadoDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.crearUsuarioUseCase.execute({ dto, actorId: actor.id, ipAddress, userAgent });
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
