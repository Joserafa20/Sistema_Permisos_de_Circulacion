'use client';

import {
  FileText,
  Wrench,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDashboardStats,
  useActividadReciente,
  DASHBOARD_STATS_KEY,
  ACTIVIDAD_KEY,
} from '@/hooks/use-dashboard';
import { useAuth } from '@/contexts/auth-context';
import { PageContainer } from '@/components/funcionario/page-container';
import { StatCard } from '@/components/funcionario/stat-card';
import { DashboardCard } from '@/components/funcionario/dashboard-card';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { FUNC_ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

const ESTADO_BADGE: Record<
  string,
  { label: string; variant: 'neutral' | 'warning' | 'success' | 'danger' | 'info' }
> = {
  recibida: { label: 'Recibida', variant: 'info' },
  en_revision: { label: 'En revisión', variant: 'warning' },
  aprobada: { label: 'Aprobada', variant: 'success' },
  rechazada: { label: 'Rechazada', variant: 'danger' },
  pendiente_correccion: { label: 'Corrección', variant: 'warning' },
  vencida: { label: 'Vencida', variant: 'neutral' },
};

export function DashboardView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: actividad, isLoading: actLoading } = useActividadReciente();

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_KEY });
    queryClient.invalidateQueries({ queryKey: ACTIVIDAD_KEY });
  }

  const greeting = getGreeting();
  const firstName = user?.nombres?.split(' ')[0] ?? 'Funcionario';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Dashboard' }]}
        onRefresh={handleRefresh}
        isRefreshing={statsLoading}
      />

      <PageContainer
        title={`${greeting}, ${firstName}`}
        description="Resumen del día — Panel de gestión de permisos de circulación"
      >
        {/* KPIs */}
        {statsError && (
          <Alert variant="danger" title="No se pudieron cargar las estadísticas" aria-live="polite">
            Verifique su conexión e intente nuevamente.
          </Alert>
        )}

        <section aria-label="Estadísticas de solicitudes">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Solicitudes
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Pendientes de revisión"
              value={stats?.solicitudesPendientes}
              icon={FileText}
              color="blue"
              loading={statsLoading}
            />
            <StatCard
              label="En corrección"
              value={stats?.solicitudesEnCorreccion}
              icon={Wrench}
              color="amber"
              loading={statsLoading}
            />
            <StatCard
              label="Aprobadas hoy"
              value={stats?.aprobadasHoy}
              icon={CheckCircle2}
              color="green"
              loading={statsLoading}
            />
            <StatCard
              label="Rechazadas hoy"
              value={stats?.rechazadasHoy}
              icon={XCircle}
              color="red"
              loading={statsLoading}
            />
          </div>
        </section>

        <section aria-label="Estadísticas de permisos">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Permisos
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:max-w-sm">
            <StatCard
              label="Permisos activos"
              value={stats?.permisosActivos}
              icon={ShieldCheck}
              color="green"
              loading={statsLoading}
            />
            <StatCard
              label="Permisos vencidos"
              value={stats?.permisosVencidos}
              icon={ShieldAlert}
              color="neutral"
              loading={statsLoading}
            />
          </div>
        </section>

        {/* Grid: actividad reciente + accesos rápidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad reciente */}
          <DashboardCard title="Actividad reciente" icon={Clock} className="lg:col-span-2">
            {actLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            )}

            {!actLoading && (!actividad || actividad.length === 0) && (
              <p className="text-sm text-neutral-400 text-center py-6">
                No hay solicitudes recientes.
              </p>
            )}

            {!actLoading && actividad && actividad.length > 0 && (
              <ul className="space-y-1 -mx-2">
                {actividad.map((s) => {
                  const badge = ESTADO_BADGE[s.estado] ?? {
                    label: s.estado,
                    variant: 'neutral' as const,
                  };
                  return (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary-500" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">
                          {s.ciudadano.nombre}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {s.numeroRadicado} · {formatDate(s.createdAt)}
                        </p>
                      </div>
                      <Badge variant={badge.variant} className="shrink-0 text-xs">
                        {badge.label}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}

            {!actLoading && actividad && actividad.length > 0 && (
              <div className="mt-4 pt-3 border-t border-neutral-100">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-primary-600 text-xs w-full"
                >
                  <Link href={FUNC_ROUTES.solicitudes}>
                    Ver todas las solicitudes
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )}
          </DashboardCard>

          {/* Accesos rápidos */}
          <DashboardCard title="Accesos rápidos" icon={ArrowRight}>
            <div className="flex flex-col gap-2">
              <QuickLink
                href={FUNC_ROUTES.solicitudes}
                label="Cola de solicitudes"
                description="Gestionar solicitudes pendientes"
              />
              <QuickLink
                href={FUNC_ROUTES.permisos}
                label="Permisos emitidos"
                description="Consultar y administrar permisos"
              />
            </div>
          </DashboardCard>
        </div>
      </PageContainer>
    </div>
  );
}

function QuickLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3 hover:border-primary-200 hover:bg-primary-50 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
    >
      <div>
        <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-700">{label}</p>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
      <ArrowRight
        className="h-4 w-4 text-neutral-300 group-hover:text-primary-500 transition-colors"
        aria-hidden="true"
      />
    </Link>
  );
}

function getGreeting(): string {
  const h = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'America/Bogota',
  });
  const hour = parseInt(h, 10);
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
