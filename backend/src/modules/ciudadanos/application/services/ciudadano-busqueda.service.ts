import { Inject, Injectable } from '@nestjs/common';
import {
  ICiudadanoRepository,
  CIUDADANO_REPOSITORY_TOKEN,
} from '../../domain/ports/ciudadano-repository.interface';
import { CiudadanoDomainEntity } from '../../domain/entities/ciudadano.domain-entity';

/**
 * Servicio interno de búsqueda de ciudadanos.
 *
 * Exportado desde CiudadanosModule para que SolicitudesModule lo inyecte
 * sin depender directamente del repositorio ni duplicar lógica de búsqueda.
 *
 * Cuando se implemente POST /api/v1/solicitudes, este servicio también
 * expondrá el método `buscarOCrear()` que centraliza la lógica de
 * "upsert de ciudadano" dentro del flujo de creación de solicitud.
 */
@Injectable()
export class CiudadanoBusquedaService {
  constructor(
    @Inject(CIUDADANO_REPOSITORY_TOKEN)
    private readonly ciudadanoRepo: ICiudadanoRepository,
  ) {}

  async buscarPorId(id: string): Promise<CiudadanoDomainEntity | null> {
    return this.ciudadanoRepo.findById(id);
  }

  async buscarPorDocumento(numeroDocumento: string): Promise<CiudadanoDomainEntity | null> {
    return this.ciudadanoRepo.findByNumeroDocumento(numeroDocumento);
  }
}
