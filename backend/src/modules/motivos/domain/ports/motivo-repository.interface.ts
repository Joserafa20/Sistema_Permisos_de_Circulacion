import { MotivoDomainEntity } from '../entities/motivo.domain-entity';

export const MOTIVO_REPOSITORY_TOKEN = Symbol('IMotivoRepository');

export interface IMotivoRepository {
  findById(id: string): Promise<MotivoDomainEntity | null>;
  findActivos(): Promise<MotivoDomainEntity[]>;
}
