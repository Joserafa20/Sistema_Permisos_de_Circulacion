import { cn } from '@/lib/utils';
import type { HealthServiceStatus } from '@/types/admin';

interface Props {
  name: string;
  status: HealthServiceStatus | undefined;
  loading?: boolean;
}

const STATUS_CONFIG: Record<HealthServiceStatus, { dot: string; label: string; bg: string }> = {
  up: {
    dot: 'bg-success-500',
    label: 'Operativo',
    bg: 'bg-success-50 border-success-200',
  },
  down: {
    dot: 'bg-danger-500 animate-pulse',
    label: 'No disponible',
    bg: 'bg-danger-50 border-danger-200',
  },
};

const SERVICE_LABELS: Record<string, string> = {
  database: 'Base de Datos (PostgreSQL)',
  redis: 'Redis (Caché / Cola)',
  minio: 'MinIO (Almacenamiento)',
  smtp: 'SMTP (Correo)',
};

export function HealthIndicator({ name, status, loading = false }: Props) {
  const label = SERVICE_LABELS[name] ?? name;

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="h-3 w-3 rounded-full bg-neutral-300 animate-pulse shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-neutral-200 rounded animate-pulse w-40" />
          <div className="h-3 bg-neutral-200 rounded animate-pulse w-24" />
        </div>
      </div>
    );
  }

  const config = status ? STATUS_CONFIG[status] : null;

  return (
    <div
      role="status"
      aria-label={`${label}: ${config?.label ?? 'Desconocido'}`}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4',
        config?.bg ?? 'bg-neutral-50 border-neutral-200',
      )}
    >
      <div
        className={cn('h-3 w-3 rounded-full shrink-0', config?.dot ?? 'bg-neutral-400')}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800 truncate">{label}</p>
        <p
          className={cn(
            'text-xs font-medium',
            status === 'up'
              ? 'text-success-700'
              : status === 'down'
                ? 'text-danger-700'
                : 'text-neutral-500',
          )}
        >
          {config?.label ?? 'Estado desconocido'}
        </p>
      </div>
    </div>
  );
}
