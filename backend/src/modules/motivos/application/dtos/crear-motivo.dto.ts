import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CrearMotivoDto {
  @ApiProperty({ description: 'Nombre del motivo (único)', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción ampliada del motivo', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Si el ciudadano debe adjuntar soporte documental',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiereSoporte?: boolean;

  @ApiPropertyOptional({ description: 'Orden de presentación en el formulario', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
