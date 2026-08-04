import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEmail,
  IsUrl,
  MinLength,
  Matches,
} from 'class-validator';

export class ActualizarConfiguracionInstitucionalDto {
  @ApiPropertyOptional({ example: 'Alcaldía Municipal de Neiva', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  nombreAlcaldia?: string;

  @ApiPropertyOptional({ example: '800.099.999-9', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nit?: string;

  @ApiPropertyOptional({ example: '41001', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigoDane?: string;

  @ApiPropertyOptional({ example: 'Huila', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string;

  @ApiPropertyOptional({ example: 'Neiva', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  municipio?: string;

  @ApiPropertyOptional({ example: 'Calle 10 # 5-20', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @ApiPropertyOptional({ example: '(608) 871-0000', maxLength: 20 })
  @IsOptional()
  @IsString()
  @Matches(/^[\d\s\(\)\-\+]{7,20}$/, { message: 'Formato de teléfono inválido' })
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@alcaldianeiva.gov.co', maxLength: 150 })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  correoInstitucional?: string;

  @ApiPropertyOptional({ example: 'https://www.alcaldianeiva.gov.co', nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: true })
  @MaxLength(255)
  sitioWeb?: string | null;
}
