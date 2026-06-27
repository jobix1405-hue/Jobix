"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LayoutDashboard, Menu, X, UserCog, Briefcase, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';

export function Header() {
  const { user, isAuthLoading } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // 🔥 جلوگیری از خطای Hydration
  const pathname = usePathname();

  // اطمینان از اینکه کامپوننت روی کلاینت مونت شده است
  useEffect(() => {
    setMounted(true);
  }, []);

  // لینک‌های منوی ناوبری سایت
  const navLinks = [
    { name: 'جستجوی مشاغل', href: '/jobs' },
    { name: 'شرکت‌های برتر', href: '/companies' },
    { name: 'تعرفه‌ها', href: '/pricing' },
    { name: 'درباره ما', href: '/about' },
  ];

  // 🔥 تابع هوشمند تشخیص مرحله و وضعیت کاربر
  const getButtonState = () => {
    if (!user) {
      return { url: '/login', text: 'ورود / ثبت‌نام', icon: LogIn, variant: 'outline' as const };
    }
    // اگر کاربر لاگین است اما هنوز نقش انتخاب نکرده (گیر کرده در Onboarding)
    if (!user.role) {
      return { url: '/onboarding', text: 'تکمیل ثبت‌نام', icon: UserCog, variant: 'secondary' as const };
    }
    // اگر نقش مشخص است
    if (user.role === 'employer') {
      return { url: '/employer', text: 'پنل کارفرما', icon: Building2, variant: 'outline' as const };
    }
    if (user.role === 'admin') {
      return { url: '/admin', text: 'پنل مدیریت', icon: ShieldCheck, variant: 'outline' as const };
    }
    return { url: '/job-seeker', text: 'پنل کارجو', icon: Briefcase, variant: 'outline' as const };
  };

  const btnState = getButtonState();
  const Icon = btnState.icon;

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* بخش راست: لوگو و منوی دسکتاپ */}
        <div className="flex items-center gap-10">
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

          {/* منوی ناوبری دسکتاپ */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  pathname === link.href ? "text-primary" : "text-slate-600 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* بخش چپ: دکمه‌های ورود و همبرگر منو */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            {/* اگر سایت در حال لود است یا هنوز مونت نشده، فقط یه اسکلتون نشون بده */}
            {!mounted || isAuthLoading ? (
              <div className="h-10 w-36 rounded-full bg-slate-100 animate-pulse border border-slate-200"></div>
            ) : (
              <Link href={btnState.url}>
                <Button 
                  variant={btnState.variant} 
                  className={`rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 ${
                    btnState.variant === 'outline' 
                      ? 'bg-white text-primary border-primary/20 hover:border-primary hover:bg-primary/5 hover:shadow-md' 
                      : 'shadow-secondary/20 hover:shadow-md'
                  }`}
                >
                  <Icon className="ml-2 h-4 w-4" aria-hidden="true" />
                  {btnState.text}
                </Button>
              </Link>
            )}
          </div>

          {/* دکمه منوی موبایل */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* منوی کشویی موبایل */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block py-3 text-base font-semibold border-b border-slate-50 ${
                pathname === link.href ? "text-primary" : "text-slate-700"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-2 sm:hidden">
             {!mounted || isAuthLoading ? (
              <div className="h-12 w-full rounded-full bg-slate-100 animate-pulse border border-slate-200"></div>
            ) : (
              <Link href={btnState.url} onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant={btnState.variant === 'outline' ? 'primary' : btnState.variant}
                  className="w-full h-12 rounded-full border-0 shadow-lg text-base"
                >
                  <Icon className="ml-2 h-5 w-5" /> {btnState.text}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}