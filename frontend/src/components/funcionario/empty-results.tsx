import { FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export function EmptyResults({
  title = 'Sin resultados',
  description = 'No se encontraron solicitudes con los filtros aplicados.',
  onReset,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <FileSearch className="h-7 w-7 text-neutral-400" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-neutral-700">{title}</p>
      <p className="mt-1 text-sm text-neutral-400 max-w-xs">{description}</p>
      {onReset && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
