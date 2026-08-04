import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ISolicitudRepository,
  ListarSolicitudesQuery,
} from '../../domain/ports/solicitud-repository.interface';
import { SolicitudDomainEntity } from '../../domain/entities/solicitud.domain-entity';
import { SolicitudEntity } from './solicitud.entity';
import { SolicitudMapper } from './solicitud.mapper';
import { EstadoSolicitud } from '../../../../common/enums';

/** Estados que bloquean la creación de una nueva solicitud para la misma moto (RN-03). */
const ESTADOS_ACTIVOS: EstadoSolicitud[] = [
  EstadoSolicitud.RECIBIDA,
  EstadoSolicitud.EN_REVISION,
  EstadoSolicitud.PENDIENTE_CORRECCION,
];

const SORT_FIELD_MAP: Record<string, string> = {
  createdAt: 's.createdAt',
  numeroRadicado: 's.numeroRadicado',
  estado: 's.estado',
  fechaInicio: 's.fechaInicio',
};

@Injectable()
export class TypeOrmSolicitudRepository implements ISolicitudRepository {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly repo: Repository<SolicitudEntity>,
  ) {}

  // ─── Lecturas ──────────────────────────────────────────────────────────────

  async findMany(
    query: ListarSolicitudesQuery,
  ): Promise<{ items: SolicitudDomainEntity[]; total: number }> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      estados,
      fechaDesde,
      fechaHasta,
      documento,
      placa,
      radicado,
      motivoId,
    } = query;

    const estadosFiltro = estados?.length ? estados : ESTADOS_ACTIVOS;

    const qb = this.repo
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.ciudadano', 'ciudadano')
      .innerJoinAndSelect('s.motocicleta', 'motocicleta')
      .innerJoinAndSelect('s.motivo', 'motivo')
      .leftJoinAndSelect('ciudadano.municipio', 'municipio')
      .where('s.deletedAt IS NULL')
      .andWhere('s.estado IN (:...estados)', { estados: estadosFiltro });

    if (fechaDesde) {
      qb.andWhere('s.fechaInicio >= :fechaDesde', { fechaDesde });
    }
    if (fechaHasta) {
      qb.andWhere('s.fechaInicio <= :fechaHasta', { fechaHasta });
    }
    if (documento) {
      qb.andWhere('ciudadano.numeroDocumento ILIKE :documento', {
        documento: `%${documento.trim()}%`,
      });
    }
    if (placa) {
      qb.andWhere('motocicleta.placa ILIKE :placa', {
        placa: `%${placa.trim().toUpperCase()}%`,
      });
    }
    if (radicado) {
      qb.andWhere('s.numeroRadicado ILIKE :radicado', {
        radicado: `%${radicado.trim().toUpperCase()}%`,
      });
    }
    if (motivoId) {
      qb.andWhere('motivo.id = :motivoId', { motivoId });
    }

    const sortColumn = SORT_FIELD_MAP[sortBy] ?? 's.createdAt';
    qb.orderBy(sortColumn, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      items: entities.map((e) => SolicitudMapper.toDomain(e)),
      total,
    };
  }

  async findById(id: string): Promise<SolicitudDomainEntity | null> {
    return this.loadDetail({ id });
  }

  async findByNumeroRadicado(numeroRadicado: string): Promise<SolicitudDomainEntity | null> {
    return this.loadDetail({ numeroRadicado });
  }

  async findByRadicadoAndDocumento(
    numeroRadicado: string,
    numeroDocumento: string,
  ): Promise<SolicitudDomainEntity | null> {
    const entity = await this.repo
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.ciudadano', 'ciudadano')
      .innerJoinAndSelect('s.motocicleta', 'motocicleta')
      .innerJoinAndSelect('s.motivo', 'motivo')
      .leftJoinAndSelect('ciudadano.municipio', 'municipio')
      .where('s.deletedAt IS NULL')
      .andWhere('s.numeroRadicado = :numeroRadicado', { numeroRadicado })
      .andWhere('ciudadano.numeroDocumento = :numeroDocumento', { numeroDocumento })
      .getOne();

    if (!entity) return null;
    return SolicitudMapper.toDomain(entity);
  }

  async hasActivaSolicitud(
    motocicletaId: string,
  ): Promise<{ activa: boolean; numeroRadicado?: string }> {
    const found = await this.repo.findOne({
      where: {
        motocicleta: { id: motocicletaId },
        estado: In(ESTADOS_ACTIVOS),
      },
      select: ['id', 'numeroRadicado'],
    });

    if (!found) return { activa: false };
    return { activa: true, numeroRadicado: found.numeroRadicado };
  }

  // ─── Helper privado ────────────────────────────────────────────────────────

  private async loadDetail(where: Record<string, unknown>): Promise<SolicitudDomainEntity | null> {
    const entity = await this.repo
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.ciudadano', 'ciudadano')
      .innerJoinAndSelect('s.motocicleta', 'motocicleta')
      .innerJoinAndSelect('s.motivo', 'motivo')
      .leftJoinAndSelect('ciudadano.municipio', 'municipio')
      .leftJoinAndSelect('s.historial', 'historial')
      .leftJoinAndSelect('historial.usuario', 'historialUsuario')
      .leftJoinAndSelect('s.documentos', 'documentos')
      .where('s.deletedAt IS NULL')
      .andWhere(
        Object.entries(where)
          .map(([k]) => `s.${k} = :${k}`)
          .join(' AND '),
        where,
      )
      .orderBy('historial.createdAt', 'ASC')
      .addOrderBy('documentos.createdAt', 'ASC')
      .getOne();

    if (!entity) return null;
    return SolicitudMapper.toDomain(entity, { withHistorial: true, withDocumentos: true });
  }
}
