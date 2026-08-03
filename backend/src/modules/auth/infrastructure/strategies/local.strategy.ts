import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';
import { AuditoriaRegistroEntity } from '../../../auditoria/infrastructure/persistence/auditoria-registro.entity';
import { AccionAuditoria } from '../../../../common/enums/accion-auditoria.enum';
import { UnauthorizedException } from '../../../../common/exceptions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepo: Repository<UsuarioEntity>,
    @InjectRepository(AuditoriaRegistroEntity)
    private readonly auditoriaRepo: Repository<AuditoriaRegistroEntity>,
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
      await this.auditarFallo(null, ipAddress, userAgent, email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      await this.auditarFallo(usuario.id, ipAddress, userAgent, email);
      throw new UnauthorizedException('Usuario inactivo. Contacte al administrador');
    }

    if (usuario.bloqueadoHasta && new Date() < new Date(usuario.bloqueadoHasta)) {
      throw new UnauthorizedException(
        `Cuenta bloqueada por exceso de intentos fallidos. Intente nuevamente en 15 minutos`,
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
      await this.auditarFallo(usuario.id, ipAddress, userAgent, email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return { id: usuario.id };
  }

  private async auditarFallo(
    usuarioId: string | null,
    ipAddress: string | null,
    userAgent: string | null,
    email: string,
  ): Promise<void> {
    const registro = this.auditoriaRepo.create({
      accion: AccionAuditoria.LOGIN_FALLIDO,
      entidad: 'usuarios',
      entidadId: null,
      datosAnteriores: null,
      datosNuevos: { email },
      ipAddress,
      userAgent,
      usuario: usuarioId ? ({ id: usuarioId } as UsuarioEntity) : null,
    });
    await this.auditoriaRepo.save(registro).catch(() => undefined);
  }
}
