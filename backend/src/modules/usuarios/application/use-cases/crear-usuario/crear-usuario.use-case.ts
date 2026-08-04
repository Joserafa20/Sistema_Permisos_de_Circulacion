import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { AccionAuditoria } from '../../../../../common/enums/accion-auditoria.enum';
import {
  BusinessRuleException,
  ConflictException,
  NotFoundException,
} from '../../../../../common/exceptions';
import { AuditoriaService } from '../../../../auditoria/application/auditoria.service';
import { UsuarioMapper } from '../../../infrastructure/persistence/usuario.mapper';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../../domain/ports/usuario-repository.interface';
import { CrearUsuarioDto } from '../../dtos/crear-usuario.dto';
import { UsuarioCreadoDto } from '../../dtos/usuario-creado.dto';

export interface CrearUsuarioCommand {
  dto: CrearUsuarioDto;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class CrearUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly auditoriaService: AuditoriaService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CrearUsuarioCommand): Promise<UsuarioCreadoDto> {
    const { dto, actorId, ipAddress, userAgent } = command;

    // RN: correo único (activos y eliminados)
    const emailTaken = await this.usuarioRepo.existsByEmail(dto.email);
    if (emailTaken) {
      throw new ConflictException(
        `El correo electrónico '${dto.email}' ya está registrado en el sistema`,
        'EMAIL_IN_USE',
      );
    }

    // RN: rol debe existir y estar activo
    const rol = await this.usuarioRepo.findRol(dto.rolId);
    if (!rol) {
      throw new NotFoundException('El rol especificado no existe', 'ROL_NOT_FOUND');
    }
    if (!rol.activo) {
      throw new BusinessRuleException('El rol especificado no está activo', 'ROL_INACTIVO');
    }

    // RN: dependencia debe existir y estar activa (si se proporcionó)
    let dependenciaNombre: string | null = null;
    if (dto.dependenciaId) {
      const dependencia = await this.usuarioRepo.findDependencia(dto.dependenciaId);
      if (!dependencia) {
        throw new NotFoundException(
          'La dependencia especificada no existe',
          'DEPENDENCIA_NOT_FOUND',
        );
      }
      if (!dependencia.activo) {
        throw new BusinessRuleException(
          'La dependencia especificada no está activa',
          'DEPENDENCIA_INACTIVA',
        );
      }
      dependenciaNombre = dependencia.nombre;
    }

    // Generar contraseña temporal criptográficamente segura
    const contrasenaTemp = generarContrasenaTemp();

    // Hash BCrypt con rounds configurados (default 12)
    const rounds = this.configService.get<number>('security.bcryptRounds', 12);
    const contrasenaHash = await bcrypt.hash(contrasenaTemp, rounds);

    // Fecha de expiración = hoy (fuerza cambio en el primer inicio de sesión)
    const hoy = new Date().toISOString().substring(0, 10);

    const usuarioCreado = await this.usuarioRepo.save({
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      contrasenaHash,
      rolId: dto.rolId,
      dependenciaId: dto.dependenciaId ?? null,
      contrasenaExpiraAt: hoy,
      createdById: actorId,
    });

    await this.auditoriaService.registrar({
      accion: AccionAuditoria.USUARIO_CREADO,
      entidad: 'usuarios',
      entidadId: usuarioCreado.id,
      datosNuevos: {
        nombre: usuarioCreado.nombre,
        apellido: usuarioCreado.apellido,
        email: usuarioCreado.email,
        rolId: dto.rolId,
        rolNombre: rol.nombre,
        dependenciaId: dto.dependenciaId ?? null,
        dependenciaNombre,
        creadoPor: actorId,
      },
      ipAddress,
      userAgent,
      usuarioId: actorId,
    });

    return {
      ...UsuarioMapper.toDetalleDto(usuarioCreado),
      contrasenaTemp,
    };
  }
}

/**
 * Genera una contraseña temporal de 12 caracteres criptográficamente aleatoria.
 * Garantiza: 2 mayúsculas, 2 minúsculas, 2 dígitos, 2 especiales, 4 mixtos.
 * Excluye caracteres ambiguos (0, O, l, 1, I) para legibilidad.
 */
function generarContrasenaTemp(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%*';
  const all = upper + lower + digits + special;

  const buf = randomBytes(24);
  const chars: string[] = [
    upper[buf[0] % upper.length],
    upper[buf[1] % upper.length],
    lower[buf[2] % lower.length],
    lower[buf[3] % lower.length],
    digits[buf[4] % digits.length],
    digits[buf[5] % digits.length],
    special[buf[6] % special.length],
    special[buf[7] % special.length],
    all[buf[8] % all.length],
    all[buf[9] % all.length],
    all[buf[10] % all.length],
    all[buf[11] % all.length],
  ];

  const shuffleBuf = randomBytes(chars.length);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleBuf[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
