'use client';

import { useQuery } from '@tanstack/react-query';
import { getEstadoSolicitud } from '@/services/public.service';

interface UseEstadoSolicitudParams {
  radicado: string;
  documento: string;
  enabled: boolean;
}

export function useEstadoSolicitud({ radicado, documento, enabled }: UseEstadoSolicitudParams) {
  return useQuery({
    queryKey: ['solicitud-estado', radicado, documento],
    queryFn: () => getEstadoSolicitud(radicado, documento),
    enabled: enabled && radicado.length > 0 && documento.length > 0,
    retry: false,
    staleTime: 0,
  });
}
