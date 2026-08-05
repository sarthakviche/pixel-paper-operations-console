import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, helperText, error, id, ...props }, ref) => {
    const selectId = id || React.useId();
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[#F5F7F8]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'flex w-full min-h-[44px] appearance-none rounded-[var(--radius-input,8px)] border border-[rgba(255,255,255,0.06)] bg-[#1B2024] px-3 py-2 pr-10 text-sm text-[#F5F7F8] transition-colors duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80] focus-visible:border-transparent',
              'hover:border-[rgba(255,255,255,0.12)] focus:border-[rgba(255,255,255,0.12)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-[#F87171] focus-visible:ring-[#F87171]',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1B2024] text-[#F5F7F8]">
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4 text-[#8C949C]" />
          </div>
        </div>
        {helperText && (
          <p className={cn('text-xs', error ? 'text-[#F87171]' : 'text-[#8C949C]')}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
