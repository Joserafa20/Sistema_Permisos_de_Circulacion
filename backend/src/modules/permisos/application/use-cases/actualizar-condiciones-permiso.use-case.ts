import { Inject, Injectable } from '@nestjs/common';
import { EstadoPermiso, AccionAuditoria } from '../../../../common/enums';
import { BusinessRuleException, NotFoundException } from '../../../../common/exceptions';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';
import { ActualizarCondicionesDto } from '../dtos/actualizar-condiciones.dto';

export class ActualizarCondicionesResponseDto {
  id: string;
  codigoPermiso: string;
  condicionesRestricciones: string | null;
}

@Injectable()
export class ActualizarCondicionesPermisoUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async ejecutar(
    permisoId: string,
    dto: ActualizarCondicionesDto,
    usuarioId: string,
    ipAddress: string | null,
  ): Promise<ActualizarCondicionesResponseDto> {
    const permiso = await this.permisoRepo.findById(permisoId);
    if (!permiso) throw new NotFoundException('Permiso no encontrado');

    if (permiso.estado !== EstadoPermiso.VIGENTE) {
      throw new BusinessRuleException(
        'Solo se pueden editar condiciones de permisos vigentes',
        'PERMISO_NO_VIGENTE',
      );
    }

    const valorAnterior = permiso.condicionesRestricciones;
    const nuevoValor = dto.condicionesRestricciones ?? null;

    const actualizado = await this.permisoRepo.actualizarCondiciones(permisoId, nuevoValor);

    // Auditoría con datos anteriores y nuevos (API_FUNCIONAL §14, RN-38)
    void this.auditoriaService.registrar({
      usuarioId,
      accion: AccionAuditoria.EDITAR_CONDICIONES_PERMISO,
      entidad: 'permiso',
      entidadId: permisoId,
      ipAddress,
      datosAnteriores: { condicionesRestricciones: valorAnterior },
      datosNuevos: { condicionesRestricciones: nuevoValor },
    });

    return {
      id: actualizado.id,
      codigoPermiso: actualizado.codigoPermiso,
      condicionesRestricciones: actualizado.condicionesRestricciones,
    };
  }
}
