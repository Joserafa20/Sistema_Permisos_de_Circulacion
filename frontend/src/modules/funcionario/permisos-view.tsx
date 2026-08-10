'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, Search, X, Trash2, AlertTriangle } from 'lucide-react';
import { usePermisos, useEliminarPermiso } from '@/hooks/use-permisos';
import { useAuth } from '@/contexts/auth-context';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Pagination } from '@/components/funcionario/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { ListarPermisosFiltros, PermisoListItem } from '@/types/funcionario';

const LIMIT = 20;

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'vigente', label: 'Vigente' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'revocado', label: 'Revocado' },
];

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    vigente: 'bg-green-100 text-green-700',
    vencido: 'bg-neutral-100 text-neutral-500',
    revocado: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[estado] ?? 'bg-neutral-100 text-neutral-600'}`}
    >
      {estado}
    </span>
  );
}

function ConfirmDeleteModal({
  permiso,
  onConfirm,
  onCancel,
  loading,
}: {
  permiso: PermisoListItem;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Eliminar permiso permanentemente
            </h2>
            <p className="text-sm text-neutral-500 mt-1">Esta acción no se puede deshacer.</p>
          </div>
        </div>

        <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 text-sm space-y-1">
          <p>
            <span className="text-neutral-500">Código:</span>{' '}
            <span className="font-mono font-medium">{permiso.codigoPermiso}</span>
          </p>
          <p>
            <span className="text-neutral-500">Ciudadano:</span> {permiso.ciudadano.nombre}
          </p>
          <p>
            <span className="text-neutral-500">Placa:</span> {permiso.motocicleta.placa}
          </p>
        </div>

        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Se eliminarán el permiso y la solicitud asociada. No quedará ningún registro en la base de
          datos.
        </p>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando…' : 'Sí, eliminar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PermisosContent() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('administrador');
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [placa, setPlaca] = useState('');
  const [debouncedPlaca, setDebouncedPlaca] = useState('');
  const [estado, setEstado] = useState(() => searchParams.get('estado') ?? '');
  const [toDelete, setToDelete] = useState<PermisoListItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtros: ListarPermisosFiltros = {
    page,
    limit: LIMIT,
    ...(debouncedPlaca && { placa: debouncedPlaca }),
    ...(estado && { estado }),
  };

  const { data, isLoading, isError, refetch, isFetching } = usePermisos(filtros);
  const eliminarMut = useEliminarPermiso();
  const items = data?.items ?? [];

  useEffect(() => {
    if (eliminarMut.isSuccess) {
      setToDelete(null);
      eliminarMut.reset();
    }
  }, [eliminarMut.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlaca = useCallback((val: string) => {
    setPlaca(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedPlaca(val);
      setPage(1);
    }, 400);
  }, []);

  function handleConfirmDelete() {
    if (!toDelete) return;
    eliminarMut.mutate(toDelete.id);
  }

  const colSpan = isAdmin ? 8 : 7;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Permisos' }]}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <PageContainer
        title="Permisos de Circulación"
        description="Listado de permisos generados por la plataforma."
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Buscar por placa…"
                value={placa}
                onChange={(e) => handlePlaca(e.target.value)}
                className="pl-9 pr-8 py-1.5 border border-neutral-200 rounded-md text-sm w-48"
                aria-label="Buscar por placa"
              />
              {placa && (
                <button
                  type="button"
                  onClick={() => {
                    setPlaca('');
                    setDebouncedPlaca('');
                    setPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPage(1);
              }}
              className="border border-neutral-200 rounded-md px-3 py-1.5 text-sm"
              aria-label="Filtrar por estado"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {isError && <Alert variant="danger">No se pudo cargar la lista de permisos.</Alert>}
        {eliminarMut.isError && (
          <Alert variant="danger">No se pudo eliminar el permiso. Intente nuevamente.</Alert>
        )}

        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Código</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Ciudadano</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Placa</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Motivo</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Expedición</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Vencimiento</th>
                {isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: colSpan }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : items.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                        {p.codigoPermiso}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-800">{p.ciudadano.nombre}</span>
                        <span className="block text-xs text-neutral-400">
                          {p.ciudadano.numeroDocumento}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-700">
                        {p.motocicleta.placa}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 max-w-[140px] truncate">
                        {p.motivo}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={p.estado} />
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {formatDate(p.fechaExpedicion)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {formatDate(p.fechaVencimiento)}
                      </td>
                      {isAdmin && (
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            title="Eliminar permiso permanentemente"
                            onClick={() => setToDelete(p)}
                            className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-8 text-center text-neutral-400">
                    <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Sin permisos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </div>
        )}
      </PageContainer>

      {toDelete && (
        <ConfirmDeleteModal
          permiso={toDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setToDelete(null);
            eliminarMut.reset();
          }}
          loading={eliminarMut.isPending}
        />
      )}
    </div>
  );
}

export function PermisosView() {
  return (
    <Suspense>
      <PermisosContent />
    </Suspense>
  );
}
