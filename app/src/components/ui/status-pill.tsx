import React from 'react';
import { cn } from '@/lib/cn';
import { ProjectStatus, LineStatus } from '@/types/domain.types';
import { Badge } from './badge';

export interface StatusPillProps {
  status: ProjectStatus | LineStatus;
  size?: 'sm' | 'lg';
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'muted' }> = {
  // ProjectStatus
  draft: { label: 'Draft', variant: 'muted' },
  breakdown: { label: 'Breakdown', variant: 'info' },
  in_production: { label: 'In Production', variant: 'warning' },
  review: { label: 'Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  delivered: { label: 'Delivered', variant: 'success' },
  // LineStatus
  not_started: { label: 'Not Started', variant: 'muted' },
  in_progress: { label: 'In Progress', variant: 'info' },
  needs_review: { label: 'Needs Review', variant: 'warning' },
  // approved is shared
};

export const StatusPill = ({ status, size = 'sm', className }: StatusPillProps) => {
  const config = statusConfig[status] || { label: status, variant: 'muted' as const };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        size === 'lg' ? 'px-3 py-1 text-sm' : '',
        className
      )}
    >
      <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', {
        'bg-[#4ADE80]': config.variant === 'success',
        'bg-[#FACC15]': config.variant === 'warning',
        'bg-[#F87171]': config.variant === 'danger',
        'bg-[#60A5FA]': config.variant === 'info',
        'bg-[#8C949C]': config.variant === 'muted',
        'bg-current': config.variant !== 'success' && config.variant !== 'warning' && config.variant !== 'danger' && config.variant !== 'info' && config.variant !== 'muted',
      })} />
      {config.label}
    </Badge>
  );
};
