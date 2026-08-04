'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, total, limit, onPageChange, className }: Props) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div
      className={cn('flex items-center justify-between gap-4 py-3 px-1', className)}
      role="navigation"
      aria-label="Paginación"
    >
      <p className="text-sm text-neutral-500 shrink-0">
        {total === 0 ? '0 resultados' : `${from}–${to} de ${total}`}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Primera página"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Página anterior"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-neutral-600 px-2 min-w-[5rem] text-center">
          {page} / {totalPages || 1}
        </span>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Página siguiente"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Última página"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
