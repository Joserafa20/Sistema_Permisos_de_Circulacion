'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

/* ─── Root ─────────────────────────────────────────── */
const SelectRoot = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

/* ─── Trigger ──────────────────────────────────────── */
const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { error?: string }
>(({ className, error, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2',
      'text-sm text-neutral-900 placeholder:text-neutral-400',
      'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors duration-150',
      error
        ? 'border-danger-500 focus:ring-danger-600'
        : 'border-neutral-300 hover:border-neutral-400',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-neutral-500" aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

/* ─── Content ──────────────────────────────────────── */
const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-200',
        'bg-white shadow-md animate-fade-in',
        position === 'popper' && 'translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

/* ─── Item ─────────────────────────────────────────── */
const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm',
      'text-neutral-700 outline-none',
      'focus:bg-primary-50 focus:text-primary-700',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

/* ─── High-level Select ────────────────────────────── */
interface SelectProps<T extends string = string> {
  id?: string;
  label?: string;
  required?: boolean;
  value?: T;
  onValueChange?: (value: T) => void;
  onChange?: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

function Select<T extends string = string>({
  id,
  label,
  required,
  value,
  onValueChange,
  onChange,
  options,
  placeholder = 'Seleccione…',
  disabled,
  error,
  hint,
}: SelectProps<T>) {
  const handleChange = onValueChange ?? onChange ?? ((_v: T) => {});

  const errorId = id && error ? `${id}-error` : undefined;
  const hintId = id && hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700 leading-none">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-danger-600">
              *
            </span>
          )}
        </label>
      )}
      <SelectRoot
        value={value}
        onValueChange={handleChange as (v: string) => void}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          error={error}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? 'true' : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>

      {hint && !error && (
        <p id={hintId} className="text-xs text-neutral-500">
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
}

export { Select, SelectRoot, SelectValue, SelectTrigger, SelectContent, SelectItem };
