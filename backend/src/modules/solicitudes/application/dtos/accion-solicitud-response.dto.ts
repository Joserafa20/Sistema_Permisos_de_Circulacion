import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitud } from '../../../../common/enums';

/** Respuesta común para las acciones de flujo de solicitud (aprobar, rechazar, corregir). */
export class AccionSolicitudResponseDto {
  @ApiProperty() solicitudId: string;
  @ApiProperty() numeroRadicado: string;
  @ApiProperty({ enum: EstadoSolicitud }) estado: EstadoSolicitud;
  @ApiPropertyOptional({ nullable: true }) mensaje: string | null;
}
