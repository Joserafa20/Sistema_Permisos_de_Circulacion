import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../../../common/decorators/public.decorator';
import { CrearSolicitudDto } from '../../application/dtos/crear-solicitud.dto';
import { SolicitudCreadaDto } from '../../application/dtos/solicitud-creada.dto';
import { EstadoPublicoSolicitudDto } from '../../application/dtos/estado-publico-solicitud.dto';
import { CrearSolicitudUseCase } from '../../application/use-cases/crear-solicitud.use-case';
import { ConsultarEstadoPublicoUseCase } from '../../application/use-cases/consultar-estado-publico.use-case';

@ApiTags('solicitudes-publicas')
@Controller('public/solicitudes')
export class SolicitudesController {
  constructor(
    private readonly crearSolicitudUseCase: CrearSolicitudUseCase,
    private readonly consultarEstadoPublicoUseCase: ConsultarEstadoPublicoUseCase,
  ) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Radicar solicitud de permiso de circulación',
    description:
      'Endpoint público (sin autenticación). Permite al ciudadano radicar una nueva solicitud ' +
      'de permiso de circulación por Pico y Placa. Incluye validación reCAPTCHA v3, upsert de ' +
      'ciudadano y motocicleta, verificación de solicitud activa (RN-03) y generación del ' +
      'número de radicado (RN-14). Todo el proceso es atómico.',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud radicada exitosamente',
    type: SolicitudCreadaDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o declaraciones requeridas no aceptadas',
  })
  @ApiResponse({ status: 404, description: 'Motivo no encontrado o inactivo' })
  @ApiResponse({ status: 409, description: 'La motocicleta ya tiene una solicitud activa (RN-03)' })
  @ApiResponse({ status: 422, description: 'Regla de negocio: reCAPTCHA fallido o fecha inválida' })
  async crear(@Body() dto: CrearSolicitudDto, @Req() req: Request): Promise<SolicitudCreadaDto> {
    const ipSolicitante = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    return this.crearSolicitudUseCase.ejecutar(dto, ipSolicitante);
  }

  @Get('estado')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar estado público de una solicitud (RN-20)',
    description:
      'Permite al ciudadano consultar el estado de su solicitud usando número de radicado ' +
      'y número de documento. La respuesta es idéntica si no existe o si el documento no coincide ' +
      '— nunca revela si un radicado existe sin el documento correcto.',
  })
  @ApiQuery({
    name: 'radicado',
    required: true,
    description: 'Número de radicado (ej: 20260804-PYP-000001)',
  })
  @ApiQuery({
    name: 'documento',
    required: true,
    description: 'Número de documento del solicitante',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado público de la solicitud',
    type: EstadoPublicoSolicitudDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró la solicitud con ese radicado y documento',
  })
  consultarEstado(
    @Query('radicado') radicado: string,
    @Query('documento') documento: string,
  ): Promise<EstadoPublicoSolicitudDto> {
    return this.consultarEstadoPublicoUseCase.ejecutar(radicado, documento);
  }
}
