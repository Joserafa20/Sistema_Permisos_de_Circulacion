import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumentoAdjunto } from '../../../../common/enums';

/**
 * DTO público del documento adjunto.
 * NUNCA incluye storage_key — los accesos son exclusivamente por URL firmada con TTL 5 min.
 */
export class DocumentoItemDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: TipoDocumentoAdjunto }) tipoDocumento: TipoDocumentoAdjunto;
  @ApiProperty() nombreOriginal: string;
  @ApiProperty() mimeType: string;
  @ApiProperty() tamanoBytes: number;
  @ApiPropertyOptional() activo: boolean;
  @ApiProperty() createdAt: string;
}
