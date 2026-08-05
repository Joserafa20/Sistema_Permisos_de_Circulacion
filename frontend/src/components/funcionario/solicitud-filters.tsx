'use client';

import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchToolbar } from './search-toolbar';
import { ESTADOS_OPTIONS } from './solicitud-status-badge';
import type { SolicitudesFiltros, EstadoSolicitud } from '@/types/funcionario';
import { cn } from '@/lib/utils';

interface Props {
  filtros: SolicitudesFiltros;
  onFiltrosChange: (update: Partial<SolicitudesFiltros>) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Fecha de solicitud' },
  { value: 'fechaInicio', label: 'Fecha de inicio' },
  { value: 'estado', label: 'Estado' },
] as const;

function hasActiveFilters(f: SolicitudesFiltros): boolean {
  return (
    f.estados.length > 0 ||
    !!f.fechaInicio ||
    !!f.fechaFin ||
    !!f.documento ||
    !!f.placa ||
    !!f.radicado ||
    f.sortBy !== 'createdAt' ||
    f.sortOrder !== 'ASC'
  );
}

export function SolicitudFilters({ filtros, onFiltrosChange, onReset, isLoading }: Props) {
  const toggleEstado = (estado: EstadoSolicitud) => {
    const current = filtros.estados;
    const next = current.includes(estado)
      ? current.filter((e) => e !== estado)
      : [...current, estado];
    onFiltrosChange({ estados: next });
  };

  const active = hasActiveFilters(filtros);

  return (
    <section aria-label="Filtros de solicitudes" className="space-y-3">
      {/* Búsqueda rápida */}
      <div className="flex flex-col sm:flex-row gap-2">
        <SearchToolbar
          value={filtros.radicado}
          onChange={(v) => onFiltrosChange({ radicado: v })}
          placeholder="Buscar por radicado…"
          className="flex-1"
        />
        <SearchToolbar
          value={filtros.documento}
          onChange={(v) => onFiltrosChange({ documento: v })}
          placeholder="Buscar por documento…"
          className="flex-1"
        />
        <SearchToolbar
          value={filtros.placa}
          onChange={(v) => onFiltrosChange({ placa: v })}
          placeholder="Buscar por placa…"
          className="flex-1 sm:max-w-[180px]"
        />
      </div>

      {/* Filtros secundarios */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Filtros:
        </span>

        {/* Estado chips */}
        {ESTADOS_OPTIONS.map(({ value, label }) => {
          const selected = filtros.estados.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              disabled={isLoading}
              onClick={() => toggleEstado(value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                selected
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-400 hover:text-primary-700',
              )}
            >
              {label}
            </button>
          );
        })}

        {/* Fecha desde */}
        <div className="flex items-center gap-1">
          <label htmlFor="filter-fecha-inicio" className="text-xs text-neutral-500 sr-only">
            Desde
          </label>
          <input
            id="filter-fecha-inicio"
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => onFiltrosChange({ fechaInicio: e.target.value })}
            aria-label="Desde"
            className="h-7 rounded border border-neutral-200 text-xs px-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <span className="text-xs text-neutral-400">→</span>
          <label htmlFor="filter-fecha-fin" className="text-xs text-neutral-500 sr-only">
            Hasta
          </label>
          <input
            id="filter-fecha-fin"
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => onFiltrosChange({ fechaFin: e.target.value })}
            aria-label="Hasta"
            className="h-7 rounded border border-neutral-200 text-xs px-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-1 ml-auto">
          <label htmlFor="filter-sort" className="text-xs text-neutral-500">
            Ordenar:
          </label>
          <select
            id="filter-sort"
            value={filtros.sortBy}
            onChange={(e) => onFiltrosChange({ sortBy: e.target.value })}
            className="h-7 rounded border border-neutral-200 text-xs px-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label={`Orden ${filtros.sortOrder === 'ASC' ? 'ascendente' : 'descendente'}`}
            onClick={() =>
              onFiltrosChange({ sortOrder: filtros.sortOrder === 'ASC' ? 'DESC' : 'ASC' })
            }
            className="h-7 w-7 flex items-center justify-center rounded border border-neutral-200 text-xs text-neutral-600 hover:border-primary-400 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            {filtros.sortOrder === 'ASC' ? '↑' : '↓'}
          </button>
        </div>

        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 text-xs text-neutral-500 hover:text-danger-600 px-2"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            Limpiar
          </Button>
        )}
      </div>
    </section>
  );
}
