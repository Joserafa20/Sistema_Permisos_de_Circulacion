'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useReporteSolicitudes, useReportePermisos } from '@/hooks/use-admin-reportes';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';

const ESTADO_LABELS: Record<string, string> = {
  recibida: 'Recibida',
  en_revision: 'En revisión',
  pendiente_correccion: 'Pendiente corrección',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  vencida: 'Vencida',
  vigente: 'Vigente',
  revocado: 'Revocado',
};

function EstadoBar({ estado, count, total }: { estado: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-sm text-neutral-600 shrink-0">
        {ESTADO_LABELS[estado] ?? estado}
      </span>
      <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-neutral-700 font-medium w-10 text-right">{count}</span>
      <span className="text-xs text-neutral-400 w-10 text-right">{pct}%</span>
    </div>
  );
}

export function ReportesView() {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [applied, setApplied] = useState<{ desde?: string; hasta?: string }>({});

  const {
    data: rSolicitudes,
    isLoading: loadingSol,
    isError: errorSol,
    refetch: refetchSol,
    isFetching: fetchingSol,
  } = useReporteSolicitudes(applied.desde, applied.hasta);

  const {
    data: rPermisos,
    isLoading: loadingPerm,
    isError: errorPerm,
    refetch: refetchPerm,
    isFetching: fetchingPerm,
  } = useReportePermisos(applied.desde, applied.hasta);

  function applyFilter() {
    setApplied({ desde: fechaDesde || undefined, hasta: fechaHasta || undefined });
  }

  function clearFilter() {
    setFechaDesde('');
    setFechaHasta('');
    setApplied({});
  }

  const isRefreshing = fetchingSol || fetchingPerm;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Reportes' }]}
        onRefresh={() => {
          refetchSol();
          refetchPerm();
        }}
        isRefreshing={isRefreshing}
      />

      <PageContainer
        title="Reportes del Sistema"
        description="Resumen agregado de solicitudes y permisos por estado."
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-neutral-200 rounded-md px-3 py-1.5 text-sm"
              aria-label="Fecha desde"
            />
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-neutral-200 rounded-md px-3 py-1.5 text-sm"
              aria-label="Fecha hasta"
            />
            <Button size="sm" onClick={applyFilter}>
              Aplicar
            </Button>
            {(applied.desde || applied.hasta) && (
              <Button size="sm" variant="outline" onClick={clearFilter}>
                Limpiar
              </Button>
            )}
          </div>
        }
      >
        {(errorSol || errorPerm) && <Alert variant="danger">No se pudo cargar el reporte.</Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solicitudes */}
          <div className="border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary-600" />
                Solicitudes
              </h3>
              {rSolicitudes && (
                <span className="text-lg font-bold text-neutral-900">
                  {rSolicitudes.total} total
                </span>
              )}
            </div>
            {loadingSol ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : rSolicitudes ? (
              <div className="space-y-3">
                {Object.entries(rSolicitudes.byEstado).map(([estado, count]) => (
                  <EstadoBar
                    key={estado}
                    estado={estado}
                    count={count}
                    total={rSolicitudes.total}
                  />
                ))}
                {Object.keys(rSolicitudes.byEstado).length === 0 && (
                  <p className="text-sm text-neutral-400">
                    Sin datos para el período seleccionado.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {/* Permisos */}
          <div className="border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary-600" />
                Permisos
              </h3>
              {rPermisos && (
                <span className="text-lg font-bold text-neutral-900">{rPermisos.total} total</span>
              )}
            </div>
            {loadingPerm ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : rPermisos ? (
              <div className="space-y-3">
                {Object.entries(rPermisos.byEstado).map(([estado, count]) => (
                  <EstadoBar key={estado} estado={estado} count={count} total={rPermisos.total} />
                ))}
                {Object.keys(rPermisos.byEstado).length === 0 && (
                  <p className="text-sm text-neutral-400">
                    Sin datos para el período seleccionado.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
