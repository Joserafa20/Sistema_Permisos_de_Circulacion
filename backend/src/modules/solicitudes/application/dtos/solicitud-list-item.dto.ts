import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitud } from '../../../../common/enums';

class CiudadanoResumenDto {
  @ApiProperty() nombre: string;
  @ApiProperty() numeroDocumento: string;
  @ApiPropertyOptional({ nullable: true }) email: string | null;
  @ApiPropertyOptional({ nullable: true }) celular: string | null;
}

class MotocicletaResumenDto {
  @ApiProperty() placa: string;
  @ApiPropertyOptional({ nullable: true }) marca: string | null;
  @ApiPropertyOptional({ nullable: true }) modelo: number | null;
}

/**
 * Ítem en el listado paginado para el panel del funcionario.
 * GET /api/v1/solicitudes
 */
export class SolicitudListItemDto {
  @ApiProperty() id: string;
  @ApiProperty() numeroRadicado: string;
  @ApiProperty({ enum: EstadoSolicitud }) estado: EstadoSolicitud;
  @ApiProperty({ type: CiudadanoResumenDto }) ciudadano: CiudadanoResumenDto;
  @ApiProperty({ type: MotocicletaResumenDto }) motocicleta: MotocicletaResumenDto;
  @ApiProperty() motivo: string;
  @ApiProperty() fechaInicio: string;
  @ApiProperty() fechaFin: string;
  @ApiPropertyOptional({ description: 'Tiempo en cola desde la creación, ej: "2 horas"' })
  tiempoEspera: string;
  @ApiProperty() createdAt: string;
}
