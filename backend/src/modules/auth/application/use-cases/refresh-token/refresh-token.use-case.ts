import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';
import { UnauthorizedException } from '../../../../../common/exceptions';
import { RefreshResponseDto } from '../../dtos/auth-response.dto';

export interface RefreshTokenCommand {
  userId: string;
  rawRefreshToken: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshResponseDto> {
    const { userId, rawRefreshToken, ipAddress, userAgent } = command;

    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const token = await this.tokenRepo.findOne({
      where: { tokenHash, tipo: TipoToken.REFRESH, revocado: false },
    });

    if (!token) {
      throw new UnauthorizedException('Token de actualización inválido o revocado');
    }

    if (token.expiraAt < new Date()) {
      await this.tokenRepo.update(token.id, { revocado: true, revocadoAt: new Date() });
      throw new UnauthorizedException('Token de actualización expirado');
    }

    // Revocar el token actual (rotación)
    await this.tokenRepo.update(token.id, { revocado: true, revocadoAt: new Date() });

    const usuario = await this.usuarioRepo.findOne({
      where: { id: userId },
      relations: ['rol'],
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no disponible');
    }

    const rol = usuario.rol.nombre.toUpperCase();
    const payload = { sub: userId, rol };

    const accessToken = this.jwtService.sign(payload);

    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') as string;
    const newRefreshToken = this.jwtService.sign(
      { sub: userId },
      { secret: refreshSecret, expiresIn: 604800 },
    );

    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiraAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newToken = this.tokenRepo.create({
      tokenHash: newTokenHash,
      tipo: TipoToken.REFRESH,
      expiraAt,
      revocado: false,
      revocadoAt: null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      usuario: { id: userId } as UsuarioEntity,
    });
    await this.tokenRepo.save(newToken);

    return { accessToken, refreshToken: newRefreshToken, expiresIn: 900 };
  }
}
