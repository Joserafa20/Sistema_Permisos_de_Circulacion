'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, ShieldCheck, Users, Settings, X, Menu } from 'lucide-react';
import { SidebarItem } from './sidebar-item';
import { PermissionGate } from './permission-gate';
import { FUNC_ROUTES, SYSTEM_SHORT_NAME } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: FUNC_ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: FUNC_ROUTES.solicitudes, label: 'Solicitudes', icon: FileText, exact: false },
  { href: FUNC_ROUTES.permisos, label: 'Permisos', icon: ShieldCheck, exact: false },
] as const;

const ADMIN_NAV_ITEMS = [
  { href: '/funcionario/usuarios', label: 'Usuarios', icon: Users },
  { href: '/funcionario/configuracion', label: 'Configuración', icon: Settings },
] as const;

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { data: stats } = useDashboardStats();

  const content = (
    <nav aria-label="Navegación principal" className="flex flex-col gap-1 h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-neutral-100">
        <Link
          href={FUNC_ROUTES.dashboard}
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          onClick={() => setMobileOpen(false)}
        >
          <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900 truncate">{SYSTEM_SHORT_NAME}</p>
            <p className="text-xs text-neutral-500 truncate">Panel Funcionario</p>
          </div>
        </Link>
      </div>

      {/* Links principales */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            exact={item.exact}
            badge={item.href === FUNC_ROUTES.solicitudes ? stats?.solicitudesPendientes : undefined}
          />
        ))}

        {/* Links de administrador */}
        <PermissionGate role="administrador">
          <div className="pt-4 mt-4 border-t border-neutral-100">
            <p className="px-3 pb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Administración
            </p>
            {ADMIN_NAV_ITEMS.map((item) => (
              <SidebarItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </div>
        </PermissionGate>
      </div>

      {/* Footer del sidebar: dependencia del usuario */}
      {user?.dependencia && (
        <div className="px-4 py-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 truncate">{user.dependencia.nombre}</p>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 border-r border-neutral-200 bg-white h-screen sticky top-0"
        aria-label="Panel lateral"
      >
        {content}
      </aside>

      {/* Botón hamburguesa mobile */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-neutral-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer mobile */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-neutral-200 flex flex-col',
          'transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Panel lateral móvil"
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-md hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        {content}
      </aside>
    </>
  );
}
