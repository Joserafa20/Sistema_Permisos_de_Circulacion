import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AccionAuditoria, EstadoSolicitud, TipoDocumentoAdjunto } from '../../../../common/enums';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { MinioStorageAdapter } from '../../../storage/infrastructure/services/minio-storage.adapter';
import { DocumentoEntity } from '../../infrastructure/persistence/documento.entity';
import { SolicitudEntity } from '../../infrastructure/persistence/solicitud.entity';
import {
  ISolicitudRepository,
  SOLICITUD_REPOSITORY_TOKEN,
} from '../../domain/ports/solicitud-repository.interface';
import { DocumentoItemDto } from '../dtos/documento-item.dto';

/** Tipos MIME permitidos para adjuntos del ciudadano (API_FUNCIONAL §13). */
const MIME_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
/** Tamaño máximo en bytes: 10 MB (API_FUNCIONAL §13). */
const TAMANO_MAX_BYTES = 10 * 1024 * 1024;
/** TTL de URL firmada: no aplica en subida, solo en descarga. */

/** Estados que permiten adjuntar documentos (API_FUNCIONAL §13). */
const ESTADOS_ADJUNTAR: EstadoSolicitud[] = [
  EstadoSolicitud.RECIBIDA,
  EstadoSolicitud.PENDIENTE_CORRECCION,
];

export interface AdjuntarDocumentoCommand {
  solicitudId: string;
  radicado: string;
  numeroDocumentoCiudadano: string;
  tipoDocumento: TipoDocumentoAdjunto;
  archivoBuffer: Buffer;
  mimeType: string;
  nombreOriginal: string;
  tamanoBytes: number;
  ipAddress: string | null;
}

@Injectable()
export class AdjuntarDocumentoUseCase {
  constructor(
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
    @InjectRepository(DocumentoEntity)
    private readonly documentoRepo: Repository<DocumentoEntity>,
    private readonly storageAdapter: MinioStorageAdapter,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(cmd: AdjuntarDocumentoCommand): Promise<DocumentoItemDto> {
    const {
      solicitudId,
      radicado,
      numeroDocumentoCiudadano,
      tipoDocumento,
      archivoBuffer,
      mimeType,
      nombreOriginal,
      tamanoBytes,
      ipAddress,
    } = cmd;

    // Validar tipo MIME y tamaño antes de cualquier consulta a BD
    if (!MIME_PERMITIDOS.includes(mimeType)) {
      throw new BusinessRuleException(
        'Tipo de archivo no permitido. Solo PDF, JPG o PNG.',
        'MIME_NO_PERMITIDO',
      );
    }
    if (tamanoBytes > TAMANO_MAX_BYTES) {
      throw new BusinessRuleException(
        'El archivo excede el tamaño máximo permitido de 10 MB.',
        'ARCHIVO_DEMASIADO_GRANDE',
      );
    }

    // Verificar solicitud por ID y validar que radicado + ciudadano coincidan
    const solicitud = await this.solicitudRepo.findByRadicadoAndDocumento(
      radicado,
      numeroDocumentoCiudadano,
    );

    if (!solicitud || solicitud.id !== solicitudId) {
      throw new NotFoundException(
        'No se encontró la solicitud con ese radicado y documento.',
        'SOLICITUD_NO_ENCONTRADA',
      );
    }

    if (!ESTADOS_ADJUNTAR.includes(solicitud.estado)) {
      throw new BusinessRuleException(
        `La solicitud en estado "${solicitud.estado}" no admite adjuntar documentos.`,
        'ESTADO_NO_PERMITIDO',
      );
    }

    // Calcular hash SHA-256 para integridad documental
    const hashSha256 = crypto.createHash('sha256').update(archivoBuffer).digest('hex');

    // Generar storage key único: {solicitudId}/{timestamp}-{hash8}.ext
    const ext = this.extensionDesdeMime(mimeType);
    const storageKey = `${solicitudId}/${Date.now()}-${hashSha256.slice(0, 8)}.${ext}`;

    // Subir a MinIO (bucket de documentos del ciudadano)
    await this.storageAdapter.upload(
      this.storageAdapter.bucketDocs,
      storageKey,
      archivoBuffer,
      mimeType,
    );

    // Persistir metadatos del documento
    const entidad = this.documentoRepo.create({
      tipoDocumento,
      nombreOriginal,
      nombreAlmacenado: storageKey.split('/').pop() ?? storageKey,
      storageKey,
      mimeType,
      tamanoBytes,
      hashSha256,
      activo: true,
      solicitud: { id: solicitudId } as SolicitudEntity,
    });

    const saved = await this.documentoRepo.save(entidad);

    void this.auditoriaService.registrar({
      accion: AccionAuditoria.ADJUNTAR_DOCUMENTO,
      entidad: 'documentos',
      entidadId: saved.id,
      datosNuevos: { tipoDocumento, nombreOriginal, tamanoBytes, solicitudId },
      ipAddress,
      usuarioId: null,
    });

    return this.toDto(saved);
  }

  private extensionDesdeMime(mimeType: string): string {
    const mapa: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
    };
    return mapa[mimeType] ?? 'bin';
  }

  private toDto(e: DocumentoEntity): DocumentoItemDto {
    return {
      id: e.id,
      tipoDocumento: e.tipoDocumento,
      nombreOriginal: e.nombreOriginal,
      mimeType: e.mimeType,
      tamanoBytes: e.tamanoBytes,
      activo: e.activo,
      createdAt: e.createdAt.toISOString(),
    };
  }
}
