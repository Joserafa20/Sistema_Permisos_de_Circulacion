import { ConfiguracionInstitucional } from '../entities/configuracion-institucional.entity';

export const CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN = Symbol(
  'IConfiguracionInstitucionalRepository',
);

export interface IConfiguracionInstitucionalRepository {
  findSingleton(): Promise<ConfiguracionInstitucional | null>;
  update(
    data: Partial<
      Omit<ConfiguracionInstitucional, 'id' | 'escudoStorageKey' | 'logoStorageKey'>
    > & {
      updatedById: string | null;
    },
  ): Promise<ConfiguracionInstitucional>;
}
