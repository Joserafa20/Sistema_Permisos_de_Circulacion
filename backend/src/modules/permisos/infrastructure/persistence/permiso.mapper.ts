import { PermisoEntity } from './permiso.entity';
import {
  PermisoDomainEntity,
  SnapshotCiudadano,
  SnapshotMotocicleta,
  SnapshotMotivo,
} from '../../domain/entities/permiso.domain-entity';

export class PermisoMapper {
  static toDomain(entity: PermisoEntity): PermisoDomainEntity {
    const domain = new PermisoDomainEntity();
    domain.id = entity.id;
    domain.codigoPermiso = entity.codigoPermiso;
    domain.solicitudId =
      entity.solicitud?.id ?? (entity as unknown as { solicitud_id: string }).solicitud_id;
    domain.funcionarioId =
      entity.funcionario?.id ?? (entity as unknown as { funcionario_id: string }).funcionario_id;
    domain.codigoQr = entity.codigoQr;
    domain.storageKeyPdf = entity.storageKeyPdf;
    domain.fechaExpedicion = entity.fechaExpedicion;
    domain.fechaVencimiento = entity.fechaVencimiento;
    domain.estado = entity.estado;
    domain.motivoRevocacion = entity.motivoRevocacion;
    domain.revocadoAt = entity.revocadoAt;
    domain.revocadoPorId = entity.revocadoPor?.id ?? null;
    domain.snapshotCiudadano = entity.snapshotCiudadano as unknown as SnapshotCiudadano;
    domain.snapshotMotocicleta = entity.snapshotMotocicleta as unknown as SnapshotMotocicleta;
    domain.snapshotMotivo = entity.snapshotMotivo as unknown as SnapshotMotivo;
    domain.condicionesRestricciones = entity.condicionesRestricciones;
    domain.hashPdf = entity.hashPdf;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;

    if (entity.funcionario) {
      domain.funcionarioNombre = entity.funcionario.nombre;
      domain.funcionarioApellido = entity.funcionario.apellido;
    }

    if (entity.solicitud) {
      domain.numeroRadicado = entity.solicitud.numeroRadicado;
    }

    return domain;
  }
}
