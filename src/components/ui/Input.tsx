"use client";

import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode; // اضافه کردن ویژگی آیکون
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    
    const reactId = useId();
    const inputId = id || reactId;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {/* نمایش آیکون در سمت راست (برای زبان فارسی) */}
          {icon && (
            <div className="absolute right-3 flex items-center justify-center text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={`
              flex h-11 w-full rounded-lg border bg-white py-2 text-sm text-slate-900 
              transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium 
              placeholder:text-slate-400 
              focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
              ${icon ? 'pr-10' : 'px-3'} 
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-slate-200 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20'
              }
            `}
            {...props}
          />
        </div>

        {error && (
          <span className="text-sm text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';