import { Injectable, Inject } from '@nestjs/common';
import {
  IConfiguracionInstitucionalRepository,
  CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN,
} from '../../../domain/ports/configuracion-institucional.repository.interface';
import { NotFoundException } from '../../../../../common/exceptions';
import { ConfiguracionInstitucionalMapper } from '../../../infrastructure/persistence/configuracion-institucional.mapper';
import { ActualizarConfiguracionInstitucionalDto } from './actualizar-configuracion-institucional.dto';
import { ConfiguracionInstitucionalResponseDto } from '../obtener-configuracion-institucional/configuracion-institucional-response.dto';

export interface ActualizarConfiguracionInstitucionalCommand extends ActualizarConfiguracionInstitucionalDto {
  usuarioId: string;
}

@Injectable()
export class ActualizarConfiguracionInstitucionalUseCase {
  constructor(
    @Inject(CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN)
    private readonly repository: IConfiguracionInstitucionalRepository,
  ) {}

  async execute(
    command: ActualizarConfiguracionInstitucionalCommand,
  ): Promise<ConfiguracionInstitucionalResponseDto> {
    const existing = await this.repository.findSingleton();
    if (!existing) {
      throw new NotFoundException(
        'Configuración institucional no encontrada',
        'CONFIGURACION_INSTITUCIONAL_NOT_FOUND',
      );
    }

    const { usuarioId, ...data } = command;
    const updated = await this.repository.update({ ...data, updatedById: usuarioId });
    return ConfiguracionInstitucionalMapper.toResponseDto(updated);
  }
}
