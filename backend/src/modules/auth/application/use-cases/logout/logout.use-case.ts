import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { AuditoriaRegistroEntity } from '../../../../auditoria/infrastructure/persistence/auditoria-registro.entity';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';
import { UnauthorizedException } from '../../../../../common/exceptions';

export interface LogoutCommand {
  refreshToken: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    @InjectRepository(AuditoriaRegistroEntity)
    private readonly auditoriaRepo: Repository<AuditoriaRegistroEntity>,
  ) {}

  async execute(command: LogoutCommand): Promise<{ message: string }> {
    const { refreshToken, userId, ipAddress, userAgent } = command;

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const token = await this.tokenRepo.findOne({
      where: { tokenHash, tipo: TipoToken.REFRESH, revocado: false },
    });

    if (!token) {
      throw new UnauthorizedException('Token de actualización inválido o ya revocado');
    }

    await this.tokenRepo.update(token.id, {
      revocado: true,
      revocadoAt: new Date(),
    });

    const registro = this.auditoriaRepo.create({
      accion: AccionAuditoria.LOGOUT,
      entidad: 'usuarios',
      entidadId: userId,
      datosAnteriores: null,
      datosNuevos: null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      usuario: { id: userId } as UsuarioEntity,
    });
    await this.auditoriaRepo.save(registro).catch(() => undefined);

    return { message: 'Sesión cerrada correctamente' };
  }
}
