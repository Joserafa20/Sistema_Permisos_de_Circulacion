import { SolicitudDomainEntity } from '../../domain/entities/solicitud.domain-entity';
import { HistorialEstadoDomainEntity } from '../../domain/entities/historial-estado.domain-entity';
import { DocumentoDomainEntity } from '../../domain/entities/documento.domain-entity';
import { SolicitudEntity } from './solicitud.entity';
import { HistorialEstadoEntity } from './historial-estado.entity';
import { DocumentoEntity } from './documento.entity';
import { SolicitudListItemDto } from '../../application/dtos/solicitud-list-item.dto';
import { SolicitudDetalleDto } from '../../application/dtos/solicitud-detalle.dto';
import { HistorialEstadoItemDto } from '../../application/dtos/historial-estado-item.dto';
import { DocumentoItemDto } from '../../application/dtos/documento-item.dto';
import { TipoDocumentoIdentidad } from '../../../../common/enums';

// ─── Helpers privados ──────────────────────────────────────────────────────────

function calcularTiempoEspera(createdAt: Date): string {
  const diffMs = Date.now() - createdAt.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  return `${days} día${days !== 1 ? 's' : ''}`;
}

function historialToDomain(entity: HistorialEstadoEntity): HistorialEstadoDomainEntity {
  const domain = new HistorialEstadoDomainEntity();
  domain.id = entity.id;
  domain.estadoAnterior = entity.estadoAnterior;
  domain.estadoNuevo = entity.estadoNuevo;
  domain.motivo = entity.motivo;
  domain.camposCorreccion = entity.camposCorreccion;
  domain.ipAddress = entity.ipAddress;
  domain.createdAt = entity.createdAt;
  domain.usuarioId = entity.usuario?.id ?? null;
  domain.usuarioNombre = entity.usuario?.nombre ?? null;
  domain.usuarioApellido = entity.usuario?.apellido ?? null;
  return domain;
}

function documentoToDomain(entity: DocumentoEntity): DocumentoDomainEntity {
  const domain = new DocumentoDomainEntity();
  domain.id = entity.id;
  domain.tipoDocumento = entity.tipoDocumento;
  domain.nombreOriginal = entity.nombreOriginal;
  domain.nombreAlmacenado = entity.nombreAlmacenado;
  domain.storageKey = entity.storageKey;
  domain.mimeType = entity.mimeType;
  domain.tamanoBytes = entity.tamanoBytes;
  domain.hashSha256 = entity.hashSha256;
  domain.activo = entity.activo;
  domain.createdAt = entity.createdAt;
  domain.solicitudId = entity.solicitud?.id ?? '';
  return domain;
}

// ─── Mapper público ─────────────────────────────────────────────────────────

export class SolicitudMapper {
  static toDomain(
    entity: SolicitudEntity,
    opts: { withHistorial?: boolean; withDocumentos?: boolean } = {},
  ): SolicitudDomainEntity {
    const domain = new SolicitudDomainEntity();
    domain.id = entity.id;
    domain.numeroRadicado = entity.numeroRadicado;
    domain.estado = entity.estado;
    domain.fechaInicio = entity.fechaInicio;
    domain.fechaFin = entity.fechaFin;
    domain.descripcionAdicional = entity.descripcionAdicional;
    domain.declaracionJurada = entity.declaracionJurada;
    domain.ipSolicitante = entity.ipSolicitante;
    domain.recaptchaScore = entity.recaptchaScore ? parseFloat(entity.recaptchaScore) : null;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;

    // Ciudadano (siempre cargado con innerJoin)
    const c = entity.ciudadano;
    domain.ciudadanoId = c.id;
    domain.ciudadanoTipoDocumento = c.tipoDocumento as TipoDocumentoIdentidad;
    domain.ciudadanoNumeroDocumento = c.numeroDocumento;
    domain.ciudadanoNombre = c.nombre;
    domain.ciudadanoApellido = c.apellido;
    domain.ciudadanoFechaNacimiento = c.fechaNacimiento;
    domain.ciudadanoDireccion = c.direccion;
    domain.ciudadanoBarrio = c.barrio;
    domain.ciudadanoMunicipio = c.municipio
      ? `${c.municipio.nombre}, ${c.municipio.departamento}`
      : null;
    domain.ciudadanoCelular = c.celular;
    domain.ciudadanoEmail = c.email;

    // Motocicleta (siempre cargada con innerJoin)
    const m = entity.motocicleta;
    domain.motocicletaId = m.id;
    domain.motocicletaPlaca = m.placa;
    domain.motocicletaMarca = m.marca;
    domain.motocicletaLinea = m.linea;
    domain.motocicletaModelo = m.modelo;
    domain.motocicletaCilindraje = m.cilindraje;
    domain.motocicletaColor = m.color;
    domain.motocicletaNumeroMotor = m.numeroMotor;
    domain.motocicletaNumeroChasis = m.numeroChasis;

    // Motivo (siempre cargado con innerJoin)
    domain.motivoId = entity.motivo.id;
    domain.motivoNombre = entity.motivo.nombre;
    domain.motivoRequiereSoporte = entity.motivo.requiereSoporte;

    // Relaciones opcionales
    if (opts.withHistorial && Array.isArray(entity.historial)) {
      domain.historial = entity.historial.map(historialToDomain);
    }
    if (opts.withDocumentos && Array.isArray(entity.documentos)) {
      domain.documentos = entity.documentos.map(documentoToDomain);
    }

    return domain;
  }

