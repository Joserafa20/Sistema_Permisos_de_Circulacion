import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';
import { BusinessRuleException, NotFoundException } from '../../../../../common/exceptions';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import { TokenEntity } from '../../../../auth/infrastructure/persistence/token.entity';
import { UsuarioMapper } from '../../../infrastructure/persistence/usuario.mapper';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../../domain/ports/usuario-repository.interface';
import { UsuarioDetalleDto } from '../../dtos/usuario-detalle.dto';

export interface ActivarUsuarioCommand {
  id: string;
  activo: boolean;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class ActivarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepo: IUsuarioRepository,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ActivarUsuarioCommand): Promise<UsuarioDetalleDto> {
    const { id, activo, actorId, ipAddress, userAgent } = command;

    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado', 'NOT_FOUND');
    }

    // El administrador no puede desactivarse a sí mismo
    if (actorId === id && !activo) {
      throw new BusinessRuleException(
        'El administrador no puede desactivarse a sí mismo',
        'SELF_DEACTIVATION_FORBIDDEN',
      );
    }

    // Sin cambio real: devolver sin tocar BD ni auditoría
    if (usuario.activo === activo) {
      return UsuarioMapper.toDetalleDto(usuario);
    }

    const updated = await this.usuarioRepo.update(id, {
      activo,
      updatedById: actorId,
    });

    // Al desactivar: revocar todos los refresh tokens activos (API_FUNCIONAL §7)
    if (!activo) {
      await this.tokenRepo
        .createQueryBuilder()
        .update()
        .set({ revocado: true, revocadoAt: new Date() })
        .where('usuario_id = :userId AND tipo = :tipo AND revocado = false', {
          userId: id,
          tipo: TipoToken.REFRESH,
        })
        .execute();
    }

    await this.auditoriaService.registrar({
      accion: activo ? AccionAuditoria.USUARIO_ACTIVADO : AccionAuditoria.USUARIO_DESACTIVADO,
      entidad: 'usuarios',
      entidadId: id,
      datosAnteriores: { activo: usuario.activo },
      datosNuevos: { activo },
      ipAddress,
      userAgent,
      usuarioId: actorId,
    });

    return UsuarioMapper.toDetalleDto(updated);
  }
}
