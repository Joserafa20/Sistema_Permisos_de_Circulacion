import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrValidacionEntity } from './qr-validacion.entity';
import { ResultadoQrValidacion } from '../../../../common/enums';

export interface RegistrarQrValidacionParams {
  codigoQr: string;
  permisoId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  resultado: ResultadoQrValidacion;
}

@Injectable()
export class QrValidacionRepository {
  constructor(
    @InjectRepository(QrValidacionEntity)
    private readonly repo: Repository<QrValidacionEntity>,
  ) {}

  async registrar(params: RegistrarQrValidacionParams): Promise<void> {
    const entity = this.repo.create({
      codigoQr: params.codigoQr,
      permiso: params.permisoId ? { id: params.permisoId } : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      resultado: params.resultado,
    });
    await this.repo.save(entity);
  }
}
