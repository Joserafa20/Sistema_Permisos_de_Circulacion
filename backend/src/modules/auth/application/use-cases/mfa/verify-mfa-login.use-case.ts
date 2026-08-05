import * as crypto from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';
import { AuthResponseDto } from '../../dtos/auth-response.dto';

export interface VerifyMfaLoginCommand {
  mfaPendingToken: string;
  code: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface MfaPendingPayload {
  sub: string;
  mfaPending: boolean;
  familia: string;
}

@Injectable()
export class VerifyMfaLoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditoriaService: AuditoriaService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {}

  async execute(command: VerifyMfaLoginCommand): Promise<AuthResponseDto> {
    const { mfaPendingToken, code, ipAddress, userAgent } = command;

    let payload: MfaPendingPayload;
    try {
      payload = this.jwtService.verify<MfaPendingPayload>(mfaPendingToken);
    } catch {
      throw new UnauthorizedException('Token MFA pendiente inválido o expirado');
    }

    if (!payload.mfaPending) {
      throw new UnauthorizedException('Token MFA pendiente inválido');
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { id: payload.sub },
      relations: ['rol', 'dependencia'],
    });

    if (!usuario || !usuario.activo || !usuario.mfaSecret) {
      throw new UnauthorizedException('Usuario no disponible o MFA no configurado');
    }

    const isTotpValid = speakeasy.totp.verify({
      secret: usuario.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isTotpValid) {
      const isRecovery = await this.verifyRecoveryCode(usuario, code);
      if (!isRecovery) {
        throw new UnauthorizedException('Código de verificación inválido');
      }
    }

    await this.usuarioRepo.update(usuario.id, {
      intentosFallidos: 0,
      bloqueadoHasta: null,
      ultimoLogin: new Date(),
    });

    const rol = usuario.rol.nombre;
    const accessToken = this.jwtService.sign({ sub: usuario.id, rol });

    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') as string;
    const refreshToken = this.jwtService.sign(
      { sub: usuario.id },
      { secret: refreshSecret, expiresIn: 604800 },
    );

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiraAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.tokenRepo.save(
      this.tokenRepo.create({
        tokenHash,
        tipo: TipoToken.REFRESH,
        expiraAt,
        revocado: false,
        revocadoAt: null,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        familia: payload.familia,
        usuario: { id: usuario.id } as UsuarioEntity,
      }),
    );

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.LOGIN,
      entidad: 'usuarios',
      entidadId: usuario.id,
      datosNuevos: { email: usuario.email, mfa: true },
      ipAddress,
      userAgent,
      usuarioId: usuario.id,
    });

    const contrasenaExpirada = usuario.contrasenaExpiraAt
      ? new Date(usuario.contrasenaExpiraAt) < new Date()
      : false;

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol,
        dependencia: usuario.dependencia?.id ?? null,
        contrasenaExpirada,
      },
    };
  }

  private async verifyRecoveryCode(usuario: UsuarioEntity, code: string): Promise<boolean> {
    const codes = usuario.mfaRecoveryCodes;
    for (let i = 0; i < codes.length; i++) {
      const match = await bcrypt.compare(code.toUpperCase(), codes[i]);
      if (match) {
        const updated = [...codes];
        updated.splice(i, 1);
        await this.usuarioRepo.update(usuario.id, { mfaRecoveryCodes: updated });
        return true;
      }
    }
    return false;
  }
}
