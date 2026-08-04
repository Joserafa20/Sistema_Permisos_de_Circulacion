import { Inject, Injectable } from '@nestjs/common';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';
import { PermisoDetalleDto } from '../dtos/permiso-list-item.dto';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';

@Injectable()
export class ObtenerPermisoPorIdUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
  ) {}

  async ejecutar(id: string): Promise<PermisoDetalleDto> {
    const permiso = await this.permisoRepo.findById(id);
    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado', 'PERMISO_NO_ENCONTRADO');
    }

    return {
      id: permiso.id,
      codigoPermiso: permiso.codigoPermiso,
      estado: permiso.estado,
      snapshotCiudadano: permiso.snapshotCiudadano,
      snapshotMotocicleta: permiso.snapshotMotocicleta,
      snapshotMotivo: permiso.snapshotMotivo,
      fechaExpedicion: permiso.fechaExpedicion.toISOString(),
      fechaVencimiento: permiso.fechaVencimiento,
      funcionario: {
        id: permiso.funcionarioId,
        nombre: permiso.funcionarioNombre ?? '',
        apellido: permiso.funcionarioApellido ?? '',
        dependencia: permiso.funcionarioDependencia ?? null,
      },
      solicitudId: permiso.solicitudId,
      numeroRadicado: permiso.numeroRadicado ?? null,
      condicionesRestricciones: permiso.condicionesRestricciones,
      motivoRevocacion: permiso.motivoRevocacion,
      revocadoAt: permiso.revocadoAt?.toISOString() ?? null,
      createdAt: permiso.createdAt.toISOString(),
    };
  }
}
