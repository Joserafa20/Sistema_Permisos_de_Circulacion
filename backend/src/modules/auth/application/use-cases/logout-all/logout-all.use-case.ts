import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';

export interface LogoutAllCommand {
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class LogoutAllUseCase {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {}

  async execute(command: LogoutAllCommand): Promise<{ message: string; revocados: number }> {
    const { userId, ipAddress, userAgent } = command;

    const result = await this.tokenRepo
      .createQueryBuilder()
      .update(TokenEntity)
      .set({ revocado: true, revocadoAt: new Date() })
      .where('usuario_id = :userId', { userId })
      .andWhere('tipo = :tipo', { tipo: TipoToken.REFRESH })
      .andWhere('revocado = :revocado', { revocado: false })
      .execute();

    const revocados = result.affected ?? 0;

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.LOGOUT,
      entidad: 'usuarios',
      entidadId: userId,
      datosNuevos: { globalLogout: true, tokensRevocados: revocados },
      ipAddress,
      userAgent,
      usuarioId: userId,
    });

    return { message: 'Todas las sesiones han sido cerradas', revocados };
  }
}
