import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

function Spinner({ size = 'md', label = 'Cargando…', className }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex', className)}>
      <span
        className={cn(
          'animate-spin rounded-full border-primary-200 border-t-primary-600',
          SIZES[size],
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function LoadingPage({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-label={message}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <Spinner size="lg" label={message} />
      <p className="text-sm text-neutral-500" aria-hidden="true">
        {message}
      </p>
    </div>
  );
}

function LoadingOverlay({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-label={message}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div className="rounded-xl bg-white p-8 shadow-xl flex flex-col items-center gap-4">
        <Spinner size="lg" label={message} />
        <p className="text-sm text-neutral-600">{message}</p>
      </div>
    </div>
  );
}

export { Spinner, LoadingPage, LoadingOverlay };
