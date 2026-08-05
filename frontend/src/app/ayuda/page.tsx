import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { PageHeader } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Ayuda y Preguntas Frecuentes',
  description:
    'Respuestas a las preguntas más comunes sobre el trámite de permisos de circulación durante la restricción Pico y Placa.',
};

const FAQS = [
  {
    q: '¿Qué documentos necesito para solicitar el permiso?',
    a: 'Debe adjuntar: cédula de ciudadanía vigente, tarjeta de propiedad del vehículo, SOAT vigente, revisión técnico-mecánica (si aplica) y licencia de conducción. Todos los documentos en formato PDF, JPG o PNG, máximo 10 MB cada uno.',
  },
  {
    q: '¿Cuánto tiempo tarda la revisión de mi solicitud?',
    a: 'El plazo máximo de respuesta es de 24 horas hábiles a partir de la recepción de la solicitud con todos los documentos completos. Recibirá un correo electrónico con la decisión.',
  },
  {
    q: '¿Puedo consultar el estado de mi solicitud?',
    a: 'Sí. Vaya a la sección "Consultar Estado" e ingrese su número de radicado (recibido en el correo de confirmación) y su número de documento de identidad.',
  },
  {
    q: '¿Qué significa cada estado de la solicitud?',
    a: 'Recibida: en espera de revisión. En revisión: un funcionario la está analizando. Aprobada: permiso generado. Rechazada: no cumple los requisitos. Pendiente de corrección: debe ajustar datos o documentos.',
  },
  {
    q: '¿Cómo descargo mi permiso aprobado?',
    a: 'Al aprobarse su solicitud recibirá un correo con el enlace de descarga del permiso en PDF. También puede consultarlo en "Consultar Estado" con su número de radicado.',
  },
  {
    q: '¿El permiso es válido en todo el país?',
    a: 'No. El permiso es válido únicamente dentro del municipio que lo expide y durante las fechas específicas indicadas en el documento.',
  },
] as const;

export default function AyudaPage() {
  return (
    <PortalLayout>
      <PageHeader
        title="Ayuda y Preguntas Frecuentes"
        description="Encuentre respuestas a las dudas más comunes sobre el trámite de permiso de circulación."
        centered
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Alert variant="info" className="mb-8">
          Si su duda no está resuelta aquí, puede comunicarse con la Alcaldía a través de los
          canales indicados en la sección <strong>Contacto</strong>.
        </Alert>

        <dl className="flex flex-col gap-4">
          {FAQS.map(({ q, a }, idx) => (
            <Card key={idx}>
              <CardContent className="pt-5 pb-5">
                <dt className="font-semibold text-neutral-900 mb-2">{q}</dt>
                <dd className="text-sm text-neutral-600 leading-relaxed">{a}</dd>
              </CardContent>
            </Card>
          ))}
        </dl>
      </div>
    </PortalLayout>
  );
}
