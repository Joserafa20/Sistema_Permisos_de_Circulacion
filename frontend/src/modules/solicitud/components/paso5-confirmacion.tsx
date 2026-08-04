'use client';

import { useFormContext } from 'react-hook-form';
import type { SolicitudFormValues } from '@/schemas/solicitud.schemas';
import { formatFileSize } from '@/lib/utils';

const TIPO_DOC_LABEL: Record<string, string> = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  PA: 'Pasaporte',
  TI: 'Tarjeta de Identidad',
};

interface Paso5ConfirmacionProps {
  files: File[];
  motivoNombre?: string;
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-neutral-100 last:border-0">
      <dt className="text-sm font-medium text-neutral-500 sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm text-neutral-800 mt-0.5 sm:mt-0">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mt-6 mb-2 first:mt-0">
      {children}
    </h3>
  );
}

export function Paso5Confirmacion({ files, motivoNombre }: Paso5ConfirmacionProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SolicitudFormValues>();

  const values = watch();

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Revise la información antes de enviar. Una vez enviada no podrá modificarla.
      </p>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <SectionTitle>Datos personales</SectionTitle>
        <dl>
          <SummaryRow label="Nombres" value={`${values.nombres} ${values.apellidos}`} />
          <SummaryRow
            label="Documento"
            value={`${TIPO_DOC_LABEL[values.tipoDocumento] ?? values.tipoDocumento}: ${values.numeroDocumento}`}
          />
          <SummaryRow label="Correo" value={values.correoElectronico} />
          <SummaryRow label="Celular" value={values.telefono} />
          <SummaryRow label="Dirección" value={values.direccion} />
          <SummaryRow label="Municipio" value={`${values.municipio}, ${values.departamento}`} />
        </dl>

        <SectionTitle>Motocicleta</SectionTitle>
        <dl>
          <SummaryRow label="Placa" value={values.placa} />
          <SummaryRow
            label="Marca / Modelo"
            value={`${values.marca} ${values.modelo} (${values.anio})`}
          />
          <SummaryRow label="Color" value={values.color} />
          <SummaryRow label="Cilindraje" value={`${values.cilindraje} cc`} />
          <SummaryRow
            label="Servicio"
            value={values.tipoServicio === 'particular' ? 'Particular' : 'Público'}
          />
        </dl>

        <SectionTitle>Solicitud</SectionTitle>
        <dl>
          <SummaryRow label="Motivo" value={motivoNombre ?? values.motivoId} />
          <SummaryRow label="Fecha inicio" value={values.fechaInicio} />
          <SummaryRow label="Fecha fin" value={values.fechaFin} />
          {values.justificacion && (
            <SummaryRow label="Justificación" value={values.justificacion} />
          )}
        </dl>

        <SectionTitle>Documentos adjuntos</SectionTitle>
        {files.length === 0 ? (
          <p className="text-sm text-danger-600">Sin documentos adjuntos</p>
        ) : (
          <ul className="space-y-1">
            {files.map((f, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                <span aria-hidden="true">📄</span>
                <span className="truncate">{f.name}</span>
                <span className="text-neutral-400 shrink-0">({formatFileSize(f.size)})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer"
          aria-describedby={errors.declaracionJurada ? 'decl-error' : undefined}
          aria-invalid={!!errors.declaracionJurada}
          {...register('declaracionJurada')}
        />
        <span className="text-sm text-neutral-700 leading-snug group-hover:text-neutral-900">
          He leído y acepto la <strong>declaración jurada</strong> de que los datos suministrados
          son verídicos y que autorizo el tratamiento de datos personales conforme a la{' '}
          <strong>Ley 1581 de 2012</strong>.
        </span>
      </label>
      {errors.declaracionJurada && (
        <p id="decl-error" role="alert" className="text-xs text-danger-600 flex gap-1 items-center">
          <span aria-hidden="true">⚠</span>
          {errors.declaracionJurada.message}
        </p>
      )}
    </div>
  );
}
