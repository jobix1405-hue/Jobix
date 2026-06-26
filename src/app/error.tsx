"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // در سیستم‌های واقعی اینجا میشه ارور رو به Sentry یا ابزارهای مانیتورینگ فرستاد
    console.error("Application Error Captured:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center">
      
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 border-8 border-red-50">
        <AlertOctagon className="h-10 w-10 text-red-500" />
      </div>

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        متاسفانه خطایی رخ داده است!
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600 max-w-md mx-auto">
        در حال ارتباط با سرور مشکلی پیش آمد. لطفاً چند لحظه دیگر دوباره تلاش کنید.
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          size="lg" 
          onClick={() => reset()} // تلاش مجدد برای رندر کردن کامپوننتی که کرش کرده
          className="rounded-xl px-8 shadow-lg shadow-primary/20 w-full sm:w-auto"
        >
          <RotateCcw className="ml-2 h-5 w-5" />
          تلاش مجدد
        </Button>
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="rounded-xl px-8 w-full sm:w-auto">
            <Home className="ml-2 h-5 w-5" />
            بازگشت به خانه
          </Button>
        </Link>
      </div>
    </div>
  );
}