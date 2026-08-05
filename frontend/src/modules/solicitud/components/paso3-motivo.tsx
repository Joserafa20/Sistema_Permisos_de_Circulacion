'use client';

import { useFormContext } from 'react-hook-form';
import type { SolicitudFormValues } from '@/schemas/solicitud.schemas';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useMotivos } from '@/hooks/use-motivos';
import type { SelectOption } from '@/types';

function em(msg: string | undefined): string | undefined {
  return msg;
}

export function Paso3Motivo() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SolicitudFormValues>();

  const { data: motivos, isLoading, isError } = useMotivos();
  const motivoId = watch('motivoId');
  const motivoSeleccionado = motivos?.find((m) => m.id === motivoId);

  const motivoOptions: SelectOption[] = (motivos ?? []).map((m) => ({
    value: m.id,
    label: m.nombre,
  }));

  const today = new Date().toISOString().split('T')[0];

  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-800 mb-4">
        Motivo y vigencia del permiso
      </legend>

      {isError && (
        <Alert variant="danger" title="Error al cargar motivos">
          No fue posible cargar los motivos. Por favor recargue la página.
        </Alert>
      )}

      {isLoading ? (
        <Skeleton className="h-12 w-full rounded-md" />
      ) : (
        <Select<string>
          id="motivoId"
          label="Motivo de la solicitud"
          required
          options={motivoOptions}
          value={motivoId}
          onChange={(val: string) => setValue('motivoId', val, { shouldValidate: true })}
          error={em(errors.motivoId?.message)}
          placeholder="Seleccione un motivo..."
        />
      )}

      {motivoSeleccionado?.descripcion && (
        <Alert variant="info" title="Acerca de este motivo">
          {motivoSeleccionado.descripcion}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="fechaInicio"
          label="Fecha de inicio"
          required
          type="date"
          min={today}
          error={em(errors.fechaInicio?.message)}
          {...register('fechaInicio')}
        />
        <Input
          id="fechaFin"
          label="Fecha fin"
          required
          type="date"
          min={watch('fechaInicio') || today}
          error={em(errors.fechaFin?.message)}
          {...register('fechaFin')}
        />
      </div>

      <Textarea
        id="justificacion"
        label="Justificación adicional (opcional)"
        placeholder="Describa con detalle el motivo de su solicitud..."
        rows={4}
        maxLength={500}
        hint="Máximo 500 caracteres"
        error={em(errors.justificacion?.message)}
        {...register('justificacion')}
      />
    </fieldset>
  );
}
