import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-[background-color,color,border-color,opacity] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] rounded-[var(--radius-button,12px)] min-h-[44px] sm:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-[#4ADE80] text-[#003919] hover:bg-[#22c55e]',
      secondary: 'border border-[rgba(255,255,255,0.12)] text-[#F5F7F8] hover:bg-[rgba(255,255,255,0.06)]',
      ghost: 'text-[#8C949C] hover:text-[#F5F7F8] hover:bg-[rgba(255,255,255,0.06)]',
      danger: 'text-[#F87171] hover:bg-[rgba(248,113,113,0.1)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
