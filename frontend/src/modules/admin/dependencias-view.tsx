'use client';

import { useState } from 'react';
import { Building2, Plus, Pencil, Power } from 'lucide-react';
import {
  useDependenciasAdmin,
  useCrearDependencia,
  useActualizarDependencia,
  useToggleActivoDependencia,
} from '@/hooks/use-admin-dependencias';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import type { DependenciaAdmin } from '@/types/admin';

interface DependenciaForm {
  nombre: string;
  codigo: string;
  descripcion: string;
}

const DEFAULT_FORM: DependenciaForm = { nombre: '', codigo: '', descripcion: '' };

export function DependenciasView() {
  const { data: dependencias, isLoading, isError, refetch, isFetching } = useDependenciasAdmin();
  const crearMutation = useCrearDependencia();
  const [editId, setEditId] = useState<string | null>(null);
  const [isCrear, setIsCrear] = useState(false);
  const [form, setForm] = useState<DependenciaForm>(DEFAULT_FORM);
  const [showForm, setShowForm] = useState(false);

  const actualizarMutation = useActualizarDependencia(editId ?? '');

  function openCrear() {
    setIsCrear(true);
    setEditId(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  }

  function openEditar(d: DependenciaAdmin) {
    setIsCrear(false);
    setEditId(d.id);
    setForm({ nombre: d.nombre, codigo: d.codigo, descripcion: d.descripcion ?? '' });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isCrear) {
      await crearMutation.mutateAsync({
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim().toUpperCase(),
        descripcion: form.descripcion.trim() || undefined,
      });
    } else if (editId) {
      await actualizarMutation.mutateAsync({
        nombre: form.nombre.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
      });
    }
    closeForm();
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Dependencias' }]}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <PageContainer
        title="Gestión de Dependencias"
        description="Dependencias municipales que pueden tramitar permisos."
        actions={
          <Button onClick={openCrear} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nueva dependencia
          </Button>
        }
      >
        {isError && <Alert variant="danger">No se pudo cargar la lista de dependencias.</Alert>}

        {showForm && (
          <div className="mb-6 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <h3 className="font-semibold text-neutral-800 mb-4">
              {isCrear ? 'Nueva dependencia' : 'Editar dependencia'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  minLength={3}
                  maxLength={100}
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
                />
              </div>
              {isCrear && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Código <span className="text-red-500">*</span>{' '}
                    <span className="font-normal text-neutral-400">(ej: TRANS, MOV)</span>
                  </label>
                  <input
                    required
                    pattern="[A-Z0-9_]{2,20}"
                    maxLength={20}
                    value={form.codigo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))
                    }
                    className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm font-mono"
                  />
                </div>
              )}
              <div className={isCrear ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Descripción
                </label>
                <textarea
                  maxLength={500}
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={crearMutation.isPending || actualizarMutation.isPending}
                >
                  {isCrear ? 'Crear' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Código</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (dependencias ?? []).map((d) => (
                    <DependenciaRow key={d.id} dependencia={d} onEditar={openEditar} />
                  ))}
              {!isLoading && (dependencias ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Sin dependencias registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </div>
  );
}

function DependenciaRow({
  dependencia,
  onEditar,
}: {
  dependencia: DependenciaAdmin;
  onEditar: (d: DependenciaAdmin) => void;
}) {
  const toggle = useToggleActivoDependencia(dependencia.id);
  return (
    <tr className="hover:bg-neutral-50">
      <td className="px-4 py-3 font-mono text-xs text-neutral-500">{dependencia.codigo}</td>
      <td className="px-4 py-3 font-medium text-neutral-800">
        {dependencia.nombre}
        {dependencia.descripcion && (
          <p className="text-xs text-neutral-400 font-normal mt-0.5 line-clamp-1">
            {dependencia.descripcion}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        {dependencia.activo ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Activa
          </span>
        ) : (
          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
            Inactiva
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEditar(dependencia)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggle.mutate()}
            disabled={toggle.isPending}
            title={dependencia.activo ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
