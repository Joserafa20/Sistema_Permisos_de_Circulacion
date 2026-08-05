import { MotivoDomainEntity } from '../entities/motivo.domain-entity';

export const MOTIVO_REPOSITORY_TOKEN = Symbol('IMotivoRepository');

export interface CreateMotivoData {
  nombre: string;
  descripcion?: string;
  requiereSoporte?: boolean;
  orden?: number;
}

export interface UpdateMotivoData {
  nombre?: string;
  descripcion?: string;
  requiereSoporte?: boolean;
  orden?: number;
}

export interface IMotivoRepository {
  findById(id: string): Promise<MotivoDomainEntity | null>;
  findActivos(): Promise<MotivoDomainEntity[]>;
  findAll(): Promise<MotivoDomainEntity[]>;
  create(data: CreateMotivoData): Promise<MotivoDomainEntity>;
  update(id: string, data: UpdateMotivoData): Promise<MotivoDomainEntity | null>;
  toggleActivo(id: string): Promise<MotivoDomainEntity | null>;
}
