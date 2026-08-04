import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getActividadReciente } from '@/services/funcionario.service';
import { useAuth } from '@/contexts/auth-context';

export const DASHBOARD_STATS_KEY = ['funcionario', 'dashboard', 'stats'] as const;
export const ACTIVIDAD_KEY = ['funcionario', 'dashboard', 'actividad'] as const;

export function useDashboardStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: DASHBOARD_STATS_KEY,
    queryFn: getDashboardStats,
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // refresca cada 2 min en background
    retry: 1,
  });
}

export function useActividadReciente() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ACTIVIDAD_KEY,
    queryFn: getActividadReciente,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
