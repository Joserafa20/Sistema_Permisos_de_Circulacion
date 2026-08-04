import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
  hint?: string;
  label?: string;
}

/**
 * DatePicker — wrapper sobre <input type="date"> nativo.
 * Brinda estilos consistentes con el sistema de diseño y mensajes de error/hint.
 * En Fase 5 puede migrarse a una librería de calendario si el UX lo requiere.
 */
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, hint, id, label: _label, ...props }, ref) => {
    const descriptionId = id ? `${id}-desc` : undefined;
    const errorId = id && error ? `${id}-error` : undefined;

    return (
      <div className="flex flex-col gap-1 w-full">
        <input
          ref={ref}
          id={id}
          type="date"
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
            'text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
            'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
            'transition-colors duration-150',
            error
              ? 'border-danger-500 focus:ring-danger-600'
              : 'border-neutral-300 hover:border-neutral-400',
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p id={descriptionId} className="text-xs text-neutral-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-danger-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
