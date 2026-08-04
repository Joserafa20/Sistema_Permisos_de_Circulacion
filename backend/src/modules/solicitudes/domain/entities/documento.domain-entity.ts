import { TipoDocumentoAdjunto } from '../../../../common/enums';

export class DocumentoDomainEntity {
  id: string;
  tipoDocumento: TipoDocumentoAdjunto;
  nombreOriginal: string;
  nombreAlmacenado: string;
  /** Ruta interna en MinIO. NUNCA exponer en API — usar URLs firmadas con TTL 5 min. */
  storageKey: string;
  mimeType: string;
  tamanoBytes: number;
  hashSha256: string;
  activo: boolean;
  createdAt: Date;
  solicitudId: string;
}
