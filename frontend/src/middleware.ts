import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

/**
 * Middleware de protección del portal funcionario.
 *
 * Flujo:
 * 1. Rutas bajo /funcionario/* (excepto /funcionario/login): si no hay cookie de sesión
 *    → redirigir a login con `?next=<pathname>`.
 * 2. /funcionario/login con cookie presente → redirigir al dashboard.
 *
 * La cookie `_f_session` es una bandera de presencia (no contiene tokens ni datos sensibles).
 * El token real (refresh) vive en sessionStorage/localStorage y lo valida el AuthProvider.
 * Esta protección evita el flash de contenido protegido antes de que el AuthProvider hidrate.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME);

  const isLoginPage = pathname === '/funcionario/login';
  const isFuncionarioRoute = pathname.startsWith('/funcionario');

  if (!isLoginPage && isFuncionarioRoute) {
    if (!session?.value) {
      const loginUrl = new URL('/funcionario/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLoginPage && session?.value) {
    return NextResponse.redirect(new URL('/funcionario', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/funcionario/:path*'],
};
