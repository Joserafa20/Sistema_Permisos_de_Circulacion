import * as crypto from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { MfaSetupResponseDto } from '../../dtos/mfa.dto';

const RECOVERY_COUNT = 10;

@Injectable()
export class SetupMfaUseCase {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
  ) {}

  async execute(userId: string): Promise<MfaSetupResponseDto> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const generated = speakeasy.generateSecret({ length: 20 });
    const secret = generated.base32;
    const nombreAlcaldia = this.configService.get<string>('seed.ci.nombreAlcaldia') ?? 'Alcaldía';
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: usuario.email,
      issuer: nombreAlcaldia,
      encoding: 'base32',
    });
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    const recoveryCodes: string[] = [];
    const recoveryHashes: string[] = [];
    const rounds = this.configService.get<number>('bcrypt.rounds') ?? 12;

    for (let i = 0; i < RECOVERY_COUNT; i++) {
      const code = crypto.randomBytes(5).toString('hex').toUpperCase();
      recoveryCodes.push(code);
      recoveryHashes.push(await bcrypt.hash(code, rounds));
    }

    await this.usuarioRepo.update(userId, {
      mfaSecret: secret,
      mfaActivo: false,
      mfaRecoveryCodes: recoveryHashes,
    });

    return { otpauthUrl: qrDataUrl, secret, recoveryCodes };
  }
}
