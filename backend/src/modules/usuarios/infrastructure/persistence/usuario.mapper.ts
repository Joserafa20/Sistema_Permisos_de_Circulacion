import { UsuarioDomainEntity } from '../../domain/entities/usuario.domain-entity';
import { UsuarioEntity } from './usuario.entity';
import { UsuarioListItemDto } from '../../application/dtos/usuario-list-item.dto';
import { UsuarioDetalleDto } from '../../application/dtos/usuario-detalle.dto';

export class UsuarioMapper {
  static toDomain(entity: UsuarioEntity): UsuarioDomainEntity {
    const domain = new UsuarioDomainEntity();
    domain.id = entity.id;
    domain.nombre = entity.nombre;
    domain.apellido = entity.apellido;
    domain.email = entity.email;
    domain.activo = entity.activo;
    domain.ultimoLogin = entity.ultimoLogin;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.intentosFallidos = entity.intentosFallidos;
    domain.contrasenaExpiraAt = entity.contrasenaExpiraAt;
    domain.rolId = entity.rol.id;
    domain.rolNombre = entity.rol.nombre;
    domain.dependenciaId = entity.dependencia?.id ?? null;
    domain.dependenciaNombre = entity.dependencia?.nombre ?? null;
    domain.bloqueadoHasta = entity.bloqueadoHasta;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toListItemDto(domain: UsuarioDomainEntity): UsuarioListItemDto {
    return {
      id: domain.id,
      nombre: domain.nombre,
      apellido: domain.apellido,
      email: domain.email,
      rol: { id: domain.rolId, nombre: domain.rolNombre },
      dependencia: domain.dependenciaId
        ? { id: domain.dependenciaId, nombre: domain.dependenciaNombre! }
        : null,
      activo: domain.activo,
      ultimoLogin: domain.ultimoLogin?.toISOString() ?? null,
      createdAt: domain.createdAt.toISOString(),
    };
  }

  static toDetalleDto(domain: UsuarioDomainEntity): UsuarioDetalleDto {
    return {
      id: domain.id,
      nombre: domain.nombre,
      apellido: domain.apellido,
      email: domain.email,
      rol: { id: domain.rolId, nombre: domain.rolNombre },
      dependencia: domain.dependenciaId
        ? { id: domain.dependenciaId, nombre: domain.dependenciaNombre! }
        : null,
      activo: domain.activo,
      ultimoLogin: domain.ultimoLogin?.toISOString() ?? null,
      intentosFallidos: domain.intentosFallidos,
      contrasenaExpiraAt: domain.contrasenaExpiraAt,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt?.toISOString() ?? null,
    };
  }
}
