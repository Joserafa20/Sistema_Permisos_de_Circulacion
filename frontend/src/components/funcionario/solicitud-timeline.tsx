import { cn } from '@/lib/utils';
import { SolicitudStatusBadge, getEstadoLabel } from './solicitud-status-badge';
import type { HistorialEstadoItem, EstadoSolicitud } from '@/types/funcionario';
import { formatDate } from '@/lib/utils';

interface Props {
  historial: HistorialEstadoItem[];
  className?: string;
}

export function SolicitudTimeline({ historial, className }: Props) {
  if (historial.length === 0) {
    return <p className="text-sm text-neutral-400 py-4">No hay historial disponible.</p>;
  }

  return (
    <ol
      className={cn('relative border-l border-neutral-200 ml-3 space-y-0', className)}
      aria-label="Historial de estados"
    >
      {historial.map((item, idx) => {
        const isLast = idx === historial.length - 1;
        return (
          <li key={item.id} className="mb-0 ml-6 pb-6">
            {/* Dot */}
            <span
              className={cn(
                'absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full border-2',
                isLast ? 'bg-primary-600 border-primary-600' : 'bg-white border-neutral-300',
              )}
              aria-hidden="true"
            />

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <SolicitudStatusBadge estado={item.estadoNuevo} className="text-xs" />
                {item.estadoAnterior && (
                  <span className="text-xs text-neutral-400">
                    desde {getEstadoLabel(item.estadoAnterior as EstadoSolicitud)}
                  </span>
                )}
              </div>

              <time className="text-xs text-neutral-400">{formatDate(item.createdAt)}</time>

              {item.usuario && (
                <p className="text-xs text-neutral-500">
                  Por: {item.usuario.nombre} {item.usuario.apellido}
                </p>
              )}

              {item.motivo && (
                <p className="text-sm text-neutral-600 bg-neutral-50 rounded-md px-3 py-2 border border-neutral-100 mt-1">
                  {item.motivo}
                </p>
              )}

              {item.camposCorreccion && Object.keys(item.camposCorreccion).length > 0 && (
                <div className="mt-1 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                  <p className="text-xs font-medium text-amber-700 mb-1">Campos a corregir:</p>
                  <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
                    {Object.keys(item.camposCorreccion).map((campo) => (
                      <li key={campo}>{campo}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
