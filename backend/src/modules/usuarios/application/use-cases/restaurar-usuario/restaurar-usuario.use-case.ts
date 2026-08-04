import { Inject, Injectable } from '@nestjs/common';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { BusinessRuleException, NotFoundException } from '../../../../../common/exceptions';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import { UsuarioMapper } from '../../../infrastructure/persistence/usuario.mapper';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../../domain/ports/usuario-repository.interface';
import { UsuarioDetalleDto } from '../../dtos/usuario-detalle.dto';

export interface RestaurarUsuarioCommand {
  id: string;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class RestaurarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: RestaurarUsuarioCommand): Promise<UsuarioDetalleDto> {
    const { id, actorId, ipAddress, userAgent } = command;

    // Buscar incluyendo eliminados — si no existe en absoluto, 404
    const usuario = await this.usuarioRepo.findByIdWithDeleted(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado', 'NOT_FOUND');
    }

    // RN: solo restaurar si está eliminado
    if (usuario.deletedAt === null) {
      throw new BusinessRuleException(
        'El usuario no está eliminado y no puede ser restaurado',
        'USUARIO_NOT_DELETED',
      );
    }

    const deletedAtAnterior = usuario.deletedAt.toISOString();

    const restored = await this.usuarioRepo.restore(id, actorId);

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.USUARIO_RESTAURADO,
      entidad: 'usuarios',
      entidadId: id,
      datosAnteriores: { deletedAt: deletedAtAnterior },
      datosNuevos: {
        deletedAt: null,
        restauradoPor: actorId,
      },
      ipAddress,
      userAgent,
      usuarioId: actorId,
    });

    return UsuarioMapper.toDetalleDto(restored);
  }
}
