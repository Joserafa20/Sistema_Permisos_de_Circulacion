import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumentoIdentidad } from '../../../../common/enums';

class MunicipioBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() departamento: string;
}

export class CiudadanoListItemDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: TipoDocumentoIdentidad }) tipoDocumento: TipoDocumentoIdentidad;
  @ApiProperty() numeroDocumento: string;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiPropertyOptional({ nullable: true }) celular: string | null;
  @ApiPropertyOptional({ nullable: true }) email: string | null;
  @ApiPropertyOptional({ type: MunicipioBriefDto, nullable: true })
  municipio: MunicipioBriefDto | null;
  @ApiProperty() createdAt: string;
}
