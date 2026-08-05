'use client';

import { useQuery } from '@tanstack/react-query';
import { verificarPermiso } from '@/services/public.service';

interface UseVerificarPermisoParams {
  codigo: string;
  enabled: boolean;
}

export function useVerificarPermiso({ codigo, enabled }: UseVerificarPermisoParams) {
  return useQuery({
    queryKey: ['verificar-permiso', codigo],
    queryFn: () => verificarPermiso(codigo),
    enabled: enabled && codigo.length > 0,
    retry: false,
    staleTime: 0,
  });
}
