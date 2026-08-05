import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export const AIChip = ({ className }: { className?: string }) => {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-[#1B2024] text-[#8C949C] border border-[rgba(255,255,255,0.06)]', className)}>
      <Sparkles className="w-3 h-3" />
      AI Suggested
    </span>
  );
};
