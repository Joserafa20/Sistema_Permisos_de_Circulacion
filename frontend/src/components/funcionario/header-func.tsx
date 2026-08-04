'use client';

import { RefreshCw } from 'lucide-react';
import { ProfileMenu } from './profile-menu';
import { BreadcrumbNav, type BreadcrumbItem } from './breadcrumb-nav';
import { Button } from '@/components/ui/button';

interface HeaderFuncProps {
  breadcrumbs?: BreadcrumbItem[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function HeaderFunc({ breadcrumbs = [], onRefresh, isRefreshing = false }: HeaderFuncProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6 shrink-0">
      {/* Breadcrumb — desplazado a la derecha del hamburguesa en mobile */}
      <div className="flex items-center gap-4 min-w-0 lg:pl-0 pl-12">
        {breadcrumbs.length > 0 && <BreadcrumbNav items={breadcrumbs} />}
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Actualizar datos"
            title="Actualizar"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </Button>
        )}
        <ProfileMenu />
      </div>
    </header>
  );
}
