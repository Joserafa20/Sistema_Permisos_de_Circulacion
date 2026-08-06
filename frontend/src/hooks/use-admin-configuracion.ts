import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import {
  getConfiguracionAdmin,
  actualizarConfiguracion,
  subirImagenInstitucional,
  getImagenInstitucionalUrl,
} from '@/services/admin.service';
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

export function useSubirImagen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tipo, file }: { tipo: 'logo' | 'escudo'; file: File }) =>
      subirImagenInstitucional(tipo, file),
    onSuccess: (_data, { tipo }) => {
      queryClient.invalidateQueries({ queryKey: CONFIGURACION_ADMIN_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin', 'imagen-url', tipo] });
    },
  });
}

export function useImagenUrl(tipo: 'logo' | 'escudo', enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'imagen-url', tipo],
    queryFn: () => getImagenInstitucionalUrl(tipo),
    enabled,
    staleTime: 4 * 60 * 1000, // 4 min — URL firmada dura 5 min
    refetchInterval: 4 * 60 * 1000,
  });
}
