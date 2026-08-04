'use client';

import { Alert } from '@/components/ui/alert';
import { FileUploader } from '@/components/ui/file-uploader';
import { MAX_DOCUMENTS } from '@/lib/constants';

interface Paso4DocumentosProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function Paso4Documentos({ files, onChange, error }: Paso4DocumentosProps) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-base font-semibold text-neutral-800 mb-4">
        Documentos requeridos
      </legend>

      <Alert variant="info" title="Documentos requeridos (RN-53)">
        <ul className="mt-1 list-disc list-inside space-y-1 text-sm">
          <li>Fotocopia del documento de identidad</li>
          <li>SOAT vigente</li>
          <li>Revisión tecnicomecánica (si aplica)</li>
          <li>Certificado laboral o documento que sustente el motivo</li>
        </ul>
        <p className="mt-2 text-sm">
          Formatos aceptados: PDF, JPG, PNG — máximo 10 MB por archivo — hasta {MAX_DOCUMENTS}{' '}
          archivos.
        </p>
      </Alert>

      <FileUploader
        id="documentos"
        label="Arrastra los archivos aquí o haz clic para seleccionar"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        maxFiles={MAX_DOCUMENTS}
        onChange={onChange}
        error={error}
        hint={`${files.length}/${MAX_DOCUMENTS} archivos adjuntos`}
      />
    </fieldset>
  );
}
