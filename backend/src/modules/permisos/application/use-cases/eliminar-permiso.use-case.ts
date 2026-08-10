import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { AccionAuditoria } from '../../../../common/enums';

export interface EliminarPermisoResponseDto {
  mensaje: string;
}

@Injectable()
export class EliminarPermisoUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(
    permisoId: string,
    usuarioId: string,
    ipAddress: string | null,
  ): Promise<EliminarPermisoResponseDto> {
    const permiso = await this.permisoRepo.findById(permisoId);
    if (!permiso) throw new NotFoundException('Permiso no encontrado');

    const codigo = permiso.codigoPermiso;
    await this.permisoRepo.eliminar(permisoId);

    void this.auditoriaService.registrar({
      usuarioId,
      accion: AccionAuditoria.ELIMINAR,
      entidad: 'permiso',
      entidadId: permisoId,
      datosAnteriores: { codigoPermiso: codigo },
      ipAddress,
    });

    return { mensaje: `Permiso ${codigo} eliminado permanentemente.` };
  }
}
