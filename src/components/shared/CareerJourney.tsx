// مسیر فایل: src/components/shared/CareerJourney.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, BookOpen, TrendingUp, Briefcase } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: "طراحی مسیر شغلی",
    desc: "متناسب با استعداد و توانمندی‌های فردی شما",
    icon: Target,
    image: "step-1.png",
    color: "text-blue-600",
    bgGlow: "bg-blue-400/20",
    borderGlow: "group-hover:border-blue-300",
    shadowGlow: "hover:shadow-blue-500/10",
    accentBg: "bg-blue-500"
  },
  {
    id: 2,
    title: "آموزش مهارت‌های کاربردی",
    desc: "یادگیری مهارت‌های مورد نیاز و ترند بازار کار",
    icon: BookOpen,
    image: "step-2.png",
    color: "text-orange-600",
    bgGlow: "bg-orange-400/20",
    borderGlow: "group-hover:border-orange-300",
    shadowGlow: "hover:shadow-orange-500/10",
    accentBg: "bg-orange-500"
  },
  {
    id: 3,
    title: "ارتقای شغلی و آمادگی",
    desc: "کسب آمادگی لازم برای تصاحب فرصت‌های بهتر",
    icon: TrendingUp,
    image: "step-3.png",
    color: "text-emerald-600",
    bgGlow: "bg-emerald-400/20",
    borderGlow: "group-hover:border-emerald-300",
    shadowGlow: "hover:shadow-emerald-500/10",
    accentBg: "bg-emerald-500"
  },
  {
    id: 4,
    title: "معرفی به بازار کار",
    desc: "اتصال مستقیم به معتبرترین شرکت‌های ایران",
    icon: Briefcase,
    image: "step-4.png",
    color: "text-purple-600",
    bgGlow: "bg-purple-400/20",
    borderGlow: "group-hover:border-purple-300",
    shadowGlow: "hover:shadow-purple-500/10",
    accentBg: "bg-purple-500"
  }
];

export function CareerJourney() {
  return (
    <section className="relative w-full py-24 bg-slate-50 overflow-hidden border-t border-slate-200">
      
      {/* پترن نقطه‌ای پس‌زمینه برای ایجاد حس فنی و مهندسی */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#0f172a 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
      
      {/* هاله‌های نوری (Glow) در پس‌زمینه برای خروج از حالت بی‌روح */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* متن‌های سمت راست */}
          <div className="w-full lg:w-1/3 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-primary text-sm font-bold border border-primary/20 shadow-sm mb-6">
              آکادمی و مسیر شغلی جابیکس
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              از یادگیری تا استخدام <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">و رشد شغلی</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed text-justify">
              جابیکس تنها یک پلتفرم کاریابی نیست! ما در تمام مسیر حرفه‌ای کنار شما هستیم. از کشف استعدادها تا یادگیری مهارت‌های جدید و در نهایت اتصال مستقیم به بهترین شرکت‌های خاورمیانه.
            </p>
            
            <div className="mt-10">
              <Link href="/job-seeker/academy" className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1">
                شروع مسیر موفقیت 
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>

          {/* کارت‌های مسیر سمت چپ */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 relative">
            
            {/* خطوط اتصال خط‌چین بین کارت‌ها (نماد مسیر و راه) */}
            <div className="hidden sm:block absolute top-1/2 left-10 right-10 h-0 border-t-2 border-dashed border-slate-300/60 -translate-y-1/2 z-0"></div>
            <div className="hidden sm:block absolute left-1/2 top-10 bottom-10 w-0 border-l-2 border-dashed border-slate-300/60 -translate-x-1/2 z-0"></div>

            {STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className={`relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm transition-all duration-500 hover:-translate-y-2 group overflow-hidden ${step.borderGlow} ${step.shadowGlow} ${
                  index % 2 !== 0 ? 'sm:mt-16' : '' // ایجاد حالت پله‌ای جذاب
                }`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                {/* نوار رنگی اختصاصی سمت راست هر کارت */}
                <div className={`absolute top-0 right-0 w-1.5 h-full ${step.accentBg} opacity-80 group-hover:opacity-100 transition-opacity`}></div>

                {/* عدد غول‌پیکر محو در پس‌زمینه */}
                <div className={`absolute -top-4 -left-4 text-[120px] font-black ${step.color} opacity-5 pointer-events-none select-none font-sans z-0 group-hover:opacity-10 group-hover:-translate-y-2 transition-all duration-500`}>
                  {step.id}
                </div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
                  {/* بخش آیکون / عکس */}
                  <div className="relative h-20 w-20 shrink-0">
                    <div className={`absolute inset-0 ${step.bgGlow} blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <img 
                      src={`/steps/${step.image}`} 
                      alt={step.title}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md relative z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-slate-50', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'border', 'border-slate-100');
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* آیکون جایگزین */}
                    <step.icon className={`hidden h-8 w-8 ${step.color} m-auto relative z-10`} />
                  </div>

                  {/* بخش متن */}
                  <div className="pt-1">
                    <span className={`inline-block text-xs font-black tracking-widest uppercase mb-2 ${step.color} opacity-80`}>
                      گام ۰{step.id}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed text-justify">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          </div>

        </div>
      </div>
    </section>
  );
}