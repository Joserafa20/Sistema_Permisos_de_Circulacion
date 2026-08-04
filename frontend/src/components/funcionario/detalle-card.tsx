import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetalleItem {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}

interface Props {
  title: string;
  icon?: LucideIcon;
  items: DetalleItem[];
  className?: string;
  columns?: 1 | 2 | 3;
}

export function DetalleCard({ title, icon: Icon, items, className, columns = 2 }: Props) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }[columns];

  return (
    <section
      className={cn('rounded-xl border border-neutral-200 bg-white', className)}
      aria-label={title}
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
        {Icon && <Icon className="h-4 w-4 text-neutral-500 shrink-0" aria-hidden="true" />}
        <h2 className="text-sm font-semibold text-neutral-700">{title}</h2>
      </div>
      <dl className={cn('grid gap-x-6 gap-y-4 p-5', gridClass)}>
        {items.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              {label}
            </dt>
            <dd className={cn('text-sm text-neutral-800', !value && 'text-neutral-300 italic')}>
              {value ?? '—'}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
