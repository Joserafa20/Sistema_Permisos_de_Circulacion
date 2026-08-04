import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccionAuditoria } from '../../../../common/enums';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { MinioStorageAdapter } from '../../../storage/infrastructure/services/minio-storage.adapter';
import { DocumentoEntity } from '../../infrastructure/persistence/documento.entity';
import { DocumentoUrlDto } from '../dtos/documento-url.dto';

/** TTL URL firmada documentos: 5 minutos (RN-53, API_FUNCIONAL §13). */
const DOC_URL_TTL_SECONDS = 300;

@Injectable()
export class ObtenerUrlDocumentoUseCase {
  constructor(
    @InjectRepository(DocumentoEntity)
    private readonly documentoRepo: Repository<DocumentoEntity>,
    private readonly storageAdapter: MinioStorageAdapter,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(
    solicitudId: string,
    docId: string,
    usuarioId: string,
    ipAddress: string | null,
  ): Promise<DocumentoUrlDto> {
    const documento = await this.documentoRepo.findOne({
      where: { id: docId, solicitud: { id: solicitudId }, activo: true },
    });

    if (!documento) {
      throw new NotFoundException('Documento no encontrado', 'DOCUMENTO_NO_ENCONTRADO');
    }

    const url = await this.storageAdapter.getSignedUrl(
      this.storageAdapter.bucketDocs,
      documento.storageKey,
      DOC_URL_TTL_SECONDS,
    );

    const expiraEn = new Date(Date.now() + DOC_URL_TTL_SECONDS * 1000).toISOString();

    void this.auditoriaService.registrar({
      accion: AccionAuditoria.DESCARGAR_DOCUMENTO,
      entidad: 'documentos',
      entidadId: docId,
      datosNuevos: { accion: 'descarga_documento', solicitudId },
      ipAddress,
      usuarioId,
    });

    return {
      url,
      expiraEn,
      nombreOriginal: documento.nombreOriginal,
      mimeType: documento.mimeType,
    };
  }
}
