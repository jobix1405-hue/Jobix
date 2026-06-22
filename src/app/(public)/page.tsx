import Image from "next/image";
import Link from "next/link";
import { SearchBox } from "@/components/shared/SearchBox";
import { RoleCards } from "@/components/shared/RoleCards";
import { 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Building, 
  ChevronLeft,
  Code2,
  LineChart,
  PenTool,
  Calculator,
  Stethoscope,
  Megaphone,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// دیتای دسته‌بندی‌های شغلی
const CATEGORIES = [
  { icon: Code2, title: "برنامه‌نویسی و نرم‌افزار", count: "۱۲۴۰+ آگهی", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: LineChart, title: "فروش و بازاریابی", count: "۸۵۰+ آگهی", color: "text-green-600", bg: "bg-green-50" },
  { icon: PenTool, title: "طراحی و هنر", count: "۴۲۰+ آگهی", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Calculator, title: "مالی و حسابداری", count: "۳۱۰+ آگهی", color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Stethoscope, title: "پزشکی و سلامت", count: "۲۸۰+ آگهی", color: "text-teal-600", bg: "bg-teal-50" },
  { icon: Megaphone, title: "تولید محتوا", count: "۵۶۰+ آگهی", color: "text-rose-600", bg: "bg-rose-50" },
];

// دیتای شرکت‌های برتر (تستی برای نمایش در نوار اعتماد)
const TOP_COMPANIES = ["دیجی‌کالا", "اسنپ", "کافه‌بازار", "علی‌بابا", "تپسی", "همکاران‌سیستم", "ایرانسل"];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#f8fafc]">
      
      {/* =======================
          1. بخش Hero (بالای صفحه)
      ======================= */}
      <section className="relative flex w-full flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
        {/* هاله تزئینی پس‌زمینه */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-secondary/5 blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-[100px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 text-center lg:px-8">
          
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            هوشمندترین پلتفرم کاریابی و استخدام کشور
          </span>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            بازار هوشمند <span className="text-primary relative inline-block">
              استخدام ایران
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            بهترین فرصت‌های شغلی و برترین استعدادها در یک پلتفرم پیشرفته. با چند کلیک ساده رزومه بسازید و به شغل رویایی خود برسید.
          </p>

          <SearchBox />
          <RoleCards />
        </div>
      </section>

      {/* =======================
          2. نوار اعتماد (شرکت‌های برتر)
      ======================= */}
      <section className="w-full border-y border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-slate-400 shrink-0">استخدام در شرکت‌های معتبر:</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 opacity-50 grayscale transition-all hover:grayscale-0">
            {TOP_COMPANIES.map((company, index) => (
              <span key={index} className="text-lg font-extrabold text-slate-800 tracking-tight">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =======================
          3. دسته‌بندی‌های پرطرفدار
      ======================= */}
      <section className="w-full py-20 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">دسته‌بندی‌های پرطرفدار</h2>
              <p className="mt-2 text-slate-500">فرصت شغلی خود را بر اساس تخصص انتخاب کنید.</p>
            </div>
            <Link href="/jobs" className="hidden sm:flex items-center gap-1 text-primary font-bold hover:underline">
              مشاهده همه <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category, index) => (
              <Link key={index} href="/jobs" className="group flex items-center gap-4 rounded-3xl bg-white p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-1">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${category.bg} ${category.color} transition-colors group-hover:bg-primary group-hover:text-white`}>
                  <category.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{category.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{category.count}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/jobs" className="sm:hidden flex items-center justify-center gap-1 text-primary font-bold mt-8">
            مشاهده همه مشاغل <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* =======================
          4. بنر کارجو (تصویر ساخته شده)
      ======================= */}
      <section className="w-full py-16 sm:py-24 bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* متن و توضیحات */}
            <div className="order-2 lg:order-1">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 mb-6">
                ویژه کارجویان
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                مسیر شغلی رویایی خود را <br />
                <span className="text-primary">سریع‌تر پیدا کنید</span>
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                با ابزار رزومه‌ساز آنلاین جابیکس، در کمتر از ۵ دقیقه پروفایل حرفه‌ای خود را بسازید. سیستم مچینگ ما به صورت خودکار آگهی‌های مرتبط با مهارت‌های شما را پیشنهاد می‌دهد.
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  دسترسی به هزاران آگهی از شرکت‌های معتبر
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  پیگیری زنده وضعیت درخواست‌های شغلی
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  کاملاً رایگان برای تمام کارجویان
                </li>
              </ul>

              <div className="mt-10">
                <Link href="/job-seeker/resume">
                  <Button size="lg" className="rounded-xl px-8 h-14 shadow-lg shadow-primary/20 text-lg">
                    ساخت رزومه رایگان
                  </Button>
                </Link>
              </div>
            </div>

            {/* تصویر کارجو */}
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[3rem] transform rotate-3 scale-105"></div>
              <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="/seeker-banner.webp"
                  alt="کارجوی موفق در جابیکس"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* کارت شناور آماری */}
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">استخدام‌های موفق</p>
                  <p className="text-xl font-extrabold text-slate-900">+۱۲,۰۰۰ نفر</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =======================
          5. بنر کارفرما (تصویر ساخته شده)
      ======================= */}
      <section className="w-full py-16 sm:py-24 bg-slate-50 border-y border-slate-200 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* تصویر کارفرما */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-bl from-secondary/20 to-transparent rounded-[3rem] transform -rotate-3 scale-105"></div>
              <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="/employer-banner.webp"
                  alt="تیم منابع انسانی و مدیریت"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* کارت شناور آماری */}
              <div className="absolute -top-6 -right-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">بانک رزومه</p>
                  <p className="text-xl font-extrabold text-slate-900">+۱۵۰ هزار</p>
                </div>
              </div>
            </div>

            {/* متن و توضیحات */}
            <div className="">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-secondary text-sm font-bold border border-orange-100 mb-6">
                ویژه کارفرمایان
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                بهترین استعدادها را به <br />
                <span className="text-secondary">تیم خود اضافه کنید</span>
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                با سیستم پیشرفته ATS (مدیریت متقاضیان) جابیکس، رزومه‌ها را در یک برد کانبان تعاملی مدیریت کنید. زمان غربالگری را کاهش دهید و با یک کلیک نیروی ایده‌آل خود را بیابید.
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0" />
                  ثبت آگهی استخدام در کمتر از ۳ دقیقه
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0" />
                  فیلترینگ پیشرفته رزومه‌ها و سیستم امتیازدهی
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0" />
                  پشتیبانی اختصاصی شرکت‌ها
                </li>
              </ul>

              <div className="mt-10">
                <Link href="/employer/post-job">
                  <Button variant="secondary" size="lg" className="rounded-xl px-8 h-14 shadow-lg shadow-secondary/20 text-lg">
                    ثبت آگهی استخدام
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =======================
          6. آمار و ارقام (بهبود یافته)
      ======================= */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-12 text-center lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-100">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4 py-4">
              <dt className="text-base font-medium text-slate-500">کارجوی فعال</dt>
              <dd className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-3">
                <Users className="h-10 w-10 text-secondary/50" />
                +۵۰,۰۰۰
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4 py-4">
              <dt className="text-base font-medium text-slate-500">شرکت معتبر</dt>
              <dd className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-3">
                <Building className="h-10 w-10 text-secondary/50" />
                +۲,۵۰۰
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4 py-4">
              <dt className="text-base font-medium text-slate-500">آگهی استخدام موفق</dt>
              <dd className="text-4xl font-extrabold tracking-tight text-primary flex items-center justify-center gap-3">
                <TrendingUp className="h-10 w-10 text-secondary/50" />
                +۱۰,۰۰۰
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* =======================
          7. بخش نهایی (CTA) با بک‌گراند اختصاصی
      ======================= */}
      <section className="w-full relative py-28 overflow-hidden">
        {/* تصویر پس زمینه */}
        <Image
          src="/cta-bg.webp"
          alt="جابیکس"
          fill
          className="object-cover"
          quality={100}
        />
        {/* هاله رنگی روی عکس */}
        <div className="absolute inset-0 bg-primary/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent opacity-80"></div>

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            داستان موفقیت شغلی شما <br className="hidden sm:block" />
            از اینجا شروع می‌شود!
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100/80 leading-relaxed">
            همین حالا ثبت‌نام کنید و به جامعه بزرگ جابیکس بپیوندید. چه به دنبال شغل باشید، چه به دنبال استخدام نیرو، جابیکس همراه شماست.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-secondary text-white hover:bg-secondary/90 shadow-xl shadow-secondary/30 px-10 h-14 rounded-xl text-lg font-bold border-none">
                عضویت رایگان در جابیکس
              </Button>
            </Link>
            <Link href="/jobs" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white px-10 h-14 rounded-xl text-lg font-bold backdrop-blur-md">
                مشاهده آگهی‌های شغلی
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}