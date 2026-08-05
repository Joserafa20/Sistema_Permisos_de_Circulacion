import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import {
  getDependenciasAdmin,
  crearDependencia,
  actualizarDependencia,
  toggleActivoDependencia,
} from '@/services/admin.service';
import type { CrearDependenciaBody, ActualizarDependenciaBody } from '@/types/admin';

export const DEPENDENCIAS_ADMIN_KEY = ['admin', 'dependencias'] as const;

export function useDependenciasAdmin() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: DEPENDENCIAS_ADMIN_KEY,
    queryFn: getDependenciasAdmin,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: DEPENDENCIAS_ADMIN_KEY });
}

export function useCrearDependencia() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: CrearDependenciaBody) => crearDependencia(body),
    onSuccess: invalidate,
  });
}

export function useActualizarDependencia(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: ActualizarDependenciaBody) => actualizarDependencia(id, body),
    onSuccess: invalidate,
  });
}

export function useToggleActivoDependencia(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: () => toggleActivoDependencia(id), onSuccess: invalidate });
}
