import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class CampoCorreccionItemDto {
  @ApiProperty({ description: 'Nombre del campo o tipo de documento a corregir', example: 'soat' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  campo: string;

  @ApiProperty({
    description: 'Instrucción clara para el ciudadano sobre qué corregir',
    example: 'El SOAT adjunto está vencido. Debe adjuntar el SOAT vigente.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  descripcion: string;
}

/** Body del endpoint POST /solicitudes/{id}/correccion (RN-04, RN-16). */
export class SolicitarCorreccionDto {
  @ApiProperty({
    description: 'Explicación general de las correcciones requeridas.',
    minLength: 20,
    maxLength: 500,
    example: 'Los documentos adjuntos están incompletos o desactualizados.',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  motivo: string;

  @ApiProperty({
    description:
      'Lista de campos específicos a corregir. Al menos 1 ítem. ' +
      'Se almacena en historial_estados.campos_correccion (RN-16).',
    type: [CampoCorreccionItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CampoCorreccionItemDto)
  camposCorreccion: CampoCorreccionItemDto[];
}
