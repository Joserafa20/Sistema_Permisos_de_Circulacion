import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';

@Injectable()
export class ActivateMfaUseCase {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
  ) {}

  async execute(userId: string, code: string): Promise<{ message: string }> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (!usuario.mfaSecret) {
      throw new UnauthorizedException('Primero ejecute /auth/mfa/setup');
    }

    const isValid = speakeasy.totp.verify({
      secret: usuario.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new UnauthorizedException('Código TOTP inválido');
    }

    await this.usuarioRepo.update(userId, { mfaActivo: true });
    return { message: 'MFA activado correctamente' };
  }
}
