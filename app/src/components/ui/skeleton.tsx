import React from 'react';
import { cn } from '@/lib/cn';

const skeletonClass = 'bg-[#1B2024] animate-[skeletonPulse_1.5s_ease-in-out_infinite] rounded';

export const SkeletonText = ({ className }: { className?: string }) => (
  <div className={cn(skeletonClass, 'h-4 w-full', className)} />
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn(skeletonClass, 'h-32 w-full rounded-[var(--radius-card,16px)]', className)} />
);

export const SkeletonRow = ({ className }: { className?: string }) => (
  <div className="flex items-center space-x-4 w-full">
    <div className={cn(skeletonClass, 'h-10 w-10 rounded-full shrink-0')} />
    <div className="space-y-2 w-full">
      <SkeletonText className="w-1/3" />
      <SkeletonText className="w-2/3" />
    </div>
  </div>
);

export const SkeletonAvatar = ({ className }: { className?: string }) => (
  <div className={cn(skeletonClass, 'h-10 w-10 rounded-full', className)} />
);
