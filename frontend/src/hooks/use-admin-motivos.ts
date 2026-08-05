import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import {
  getMotivosAdmin,
  crearMotivo,
  actualizarMotivo,
  toggleActivoMotivo,
} from '@/services/admin.service';
import type { CrearMotivoBody, ActualizarMotivoBody } from '@/types/admin';

export const MOTIVOS_ADMIN_KEY = ['admin', 'motivos'] as const;

export function useMotivosAdmin() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: MOTIVOS_ADMIN_KEY,
    queryFn: getMotivosAdmin,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: MOTIVOS_ADMIN_KEY });
}

export function useCrearMotivo() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: CrearMotivoBody) => crearMotivo(body),
    onSuccess: invalidate,
  });
}

export function useActualizarMotivo(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: ActualizarMotivoBody) => actualizarMotivo(id, body),
    onSuccess: invalidate,
  });
}

export function useToggleActivoMotivo(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: () => toggleActivoMotivo(id), onSuccess: invalidate });
}
