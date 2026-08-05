import { Inject, Injectable } from '@nestjs/common';
import {
  IMotocicletaRepository,
  MOTOCICLETA_REPOSITORY_TOKEN,
  UpdateMotocicletaData,
} from '../../domain/ports/motocicleta-repository.interface';
import { MotocicletaDomainEntity } from '../../domain/entities/motocicleta.domain-entity';

/**
 * Servicio interno de búsqueda de motocicletas.
 *
 * Exportado desde MotocicletasModule para que SolicitudesModule lo inyecte
 * sin depender directamente del repositorio ni duplicar lógica de búsqueda.
 *
 * Cuando se implemente POST /api/v1/public/solicitudes, este servicio
 * expondrá buscarPorPlaca() para la lógica de "buscar o crear moto" dentro
 * del flujo de creación de solicitud, siguiendo RN-18 (deduplicación por placa).
 */
@Injectable()
export class MotocicletaBusquedaService {
  constructor(
    @Inject(MOTOCICLETA_REPOSITORY_TOKEN)
    private readonly motoRepo: IMotocicletaRepository,
  ) {}

  async buscarPorId(id: string): Promise<MotocicletaDomainEntity | null> {
    return this.motoRepo.findById(id);
  }

  /** Normaliza la placa a UPPER+TRIM antes de buscar (RN-18) */
  async buscarPorPlaca(placa: string): Promise<MotocicletaDomainEntity | null> {
    return this.motoRepo.findByPlaca(placa.trim().toUpperCase());
  }

  /** Actualiza campos técnicos de la moto (sin placa ni ciudadano). Usado por SolicitudesModule */
  async actualizarDatos(id: string, data: UpdateMotocicletaData): Promise<MotocicletaDomainEntity> {
    return this.motoRepo.update(id, data);
  }
}