  static toListItemDto(domain: SolicitudDomainEntity): SolicitudListItemDto {
    return {
      id: domain.id,
      numeroRadicado: domain.numeroRadicado,
      estado: domain.estado,
      ciudadano: {
        nombre: `${domain.ciudadanoNombre} ${domain.ciudadanoApellido}`,
        numeroDocumento: domain.ciudadanoNumeroDocumento,
        email: domain.ciudadanoEmail,
        celular: domain.ciudadanoCelular,
      },
      motocicleta: {
        placa: domain.motocicletaPlaca,
        marca: domain.motocicletaMarca,
        modelo: domain.motocicletaModelo,
      },
      motivo: domain.motivoNombre,
      fechaInicio: domain.fechaInicio,
      fechaFin: domain.fechaFin,
      tiempoEspera: calcularTiempoEspera(domain.createdAt),
      createdAt: domain.createdAt.toISOString(),
    };
  }

  static toDetalleDto(domain: SolicitudDomainEntity): SolicitudDetalleDto {
    const historialDtos: HistorialEstadoItemDto[] = (domain.historial ?? []).map((h) => ({
      id: h.id,
      estadoAnterior: h.estadoAnterior,
      estadoNuevo: h.estadoNuevo,
      motivo: h.motivo,
      camposCorreccion: h.camposCorreccion,
      usuario: h.usuarioNombre
        ? { nombre: h.usuarioNombre, apellido: h.usuarioApellido ?? '' }
        : null,
      createdAt: h.createdAt.toISOString(),
    }));

    const documentoDtos: DocumentoItemDto[] = (domain.documentos ?? []).map((d) => ({
      id: d.id,
      tipoDocumento: d.tipoDocumento,
      nombreOriginal: d.nombreOriginal,
      mimeType: d.mimeType,
      tamanoBytes: d.tamanoBytes,
      activo: d.activo,
      createdAt: d.createdAt.toISOString(),
    }));

    return {
      id: domain.id,
      numeroRadicado: domain.numeroRadicado,
      estado: domain.estado,
      ciudadano: {
        id: domain.ciudadanoId,
        tipoDocumento: domain.ciudadanoTipoDocumento,
        numeroDocumento: domain.ciudadanoNumeroDocumento,
        nombre: domain.ciudadanoNombre,
        apellido: domain.ciudadanoApellido,
        fechaNacimiento: domain.ciudadanoFechaNacimiento,
        direccion: domain.ciudadanoDireccion,
        barrio: domain.ciudadanoBarrio,
        municipio: domain.ciudadanoMunicipio,
        celular: domain.ciudadanoCelular,
        email: domain.ciudadanoEmail,
      },
      motocicleta: {
        id: domain.motocicletaId,
        placa: domain.motocicletaPlaca,
        marca: domain.motocicletaMarca,
        linea: domain.motocicletaLinea,
        modelo: domain.motocicletaModelo,
        cilindraje: domain.motocicletaCilindraje,
        color: domain.motocicletaColor,
        numeroMotor: domain.motocicletaNumeroMotor,
        numeroChasis: domain.motocicletaNumeroChasis,
      },
      motivo: {
        id: domain.motivoId,
        nombre: domain.motivoNombre,
        requiereSoporte: domain.motivoRequiereSoporte,
      },
      fechaInicio: domain.fechaInicio,
      fechaFin: domain.fechaFin,
      descripcionAdicional: domain.descripcionAdicional,
      declaracionJurada: domain.declaracionJurada,
      documentos: documentoDtos,
      historial: historialDtos,
      permiso: null,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt?.toISOString() ?? null,
    };
  }
}
