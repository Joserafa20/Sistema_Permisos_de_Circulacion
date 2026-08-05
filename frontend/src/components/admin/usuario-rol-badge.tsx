import { cn } from '@/lib/utils';

interface Props {
  rol: string;
  activo: boolean;
  className?: string;
}

const ROL_STYLES: Record<string, string> = {
  administrador: 'bg-purple-100 text-purple-800 border-purple-200',
  funcionario: 'bg-primary-100 text-primary-800 border-primary-200',
};

const ROL_LABELS: Record<string, string> = {
  administrador: 'Administrador',
  funcionario: 'Funcionario',
};

export function UsuarioRolBadge({ rol, activo, className }: Props) {
  const rolKey = rol.toLowerCase();
  const rolStyle = ROL_STYLES[rolKey] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200';
  const rolLabel = ROL_LABELS[rolKey] ?? rol;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
          rolStyle,
        )}
      >
        {rolLabel}
      </span>
      <span
        className={cn(
          'inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium border',
          activo
            ? 'bg-success-50 text-success-700 border-success-200'
            : 'bg-neutral-100 text-neutral-500 border-neutral-200',
        )}
        aria-label={activo ? 'Usuario activo' : 'Usuario inactivo'}
      >
        {activo ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  );
}
