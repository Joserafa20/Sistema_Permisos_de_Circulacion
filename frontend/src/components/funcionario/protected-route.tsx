'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { FUNC_ROUTES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { status, hasRole } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.replace(
        `${FUNC_ROUTES.login}?next=${encodeURIComponent(window.location.pathname)}`,
      );
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4 p-8" aria-live="polite" aria-label="Verificando sesión">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex flex-col items-center gap-3 p-12 text-center" role="alert">
        <p className="text-lg font-semibold text-danger-700">Acceso denegado</p>
        <p className="text-sm text-neutral-500">No tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
}
