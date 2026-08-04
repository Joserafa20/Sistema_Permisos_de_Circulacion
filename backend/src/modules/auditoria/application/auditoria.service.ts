import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaRegistroEntity } from '../infrastructure/persistence/auditoria-registro.entity';
import { UsuarioEntity } from '../../usuarios/infrastructure/persistence/usuario.entity';
import { AccionAuditoria } from '../../../common/enums/accion-auditoria.enum';

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
