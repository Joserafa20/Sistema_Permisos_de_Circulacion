import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getReporteSolicitudes, getReportePermisos } from '@/services/admin.service';

export const REPORTE_SOLICITUDES_KEY = (fd?: string, fh?: string) =>
  ['admin', 'reportes', 'solicitudes', fd, fh] as const;

export const REPORTE_PERMISOS_KEY = (fd?: string, fh?: string) =>
  ['admin', 'reportes', 'permisos', fd, fh] as const;

export function useReporteSolicitudes(fechaDesde?: string, fechaHasta?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: REPORTE_SOLICITUDES_KEY(fechaDesde, fechaHasta),
    queryFn: () => getReporteSolicitudes(fechaDesde, fechaHasta),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportePermisos(fechaDesde?: string, fechaHasta?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: REPORTE_PERMISOS_KEY(fechaDesde, fechaHasta),
    queryFn: () => getReportePermisos(fechaDesde, fechaHasta),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
