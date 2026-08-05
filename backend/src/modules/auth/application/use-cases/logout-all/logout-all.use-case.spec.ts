import { LogoutAllUseCase } from './logout-all.use-case';

function buildDeps(affected = 3) {
  const qb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected }),
  };
  const tokenRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(qb),
  };
  const auditoriaService = {
    registrar: jest.fn().mockResolvedValue(undefined),
  };
  return { tokenRepo, auditoriaService, qb };
}

describe('LogoutAllUseCase', () => {
  function build(deps: ReturnType<typeof buildDeps>) {
    return new LogoutAllUseCase(deps.auditoriaService as never, deps.tokenRepo as never);
  }

  it('revoca todos los tokens activos del usuario', async () => {
    const deps = buildDeps(3);
    const uc = build(deps);

    const result = await uc.execute({ userId: 'u-1', ipAddress: null, userAgent: null });

    expect(result.revocados).toBe(3);
    expect(result.message).toContain('sesiones');
  });

  it('retorna revocados:0 cuando no hay tokens activos', async () => {
    const deps = buildDeps(0);
    const uc = build(deps);

    const result = await uc.execute({ userId: 'u-1', ipAddress: null, userAgent: null });

    expect(result.revocados).toBe(0);
  });

  it('registra auditoría con globalLogout:true', async () => {
    const deps = buildDeps(2);
    const uc = build(deps);

    await uc.execute({ userId: 'u-99', ipAddress: '1.2.3.4', userAgent: 'ua' });

    expect(deps.auditoriaService.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        entidadId: 'u-99',
        datosNuevos: expect.objectContaining({ globalLogout: true }),
      }),
    );
  });
});
