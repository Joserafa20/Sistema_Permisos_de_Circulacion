import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { CiudadanoEntity } from '../../../ciudadanos/infrastructure/persistence/ciudadano.entity';
import { MotocicletaEntity } from '../../../motocicletas/infrastructure/persistence/motocicleta.entity';
import { MotivoEntity } from '../../../motivos/infrastructure/persistence/motivo.entity';
import { SolicitudEntity } from '../persistence/solicitud.entity';
import { HistorialEstadoEntity } from '../persistence/historial-estado.entity';
import { EstadoSolicitud, TipoDocumentoIdentidad } from '../../../../common/enums';
import { ConflictException } from '../../../../common/exceptions/conflict.exception';

const ESTADOS_ACTIVOS: EstadoSolicitud[] = [
  EstadoSolicitud.RECIBIDA,
  EstadoSolicitud.EN_REVISION,
  EstadoSolicitud.PENDIENTE_CORRECCION,
];

export interface DatosCiudadanoTransaccion {
  tipoDocumento: TipoDocumentoIdentidad;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  direccion?: string;
  barrio?: string;
  celular?: string;
  email?: string;
  aceptaTratamientoDatos: boolean;
}

export interface DatosMotocicletaTransaccion {
  placa: string; // ya normalizada (UPPER+TRIM)
  marca?: string;
  linea?: string;
  modelo?: number;
  cilindraje?: number;
  color?: string;
  numeroMotor?: string;
  numeroChasis?: string;
}

export interface CrearSolicitudTransaccionParams {
  ciudadanoData: DatosCiudadanoTransaccion;
  motocicletaData: DatosMotocicletaTransaccion;
  motivoId: string;
  fechaInicio: string;
  fechaFin: string;
  descripcionAdicional: string | null;
  declaracionJurada: boolean;
  ipSolicitante: string | null;
  recaptchaScore: number | null;
}

export interface ResultadoTransaccion {
  solicitudId: string;
  numeroRadicado: string;
}

@Injectable()
export class SolicitudTransaccionService {
  constructor(private readonly dataSource: DataSource) {}

  async crear(params: CrearSolicitudTransaccionParams): Promise<ResultadoTransaccion> {
    return this.dataSource.transaction(async (em) => {
      const ciudadano = await this.upsertCiudadano(em, params.ciudadanoData);
      const motocicleta = await this.upsertMotocicleta(em, params.motocicletaData, ciudadano);

      // RN-03 dentro de la transacción — previene race conditions
      const activaSolicitud = await em.findOne(SolicitudEntity, {
        where: { motocicleta: { id: motocicleta.id }, estado: In(ESTADOS_ACTIVOS) },
        select: ['id', 'numeroRadicado'],
      });
      if (activaSolicitud) {
        throw new ConflictException(
          `La motocicleta ya tiene una solicitud activa con radicado ${activaSolicitud.numeroRadicado}`,
          'SOLICITUD_ACTIVA',
        );
      }

      const numeroRadicado = await this.generarRadicado(em);

      const solicitudEntity = em.create(SolicitudEntity, {
        numeroRadicado,
        estado: EstadoSolicitud.RECIBIDA,
        fechaInicio: params.fechaInicio,
        fechaFin: params.fechaFin,
        descripcionAdicional: params.descripcionAdicional,
        declaracionJurada: params.declaracionJurada,
        ipSolicitante: params.ipSolicitante,
        recaptchaScore: params.recaptchaScore != null ? String(params.recaptchaScore) : null,
        ciudadano,
        motocicleta,
        motivo: { id: params.motivoId } as MotivoEntity,
      });
      const savedSolicitud = await em.save(SolicitudEntity, solicitudEntity);

      await em.save(
        HistorialEstadoEntity,
        em.create(HistorialEstadoEntity, {
          estadoAnterior: null,
          estadoNuevo: EstadoSolicitud.RECIBIDA,
          motivo: null,
          camposCorreccion: null,
          ipAddress: params.ipSolicitante,
          solicitud: savedSolicitud,
          usuario: null,
        }),
      );

      return { solicitudId: savedSolicitud.id, numeroRadicado };
    });
  }

  // ─── Upsert ciudadano ──────────────────────────────────────────────────────

