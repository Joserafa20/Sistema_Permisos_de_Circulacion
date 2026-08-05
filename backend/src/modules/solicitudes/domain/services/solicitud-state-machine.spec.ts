import { EstadoSolicitud } from '../../../../common/enums/estado-solicitud.enum';
import { SolicitudStateMachine } from './solicitud-state-machine';

describe('SolicitudStateMachine', () => {
  describe('esTransicionValida', () => {
    // Transiciones válidas desde RECIBIDA
    it('permite RECIBIDA → EN_REVISION', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.RECIBIDA,
          EstadoSolicitud.EN_REVISION,
        ),
      ).toBe(true);
    });

    it('permite RECIBIDA → VENCIDA', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(EstadoSolicitud.RECIBIDA, EstadoSolicitud.VENCIDA),
      ).toBe(true);
    });

    // Transiciones válidas desde EN_REVISION
    it('permite EN_REVISION → APROBADA', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.EN_REVISION,
          EstadoSolicitud.APROBADA,
        ),
      ).toBe(true);
    });

    it('permite EN_REVISION → RECHAZADA', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.EN_REVISION,
          EstadoSolicitud.RECHAZADA,
        ),
      ).toBe(true);
    });

    it('permite EN_REVISION → PENDIENTE_CORRECCION', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.EN_REVISION,
          EstadoSolicitud.PENDIENTE_CORRECCION,
        ),
      ).toBe(true);
    });

    it('permite EN_REVISION → VENCIDA', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.EN_REVISION,
          EstadoSolicitud.VENCIDA,
        ),
      ).toBe(true);
    });

    // Transiciones válidas desde PENDIENTE_CORRECCION
    it('permite PENDIENTE_CORRECCION → EN_REVISION', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.PENDIENTE_CORRECCION,
          EstadoSolicitud.EN_REVISION,
        ),
      ).toBe(true);
    });

    it('permite PENDIENTE_CORRECCION → APROBADA', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.PENDIENTE_CORRECCION,
          EstadoSolicitud.APROBADA,
        ),
      ).toBe(true);
    });

    it('permite PENDIENTE_CORRECCION → RECHAZADA', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.PENDIENTE_CORRECCION,
          EstadoSolicitud.RECHAZADA,
        ),
      ).toBe(true);
    });

    // Estados terminales — sin transiciones
    it('rechaza APROBADA → cualquier estado', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.APROBADA,
          EstadoSolicitud.EN_REVISION,
        ),
      ).toBe(false);
    });

    it('rechaza RECHAZADA → cualquier estado', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.RECHAZADA,
          EstadoSolicitud.EN_REVISION,
        ),
      ).toBe(false);
    });

    it('rechaza VENCIDA → cualquier estado', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.VENCIDA,
          EstadoSolicitud.EN_REVISION,
        ),
      ).toBe(false);
    });

    // Transiciones inválidas desde estados intermedios
    it('rechaza RECIBIDA → APROBADA (salto de estado)', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.RECIBIDA,
          EstadoSolicitud.APROBADA,
        ),
      ).toBe(false);
    });

    it('rechaza RECIBIDA → RECHAZADA (salto de estado)', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.RECIBIDA,
          EstadoSolicitud.RECHAZADA,
        ),
      ).toBe(false);
    });

    it('rechaza RECIBIDA → PENDIENTE_CORRECCION (salto de estado)', () => {
      expect(
        SolicitudStateMachine.esTransicionValida(
          EstadoSolicitud.RECIBIDA,
          EstadoSolicitud.PENDIENTE_CORRECCION,
        ),
      ).toBe(false);
    });
  });

  describe('validar', () => {
    it('no lanza excepción en transición válida', () => {
      expect(() =>
        SolicitudStateMachine.validar(EstadoSolicitud.RECIBIDA, EstadoSolicitud.EN_REVISION),
      ).not.toThrow();
    });

    it('lanza Error con código en transición inválida', () => {
      expect(() =>
        SolicitudStateMachine.validar(EstadoSolicitud.APROBADA, EstadoSolicitud.RECHAZADA),
      ).toThrow(/TRANSICION_ESTADO_INVALIDA/);
    });

    it('el mensaje de error menciona ambos estados', () => {
      expect(() =>
        SolicitudStateMachine.validar(EstadoSolicitud.RECHAZADA, EstadoSolicitud.EN_REVISION),
      ).toThrow(new RegExp(`${EstadoSolicitud.RECHAZADA}.*${EstadoSolicitud.EN_REVISION}`));
    });
  });
});
