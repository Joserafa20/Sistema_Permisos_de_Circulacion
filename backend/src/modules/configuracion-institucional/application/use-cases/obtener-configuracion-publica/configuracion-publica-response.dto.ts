import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfiguracionPublicaResponseDto {
  @ApiProperty({ example: 'Alcaldía Municipal de Neiva' })
  nombreAlcaldia: string;

  @ApiProperty({ example: 'Neiva' })
  municipio: string;

  @ApiProperty({ example: 'Huila' })
  departamento: string;

  @ApiProperty({ example: 'contacto@alcaldianeiva.gov.co' })
  correoInstitucional: string;

  @ApiProperty({ example: '(608) 871-0000' })
  telefono: string;

  @ApiPropertyOptional({ example: 'https://www.alcaldianeiva.gov.co', nullable: true })
  sitioWeb: string | null;

  @ApiProperty({ description: 'Indica si el escudo está disponible para mostrar', example: true })
  tieneEscudo: boolean;
}
