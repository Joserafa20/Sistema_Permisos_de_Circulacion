import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  CambiarEstadoParams,
  ISolicitudRepository,
  ListarSolicitudesQuery,
  MarcarVencidasParams,
} from '../../domain/ports/solicitud-repository.interface';
import { SolicitudDomainEntity } from '../../domain/entities/solicitud.domain-entity';
import { SolicitudEntity } from './solicitud.entity';
import { HistorialEstadoEntity } from './historial-estado.entity';
import { SolicitudMapper } from './solicitud.mapper';
import { EstadoSolicitud } from '../../../../common/enums';
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';

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
    private readonly dataSource: DataSource,
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

  async marcarEnRevision(
    id: string,
    usuarioId: string | null,
    ipAddress: string | null,
  ): Promise<boolean> {
    return this.dataSource.transaction(async (em) => {
      const result = await em
        .createQueryBuilder()
        .update(SolicitudEntity)
        .set({ estado: EstadoSolicitud.EN_REVISION })
        .where('id = :id AND estado = :estado', { id, estado: EstadoSolicitud.RECIBIDA })
        .execute();

      if (!result.affected || result.affected === 0) return false;

      await em.save(
        HistorialEstadoEntity,
        em.create(HistorialEstadoEntity, {
          estadoAnterior: EstadoSolicitud.RECIBIDA,
          estadoNuevo: EstadoSolicitud.EN_REVISION,
          motivo: null,
          camposCorreccion: null,
          ipAddress,
          solicitud: { id } as SolicitudEntity,
          usuario: usuarioId ? ({ id: usuarioId } as UsuarioEntity) : null,
        }),
      );

      return true;
    });
  }

  async cambiarEstado(params: CambiarEstadoParams): Promise<boolean> {
    const {
      id,
      estadoNuevo,
      estadosPermitidos,
      motivo,
      camposCorreccion,
      usuarioId,
      ipAddress,
      fechaInicioAjustada,
    } = params;

    return this.dataSource.transaction(async (em) => {
      // Leer el estado actual DENTRO de la transacción para obtenerlo como estadoAnterior
      const current = await em.findOne(SolicitudEntity, {
        where: { id },
        select: ['id', 'estado'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!current || !estadosPermitidos.includes(current.estado)) return false;

      const setFields: Record<string, unknown> = { estado: estadoNuevo };
      if (fechaInicioAjustada) {
        setFields.fechaInicio = fechaInicioAjustada;
      }

      await em
        .createQueryBuilder()
        .update(SolicitudEntity)
        .set(setFields)
        .where('id = :id', { id })
        .execute();

      await em.save(
        HistorialEstadoEntity,
        em.create(HistorialEstadoEntity, {
          estadoNuevo,
          estadoAnterior: current.estado,
          motivo,
          camposCorreccion: camposCorreccion ?? null,
          ipAddress,
          solicitud: { id } as SolicitudEntity,
          usuario: usuarioId ? ({ id: usuarioId } as UsuarioEntity) : null,
        }),
      );

      return true;
    });
  }

  async tienePermisoVigenteConSolapamiento(
    motocicletaId: string,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<{ solapamiento: boolean; codigoPermiso?: string }> {
    const row = await this.dataSource
      .createQueryBuilder()
      .select(['p.id AS id', 'p.codigo_permiso AS "codigoPermiso"'])
      .from('permisos', 'p')
      .innerJoin('solicitudes', 's', 'p.solicitud_id = s.id')
      .innerJoin('motocicletas', 'm', 's.motocicleta_id = m.id')
      .where('m.id = :motocicletaId', { motocicletaId })
      .andWhere("p.estado = 'vigente'")
      .andWhere(':fechaInicio::date <= p.fecha_vencimiento::date', { fechaInicio })
      .andWhere(':fechaFin::date >= s.fecha_inicio::date', { fechaFin })
      .andWhere('s.deleted_at IS NULL')
      .getRawOne<{ id: string; codigoPermiso: string } | undefined>();

    if (!row) return { solapamiento: false };
    return { solapamiento: true, codigoPermiso: row.codigoPermiso };
  }

  async marcarVencidas(params: MarcarVencidasParams): Promise<string[]> {
    const { plazoRevisionHoras, plazoCorreccionDias } = params;

    // Solicitudes RECIBIDAS que superaron el plazo de revisión
    const limiteRevision = new Date(Date.now() - plazoRevisionHoras * 60 * 60 * 1000);
    const recibidas = await this.repo
      .createQueryBuilder('s')
      .select('s.id', 'id')
      .where('s.estado = :estado', { estado: EstadoSolicitud.RECIBIDA })
      .andWhere('s.deletedAt IS NULL')
      .andWhere('s.createdAt < :limite', { limite: limiteRevision.toISOString() })
      .getRawMany<{ id: string }>();

    // Solicitudes PENDIENTE_CORRECCION que superaron el plazo de corrección
    const limiteCorreccion = new Date(Date.now() - plazoCorreccionDias * 24 * 60 * 60 * 1000);
    const pendientes = await this.repo
      .createQueryBuilder('s')
      .select('s.id', 'id')
      .where('s.estado = :estado', { estado: EstadoSolicitud.PENDIENTE_CORRECCION })
      .andWhere('s.deletedAt IS NULL')
      .andWhere('s.updatedAt < :limite', { limite: limiteCorreccion.toISOString() })
      .getRawMany<{ id: string }>();

    const idsRecibidas = recibidas.map((r) => r.id);
    const idsPendientes = pendientes.map((r) => r.id);
    const todos = [...idsRecibidas, ...idsPendientes];

    if (todos.length === 0) return [];

    await this.dataSource.transaction(async (em) => {
      // Actualizar estados a VENCIDA
      await em
        .createQueryBuilder()
        .update(SolicitudEntity)
        .set({ estado: EstadoSolicitud.VENCIDA })
        .whereInIds(todos)
        .execute();

      // Insertar historial para recibidas
      for (const id of idsRecibidas) {
        await em.save(
          HistorialEstadoEntity,
          em.create(HistorialEstadoEntity, {
            estadoAnterior: EstadoSolicitud.RECIBIDA,
            estadoNuevo: EstadoSolicitud.VENCIDA,
            motivo: 'Vencimiento automático por superación de plazo de revisión',
            camposCorreccion: null,
            ipAddress: null,
            solicitud: { id } as SolicitudEntity,
            usuario: null,
          }),
        );
      }

      // Insertar historial para pendientes de corrección
      for (const id of idsPendientes) {
        await em.save(
          HistorialEstadoEntity,
          em.create(HistorialEstadoEntity, {
            estadoAnterior: EstadoSolicitud.PENDIENTE_CORRECCION,
            estadoNuevo: EstadoSolicitud.VENCIDA,
            motivo: 'Vencimiento automático por superación de plazo de corrección',
            camposCorreccion: null,
            ipAddress: null,
            solicitud: { id } as SolicitudEntity,
            usuario: null,
          }),
        );
      }
    });

    return todos;
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
      .leftJoinAndSelect('historialUsuario.rol', 'historialUsuarioRol')
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
