"use client";

import React from 'react';

// دیتای شرکت‌ها: (دقیقاً ۸ شرکت برای تقارن کامل در موبایل و دسکتاپ)
// رنگ متن، سایه و هاله نوری اختصاصی برای هر برند به صورت دقیق تنظیم شده است.
const COMPANIES = [
  { 
    name: "دیجی‌کالا", 
    file: "digikala.png", 
    borderHover: "hover:border-rose-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(225,29,72,0.4)]",
    bgHover: "from-rose-50/50 to-white",
    textColor: "text-rose-600"
  },
  { 
    name: "اسنپ", 
    file: "snapp.png", 
    borderHover: "hover:border-emerald-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.4)]",
    bgHover: "from-emerald-50/50 to-white",
    textColor: "text-emerald-600"
  },
  { 
    name: "کافه‌بازار", 
    file: "cafebazaar.png", 
    borderHover: "hover:border-teal-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(20,184,166,0.4)]",
    bgHover: "from-teal-50/50 to-white",
    textColor: "text-teal-600"
  },
  { 
    name: "علی‌بابا", 
    file: "alibaba.png", 
    borderHover: "hover:border-amber-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(245,158,11,0.4)]",
    bgHover: "from-amber-50/50 to-white",
    textColor: "text-amber-600"
  },
  { 
    name: "تپسی", 
    file: "tapsi.png", 
    borderHover: "hover:border-orange-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(249,115,22,0.4)]",
    bgHover: "from-orange-50/50 to-white",
    textColor: "text-orange-600"
  },
  { 
    name: "بله", 
    file: "bale.png", 
    borderHover: "hover:border-green-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(34,197,94,0.4)]",
    bgHover: "from-green-50/50 to-white",
    textColor: "text-green-600"
  },
  { 
    name: "ایرانسل", 
    file: "irancell.png", 
    borderHover: "hover:border-yellow-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(250,204,21,0.4)]",
    bgHover: "from-yellow-50/50 to-white",
    textColor: "text-yellow-600"
  },
  { 
    name: "آپارات", 
    file: "aparat.png", // 🔥 فایل aparat.png را هم به پوشه logos اضافه کنید
    borderHover: "hover:border-pink-300",
    shadowHover: "hover:shadow-[0_15px_40px_-10px_rgba(236,72,153,0.4)]",
    bgHover: "from-pink-50/50 to-white",
    textColor: "text-pink-600"
  }
];

export const TopCompanies = () => {
  return (
    <section className="relative w-full py-20 bg-[#f8fafc] overflow-hidden">
      
      {/* انیمیشن شیشه‌ای درخشان */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 125%; }
        }
        .animate-shine {
          animation: shine 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* =========================================
            ۱. بنر فوق‌حرفه‌ای و لوکس بالای کارت‌ها
            ========================================= */}
        <div className="relative w-full rounded-[2.5rem] bg-primary overflow-hidden shadow-2xl shadow-primary/20 mb-12 sm:mb-16">
          {/* پترن و هاله‌های نور روی بنر */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-400/30 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/30 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative px-6 py-12 sm:py-16 text-center flex flex-col items-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs sm:text-sm font-bold tracking-widest backdrop-blur-sm mb-6">
              بـرتـریـن شـرکـت‌هـای ایـران
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              مورد اعتماد <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-400">غول‌های فناوری</span>
            </h2>
            <p className="text-blue-100/80 max-w-2xl text-sm sm:text-base leading-relaxed">
              بیش از ۲۵۰۰ شرکت معتبر، فرآیند جذب و استخدام نخبگان خود را به پلتفرم هوشمند جابیکس سپرده‌اند. شما هم به جمع بهترین‌ها بپیوندید.
            </p>
          </div>
        </div>

        {/* =========================================
            ۲. گرید متقارن و بی‌نقص (Grid System)
            ========================================= */}
        {/* کلاس grid باعث می‌شود کارت‌ها دقیقاً زیر هم قرار بگیرند */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {COMPANIES.map((company, index) => (
            <div 
              key={index} 
              className={`
                group relative flex flex-col items-center justify-center cursor-pointer overflow-hidden
                h-36 sm:h-44 lg:h-48 w-full
                rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 bg-white 
                shadow-sm transition-all duration-500 ease-out
                hover:-translate-y-2 hover:bg-white 
                ${company.borderHover} ${company.shadowHover}
              `}
            >
              {/* بک‌گراند هاور اختصاصی */}
              <div className={`absolute inset-0 bg-gradient-to-br ${company.bgHover} opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none`}></div>
              
              {/* افکت شیشه‌ای */}
              <div className="absolute top-0 -left-[100%] z-10 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine pointer-events-none"></div>

              {/* کانتینر تصویر و متن */}
              <div className="relative z-20 flex h-full w-full flex-col items-center justify-center p-4 sm:p-6">
                
                {/* 
                  تصویر بسیار بزرگتر شد. 
                  با هاور، آیکون هم بزرگتر میشه (scale-110) و هم به سمت بالا پرتاب میشه (-translate-y-4)
                */}
                <img 
                  src={`/logos/${company.file}`} 
                  alt={company.name} 
                  className="
                    max-h-16 sm:max-h-20 lg:max-h-24 w-auto object-contain 
                    transition-all duration-500 ease-out 
                    group-hover:-translate-y-4 sm:group-hover:-translate-y-5 group-hover:scale-110
                  "
                  style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.08))' }}
                />

                {/* 
                  نام شرکت (در حالت عادی مخفی و پایین است)
                  با هاور شدن کارت، از پایین به سمت بالا حرکت کرده و ظاهر می‌شود.
                */}
                <span className={`
                  absolute bottom-4 sm:bottom-6 text-sm sm:text-base font-extrabold tracking-tight
                  opacity-0 translate-y-6 transition-all duration-500 ease-out
                  group-hover:opacity-100 group-hover:translate-y-0
                  ${company.textColor}
                `}>
                  {company.name}
                </span>

              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};