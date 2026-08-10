import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getPermisos, eliminarPermiso } from '@/services/funcionario.service';
import type { ListarPermisosFiltros } from '@/types/funcionario';
import { DASHBOARD_STATS_KEY } from './use-dashboard';

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

export function useEliminarPermiso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarPermiso(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISOS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_KEY });
    },
  });
}
