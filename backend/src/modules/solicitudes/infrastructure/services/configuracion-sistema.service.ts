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
}
