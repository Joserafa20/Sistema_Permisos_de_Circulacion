'use client';

import { Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSolicitudes, useSolicitudesFiltros, SOLICITUDES_KEY } from '@/hooks/use-solicitudes';
import { SolicitudesTable } from '@/components/funcionario/solicitudes-table';
import { SolicitudFilters } from '@/components/funcionario/solicitud-filters';
import { Pagination } from '@/components/funcionario/pagination';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { PageContainer } from '@/components/funcionario/page-container';
import type { SolicitudesFiltros } from '@/types/funcionario';

function SolicitudesContent() {
  const { filtros, setFiltros, resetFiltros } = useSolicitudesFiltros();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useSolicitudes(filtros);

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  function handleSortChange(sortBy: string, sortOrder: 'ASC' | 'DESC') {
    setFiltros({ sortBy, sortOrder });
  }

  function handlePageChange(page: number) {
    setFiltros({ page });
  }

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: SOLICITUDES_KEY });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Solicitudes' }]}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
      />

      <PageContainer
        title="Cola de Solicitudes"
        description="Gestión y revisión de solicitudes de permisos de circulación"
      >
        <SolicitudFilters
          filtros={filtros}
          onFiltrosChange={(update: Partial<SolicitudesFiltros>) => setFiltros(update)}
          onReset={resetFiltros}
          isLoading={isLoading}
        />

        <SolicitudesTable
          items={items}
          isLoading={isLoading}
          isError={isError}
          filtros={filtros}
          onSortChange={handleSortChange}
          onReset={resetFiltros}
          onRetry={() => refetch()}
        />

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </PageContainer>
    </div>
  );
}

export function SolicitudesView() {
  return (
    <Suspense>
      <SolicitudesContent />
    </Suspense>
  );
}
