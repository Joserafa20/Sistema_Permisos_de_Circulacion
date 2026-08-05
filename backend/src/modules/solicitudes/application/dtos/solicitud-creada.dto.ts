import { ApiProperty } from '@nestjs/swagger';
import { EstadoSolicitud } from '../../../../common/enums';

/**
 * Respuesta de POST /api/v1/public/solicitudes (HTTP 201).
 * Contiene el número de radicado y el estado inicial para que el ciudadano
 * pueda hacer seguimiento de su solicitud.
 */
export class SolicitudCreadaDto {
  @ApiProperty() id: string;
  @ApiProperty({ description: 'Número de radicado único (AAAAMMDD-PYP-XXXXXX)' })
  numeroRadicado: string;
  @ApiProperty({ enum: EstadoSolicitud }) estado: EstadoSolicitud;
  @ApiProperty({ description: 'Fecha de inicio del permiso (YYYY-MM-DD)' })
  fechaInicio: string;
  @ApiProperty({ description: 'Fecha de fin del permiso (YYYY-MM-DD), calculada por el sistema' })
  fechaFin: string;
  @ApiProperty() motivoNombre: string;
  @ApiProperty() createdAt: string;
}
