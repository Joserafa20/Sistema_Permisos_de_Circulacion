import { LoginUseCase } from './login.use-case';

function makeUsuario(
  overrides?: Partial<{
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
    contrasenaExpiraAt: string | null;
    rol: { id: string; nombre: string };
    dependencia: { id: string } | null;
    intentosFallidos: number;
  }>,
) {
  return {
    id: 'u-1',
    nombre: 'Admin',
    apellido: 'Test',
    email: 'admin@test.co',
    activo: true,
    contrasenaExpiraAt: null,
    intentosFallidos: 0,
    rol: { id: 'rol-1', nombre: 'administrador' },
    dependencia: null,
    ...overrides,
  };
}

function buildDeps(usuario: ReturnType<typeof makeUsuario> | null) {
  const usuarioRepo = {
    findOne: jest.fn().mockResolvedValue(usuario),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const tokenRepo = {
    create: jest.fn().mockImplementation((d) => d),
    save: jest.fn().mockResolvedValue(undefined),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('jwt-token-mocked'),
  };
  const configService = {
    get: jest.fn().mockReturnValue('refresh-secret'),
  };
  const auditoriaService = {
    registrar: jest.fn().mockResolvedValue(undefined),
  };
  return { usuarioRepo, tokenRepo, jwtService, configService, auditoriaService };
}

describe('LoginUseCase', () => {
  function buildUseCase(deps: ReturnType<typeof buildDeps>) {
    return new LoginUseCase(
      deps.jwtService as never,
      deps.configService as never,
      deps.auditoriaService as never,
      deps.usuarioRepo as never,
      deps.tokenRepo as never,
    );
  }

  it('lanza Error cuando el usuario no existe en la base de datos', async () => {
    const deps = buildDeps(null);
    const useCase = buildUseCase(deps);

    await expect(
      useCase.execute({ userId: 'u-inexistente', ipAddress: null, userAgent: null }),
    ).rejects.toThrow('Usuario no encontrado tras validación');
  });

  it('retorna accessToken, refreshToken y datos del usuario en login exitoso', async () => {
    const usuario = makeUsuario();
    const deps = buildDeps(usuario);
    const useCase = buildUseCase(deps);

    const result = await useCase.execute({
      userId: 'u-1',
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.usuario.id).toBe('u-1');
    expect(result.usuario.rol).toBe('administrador');
  });

  it('resetea intentosFallidos a 0 tras login exitoso', async () => {
    const usuario = makeUsuario({ intentosFallidos: 3 });
    const deps = buildDeps(usuario);
    const useCase = buildUseCase(deps);

    await useCase.execute({ userId: 'u-1', ipAddress: null, userAgent: null });

    expect(deps.usuarioRepo.update).toHaveBeenCalledWith(
      'u-1',
      expect.objectContaining({ intentosFallidos: 0 }),
    );
  });

  it('persiste el hash del refreshToken, no el token en texto plano', async () => {
    const usuario = makeUsuario();
    const deps = buildDeps(usuario);
    const useCase = buildUseCase(deps);

    await useCase.execute({ userId: 'u-1', ipAddress: null, userAgent: null });

    const createdToken = deps.tokenRepo.create.mock.calls[0][0] as { tokenHash: string };
    // SHA256 hex = 64 chars
    expect(createdToken.tokenHash).toHaveLength(64);
    expect(createdToken.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('informa contrasenaExpirada:true cuando la fecha de expiración ya pasó', async () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    const usuario = makeUsuario({ contrasenaExpiraAt: yesterday });
    const deps = buildDeps(usuario);
    const useCase = buildUseCase(deps);

    const result = await useCase.execute({ userId: 'u-1', ipAddress: null, userAgent: null });

    expect(result.usuario.contrasenaExpirada).toBe(true);
  });

  it('informa contrasenaExpirada:false cuando la contraseña no ha vencido', async () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    const usuario = makeUsuario({ contrasenaExpiraAt: tomorrow });
    const deps = buildDeps(usuario);
    const useCase = buildUseCase(deps);

    const result = await useCase.execute({ userId: 'u-1', ipAddress: null, userAgent: null });

    expect(result.usuario.contrasenaExpirada).toBe(false);
  });

  it('registra auditoría con acción LOGIN', async () => {
    const usuario = makeUsuario();
    const deps = buildDeps(usuario);
    const useCase = buildUseCase(deps);

    await useCase.execute({ userId: 'u-1', ipAddress: '10.0.0.1', userAgent: 'ua-test' });
    await Promise.resolve();

    expect(deps.auditoriaService.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        entidad: 'usuarios',
        entidadId: 'u-1',
        ipAddress: '10.0.0.1',
      }),
    );
  });

  it('retorna expiresIn:900 (15 minutos para el access token)', async () => {
    const usuario = makeUsuario();
    const deps = buildDeps(usuario);
    const useCase = buildUseCase(deps);

    const result = await useCase.execute({ userId: 'u-1', ipAddress: null, userAgent: null });

    expect(result.expiresIn).toBe(900);
  });
});
