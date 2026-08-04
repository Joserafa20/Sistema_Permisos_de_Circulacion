'use client';

import Link from 'next/link';
import { ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SolicitudStatusBadge } from './solicitud-status-badge';
import { EmptyResults } from './empty-results';
import type { SolicitudListItem, SolicitudesFiltros } from '@/types/funcionario';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

const COLUMNS: Column[] = [
  { key: 'numeroRadicado', label: 'Radicado', sortable: true, className: 'w-44' },
  { key: 'ciudadano', label: 'Ciudadano', sortable: false, className: 'min-w-[160px]' },
  { key: 'motocicleta', label: 'Moto / Placa', sortable: false, className: 'w-32' },
  { key: 'motivo', label: 'Motivo', sortable: false, className: 'min-w-[120px]' },
  { key: 'estado', label: 'Estado', sortable: true, className: 'w-40' },
  { key: 'createdAt', label: 'Recibida', sortable: true, className: 'w-36' },
  { key: 'tiempoEspera', label: 'En cola', sortable: false, className: 'w-24' },
  { key: '_actions', label: '', sortable: false, className: 'w-10' },
];

interface Props {
  items: SolicitudListItem[];
  isLoading: boolean;
  isError: boolean;
  filtros: SolicitudesFiltros;
  onSortChange: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void;
  onReset: () => void;
  onRetry: () => void;
}

function SortIcon({ active, order }: { active: boolean; order: 'ASC' | 'DESC' }) {
  if (!active) return <span className="ml-1 text-neutral-300">↕</span>;
  return order === 'ASC' ? (
    <ArrowUp className="ml-1 h-3 w-3 inline" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3 inline" />
  );
}

function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <tr key={i} className="border-b border-neutral-100">
          {COLUMNS.map((col) => (
            <td key={col.key} className="px-4 py-3">
              <Skeleton
                className={cn(
                  'h-4 rounded',
                  col.key === 'estado' ? 'w-24' : col.key === '_actions' ? 'w-4' : 'w-full',
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SolicitudesTable({
  items,
  isLoading,
  isError,
  filtros,
  onSortChange,
  onReset,
  onRetry,
}: Props) {
  function handleSort(col: Column) {
    if (!col.sortable) return;
    const sameCol = filtros.sortBy === col.key;
    const nextOrder = sameCol && filtros.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onSortChange(col.key, nextOrder);
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-semibold text-danger-700">Error al cargar las solicitudes</p>
        <p className="text-xs text-neutral-400 mt-1">Verifique su conexión e intente nuevamente.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-lg border border-neutral-200 bg-white"
      role="region"
      aria-label="Tabla de solicitudes"
      aria-busy={isLoading}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap select-none',
                  col.sortable && 'cursor-pointer hover:text-neutral-800 hover:bg-neutral-100',
                  col.className,
                )}
                aria-sort={
                  col.sortable && filtros.sortBy === col.key
                    ? filtros.sortOrder === 'ASC'
                      ? 'ascending'
                      : 'descending'
                    : col.sortable
                      ? 'none'
                      : undefined
                }
                onClick={() => handleSort(col)}
              >
                {col.label}
                {col.sortable && (
                  <SortIcon active={filtros.sortBy === col.key} order={filtros.sortOrder} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length}>
                <EmptyResults
                  title="Sin solicitudes"
                  description="No se encontraron solicitudes con los criterios actuales."
                  onReset={onReset}
                />
              </td>
            </tr>
          ) : (
            items.map((s) => (
              <tr
                key={s.id}
                className="border-b border-neutral-100 hover:bg-primary-50/30 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-primary-700 font-medium whitespace-nowrap">
                  {s.numeroRadicado}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-800 truncate max-w-[200px]">
                    {s.ciudadano.nombre}
                  </p>
                  <p className="text-xs text-neutral-400">{s.ciudadano.numeroDocumento}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono font-semibold text-neutral-800">{s.motocicleta.placa}</p>
                  {s.motocicleta.marca && (
                    <p className="text-xs text-neutral-400">
                      {s.motocicleta.marca}
                      {s.motocicleta.modelo ? ` ${s.motocicleta.modelo}` : ''}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600 text-xs truncate max-w-[140px]">
                  {s.motivo}
                </td>
                <td className="px-4 py-3">
                  <SolicitudStatusBadge estado={s.estado} />
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                  {formatDate(s.createdAt)}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                  {s.tiempoEspera}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/funcionario/solicitudes/${s.id}`}
                    aria-label={`Ver detalle de solicitud ${s.numeroRadicado}`}
                    className="flex items-center justify-center h-7 w-7 rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
