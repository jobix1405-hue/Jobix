"use client";

import React from 'react';

// دیتای شرکت‌ها با تنظیمات اختصاصی رنگ و سایه برای هاور
const COMPANIES = [
  { 
    name: "دیجی‌کالا", 
    file: "digikala.png", 
    borderHover: "hover:border-rose-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(225,29,72,0.4)]",
    textColor: "text-rose-600"
  },
  { 
    name: "اسنپ", 
    file: "snapp.png", 
    borderHover: "hover:border-emerald-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.4)]",
    textColor: "text-emerald-600"
  },
  { 
    name: "کافه‌بازار", 
    file: "cafebazaar.png", 
    borderHover: "hover:border-teal-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(20,184,166,0.4)]",
    textColor: "text-teal-600"
  },
  { 
    name: "علی‌بابا", 
    file: "alibaba.png", 
    borderHover: "hover:border-amber-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(245,158,11,0.4)]",
    textColor: "text-amber-600"
  },
  { 
    name: "تپسی", 
    file: "tapsi.png", 
    borderHover: "hover:border-orange-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(249,115,22,0.4)]",
    textColor: "text-orange-600"
  },
  { 
    name: "بله", 
    file: "bale.png", 
    borderHover: "hover:border-green-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(34,197,94,0.4)]",
    textColor: "text-green-600"
  },
  { 
    name: "ایرانسل", 
    file: "irancell.png", 
    borderHover: "hover:border-yellow-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(250,204,21,0.4)]",
    textColor: "text-yellow-600"
  },
  { 
    name: "آپارات", 
    file: "aparat.png", 
    borderHover: "hover:border-pink-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(236,72,153,0.4)]",
    textColor: "text-pink-600"
  }
];

export const TopCompanies = () => {
  // برای ایجاد یک لوپ بی‌نهایت و بدون پرش، آرایه رو ۳ بار تکرار می‌کنیم
  const duplicatedCompanies = [...COMPANIES, ...COMPANIES, ...COMPANIES];

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#f8fafc] overflow-hidden border-b border-slate-100">
      
      {/* کدهای CSS اختصاصی برای انیمیشن ریل متحرک (Marquee) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100% / 3)); } /* چون سایت RTL است به سمت مثبت حرکت می‌کند */
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* هدر بخش (تیتر و زیرتیتر) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-sm font-bold shadow-sm mb-4">
          مورد اعتماد غول‌های فناوری
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          بیش از ۲۵۰۰ شرکت معتبر با جابیکس استخدام می‌کنند
        </h2>
      </div>

      {/* نوار متحرک شرکت‌ها */}
      <div className="relative w-full overflow-hidden flex items-center pt-4 pb-12">
        
        {/* گرادیانت‌های محو کننده چپ و راست (ایجاد حس تونل و عمق) */}
        <div className="absolute top-0 left-0 w-24 sm:w-40 h-full bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-24 sm:w-40 h-full bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none"></div>

        {/* کانتینر ریل متحرک */}
        <div className="flex animate-scroll gap-4 sm:gap-6 px-4" dir="rtl">
          {duplicatedCompanies.map((company, index) => (
            <div 
              key={index} 
              className={`
                group relative flex shrink-0 flex-col items-center justify-center cursor-pointer overflow-hidden
                h-32 w-32 sm:h-40 sm:w-40
                rounded-3xl border border-slate-200 bg-white 
                transition-all duration-300 ease-out
                hover:-translate-y-2 hover:bg-white hover:z-20
                ${company.borderHover} ${company.shadowHover}
              `}
            >
              {/* لوگوی شرکت */}
              <img 
                src={`/logos/${company.file}`} 
                alt={company.name} 
                className="max-h-12 max-w-[4rem] sm:max-h-16 sm:max-w-[5rem] object-contain transition-transform duration-300 ease-out group-hover:-translate-y-3 group-hover:scale-110"
                style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.05))' }}
              />
              
              {/* نام شرکت (در حالت هاور ظاهر می‌شود) */}
              <span className={`
                absolute bottom-4 sm:bottom-5 text-[10px] sm:text-xs font-extrabold tracking-tight
                opacity-0 translate-y-4 transition-all duration-300 ease-out
                group-hover:opacity-100 group-hover:translate-y-0
                ${company.textColor}
              `}>
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};