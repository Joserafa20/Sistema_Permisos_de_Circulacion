import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getConfiguracionAdmin, actualizarConfiguracion } from '@/services/admin.service';
import type { ActualizarConfiguracionBody } from '@/types/admin';

export const CONFIGURACION_ADMIN_KEY = ['admin', 'configuracion'] as const;

export function useConfiguracionAdmin() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: CONFIGURACION_ADMIN_KEY,
    queryFn: getConfiguracionAdmin,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useActualizarConfiguracion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ActualizarConfiguracionBody) => actualizarConfiguracion(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIGURACION_ADMIN_KEY });
    },
  });
}