  private async upsertCiudadano(
    em: EntityManager,
    data: DatosCiudadanoTransaccion,
  ): Promise<CiudadanoEntity> {
    let entity = await em.findOne(CiudadanoEntity, {
      where: { numeroDocumento: data.numeroDocumento },
    });

    if (!entity) {
      entity = em.create(CiudadanoEntity, {
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        nombre: data.nombre,
        apellido: data.apellido,
        fechaNacimiento: data.fechaNacimiento ?? null,
        direccion: data.direccion ?? null,
        barrio: data.barrio ?? null,
        celular: data.celular ?? null,
        email: data.email ?? null,
        aceptaTratamientoDatos: data.aceptaTratamientoDatos,
        fechaAceptacionDatos: data.aceptaTratamientoDatos ? new Date() : null,
      });
    } else {
      // Actualiza datos mutables; nunca cambia tipoDocumento ni numeroDocumento
      entity.nombre = data.nombre;
      entity.apellido = data.apellido;
      if (data.fechaNacimiento !== undefined) entity.fechaNacimiento = data.fechaNacimiento;
      if (data.direccion !== undefined) entity.direccion = data.direccion;
      if (data.barrio !== undefined) entity.barrio = data.barrio;
      if (data.celular !== undefined) entity.celular = data.celular;
      if (data.email !== undefined) entity.email = data.email;
      if (data.aceptaTratamientoDatos && !entity.aceptaTratamientoDatos) {
        entity.aceptaTratamientoDatos = true;
        entity.fechaAceptacionDatos = new Date();
      }
    }

    return em.save(CiudadanoEntity, entity);
  }

  // ─── Upsert motocicleta ────────────────────────────────────────────────────

  private async upsertMotocicleta(
    em: EntityManager,
    data: DatosMotocicletaTransaccion,
    ciudadano: CiudadanoEntity,
  ): Promise<MotocicletaEntity> {
    let entity = await em.findOne(MotocicletaEntity, { where: { placa: data.placa } });

    if (!entity) {
      entity = em.create(MotocicletaEntity, {
        placa: data.placa,
        marca: data.marca ?? null,
        linea: data.linea ?? null,
        modelo: data.modelo ?? null,
        cilindraje: data.cilindraje ?? null,
        color: data.color ?? null,
        numeroMotor: data.numeroMotor ?? null,
        numeroChasis: data.numeroChasis ?? null,
        activo: true,
        ciudadano,
      });
    } else {
      // Actualiza campos técnicos; nunca cambia placa
      if (data.marca !== undefined) entity.marca = data.marca ?? null;
      if (data.linea !== undefined) entity.linea = data.linea ?? null;
      if (data.modelo !== undefined) entity.modelo = data.modelo ?? null;
      if (data.cilindraje !== undefined) entity.cilindraje = data.cilindraje ?? null;
      if (data.color !== undefined) entity.color = data.color ?? null;
      if (data.numeroMotor !== undefined) entity.numeroMotor = data.numeroMotor ?? null;
      if (data.numeroChasis !== undefined) entity.numeroChasis = data.numeroChasis ?? null;
    }

    return em.save(MotocicletaEntity, entity);
  }

  // ─── Generación de radicado (RN-14) ───────────────────────────────────────

  /**
   * Formato: AAAAMMDD-PYP-XXXXXX
   * La fecha se toma en zona horaria COT (America/Bogota, UTC-5).
   * El consecutivo es diario y se calcula contando radicados del mismo día.
   */
  private async generarRadicado(em: EntityManager): Promise<string> {
    const fechaCOT = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(new Date())
      .replace(/\//g, ''); // "04/08/2026" → "04082026"

    // Reordenar de DD/MM/YYYY a YYYYMMDD
    const datePart = `${fechaCOT.slice(4)}${fechaCOT.slice(2, 4)}${fechaCOT.slice(0, 2)}`;
    const prefijo = `${datePart}-PYP-`;

    const count = await em
      .createQueryBuilder(SolicitudEntity, 's')
      .where('s.numeroRadicado LIKE :prefijo', { prefijo: `${prefijo}%` })
      .getCount();

    const consecutivo = String(count + 1).padStart(6, '0');
    return `${prefijo}${consecutivo}`;
  }
}
