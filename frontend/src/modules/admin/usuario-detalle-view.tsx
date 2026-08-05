'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  UserCog,
  Pencil,
  Check,
  X,
  Power,
  Trash2,
  RotateCcw,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  useUsuarioDetalle,
  useActualizarUsuario,
  useActivarUsuario,
  useEliminarUsuario,
  useRestaurarUsuario,
} from '@/hooks/use-admin-usuarios';
import { useRoles, useDependencias } from '@/hooks/use-admin-catalogs';
import { useToast } from '@/providers/toast-provider';
import { UsuarioRolBadge } from '@/components/admin/usuario-rol-badge';
import { ConfirmationModal } from '@/components/funcionario/confirmation-modal';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { actualizarUsuarioSchema } from '@/schemas/admin.schemas';
import type { ActualizarUsuarioFormValues } from '@/schemas/admin.schemas';
import { formatDate } from '@/lib/utils';
import { FUNC_ROUTES } from '@/lib/constants';

interface Props {
  id: string;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-neutral-800">{value ?? '—'}</dd>
    </div>
  );
}

function FormInput({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-danger-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 disabled:bg-neutral-50 disabled:text-neutral-400 ${hasError ? 'border-danger-400' : 'border-neutral-300'}`;
}

export function UsuarioDetalleView({ id }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [showDesactivar, setShowDesactivar] = useState(false);
  const [showActivar, setShowActivar] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);
  const [showRestaurar, setShowRestaurar] = useState(false);

  const { data: usuario, isLoading, isError, refetch } = useUsuarioDetalle(id);
  const { data: roles } = useRoles();
  const { data: dependencias } = useDependencias();

  const actualizarMut = useActualizarUsuario(id);
  const activarMut = useActivarUsuario(id);
  const eliminarMut = useEliminarUsuario(id);
  const restaurarMut = useRestaurarUsuario(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ActualizarUsuarioFormValues>({
    resolver: zodResolver(actualizarUsuarioSchema),
  });

  function enterEdit() {
    if (!usuario) return;
    reset({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rolId: usuario.rol.id,
      dependenciaId: usuario.dependencia?.id ?? '',
      desbloquear: false,
    });
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
  }

  function onSubmitEdit(values: ActualizarUsuarioFormValues) {
    const body = {
      ...values,
      dependenciaId: values.dependenciaId || undefined,
      desbloquear: values.desbloquear ?? false,
    };
    actualizarMut.mutate(body, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Usuario actualizado',
          message: 'Los cambios se guardaron correctamente.',
        });
        setEditMode(false);
      },
      onError: (err: unknown) => {
        toast({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : 'Error al actualizar.',
        });
      },
    });
  }

  function handleActivar(nuevoEstado: boolean) {
    activarMut.mutate(nuevoEstado, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: nuevoEstado ? 'Usuario activado' : 'Usuario desactivado',
          message: `${usuario?.nombre} ${usuario?.apellido} ${nuevoEstado ? 'fue activado' : 'fue desactivado'}.`,
        });
        setShowActivar(false);
        setShowDesactivar(false);
      },
      onError: (err: unknown) => {
        toast({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : 'Error al cambiar estado.',
        });
      },
    });
  }

  function handleEliminar() {
    eliminarMut.mutate(undefined, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Usuario eliminado',
          message: 'El usuario fue dado de baja del sistema.',
        });
        router.push(FUNC_ROUTES.usuarios);
      },
      onError: (err: unknown) => {
        toast({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : 'Error al eliminar.',
        });
        setShowEliminar(false);
      },
    });
  }

  function handleRestaurar() {
    restaurarMut.mutate(undefined, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Usuario restaurado',
          message: 'El usuario fue reactivado en el sistema.',
        });
        setShowRestaurar(false);
      },
      onError: (err: unknown) => {
        toast({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : 'Error al restaurar.',
        });
      },
    });
  }

  const breadcrumbs = [
    { label: 'Usuarios', href: FUNC_ROUTES.usuarios },
    { label: isLoading ? 'Cargando…' : `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}` },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc breadcrumbs={breadcrumbs} onRefresh={() => refetch()} isRefreshing={isLoading} />

      <PageContainer
        title={
          isLoading
            ? 'Cargando…'
            : `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim() || 'Usuario'
        }
        description={usuario?.email}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(FUNC_ROUTES.usuarios)}
              aria-label="Volver a usuarios"
            >
              <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              Volver
            </Button>
            {!editMode && !isLoading && usuario && (
              <Button variant="outline" size="sm" onClick={enterEdit}>
                <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Editar
              </Button>
            )}
          </div>
        }
      >
        {isError && (
          <div className="space-y-4">
            <Alert variant="danger" title="No se pudo cargar el usuario" />
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Reintentar
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && !isError && usuario && (
          <div className="space-y-8">
            {/* Ficha de datos o formulario edit */}
            {!editMode ? (
              <section aria-label="Datos del usuario">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                    <UserCog className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {usuario.nombre} {usuario.apellido}
                    </p>
                    <UsuarioRolBadge rol={usuario.rol.nombre} activo={usuario.activo} />
                  </div>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 bg-neutral-50 rounded-xl border border-neutral-200 p-5">
                  <Field label="Nombre" value={usuario.nombre} />
                  <Field label="Apellido" value={usuario.apellido} />
                  <Field label="Email" value={usuario.email} />
                  <Field label="Rol" value={usuario.rol.nombre} />
                  <Field label="Dependencia" value={usuario.dependencia?.nombre} />
                  <Field
                    label="Último acceso"
                    value={usuario.ultimoLogin ? formatDate(usuario.ultimoLogin) : 'Nunca'}
                  />
                  <Field label="Registrado" value={formatDate(usuario.createdAt)} />
                  <Field
                    label="Actualizado"
                    value={usuario.updatedAt ? formatDate(usuario.updatedAt) : '—'}
                  />
                  <Field label="Intentos fallidos" value={String(usuario.intentosFallidos ?? 0)} />
                  {usuario.contrasenaExpiraAt && (
                    <Field
                      label="Contraseña expira"
                      value={formatDate(usuario.contrasenaExpiraAt)}
                    />
                  )}
                </dl>
              </section>
            ) : (
              <section aria-label="Editar usuario">
                <form
                  onSubmit={handleSubmit(onSubmitEdit)}
                  className="space-y-5 bg-neutral-50 rounded-xl border border-neutral-200 p-5"
                  noValidate
                >
                  <h2 className="text-sm font-semibold text-neutral-700">
                    Editar datos del usuario
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Nombre" required error={errors.nombre?.message}>
                      <input
                        {...register('nombre')}
                        className={inputCls(Boolean(errors.nombre))}
                        aria-required="true"
                      />
                    </FormInput>
                    <FormInput label="Apellido" required error={errors.apellido?.message}>
                      <input
                        {...register('apellido')}
                        className={inputCls(Boolean(errors.apellido))}
                        aria-required="true"
                      />
                    </FormInput>
                    <FormInput label="Email" required error={errors.email?.message}>
                      <input
                        type="email"
                        {...register('email')}
                        className={inputCls(Boolean(errors.email))}
                        aria-required="true"
                      />
                    </FormInput>
                    <FormInput label="Rol" required error={errors.rolId?.message}>
                      <select
                        {...register('rolId')}
                        className={inputCls(Boolean(errors.rolId))}
                        aria-required="true"
                      >
                        <option value="">Seleccione un rol…</option>
                        {roles?.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nombre}
                          </option>
                        ))}
                      </select>
                    </FormInput>
                    <FormInput label="Dependencia" error={errors.dependenciaId?.message}>
                      <select
                        {...register('dependenciaId')}
                        className={inputCls(Boolean(errors.dependenciaId))}
                      >
                        <option value="">Sin dependencia</option>
                        {dependencias?.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre}
                          </option>
                        ))}
                      </select>
                    </FormInput>
                  </div>

                  {(usuario.intentosFallidos ?? 0) > 0 && (
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input
                        type="checkbox"
                        {...register('desbloquear')}
                        className="rounded border-neutral-300"
                      />
                      Desbloquear cuenta ({usuario.intentosFallidos} intentos fallidos)
                    </label>
                  )}

                  {actualizarMut.isError && (
                    <Alert variant="danger" title="Error al actualizar">
                      {actualizarMut.error instanceof Error
                        ? actualizarMut.error.message
                        : 'Error inesperado.'}
                    </Alert>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                    <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-1" aria-hidden="true" />
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!isDirty || isSubmitting || actualizarMut.isPending}
                      loading={actualizarMut.isPending}
                      aria-busy={actualizarMut.isPending}
                    >
                      <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Guardar
                    </Button>
                  </div>
                </form>
              </section>
            )}

            {/* Acciones */}
            {!editMode && (
              <section aria-label="Acciones del usuario">
                <h2 className="text-sm font-semibold text-neutral-700 mb-3">Acciones</h2>
                <div className="flex flex-wrap gap-3">
                  {usuario.activo ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDesactivar(true)}
                      className="text-warning-700 border-warning-300 hover:bg-warning-50"
                    >
                      <Power className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Desactivar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowActivar(true)}
                      className="text-success-700 border-success-300 hover:bg-success-50"
                    >
                      <Check className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      Activar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRestaurar(true)}
                    className="text-neutral-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Restaurar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEliminar(true)}
                    className="text-danger-700 border-danger-300 hover:bg-danger-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Eliminar
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}
      </PageContainer>

      {/* Modales de confirmación */}
      <ConfirmationModal
        open={showDesactivar}
        onClose={() => setShowDesactivar(false)}
        onConfirm={() => handleActivar(false)}
        title="Desactivar usuario"
        isConfirming={activarMut.isPending}
        confirmLabel="Desactivar"
        confirmVariant="danger"
      >
        ¿Desea desactivar a{' '}
        <strong>
          {usuario?.nombre} {usuario?.apellido}
        </strong>
        ? No podrá iniciar sesión hasta ser reactivado.
      </ConfirmationModal>

      <ConfirmationModal
        open={showActivar}
        onClose={() => setShowActivar(false)}
        onConfirm={() => handleActivar(true)}
        title="Activar usuario"
        isConfirming={activarMut.isPending}
        confirmLabel="Activar"
        confirmVariant="primary"
      >
        ¿Desea activar a{' '}
        <strong>
          {usuario?.nombre} {usuario?.apellido}
        </strong>
        ?
      </ConfirmationModal>

      <ConfirmationModal
        open={showEliminar}
        onClose={() => setShowEliminar(false)}
        onConfirm={handleEliminar}
        title="Eliminar usuario"
        isConfirming={eliminarMut.isPending}
        confirmLabel="Eliminar"
        confirmVariant="danger"
      >
        ¿Está seguro de eliminar a{' '}
        <strong>
          {usuario?.nombre} {usuario?.apellido}
        </strong>
        ? Esta acción dará de baja al usuario del sistema.
      </ConfirmationModal>

      <ConfirmationModal
        open={showRestaurar}
        onClose={() => setShowRestaurar(false)}
        onConfirm={handleRestaurar}
        title="Restaurar usuario"
        isConfirming={restaurarMut.isPending}
        confirmLabel="Restaurar"
      >
        ¿Desea restaurar a{' '}
        <strong>
          {usuario?.nombre} {usuario?.apellido}
        </strong>
        ?
      </ConfirmationModal>
    </div>
  );
}
