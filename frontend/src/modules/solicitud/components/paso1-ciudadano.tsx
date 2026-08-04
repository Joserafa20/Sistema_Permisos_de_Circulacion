'use client';

import { useFormContext } from 'react-hook-form';
import type { SolicitudFormValues } from '@/schemas/solicitud.schemas';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { SelectOption } from '@/types';

const TIPO_DOC_OPTIONS: SelectOption[] = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
];

/** Extrae el mensaje de error de RHF como string puro */
function em(msg: string | undefined): string | undefined {
  return msg;
}

export function Paso1Ciudadano() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SolicitudFormValues>();

  const tipoDocumento = watch('tipoDocumento');

  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-800 mb-4">
        Información personal del solicitante
      </legend>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="nombres"
          label="Nombres"
          required
          autoComplete="given-name"
          placeholder="Ej: Juan Carlos"
          error={em(errors.nombres?.message)}
          {...register('nombres')}
        />
        <Input
          id="apellidos"
          label="Apellidos"
          required
          autoComplete="family-name"
          placeholder="Ej: García López"
          error={em(errors.apellidos?.message)}
          {...register('apellidos')}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select<string>
          id="tipoDocumento"
          label="Tipo de documento"
          required
          options={TIPO_DOC_OPTIONS}
          value={tipoDocumento}
          onChange={(val: string) =>
            setValue('tipoDocumento', val as SolicitudFormValues['tipoDocumento'], {
              shouldValidate: true,
            })
          }
          error={em(errors.tipoDocumento?.message)}
          placeholder="Seleccione..."
        />
        <Input
          id="numeroDocumento"
          label="Número de documento"
          required
          inputMode="numeric"
          maxLength={20}
          placeholder="Ej: 1234567890"
          error={em(errors.numeroDocumento?.message)}
          {...register('numeroDocumento')}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="correoElectronico"
          label="Correo electrónico"
          required
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
          error={em(errors.correoElectronico?.message)}
          {...register('correoElectronico')}
        />
        <Input
          id="telefono"
          label="Celular"
          required
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          placeholder="3001234567"
          hint="10 dígitos, inicia en 3"
          error={em(errors.telefono?.message)}
          {...register('telefono')}
        />
      </div>

      <Input
        id="direccion"
        label="Dirección"
        required
        autoComplete="street-address"
        placeholder="Ej: Calle 10 # 5-30, Barrio Centro"
        error={em(errors.direccion?.message)}
        {...register('direccion')}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="municipio"
          label="Municipio"
          required
          placeholder="Ej: Medellín"
          error={em(errors.municipio?.message)}
          {...register('municipio')}
        />
        <Input
          id="departamento"
          label="Departamento"
          required
          placeholder="Ej: Antioquia"
          error={em(errors.departamento?.message)}
          {...register('departamento')}
        />
      </div>
    </fieldset>
  );
}
