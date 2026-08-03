import { CiudadanoDomainEntity } from '../../domain/entities/ciudadano.domain-entity';
import { CiudadanoEntity } from './ciudadano.entity';
import { CiudadanoListItemDto } from '../../application/dtos/ciudadano-list-item.dto';
import { CiudadanoDetalleDto } from '../../application/dtos/ciudadano-detalle.dto';

export class CiudadanoMapper {
  static toDomain(entity: CiudadanoEntity): CiudadanoDomainEntity {
    const domain = new CiudadanoDomainEntity();
    domain.id = entity.id;
    domain.tipoDocumento = entity.tipoDocumento;
    domain.numeroDocumento = entity.numeroDocumento;
    domain.nombre = entity.nombre;
    domain.apellido = entity.apellido;
    domain.fechaNacimiento = entity.fechaNacimiento;
    domain.direccion = entity.direccion;
    domain.barrio = entity.barrio;
    domain.celular = entity.celular;
    domain.email = entity.email;
    domain.aceptaTratamientoDatos = entity.aceptaTratamientoDatos;
    domain.fechaAceptacionDatos = entity.fechaAceptacionDatos;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    domain.municipioId = entity.municipio?.id ?? null;
    domain.municipioNombre = entity.municipio?.nombre ?? null;
    domain.municipioDepartamento = entity.municipio?.departamento ?? null;
    return domain;
  }

  static toListItemDto(domain: CiudadanoDomainEntity): CiudadanoListItemDto {
    return {
      id: domain.id,
      tipoDocumento: domain.tipoDocumento,
      numeroDocumento: domain.numeroDocumento,
      nombre: domain.nombre,
      apellido: domain.apellido,
      celular: domain.celular,
      email: domain.email,
      municipio: domain.municipioId
        ? {
            id: domain.municipioId,
            nombre: domain.municipioNombre!,
            departamento: domain.municipioDepartamento!,
          }
        : null,
      createdAt: domain.createdAt.toISOString(),
    };
  }

  static toDetalleDto(domain: CiudadanoDomainEntity): CiudadanoDetalleDto {
    return {
      id: domain.id,
      tipoDocumento: domain.tipoDocumento,
      numeroDocumento: domain.numeroDocumento,
      nombre: domain.nombre,
      apellido: domain.apellido,
      fechaNacimiento: domain.fechaNacimiento,
      direccion: domain.direccion,
      barrio: domain.barrio,
      celular: domain.celular,
      email: domain.email,
      aceptaTratamientoDatos: domain.aceptaTratamientoDatos,
      fechaAceptacionDatos: domain.fechaAceptacionDatos?.toISOString() ?? null,
      municipio: domain.municipioId
        ? {
            id: domain.municipioId,
            nombre: domain.municipioNombre!,
            departamento: domain.municipioDepartamento!,
          }
        : null,
      motocicletas: (domain.motocicletas ?? []).map((m) => ({
        id: m.id,
        placa: m.placa,
        marca: m.marca,
        modelo: m.modelo,
        activo: m.activo,
      })),
      totalSolicitudes: domain.totalSolicitudes ?? 0,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt?.toISOString() ?? null,
    };
  }
}
