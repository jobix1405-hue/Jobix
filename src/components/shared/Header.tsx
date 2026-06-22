"use client"; // این کامپوننت حالا باید کلاینت‌ساید باشد چون از Zustand استفاده می‌کند

import Image from 'next/image';
import Link from 'next/link';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';

export function Header() {
  const { user, isAuthLoading } = useStore();

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        
        {/* بخش لوگو */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105">
          <Image
            src="/logo-minimal.webp"
            alt="لوگو جابیکس"
            width={120}
            height={40}
            className="object-contain w-auto h-auto"
            priority
          />
        </Link>

        {/* بخش دکمه‌ها - بر اساس وضعیت احراز هویت */}
        <div>
          {isAuthLoading ? (
            // اسکلتون لودینگ تا زمانی که وضعیت سشن مشخص بشه
            <div className="h-10 w-32 rounded-full bg-slate-200 animate-pulse"></div>
          ) : user ? (
            // اگر کاربر لاگین بود
            <Link href={user.role === 'employer' ? "/employer" : "/job-seeker"}>
              <Button 
                variant="outline" 
                className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-all duration-200 border-primary/20 hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                <LayoutDashboard className="ml-2 h-4 w-4" aria-hidden="true" />
                ورود به پنل کاربری
              </Button>
            </Link>
          ) : (
            // اگر کاربر لاگین نبود
            <Link href="/login">
              <Button 
                variant="outline" 
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:border-[#f97316] hover:text-[#ea580c] hover:shadow-md"
              >
                <LogIn className="ml-2 h-4 w-4" aria-hidden="true" />
                ورود / ثبت نام
              </Button>
            </Link>
          )}
        </div>
        
      </div>
    </header>
  );
}