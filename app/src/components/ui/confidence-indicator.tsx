import React from 'react';
import { cn } from '@/lib/cn';
import { Tooltip } from './tooltip';

export interface ConfidenceIndicatorProps {
  confidence: number;
  className?: string;
}

export const ConfidenceIndicator = ({ confidence, className }: ConfidenceIndicatorProps) => {
  let bars = 1;
  let color = 'bg-[#8C949C]';
  let label = 'Low confidence';

  if (confidence >= 0.7) {
    bars = 3;
    color = 'bg-[#4ADE80]';
    label = 'High confidence';
  } else if (confidence >= 0.4) {
    bars = 2;
    color = 'bg-[#FACC15]';
    label = 'Medium confidence';
  }

  return (
    <Tooltip content={label}>
      <div className={cn('flex items-end gap-0.5 h-4', className)}>
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              'w-1 rounded-sm transition-colors duration-200',
              bar <= bars ? color : 'bg-[rgba(255,255,255,0.1)]',
              bar === 1 ? 'h-2' : bar === 2 ? 'h-3' : 'h-4'
            )}
          />
        ))}
      </div>
    </Tooltip>
  );
};
