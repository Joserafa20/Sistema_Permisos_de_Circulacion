import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IConfiguracionInstitucionalRepository } from '../../domain/ports/configuracion-institucional.repository.interface';
import { ConfiguracionInstitucional } from '../../domain/entities/configuracion-institucional.entity';
import { ConfiguracionInstitucionalEntity } from './configuracion-institucional.entity';
import { ConfiguracionInstitucionalMapper } from './configuracion-institucional.mapper';

@Injectable()
export class TypeOrmConfiguracionInstitucionalRepository implements IConfiguracionInstitucionalRepository {
  constructor(
    @InjectRepository(ConfiguracionInstitucionalEntity)
    private readonly repo: Repository<ConfiguracionInstitucionalEntity>,
  ) {}

  async findSingleton(): Promise<ConfiguracionInstitucional | null> {
    const entity = await this.repo.findOne({
      where: {},
      relations: ['updatedBy'],
    });
    return entity ? ConfiguracionInstitucionalMapper.toDomain(entity) : null;
  }

  async update(
    data: Partial<
      Omit<ConfiguracionInstitucional, 'id' | 'escudoStorageKey' | 'logoStorageKey'>
    > & {
      updatedById: string | null;
    },
  ): Promise<ConfiguracionInstitucional> {
    const existing = await this.repo.findOne({ where: {}, relations: ['updatedBy'] });
    if (!existing) {
      throw new Error('No existe configuración institucional para actualizar');
    }

    const { updatedById, ...fields } = data;

    if (fields.nombreAlcaldia !== undefined) existing.nombreAlcaldia = fields.nombreAlcaldia;
    if (fields.nit !== undefined) existing.nit = fields.nit;
    if (fields.codigoDane !== undefined) existing.codigoDane = fields.codigoDane;
    if (fields.departamento !== undefined) existing.departamento = fields.departamento;
    if (fields.municipio !== undefined) existing.municipio = fields.municipio;
    if (fields.direccion !== undefined) existing.direccion = fields.direccion;
    if (fields.telefono !== undefined) existing.telefono = fields.telefono;
    if (fields.correoInstitucional !== undefined)
      existing.correoInstitucional = fields.correoInstitucional;
    if (fields.sitioWeb !== undefined) existing.sitioWeb = fields.sitioWeb ?? null;

    if (updatedById) {
      existing.updatedBy = { id: updatedById } as typeof existing.updatedBy;
    } else {
      existing.updatedBy = null;
    }

    const saved = await this.repo.save(existing);
    return ConfiguracionInstitucionalMapper.toDomain(saved);
  }

  async updateImagen(
    tipo: 'logo' | 'escudo',
    storageKey: string,
    hash: string,
    updatedById: string,
  ): Promise<ConfiguracionInstitucional> {
    const existing = await this.repo.findOne({ where: {}, relations: ['updatedBy'] });
    if (!existing) throw new Error('No existe configuración institucional');

    if (tipo === 'logo') {
      existing.logoStorageKey = storageKey;
      existing.logoHash = hash;
    } else {
      existing.escudoStorageKey = storageKey;
      existing.escudoHash = hash;
    }
    existing.updatedBy = { id: updatedById } as typeof existing.updatedBy;

    const saved = await this.repo.save(existing);
    return ConfiguracionInstitucionalMapper.toDomain(saved);
  }
}
