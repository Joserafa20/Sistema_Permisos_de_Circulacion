import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getSolicitudDetalle } from '@/services/funcionario.service';

export const SOLICITUD_DETALLE_KEY = (id: string) => ['solicitud-detalle', id] as const;

export function useSolicitudDetalle(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: SOLICITUD_DETALLE_KEY(id),
    queryFn: () => getSolicitudDetalle(id),
    enabled: isAuthenticated && Boolean(id),
    staleTime: 60_000,
    retry: 2,
  });
}
