import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { AuditoriaRegistroEntity } from '../../../../auditoria/infrastructure/persistence/auditoria-registro.entity';
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
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    @InjectRepository(AuditoriaRegistroEntity)
    private readonly auditoriaRepo: Repository<AuditoriaRegistroEntity>,
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

    // Verificar que la nueva contraseña no esté en el historial
    const historial: string[] = usuario.historialContrasenas ?? [];
    for (const hashAnterior of historial) {
      const esMisma = await bcrypt.compare(nuevaContrasena, hashAnterior);
      if (esMisma) {
        throw new UnauthorizedException('No puede reutilizar una contraseña anterior');
      }
    }

    const rounds = this.configService.get<number>('security.bcryptRounds', 12);
    const nuevoHash = await bcrypt.hash(nuevaContrasena, rounds);

    // Actualizar historial (últimas 5)
    const nuevoHistorial = [nuevoHash, ...historial].slice(0, 5);

    await this.usuarioRepo.update(usuario.id, {
      contrasenaHash: nuevoHash,
      historialContrasenas: nuevoHistorial,
      contrasenaExpiraAt: null,
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });

    // Revocar el token de recuperación
    await this.tokenRepo.update(tokenEntity.id, { revocado: true, revocadoAt: new Date() });

    // Revocar todos los refresh tokens activos del usuario
    await this.tokenRepo
      .createQueryBuilder()
      .update()
      .set({ revocado: true, revocadoAt: new Date() })
      .where('usuario_id = :userId AND tipo = :tipo AND revocado = false', {
        userId: usuario.id,
        tipo: TipoToken.REFRESH,
      })
      .execute();

    const registro = this.auditoriaRepo.create({
      accion: AccionAuditoria.CAMBIAR_CONTRASENA,
      entidad: 'usuarios',
      entidadId: usuario.id,
      datosAnteriores: null,
      datosNuevos: { metodo: 'recuperacion' },
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      usuario: { id: usuario.id } as UsuarioEntity,
    });
    await this.auditoriaRepo.save(registro).catch(() => undefined);

    return {
      message: 'Contraseña restablecida correctamente. Inicie sesión con su nueva contraseña',
    };
  }
}
