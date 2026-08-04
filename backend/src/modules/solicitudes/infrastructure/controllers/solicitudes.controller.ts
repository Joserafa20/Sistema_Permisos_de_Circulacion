import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { Public } from '../../../../common/decorators/public.decorator';
import { TipoDocumentoAdjunto } from '../../../../common/enums';
import { CrearSolicitudDto } from '../../application/dtos/crear-solicitud.dto';
import { SolicitudCreadaDto } from '../../application/dtos/solicitud-creada.dto';
import { EstadoPublicoSolicitudDto } from '../../application/dtos/estado-publico-solicitud.dto';
import { DocumentoItemDto } from '../../application/dtos/documento-item.dto';
import { CrearSolicitudUseCase } from '../../application/use-cases/crear-solicitud.use-case';
import { ConsultarEstadoPublicoUseCase } from '../../application/use-cases/consultar-estado-publico.use-case';
import { AdjuntarDocumentoUseCase } from '../../application/use-cases/adjuntar-documento.use-case';

/** DTO interno para los campos del formulario multipart. */
class AdjuntarDocumentoFormDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(TipoDocumentoAdjunto)
  tipoDocumento: TipoDocumentoAdjunto;
}

@ApiTags('solicitudes-publicas')
@Controller('public/solicitudes')
export class SolicitudesController {
  constructor(
    private readonly crearSolicitudUseCase: CrearSolicitudUseCase,
    private readonly consultarEstadoPublicoUseCase: ConsultarEstadoPublicoUseCase,
    private readonly adjuntarDocumentoUseCase: AdjuntarDocumentoUseCase,
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
  @ApiQuery({ name: 'radicado', required: true, description: 'Número de radicado' })
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

  @Post(':id/documentos')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const permitidos = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!permitidos.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Tipo de archivo no permitido. Solo PDF, JPG o PNG.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Adjuntar documento a una solicitud (público)',
    description:
      'Permite al ciudadano adjuntar un documento PDF, JPG o PNG (máx. 10 MB) a su solicitud. ' +
      'La solicitud debe estar en estado recibida o pendiente_correccion. ' +
      'El ciudadano se identifica con radicado + número de documento (sin login). ' +
      'storage_key nunca se expone en la respuesta (RN-53).',
  })
  @ApiQuery({ name: 'radicado', required: true, description: 'Número de radicado de la solicitud' })
  @ApiQuery({
    name: 'documento',
    required: true,
    description: 'Número de documento del solicitante',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tipoDocumento', 'archivo'],
      properties: {
        tipoDocumento: {
          type: 'string',
          enum: Object.values(TipoDocumentoAdjunto),
          description: 'Tipo de documento adjunto',
        },
        archivo: {
          type: 'string',
          format: 'binary',
          description: 'Archivo PDF / JPG / PNG (máx. 10 MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documento adjuntado correctamente',
    type: DocumentoItemDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Tipo MIME inválido, tamaño excedido o campos faltantes',
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada con ese radicado y documento' })
  @ApiResponse({
    status: 422,
    description: 'Estado de la solicitud no permite adjuntar documentos',
  })
  async adjuntarDocumento(
    @Param('id', ParseUUIDPipe) solicitudId: string,
    @Query('radicado') radicado: string,
    @Query('documento') documento: string,
    @Body() body: { tipoDocumento?: string },
    @UploadedFile()
    archivo: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    @Req() req: Request,
  ): Promise<DocumentoItemDto> {
    if (!archivo) {
      throw new BadRequestException('El campo "archivo" es requerido.');
    }
    if (!radicado || !documento) {
      throw new BadRequestException('Los query params "radicado" y "documento" son requeridos.');
    }

    // Validar tipoDocumento del form-field
    const formDto = plainToInstance(AdjuntarDocumentoFormDto, {
      tipoDocumento: body.tipoDocumento,
    });
    const errores = await validate(formDto);
    if (errores.length > 0) {
      throw new BadRequestException('El campo tipoDocumento es inválido o requerido.');
    }

    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;

    return this.adjuntarDocumentoUseCase.ejecutar({
      solicitudId,
      radicado,
      numeroDocumentoCiudadano: documento,
      tipoDocumento: formDto.tipoDocumento,
      archivoBuffer: archivo.buffer,
      mimeType: archivo.mimetype,
      nombreOriginal: archivo.originalname,
      tamanoBytes: archivo.size,
      ipAddress,
    });
  }
}
