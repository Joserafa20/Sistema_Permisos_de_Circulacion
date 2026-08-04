import { Inject, Injectable } from '@nestjs/common';
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
  UpdateUsuarioData,
  USUARIO_REPOSITORY_TOKEN,
} from '../../../domain/ports/usuario-repository.interface';
import { ActualizarUsuarioDto } from '../../dtos/actualizar-usuario.dto';
import { UsuarioDetalleDto } from '../../dtos/usuario-detalle.dto';

export interface ActualizarUsuarioCommand {
  id: string;
  dto: ActualizarUsuarioDto;
  actorId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class ActualizarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async execute(command: ActualizarUsuarioCommand): Promise<UsuarioDetalleDto> {
    const { id, dto, actorId, ipAddress, userAgent } = command;

    // Verificar existencia (respeta soft delete)
    const current = await this.usuarioRepo.findById(id);
    if (!current) {
      throw new NotFoundException('Usuario no encontrado', 'NOT_FOUND');
    }

    // Reglas de protección propia (admin no puede modificarse a sí mismo en campos críticos)
    if (actorId === id) {
      if (dto.activo === false) {
        throw new BusinessRuleException(
          'El administrador no puede desactivarse a sí mismo',
          'SELF_DEACTIVATION_FORBIDDEN',
        );
      }
      if (dto.rolId !== undefined && dto.rolId !== current.rolId) {
        throw new BusinessRuleException(
          'El administrador no puede modificar su propio rol',
          'SELF_ROLE_CHANGE_FORBIDDEN',
        );
      }
    }

    // Validar nuevo email si cambia
    if (dto.email !== undefined && dto.email !== current.email) {
      const taken = await this.usuarioRepo.existsByEmailExcluding(dto.email, id);
      if (taken) {
        throw new ConflictException(
          `El correo electrónico '${dto.email}' ya está registrado en el sistema`,
          'EMAIL_IN_USE',
        );
      }
    }

    // Validar rol si cambia
    let rolNombre = current.rolNombre;
    if (dto.rolId !== undefined && dto.rolId !== current.rolId) {
      const rol = await this.usuarioRepo.findRol(dto.rolId);
      if (!rol) {
        throw new NotFoundException('El rol especificado no existe', 'ROL_NOT_FOUND');
      }
      if (!rol.activo) {
        throw new BusinessRuleException('El rol especificado no está activo', 'ROL_INACTIVO');
      }
      rolNombre = rol.nombre;
    }

    // Validar dependencia si cambia y no es null
    let dependenciaNombre: string | null = current.dependenciaNombre;
    const dependenciaChanged =
      dto.dependenciaId !== undefined && dto.dependenciaId !== current.dependenciaId;
    if (dependenciaChanged && dto.dependenciaId !== null) {
      const dep = await this.usuarioRepo.findDependencia(dto.dependenciaId as string);
      if (!dep) {
        throw new NotFoundException(
          'La dependencia especificada no existe',
          'DEPENDENCIA_NOT_FOUND',
        );
      }
      if (!dep.activo) {
        throw new BusinessRuleException(
          'La dependencia especificada no está activa',
          'DEPENDENCIA_INACTIVA',
        );
      }
      dependenciaNombre = dep.nombre;
    } else if (dependenciaChanged && dto.dependenciaId === null) {
      dependenciaNombre = null;
    }

    // Detectar si el desbloqueo es un cambio real
    const esBloqueado = current.bloqueadoHasta !== null;
    const desbloqueoReal = dto.desbloquear === true && esBloqueado;

    // Detectar cambios en campos regulares
    const camposRegularesChangiaron =
      (dto.nombre !== undefined && dto.nombre !== current.nombre) ||
      (dto.apellido !== undefined && dto.apellido !== current.apellido) ||
      (dto.email !== undefined && dto.email !== current.email) ||
      (dto.rolId !== undefined && dto.rolId !== current.rolId) ||
      dependenciaChanged ||
      (dto.activo !== undefined && dto.activo !== current.activo);

    const hayAlgunCambio = camposRegularesChangiaron || desbloqueoReal;

    // Optimización: si nada cambió, responder sin tocar la BD
    if (!hayAlgunCambio) {
      return UsuarioMapper.toDetalleDto(current);
    }

    // Construir payload de actualización solo con campos que realmente cambian
    const updateData: UpdateUsuarioData = { updatedById: actorId };
    if (dto.nombre !== undefined && dto.nombre !== current.nombre) updateData.nombre = dto.nombre;
    if (dto.apellido !== undefined && dto.apellido !== current.apellido)
      updateData.apellido = dto.apellido;
    if (dto.email !== undefined && dto.email !== current.email) updateData.email = dto.email;
    if (dto.rolId !== undefined && dto.rolId !== current.rolId) updateData.rolId = dto.rolId;
    if (dependenciaChanged) updateData.dependenciaId = dto.dependenciaId ?? null;
    if (dto.activo !== undefined && dto.activo !== current.activo) updateData.activo = dto.activo;
    if (desbloqueoReal) updateData.bloqueadoHasta = null;

    const updated = await this.usuarioRepo.update(id, updateData);

    // Auditoría de actualización de campos regulares
    if (camposRegularesChangiaron) {
      await this.auditoriaService.registrar({
        accion: AccionAuditoria.USUARIO_ACTUALIZADO,
        entidad: 'usuarios',
        entidadId: id,
        datosAnteriores: {
          nombre: current.nombre,
          apellido: current.apellido,
          email: current.email,
          rolId: current.rolId,
          rolNombre: current.rolNombre,
          dependenciaId: current.dependenciaId,
          dependenciaNombre: current.dependenciaNombre,
          activo: current.activo,
        },
        datosNuevos: {
          nombre: updated.nombre,
          apellido: updated.apellido,
          email: updated.email,
          rolId: updated.rolId,
          rolNombre: rolNombre,
          dependenciaId: updated.dependenciaId,
          dependenciaNombre,
          activo: updated.activo,
        },
        ipAddress,
        userAgent,
        usuarioId: actorId,
      });
    }

    // Auditoría adicional de desbloqueo
    if (desbloqueoReal) {
      await this.auditoriaService.registrar({
        accion: AccionAuditoria.USUARIO_DESBLOQUEADO,
        entidad: 'usuarios',
        entidadId: id,
        datosAnteriores: {
          bloqueadoHasta: current.bloqueadoHasta?.toISOString() ?? null,
          intentosFallidos: current.intentosFallidos,
        },
        datosNuevos: { bloqueadoHasta: null },
        ipAddress,
        userAgent,
        usuarioId: actorId,
      });
    }

    return UsuarioMapper.toDetalleDto(updated);
  }
}
