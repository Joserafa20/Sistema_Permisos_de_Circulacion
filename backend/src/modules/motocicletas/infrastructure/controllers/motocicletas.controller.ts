import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { AuthUser } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { ActualizarMotocicletaDto } from '../../application/dtos/actualizar-motocicleta.dto';
import { ListarMotocicletasQueryDto } from '../../application/dtos/listar-motocicletas-query.dto';
import { MotocicletaListItemDto } from '../../application/dtos/motocicleta-list-item.dto';
import { MotocicletaDetalleDto } from '../../application/dtos/motocicleta-detalle.dto';
import { ActualizarMotocicletaUseCase } from '../../application/use-cases/actualizar-motocicleta/actualizar-motocicleta.use-case';
import { ListarMotocicletasUseCase } from '../../application/use-cases/listar-motocicletas/listar-motocicletas.use-case';
import { ObtenerMotocicletaPorIdUseCase } from '../../application/use-cases/obtener-motocicleta-por-id/obtener-motocicleta-por-id.use-case';
import { ObtenerMotocicletaPorPlacaUseCase } from '../../application/use-cases/obtener-motocicleta-por-placa/obtener-motocicleta-por-placa.use-case';

@ApiTags('motocicletas')
@Controller('motocicletas')
@Roles(UserRole.ADMINISTRADOR, UserRole.FUNCIONARIO)
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class MotocicletasController {
  constructor(
    private readonly listarMotocicletasUseCase: ListarMotocicletasUseCase,
    private readonly obtenerMotocicletaPorIdUseCase: ObtenerMotocicletaPorIdUseCase,
    private readonly obtenerMotocicletaPorPlacaUseCase: ObtenerMotocicletaPorPlacaUseCase,
    private readonly actualizarMotocicletaUseCase: ActualizarMotocicletaUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar motocicletas',
    description:
      'Retorna la lista paginada de motocicletas registradas. Soporta filtros por placa (búsqueda parcial), ciudadano propietario y estado activo/inactivo. Acceso: Administrador y Funcionario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de motocicletas obtenido correctamente',
    type: MotocicletaListItemDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async listar(
    @Query() query: ListarMotocicletasQueryDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<unknown> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.listarMotocicletasUseCase.execute({
      query,
      actorId: actor.id,
      ipAddress,
      userAgent,
    });
  }

  // IMPORTANTE: /placa/:placa debe declararse ANTES de /:id para evitar
  // que NestJS capture "placa" como un UUID y falle el ParseUUIDPipe.
  @Get('placa/:placa')
  @ApiOperation({
    summary: 'Buscar motocicleta por placa',
    description:
      'Retorna el detalle de una motocicleta buscando por su placa colombiana. La placa se normaliza a mayúsculas (RN-18). Útil en el panel del funcionario para verificación rápida. Acceso: Administrador y Funcionario. Registra auditoría MOTOCICLETA_CONSULTADA.',
  })
  @ApiParam({
    name: 'placa',
    description: 'Placa colombiana (ej: ABC123). Se normaliza a mayúsculas.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Motocicleta obtenida correctamente',
    type: MotocicletaDetalleDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'No se encontró motocicleta con la placa indicada' })
  async obtenerPorPlaca(
    @Param('placa') placa: string,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<MotocicletaDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.obtenerMotocicletaPorPlacaUseCase.execute({
      placa,
      actorId: actor.id,
      ipAddress,
      userAgent,
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar motocicleta',
    description:
      'Actualiza los campos técnicos de una motocicleta (marca, línea, modelo, cilindraje, color, número de motor y número de chasis). No se permite cambiar la placa ni el ciudadano propietario. Si no hay cambios detectados, retorna el objeto sin modificar ni registrar auditoría. Acceso: Administrador y Funcionario. Registra auditoría EDITAR.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la motocicleta', type: String })
  @ApiResponse({
    status: 200,
    description: 'Motocicleta actualizada correctamente',
    type: MotocicletaDetalleDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Motocicleta no encontrada' })
  async actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarMotocicletaDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<MotocicletaDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.actualizarMotocicletaUseCase.execute({
      id,
      dto,
      actorId: actor.id,
      ipAddress,
      userAgent,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener motocicleta por ID',
    description:
      'Retorna el detalle completo de una motocicleta incluyendo los datos del ciudadano propietario. Acceso: Administrador y Funcionario. Registra auditoría MOTOCICLETA_CONSULTADA.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la motocicleta', type: String })
  @ApiResponse({
    status: 200,
    description: 'Motocicleta obtenida correctamente',
    type: MotocicletaDetalleDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Motocicleta no encontrada' })
  async obtenerPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<MotocicletaDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.obtenerMotocicletaPorIdUseCase.execute({
      id,
      actorId: actor.id,
      ipAddress,
      userAgent,
    });
  }
}
