'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES, SYSTEM_NAME, SYSTEM_SHORT_NAME } from '@/lib/constants';

const NAV_LINKS = [
  { href: ROUTES.home, label: 'Inicio' },
  { href: ROUTES.solicitud, label: 'Solicitar Permiso' },
  { href: ROUTES.estado, label: 'Consultar Estado' },
  { href: ROUTES.verificar, label: 'Verificar QR' },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md shadow-sm"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={ROUTES.home}
          className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          aria-label={`${SYSTEM_NAME} — Ir al inicio`}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white"
            aria-hidden="true"
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-bold text-primary-700">{SYSTEM_SHORT_NAME}</span>
            <span className="text-xs text-neutral-500 leading-none">Portal Ciudadano</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                pathname === href
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA Desktop */}
        <Link
          href={ROUTES.solicitud}
          className={cn(
            'hidden md:inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white',
            'hover:bg-primary-700 active:bg-primary-800 transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
          )}
        >
          Solicitar ahora
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className={cn(
            'md:hidden rounded-md p-2 text-neutral-600 hover:bg-neutral-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
          )}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menú móvil"
          className="md:hidden border-t border-neutral-100 bg-white px-4 pb-4 pt-2 animate-fade-in"
        >
          <ul className="flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-50',
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={ROUTES.solicitud}
            onClick={() => setOpen(false)}
            className="mt-3 block w-full rounded-md bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Solicitar ahora
          </Link>
        </nav>
      )}
    </header>
  );
}
