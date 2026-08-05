import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ListarPermisosQueryDto } from '../../application/dtos/listar-permisos-query.dto';
import {
  PaginatedPermisosDto,
  PermisoDetalleDto,
  PermisoPdfUrlDto,
} from '../../application/dtos/permiso-list-item.dto';
import { RevocarPermisoDto } from '../../application/dtos/revocar-permiso.dto';
import { RevocarPermisoResponseDto } from '../../application/dtos/revocar-permiso-response.dto';
import { ActualizarCondicionesDto } from '../../application/dtos/actualizar-condiciones.dto';
import { ActualizarCondicionesResponseDto } from '../../application/use-cases/actualizar-condiciones-permiso.use-case';
import { ListarPermisosUseCase } from '../../application/use-cases/listar-permisos.use-case';
import { ObtenerPermisoPorIdUseCase } from '../../application/use-cases/obtener-permiso-por-id.use-case';
import { ObtenerPdfPermisoUseCase } from '../../application/use-cases/obtener-pdf-permiso.use-case';
import { RevocarPermisoUseCase } from '../../application/use-cases/revocar-permiso.use-case';
import { ActualizarCondicionesPermisoUseCase } from '../../application/use-cases/actualizar-condiciones-permiso.use-case';
import { AuthUser } from '../../../../modules/auth/infrastructure/strategies/jwt.strategy';

@ApiTags('permisos')
@ApiBearerAuth()
@Roles(UserRole.FUNCIONARIO, UserRole.ADMINISTRADOR)
@Controller('permisos')
export class PermisosController {
  constructor(
    private readonly listarPermisosUseCase: ListarPermisosUseCase,
    private readonly obtenerPermisoPorIdUseCase: ObtenerPermisoPorIdUseCase,
    private readonly obtenerPdfPermisoUseCase: ObtenerPdfPermisoUseCase,
    private readonly revocarPermisoUseCase: RevocarPermisoUseCase,
    private readonly actualizarCondicionesPermisoUseCase: ActualizarCondicionesPermisoUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar permisos con filtros y paginación',
    description:
      'Retorna el listado paginado de permisos generados. ' +
      'Filtros: estado, fechaInicio, fechaFin, placa, documento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de permisos',
    type: PaginatedPermisosDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  listar(@Query() query: ListarPermisosQueryDto): Promise<PaginatedPermisosDto> {
    return this.listarPermisosUseCase.ejecutar(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle completo de un permiso',
    description:
      'Retorna el detalle del permiso. ' +
      'Los campos codigo_qr y storage_key_pdf nunca se exponen (API_FUNCIONAL §14).',
  })
  @ApiResponse({ status: 200, description: 'Detalle del permiso', type: PermisoDetalleDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  obtenerPorId(@Param('id', ParseUUIDPipe) id: string): Promise<PermisoDetalleDto> {
    return this.obtenerPermisoPorIdUseCase.ejecutar(id);
  }

  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Obtener URL firmada para descargar el PDF del permiso',
    description:
      'Genera una URL firmada de MinIO válida por 5 minutos. ' +
      'El storage_key nunca se expone directamente. ' +
      'Registra la descarga en auditoría.',
  })
  @ApiResponse({ status: 200, description: 'URL firmada para descarga', type: PermisoPdfUrlDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  obtenerPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<PermisoPdfUrlDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.obtenerPdfPermisoUseCase.ejecutar(id, user.id, ipAddress);
  }

  @Post(':id/revocar')
  @HttpCode(200)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Revocar un permiso vigente',
    description:
      'Solo el administrador puede revocar un permiso. ' +
      'El permiso debe estar en estado vigente. ' +
      'El QR queda inválido de inmediato (RN-37).',
  })
  @ApiResponse({ status: 200, description: 'Permiso revocado', type: RevocarPermisoResponseDto })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 422, description: 'Permiso ya vencido o ya revocado' })
  revocar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevocarPermisoDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<RevocarPermisoResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.revocarPermisoUseCase.ejecutar(id, dto, user.id, ipAddress);
  }

  @Patch(':id/condiciones')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Actualizar condiciones y restricciones de un permiso vigente',
    description:
      'Registra o actualiza el campo condicionesRestricciones. ' +
      'No regenera el PDF (RN-33). El QR siempre muestra el valor actual (RN-39).',
  })
  @ApiResponse({
    status: 200,
    description: 'Condiciones actualizadas',
    type: ActualizarCondicionesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 422, description: 'Permiso no vigente' })
  actualizarCondiciones(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarCondicionesDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<ActualizarCondicionesResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.actualizarCondicionesPermisoUseCase.ejecutar(id, dto, user.id, ipAddress);
  }
}
