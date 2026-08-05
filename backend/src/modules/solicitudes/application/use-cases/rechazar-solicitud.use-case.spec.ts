import { RechazarSolicitudUseCase } from './rechazar-solicitud.use-case';
import { EstadoSolicitud } from '../../../../common/enums/estado-solicitud.enum';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';

function makeSolicitud(
  overrides: Partial<{
    id: string;
    estado: EstadoSolicitud;
    numeroRadicado: string;
    ciudadanoEmail: string | null;
    ciudadanoNombre: string;
    ciudadanoApellido: string;
  }> = {},
) {
  return {
    id: 'sol-1',
    estado: EstadoSolicitud.EN_REVISION,
    numeroRadicado: '20260101-PYP-000001',
    ciudadanoEmail: 'ciudadano@test.co',
    ciudadanoNombre: 'Juan',
    ciudadanoApellido: 'Pérez',
    ...overrides,
  };
}

function buildDeps(solicitud: ReturnType<typeof makeSolicitud> | null, cambiado = true) {
  const solicitudBusquedaService = {
    buscarPorId: jest.fn().mockResolvedValue(solicitud),
  };
  const solicitudRepo = {
    cambiarEstado: jest.fn().mockResolvedValue(cambiado),
  };
  const auditoriaService = {
    registrar: jest.fn().mockResolvedValue(undefined),
  };
  const notificacionesService = {
    encolar: jest.fn().mockResolvedValue(undefined),
  };
  return { solicitudBusquedaService, solicitudRepo, auditoriaService, notificacionesService };
}

describe('RechazarSolicitudUseCase', () => {
  function buildUseCase(deps: ReturnType<typeof buildDeps>) {
    return new RechazarSolicitudUseCase(
      deps.solicitudBusquedaService as never,
      deps.solicitudRepo as never,
      deps.auditoriaService as never,
      deps.notificacionesService as never,
    );
  }

  it('lanza NotFoundException cuando la solicitud no existe', async () => {
    const deps = buildDeps(null);
    const useCase = buildUseCase(deps);

    await expect(
      useCase.ejecutar(
        'sol-999',
        { motivo: 'Motivo de prueba suficientemente largo' },
        'u-1',
        null,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza BusinessRuleException cuando el estado no permite rechazo (APROBADA)', async () => {
    const sol = makeSolicitud({ estado: EstadoSolicitud.APROBADA });
    const deps = buildDeps(sol);
    const useCase = buildUseCase(deps);

    await expect(
      useCase.ejecutar('sol-1', { motivo: 'Motivo de rechazo válido' }, 'u-1', null),
    ).rejects.toThrow(BusinessRuleException);
  });

  it('lanza BusinessRuleException cuando el estado no permite rechazo (RECHAZADA)', async () => {
    const sol = makeSolicitud({ estado: EstadoSolicitud.RECHAZADA });
    const deps = buildDeps(sol);
    const useCase = buildUseCase(deps);

    await expect(
      useCase.ejecutar('sol-1', { motivo: 'Motivo de rechazo válido' }, 'u-1', null),
    ).rejects.toThrow(BusinessRuleException);
  });

  it('lanza BusinessRuleException cuando el estado no permite rechazo (VENCIDA)', async () => {
    const sol = makeSolicitud({ estado: EstadoSolicitud.VENCIDA });
    const deps = buildDeps(sol);
    const useCase = buildUseCase(deps);

    await expect(useCase.ejecutar('sol-1', { motivo: 'Motivo' }, 'u-1', null)).rejects.toThrow(
      BusinessRuleException,
    );
  });

  it('rechaza correctamente desde EN_REVISION y retorna el DTO esperado', async () => {
    const sol = makeSolicitud({ estado: EstadoSolicitud.EN_REVISION });
    const deps = buildDeps(sol, true);
    const useCase = buildUseCase(deps);

    const result = await useCase.ejecutar(
      'sol-1',
      { motivo: 'Documentación incompleta' },
      'u-funcionario',
      '127.0.0.1',
    );

    expect(result.solicitudId).toBe('sol-1');
    expect(result.estado).toBe(EstadoSolicitud.RECHAZADA);
    expect(result.numeroRadicado).toBe(sol.numeroRadicado);
  });

  it('rechaza correctamente desde PENDIENTE_CORRECCION', async () => {
    const sol = makeSolicitud({ estado: EstadoSolicitud.PENDIENTE_CORRECCION });
    const deps = buildDeps(sol, true);
    const useCase = buildUseCase(deps);

    const result = await useCase.ejecutar(
      'sol-1',
      { motivo: 'No subsanó los errores requeridos' },
      'u-funcionario',
      null,
    );

    expect(result.estado).toBe(EstadoSolicitud.RECHAZADA);
  });

  it('llama a cambiarEstado con los parámetros correctos', async () => {
    const sol = makeSolicitud({ estado: EstadoSolicitud.EN_REVISION });
    const deps = buildDeps(sol, true);
    const useCase = buildUseCase(deps);

    await useCase.ejecutar('sol-1', { motivo: 'Motivo de prueba' }, 'u-1', '10.0.0.1');

    expect(deps.solicitudRepo.cambiarEstado).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'sol-1',
        estadoNuevo: EstadoSolicitud.RECHAZADA,
        motivo: 'Motivo de prueba',
        camposCorreccion: null,
        usuarioId: 'u-1',
        ipAddress: '10.0.0.1',
      }),
    );
  });

  it('lanza BusinessRuleException si el cambio de estado falla por concurrencia', async () => {
    const sol = makeSolicitud({ estado: EstadoSolicitud.EN_REVISION });
    const deps = buildDeps(sol, false); // cambio devuelve false (concurrencia)
    const useCase = buildUseCase(deps);

    await expect(
      useCase.ejecutar('sol-1', { motivo: 'Motivo válido' }, 'u-1', null),
    ).rejects.toThrow(BusinessRuleException);
  });

  it('encola notificación al ciudadano si tiene email', async () => {
    const sol = makeSolicitud({ ciudadanoEmail: 'ciudadano@test.co' });
    const deps = buildDeps(sol, true);
    const useCase = buildUseCase(deps);

    await useCase.ejecutar('sol-1', { motivo: 'Motivo' }, 'u-1', null);

    // Permitir que las promesas fire-and-forget se resuelvan
    await Promise.resolve();

    expect(deps.notificacionesService.encolar).toHaveBeenCalledWith(
      expect.objectContaining({ destinatario: 'ciudadano@test.co' }),
    );
  });

  it('no encola notificación si el ciudadano no tiene email', async () => {
    const sol = makeSolicitud({ ciudadanoEmail: null });
    const deps = buildDeps(sol, true);
    const useCase = buildUseCase(deps);

    await useCase.ejecutar('sol-1', { motivo: 'Motivo' }, 'u-1', null);
    await Promise.resolve();

    expect(deps.notificacionesService.encolar).not.toHaveBeenCalled();
  });

  it('registra auditoría con el estado anterior y el nuevo', async () => {
    const sol = makeSolicitud({ estado: EstadoSolicitud.EN_REVISION });
    const deps = buildDeps(sol, true);
    const useCase = buildUseCase(deps);

    await useCase.ejecutar('sol-1', { motivo: 'Motivo auditable' }, 'u-func-1', '1.2.3.4');
    await Promise.resolve();

    expect(deps.auditoriaService.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        datosAnteriores: { estado: EstadoSolicitud.EN_REVISION },
        datosNuevos: expect.objectContaining({ estado: EstadoSolicitud.RECHAZADA }),
        usuarioId: 'u-func-1',
      }),
    );
  });
});
