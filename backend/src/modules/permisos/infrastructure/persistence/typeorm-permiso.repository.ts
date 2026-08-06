import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  CrearPermisoParams,
  IPermisoRepository,
  ListarPermisosQuery,
  RevocarPermisoParams,
} from '../../domain/ports/permiso-repository.interface';
import { PermisoDomainEntity } from '../../domain/entities/permiso.domain-entity';
import { PermisoEntity } from './permiso.entity';
import { PermisoMapper } from './permiso.mapper';
import { EstadoPermiso } from '../../../../common/enums';

const SORT_FIELD_MAP: Record<string, string> = {
  fechaExpedicion: 'p.fechaExpedicion',
  fechaVencimiento: 'p.fechaVencimiento',
  codigoPermiso: 'p.codigoPermiso',
  estado: 'p.estado',
};

@Injectable()
export class TypeOrmPermisoRepository implements IPermisoRepository {
  constructor(
    @InjectRepository(PermisoEntity)
    private readonly repo: Repository<PermisoEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async crear(params: CrearPermisoParams): Promise<PermisoDomainEntity> {
    const entity = this.repo.create({
      id: params.id,
      codigoPermiso: params.codigoPermiso,
      solicitud: { id: params.solicitudId },
      funcionario: { id: params.funcionarioId },
      codigoQr: params.codigoQr,
      storageKeyPdf: params.storageKeyPdf,
      fechaExpedicion: params.fechaExpedicion,
      fechaVencimiento: params.fechaVencimiento,
      estado: params.estado,
      snapshotCiudadano: params.snapshotCiudadano as unknown as Record<string, unknown>,
      snapshotMotocicleta: params.snapshotMotocicleta as unknown as Record<string, unknown>,
      snapshotMotivo: params.snapshotMotivo as unknown as Record<string, unknown>,
      condicionesRestricciones: params.condicionesRestricciones,
      hashPdf: params.hashPdf,
      motivoRevocacion: null,
      revocadoAt: null,
      revocadoPor: null,
    });

    const saved = await this.repo.save(entity);

    // Recargar con relaciones para el mapper
    const full = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['solicitud', 'funcionario', 'funcionario.dependencia'],
    });

    return PermisoMapper.toDomain(full ?? saved);
  }

  async findById(id: string): Promise<PermisoDomainEntity | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['solicitud', 'funcionario', 'funcionario.dependencia'],
    });
    return entity ? PermisoMapper.toDomain(entity) : null;
  }

  async findMany(
    query: ListarPermisosQuery,
  ): Promise<{ items: PermisoDomainEntity[]; total: number }> {
    const { page, limit, sortBy, sortOrder, estado, placa, documento } = query;

    const sortCol = SORT_FIELD_MAP[sortBy] ?? 'p.fecha_expedicion';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const qb = this.dataSource
      .getRepository(PermisoEntity)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.solicitud', 's')
      .leftJoinAndSelect('s.ciudadano', 'c')
      .leftJoinAndSelect('s.motocicleta', 'm')
      .leftJoinAndSelect('p.funcionario', 'f')
      .leftJoinAndSelect('f.dependencia', 'd');

    if (estado) {
      qb.andWhere('p.estado = :estado', { estado });
    }
    if (query.fechaInicio) {
      qb.andWhere('p.fechaExpedicion >= :fechaInicio', { fechaInicio: query.fechaInicio });
    }
    if (query.fechaFin) {
      qb.andWhere('p.fechaExpedicion <= :fechaFin', { fechaFin: query.fechaFin });
    }
    if (placa) {
      qb.andWhere('UPPER(m.placa) LIKE UPPER(:placa)', { placa: `%${placa}%` });
    }
    if (documento) {
      qb.andWhere('c.numero_documento LIKE :doc', { doc: `%${documento}%` });
    }

    qb.orderBy(sortCol, order).skip(offset).take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      items: entities.map((e) => {
        const domain = PermisoMapper.toDomain(e);
        // Enriquecer con dependencia del funcionario
        if (e.funcionario?.dependencia) {
          domain.funcionarioDependencia = e.funcionario.dependencia.nombre;
        }
        return domain;
      }),
      total,
    };
  }

  async findByCodigoQr(codigoQr: string): Promise<PermisoDomainEntity | null> {
    const entity = await this.repo.findOne({
      where: { codigoQr },
      relations: ['solicitud', 'funcionario', 'funcionario.dependencia'],
    });
    return entity ? PermisoMapper.toDomain(entity) : null;
  }

  async revocar(params: RevocarPermisoParams): Promise<PermisoDomainEntity> {
    await this.repo.update(params.id, {
      estado: EstadoPermiso.REVOCADO,
      motivoRevocacion: params.motivoRevocacion,
      revocadoAt: params.revocadoAt,
      revocadoPor: { id: params.revocadoPorId },
    });

    const entity = await this.repo.findOne({
      where: { id: params.id },
      relations: ['solicitud', 'funcionario', 'funcionario.dependencia', 'revocadoPor'],
    });
    return PermisoMapper.toDomain(entity!);
  }

  async actualizarCondiciones(
    id: string,
    condicionesRestricciones: string | null,
  ): Promise<PermisoDomainEntity> {
    await this.repo.update(id, { condicionesRestricciones });
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['solicitud', 'funcionario', 'funcionario.dependencia'],
    });
    return PermisoMapper.toDomain(entity!);
  }

  /**
   * Marca como VENCIDO todos los permisos vigentes cuya fecha_vencimiento < fechaHoy.
   * Retorna los IDs afectados para registro en auditoría.
   */
  async marcarVencidos(fechaHoy: string): Promise<string[]> {
    const vigentes = await this.repo
      .createQueryBuilder('p')
      .select('p.id', 'id')
      .where('p.estado = :estado', { estado: EstadoPermiso.VIGENTE })
      .andWhere('p.fecha_vencimiento < :fecha', { fecha: fechaHoy })
      .getRawMany<{ id: string }>();

    if (vigentes.length === 0) return [];

    const ids = vigentes.map((r) => r.id);
    await this.repo
      .createQueryBuilder()
      .update(PermisoEntity)
      .set({ estado: EstadoPermiso.VENCIDO })
      .whereInIds(ids)
      .execute();

    return ids;
  }

  /** Retorna true si ya existe un permiso vigente con ese solicitud_id. */
  async existePorSolicitudId(solicitudId: string): Promise<boolean> {
    const count = await this.repo.count({
      where: { solicitud: { id: solicitudId }, estado: EstadoPermiso.VIGENTE },
    });
    return count > 0;
  }
}
