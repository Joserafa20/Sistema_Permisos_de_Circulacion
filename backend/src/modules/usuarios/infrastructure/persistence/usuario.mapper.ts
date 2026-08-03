import { UsuarioDomainEntity } from '../../domain/entities/usuario.domain-entity';
import { UsuarioEntity } from './usuario.entity';
import { UsuarioListItemDto } from '../../application/dtos/usuario-list-item.dto';

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
    domain.rolId = entity.rol.id;
    domain.rolNombre = entity.rol.nombre;
    domain.dependenciaId = entity.dependencia?.id ?? null;
    domain.dependenciaNombre = entity.dependencia?.nombre ?? null;
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
}
