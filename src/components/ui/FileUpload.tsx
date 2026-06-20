"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  label: string;
  value?: string;
  onChange: (file: File | null) => void;
  error?: string;
}

export function FileUpload({ label, onChange, error }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
          preview ? 'border-primary bg-white p-2' : 'border-slate-200 bg-slate-50 p-8 hover:border-primary/50'
        } ${error ? 'border-red-500 bg-red-50' : ''}`}
      >
        {preview ? (
          <div className="relative h-32 w-full">
            <img src={preview} alt="Preview" className="h-full w-full rounded-xl object-contain" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="absolute -left-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-white p-3 shadow-sm">
              <Upload className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              برای آپلود لوگو کلیک کنید یا تصویر را اینجا رها کنید
            </p>
            <p className="mt-1 text-[10px] text-slate-400">PNG, JPG (حداکثر ۲ مگابایت)</p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}