import { Controller, Get, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ListarSolicitudesQueryDto } from '../../application/dtos/listar-solicitudes-query.dto';
import { SolicitudDetalleDto } from '../../application/dtos/solicitud-detalle.dto';
import { HistorialCompletoItemDto } from '../../application/dtos/historial-completo-item.dto';
import { DocumentoItemDto } from '../../application/dtos/documento-item.dto';
import { ListarSolicitudesUseCase } from '../../application/use-cases/listar-solicitudes.use-case';
import type { PaginatedSolicitudesDto } from '../../application/use-cases/listar-solicitudes.use-case';
import { ObtenerSolicitudPorIdUseCase } from '../../application/use-cases/obtener-solicitud-por-id.use-case';
import { ObtenerHistorialUseCase } from '../../application/use-cases/obtener-historial.use-case';
import { ListarDocumentosUseCase } from '../../application/use-cases/listar-documentos.use-case';

interface JwtUser {
  sub: string;
  email: string;
  rol: string;
}

@ApiTags('solicitudes')
@ApiBearerAuth()
@Roles(UserRole.FUNCIONARIO, UserRole.ADMINISTRADOR)
@Controller('solicitudes')
export class SolicitudesFuncionarioController {
  constructor(
    private readonly listarSolicitudesUseCase: ListarSolicitudesUseCase,
    private readonly obtenerSolicitudPorIdUseCase: ObtenerSolicitudPorIdUseCase,
    private readonly obtenerHistorialUseCase: ObtenerHistorialUseCase,
    private readonly listarDocumentosUseCase: ListarDocumentosUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar solicitudes con filtros y paginación',
    description:
      'Retorna el listado paginado de solicitudes. Requiere rol funcionario o administrador.',
  })
  @ApiResponse({ status: 200, description: 'Listado paginado de solicitudes' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  listar(@Query() query: ListarSolicitudesQueryDto): Promise<PaginatedSolicitudesDto> {
    return this.listarSolicitudesUseCase.ejecutar(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de solicitud por ID',
    description:
      'Retorna el detalle completo de una solicitud. ' +
      'Si el estado es RECIBIDA, la transiciona automáticamente a EN_REVISION (PRD §13).',
  })
  @ApiResponse({ status: 200, description: 'Detalle de la solicitud', type: SolicitudDetalleDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  obtenerPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
    @Req() req: Request,
  ): Promise<SolicitudDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.obtenerSolicitudPorIdUseCase.ejecutar(id, user.sub, ipAddress);
  }

  @Get(':id/historial')
  @ApiOperation({
    summary: 'Obtener historial de estados de una solicitud',
    description:
      'Retorna el historial completo de cambios de estado con datos del funcionario e IP.',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de la solicitud',
    type: [HistorialCompletoItemDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  obtenerHistorial(@Param('id', ParseUUIDPipe) id: string): Promise<HistorialCompletoItemDto[]> {
    return this.obtenerHistorialUseCase.ejecutar(id);
  }

  @Get(':id/documentos')
  @ApiOperation({
    summary: 'Listar documentos adjuntos de una solicitud',
    description:
      'Retorna los documentos adjuntos de la solicitud. ' +
      'Las rutas de almacenamiento nunca se exponen — los accesos son por URL firmada con TTL.',
  })
  @ApiResponse({ status: 200, description: 'Documentos adjuntos', type: [DocumentoItemDto] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  listarDocumentos(@Param('id', ParseUUIDPipe) id: string): Promise<DocumentoItemDto[]> {
    return this.listarDocumentosUseCase.ejecutar(id);
  }
}
