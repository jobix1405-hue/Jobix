"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';

export function Header() {
  const { user, isAuthLoading } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // لینک‌های منوی ناوبری سایت
  const navLinks = [
    { name: 'جستجوی مشاغل', href: '/jobs' },
    { name: 'شرکت‌های برتر', href: '/companies' },
    { name: 'تعرفه‌ها', href: '/pricing' },
    { name: 'درباره ما', href: '/about' },
  ];

  // 🔥 فیکس جدید: تعیین مسیر صحیح برای دکمه پنل
  const getPanelUrl = () => {
    if (!user?.role) return '/onboarding';
    if (user.role === 'employer') return '/employer';
    if (user.role === 'admin') return '/admin';
    return '/job-seeker';
  };

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
            {isAuthLoading ? (
              <div className="h-10 w-36 rounded-full bg-slate-200 animate-pulse"></div>
            ) : user ? (
              <Link href={getPanelUrl()}>
                <Button 
                  variant="outline" 
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-all duration-200 border-primary/20 hover:border-primary hover:bg-primary/5 hover:shadow-md"
                >
                  <LayoutDashboard className="ml-2 h-4 w-4" aria-hidden="true" />
                  پنل کاربری
                </Button>
              </Link>
            ) : (
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
             {isAuthLoading ? (
              <div className="h-12 w-full rounded-full bg-slate-200 animate-pulse"></div>
            ) : user ? (
              <Link href={getPanelUrl()} onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full h-12 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white border-0 shadow-none">
                  <LayoutDashboard className="ml-2 h-5 w-5" /> ورود به پنل کاربری
                </Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full h-12 rounded-full bg-secondary text-white hover:bg-secondary/90 border-0 shadow-lg shadow-secondary/20">
                  <LogIn className="ml-2 h-5 w-5" /> ورود / ثبت‌نام در جابیکس
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}