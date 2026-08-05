import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitud } from '../../../../common/enums';

export class HistorialUsuarioDto {
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
}

export class HistorialEstadoItemDto {
  @ApiProperty() id: string;
  @ApiPropertyOptional({ enum: EstadoSolicitud, nullable: true })
  estadoAnterior: EstadoSolicitud | null;
  @ApiProperty({ enum: EstadoSolicitud }) estadoNuevo: EstadoSolicitud;
  @ApiPropertyOptional({ nullable: true }) motivo: string | null;
  @ApiPropertyOptional({ nullable: true }) camposCorreccion: Record<string, unknown> | null;
  @ApiPropertyOptional({ nullable: true, type: HistorialUsuarioDto })
  usuario: HistorialUsuarioDto | null;
  @ApiProperty() createdAt: string;
}
