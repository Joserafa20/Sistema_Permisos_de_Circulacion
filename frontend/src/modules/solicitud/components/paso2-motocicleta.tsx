'use client';

import { useFormContext } from 'react-hook-form';
import type { SolicitudFormValues } from '@/schemas/solicitud.schemas';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { SelectOption } from '@/types';

const SERVICIO_OPTIONS: SelectOption[] = [
  { value: 'particular', label: 'Particular' },
  { value: 'publico', label: 'Público' },
];

const TIPO_VEHICULO_OPTIONS: SelectOption[] = [
  { value: 'moto', label: 'Moto' },
  { value: 'motocarro', label: 'Motocarro' },
];

function em(msg: string | undefined): string | undefined {
  return msg;
}

export function Paso2Motocicleta() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SolicitudFormValues>();

  const tipoServicio = watch('tipoServicio');
  const tipoVehiculo = watch('tipoVehiculo');
  const esMotocarro = tipoVehiculo === 'motocarro';

  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-800 mb-4">
        Información del vehículo
      </legend>

      <Select<string>
        id="tipoVehiculo"
        label="Tipo de vehículo"
        required
        options={TIPO_VEHICULO_OPTIONS}
        value={tipoVehiculo}
        onChange={(val: string) => {
          setValue('tipoVehiculo', val as SolicitudFormValues['tipoVehiculo'], {
            shouldValidate: true,
          });
          // Reset placa when switching type
          setValue('placa', '', { shouldValidate: false });
        }}
        error={em(errors.tipoVehiculo?.message)}
        placeholder="Seleccione..."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="placa"
          label="Placa"
          required
          placeholder={esMotocarro ? 'ABC123' : 'ABC12D'}
          maxLength={6}
          hint={
            esMotocarro
              ? 'Motocarro: 3 letras, 3 números (ej. MMM000)'
              : 'Moto: 3 letras, 2 números, 1 letra (ej. ABC12D)'
          }
          error={em(errors.placa?.message)}
          {...register('placa', {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              e.target.value = e.target.value.toUpperCase();
            },
          })}
        />
        <Input
          id="marca"
          label="Marca"
          required
          placeholder="Ej: Honda, Yamaha, Suzuki"
          error={em(errors.marca?.message)}
          {...register('marca')}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="modelo"
          label="Modelo"
          required
          placeholder="Ej: CBR 150, FZ-S"
          error={em(errors.modelo?.message)}
          {...register('modelo')}
        />
        <Input
          id="anio"
          label="Año"
          required
          type="number"
          inputMode="numeric"
          min={1990}
          max={new Date().getFullYear() + 1}
          placeholder={String(new Date().getFullYear())}
          error={em(errors.anio?.message)}
          {...register('anio')}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="color"
          label="Color"
          required
          placeholder="Ej: Rojo, Negro"
          error={em(errors.color?.message)}
          {...register('color')}
        />
        <Input
          id="cilindraje"
          label="Cilindraje (cc)"
          required
          type="number"
          inputMode="numeric"
          min={1}
          max={1500}
          placeholder="Ej: 150"
          error={em(errors.cilindraje?.message)}
          {...register('cilindraje')}
        />
      </div>

      <Select<string>
        id="tipoServicio"
        label="Tipo de servicio"
        required
        options={SERVICIO_OPTIONS}
        value={tipoServicio}
        onChange={(val: string) =>
          setValue('tipoServicio', val as SolicitudFormValues['tipoServicio'], {
            shouldValidate: true,
          })
        }
        error={em(errors.tipoServicio?.message)}
        placeholder="Seleccione..."
      />
    </fieldset>
  );
}
