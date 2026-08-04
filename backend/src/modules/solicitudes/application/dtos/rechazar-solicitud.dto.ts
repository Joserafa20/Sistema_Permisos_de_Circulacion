import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** Body del endpoint POST /solicitudes/{id}/rechazar (RN-04). */
export class RechazarSolicitudDto {
  @ApiProperty({
    description: 'Motivo del rechazo. Debe ser descriptivo y accionable para el ciudadano.',
    minLength: 20,
    maxLength: 1000,
    example:
      'Los documentos adjuntos no corresponden al motivo seleccionado. La carta laboral no tiene membrete ni firma del empleador.',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  motivo: string;
}
