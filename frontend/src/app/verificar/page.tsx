import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { PageHeader } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Verificar Permiso de Circulación',
  description:
    'Verifique la autenticidad y vigencia de un permiso de circulación ingresando o escaneando su código QR.',
};

/**
 * Página de verificación pública de permisos.
 * Consume: GET /api/v1/public/verificar/{codigoQR}
 * Optimizada para móvil (verificación en campo por autoridades).
 * La lógica de verificación se implementa en bloque posterior de Fase 5.
 */
export default function VerificarPage() {
  return (
    <PortalLayout>
      <PageHeader
        title="Verificar Permiso de Circulación"
        description="Ingrese el código QR o código del permiso para verificar su autenticidad y vigencia."
        centered
      />

      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        {/* Indicadores de estado visual (referencia de diseño) */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-success-50 border border-success-200 px-4 py-3">
            <span className="text-2xl" aria-hidden="true">
              ✅
            </span>
            <div>
              <p className="text-sm font-semibold text-success-700">Vigente</p>
              <p className="text-xs text-success-600">El permiso es válido para la fecha actual.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-danger-50 border border-danger-200 px-4 py-3">
            <span className="text-2xl" aria-hidden="true">
              ❌
            </span>
            <div>
              <p className="text-sm font-semibold text-danger-700">Vencido / Revocado</p>
              <p className="text-xs text-danger-600">El permiso no tiene validez.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3">
            <span className="text-2xl" aria-hidden="true">
              ❓
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-700">No encontrado</p>
              <p className="text-xs text-neutral-500">
                El código no corresponde a ningún permiso registrado.
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500"
          aria-label="Verificación QR — próximamente"
        >
          <p className="text-lg font-medium text-neutral-700 mb-2">Verificación por código</p>
          <p className="text-sm">
            El formulario de verificación se implementará en el siguiente bloque de desarrollo (Fase
            5).
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
