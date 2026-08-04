import { EstadoSolicitud } from '../../../../common/enums';

/**
 * Máquina de estados centralizada de solicitudes (RN-15).
 * Fuente única de verdad para transiciones permitidas.
 * Toda lógica de cambio de estado debe validar aquí antes de persistir.
 */
const TRANSICIONES_PERMITIDAS: Partial<Record<EstadoSolicitud, EstadoSolicitud[]>> = {
  [EstadoSolicitud.RECIBIDA]: [EstadoSolicitud.EN_REVISION, EstadoSolicitud.VENCIDA],
  [EstadoSolicitud.EN_REVISION]: [
    EstadoSolicitud.APROBADA,
    EstadoSolicitud.RECHAZADA,
    EstadoSolicitud.PENDIENTE_CORRECCION,
    EstadoSolicitud.VENCIDA,
  ],
  [EstadoSolicitud.PENDIENTE_CORRECCION]: [
    EstadoSolicitud.EN_REVISION,
    EstadoSolicitud.APROBADA,
    EstadoSolicitud.RECHAZADA,
    EstadoSolicitud.VENCIDA,
  ],
  // aprobada, rechazada, vencida son estados terminales — sin transiciones
};

export class SolicitudStateMachine {
  static esTransicionValida(desde: EstadoSolicitud, hacia: EstadoSolicitud): boolean {
    return TRANSICIONES_PERMITIDAS[desde]?.includes(hacia) ?? false;
  }

  static validar(desde: EstadoSolicitud, hacia: EstadoSolicitud): void {
    if (!this.esTransicionValida(desde, hacia)) {
      throw new Error(
        `TRANSICION_ESTADO_INVALIDA:La solicitud no puede cambiar de '${desde}' a '${hacia}'`,
      );
    }
  }
}
