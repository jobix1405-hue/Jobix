import Link from "next/link";
import { SearchBox } from "@/components/shared/SearchBox";
import { RoleCards } from "@/components/shared/RoleCards";
import { CheckCircle2, TrendingUp, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      
      {/* =======================
          بخش Hero (بالای صفحه)
      ======================= */}
      <section className="relative flex w-full flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
        {/* هاله تزئینی پس‌زمینه */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-secondary/5 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-40 right-0 h-[24rem] w-[24rem] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 text-center lg:px-8">
          
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            هوشمندترین پلتفرم استخدام کشور
          </span>

          {/* شعار اصلی برگشت با استایل مدرن‌تر */}
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            بازار هوشمند <span className="text-primary">استخدام ایران</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            بهترین فرصت‌های شغلی و برترین استعدادها در یک پلتفرم هوشمند. با چند کلیک رزومه بسازید و استخدام شوید.
          </p>

          <SearchBox />
          <RoleCards />
        </div>
      </section>

      {/* =======================
          بخش آمار و ارقام
      ======================= */}
      <section className="w-full bg-white border-y border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-600">کارجوی فعال</dt>
              <dd className="order-first text-3xl font-extrabold tracking-tight text-primary sm:text-5xl flex items-center justify-center gap-2">
                <Users className="h-8 w-8 text-secondary/80" />
                +۵۰,۰۰۰
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-600">شرکت معتبر</dt>
              <dd className="order-first text-3xl font-extrabold tracking-tight text-primary sm:text-5xl flex items-center justify-center gap-2">
                <Building className="h-8 w-8 text-secondary/80" />
                +۲,۵۰۰
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-600">آگهی استخدام موفق</dt>
              <dd className="order-first text-3xl font-extrabold tracking-tight text-primary sm:text-5xl flex items-center justify-center gap-2">
                <TrendingUp className="h-8 w-8 text-secondary/80" />
                +۱۰,۰۰۰
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* =======================
          بخش معرفی ویژگی‌ها
      ======================= */}
      <section className="w-full py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              چرا جابیکس بهترین انتخاب است؟
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              ما فرآیند استخدام را برای کارجویان و کارفرمایان سریع‌تر، هوشمندتر و هدفمندتر کرده‌ایم.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* ویژگی ۱ */}
              <div className="flex flex-col rounded-3xl bg-white p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <dt className="flex items-center gap-x-3 text-lg font-bold text-slate-900">
                  <CheckCircle2 className="h-6 w-6 text-secondary flex-none" aria-hidden="true" />
                  رزومه‌ساز هوشمند
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    با چند کلیک ساده، یک رزومه حرفه‌ای و استاندارد بسازید و به راحتی برای ده‌ها موقعیت شغلی ارسال کنید.
                  </p>
                </dd>
              </div>
              {/* ویژگی ۲ */}
              <div className="flex flex-col rounded-3xl bg-white p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <dt className="flex items-center gap-x-3 text-lg font-bold text-slate-900">
                  <CheckCircle2 className="h-6 w-6 text-secondary flex-none" aria-hidden="true" />
                  الگوریتم تطابق (AI)
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    سیستم هوشمند ما رزومه شما را با نیازهای کارفرما تطبیق داده و درصد شانس استخدام شما را محاسبه می‌کند.
                  </p>
                </dd>
              </div>
              {/* ویژگی ۳ */}
              <div className="flex flex-col rounded-3xl bg-white p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <dt className="flex items-center gap-x-3 text-lg font-bold text-slate-900">
                  <CheckCircle2 className="h-6 w-6 text-secondary flex-none" aria-hidden="true" />
                  پنل مدیریت پیشرفته (ATS)
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">
                    کارفرمایان می‌توانند تمامی رزومه‌های دریافتی را در یک برد کانبان (Kanban) به سادگی مدیریت و فیلتر کنند.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* =======================
          بخش دعوت به اقدام (CTA)
      ======================= */}
      <section className="w-full bg-primary py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            آماده‌اید تا مسیر شغلی خود را متحول کنید؟
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100 text-white/80">
            همین حالا ثبت‌نام کنید و به جامعه بزرگ جابیکس بپیوندید.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/login">
              <Button size="lg" className="bg-white text-primary hover:bg-slate-100 shadow-xl px-8 h-14 rounded-full text-lg font-bold">
                عضویت رایگان در جابیکس
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}