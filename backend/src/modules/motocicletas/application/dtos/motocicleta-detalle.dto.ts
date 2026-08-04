import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CiudadanoBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiProperty() numeroDocumento: string;
}

export class MotocicletaDetalleDto {
  @ApiProperty() id: string;
  @ApiProperty() placa: string;
  @ApiPropertyOptional({ nullable: true }) marca: string | null;
  @ApiPropertyOptional({ nullable: true }) linea: string | null;
  @ApiPropertyOptional({ nullable: true }) modelo: number | null;
  @ApiPropertyOptional({ nullable: true }) cilindraje: number | null;
  @ApiPropertyOptional({ nullable: true }) color: string | null;
  @ApiPropertyOptional({ nullable: true }) numeroMotor: string | null;
  @ApiPropertyOptional({ nullable: true }) numeroChasis: string | null;
  @ApiProperty() activo: boolean;
  @ApiProperty({ type: CiudadanoBriefDto }) ciudadano: CiudadanoBriefDto;
  @ApiProperty() createdAt: string;
  @ApiPropertyOptional({ nullable: true }) updatedAt: string | null;
}
