import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfiguracionInstitucionalResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Alcaldía Municipal de Neiva' })
  nombreAlcaldia: string;

  @ApiProperty({ example: '800.099.999-9' })
  nit: string;

  @ApiProperty({ example: '41001' })
  codigoDane: string;

  @ApiProperty({ example: 'Huila' })
  departamento: string;

  @ApiProperty({ example: 'Neiva' })
  municipio: string;

  @ApiProperty({ example: 'Calle 10 # 5-20, Centro Administrativo' })
  direccion: string;

  @ApiProperty({ example: '(608) 871-0000' })
  telefono: string;

  @ApiProperty({ example: 'contacto@alcaldianeiva.gov.co' })
  correoInstitucional: string;

  @ApiPropertyOptional({ example: 'https://www.alcaldianeiva.gov.co', nullable: true })
  sitioWeb: string | null;

  @ApiProperty({ description: 'Indica si el escudo ha sido configurado', example: true })
  tieneEscudo: boolean;

  @ApiProperty({ description: 'Indica si el logo ha sido configurado', example: false })
  tieneLogo: boolean;

  @ApiPropertyOptional({ nullable: true, example: '2026-08-03T10:00:00.000Z' })
  updatedAt: string | null;
}
