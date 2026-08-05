'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useAuditoria } from '@/hooks/use-admin-auditoria';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Pagination } from '@/components/funcionario/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';
import type { ListarAuditoriaQuery } from '@/types/admin';

const LIMIT = 20;

export function AuditoriaView() {
  const [page, setPage] = useState(1);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [entidad, setEntidad] = useState('');

  const query: ListarAuditoriaQuery = {
    page,
    limit: LIMIT,
    ...(fechaDesde && { fechaDesde }),
    ...(fechaHasta && { fechaHasta }),
    ...(entidad && { entidad }),
  };

  const { data, isLoading, isError, refetch, isFetching } = useAuditoria(query);
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Auditoría' }]}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <PageContainer
        title="Registro de Auditoría"
        description="Tabla append-only. Retención mínima 5 años (Ley 1712/2014)."
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPage(1);
              }}
              className="border border-neutral-200 rounded-md px-3 py-1.5 text-sm"
              aria-label="Fecha desde"
            />
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPage(1);
              }}
              className="border border-neutral-200 rounded-md px-3 py-1.5 text-sm"
              aria-label="Fecha hasta"
            />
            <input
              type="text"
              placeholder="Entidad…"
              value={entidad}
              onChange={(e) => {
                setEntidad(e.target.value);
                setPage(1);
              }}
              className="border border-neutral-200 rounded-md px-3 py-1.5 text-sm w-36"
              aria-label="Filtrar por entidad"
            />
          </div>
        }
      >
        {isError && <Alert variant="danger">No se pudo cargar el registro de auditoría.</Alert>}

        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Acción</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Entidad</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Usuario</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">IP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">
                          {item.accion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        {item.entidad}
                        {item.entidadId && (
                          <span className="block text-xs text-neutral-400 font-mono truncate max-w-[120px]">
                            {item.entidadId}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        {item.usuario ? (
                          `${item.usuario.nombre} ${item.usuario.apellido}`
                        ) : (
                          <span className="text-neutral-400">Sistema</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 font-mono text-xs">
                        {item.ipAddress ?? '—'}
                      </td>
                    </tr>
                  ))}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Sin registros de auditoría para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={query.limit ?? LIMIT}
              onPageChange={setPage}
            />
          </div>
        )}
      </PageContainer>
    </div>
  );
}
