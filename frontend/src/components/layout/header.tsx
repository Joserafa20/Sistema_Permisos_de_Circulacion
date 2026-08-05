import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  centered?: boolean;
}

/**
 * PageHeader — encabezado reutilizable para cada página del portal.
 * Proporciona jerarquía visual consistente y estructura semántica.
 */
function PageHeader({
  title,
  description,
  children,
  className,
  centered = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'border-b border-neutral-200 bg-white py-8 px-4',
        centered && 'text-center',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto max-w-7xl sm:px-6 lg:px-8',
          centered && 'flex flex-col items-center',
        )}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-balance">{title}</h1>
        {description && (
          <p className="mt-2 text-base text-neutral-500 max-w-2xl text-balance">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

export { PageHeader };
