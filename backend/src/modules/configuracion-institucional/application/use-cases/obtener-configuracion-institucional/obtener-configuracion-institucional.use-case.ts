import { Injectable, Inject } from '@nestjs/common';
import {
  IConfiguracionInstitucionalRepository,
  CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN,
} from '../../../domain/ports/configuracion-institucional.repository.interface';
import { NotFoundException } from '../../../../../common/exceptions';
import { ConfiguracionInstitucionalMapper } from '../../../infrastructure/persistence/configuracion-institucional.mapper';
import { ConfiguracionInstitucionalResponseDto } from './configuracion-institucional-response.dto';

@Injectable()
export class ObtenerConfiguracionInstitucionalUseCase {
  constructor(
    @Inject(CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN)
    private readonly repository: IConfiguracionInstitucionalRepository,
  ) {}

  async execute(): Promise<ConfiguracionInstitucionalResponseDto> {
    const config = await this.repository.findSingleton();
    if (!config) {
      throw new NotFoundException(
        'Configuración institucional no encontrada',
        'CONFIGURACION_INSTITUCIONAL_NOT_FOUND',
      );
    }
    return ConfiguracionInstitucionalMapper.toResponseDto(config);
  }
}
