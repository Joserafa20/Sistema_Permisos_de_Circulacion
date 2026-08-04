'use client';

import { useAuth } from '@/contexts/auth-context';

interface PermissionGateProps {
  role: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza `children` solo si el usuario autenticado tiene el rol requerido.
 * Útil para ocultar secciones de UI sin redirigir.
 */
export function PermissionGate({ role, children, fallback = null }: PermissionGateProps) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated || !hasRole(role)) return <>{fallback}</>;
  return <>{children}</>;
}
