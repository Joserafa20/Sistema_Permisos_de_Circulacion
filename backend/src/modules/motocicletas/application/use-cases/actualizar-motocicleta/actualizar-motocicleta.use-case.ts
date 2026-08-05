import { Inject, Injectable } from '@nestjs/common';
import { AccionAuditoria } from '../../../../../common/enums';
import { NotFoundException } from '../../../../../common/exceptions';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import {
  IMotocicletaRepository,
  MOTOCICLETA_REPOSITORY_TOKEN,
  UpdateMotocicletaData,
} from '../../../domain/ports/motocicleta-repository.interface';
import { MotocicletaDomainEntity } from '../../../domain/entities/motocicleta.domain-entity';
import { MotocicletaMapper } from '../../../infrastructure/persistence/motocicleta.mapper';
import { ActualizarMotocicletaDto } from '../../dtos/actualizar-motocicleta.dto';
import { MotocicletaDetalleDto } from '../../dtos/motocicleta-detalle.dto';

export interface ActualizarMotocicletaCommand {
  id: string;
  dto: ActualizarMotocicletaDto;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class ActualizarMotocicletaUseCase {
  constructor(
    @Inject(MOTOCICLETA_REPOSITORY_TOKEN)
    private readonly motoRepo: IMotocicletaRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ActualizarMotocicletaCommand): Promise<MotocicletaDetalleDto> {
    const { id, dto, actorId, ipAddress, userAgent } = command;

    const current = await this.motoRepo.findById(id);
    if (!current) {
      throw new NotFoundException('No se encontró la motocicleta indicada', 'NOT_FOUND');
    }

    const changes = this.buildChanges(dto, current);
    if (Object.keys(changes).length === 0) {
      return MotocicletaMapper.toDetalleDto(current);
    }

    const datosAnteriores = this.snapshot(current);
    const updated = await this.motoRepo.update(id, changes);

    await this.auditoriaService
      .registrar({
        accion: AccionAuditoria.EDITAR,
        entidad: 'motocicletas',
        entidadId: id,
        datosAnteriores,
        datosNuevos: this.snapshot(updated),
        ipAddress,
        userAgent,
        usuarioId: actorId,
      })
      .catch(() => undefined);

    return MotocicletaMapper.toDetalleDto(updated);
  }

  // ─── Helpers privados ──────────────────────────────────────────────────────

  private buildChanges(
    dto: ActualizarMotocicletaDto,
    current: MotocicletaDomainEntity,
  ): UpdateMotocicletaData {
    const changes: UpdateMotocicletaData = {};

    if (dto.marca !== undefined && dto.marca !== current.marca) changes.marca = dto.marca;
    if (dto.linea !== undefined && dto.linea !== current.linea) changes.linea = dto.linea;
    if (dto.modelo !== undefined && dto.modelo !== current.modelo) changes.modelo = dto.modelo;
    if (dto.cilindraje !== undefined && dto.cilindraje !== current.cilindraje)
      changes.cilindraje = dto.cilindraje;
    if (dto.color !== undefined && dto.color !== current.color) changes.color = dto.color;
    if (dto.numeroMotor !== undefined && dto.numeroMotor !== current.numeroMotor)
      changes.numeroMotor = dto.numeroMotor;
    if (dto.numeroChasis !== undefined && dto.numeroChasis !== current.numeroChasis)
      changes.numeroChasis = dto.numeroChasis;

    return changes;
  }

  private snapshot(
    moto: MotocicletaDomainEntity,
  ): Record<string, string | number | boolean | null> {
    return {
      marca: moto.marca,
      linea: moto.linea,
      modelo: moto.modelo,
      cilindraje: moto.cilindraje,
      color: moto.color,
      numeroMotor: moto.numeroMotor,
      numeroChasis: moto.numeroChasis,
    };
  }
}
