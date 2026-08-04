import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ title, icon: Icon, children, className }: DashboardCardProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex-row items-center gap-2 pb-3">
        {Icon && (
          <div className="h-8 w-8 rounded-md bg-primary-50 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
          </div>
        )}
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
