import { Injectable, Inject } from '@nestjs/common';
import {
  IConfiguracionInstitucionalRepository,
  CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN,
} from '../../../domain/ports/configuracion-institucional.repository.interface';
import { NotFoundException } from '../../../../../common/exceptions';
import { ConfiguracionPublicaResponseDto } from './configuracion-publica-response.dto';

@Injectable()
export class ObtenerConfiguracionPublicaUseCase {
  constructor(
    @Inject(CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN)
    private readonly repository: IConfiguracionInstitucionalRepository,
  ) {}

  async execute(): Promise<ConfiguracionPublicaResponseDto> {
    const config = await this.repository.findSingleton();
    if (!config) {
      throw new NotFoundException(
        'Configuración institucional no disponible',
        'CONFIGURACION_INSTITUCIONAL_NOT_FOUND',
      );
    }

    return {
      nombreAlcaldia: config.nombreAlcaldia,
      municipio: config.municipio,
      departamento: config.departamento,
      correoInstitucional: config.correoInstitucional,
      telefono: config.telefono,
      sitioWeb: config.sitioWeb,
      tieneEscudo: Boolean(config.escudoStorageKey),
    };
  }
}
