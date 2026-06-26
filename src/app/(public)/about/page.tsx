import { Metadata } from "next";
import Image from "next/image";
import { Target, Users, Zap, ShieldCheck, Briefcase, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "آشنایی با جابیکس، ماموریت ما و تیمی که پشت این پلتفرم هوشمند کاریابی است. جابیکس چگونه به کارجویان و کارفرمایان کمک می‌کند؟",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      
      {/* هدر صفحه (Hero) */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            داستان <span className="text-primary">جابیکس</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 animate-in fade-in slide-in-from-bottom-6 duration-700">
            ما در جابیکس بر این باوریم که پیدا کردن شغل ایده‌آل یا نیروی متخصص، نباید یک پروسه طولانی و خسته‌کننده باشد. هدف ما ایجاد یک پل هوشمند و سریع میان استعدادها و فرصت‌هاست.
          </p>
        </div>
      </section>

      {/* بخش آمار و ارقام */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 -mt-10 relative z-10">
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-in zoom-in-95 duration-700">
          <div className="space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 mt-4">+۵۰,۰۰۰</h3>
            <p className="font-medium text-slate-500">کارجوی فعال</p>
          </div>
          <div className="space-y-2 border-y md:border-y-0 md:border-x border-slate-100 py-6 md:py-0">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-secondary">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 mt-4">+۲,۵۰۰</h3>
            <p className="font-medium text-slate-500">شرکت معتبر</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 mt-4">+۱۰,۰۰۰</h3>
            <p className="font-medium text-slate-500">استخدام موفق</p>
          </div>
        </div>
      </section>

      {/* بخش ارزش‌های کلیدی */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">ارزش‌های کلیدی ما</h2>
          <p className="mt-4 text-slate-500">مواردی که جابیکس را از سایر پلتفرم‌ها متمایز می‌کند.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <Target className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">تطابق هوشمند (AI)</h3>
            <p className="text-slate-600 leading-relaxed text-justify">
              سیستم هوشمند جابیکس رزومه‌ها را آنالیز کرده و بر اساس کلمات کلیدی و مهارت‌ها، دقیق‌ترین آگهی‌ها را به کارجو و بهترین کارجویان را به کارفرما پیشنهاد می‌دهد.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">سرعت و سادگی</h3>
            <p className="text-slate-600 leading-relaxed text-justify">
              رابط کاربری جابیکس بر اساس آخرین استانداردهای تجربه کاربری طراحی شده تا پروسه ساخت رزومه و ثبت آگهی در کمتر از چند دقیقه انجام شود.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">امنیت و اعتماد</h3>
            <p className="text-slate-600 leading-relaxed text-justify">
              تمامی شرکت‌های فعال در جابیکس احراز هویت می‌شوند و داده‌های حساس کاربران با بالاترین پروتکل‌های امنیتی در سرورهای ما محافظت می‌گردند.
            </p>
          </div>
        </div>
      </section>

      {/* بخش پیام پایانی */}
      <section className="mx-auto max-w-4xl px-6 lg:px-8 pb-10 text-center">
        <div className="rounded-3xl bg-primary text-white p-10 sm:p-16 relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold sm:text-4xl">آماده‌اید تا شروع کنیم؟</h2>
            <p className="mt-4 text-lg text-primary-100 mb-8">
              به جمع ده‌ها هزار کارجو و کارفرمای جابیکس بپیوندید و مسیر حرفه‌ای خود را متحول کنید.
            </p>
            <a href="/login" className="inline-block bg-white text-primary font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
              عضویت رایگان در جابیکس
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}