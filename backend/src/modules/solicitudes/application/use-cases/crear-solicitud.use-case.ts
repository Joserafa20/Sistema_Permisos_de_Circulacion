import { Injectable } from '@nestjs/common';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { NotificacionesService } from '../../../notificaciones/notificaciones.service';
import { MotivoBusquedaService } from '../../../motivos/application/services/motivo-busqueda.service';
import { MotocicletaBusquedaService } from '../../../motocicletas/application/services/motocicleta-busqueda.service';
import { SolicitudBusquedaService } from '../services/solicitud-busqueda.service';
import { RecaptchaService } from '../../infrastructure/services/recaptcha.service';
import { ConfiguracionSistemaService } from '../../infrastructure/services/configuracion-sistema.service';
import { SolicitudTransaccionService } from '../../infrastructure/services/solicitud-transaccion.service';
import { CrearSolicitudDto } from '../dtos/crear-solicitud.dto';
import { SolicitudCreadaDto } from '../dtos/solicitud-creada.dto';
import { AccionAuditoria, EstadoSolicitud, TipoNotificacion } from '../../../../common/enums';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';
import { ConflictException } from '../../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';

@Injectable()
export class CrearSolicitudUseCase {
  constructor(
    private readonly recaptchaService: RecaptchaService,
    private readonly motivoBusquedaService: MotivoBusquedaService,
    private readonly motocicletaBusquedaService: MotocicletaBusquedaService,
    private readonly solicitudBusquedaService: SolicitudBusquedaService,
    private readonly configuracionSistemaService: ConfiguracionSistemaService,
    private readonly solicitudTransaccionService: SolicitudTransaccionService,
    private readonly auditoriaService: AuditoriaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async ejecutar(
    dto: CrearSolicitudDto,
    ipSolicitante: string | null,
  ): Promise<SolicitudCreadaDto> {
    // 1. Verificar reCAPTCHA (RN-55) — lanza BusinessRuleException si falla
    const recaptchaScore = await this.recaptchaService.verificar(dto.recaptchaToken ?? '');

    // 2. Validar motivo activo
    const motivo = await this.motivoBusquedaService.buscarPorId(dto.motivoId);
    if (!motivo || !motivo.activo) {
      throw new NotFoundException(
        'El motivo seleccionado no existe o no está habilitado',
        'MOTIVO_NO_ENCONTRADO',
      );
    }

    // 3. RN-01: fechaInicio >= hoy en COT; si no se envía, se usa la fecha actual
    const todayCOT = this.obtenerFechaCOT();
    const fechaInicio = dto.fechaInicio ?? todayCOT;
    if (fechaInicio < todayCOT) {
      throw new BusinessRuleException(
        `La fecha de inicio (${fechaInicio}) no puede ser anterior a hoy (${todayCOT})`,
        'FECHA_INICIO_PASADA',
      );
    }

    // 4. RN-02: calcular fechaFin según dias_max_permiso
    const diasMax = await this.configuracionSistemaService.obtenerDiasMaxPermiso();
    const fechaFin = this.sumarDias(fechaInicio, diasMax);

    // 5. RN-03 pre-check fuera de transacción (ruta rápida)
    const placa = dto.motocicleta.placa.trim().toUpperCase();
    const motoExistente = await this.motocicletaBusquedaService.buscarPorPlaca(placa);
    if (motoExistente) {
      const { activa, numeroRadicado } =
        await this.solicitudBusquedaService.verificarSolicitudActiva(motoExistente.id);
      if (activa) {
        throw new ConflictException(
          `La motocicleta ${placa} ya tiene una solicitud activa con radicado ${numeroRadicado}`,
          'SOLICITUD_ACTIVA',
        );
      }
    }

    // 6. Ejecutar transacción atómica
    const resultado = await this.solicitudTransaccionService.crear({
      ciudadanoData: {
        tipoDocumento: dto.ciudadano.tipoDocumento,
        numeroDocumento: dto.ciudadano.numeroDocumento,
        nombre: dto.ciudadano.nombre,
        apellido: dto.ciudadano.apellido,
        fechaNacimiento: dto.ciudadano.fechaNacimiento,
        direccion: dto.ciudadano.direccion,
        barrio: dto.ciudadano.barrio,
        celular: dto.ciudadano.celular,
        email: dto.ciudadano.email,
        aceptaTratamientoDatos: dto.ciudadano.aceptaTratamientoDatos,
      },
      motocicletaData: {
        placa,
        marca: dto.motocicleta.marca,
        linea: dto.motocicleta.linea,
        modelo: dto.motocicleta.modelo,
        cilindraje: dto.motocicleta.cilindraje,
        color: dto.motocicleta.color,
        numeroMotor: dto.motocicleta.numeroMotor,
        numeroChasis: dto.motocicleta.numeroChasis,
      },
      motivoId: dto.motivoId,
      fechaInicio: fechaInicio,
      fechaFin,
      descripcionAdicional: dto.descripcionAdicional ?? null,
      declaracionJurada: dto.declaracionJurada,
      ipSolicitante,
      recaptchaScore,
    });

    // 7. Registrar auditoría (fire-and-forget; el fallo no afecta la respuesta)
    void this.auditoriaService.registrar({
      accion: AccionAuditoria.CREAR,
      entidad: 'solicitud',
      entidadId: resultado.solicitudId,
      datosNuevos: {
        numeroRadicado: resultado.numeroRadicado,
        placa,
        motivoId: dto.motivoId,
        fechaInicio: fechaInicio,
        fechaFin,
      },
      ipAddress: ipSolicitante,
      usuarioId: null,
    });

    // Notificar al ciudadano (fire-and-forget — RN-76)
    if (dto.ciudadano.email) {
      void this.notificacionesService.encolar({
        tipo: TipoNotificacion.SOLICITUD_RECIBIDA,
        destinatario: dto.ciudadano.email,
        asunto: `Solicitud recibida — Radicado ${resultado.numeroRadicado}`,
        solicitudId: resultado.solicitudId,
        contexto: {
          nombreCiudadano: `${dto.ciudadano.nombre} ${dto.ciudadano.apellido}`,
          numeroRadicado: resultado.numeroRadicado,
          motivoNombre: motivo.nombre,
          fechaInicio: fechaInicio,
          fechaFin,
        },
      });
    }

    return {
      id: resultado.solicitudId,
      numeroRadicado: resultado.numeroRadicado,
      estado: EstadoSolicitud.RECIBIDA,
      fechaInicio: fechaInicio,
      fechaFin,
      motivoNombre: motivo.nombre,
      createdAt: new Date().toISOString(),
    };
  }

  // ─── Helpers de fecha ──────────────────────────────────────────────────────

  private obtenerFechaCOT(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
    }).format(new Date()); // "YYYY-MM-DD"
  }

  private sumarDias(fechaStr: string, dias: number): string {
    const date = new Date(`${fechaStr}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + dias);
    return date.toISOString().slice(0, 10);
  }
}
