import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';
import { AuthResponseDto } from '../../dtos/auth-response.dto';
import { UnauthorizedException } from '../../../../../common/exceptions';
import { UserRole } from '../../../../../common/decorators/roles.decorator';

export interface LoginCommand {
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export type LoginResult = AuthResponseDto | { mfaRequired: true; mfaPendingToken: string };

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditoriaService: AuditoriaService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const { userId, ipAddress, userAgent } = command;

    const usuario = await this.usuarioRepo.findOne({
      where: { id: userId },
      relations: ['rol', 'dependencia'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Sesión no válida');
    }

    await this.usuarioRepo.update(userId, {
      intentosFallidos: 0,
      bloqueadoHasta: null,
      ultimoLogin: new Date(),
    });

    // Si el usuario es ADMINISTRADOR y tiene MFA activo, devolver token pendiente
    if (usuario.rol.nombre === UserRole.ADMINISTRADOR && usuario.mfaActivo) {
      const familia = crypto.randomUUID();
      const mfaPendingToken = this.jwtService.sign(
        { sub: userId, mfaPending: true, familia },
        { expiresIn: 300 }, // 5 minutos
      );
      return { mfaRequired: true, mfaPendingToken };
    }

    const familia = crypto.randomUUID();
    const rol = usuario.rol.nombre;
    const payload = { sub: userId, rol };

    const accessToken = this.jwtService.sign(payload);

    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') as string;
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { secret: refreshSecret, expiresIn: 604800 },
    );

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiraAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const tokenEntity = this.tokenRepo.create({
      tokenHash,
      tipo: TipoToken.REFRESH,
      expiraAt,
      revocado: false,
      revocadoAt: null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      familia,
      usuario: { id: userId } as UsuarioEntity,
    });
    await this.tokenRepo.save(tokenEntity);

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.LOGIN,
      entidad: 'usuarios',
      entidadId: userId,
      datosNuevos: { email: usuario.email },
      ipAddress,
      userAgent,
      usuarioId: userId,
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
}
