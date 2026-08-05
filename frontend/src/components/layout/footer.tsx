import Link from 'next/link';
import { ROUTES, SYSTEM_NAME, SYSTEM_SHORT_NAME } from '@/lib/constants';

const FOOTER_LINKS = [
  { href: ROUTES.solicitud, label: 'Solicitar Permiso' },
  { href: ROUTES.estado, label: 'Consultar Estado' },
  { href: ROUTES.verificar, label: 'Verificar Permiso' },
  { href: ROUTES.contacto, label: 'Contacto' },
  { href: ROUTES.ayuda, label: 'Ayuda' },
] as const;

const LEGAL_LINKS = [
  { href: '/privacidad', label: 'Política de Privacidad' },
  { href: '/terminos', label: 'Términos de Uso' },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-neutral-200 bg-neutral-50 text-neutral-600"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="text-base font-bold text-neutral-900">{SYSTEM_SHORT_NAME}</p>
            <p className="mt-1 text-sm text-neutral-500">{SYSTEM_NAME}</p>
            <p className="mt-3 text-sm text-neutral-500 max-w-xs leading-relaxed">
              Portal oficial para la gestión de permisos de circulación de motocicletas durante la
              restricción Pico y Placa en el municipio.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Mapa del sitio">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-900 mb-3">
              Trámites
            </p>
            <ul className="flex flex-col gap-2" role="list">
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm hover:text-primary-600 hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Información legal">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-900 mb-3">
              Legal
            </p>
            <ul className="flex flex-col gap-2" role="list">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm hover:text-primary-600 hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <p>
            &copy; {currentYear} Alcaldía Municipal — {SYSTEM_NAME}. Todos los derechos reservados.
          </p>
          <p>Ley 1581 de 2012 — Protección de Datos Personales</p>
        </div>
      </div>
    </footer>
  );
}
