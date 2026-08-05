import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#1B2024] text-[#F5F7F8] border-[rgba(255,255,255,0.12)]',
      success: 'bg-[rgba(74,222,128,0.1)] text-[#4ADE80] border-[rgba(74,222,128,0.2)]',
      warning: 'bg-[rgba(250,204,21,0.1)] text-[#FACC15] border-[rgba(250,204,21,0.2)]',
      danger: 'bg-[rgba(248,113,113,0.1)] text-[#F87171] border-[rgba(248,113,113,0.2)]',
      info: 'bg-[rgba(96,165,250,0.1)] text-[#60A5FA] border-[rgba(96,165,250,0.2)]',
      muted: 'bg-[#151A1D] text-[#8C949C] border-[rgba(255,255,255,0.06)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-colors',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
