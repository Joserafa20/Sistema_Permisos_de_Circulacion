'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, ImageIcon, Save, RefreshCw } from 'lucide-react';
import { useConfiguracionAdmin, useActualizarConfiguracion } from '@/hooks/use-admin-configuracion';
import { useToast } from '@/providers/toast-provider';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { configuracionSchema } from '@/schemas/admin.schemas';
import type { ConfiguracionFormValues } from '@/schemas/admin.schemas';

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 disabled:bg-neutral-50 disabled:text-neutral-400"
      />
      {error && (
        <span className="text-xs text-danger-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function ConfiguracionView() {
  const { data: config, isLoading, isError, refetch } = useConfiguracionAdmin();
  const updateMut = useActualizarConfiguracion();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ConfiguracionFormValues>({
    resolver: zodResolver(configuracionSchema),
  });

  useEffect(() => {
    if (config) {
      reset({
        nombreAlcaldia: config.nombreAlcaldia,
        nit: config.nit,
        codigoDane: config.codigoDane ?? '',
        departamento: config.departamento,
        municipio: config.municipio,
        direccion: config.direccion,
        telefono: config.telefono,
        correoInstitucional: config.correoInstitucional,
        sitioWeb: config.sitioWeb ?? '',
      });
    }
  }, [config, reset]);

  function onSubmit(values: ConfiguracionFormValues) {
    const body = {
      ...values,
      codigoDane: values.codigoDane || undefined,
      sitioWeb: values.sitioWeb || null,
    };

    updateMut.mutate(body, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Configuración guardada',
          message: 'Los cambios se aplicaron correctamente.',
        });
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al guardar la configuración.';
        toast({ type: 'error', title: 'Error al guardar', message: msg });
      },
    });
  }

  const breadcrumbs = [{ label: 'Configuración Institucional' }];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc breadcrumbs={breadcrumbs} onRefresh={() => refetch()} isRefreshing={isLoading} />

      <PageContainer
        title="Configuración Institucional"
        description="Datos de identidad de la Alcaldía. Estos datos aparecen en los permisos de circulación y en el portal ciudadano."
        actions={
          <Button
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting || updateMut.isPending}
            loading={updateMut.isPending}
            aria-busy={updateMut.isPending}
          >
            <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Guardar cambios
          </Button>
        }
      >
        {isError && (
          <div className="space-y-4">
            <Alert variant="danger" title="No se pudo cargar la configuración">
              Verifique su conexión e intente nuevamente.
            </Alert>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
            aria-label="Formulario de configuración institucional"
            noValidate
          >
            {/* Identidad */}
            <section>
              <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                Identidad institucional
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Nombre de la Alcaldía *">
                  <Input
                    {...register('nombreAlcaldia')}
                    placeholder="Alcaldía Municipal de…"
                    error={errors.nombreAlcaldia?.message}
                    aria-required="true"
                  />
                </FieldGroup>
                <FieldGroup label="NIT *">
                  <Input
                    {...register('nit')}
                    placeholder="800.099.999-9"
                    error={errors.nit?.message}
                    aria-required="true"
                  />
                </FieldGroup>
                <FieldGroup label="Departamento *">
                  <Input
                    {...register('departamento')}
                    placeholder="Huila"
                    error={errors.departamento?.message}
                    aria-required="true"
                  />
                </FieldGroup>
                <FieldGroup label="Municipio *">
                  <Input
                    {...register('municipio')}
                    placeholder="Neiva"
                    error={errors.municipio?.message}
                    aria-required="true"
                  />
                </FieldGroup>
                <FieldGroup label="Código DANE">
                  <Input
                    {...register('codigoDane')}
                    placeholder="41001"
                    error={errors.codigoDane?.message}
                  />
                </FieldGroup>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">Datos de contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Dirección *">
                  <Input
                    {...register('direccion')}
                    placeholder="Calle 10 # 5-20, Centro Administrativo"
                    error={errors.direccion?.message}
                    aria-required="true"
                  />
                </FieldGroup>
                <FieldGroup label="Teléfono *">
                  <Input
                    {...register('telefono')}
                    placeholder="(608) 871-0000"
                    error={errors.telefono?.message}
                    aria-required="true"
                  />
                </FieldGroup>
                <FieldGroup label="Correo institucional *">
                  <Input
                    {...register('correoInstitucional')}
                    type="email"
                    placeholder="contacto@alcaldia.gov.co"
                    error={errors.correoInstitucional?.message}
                    aria-required="true"
                  />
                </FieldGroup>
                <FieldGroup label="Sitio web">
                  <Input
                    {...register('sitioWeb')}
                    type="url"
                    placeholder="https://www.alcaldia.gov.co"
                    error={errors.sitioWeb?.message}
                  />
                </FieldGroup>
              </div>
            </section>

            {/* Imágenes — informativo */}
            <section>
              <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2 mb-4">
                <ImageIcon className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                Imágenes institucionales
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${config?.tieneLogo ? 'bg-success-100' : 'bg-neutral-100'}`}
                  >
                    <ImageIcon
                      className={`h-5 w-5 ${config?.tieneLogo ? 'text-success-600' : 'text-neutral-400'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Logo institucional</p>
                    <p
                      className={`text-xs font-medium ${config?.tieneLogo ? 'text-success-700' : 'text-neutral-500'}`}
                    >
                      {config?.tieneLogo ? 'Configurado' : 'No configurado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${config?.tieneEscudo ? 'bg-success-100' : 'bg-neutral-100'}`}
                  >
                    <ImageIcon
                      className={`h-5 w-5 ${config?.tieneEscudo ? 'text-success-600' : 'text-neutral-400'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Escudo municipal</p>
                    <p
                      className={`text-xs font-medium ${config?.tieneEscudo ? 'text-success-700' : 'text-neutral-500'}`}
                    >
                      {config?.tieneEscudo ? 'Configurado' : 'No configurado'}
                    </p>
                  </div>
                </div>
              </div>
              <Alert variant="info" className="mt-4">
                La carga de imágenes (logo y escudo) se realiza mediante API directa. Contacte al
                equipo técnico para actualizar estas imágenes.
              </Alert>
            </section>

            {updateMut.isError && (
              <Alert variant="danger" title="Error al guardar">
                {updateMut.error instanceof Error
                  ? updateMut.error.message
                  : 'Ocurrió un error inesperado.'}
              </Alert>
            )}

            {/* Submit mobile */}
            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <Button
                type="submit"
                size="sm"
                disabled={!isDirty || updateMut.isPending}
                loading={updateMut.isPending}
                aria-busy={updateMut.isPending}
              >
                <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Guardar cambios
              </Button>
            </div>
          </form>
        )}
      </PageContainer>
    </div>
  );
}
