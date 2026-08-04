import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { UnauthorizedException } from '../../../../../common/exceptions';

export interface RestablecerContrasenaCommand {
  token: string;
  nuevaContrasena: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class RestablecerContrasenaUseCase {
  constructor(
    private readonly configService: ConfigService,
    private readonly auditoriaService: AuditoriaService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {}

  async execute(command: RestablecerContrasenaCommand): Promise<{ message: string }> {
    const { token, nuevaContrasena, ipAddress, userAgent } = command;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const tokenEntity = await this.tokenRepo.findOne({
      where: { tokenHash, tipo: TipoToken.RESET_CONTRASENA, revocado: false },
      relations: ['usuario'],
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Token de recuperación inválido o ya utilizado');
    }

    if (tokenEntity.expiraAt < new Date()) {
      await this.tokenRepo.update(tokenEntity.id, { revocado: true, revocadoAt: new Date() });
      throw new UnauthorizedException('El token de recuperación ha expirado');
    }

    const usuario = tokenEntity.usuario;

    const historial: string[] = usuario.historialContrasenas ?? [];
    for (const hashAnterior of historial) {
      const esMisma = await bcrypt.compare(nuevaContrasena, hashAnterior);
      if (esMisma) {
        throw new UnauthorizedException('No puede reutilizar una contraseña anterior');
      }
    }

    const rounds = this.configService.get<number>('security.bcryptRounds', 12);
    const nuevoHash = await bcrypt.hash(nuevaContrasena, rounds);

    const nuevoHistorial = [nuevoHash, ...historial].slice(0, 5);

    await this.usuarioRepo.update(usuario.id, {
      contrasenaHash: nuevoHash,
      historialContrasenas: nuevoHistorial,
      contrasenaExpiraAt: null,
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });

    await this.tokenRepo.update(tokenEntity.id, { revocado: true, revocadoAt: new Date() });

    await this.tokenRepo
      .createQueryBuilder()
      .update()
      .set({ revocado: true, revocadoAt: new Date() })
      .where('usuario_id = :userId AND tipo = :tipo AND revocado = false', {
        userId: usuario.id,
        tipo: TipoToken.REFRESH,
      })
      .execute();

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.CAMBIAR_CONTRASENA,
      entidad: 'usuarios',
      entidadId: usuario.id,
      datosNuevos: { metodo: 'recuperacion' },
      ipAddress,
      userAgent,
      usuarioId: usuario.id,
    });

    return {
      message: 'Contraseña restablecida correctamente. Inicie sesión con su nueva contraseña',
    };
  }
}
