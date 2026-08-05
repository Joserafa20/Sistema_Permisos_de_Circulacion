import { Injectable, Inject } from '@nestjs/common';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../../domain/ports/usuario-repository.interface';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { NotFoundException } from '../../../../../common/exceptions';
import { UsuarioMapper } from '../../../infrastructure/persistence/usuario.mapper';
import { UsuarioDetalleDto } from '../../dtos/usuario-detalle.dto';

export interface ObtenerUsuarioPorIdCommand {
  id: string;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class ObtenerUsuarioPorIdUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ObtenerUsuarioPorIdCommand): Promise<UsuarioDetalleDto> {
    const { id, actorId, ipAddress, userAgent } = command;

    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado', 'NOT_FOUND');
    }

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.USUARIO_CONSULTADO,
      entidad: 'usuarios',
      entidadId: id,
      datosNuevos: { consultadoPor: actorId },
      ipAddress,
      userAgent,
      usuarioId: actorId,
    });

    return UsuarioMapper.toDetalleDto(usuario);
  }
}
