"use client";

import dynamic from "next/dynamic";

// لود کردن نقشه فقط در سمت کلاینت (جلوگیری از خطای Hydration)
const DynamicMap = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
      <svg className="mb-2 h-8 w-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="text-sm font-medium animate-pulse">در حال بارگذاری نقشه...</span>
    </div>
  ),
});

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLocation?: [number, number];
}

export function MapSelector(props: MapSelectorProps) {
  return <DynamicMap {...props} />;
}