import { Inject, Injectable } from '@nestjs/common';
import { EstadoPermiso, TipoNotificacion, AccionAuditoria } from '../../../../common/enums';
import { BusinessRuleException, NotFoundException } from '../../../../common/exceptions';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { NotificacionesService } from '../../../notificaciones/notificaciones.service';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';
import { RevocarPermisoDto } from '../dtos/revocar-permiso.dto';
import { RevocarPermisoResponseDto } from '../dtos/revocar-permiso-response.dto';

@Injectable()
export class RevocarPermisoUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
    private readonly auditoriaService: AuditoriaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async ejecutar(
    permisoId: string,
    dto: RevocarPermisoDto,
    adminId: string,
    ipAddress: string | null,
  ): Promise<RevocarPermisoResponseDto> {
    const permiso = await this.permisoRepo.findById(permisoId);
    if (!permiso) throw new NotFoundException('Permiso no encontrado');

    if (permiso.estado === EstadoPermiso.VENCIDO) {
      throw new BusinessRuleException(
        'El permiso ya está vencido y no puede ser revocado',
        'PERMISO_YA_VENCIDO',
      );
    }
    if (permiso.estado === EstadoPermiso.REVOCADO) {
      throw new BusinessRuleException(
        'El permiso ya fue revocado anteriormente',
        'PERMISO_YA_REVOCADO',
      );
    }

    const revocadoAt = new Date();
    const permisoRevocado = await this.permisoRepo.revocar({
      id: permisoId,
      motivoRevocacion: dto.motivoRevocacion,
      revocadoPorId: adminId,
      revocadoAt,
    });

    // Auditoría
    void this.auditoriaService.registrar({
      usuarioId: adminId,
      accion: AccionAuditoria.REVOCAR_PERMISO,
      entidad: 'permiso',
      entidadId: permisoId,
      ipAddress,
      datosNuevos: { estado: EstadoPermiso.REVOCADO, motivoRevocacion: dto.motivoRevocacion },
    });

    // Notificación al ciudadano (fire-and-forget, sin correo real aún — RN-36)
    const emailCiudadano = permiso.snapshotCiudadano?.email;
    if (emailCiudadano) {
      void this.notificacionesService.encolar({
        tipo: TipoNotificacion.PERMISO_REVOCADO,
        destinatario: emailCiudadano,
        asunto: `Permiso ${permisoRevocado.codigoPermiso} revocado`,
        permisoId: permisoId,
      });
    }

    return {
      id: permisoRevocado.id,
      codigoPermiso: permisoRevocado.codigoPermiso,
      estado: permisoRevocado.estado,
      motivoRevocacion: permisoRevocado.motivoRevocacion!,
      revocadoAt: revocadoAt.toISOString(),
      revocadoPor: {
        nombre: permisoRevocado.revocadoPorNombre ?? '',
        apellido: permisoRevocado.revocadoPorApellido ?? '',
        rol: 'administrador',
      },
    };
  }
}
