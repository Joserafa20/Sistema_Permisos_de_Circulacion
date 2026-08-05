import { Inject, Injectable } from '@nestjs/common';
import {
  IMotivoRepository,
  MOTIVO_REPOSITORY_TOKEN,
} from '../../domain/ports/motivo-repository.interface';
import { MotivoDomainEntity } from '../../domain/entities/motivo.domain-entity';

/**
 * Servicio interno de búsqueda de motivos.
 *
 * Exportado desde MotivosModule para que SolicitudesModule lo inyecte sin
 * acceder directamente al repositorio ni duplicar lógica de negocio.
 */
@Injectable()
export class MotivoBusquedaService {
  constructor(
    @Inject(MOTIVO_REPOSITORY_TOKEN)
    private readonly repo: IMotivoRepository,
  ) {}

  async buscarPorId(id: string): Promise<MotivoDomainEntity | null> {
    return this.repo.findById(id);
  }

  async listarActivos(): Promise<MotivoDomainEntity[]> {
    return this.repo.findActivos();
  }
}
