import Link from 'next/link';
import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES, SYSTEM_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Solicite y consulte permisos de circulación de motocicletas durante la restricción Pico y Placa de manera rápida y segura.',
};

const FEATURES = [
  {
    icon: '📋',
    title: 'Solicite su permiso',
    description:
      'Diligencie el formulario en línea con sus datos personales, información de la motocicleta y documentos requeridos.',
    href: ROUTES.solicitud,
    cta: 'Iniciar solicitud',
  },
  {
    icon: '🔍',
    title: 'Consulte el estado',
    description:
      'Ingrese su número de radicado y documento de identidad para conocer el estado actual de su trámite.',
    href: ROUTES.estado,
    cta: 'Consultar estado',
  },
  {
    icon: '✅',
    title: 'Verifique un permiso',
    description:
      'Escanee o ingrese el código QR de un permiso para verificar su autenticidad y vigencia en tiempo real.',
    href: ROUTES.verificar,
    cta: 'Verificar permiso',
  },
] as const;

const STEPS = [
  {
    step: 1,
    label: 'Complete el formulario',
    detail: 'Datos del ciudadano, motocicleta y motivo del desplazamiento.',
  },
  {
    step: 2,
    label: 'Adjunte los documentos',
    detail: 'Cédula, SOAT, licencia de conducción y documentos del vehículo.',
  },
  {
    step: 3,
    label: 'Espere la revisión',
    detail: 'Un funcionario revisará su solicitud en máximo 24 horas hábiles.',
  },
  {
    step: 4,
    label: 'Descargue su permiso',
    detail: 'Recibirá un correo con el permiso en PDF y código QR de verificación.',
  },
] as const;

export default function HomePage() {
  return (
    <PortalLayout>
      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="bg-gradient-to-b from-primary-700 to-primary-600 text-white py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-200 mb-3">
            Portal Oficial — Alcaldía Municipal
          </p>
          <h1 id="hero-heading" className="font-bold text-balance">
            {SYSTEM_NAME}
          </h1>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto text-balance">
            Gestione su permiso de circulación de motocicletas durante la restricción Pico y Placa
            de forma segura, rápida y desde cualquier dispositivo.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary-700 hover:bg-primary-50 hover:text-primary-800"
            >
              <Link href={ROUTES.solicitud}>Solicitar permiso ahora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href={ROUTES.estado}>Consultar mi solicitud</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading" className="py-14 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="features-heading"
            className="text-center text-neutral-700 text-sm font-semibold uppercase tracking-widest mb-8"
          >
            ¿Qué puedes hacer?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon, title, description, href, cta }) => (
              <Card key={href} className="hover:shadow-card-hover transition-shadow duration-200">
                <CardContent className="pt-6 flex flex-col gap-4">
                  <div className="text-4xl" aria-hidden="true">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="self-start mt-auto">
                    <Link href={href}>{cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section aria-labelledby="steps-heading" className="py-14 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 id="steps-heading" className="text-2xl font-bold text-center text-neutral-900 mb-10">
            ¿Cómo funciona el trámite?
          </h2>
          <ol className="space-y-6">
            {STEPS.map(({ step, label, detail }) => (
              <li key={step} className="flex items-start gap-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white font-bold text-sm"
                  aria-hidden="true"
                >
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{label}</p>
                  <p className="mt-0.5 text-sm text-neutral-500">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Button asChild size="lg">
              <Link href={ROUTES.solicitud}>Comenzar ahora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Important notice */}
      <section
        aria-label="Aviso importante"
        className="py-10 bg-warning-50 border-t border-warning-200"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 items-start">
            <span className="text-2xl" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <p className="font-semibold text-warning-800">Aviso importante</p>
              <p className="mt-1 text-sm text-warning-700">
                Este permiso solo es válido para el municipio donde fue expedido y durante las
                fechas indicadas en el documento. Porta el permiso (digital o impreso) durante el
                desplazamiento. La verificación de este documento por parte de las autoridades es
                obligatoria (Ley de Tránsito).
              </p>
            </div>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
}
