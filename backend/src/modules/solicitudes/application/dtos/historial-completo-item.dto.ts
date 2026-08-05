import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitud } from '../../../../common/enums';

class HistorialUsuarioCompletoDto {
  @ApiProperty() id: string;
  @ApiProperty({ description: 'Nombre completo del funcionario' }) nombre: string;
  @ApiPropertyOptional({ nullable: true }) rol: string | null;
}

/**
 * Ítem del historial para el endpoint standalone GET /solicitudes/{id}/historial.
 * Incluye ipAddress y datos extendidos del usuario (id, rol) que no se exponen
 * en el detalle de la solicitud (SolicitudDetalleDto.historial).
 */
export class HistorialCompletoItemDto {
  @ApiProperty() id: string;
  @ApiPropertyOptional({ enum: EstadoSolicitud, nullable: true })
  estadoAnterior: EstadoSolicitud | null;
  @ApiProperty({ enum: EstadoSolicitud }) estadoNuevo: EstadoSolicitud;
  @ApiPropertyOptional({ nullable: true }) motivo: string | null;
  @ApiPropertyOptional({ nullable: true }) camposCorreccion: Record<string, unknown> | null;
  @ApiPropertyOptional({ nullable: true, type: HistorialUsuarioCompletoDto })
  usuario: HistorialUsuarioCompletoDto | null;
  @ApiPropertyOptional({ nullable: true, description: 'IP del solicitante o funcionario' })
  ipAddress: string | null;
  @ApiProperty() createdAt: string;
}
