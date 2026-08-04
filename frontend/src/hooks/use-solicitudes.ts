'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getSolicitudes } from '@/services/funcionario.service';
import type { SolicitudesFiltros, EstadoSolicitud } from '@/types/funcionario';

export const SOLICITUDES_KEY = ['solicitudes'] as const;

const DEFAULT_FILTROS: SolicitudesFiltros = {
  estados: [],
  fechaInicio: '',
  fechaFin: '',
  documento: '',
  placa: '',
  radicado: '',
  sortBy: 'createdAt',
  sortOrder: 'ASC',
  page: 1,
  limit: 20,
};

function parseFiltrosFromUrl(params: URLSearchParams): SolicitudesFiltros {
  const estadosRaw = params.get('estados');
  return {
    estados: estadosRaw
      ? (estadosRaw.split(',').filter(Boolean) as EstadoSolicitud[])
      : DEFAULT_FILTROS.estados,
    fechaInicio: params.get('fechaInicio') ?? DEFAULT_FILTROS.fechaInicio,
    fechaFin: params.get('fechaFin') ?? DEFAULT_FILTROS.fechaFin,
    documento: params.get('documento') ?? DEFAULT_FILTROS.documento,
    placa: params.get('placa') ?? DEFAULT_FILTROS.placa,
    radicado: params.get('radicado') ?? DEFAULT_FILTROS.radicado,
    sortBy: params.get('sortBy') ?? DEFAULT_FILTROS.sortBy,
    sortOrder: (params.get('sortOrder') as 'ASC' | 'DESC') ?? DEFAULT_FILTROS.sortOrder,
    page: Number(params.get('page') ?? DEFAULT_FILTROS.page),
    limit: Number(params.get('limit') ?? DEFAULT_FILTROS.limit),
  };
}

function filtrosToUrlParams(filtros: SolicitudesFiltros): URLSearchParams {
  const p = new URLSearchParams();
  if (filtros.estados.length > 0) p.set('estados', filtros.estados.join(','));
  if (filtros.fechaInicio) p.set('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) p.set('fechaFin', filtros.fechaFin);
  if (filtros.documento) p.set('documento', filtros.documento);
  if (filtros.placa) p.set('placa', filtros.placa);
  if (filtros.radicado) p.set('radicado', filtros.radicado);
  if (filtros.sortBy !== DEFAULT_FILTROS.sortBy) p.set('sortBy', filtros.sortBy);
  if (filtros.sortOrder !== DEFAULT_FILTROS.sortOrder) p.set('sortOrder', filtros.sortOrder);
  if (filtros.page !== 1) p.set('page', String(filtros.page));
  if (filtros.limit !== DEFAULT_FILTROS.limit) p.set('limit', String(filtros.limit));
  return p;
}

export function useSolicitudesFiltros() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filtros = parseFiltrosFromUrl(searchParams);

  const setFiltros = useCallback(
    (update: Partial<SolicitudesFiltros>) => {
      const next = { ...filtros, ...update, page: update.page ?? 1 };
      const params = filtrosToUrlParams(next);
      router.push(`${pathname}?${params.toString()}`);
    },
    [filtros, pathname, router],
  );

  const resetFiltros = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return { filtros, setFiltros, resetFiltros };
}

export function useSolicitudes(filtros: SolicitudesFiltros) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [...SOLICITUDES_KEY, filtros],
    queryFn: () => getSolicitudes(filtros),
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
