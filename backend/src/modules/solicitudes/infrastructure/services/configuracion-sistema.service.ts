import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionEntity } from '../../../configuracion/infrastructure/persistence/configuracion.entity';

@Injectable()
export class ConfiguracionSistemaService {
  constructor(
    @InjectRepository(ConfiguracionEntity)
    private readonly repo: Repository<ConfiguracionEntity>,
  ) {}

  /** Lee días máximos de permiso desde la tabla configuracion. Default: 30. */
  async obtenerDiasMaxPermiso(): Promise<number> {
    const config = await this.repo.findOne({ where: { clave: 'dias_max_permiso' } });
    if (!config?.valor) return 30;
    const val = parseInt(config.valor, 10);
    return isNaN(val) || val <= 0 ? 30 : val;
  }

  /** Horas máximas antes de que una solicitud RECIBIDA pase a VENCIDA (RN-08). Default: 48h. */
  async obtenerPlazoRevisionHoras(): Promise<number> {
    const config = await this.repo.findOne({ where: { clave: 'plazo_revision_horas' } });
    if (!config?.valor) return 48;
    const val = parseInt(config.valor, 10);
    return isNaN(val) || val <= 0 ? 48 : val;
  }

  /** Días máximos antes de que una solicitud PENDIENTE_CORRECCION pase a VENCIDA (RN-08). Default: 5. */
  async obtenerPlazoCorreccionDias(): Promise<number> {
    const config = await this.repo.findOne({ where: { clave: 'plazo_correccion_dias' } });
    if (!config?.valor) return 5;
    const val = parseInt(config.valor, 10);
    return isNaN(val) || val <= 0 ? 5 : val;
  }
}
