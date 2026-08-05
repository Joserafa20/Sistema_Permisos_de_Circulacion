import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { AuditoriaRegistroEntity } from '../infrastructure/persistence/auditoria-registro.entity';
import { UsuarioEntity } from '../../usuarios/infrastructure/persistence/usuario.entity';
import { AccionAuditoria } from '../../../common/enums/accion-auditoria.enum';
import { ListarAuditoriaQueryDto } from './dtos/listar-auditoria-query.dto';

export interface RegistrarAuditoriaParams {
  accion: AccionAuditoria;
  entidad?: string | null;
  entidadId?: string | null;
  datosAnteriores?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  usuarioId?: string | null;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(AuditoriaRegistroEntity)
    private readonly auditoriaRepo: Repository<AuditoriaRegistroEntity>,
  ) {}

  async listarPaginado(
    query: ListarAuditoriaQueryDto,
  ): Promise<{ items: AuditoriaRegistroEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.accion) where['accion'] = query.accion;
    if (query.entidad) where['entidad'] = ILike(`%${query.entidad}%`);
    if (query.usuarioId) where['usuario'] = { id: query.usuarioId };
    if (query.fechaDesde || query.fechaHasta) {
      const desde = query.fechaDesde ? new Date(`${query.fechaDesde}T00:00:00Z`) : new Date(0);
      const hasta = query.fechaHasta
        ? new Date(`${query.fechaHasta}T23:59:59Z`)
        : new Date('2100-01-01');
      where['createdAt'] = Between(desde, hasta);
    }

    const [items, total] = await this.auditoriaRepo.findAndCount({
      where,
      relations: { usuario: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  async registrar(params: RegistrarAuditoriaParams): Promise<void> {
    const registro = this.auditoriaRepo.create({
      accion: params.accion,
      entidad: params.entidad ?? null,
      entidadId: params.entidadId ?? null,
      datosAnteriores: params.datosAnteriores ?? null,
      datosNuevos: params.datosNuevos ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      usuario: params.usuarioId ? ({ id: params.usuarioId } as UsuarioEntity) : null,
    });
    await this.auditoriaRepo.save(registro).catch(() => undefined);
  }
}
