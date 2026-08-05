import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitud } from '../../../../common/enums';

class MotocicletaPublicaDto {
  @ApiProperty() placa: string;
}

/**
 * Respuesta pública para GET /api/v1/public/solicitudes/estado
 * El ciudadano identifica su solicitud con radicado + número de documento (RN-20).
 */
export class EstadoPublicoSolicitudDto {
  @ApiProperty() numeroRadicado: string;
  @ApiProperty({ enum: EstadoSolicitud }) estado: EstadoSolicitud;
  @ApiProperty({ description: 'Descripción legible del estado para el ciudadano' })
  estadoDescripcion: string;
  @ApiProperty({ description: 'Fecha de creación de la solicitud (YYYY-MM-DD)' })
  fechaSolicitud: string;
  @ApiProperty({ description: 'Nombre del motivo' }) motivo: string;
  @ApiProperty({ type: MotocicletaPublicaDto }) motocicleta: MotocicletaPublicaDto;
  @ApiProperty({ description: 'Fecha de inicio del permiso solicitado' }) fechaInicio: string;
  @ApiProperty({ description: 'Fecha de fin del permiso solicitado' }) fechaFin: string;
  /**
   * Datos del permiso cuando la solicitud ha sido aprobada.
   * Nulo hasta que PermisosModule genere el permiso (Bloque B6).
   */
  @ApiPropertyOptional({ nullable: true }) permiso: null;
  @ApiProperty({ description: 'Última actualización de la solicitud (ISO 8601)' })
  ultimaActualizacion: string;
}
