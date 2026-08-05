import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumentoIdentidad } from '../../../../common/enums';

class MunicipioBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() departamento: string;
}

class MotocicletaBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() placa: string;
  @ApiPropertyOptional({ nullable: true }) marca: string | null;
  @ApiPropertyOptional({ nullable: true }) modelo: number | null;
  @ApiProperty() activo: boolean;
}

export class CiudadanoDetalleDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: TipoDocumentoIdentidad }) tipoDocumento: TipoDocumentoIdentidad;
  @ApiProperty() numeroDocumento: string;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiPropertyOptional({ nullable: true }) fechaNacimiento: string | null;
  @ApiPropertyOptional({ nullable: true }) direccion: string | null;
  @ApiPropertyOptional({ nullable: true }) barrio: string | null;
  @ApiPropertyOptional({ nullable: true }) celular: string | null;
  @ApiPropertyOptional({ nullable: true }) email: string | null;
  @ApiProperty() aceptaTratamientoDatos: boolean;
  @ApiPropertyOptional({ nullable: true }) fechaAceptacionDatos: string | null;
  @ApiPropertyOptional({ type: MunicipioBriefDto, nullable: true })
  municipio: MunicipioBriefDto | null;
  @ApiProperty({ type: MotocicletaBriefDto, isArray: true }) motocicletas: MotocicletaBriefDto[];
  @ApiProperty() totalSolicitudes: number;
  @ApiProperty() createdAt: string;
  @ApiPropertyOptional({ nullable: true }) updatedAt: string | null;
}
