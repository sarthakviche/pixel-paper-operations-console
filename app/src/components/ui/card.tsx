import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
  padding?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-card,16px)] border border-[rgba(255,255,255,0.06)]',
          variant === 'default' ? 'bg-[#151A1D]' : 'bg-[#1B2024] shadow-[var(--shadow-soft)]',
          padding && 'p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
