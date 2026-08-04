import { Inject, Injectable } from '@nestjs/common';
import { EstadoPermiso, ResultadoQrValidacion } from '../../../../common/enums';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';
import { QrValidacionRepository } from '../../infrastructure/persistence/qr-validacion.repository';
import { VerificarQrResponseDto } from '../dtos/verificar-qr-response.dto';

/**
 * Verifica la autenticidad de un permiso por su código QR opaco.
 * Siempre retorna HTTP 200 — el resultado se comunica en data.resultado (RN-34).
 * Registra cada escaneo en qr_validaciones (RN-35).
 * Incluye condicionesRestricciones si el permiso está vigente (RN-39).
 */
@Injectable()
export class VerificarQrUseCase {
  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
    private readonly qrValidacionRepo: QrValidacionRepository,
  ) {}

  async ejecutar(
    codigoQr: string,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<VerificarQrResponseDto> {
    const permiso = await this.permisoRepo.findByCodigoQr(codigoQr);

    if (!permiso) {
      // Registrar escaneo de código no encontrado (RN-35)
      void this.qrValidacionRepo.registrar({
        codigoQr,
        permisoId: null,
        ipAddress,
        userAgent,
        resultado: ResultadoQrValidacion.NO_ENCONTRADO,
      });

      return {
        resultado: ResultadoQrValidacion.NO_ENCONTRADO,
        mensaje: 'El código QR escaneado no corresponde a ningún permiso registrado en el sistema.',
      };
    }

    const resultado = this.resolverResultado(permiso.estado);

    // Registrar escaneo (RN-35)
    void this.qrValidacionRepo.registrar({
      codigoQr,
      permisoId: permiso.id,
      ipAddress,
      userAgent,
      resultado,
    });

    if (resultado === ResultadoQrValidacion.VIGENTE) {
      const titular = `${permiso.snapshotCiudadano.nombre} ${permiso.snapshotCiudadano.apellido}`;
      const funcionarioStr = [
        permiso.funcionarioNombre,
        permiso.funcionarioApellido,
        permiso.funcionarioDependencia ? `— ${permiso.funcionarioDependencia}` : '',
      ]
        .filter(Boolean)
        .join(' ');

      return {
        resultado,
        codigoPermiso: permiso.codigoPermiso,
        titular,
        tipoDocumento: permiso.snapshotCiudadano.tipoDocumento,
        numeroDocumento: permiso.snapshotCiudadano.numeroDocumento,
        placa: permiso.snapshotMotocicleta.placa,
        marca: permiso.snapshotMotocicleta.marca ?? undefined,
        linea: permiso.snapshotMotocicleta.linea ?? undefined,
        modelo: permiso.snapshotMotocicleta.modelo ?? undefined,
        color: permiso.snapshotMotocicleta.color ?? undefined,
        motivo: permiso.snapshotMotivo.nombre,
        fechaExpedicion: permiso.fechaExpedicion.toISOString().split('T')[0],
        fechaVencimiento: permiso.fechaVencimiento,
        estadoPermiso: 'VIGENTE',
        funcionarioAutorizo: funcionarioStr || undefined,
        condicionesRestricciones: permiso.condicionesRestricciones,
      };
    }

    if (resultado === ResultadoQrValidacion.VENCIDO) {
      return {
        resultado,
        codigoPermiso: permiso.codigoPermiso,
        estadoPermiso: 'VENCIDO',
        fechaVencimiento: permiso.fechaVencimiento,
        mensaje: `Este permiso venció el ${this.formatFecha(permiso.fechaVencimiento)} y ya no es válido.`,
      };
    }

    // REVOCADO
    return {
      resultado,
      codigoPermiso: permiso.codigoPermiso,
      estadoPermiso: 'REVOCADO',
      mensaje: 'Este permiso fue revocado por la autoridad competente y no es válido.',
    };
  }

  private resolverResultado(estado: EstadoPermiso): ResultadoQrValidacion {
    switch (estado) {
      case EstadoPermiso.VIGENTE:
        return ResultadoQrValidacion.VIGENTE;
      case EstadoPermiso.VENCIDO:
        return ResultadoQrValidacion.VENCIDO;
      case EstadoPermiso.REVOCADO:
        return ResultadoQrValidacion.REVOCADO;
      default:
        return ResultadoQrValidacion.NO_ENCONTRADO;
    }
  }

  private formatFecha(fechaStr: string): string {
    const [year, month, day] = fechaStr.split('-');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }
}
