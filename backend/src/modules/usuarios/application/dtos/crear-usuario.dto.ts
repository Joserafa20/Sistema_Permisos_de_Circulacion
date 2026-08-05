import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CrearUsuarioDto {
  @ApiProperty({ description: 'Nombre del usuario', maxLength: 100, example: 'Carlos' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario', maxLength: 100, example: 'García' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico institucional — debe ser único en el sistema',
    maxLength: 150,
    example: 'carlos.garcia@alcaldia.gov.co',
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  @MinLength(5)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @ApiProperty({ description: 'UUID del rol asignado al usuario', format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  rolId: string;

  @ApiPropertyOptional({
    description: 'UUID de la dependencia del usuario (opcional)',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  dependenciaId?: string;
}
