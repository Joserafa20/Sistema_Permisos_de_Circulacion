'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel?: () => void;
  isConfirming?: boolean;
  confirmDisabled?: boolean;
  maxWidth?: string;
  children?: React.ReactNode;
}

export function ConfirmationModal({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isConfirming = false,
  confirmDisabled = false,
  maxWidth = 'max-w-md',
  children,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstFocusRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-xl`}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
          <h2 id="modal-title" className="text-base font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            ref={firstFocusRef}
            aria-label="Cerrar"
            onClick={onClose}
            className="ml-4 h-7 w-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {description && (
            <p id="modal-desc" className="text-sm text-neutral-600">
              {description}
            </p>
          )}
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
          <Button variant="ghost" size="sm" onClick={onCancel ?? onClose} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            className={cn(
              confirmVariant === 'danger'
                ? 'bg-danger-600 hover:bg-danger-700 text-white focus-visible:ring-danger-600'
                : '',
            )}
            onClick={onConfirm}
            loading={isConfirming}
            disabled={isConfirming || confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
