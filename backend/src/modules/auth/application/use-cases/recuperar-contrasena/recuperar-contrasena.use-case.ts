import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../../../../usuarios/infrastructure/persistence/usuario.entity';
import { TokenEntity } from '../../../infrastructure/persistence/token.entity';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';

export interface RecuperarContrasenaCommand {
  email: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface RecuperarContrasenaResult {
  message: string;
}

@Injectable()
export class RecuperarContrasenaUseCase {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {}

  async execute(command: RecuperarContrasenaCommand): Promise<RecuperarContrasenaResult> {
    const { email, ipAddress, userAgent } = command;

    // Respuesta idéntica sin importar si el correo existe (evita enumeración)
    const respuestaGenerica: RecuperarContrasenaResult = {
      message:
        'Si el correo electrónico está registrado recibirá las instrucciones de recuperación',
    };

    const usuario = await this.usuarioRepo.findOne({ where: { email } });
    if (!usuario || !usuario.activo) {
      return respuestaGenerica;
    }

    // Invalidar tokens de recuperación anteriores del mismo usuario
    const tokensAnteriores = await this.tokenRepo.find({
      where: { tipo: TipoToken.RESET_CONTRASENA, revocado: false, usuario: { id: usuario.id } },
      relations: ['usuario'],
    });
    if (tokensAnteriores.length > 0) {
      await this.tokenRepo.update(
        tokensAnteriores.map((t) => t.id),
        { revocado: true, revocadoAt: new Date() },
      );
    }

    // Generar token de recuperación (raw) y almacenar únicamente el hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiraAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    const tokenEntity = this.tokenRepo.create({
      tokenHash,
      tipo: TipoToken.RESET_CONTRASENA,
      expiraAt,
      revocado: false,
      revocadoAt: null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      usuario: { id: usuario.id } as UsuarioEntity,
    });
    await this.tokenRepo.save(tokenEntity);

    // TODO: integrar servicio de correo — enviar rawToken al email del usuario
    // El rawToken NO se devuelve en la respuesta para evitar exposición

    return respuestaGenerica;
  }
}
