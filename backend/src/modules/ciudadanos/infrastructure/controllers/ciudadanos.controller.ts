import { Controller, Get, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { AuthUser } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { ListarCiudadanosQueryDto } from '../../application/dtos/listar-ciudadanos-query.dto';
import { CiudadanoListItemDto } from '../../application/dtos/ciudadano-list-item.dto';
import { CiudadanoDetalleDto } from '../../application/dtos/ciudadano-detalle.dto';
import { ListarCiudadanosUseCase } from '../../application/use-cases/listar-ciudadanos/listar-ciudadanos.use-case';
import { ObtenerCiudadanoPorIdUseCase } from '../../application/use-cases/obtener-ciudadano-por-id/obtener-ciudadano-por-id.use-case';

@ApiTags('ciudadanos')
@Controller('ciudadanos')
@Roles(UserRole.ADMINISTRADOR, UserRole.FUNCIONARIO)
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class CiudadanosController {
  constructor(
    private readonly listarCiudadanosUseCase: ListarCiudadanosUseCase,
    private readonly obtenerCiudadanoPorIdUseCase: ObtenerCiudadanoPorIdUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar ciudadanos',
    description:
      'Retorna la lista paginada de ciudadanos registrados. Soporta búsqueda por nombre, apellido o número de documento, y filtros por tipo de documento y municipio. Acceso: Administrador y Funcionario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de ciudadanos obtenido correctamente',
    type: CiudadanoListItemDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async listar(
    @Query() query: ListarCiudadanosQueryDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<unknown> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.listarCiudadanosUseCase.execute({ query, actorId: actor.id, ipAddress, userAgent });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener ciudadano por ID',
    description:
      'Retorna el detalle completo de un ciudadano incluyendo sus motocicletas registradas y el total de solicitudes. Acceso: Administrador y Funcionario. Registra auditoría CIUDADANO_CONSULTADO.',
  })
  @ApiParam({ name: 'id', description: 'UUID del ciudadano', type: String })
  @ApiResponse({
    status: 200,
    description: 'Ciudadano obtenido correctamente',
    type: CiudadanoDetalleDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Ciudadano no encontrado' })
  async obtenerPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request,
  ): Promise<CiudadanoDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;
    return this.obtenerCiudadanoPorIdUseCase.execute({
      id,
      actorId: actor.id,
      ipAddress,
      userAgent,
    });
  }
}
