import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ActualizarUsuarioDto {
  @ApiPropertyOptional({ description: 'Nombre del usuario', maxLength: 100, example: 'Carlos' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  nombre?: string;

  @ApiPropertyOptional({ description: 'Apellido del usuario', maxLength: 100, example: 'García' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  apellido?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico institucional — se valida unicidad si cambia',
    maxLength: 150,
    example: 'carlos.garcia@alcaldia.gov.co',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  @MinLength(5)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  @ApiPropertyOptional({ description: 'UUID del nuevo rol', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  rolId?: string;

  @ApiPropertyOptional({
    description: 'UUID de la dependencia. Enviar null para quitar la dependencia.',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  dependenciaId?: string | null;

  @ApiPropertyOptional({
    description: 'Estado activo del usuario. El administrador no puede desactivarse a sí mismo.',
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description:
      'Cuando es true, elimina el bloqueo temporal del usuario (bloqueadoHasta = null). Ignorado si el usuario no está bloqueado.',
  })
  @IsOptional()
  @IsBoolean()
  desbloquear?: boolean;
}
