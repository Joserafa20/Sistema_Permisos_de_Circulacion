'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';

import { estadoConsultaSchema, type EstadoConsultaValues } from '@/schemas/estado.schemas';
import { useEstadoSolicitud } from '@/hooks/use-estado-solicitud';
import { ApiError } from '@/lib/api-client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SolicitudResultado } from './components/solicitud-resultado';

const DEFAULT: EstadoConsultaValues = { radicado: '', documento: '' };

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return 'No se encontró ninguna solicitud con ese radicado y documento.';
    if (err.status === 400) return 'Los datos ingresados son incorrectos.';
    if (err.isServerError()) return 'Error del servidor. Intente nuevamente en unos minutos.';
  }
  if (err instanceof Error && (!navigator.onLine || err.message === 'Network Error')) {
    return 'Sin conexión a internet. Verifique su red e intente nuevamente.';
  }
  return 'Ocurrió un error inesperado. Intente nuevamente.';
}

export function EstadoConsulta() {
  const [params, setParams] = useState<{ radicado: string; documento: string } | null>(null);

  const form = useForm<EstadoConsultaValues>({
    resolver: zodResolver(estadoConsultaSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT,
  });

  const { data, isLoading, isError, error } = useEstadoSolicitud({
    radicado: params?.radicado ?? '',
    documento: params?.documento ?? '',
    enabled: params !== null,
  });

  function onSubmit(values: EstadoConsultaValues) {
    setParams({ radicado: values.radicado.trim(), documento: values.documento.trim() });
  }

  function onNuevaConsulta() {
    setParams(null);
    form.reset(DEFAULT);
  }

  if (data && !isLoading) {
    return <SolicitudResultado data={data} onNuevaConsulta={onNuevaConsulta} />;
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-label="Formulario de consulta de estado"
        className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-5"
      >
        <Input
          id="radicado"
          label="Número de radicado"
          required
          placeholder="20260802-PYP-000145"
          hint="Formato: AAAAMMDD-PYP-XXXXXX"
          error={form.formState.errors.radicado?.message}
          {...form.register('radicado')}
        />

        <Input
          id="documento"
          label="Número de documento"
          required
          inputMode="numeric"
          maxLength={20}
          placeholder="1234567890"
          hint="El mismo documento con el que realizó la solicitud"
          error={form.formState.errors.documento?.message}
          {...form.register('documento')}
        />

        <Button
          type="submit"
          className="w-full gap-2"
          loading={isLoading}
          disabled={isLoading}
          aria-label="Consultar estado de solicitud"
        >
          <Search className="h-4 w-4" />
          {isLoading ? 'Consultando...' : 'Consultar estado'}
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-3" aria-live="polite" aria-label="Cargando resultado">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      )}

      {isError && !isLoading && (
        <Alert variant="danger" title="No fue posible obtener el estado" aria-live="assertive">
          {getErrorMessage(error)}
        </Alert>
      )}
    </div>
  );
}
