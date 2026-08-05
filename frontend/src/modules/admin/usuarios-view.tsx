'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { UserPlus, ChevronRight, Search, X } from 'lucide-react';
import { useUsuarios } from '@/hooks/use-admin-usuarios';
import { useRoles } from '@/hooks/use-admin-catalogs';
import { UsuarioRolBadge } from '@/components/admin/usuario-rol-badge';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Pagination } from '@/components/funcionario/pagination';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { FUNC_ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { ListarUsuariosQuery } from '@/types/admin';

const LIMIT = 20;

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

export function UsuariosView() {
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [rolId, setRolId] = useState('');
  const [activoFilter, setActivoFilter] = useState<ActivoFilter>('todos');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: roles } = useRoles();

  const query: ListarUsuariosQuery = {
    page,
    limit: LIMIT,
    sortBy: 'apellido',
    sortOrder: 'ASC',
    ...(debouncedBusqueda && { busqueda: debouncedBusqueda }),
    ...(rolId && { rolId }),
    ...(activoFilter === 'activos' && { activo: true }),
    ...(activoFilter === 'inactivos' && { activo: false }),
  };

  const { data, isLoading, isError, refetch } = useUsuarios(query);
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleBusqueda = useCallback((val: string) => {
    setBusqueda(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedBusqueda(val);
      setPage(1);
    }, 300);
  }, []);

  function handleRol(val: string) {
    setRolId(val);
    setPage(1);
  }

  function handleActivo(val: ActivoFilter) {
    setActivoFilter(val);
    setPage(1);
  }

  function clearFilters() {
    setBusqueda('');
    setDebouncedBusqueda('');
    setRolId('');
    setActivoFilter('todos');
    setPage(1);
  }

  const hasFilters = Boolean(debouncedBusqueda) || Boolean(rolId) || activoFilter !== 'todos';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Usuarios' }]}
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      />

      <PageContainer
        title="Gestión de Usuarios"
        description="Administre los funcionarios y administradores del sistema."
        actions={
          <Link href={FUNC_ROUTES.usuariosNuevo}>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Nuevo usuario
            </Button>
          </Link>
        }
      >
        <div className="space-y-4">
          {/* Filtros */}
          <div
            className="flex flex-wrap items-center gap-3"
            role="search"
            aria-label="Filtros de usuarios"
          >
            {/* Busqueda */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => handleBusqueda(e.target.value)}
                placeholder="Buscar por nombre, apellido o email…"
                aria-label="Buscar usuarios"
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => handleBusqueda('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Filtro rol */}
            <select
              value={rolId}
              onChange={(e) => handleRol(e.target.value)}
              aria-label="Filtrar por rol"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
            >
              <option value="">Todos los roles</option>
              {roles?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>

            {/* Filtro estado */}
            <div
              className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm"
              role="group"
              aria-label="Filtrar por estado"
            >
              {(['todos', 'activos', 'inactivos'] as ActivoFilter[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleActivo(v)}
                  aria-pressed={activoFilter === v}
                  className={`px-3 py-2 capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                    activoFilter === v
                      ? 'bg-primary-600 text-white font-medium'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-neutral-500 hover:text-neutral-800 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Tabla */}
          {isError ? (
            <Alert variant="danger" title="Error al cargar usuarios">
              <button onClick={() => refetch()} className="underline hover:no-underline text-sm">
                Reintentar
              </button>
            </Alert>
          ) : (
            <div
              className="overflow-x-auto rounded-lg border border-neutral-200 bg-white"
              role="region"
              aria-label="Tabla de usuarios"
              aria-busy={isLoading}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {[
                      'Nombre',
                      'Email',
                      'Rol / Estado',
                      'Dependencia',
                      'Último acceso',
                      'Registrado',
                      '',
                    ].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-neutral-100">
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 rounded w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <p className="text-sm font-medium text-neutral-500">Sin usuarios</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {hasFilters
                            ? 'No se encontraron usuarios con los filtros actuales.'
                            : 'No hay usuarios registrados.'}
                        </p>
                        {hasFilters && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 text-sm text-primary-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    items.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-neutral-100 hover:bg-primary-50/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-neutral-800">
                            {u.nombre} {u.apellido}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <UsuarioRolBadge rol={u.rol.nombre} activo={u.activo} />
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500">
                          {u.dependencia?.nombre ?? <span className="text-neutral-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                          {u.ultimoLogin ? formatDate(u.ultimoLogin) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/funcionario/usuarios/${u.id}`}
                            aria-label={`Ver detalle de ${u.nombre} ${u.apellido}`}
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
          )}

          {/* Paginación */}
          {pagination && pagination.total > LIMIT && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          )}
        </div>
      </PageContainer>
    </div>
  );
}
