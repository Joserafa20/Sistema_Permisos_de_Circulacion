import { Badge } from '@/components/ui/badge';
import type { EstadoSolicitud } from '@/types/funcionario';

interface Config {
  label: string;
  variant: 'neutral' | 'warning' | 'success' | 'danger' | 'info';
}

const ESTADO_CONFIG: Record<EstadoSolicitud, Config> = {
  recibida: { label: 'Recibida', variant: 'info' },
  en_revision: { label: 'En revisión', variant: 'warning' },
  aprobada: { label: 'Aprobada', variant: 'success' },
  rechazada: { label: 'Rechazada', variant: 'danger' },
  pendiente_correccion: { label: 'Corrección pendiente', variant: 'warning' },
  vencida: { label: 'Vencida', variant: 'neutral' },
};

interface Props {
  estado: EstadoSolicitud | string;
  className?: string;
}

export function SolicitudStatusBadge({ estado, className }: Props) {
  const config = ESTADO_CONFIG[estado as EstadoSolicitud] ?? {
    label: estado,
    variant: 'neutral' as const,
  };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export function getEstadoLabel(estado: EstadoSolicitud | string): string {
  return ESTADO_CONFIG[estado as EstadoSolicitud]?.label ?? estado;
}

export const ESTADOS_OPTIONS: { value: EstadoSolicitud; label: string }[] = (
  Object.entries(ESTADO_CONFIG) as [EstadoSolicitud, Config][]
).map(([value, { label }]) => ({ value, label }));
