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

export interface LoginCommand {
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

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

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { userId, ipAddress, userAgent } = command;

    const usuario = await this.usuarioRepo.findOne({
      where: { id: userId },
      relations: ['rol', 'dependencia'],
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado tras validación');
    }

    await this.usuarioRepo.update(userId, {
      intentosFallidos: 0,
      bloqueadoHasta: null,
      ultimoLogin: new Date(),
    });

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
