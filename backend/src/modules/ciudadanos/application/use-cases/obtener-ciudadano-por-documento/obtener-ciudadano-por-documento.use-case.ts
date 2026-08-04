import { Inject, Injectable } from '@nestjs/common';
import { AccionAuditoria } from '../../../../../common/enums';
import { NotFoundException } from '../../../../../common/exceptions';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import {
  ICiudadanoRepository,
  CIUDADANO_REPOSITORY_TOKEN,
} from '../../../domain/ports/ciudadano-repository.interface';
import { CiudadanoMapper } from '../../../infrastructure/persistence/ciudadano.mapper';
import { CiudadanoDetalleDto } from '../../dtos/ciudadano-detalle.dto';

export interface ObtenerCiudadanoPorDocumentoCommand {
  numeroDocumento: string;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class ObtenerCiudadanoPorDocumentoUseCase {
  constructor(
    @Inject(CIUDADANO_REPOSITORY_TOKEN)
    private readonly ciudadanoRepo: ICiudadanoRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ObtenerCiudadanoPorDocumentoCommand): Promise<CiudadanoDetalleDto> {
    const { numeroDocumento, actorId, ipAddress, userAgent } = command;

    const ciudadano = await this.ciudadanoRepo.findByNumeroDocumento(numeroDocumento);
    if (!ciudadano) {
      throw new NotFoundException(
        'Ciudadano no encontrado con ese número de documento',
        'NOT_FOUND',
      );
    }

    await this.auditoriaService
      .registrar({
        accion: AccionAuditoria.CIUDADANO_CONSULTADO,
        entidad: 'ciudadanos',
        entidadId: ciudadano.id,
        datosAnteriores: null,
        datosNuevos: null,
        ipAddress,
        userAgent,
        usuarioId: actorId,
      })
      .catch(() => undefined);

    return CiudadanoMapper.toDetalleDto(ciudadano);
  }
}
