import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarCondicionesDto {
  @ApiPropertyOptional({
    description:
      'Condiciones y restricciones específicas. Máx. 500 chars. Enviar null para eliminar (RN-38).',
    maxLength: 500,
    nullable: true,
    example: 'Válido únicamente entre 06:00 y 18:00. Portar cédula en todo momento.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  condicionesRestricciones: string | null;
}
