'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { ToastItem } from '@/types';

/* ─── Contexto ─────────────────────────────── */
interface ToastContextValue {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ─── Provider ─────────────────────────────── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { ...item, id }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────── */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

/* ─── Viewport (renderiza los toasts) ────────── */
const ICON: Record<ToastItem['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const TOAST_STYLES: Record<ToastItem['type'], string> = {
  success: 'bg-success-600 border-success-700',
  error: 'bg-danger-600 border-danger-700',
  warning: 'bg-warning-600 border-warning-700',
  info: 'bg-primary-600 border-primary-700',
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      role="region"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`
            flex items-start gap-3 rounded-lg border px-4 py-3 text-white shadow-lg
            animate-slide-up ${TOAST_STYLES[t.type]}
          `}
        >
          <span aria-hidden="true" className="text-lg leading-none mt-0.5">
            {ICON[t.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug">{t.title}</p>
            {t.message && <p className="text-xs mt-0.5 opacity-90">{t.message}</p>}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Cerrar notificación"
            className="shrink-0 opacity-75 hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      ))}
    </div>
  );
}
