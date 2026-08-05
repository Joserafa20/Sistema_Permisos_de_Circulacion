import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { Label } from './label';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, required, error, hint, id, ...props }, ref) => {
    const descriptionId = id ? `${id}-desc` : undefined;
    const errorId = id && error ? `${id}-error` : undefined;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={id}
          required={required}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? 'true' : undefined}
          rows={4}
          className={cn(
            'flex w-full rounded-md border bg-white px-3 py-2 text-sm',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600',
            'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
            'resize-y min-h-[80px] transition-colors duration-150',
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

Textarea.displayName = 'Textarea';

export { Textarea };
