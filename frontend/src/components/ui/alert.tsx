import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const alertVariants = cva('relative w-full rounded-lg border p-4 flex gap-3 text-sm', {
  variants: {
    variant: {
      info: 'bg-primary-50 border-primary-200 text-primary-800',
      success: 'bg-success-50 border-success-200 text-success-800',
      warning: 'bg-warning-50 border-warning-200 text-warning-800',
      danger: 'bg-danger-50 border-danger-200 text-danger-800',
    },
  },
  defaultVariants: { variant: 'info' },
});

const ALERT_ICONS: Record<string, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✕',
};

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  icon?: boolean;
}

function Alert({
  className,
  variant = 'info',
  title,
  icon = true,
  children,
  ...props
}: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {icon && (
        <span aria-hidden="true" className="shrink-0 font-bold text-base mt-0.5">
          {ALERT_ICONS[variant ?? 'info']}
        </span>
      )}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export { Alert, alertVariants };
