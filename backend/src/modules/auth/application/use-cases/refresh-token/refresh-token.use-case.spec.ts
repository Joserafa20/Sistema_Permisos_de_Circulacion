import { RefreshTokenUseCase } from './refresh-token.use-case';

function makeToken(
  overrides: Partial<{
    revocado: boolean;
    expiraAt: Date;
    familia: string | null;
    usuario: { id: string; activo: boolean; rol: { nombre: string } } | null;
  }> = {},
) {
  return {
    id: 'tok-1',
    revocado: false,
    expiraAt: new Date(Date.now() + 86_400_000),
    familia: 'fam-uuid-1',
    usuario: { id: 'u-1', activo: true, rol: { nombre: 'FUNCIONARIO' } },
    ...overrides,
  };
}

function buildDeps(token: ReturnType<typeof makeToken> | null) {
  const qb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const tokenRepo = {
    findOne: jest.fn().mockResolvedValue(token),
    update: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockImplementation((d) => d),
    save: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn().mockReturnValue(qb),
  };
  const jwtService = { sign: jest.fn().mockReturnValue('new-jwt') };
  const configService = { get: jest.fn().mockReturnValue('refresh-secret') };
  return { tokenRepo, jwtService, configService, qb };
}

describe('RefreshTokenUseCase', () => {
  function build(deps: ReturnType<typeof buildDeps>) {
    return new RefreshTokenUseCase(
      deps.jwtService as never,
      deps.configService as never,
      deps.tokenRepo as never,
    );
  }

  it('lanza UnauthorizedException cuando el token no existe', async () => {
    const deps = buildDeps(null);
    const uc = build(deps);

    await expect(
      uc.execute({ userId: 'u-1', rawRefreshToken: 'bad', ipAddress: null, userAgent: null }),
    ).rejects.toThrow();
  });

  it('lanza UnauthorizedException cuando el token está revocado (detección de reuso)', async () => {
    const token = makeToken({ revocado: true });
    const deps = buildDeps(token);
    const uc = build(deps);

    await expect(
      uc.execute({ userId: 'u-1', rawRefreshToken: 'tok', ipAddress: null, userAgent: null }),
    ).rejects.toThrow();
  });

  it('revoca familia completa cuando el token revocado tiene familia', async () => {
    const token = makeToken({ revocado: true, familia: 'fam-compromised' });
    const deps = buildDeps(token);
    const uc = build(deps);

    await expect(
      uc.execute({ userId: 'u-1', rawRefreshToken: 'tok', ipAddress: null, userAgent: null }),
    ).rejects.toThrow();

    expect(deps.qb.where).toHaveBeenCalledWith('familia = :familia', {
      familia: 'fam-compromised',
    });
  });

  it('lanza cuando el token está expirado', async () => {
    const token = makeToken({ expiraAt: new Date(Date.now() - 1000) });
    const deps = buildDeps(token);
    const uc = build(deps);

    await expect(
      uc.execute({ userId: 'u-1', rawRefreshToken: 'tok', ipAddress: null, userAgent: null }),
    ).rejects.toThrow();
  });

  it('retorna nuevos tokens cuando el refresh es válido', async () => {
    const token = makeToken();
    const deps = buildDeps(token);
    const uc = build(deps);

    const result = await uc.execute({
      userId: 'u-1',
      rawRefreshToken: 'valid-token',
      ipAddress: null,
      userAgent: null,
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.expiresIn).toBe(900);
  });

  it('revoca el token antiguo durante la rotación', async () => {
    const token = makeToken();
    const deps = buildDeps(token);
    const uc = build(deps);

    await uc.execute({ userId: 'u-1', rawRefreshToken: 'valid', ipAddress: null, userAgent: null });

    expect(deps.tokenRepo.update).toHaveBeenCalledWith(
      'tok-1',
      expect.objectContaining({ revocado: true }),
    );
  });

  it('hereda la familia del token rotado', async () => {
    const token = makeToken({ familia: 'fam-original' });
    const deps = buildDeps(token);
    const uc = build(deps);

    await uc.execute({ userId: 'u-1', rawRefreshToken: 'valid', ipAddress: null, userAgent: null });

    const saved = deps.tokenRepo.create.mock.calls[0][0] as { familia: string };
    expect(saved.familia).toBe('fam-original');
  });
});
