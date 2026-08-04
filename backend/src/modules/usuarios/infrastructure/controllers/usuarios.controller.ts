import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { AuthUser } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { ActivarUsuarioDto } from '../../application/dtos/activar-usuario.dto';
import { ActualizarUsuarioDto } from '../../application/dtos/actualizar-usuario.dto';
import { CrearUsuarioDto } from '../../application/dtos/crear-usuario.dto';
import { ListarUsuariosQueryDto } from '../../application/dtos/listar-usuarios-query.dto';
import { UsuarioCreadoDto } from '../../application/dtos/usuario-creado.dto';
import { UsuarioDetalleDto } from '../../application/dtos/usuario-detalle.dto';
import { UsuarioListItemDto } from '../../application/dtos/usuario-list-item.dto';
import { ActivarUsuarioUseCase } from '../../application/use-cases/activar-usuario/activar-usuario.use-case';
import { ActualizarUsuarioUseCase } from '../../application/use-cases/actualizar-usuario/actualizar-usuario.use-case';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario/crear-usuario.use-case';
import { EliminarUsuarioUseCase } from '../../application/use-cases/eliminar-usuario/eliminar-usuario.use-case';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios/listar-usuarios.use-case';
import { ObtenerUsuarioPorIdUseCase } from '../../application/use-cases/obtener-usuario-por-id/obtener-usuario-por-id.use-case';
import { RestaurarUsuarioUseCase } from '../../application/use-cases/restaurar-usuario/restaurar-usuario.use-case';

@ApiTags('usuarios')
@Controller('usuarios')
@Roles(UserRole.ADMINISTRADOR)
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class UsuariosController {
  constructor(
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase,
    private readonly obtenerUsuarioPorIdUseCase: ObtenerUsuarioPorIdUseCase,
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly actualizarUsuarioUseCase: ActualizarUsuarioUseCase,
    private readonly activarUsuarioUseCase: ActivarUsuarioUseCase,
    private readonly eliminarUsuarioUseCase: EliminarUsuarioUseCase,
    private readonly restaurarUsuarioUseCase: RestaurarUsuarioUseCase,
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

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description:
      'Actualiza los datos de un usuario. Permite modificar nombre, apellido, email, rol, dependencia, estado activo y desbloquear cuenta bloqueada. Protecciones: el administrador no puede desactivarse ni cambiar su propio rol. Si no hay cambios reales, no ejecuta UPDATE ni escribe auditoría. Solo el Administrador puede acceder.',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario a actualizar', type: String })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado correctamente',
    type: UsuarioDetalleDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — se requiere Administrador' })
  @ApiResponse({ status: 404, description: 'Usuario, rol o dependencia no encontrados' })
  @ApiResponse({ status: 409, description: 'Email ya registrado por otro usuario (EMAIL_IN_USE)' })
  @ApiResponse({
    status: 422,
    description:
      'Regla de negocio violada (SELF_DEACTIVATION_FORBIDDEN, SELF_ROLE_CHANGE_FORBIDDEN, ROL_INACTIVO, DEPENDENCIA_INACTIVA)',
  })
  async actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarUsuarioDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<UsuarioDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.actualizarUsuarioUseCase.execute({
      id,
      dto,
      actorId: actor.id,
      ipAddress,
      userAgent,
    });
  }

  @Patch(':id/activar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activar o desactivar usuario',
    description:
      'Cambia el estado activo del usuario. Al desactivar se revocan todos sus refresh tokens activos, forzando un nuevo inicio de sesión. El administrador no puede desactivarse a sí mismo. Solo el Administrador puede acceder.',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario', type: String })
  @ApiResponse({
    status: 200,
    description: 'Estado del usuario actualizado correctamente',
    type: UsuarioDetalleDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — se requiere Administrador' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 422,
    description: 'Regla de negocio violada (SELF_DEACTIVATION_FORBIDDEN)',
  })
  async activar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActivarUsuarioDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<UsuarioDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.activarUsuarioUseCase.execute({
      id,
      activo: dto.activo,
      actorId: actor.id,
      ipAddress,
      userAgent,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar usuario (soft delete)',
    description:
      'Realiza una eliminación lógica del usuario. Nunca elimina físicamente el registro. Protecciones: no permite eliminarse a sí mismo ni eliminar al último administrador activo. Solo el Administrador puede acceder.',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario a eliminar', type: String })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — se requiere Administrador' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado o ya eliminado' })
  @ApiResponse({
    status: 422,
    description: 'Regla de negocio violada (SELF_DELETE_FORBIDDEN, LAST_ADMIN_FORBIDDEN)',
  })
  async eliminar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<{ id: string }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.eliminarUsuarioUseCase.execute({ id, actorId: actor.id, ipAddress, userAgent });
  }

  @Post(':id/restaurar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restaurar usuario eliminado',
    description:
      'Revierte el soft delete de un usuario. Solo puede restaurarse un usuario que esté previamente eliminado. No modifica ningún otro dato del usuario. Solo el Administrador puede acceder.',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario a restaurar', type: String })
  @ApiResponse({
    status: 200,
    description: 'Usuario restaurado correctamente',
    type: UsuarioDetalleDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente — se requiere Administrador' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 422,
    description: 'El usuario no está eliminado (USUARIO_NOT_DELETED)',
  })
  async restaurar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<UsuarioDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.restaurarUsuarioUseCase.execute({ id, actorId: actor.id, ipAddress, userAgent });
  }
}
