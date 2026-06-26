"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center sm:py-32 lg:px-8">
      
      {/* انیمیشن یا تصویر */}
      <div className="relative mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-2xl shadow-primary/10 animate-in zoom-in duration-500">
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-200 animate-[spin_10s_linear_infinite]"></div>
        <Search className="h-16 w-16 text-slate-300" />
        <span className="absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl font-extrabold text-white shadow-lg rotate-12">
          404
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        صفحه مورد نظر پیدا نشد!
      </h1>
      <p className="mt-6 text-base leading-7 text-slate-600 max-w-md mx-auto">
        متاسفیم، اما به نظر می‌رسد آدرسی که جستجو کرده‌اید تغییر یافته یا به طور کلی حذف شده است. 
      </p>
      
      <div className="mt-10 flex items-center justify-center gap-x-4">
        <Link href="/">
          <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
            <Home className="ml-2 h-5 w-5" />
            بازگشت به خانه
          </Button>
        </Link>
        <Link href="/jobs">
          <Button variant="outline" size="lg" className="rounded-xl px-8">
            جستجوی مشاغل
            <ArrowRight className="mr-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}