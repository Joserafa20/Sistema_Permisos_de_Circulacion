'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  exact?: boolean;
}

export function SidebarItem({ href, label, icon: Icon, badge, exact = false }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          aria-label={`${badge} elementos`}
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
            isActive ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700',
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
