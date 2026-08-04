import { Inject, Injectable } from '@nestjs/common';
import { AccionAuditoria } from '../../../../../common/enums';
import { NotFoundException } from '../../../../../common/exceptions';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import {
  IMotocicletaRepository,
  MOTOCICLETA_REPOSITORY_TOKEN,
} from '../../../domain/ports/motocicleta-repository.interface';
import { MotocicletaMapper } from '../../../infrastructure/persistence/motocicleta.mapper';
import { MotocicletaDetalleDto } from '../../dtos/motocicleta-detalle.dto';

export interface ObtenerMotocicletaPorIdCommand {
  id: string;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class ObtenerMotocicletaPorIdUseCase {
  constructor(
    @Inject(MOTOCICLETA_REPOSITORY_TOKEN)
    private readonly motoRepo: IMotocicletaRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ObtenerMotocicletaPorIdCommand): Promise<MotocicletaDetalleDto> {
    const { id, actorId, ipAddress, userAgent } = command;

    const moto = await this.motoRepo.findById(id);
    if (!moto) {
      throw new NotFoundException('Motocicleta no encontrada', 'NOT_FOUND');
    }

    await this.auditoriaService
      .registrar({
        accion: AccionAuditoria.MOTOCICLETA_CONSULTADA,
        entidad: 'motocicletas',
        entidadId: id,
        datosAnteriores: null,
        datosNuevos: null,
        ipAddress,
        userAgent,
        usuarioId: actorId,
      })
      .catch(() => undefined);

    return MotocicletaMapper.toDetalleDto(moto);
  }
}
