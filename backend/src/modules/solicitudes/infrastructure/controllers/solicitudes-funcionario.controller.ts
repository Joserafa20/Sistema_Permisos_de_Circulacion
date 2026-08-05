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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ListarSolicitudesQueryDto } from '../../application/dtos/listar-solicitudes-query.dto';
import { SolicitudDetalleDto } from '../../application/dtos/solicitud-detalle.dto';
import { HistorialCompletoItemDto } from '../../application/dtos/historial-completo-item.dto';
import { DocumentoItemDto } from '../../application/dtos/documento-item.dto';
import { RechazarSolicitudDto } from '../../application/dtos/rechazar-solicitud.dto';
import { SolicitarCorreccionDto } from '../../application/dtos/solicitar-correccion.dto';
import { AccionSolicitudResponseDto } from '../../application/dtos/accion-solicitud-response.dto';
import { ListarSolicitudesUseCase } from '../../application/use-cases/listar-solicitudes.use-case';
import type { PaginatedSolicitudesDto } from '../../application/use-cases/listar-solicitudes.use-case';
import { ObtenerSolicitudPorIdUseCase } from '../../application/use-cases/obtener-solicitud-por-id.use-case';
import { ObtenerHistorialUseCase } from '../../application/use-cases/obtener-historial.use-case';
import { ListarDocumentosUseCase } from '../../application/use-cases/listar-documentos.use-case';
import { ObtenerUrlDocumentoUseCase } from '../../application/use-cases/obtener-url-documento.use-case';
import { DocumentoUrlDto } from '../../application/dtos/documento-url.dto';
import { AprobarSolicitudUseCase } from '../../application/use-cases/aprobar-solicitud.use-case';
import { RechazarSolicitudUseCase } from '../../application/use-cases/rechazar-solicitud.use-case';
import { SolicitarCorreccionUseCase } from '../../application/use-cases/solicitar-correccion.use-case';
import { AuthUser } from '../../../../modules/auth/infrastructure/strategies/jwt.strategy';

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
    private readonly aprobarSolicitudUseCase: AprobarSolicitudUseCase,
    private readonly rechazarSolicitudUseCase: RechazarSolicitudUseCase,
    private readonly solicitarCorreccionUseCase: SolicitarCorreccionUseCase,
    private readonly obtenerUrlDocumentoUseCase: ObtenerUrlDocumentoUseCase,
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
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<SolicitudDetalleDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.obtenerSolicitudPorIdUseCase.ejecutar(id, user.id, ipAddress);
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

  @Get(':id/documentos/:docId')
  @ApiOperation({
    summary: 'Obtener URL firmada para descargar un documento (RN-53)',
    description:
      'Genera y retorna una URL firmada con TTL 5 minutos para descargar el documento adjunto. ' +
      'Requiere rol funcionario o administrador. ' +
      'storage_key nunca se expone en la respuesta (RN-53). ' +
      'Registra la descarga en auditoría.',
  })
  @ApiResponse({ status: 200, description: 'URL firmada generada', type: DocumentoUrlDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  obtenerUrlDocumento(
    @Param('id', ParseUUIDPipe) solicitudId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<DocumentoUrlDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.obtenerUrlDocumentoUseCase.ejecutar(solicitudId, docId, user.id, ipAddress);
  }

  @Post(':id/aprobar')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Aprobar una solicitud (RN-15, RN-17, RN-01)',
    description:
      'Aprueba la solicitud y dispara la generación asíncrona del permiso (PDF + QR). ' +
      'La solicitud debe estar en estado en_revision o pendiente_correccion. ' +
      'Verifica solapamiento con permisos vigentes (RN-17). ' +
      'Si fechaInicio < hoy(COT), la ajusta a la fecha actual (RN-01).',
  })
  @ApiResponse({
    status: 202,
    description: 'Solicitud aprobada. Permiso en generación.',
    type: AccionSolicitudResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({ status: 409, description: 'Permiso vigente con fechas solapadas (RN-17)' })
  @ApiResponse({
    status: 422,
    description: 'Estado inválido para aprobar (SOLICITUD_ESTADO_INVALIDO)',
  })
  aprobar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<AccionSolicitudResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.aprobarSolicitudUseCase.ejecutar(id, user.id, ipAddress);
  }

  @Post(':id/rechazar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rechazar una solicitud (RN-04, RN-10, RN-15)',
    description:
      'Rechaza la solicitud de forma definitiva. ' +
      'La solicitud debe estar en en_revision o pendiente_correccion. ' +
      'El motivo es obligatorio y debe tener al menos 20 caracteres (RN-04). ' +
      'El estado rechazada es terminal (RN-10).',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud rechazada',
    type: AccionSolicitudResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Motivo demasiado corto o faltante (RN-04)' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({
    status: 422,
    description: 'Estado inválido para rechazar (SOLICITUD_ESTADO_INVALIDO)',
  })
  rechazar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RechazarSolicitudDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<AccionSolicitudResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.rechazarSolicitudUseCase.ejecutar(id, dto, user.id, ipAddress);
  }

  @Post(':id/correccion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar corrección al ciudadano (RN-04, RN-15, RN-16)',
    description:
      'Solicita al ciudadano que corrija campos o documentos específicos. ' +
      'La solicitud debe estar en estado en_revision. ' +
      'Los campos a corregir se almacenan en historial_estados.campos_correccion (RN-16). ' +
      'El motivo y al menos 1 campo son obligatorios (RN-04).',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud marcada para corrección',
    type: AccionSolicitudResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({
    status: 422,
    description: 'Estado inválido para solicitar corrección (SOLICITUD_ESTADO_INVALIDO)',
  })
  solicitarCorreccion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SolicitarCorreccionDto,
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
  ): Promise<AccionSolicitudResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.solicitarCorreccionUseCase.ejecutar(id, dto, user.id, ipAddress);
  }
}
