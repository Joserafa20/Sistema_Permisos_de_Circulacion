'use client';

import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { SolicitudFormValues } from '@/schemas/solicitud.schemas';

const DRAFT_KEY = 'pyp:solicitud:draft';

export function loadDraft(): Partial<SolicitudFormValues> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SolicitudFormValues>;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(DRAFT_KEY);
}

export function hasDraft(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DRAFT_KEY) !== null;
}

export function useSolicitudDraft(form: UseFormReturn<SolicitudFormValues>): void {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
        } catch {
          // Storage lleno — ignorar silenciosamente
        }
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [form]);
}
