// مسیر فایل: src/components/shared/PopularCategories.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";

// دیتای دسته‌بندی‌ها: به جای کدهای SVG، فقط اسم فایل‌های 3D را می‌دهیم
const CATEGORIES = [
  { 
    id: "software",
    title: "برنامه‌نویسی و نرم‌افزار", 
    desc: "توسعه وب، موبایل، هوش مصنوعی و شبکه",
    count: "۱۲۴۰+", 
    color: "blue",
    iconFile: "software.png"
  },
  { 
    id: "marketing",
    title: "فروش و بازاریابی", 
    desc: "دیجیتال مارکتینگ، سئو، فروش و تبلیغات",
    count: "۸۵۰+", 
    color: "orange",
    iconFile: "marketing.png"
  },
  { 
    id: "design",
    title: "طراحی و هنر", 
    desc: "رابط کاربری (UI/UX)، گرافیک و انیمیشن",
    count: "۴۲۰+", 
    color: "purple",
    iconFile: "design.png"
  },
  { 
    id: "finance",
    title: "مالی و حسابداری", 
    desc: "حسابداری، حسابرسی، تحلیل مالی و بورس",
    count: "۳۱۰+", 
    color: "emerald",
    iconFile: "finance.png"
  },
  { 
    id: "health",
    title: "پزشکی و سلامت", 
    desc: "پرستاری، داروسازی، روانشناسی و مشاوره",
    count: "۲۸۰+", 
    color: "rose",
    iconFile: "health.png"
  },
  { 
    id: "content",
    title: "تولید محتوا", 
    desc: "کپی‌رایتینگ، تدوین ویدیو، پادکست و ترجمه",
    count: "۵۶۰+", 
    color: "cyan",
    iconFile: "content.png"
  },
];

// مدیریت رنگ‌های هاله نور و بک‌گراند برای هر کارت
const colorMap: Record<string, { bgGlow: string, text: string, hoverBg: string, lightBg: string }> = {
  blue: { bgGlow: "bg-blue-400", text: "text-blue-600", hoverBg: "group-hover:bg-blue-600", lightBg: "bg-blue-50/50" },
  orange: { bgGlow: "bg-orange-400", text: "text-orange-600", hoverBg: "group-hover:bg-orange-600", lightBg: "bg-orange-50/50" },
  purple: { bgGlow: "bg-purple-400", text: "text-purple-600", hoverBg: "group-hover:bg-purple-600", lightBg: "bg-purple-50/50" },
  emerald: { bgGlow: "bg-emerald-400", text: "text-emerald-600", hoverBg: "group-hover:bg-emerald-600", lightBg: "bg-emerald-50/50" },
  rose: { bgGlow: "bg-rose-400", text: "text-rose-600", hoverBg: "group-hover:bg-rose-600", lightBg: "bg-rose-50/50" },
  cyan: { bgGlow: "bg-cyan-400", text: "text-cyan-600", hoverBg: "group-hover:bg-cyan-600", lightBg: "bg-cyan-50/50" },
};

export const PopularCategories = () => {
  return (
    <section className="relative w-full py-24 bg-[#f8fafc] overflow-hidden">
      {/* پترن نقطه‌ای پس‌زمینه برای ایجاد حس مدرن و مهندسی */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* هدر بخش */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="text-center sm:text-right">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">کشف فرصت‌ها بر اساس تخصص</h2>
            <p className="mt-3 text-slate-500 text-lg">مسیر شغلی رویایی خود را از میان پرمخاطب‌ترین حوزه‌ها پیدا کنید.</p>
          </div>
          <Link href="/jobs" className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 shadow-sm hover:border-primary hover:text-primary transition-all">
            مشاهده همه مشاغل 
            <ArrowUpLeft className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5" />
          </Link>
        </div>

        {/* گرید کارت‌ها */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => {
            const theme = colorMap[category.color];

            return (
              <Link 
                key={category.id} 
                href={`/jobs?q=${category.id}`} 
                className="group relative flex flex-col justify-between rounded-[2rem] bg-white p-6 sm:p-8 border border-slate-200/70 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:border-transparent z-10"
              >
                {/* بک‌گراند هاور اختصاصی هر کارت (یک گرادیانت بسیار ملایم) */}
                <div className={`absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-500 pointer-events-none group-hover:opacity-100 bg-gradient-to-br ${theme.lightBg} to-white`}></div>
                
                <div className="relative z-20">
                  <div className="flex items-start justify-between mb-8">
                    
                    {/* بخش رندر عکس‌های 3D با افکت درخشش و سایه */}
                    <div className="relative">
                      {/* هاله نور (Glow) که در زیر عکس قرار دارد و با هاور پررنگ و بزرگ می‌شود */}
                      <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-60 transition-all duration-500 ${theme.bgGlow} scale-[1.3]`}></div>
                      
                      {/* کانتینر عکس 3D */}
                      <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-[1.5rem] bg-white border border-slate-100/50 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-md z-10">
                        {/* 
                          تصویر 3D: استفاده از h-full w-full برای پوشش کامل کادر.
                          با هاور مقیاس ۱۱۵ درصد می‌گیرد تا حالت بیرون پریدن (Pop-out) پیدا کند.
                        */}
                        <img 
                          src={`/categories/${category.iconFile}`} 
                          alt={category.title} 
                          className="h-full w-full p-1.5 sm:p-2 object-contain transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.15]"
                          style={{ filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.15))' }}
                        />
                      </div>
                    </div>

                    {/* فلش هدایتگر */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 text-slate-300 transition-all duration-500 group-hover:border-transparent group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-md">
                      <ArrowUpLeft className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 transition-colors">{category.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed min-h-[40px]">
                    {category.desc}
                  </p>
                </div>

                {/* فوتر کارت */}
                <div className="relative z-20 mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                    فرصت‌های فعال
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-all duration-500 bg-slate-100 text-slate-600 group-hover:bg-white group-hover:${theme.text} group-hover:shadow-sm`}>
                    {category.count} آگهی
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};