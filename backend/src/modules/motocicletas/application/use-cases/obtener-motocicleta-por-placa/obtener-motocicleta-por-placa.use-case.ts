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

export interface ObtenerMotocicletaPorPlacaCommand {
  placa: string;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class ObtenerMotocicletaPorPlacaUseCase {
  constructor(
    @Inject(MOTOCICLETA_REPOSITORY_TOKEN)
    private readonly motoRepo: IMotocicletaRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ObtenerMotocicletaPorPlacaCommand): Promise<MotocicletaDetalleDto> {
    const { actorId, ipAddress, userAgent } = command;

    // RN-18: placa normalizada antes de buscar
    const placa = command.placa.trim().toUpperCase();

    const moto = await this.motoRepo.findByPlaca(placa);
    if (!moto) {
      throw new NotFoundException('No se encontró motocicleta con la placa indicada', 'NOT_FOUND');
    }

    await this.auditoriaService
      .registrar({
        accion: AccionAuditoria.MOTOCICLETA_CONSULTADA,
        entidad: 'motocicletas',
        entidadId: moto.id,
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
