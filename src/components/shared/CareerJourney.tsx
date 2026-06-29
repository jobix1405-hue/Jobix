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
    bgGlow: "bg-blue-400/20"
  },
  {
    id: 2,
    title: "آموزش مهارت‌های کاربردی",
    desc: "یادگیری مهارت‌های مورد نیاز و ترند بازار کار",
    icon: BookOpen,
    image: "step-2.png",
    color: "text-orange-600",
    bgGlow: "bg-orange-400/20"
  },
  {
    id: 3,
    title: "ارتقای شغلی و آمادگی",
    desc: "کسب آمادگی لازم برای تصاحب فرصت‌های بهتر",
    icon: TrendingUp,
    image: "step-3.png",
    color: "text-emerald-600",
    bgGlow: "bg-emerald-400/20"
  },
  {
    id: 4,
    title: "معرفی به بازار کار",
    desc: "اتصال مستقیم به معتبرترین شرکت‌های ایران",
    icon: Briefcase,
    image: "step-4.png",
    color: "text-purple-600",
    bgGlow: "bg-purple-400/20"
  }
];

export function CareerJourney() {
  return (
    <section className="relative w-full py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* متن‌های سمت راست */}
          <div className="w-full lg:w-1/3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 mb-6">
              آکادمی و مسیر شغلی جابیکس
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              از یادگیری تا استخدام <br />
              <span className="text-primary">و رشد شغلی</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed text-justify">
              جابیکس تنها یک سایت کاریابی نیست! ما در تمام مسیر حرفه‌ای کنار شما هستیم. از کشف استعدادها تا یادگیری مهارت‌های جدید و در نهایت استخدام در بهترین شرکت‌ها.
            </p>
            
            <div className="mt-10">
              <Link href="/job-seeker/academy" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                شروع مسیر موفقیت <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* کارت‌های مسیر سمت چپ */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            
            {/* خط اتصال بین کارت‌ها (فقط دسکتاپ) */}
            <div className="hidden sm:block absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div className="hidden sm:block absolute left-1/2 top-10 bottom-10 w-0.5 bg-slate-100 -translate-x-1/2 z-0"></div>

            {STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className={`relative z-10 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 group ${
                  index % 2 !== 0 ? 'sm:mt-12' : '' // ایجاد حالت پله‌ای
                }`}
              >
                <div className="absolute -top-4 -right-4 text-[100px] font-extrabold text-slate-50 opacity-50 pointer-events-none select-none font-sans z-0">
                  {step.id}
                </div>
                
                <div className="relative z-10 flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0">
                    <div className={`absolute inset-0 ${step.bgGlow} blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <img 
                      src={`/steps/${step.image}`} 
                      alt={step.title}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
                      onError={(e) => {
                        // فال‌بک موقت تا زمانی که عکس‌ها رو بسازید
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-slate-50', 'rounded-2xl', 'flex', 'items-center', 'justify-center', 'border', 'border-slate-100');
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* آیکون جایگزین در صورتی که عکس 3D هنوز لود نشده باشه */}
                    <step.icon className={`hidden h-8 w-8 ${step.color} m-auto`} />
                  </div>

                  <div className="pt-2">
                    <h3 className={`text-lg font-bold text-slate-900 mb-1 group-hover:${step.color} transition-colors`}>{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed text-justify">{step.desc}</p>
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