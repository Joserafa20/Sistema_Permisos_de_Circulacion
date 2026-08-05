'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { FUNC_ROUTES } from '@/lib/constants';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex items-center gap-1 text-sm text-neutral-500">
        <li>
          <Link
            href={FUNC_ROUTES.dashboard}
            aria-label="Inicio"
            className="flex items-center text-neutral-400 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-neutral-300" aria-hidden="true" />
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'font-medium text-neutral-700' : 'text-neutral-500'}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
