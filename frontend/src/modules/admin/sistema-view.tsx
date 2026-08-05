'use client';

import { Activity, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useHealth } from '@/hooks/use-health';
import { HealthIndicator } from '@/components/admin/health-indicator';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const SERVICES = ['database', 'redis', 'minio', 'smtp'] as const;

export function SistemaView() {
  const { data: health, isLoading, isFetching, refetch, dataUpdatedAt } = useHealth();

  const allUp = health?.status === 'ok';
  const anyDown = health?.status === 'error';

  function getServiceStatus(name: string) {
    if (!health) return undefined;
    const info = health.info?.[name] ?? health.error?.[name] ?? health.details?.[name];
    return info?.status;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Sistema' }]}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <PageContainer
        title="Estado del Sistema"
        description={
          dataUpdatedAt
            ? `Última verificación: ${new Date(dataUpdatedAt).toLocaleTimeString('es-CO')}`
            : 'Verificando servicios…'
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-busy={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Actualizar
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Estado general */}
          {!isLoading && health && (
            <Alert
              variant={allUp ? 'success' : 'danger'}
              title={
                allUp ? 'Todos los servicios operativos' : 'Uno o más servicios no disponibles'
              }
              icon={false}
            >
              <div className="flex items-center gap-2">
                {allUp ? (
                  <CheckCircle2 className="h-4 w-4 text-success-600 shrink-0" aria-hidden="true" />
                ) : (
                  <XCircle className="h-4 w-4 text-danger-600 shrink-0" aria-hidden="true" />
                )}
                <span className="text-sm">
                  {allUp
                    ? 'El sistema funciona correctamente.'
                    : 'Verifique los servicios marcados como no disponibles.'}
                </span>
              </div>
            </Alert>
          )}

          {/* Indicadores por servicio */}
          <section aria-label="Estado de servicios">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              Servicios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map((name) => (
                <HealthIndicator
                  key={name}
                  name={name}
                  status={getServiceStatus(name)}
                  loading={isLoading}
                />
              ))}
            </div>
          </section>

          {/* Info técnica */}
          {health && (
            <section
              aria-label="Información técnica"
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-5"
            >
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Detalle técnico
              </h2>
              <pre className="text-xs text-neutral-600 overflow-x-auto font-mono whitespace-pre-wrap">
                {JSON.stringify(health, null, 2)}
              </pre>
            </section>
          )}

          {!isLoading && anyDown && (
            <Alert variant="warning" title="Acciones recomendadas">
              Contacte al equipo de infraestructura si algún servicio permanece inaccesible por más
              de 5 minutos.
            </Alert>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
