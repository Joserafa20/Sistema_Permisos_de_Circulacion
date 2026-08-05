import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getPermisos } from '@/services/funcionario.service';
import type { ListarPermisosFiltros } from '@/types/funcionario';

export const PERMISOS_KEY = ['funcionario', 'permisos'] as const;

export function usePermisos(filtros: ListarPermisosFiltros = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...PERMISOS_KEY, filtros],
    queryFn: () => getPermisos(filtros),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}
