import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResultadoQrValidacion } from '../../../../common/enums';

/**
 * Respuesta del endpoint público de verificación QR.
 * Siempre HTTP 200 — el resultado se comunica en `resultado` (RN-34).
 */
export class VerificarQrResponseDto {
  @ApiProperty({ enum: ResultadoQrValidacion })
  resultado: ResultadoQrValidacion;

  @ApiPropertyOptional({ nullable: true }) codigoPermiso?: string;
  @ApiPropertyOptional({ nullable: true }) titular?: string;
  @ApiPropertyOptional({ nullable: true }) tipoDocumento?: string;
  @ApiPropertyOptional({ nullable: true }) numeroDocumento?: string;
  @ApiPropertyOptional({ nullable: true }) placa?: string;
  @ApiPropertyOptional({ nullable: true }) marca?: string;
  @ApiPropertyOptional({ nullable: true }) linea?: string;
  @ApiPropertyOptional({ nullable: true }) modelo?: number;
  @ApiPropertyOptional({ nullable: true }) color?: string;
  @ApiPropertyOptional({ nullable: true }) motivo?: string;
  @ApiPropertyOptional({ nullable: true }) fechaExpedicion?: string;
  @ApiPropertyOptional({ nullable: true }) fechaVencimiento?: string;
  @ApiPropertyOptional({ nullable: true }) estadoPermiso?: string;
  @ApiPropertyOptional({ nullable: true }) funcionarioAutorizo?: string;
  @ApiPropertyOptional({ nullable: true }) condicionesRestricciones?: string | null;
  @ApiPropertyOptional({ nullable: true }) mensaje?: string;
}
