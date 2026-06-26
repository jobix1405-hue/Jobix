"use client";

import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center animate-pulse">
        <Image
          src="/icon-192.png" 
          alt="Loading..."
          width={60}
          height={60}
          className="object-contain"
        />
        {/* هاله چرخان دور لوگو */}
        <div className="absolute inset-0 -m-4 rounded-full border-4 border-slate-100 border-t-primary animate-spin"></div>
      </div>
      <p className="mt-8 text-sm font-bold text-slate-500 tracking-widest animate-pulse">
        در حال بارگذاری...
      </p>
    </div>
  );
}