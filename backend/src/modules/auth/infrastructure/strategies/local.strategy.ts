import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { AccionAuditoria } from '../../../../common/enums/accion-auditoria.enum';
import { UnauthorizedException } from '../../../../common/exceptions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
  ) {
    super({ usernameField: 'email', passwordField: 'contrasena', passReqToCallback: true });
  }

  async validate(req: Request, email: string, contrasena: string): Promise<{ id: string }> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = (req.headers['user-agent'] ?? null) as string | null;

    const usuario = await this.usuarioRepo.findOne({
      where: { email },
      relations: ['rol'],
    });

    if (!usuario) {
      await this.auditoriaService.registrar({
        accion: AccionAuditoria.LOGIN_FALLIDO,
        entidad: 'usuarios',
        datosNuevos: { email },
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      await this.auditoriaService.registrar({
        accion: AccionAuditoria.LOGIN_FALLIDO,
        entidad: 'usuarios',
        entidadId: usuario.id,
        datosNuevos: { email },
        ipAddress,
        userAgent,
        usuarioId: usuario.id,
      });
      throw new UnauthorizedException('Usuario inactivo. Contacte al administrador');
    }

    if (usuario.bloqueadoHasta && new Date() < new Date(usuario.bloqueadoHasta)) {
      throw new UnauthorizedException(
        `Cuenta bloqueada por exceso de intentos fallidos. Intente nuevamente en 30 minutos`,
      );
    }

    const passwordValid = await bcrypt.compare(contrasena, usuario.contrasenaHash);

    if (!passwordValid) {
      const intentos = usuario.intentosFallidos + 1;
      const update: Partial<UsuarioEntity> = { intentosFallidos: intentos };
      if (intentos >= 5) {
        update.bloqueadoHasta = new Date(Date.now() + 30 * 60 * 1000) as unknown as Date;
      }
      await this.usuarioRepo.update(usuario.id, update);
      await this.auditoriaService.registrar({
        accion: AccionAuditoria.LOGIN_FALLIDO,
        entidad: 'usuarios',
        entidadId: usuario.id,
        datosNuevos: { email },
        ipAddress,
        userAgent,
        usuarioId: usuario.id,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return { id: usuario.id };
  }
}
