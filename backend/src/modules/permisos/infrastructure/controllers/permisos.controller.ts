import { Controller, Get, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common';
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
import { ListarPermisosUseCase } from '../../application/use-cases/listar-permisos.use-case';
import { ObtenerPermisoPorIdUseCase } from '../../application/use-cases/obtener-permiso-por-id.use-case';
import { ObtenerPdfPermisoUseCase } from '../../application/use-cases/obtener-pdf-permiso.use-case';

interface JwtUser {
  sub: string;
  email: string;
  rol: string;
}

@ApiTags('permisos')
@ApiBearerAuth()
@Roles(UserRole.FUNCIONARIO, UserRole.ADMINISTRADOR)
@Controller('permisos')
export class PermisosController {
  constructor(
    private readonly listarPermisosUseCase: ListarPermisosUseCase,
    private readonly obtenerPermisoPorIdUseCase: ObtenerPermisoPorIdUseCase,
    private readonly obtenerPdfPermisoUseCase: ObtenerPdfPermisoUseCase,
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
    @CurrentUser() user: JwtUser,
    @Req() req: Request,
  ): Promise<PermisoPdfUrlDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.obtenerPdfPermisoUseCase.ejecutar(id, user.sub, ipAddress);
  }
}
