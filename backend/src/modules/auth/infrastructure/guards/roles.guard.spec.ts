import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY, UserRole } from '../../../../common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../../../../common/decorators/public.decorator';

function buildContext(options: {
  isPublic?: boolean;
  requiredRoles?: UserRole[];
  userRol?: string;
}): ExecutionContext {
  const { isPublic = false, requiredRoles, userRol } = options;
  const request = userRol ? { user: { id: 'u1', rol: userRol } } : { user: undefined };

  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getAllAndOverride: (key: string) => {
      if (key === IS_PUBLIC_KEY) return isPublic;
      if (key === ROLES_KEY) return requiredRoles;
      return undefined;
    },
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('permite acceso a rutas públicas sin importar el rol', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return true;
      return undefined;
    });
    const g = new RolesGuard(reflector);
    const ctx = buildContext({ isPublic: true });
    expect(g.canActivate(ctx)).toBe(true);
  });

  it('permite acceso cuando no hay roles requeridos configurados', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return undefined;
      return undefined;
    });
    const g = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: undefined }) }),
    } as unknown as ExecutionContext;
    expect(g.canActivate(ctx)).toBe(true);
  });

  it('permite acceso cuando el usuario tiene el rol requerido', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return [UserRole.ADMINISTRADOR];
      return undefined;
    });
    const g = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'u1', rol: UserRole.ADMINISTRADOR } }),
      }),
    } as unknown as ExecutionContext;
    expect(g.canActivate(ctx)).toBe(true);
  });

  it('lanza ForbiddenException cuando el rol es insuficiente', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return [UserRole.ADMINISTRADOR];
      return undefined;
    });
    const g = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'u1', rol: UserRole.FUNCIONARIO } }),
      }),
    } as unknown as ExecutionContext;
    expect(() => g.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException cuando no hay usuario en el request', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return [UserRole.FUNCIONARIO];
      return undefined;
    });
    const g = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: undefined }) }),
    } as unknown as ExecutionContext;
    expect(() => g.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('permite acceso con lista de roles múltiples si el usuario tiene uno de ellos', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return [UserRole.ADMINISTRADOR, UserRole.FUNCIONARIO];
      return undefined;
    });
    const g = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'u1', rol: UserRole.FUNCIONARIO } }),
      }),
    } as unknown as ExecutionContext;
    expect(g.canActivate(ctx)).toBe(true);
  });
});
