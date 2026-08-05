import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-neutral-200', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-6 space-y-4 shadow-card',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-6 w-1/3" />
      <SkeletonText lines={3} />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };
