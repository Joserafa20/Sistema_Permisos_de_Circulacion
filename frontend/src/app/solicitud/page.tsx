import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { PageHeader } from '@/components/layout/header';
import { Alert } from '@/components/ui/alert';
import { Stepper } from '@/components/ui/stepper';

export const metadata: Metadata = {
  title: 'Solicitar Permiso de Circulación',
  description:
    'Diligencie el formulario en línea para solicitar su permiso de circulación de motocicleta durante la restricción Pico y Placa.',
};

const STEPS = [
  { id: 1, label: 'Datos personales' },
  { id: 2, label: 'Motocicleta' },
  { id: 3, label: 'Motivo y fechas' },
  { id: 4, label: 'Documentos' },
  { id: 5, label: 'Confirmación' },
];

/**
 * Página de solicitud — Fase 5 construirá el formulario completo en pasos.
 * Este shell define la estructura, el stepper y los metadatos.
 */
export default function SolicitudPage() {
  return (
    <PortalLayout>
      <PageHeader
        title="Solicitar Permiso de Circulación"
        description="Diligencie el formulario con sus datos para solicitar el permiso de circulación de motocicleta durante el Pico y Placa."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Aviso Ley 1581 */}
        <Alert
          variant="info"
          title="Autorización de tratamiento de datos — Ley 1581 de 2012"
          className="mb-8"
        >
          Los datos suministrados serán tratados de acuerdo con la política de privacidad de la
          Alcaldía Municipal y usados exclusivamente para la expedición del permiso solicitado. Al
          continuar autoriza su uso para este fin.
        </Alert>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={STEPS} currentStep={1} />
        </div>

        {/* Formulario — implementado en bloque posterior de Fase 5 */}
        <div
          className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500"
          aria-label="Formulario de solicitud — próximamente"
        >
          <p className="text-lg font-medium text-neutral-700 mb-2">Formulario en construcción</p>
          <p className="text-sm">
            El formulario completo de solicitud se implementará en el siguiente bloque de desarrollo
            (Fase 5).
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
