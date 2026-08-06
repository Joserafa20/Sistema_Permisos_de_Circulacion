import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Equals } from 'class-validator';
import { TipoDocumentoIdentidad } from '../../../../common/enums';

export class CiudadanoEnSolicitudDto {
  @ApiProperty({ enum: TipoDocumentoIdentidad })
  @IsEnum(TipoDocumentoIdentidad)
  tipoDocumento: TipoDocumentoIdentidad;

  @ApiProperty({ maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numeroDocumento: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date (YYYY-MM-DD)', nullable: true })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({ maxLength: 200, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @ApiPropertyOptional({ maxLength: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  barrio?: string;

  @ApiPropertyOptional({ maxLength: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiProperty({ description: 'Consentimiento Ley 1581 — debe ser true' })
  @IsBoolean()
  @Equals(true, { message: 'aceptaTratamientoDatos debe ser true (Ley 1581/2012)' })
  aceptaTratamientoDatos: boolean;
}

export class MotocicletaEnSolicitudDto {
  @ApiProperty({ description: 'Placa colombiana: AAA000 o AAA00A (mayúsculas)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}[0-9]{2}[A-Z0-9]$/, {
    message:
      'placa debe tener el formato colombiano: tres letras, dos dígitos y una letra o dígito (ej. ABC123)',
  })
  placa: string;

  @ApiPropertyOptional({ maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  marca?: string;

  @ApiPropertyOptional({ maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  linea?: string;

  @ApiPropertyOptional({ description: 'Año del modelo', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1900)
  modelo?: number;

  @ApiPropertyOptional({ description: 'Cilindraje en cc', nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  cilindraje?: number;

  @ApiPropertyOptional({ maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({ maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroMotor?: string;

  @ApiPropertyOptional({ maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroChasis?: string;
}

export class CrearSolicitudDto {
  @ApiPropertyOptional({ description: 'Token reCAPTCHA v3 del formulario' })
  @IsOptional()
  @IsString()
  recaptchaToken?: string;

  @ApiProperty({ type: CiudadanoEnSolicitudDto })
  @ValidateNested()
  @Type(() => CiudadanoEnSolicitudDto)
  ciudadano: CiudadanoEnSolicitudDto;

  @ApiProperty({ type: MotocicletaEnSolicitudDto })
  @ValidateNested()
  @Type(() => MotocicletaEnSolicitudDto)
  motocicleta: MotocicletaEnSolicitudDto;

  @ApiProperty({ description: 'UUID del motivo habilitado' })
  @IsString()
  @IsNotEmpty()
  motivoId: string;

  @ApiPropertyOptional({
    description:
      'Fecha de inicio del permiso (YYYY-MM-DD, COT). Si se omite, se usa la fecha actual en COT.',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcionAdicional?: string;

  @ApiProperty({
    description: 'El ciudadano declara la veracidad de la información — debe ser true',
  })
  @IsBoolean()
  @Equals(true, { message: 'declaracionJurada debe ser true' })
  declaracionJurada: boolean;
}
