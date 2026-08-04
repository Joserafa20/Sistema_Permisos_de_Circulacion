import { Inject, Injectable } from '@nestjs/common';
import {
  ISolicitudRepository,
  SOLICITUD_REPOSITORY_TOKEN,
} from '../../domain/ports/solicitud-repository.interface';
import { SolicitudDomainEntity } from '../../domain/entities/solicitud.domain-entity';

/**
 * Servicio interno de búsqueda de solicitudes.
 *
 * Exportado desde SolicitudesModule para que otros módulos (ej: PermisosModule)
 * puedan consultar solicitudes sin acceder directamente al repositorio.
 */
@Injectable()
export class SolicitudBusquedaService {
  constructor(
    @Inject(SOLICITUD_REPOSITORY_TOKEN)
    private readonly solicitudRepo: ISolicitudRepository,
  ) {}

  async buscarPorId(id: string): Promise<SolicitudDomainEntity | null> {
    return this.solicitudRepo.findById(id);
  }

  async buscarPorRadicado(numeroRadicado: string): Promise<SolicitudDomainEntity | null> {
    return this.solicitudRepo.findByNumeroRadicado(numeroRadicado);
  }

  async buscarPorRadicadoYDocumento(
    numeroRadicado: string,
    numeroDocumento: string,
  ): Promise<SolicitudDomainEntity | null> {
    return this.solicitudRepo.findByRadicadoAndDocumento(numeroRadicado, numeroDocumento);
  }

  /** Verifica RN-03: si la moto tiene solicitud activa. */
  async verificarSolicitudActiva(
    motocicletaId: string,
  ): Promise<{ activa: boolean; numeroRadicado?: string }> {
    return this.solicitudRepo.hasActivaSolicitud(motocicletaId);
  }
}
