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

export interface CambiarContrasenaCommand {
  userId: string;
  contrasenaActual: string;
  nuevaContrasena: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class CambiarContrasenaUseCase {
  constructor(
    private readonly configService: ConfigService,
    private readonly auditoriaService: AuditoriaService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {}

  async execute(command: CambiarContrasenaCommand): Promise<{ message: string }> {
    const { userId, contrasenaActual, nuevaContrasena, ipAddress, userAgent } = command;

    const usuario = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const passwordValida = await bcrypt.compare(contrasenaActual, usuario.contrasenaHash);
    if (!passwordValida) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const mismaContrasena = await bcrypt.compare(nuevaContrasena, usuario.contrasenaHash);
    if (mismaContrasena) {
      throw new UnauthorizedException(
        'La nueva contraseña no puede ser igual a la contraseña actual',
      );
    }

    const historial: string[] = usuario.historialContrasenas ?? [];
    for (const hashAnterior of historial) {
      const esMisma = await bcrypt.compare(nuevaContrasena, hashAnterior);
      if (esMisma) {
        throw new UnauthorizedException('No puede reutilizar ninguna de sus últimas 5 contraseñas');
      }
    }

    const rounds = this.configService.get<number>('security.bcryptRounds', 12);
    const nuevoHash = await bcrypt.hash(nuevaContrasena, rounds);

    const nuevoHistorial = [nuevoHash, ...historial].slice(0, 5);

    const nuevaExpiracion = new Date();
    nuevaExpiracion.setDate(nuevaExpiracion.getDate() + 90);
    const nuevaExpiracionStr = nuevaExpiracion.toISOString().split('T')[0];

    await this.usuarioRepo.update(userId, {
      contrasenaHash: nuevoHash,
      historialContrasenas: nuevoHistorial,
      contrasenaExpiraAt: nuevaExpiracionStr,
    });

    await this.tokenRepo
      .createQueryBuilder()
      .update()
      .set({ revocado: true, revocadoAt: new Date() })
      .where('usuario_id = :userId AND tipo = :tipo AND revocado = false', {
        userId,
        tipo: TipoToken.REFRESH,
      })
      .execute();

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.CAMBIAR_CONTRASENA,
      entidad: 'usuarios',
      entidadId: userId,
      datosNuevos: { metodo: 'cambio_voluntario' },
      ipAddress,
      userAgent,
      usuarioId: userId,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
