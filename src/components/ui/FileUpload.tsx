"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  label: string;
  defaultImage?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function FileUpload({ label, defaultImage, onChange, error }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // اگر عکسی از قبل در دیتابیس بود، آن را نمایش بده
  useEffect(() => {
    if (defaultImage) {
      setPreview(defaultImage);
    }
  }, [defaultImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ولیدیشن سمت کلاینت برای حجم (۲ مگابایت)
      if (file.size > 2 * 1024 * 1024) {
        alert("حجم فایل باید کمتر از ۲ مگابایت باشد.");
        return;
      }

      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      
      <div 
        onClick={() => !preview && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
          preview ? 'border-slate-200 bg-white p-2' : 'cursor-pointer border-slate-200 bg-slate-50 p-8 hover:border-primary/50'
        } ${error ? 'border-red-500 bg-red-50' : ''}`}
      >
        {preview ? (
          <div className="relative h-32 w-full flex justify-center">
            <img src={preview} alt="Preview" className="h-full rounded-xl object-contain" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="absolute -left-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600 transition-colors"
              title="حذف تصویر"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-white p-3 shadow-sm border border-slate-100">
              <Upload className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500 text-center">
              برای آپلود لوگو کلیک کنید
            </p>
            <p className="mt-1 text-[10px] text-slate-400">PNG, JPG (حداکثر ۲ مگابایت)</p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  );
}