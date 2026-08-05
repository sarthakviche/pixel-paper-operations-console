import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#F5F7F8]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex w-full min-h-[44px] rounded-[var(--radius-input,8px)] border border-[rgba(255,255,255,0.06)] bg-[#1B2024] px-3 py-2 text-sm text-[#F5F7F8] transition-colors duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-[#8C949C]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80] focus-visible:border-transparent',
            'hover:border-[rgba(255,255,255,0.12)] focus:border-[rgba(255,255,255,0.12)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#F87171] focus-visible:ring-[#F87171]',
            className
          )}
          {...props}
        />
        {helperText && (
          <p className={cn('text-xs', error ? 'text-[#F87171]' : 'text-[#8C949C]')}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
