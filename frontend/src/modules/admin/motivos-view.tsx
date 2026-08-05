'use client';

import { useState } from 'react';
import { BookOpen, Plus, Pencil, Power } from 'lucide-react';
import {
  useMotivosAdmin,
  useCrearMotivo,
  useActualizarMotivo,
  useToggleActivoMotivo,
} from '@/hooks/use-admin-motivos';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import type { MotivoAdmin } from '@/types/admin';

type FormMode = 'crear' | 'editar';

interface MotivoForm {
  nombre: string;
  descripcion: string;
  requiereSoporte: boolean;
  orden: number;
}

const DEFAULT_FORM: MotivoForm = { nombre: '', descripcion: '', requiereSoporte: false, orden: 0 };

export function MotivosView() {
  const { data: motivos, isLoading, isError, refetch, isFetching } = useMotivosAdmin();
  const crearMutation = useCrearMotivo();
  const [editId, setEditId] = useState<string | null>(null);
  const [mode, setMode] = useState<FormMode>('crear');
  const [form, setForm] = useState<MotivoForm>(DEFAULT_FORM);
  const [showForm, setShowForm] = useState(false);

  const actualizarMutation = useActualizarMotivo(editId ?? '');

  function openCrear() {
    setMode('crear');
    setEditId(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  }

  function openEditar(m: MotivoAdmin) {
    setMode('editar');
    setEditId(m.id);
    setForm({
      nombre: m.nombre,
      descripcion: m.descripcion ?? '',
      requiereSoporte: m.requiereSoporte,
      orden: m.orden,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      requiereSoporte: form.requiereSoporte,
      orden: form.orden,
    };
    if (mode === 'crear') {
      await crearMutation.mutateAsync(body);
    } else if (editId) {
      await actualizarMutation.mutateAsync(body);
    }
    closeForm();
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={[{ label: 'Motivos' }]}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <PageContainer
        title="Gestión de Motivos"
        description="Motivos de permiso disponibles en el formulario ciudadano."
        actions={
          <Button onClick={openCrear} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nuevo motivo
          </Button>
        }
      >
        {isError && <Alert variant="danger">No se pudo cargar la lista de motivos.</Alert>}

        {showForm && (
          <div className="mb-6 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <h3 className="font-semibold text-neutral-800 mb-4">
              {mode === 'crear' ? 'Nuevo motivo' : 'Editar motivo'}
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
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Orden</label>
                <input
                  type="number"
                  min={0}
                  value={form.orden}
                  onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) }))}
                  className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
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
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiereSoporte"
                  checked={form.requiereSoporte}
                  onChange={(e) => setForm((f) => ({ ...f, requiereSoporte: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="requiereSoporte" className="text-sm text-neutral-700">
                  Requiere soporte documental del ciudadano
                </label>
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
                  {mode === 'crear' ? 'Crear' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Orden</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Soporte</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (motivos ?? []).map((m) => (
                    <MotivoRow key={m.id} motivo={m} onEditar={openEditar} />
                  ))}
              {!isLoading && (motivos ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Sin motivos registrados.
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

function MotivoRow({
  motivo,
  onEditar,
}: {
  motivo: MotivoAdmin;
  onEditar: (m: MotivoAdmin) => void;
}) {
  const toggle = useToggleActivoMotivo(motivo.id);
  return (
    <tr className="hover:bg-neutral-50">
      <td className="px-4 py-3 text-neutral-500">{motivo.orden}</td>
      <td className="px-4 py-3 font-medium text-neutral-800">
        {motivo.nombre}
        {motivo.descripcion && (
          <p className="text-xs text-neutral-400 font-normal mt-0.5 line-clamp-1">
            {motivo.descripcion}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        {motivo.requiereSoporte ? (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            Requerido
          </span>
        ) : (
          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
            No
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {motivo.activo ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Activo
          </span>
        ) : (
          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
            Inactivo
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEditar(motivo)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggle.mutate()}
            disabled={toggle.isPending}
            title={motivo.activo ? 'Desactivar' : 'Activar'}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
