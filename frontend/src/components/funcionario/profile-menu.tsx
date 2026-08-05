'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLogout } from '@/hooks/use-logout';
import { cn } from '@/lib/utils';

export function ProfileMenu() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Cierra al hacer click fuera */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  /* Cierra con Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!user) return null;

  const initials = `${user.nombres[0] ?? ''}${user.apellidos[0] ?? ''}`.toUpperCase();
  const fullName = `${user.nombres} ${user.apellidos}`;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Menú de ${fullName}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
          'hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
          open && 'bg-neutral-100',
        )}
      >
        {/* Avatar */}
        <span
          className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white shrink-0"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="hidden sm:flex flex-col text-left min-w-0">
          <span className="font-medium text-neutral-900 truncate max-w-[140px]">{fullName}</span>
          <span className="text-xs text-neutral-500 truncate">{user.rol.nombre}</span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-400 transition-transform duration-150 hidden sm:block',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Opciones de perfil"
          className={cn(
            'absolute right-0 top-full mt-1 w-56 rounded-xl border border-neutral-200 bg-white shadow-lg py-1 z-50',
            'animate-fade-in',
          )}
        >
          {/* Información del usuario */}
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-sm font-semibold text-neutral-900 truncate">{fullName}</p>
            <p className="text-xs text-neutral-500 truncate">{user.correoElectronico}</p>
            {user.dependencia && (
              <p className="text-xs text-neutral-400 mt-0.5 truncate">{user.dependencia.nombre}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="py-1">
            <button
              role="menuitem"
              type="button"
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none"
            >
              <User className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              Mi perfil
            </button>

            <hr className="my-1 border-neutral-100" />

            <button
              role="menuitem"
              type="button"
              disabled={isPending}
              onClick={() => logout()}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2 text-sm text-danger-600',
                'hover:bg-danger-50 focus-visible:bg-danger-50 focus-visible:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
