import { LogoutUseCase } from './logout.use-case';

function buildDeps(tokenFound = true) {
  const token = tokenFound ? { id: 'tok-1' } : null;
  const tokenRepo = {
    findOne: jest.fn().mockResolvedValue(token),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const auditoriaService = { registrar: jest.fn().mockResolvedValue(undefined) };
  return { tokenRepo, auditoriaService };
}

describe('LogoutUseCase', () => {
  function build(deps: ReturnType<typeof buildDeps>) {
    return new LogoutUseCase(deps.auditoriaService as never, deps.tokenRepo as never);
  }

  it('lanza UnauthorizedException cuando el token no existe o ya fue revocado', async () => {
    const deps = buildDeps(false);
    const uc = build(deps);

    await expect(
      uc.execute({ refreshToken: 'bad', userId: 'u-1', ipAddress: null, userAgent: null }),
    ).rejects.toThrow();
  });

  it('revoca el token y devuelve mensaje de éxito', async () => {
    const deps = buildDeps(true);
    const uc = build(deps);

    const result = await uc.execute({
      refreshToken: 'valid-token',
      userId: 'u-1',
      ipAddress: null,
      userAgent: null,
    });

    expect(result.message).toBeDefined();
    expect(deps.tokenRepo.update).toHaveBeenCalledWith(
      'tok-1',
      expect.objectContaining({ revocado: true }),
    );
  });

  it('registra auditoría de LOGOUT', async () => {
    const deps = buildDeps(true);
    const uc = build(deps);

    await uc.execute({ refreshToken: 'tok', userId: 'u-2', ipAddress: '1.1.1.1', userAgent: 'ua' });

    expect(deps.auditoriaService.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ entidadId: 'u-2' }),
    );
  });
});
