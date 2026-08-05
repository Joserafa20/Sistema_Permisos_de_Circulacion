import { ApiProperty } from '@nestjs/swagger';

/** Respuesta del endpoint GET /solicitudes/{id}/documentos/{docId} (API_FUNCIONAL §13). */
export class DocumentoUrlDto {
  @ApiProperty({ description: 'URL firmada con TTL 5 minutos. storage_key nunca se expone.' })
  url: string;

  @ApiProperty({ description: 'Timestamp ISO 8601 de expiración de la URL firmada' })
  expiraEn: string;

  @ApiProperty()
  nombreOriginal: string;

  @ApiProperty()
  mimeType: string;
}
