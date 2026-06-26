import React from 'react';
import { Loader2 } from 'lucide-react';

// تعریف تایپ‌ها برای قابلیت‌های مختلف دکمه
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  
  // استایل‌های پایه که بین همه دکمه‌ها مشترک است
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // استایل‌های مربوط به رنگ‌بندی (Variants)
  const variants = {
    primary: "bg-[#1e3a8a] text-white hover:bg-[#1e40af] focus:ring-[#1e3a8a]", // سرمه‌ای
    secondary: "bg-[#f97316] text-white hover:bg-[#ea580c] focus:ring-[#f97316]", // نارنجی
    outline: "border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  // استایل‌های مربوط به سایز (Sizes)
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* نمایش حالت در حال بارگذاری با آیکون لوسید */}
      {isLoading && (
        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" />
      )}
      {children}
    </button>
  );
}