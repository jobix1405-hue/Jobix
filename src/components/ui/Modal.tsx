import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  // این افکت برای این است که اگر کاربر دکمه Esc را زد، مودال بسته شود
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // جلوگیری از اسکرول شدن صفحه وقتی مودال باز است
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // اگر مودال باز نبود، هیچی رندر نشود
  if (!isOpen) return null;

  return (
    // بک‌گراند تاریک و تار (Overlay)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      {/* بدنه اصلی مودال */}
      <div 
        className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-right shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن با کلیک داخل خود کادر
      >
        {/* هدر مودال (شامل عنوان و دکمه بستن) */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          {title ? (
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          ) : (
            <div /> // برای حفظ فاصله‌ها اگر عنوانی نبود
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* محتوای مودال */}
        <div className="px-6 py-5">
          {children}
        </div>

        {/* فوتر مودال (برای دکمه‌های تایید و لغو) */}
        {footer && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}