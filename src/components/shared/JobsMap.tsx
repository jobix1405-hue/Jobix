"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// لود کردن نقشه فقط در سمت کلاینت (جلوگیری از خطای Hydration)
const DynamicJobsMap = dynamic(() => import("./JobsMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 text-slate-400">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <span className="text-sm font-medium">در حال بارگذاری نقشه...</span>
    </div>
  ),
});

export function JobsMap(props: any) {
  return <DynamicJobsMap {...props} />;
}