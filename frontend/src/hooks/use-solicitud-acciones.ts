import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import {
  aprobarSolicitud,
  rechazarSolicitud,
  solicitarCorreccion,
  getPermisoPdfUrl,
} from '@/services/funcionario.service';
import { SOLICITUDES_KEY } from './use-solicitudes';
import { SOLICITUD_DETALLE_KEY } from './use-solicitud-detalle';
import { DASHBOARD_STATS_KEY, ACTIVIDAD_KEY } from './use-dashboard';

function useInvalidateAllAfterAccion(solicitudId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: SOLICITUDES_KEY });
    queryClient.invalidateQueries({ queryKey: SOLICITUD_DETALLE_KEY(solicitudId) });
    queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_KEY });
    queryClient.invalidateQueries({ queryKey: ACTIVIDAD_KEY });
  };
}

export function useAprobarSolicitud(solicitudId: string) {
  const invalidate = useInvalidateAllAfterAccion(solicitudId);
  return useMutation({
    mutationFn: () => aprobarSolicitud(solicitudId),
    onSuccess: invalidate,
  });
}

export function useRechazarSolicitud(solicitudId: string) {
  const invalidate = useInvalidateAllAfterAccion(solicitudId);
  return useMutation({
    mutationFn: (body: { motivo: string }) => rechazarSolicitud(solicitudId, body),
    onSuccess: invalidate,
  });
}

export function useSolicitarCorreccion(solicitudId: string) {
  const invalidate = useInvalidateAllAfterAccion(solicitudId);
  return useMutation({
    mutationFn: (body: {
      motivo: string;
      camposCorreccion: Array<{ campo: string; descripcion: string }>;
    }) => solicitarCorreccion(solicitudId, body),
    onSuccess: invalidate,
  });
}

export const PERMISO_PDF_KEY = (permisoId: string) => ['permiso-pdf', permisoId] as const;

export function usePermisoPdf(permisoId: string | undefined, enabled: boolean = false) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: PERMISO_PDF_KEY(permisoId ?? ''),
    queryFn: () => getPermisoPdfUrl(permisoId!),
    enabled: isAuthenticated && enabled && Boolean(permisoId),
    staleTime: 4 * 60 * 1000, // URL firmada TTL = 5 min
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
