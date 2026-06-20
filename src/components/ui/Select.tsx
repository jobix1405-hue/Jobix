import React, { forwardRef, useId } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    
    const reactId = useId();
    const selectId = id || reactId;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        
        <select
          id={selectId}
          ref={ref}
          className={`
            flex h-11 w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 
            transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
            disabled:cursor-not-allowed disabled:opacity-50
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20'
            }
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: `left 0.5rem center`,
            backgroundRepeat: `no-repeat`,
            backgroundSize: `1.5em 1.5em`,
            paddingLeft: `2.5rem`
          }}
          {...props}
        >
          <option value="" disabled hidden>انتخاب کنید...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && (
          <span className="text-sm text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';