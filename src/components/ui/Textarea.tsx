import React, { forwardRef, useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    
    const reactId = useId();
    const textareaId = id || reactId;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          ref={ref}
          className={`
            flex min-h-[120px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 
            transition-colors placeholder:text-slate-400 resize-y
            focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20'
            }
          `}
          {...props}
        />

        {error && (
          <span className="text-sm text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';