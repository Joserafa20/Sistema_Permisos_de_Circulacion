import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
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
    private readonly auditoriaService: AuditoriaService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
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

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.LOGOUT,
      entidad: 'usuarios',
      entidadId: userId,
      ipAddress,
      userAgent,
      usuarioId: userId,
    });

    return { message: 'Sesión cerrada correctamente' };
  }
}
