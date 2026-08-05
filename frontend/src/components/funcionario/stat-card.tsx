import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  color?: 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'neutral';
  loading?: boolean;
  href?: string;
}

const COLOR_MAP = {
  blue: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    icon: 'text-primary-600 bg-primary-100',
    value: 'text-primary-700',
    label: 'text-primary-600',
  },
  amber: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    icon: 'text-warning-600 bg-warning-100',
    value: 'text-warning-700',
    label: 'text-warning-600',
  },
  green: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    icon: 'text-success-600 bg-success-100',
    value: 'text-success-700',
    label: 'text-success-600',
  },
  red: {
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    icon: 'text-danger-600 bg-danger-100',
    value: 'text-danger-700',
    label: 'text-danger-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600 bg-purple-100',
    value: 'text-purple-700',
    label: 'text-purple-600',
  },
  neutral: {
    bg: 'bg-neutral-50',
    border: 'border-neutral-200',
    icon: 'text-neutral-600 bg-neutral-100',
    value: 'text-neutral-700',
    label: 'text-neutral-600',
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'blue',
  loading = false,
}: StatCardProps) {
  const c = COLOR_MAP[color];

  if (loading) {
    return (
      <div className={cn('rounded-xl border p-5', c.bg, c.border)}>
        <Skeleton className="h-10 w-10 rounded-lg mb-3" />
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-5 flex flex-col gap-2 transition-shadow hover:shadow-md',
        c.bg,
        c.border,
      )}
      role="region"
      aria-label={label}
    >
      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', c.icon)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className={cn('text-3xl font-bold tabular-nums', c.value)}>
        {value?.toLocaleString('es-CO') ?? '—'}
      </p>
      <p className={cn('text-sm font-medium', c.label)}>{label}</p>
    </div>
  );
}
