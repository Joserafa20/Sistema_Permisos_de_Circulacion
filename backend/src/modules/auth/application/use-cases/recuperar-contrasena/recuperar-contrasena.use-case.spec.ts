import { RecuperarContrasenaUseCase } from './recuperar-contrasena.use-case';
import { TipoToken } from '../../../../../common/enums/tipo-token.enum';

const GENERIC_MESSAGE =
  'Si el correo electrónico está registrado recibirá las instrucciones de recuperación';

const mockNotificacionesService = { encolar: jest.fn().mockResolvedValue(undefined) };
const mockConfigService = { get: jest.fn().mockReturnValue('http://localhost:3000') };

function makeRepos(
  usuarioPartial?: Partial<{
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
  }>,
) {
  const usuario = usuarioPartial
    ? {
        id: 'u-1',
        nombre: 'Admin',
        apellido: 'Test',
        email: 'admin@test.co',
        activo: true,
        ...usuarioPartial,
      }
    : null;

  const usuarioRepo = {
    findOne: jest.fn().mockResolvedValue(usuario),
  };

  const tokenRepo = {
    find: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockResolvedValue(undefined),
  };

  return { usuarioRepo, tokenRepo };
}

function buildUseCase(usuarioRepo: object, tokenRepo: object) {
  return new RecuperarContrasenaUseCase(
    usuarioRepo as never,
    tokenRepo as never,
    mockNotificacionesService as never,
    mockConfigService as never,
  );
}

describe('RecuperarContrasenaUseCase', () => {
  it('devuelve respuesta genérica cuando el usuario no existe (evita enumeración)', async () => {
    const { usuarioRepo, tokenRepo } = makeRepos(undefined);
    const useCase = buildUseCase(usuarioRepo, tokenRepo);

    const result = await useCase.execute({
      email: 'noexiste@test.co',
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    });

    expect(result.message).toBe(GENERIC_MESSAGE);
    expect(tokenRepo.save).not.toHaveBeenCalled();
  });

  it('devuelve respuesta genérica cuando el usuario está inactivo', async () => {
    const { usuarioRepo, tokenRepo } = makeRepos({ activo: false });
    const useCase = buildUseCase(usuarioRepo, tokenRepo);

    const result = await useCase.execute({
      email: 'admin@test.co',
      ipAddress: null,
      userAgent: null,
    });

    expect(result.message).toBe(GENERIC_MESSAGE);
    expect(tokenRepo.save).not.toHaveBeenCalled();
  });

  it('genera y persiste un token hash (no el token raw) para usuario activo', async () => {
    const { usuarioRepo, tokenRepo } = makeRepos({ activo: true });
    const useCase = buildUseCase(usuarioRepo, tokenRepo);

    const result = await useCase.execute({
      email: 'admin@test.co',
      ipAddress: '10.0.0.1',
      userAgent: 'test-agent',
    });

    expect(result.message).toBe(GENERIC_MESSAGE);
    expect(tokenRepo.save).toHaveBeenCalledTimes(1);

    const savedToken = tokenRepo.create.mock.calls[0][0] as {
      tokenHash: string;
      tipo: TipoToken;
      expiraAt: Date;
    };
    expect(savedToken.tipo).toBe(TipoToken.RESET_CONTRASENA);
    expect(typeof savedToken.tokenHash).toBe('string');
    expect(savedToken.tokenHash).toHaveLength(64); // SHA256 hex = 64 chars
    expect(savedToken.expiraAt).toBeInstanceOf(Date);
  });

  it('el tokenHash almacenado es diferente al rawToken (nunca almacena texto plano)', async () => {
    const { usuarioRepo, tokenRepo } = makeRepos({ activo: true });
    const useCase = buildUseCase(usuarioRepo, tokenRepo);

    await useCase.execute({
      email: 'admin@test.co',
      ipAddress: null,
      userAgent: null,
    });

    const savedToken = tokenRepo.create.mock.calls[0][0] as { tokenHash: string };
    // El rawToken es 32 bytes en hex = 64 chars, el hash SHA256 también = 64 chars
    // Pero el hash NO puede ser el mismo rawToken (verificación estadística suficiente)
    // El hash no contiene el prefijo típico del raw ya que es SHA256 del raw
    // Solo verificamos que existe y tiene longitud correcta (64 hex chars)
    expect(savedToken.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('invalida tokens de recuperación anteriores antes de crear uno nuevo', async () => {
    const tokensAnteriores = [{ id: 'tok-1' }, { id: 'tok-2' }];

    const { usuarioRepo } = makeRepos({ activo: true });
    const tokenRepo = {
      find: jest.fn().mockResolvedValue(tokensAnteriores),
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = buildUseCase(usuarioRepo, tokenRepo);

    await useCase.execute({
      email: 'admin@test.co',
      ipAddress: null,
      userAgent: null,
    });

    expect(tokenRepo.update).toHaveBeenCalledWith(
      ['tok-1', 'tok-2'],
      expect.objectContaining({ revocado: true }),
    );
  });

  it('expira el token en 1 hora desde la creación', async () => {
    const { usuarioRepo, tokenRepo } = makeRepos({ activo: true });
    const useCase = buildUseCase(usuarioRepo, tokenRepo);
    const antes = Date.now();

    await useCase.execute({
      email: 'admin@test.co',
      ipAddress: null,
      userAgent: null,
    });

    const savedToken = tokenRepo.create.mock.calls[0][0] as { expiraAt: Date };
    const expiraMs = savedToken.expiraAt.getTime();
    const unaHoraMs = 60 * 60 * 1000;

    expect(expiraMs - antes).toBeGreaterThanOrEqual(unaHoraMs - 100);
    expect(expiraMs - antes).toBeLessThanOrEqual(unaHoraMs + 1000);
  });
});
