import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CrearDependenciaDto {
  @ApiProperty({ description: 'Nombre de la dependencia', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ description: 'Código único (ej: TRANS, MOVILIDAD)', maxLength: 20 })
  @IsString()
  @Matches(/^[A-Z0-9_]{2,20}$/, {
    message: 'El código debe ser mayúsculas, números y guion bajo (2-20 caracteres)',
  })
  codigo: string;

  @ApiPropertyOptional({ description: 'Descripción de la dependencia', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
