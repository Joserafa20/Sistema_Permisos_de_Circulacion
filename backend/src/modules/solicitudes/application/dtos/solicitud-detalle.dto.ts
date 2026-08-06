import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitud, TipoDocumentoIdentidad } from '../../../../common/enums';
import { HistorialEstadoItemDto } from './historial-estado-item.dto';
import { DocumentoItemDto } from './documento-item.dto';

class CiudadanoDetalleEnSolicitudDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: TipoDocumentoIdentidad }) tipoDocumento: TipoDocumentoIdentidad;
  @ApiProperty() numeroDocumento: string;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiPropertyOptional({ nullable: true }) fechaNacimiento: string | null;
  @ApiPropertyOptional({ nullable: true }) direccion: string | null;
  @ApiPropertyOptional({ nullable: true }) barrio: string | null;
  @ApiPropertyOptional({ nullable: true }) municipio: string | null;
  @ApiPropertyOptional({ nullable: true }) celular: string | null;
  @ApiPropertyOptional({ nullable: true }) email: string | null;
}

class MotocicletaDetalleEnSolicitudDto {
  @ApiProperty() id: string;
  @ApiProperty() placa: string;
  @ApiPropertyOptional({ nullable: true }) marca: string | null;
  @ApiPropertyOptional({ nullable: true }) linea: string | null;
  @ApiPropertyOptional({ nullable: true }) modelo: number | null;
  @ApiPropertyOptional({ nullable: true }) cilindraje: number | null;
  @ApiPropertyOptional({ nullable: true }) color: string | null;
  @ApiPropertyOptional({ nullable: true }) numeroMotor: string | null;
  @ApiPropertyOptional({ nullable: true }) numeroChasis: string | null;
}

class MotivoEnSolicitudDto {
  @ApiProperty() id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() requiereSoporte: boolean;
}

/**
 * Detalle completo de una solicitud para revisión del funcionario.
 * GET /api/v1/solicitudes/:id
 *
 * Nota de seguridad: documentos NO incluyen storage_key; solo metadata pública.
 */
export class SolicitudDetalleDto {
  @ApiProperty() id: string;
  @ApiProperty() numeroRadicado: string;
  @ApiProperty({ enum: EstadoSolicitud }) estado: EstadoSolicitud;
  @ApiProperty({ type: CiudadanoDetalleEnSolicitudDto }) ciudadano: CiudadanoDetalleEnSolicitudDto;
  @ApiProperty({ type: MotocicletaDetalleEnSolicitudDto })
  motocicleta: MotocicletaDetalleEnSolicitudDto;
  @ApiProperty({ type: MotivoEnSolicitudDto }) motivo: MotivoEnSolicitudDto;
  @ApiProperty() fechaInicio: string;
  @ApiProperty() fechaFin: string;
  @ApiPropertyOptional({ nullable: true }) descripcionAdicional: string | null;
  @ApiProperty() declaracionJurada: boolean;
  @ApiProperty({ type: [DocumentoItemDto] }) documentos: DocumentoItemDto[];
  @ApiProperty({ type: [HistorialEstadoItemDto] }) historial: HistorialEstadoItemDto[];
  @ApiPropertyOptional({
    nullable: true,
    description: 'Presente solo si la solicitud fue aprobada',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      codigoPermiso: { type: 'string' },
    },
  })
  permiso: { id: string; codigoPermiso: string } | null;
  @ApiProperty() createdAt: string;
  @ApiPropertyOptional({ nullable: true }) updatedAt: string | null;
}
