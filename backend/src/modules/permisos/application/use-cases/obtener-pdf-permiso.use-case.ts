import { Inject, Injectable } from '@nestjs/common';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';
import { MinioStorageAdapter } from '../../infrastructure/services/minio-storage.adapter';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { PermisoPdfUrlDto } from '../dtos/permiso-list-item.dto';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { AccionAuditoria } from '../../../../common/enums';

/** TTL de la URL firmada: 5 minutos (API_FUNCIONAL §14). */
const PDF_URL_TTL_SECONDS = 300;

@Injectable()
export class ObtenerPdfPermisoUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
    private readonly storageAdapter: MinioStorageAdapter,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(
    id: string,
    usuarioId: string,
    ipAddress: string | null,
  ): Promise<PermisoPdfUrlDto> {
    const permiso = await this.permisoRepo.findById(id);
    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado', 'PERMISO_NO_ENCONTRADO');
    }

    const signedUrl = await this.storageAdapter.getSignedUrl(
      this.storageAdapter.bucketPdfs,
      permiso.storageKeyPdf,
      PDF_URL_TTL_SECONDS,
    );

    const expiraEn = new Date(Date.now() + PDF_URL_TTL_SECONDS * 1000).toISOString();
    const nombreArchivo = `Permiso_${permiso.codigoPermiso}.pdf`;

    void this.auditoriaService.registrar({
      accion: AccionAuditoria.GENERAR_PERMISO,
      entidad: 'permisos',
      entidadId: id,
      datosAnteriores: null,
      datosNuevos: { accion: 'descarga_pdf', codigoPermiso: permiso.codigoPermiso },
      ipAddress,
      usuarioId,
    });

    return { url: signedUrl, expiraEn, codigoPermiso: permiso.codigoPermiso, nombreArchivo };
  }
}
