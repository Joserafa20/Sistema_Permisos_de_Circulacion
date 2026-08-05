import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import {
  getUsuarios,
  getUsuario,
  crearUsuario,
  actualizarUsuario,
  activarDesactivarUsuario,
  eliminarUsuario,
  restaurarUsuario,
} from '@/services/admin.service';
import type { ListarUsuariosQuery } from '@/types/admin';

export const USUARIOS_ADMIN_KEY = ['admin', 'usuarios'] as const;
export const USUARIO_DETALLE_KEY = (id: string) => ['admin', 'usuario', id] as const;

export function useUsuarios(query: ListarUsuariosQuery = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...USUARIOS_ADMIN_KEY, query],
    queryFn: () => getUsuarios(query),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useUsuarioDetalle(id: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: USUARIO_DETALLE_KEY(id),
    queryFn: () => getUsuario(id),
    enabled: isAuthenticated && Boolean(id),
    staleTime: 60 * 1000,
  });
}

function useInvalidate(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: USUARIOS_ADMIN_KEY });
    if (id) queryClient.invalidateQueries({ queryKey: USUARIO_DETALLE_KEY(id) });
  };
}

export function useCrearUsuario() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: crearUsuario,
    onSuccess: invalidate,
  });
}

export function useActualizarUsuario(id: string) {
  const invalidate = useInvalidate(id);
  return useMutation({
    mutationFn: (body: Parameters<typeof actualizarUsuario>[1]) => actualizarUsuario(id, body),
    onSuccess: invalidate,
  });
}

export function useActivarUsuario(id: string) {
  const invalidate = useInvalidate(id);
  return useMutation({
    mutationFn: (activo: boolean) => activarDesactivarUsuario(id, activo),
    onSuccess: invalidate,
  });
}

export function useEliminarUsuario(id: string) {
  const invalidate = useInvalidate(id);
  return useMutation({
    mutationFn: () => eliminarUsuario(id),
    onSuccess: invalidate,
  });
}

export function useRestaurarUsuario(id: string) {
  const invalidate = useInvalidate(id);
  return useMutation({
    mutationFn: () => restaurarUsuario(id),
    onSuccess: invalidate,
  });
}
