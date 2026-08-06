import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class AprobarSolicitudDto {
  /** Fecha de vencimiento del permiso (YYYY-MM-DD). Si se omite, usa la fecha fin de la solicitud. */
  @ApiPropertyOptional({
    description:
      'Fecha de vencimiento del permiso (YYYY-MM-DD). Por defecto: fecha fin de la solicitud.',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'fechaVencimiento debe ser una fecha válida (YYYY-MM-DD)' })
  fechaVencimiento?: string;

  @ApiPropertyOptional({ description: 'Condiciones o restricciones del permiso.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  condicionesRestricciones?: string | null;
}
