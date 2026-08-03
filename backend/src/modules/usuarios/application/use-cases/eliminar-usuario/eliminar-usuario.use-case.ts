import { Inject, Injectable } from '@nestjs/common';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { BusinessRuleException, NotFoundException } from '../../../../../common/exceptions';
import { UserRole } from '../../../../../common/decorators/roles.decorator';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../../domain/ports/usuario-repository.interface';

export interface EliminarUsuarioCommand {
  id: string;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface EliminarUsuarioResult {
  id: string;
}

@Injectable()
export class EliminarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: EliminarUsuarioCommand): Promise<EliminarUsuarioResult> {
    const { id, actorId, ipAddress, userAgent } = command;

    // Verificar existencia (excluye ya-eliminados — respeta soft delete)
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado', 'NOT_FOUND');
    }

    // RN: no puede eliminarse a sí mismo
    if (actorId === id) {
      throw new BusinessRuleException(
        'El administrador no puede eliminarse a sí mismo',
        'SELF_DELETE_FORBIDDEN',
      );
    }

    // RN: no puede eliminarse al último administrador activo
    if (usuario.rolNombre === UserRole.ADMINISTRADOR && usuario.activo) {
      const totalAdminsActivos = await this.usuarioRepo.countAdminsActivos();
      if (totalAdminsActivos <= 1) {
        throw new BusinessRuleException(
          'No es posible eliminar al último administrador activo del sistema',
          'LAST_ADMIN_FORBIDDEN',
        );
      }
    }

    await this.usuarioRepo.softDelete(id, actorId);

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.USUARIO_ELIMINADO,
      entidad: 'usuarios',
      entidadId: id,
      datosAnteriores: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rolId: usuario.rolId,
        rolNombre: usuario.rolNombre,
        activo: usuario.activo,
      },
      datosNuevos: { deletedAt: new Date().toISOString(), eliminadoPor: actorId },
      ipAddress,
      userAgent,
      usuarioId: actorId,
    });

    return { id };
  }
}
