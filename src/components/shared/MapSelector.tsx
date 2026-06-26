"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// لود کردن نقشه فقط در سمت کلاینت (جلوگیری از خطای Hydration)
const DynamicMap = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
      <MapPin className="mb-2 h-8 w-8 animate-bounce text-slate-400" />
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