import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "تعرفه‌ها و خدمات",
  description: "مشاهده تعرفه‌ها و بسته‌های درج آگهی استخدام در جابیکس. با کمترین هزینه، بهترین استعدادها را استخدام کنید.",
};

// دریافت اطلاعات به صورت Server-Side Rendering
async function getPackages() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  return data || [];
}

export default async function PublicPricingPage() {
  const packages = await getPackages();

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      
      <div className="text-center mb-12 px-6">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 mb-4">
          ویژه کارفرمایان
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-5xl tracking-tight mb-4">
          سرمایه‌گذاری روی <span className="text-primary">استعدادها</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          با انتخاب یکی از بسته‌های زیر، آگهی شغلی خود را در دید هزاران کارجوی متخصص قرار دهید و تیم خود را سریع‌تر بسازید.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8 mt-16">
        {/* نمایش پکیج‌ها */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center">
          {packages.length > 0 ? packages.map((pkg, index) => {
            const isPopular = index === 1;

            return (
              <div 
                key={pkg.id} 
                className={`relative flex flex-col rounded-3xl bg-white p-8 transition-all duration-300 ${
                  isPopular 
                    ? "border-2 border-primary shadow-2xl shadow-primary/10 scale-100 md:scale-105 z-10" 
                    : "border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-primary py-1 text-center text-xs font-bold text-white shadow-sm">
                    مقرون به صرفه
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${isPopular ? "text-primary" : "text-slate-900"}`}>
                    {pkg.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed min-h-[40px]">
                    {pkg.description}
                  </p>
                </div>

                <div className="mb-8 flex items-baseline text-slate-900">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {(pkg.price / 10).toLocaleString('fa-IR')}
                  </span>
                  <span className="ml-1 text-sm font-semibold text-slate-500">تومان</span>
                </div>

                <ul className="mb-8 flex-1 space-y-4 text-sm text-slate-600">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    امکان ثبت <strong className="text-slate-900">{pkg.job_count} آگهی</strong> شغلی
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    اعتبار بسته تا <strong className="text-slate-900">{pkg.duration_days} روز</strong>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    دسترسی به سیستم مدیریت رزومه (ATS)
                  </li>
                </ul>

                <Link href="/employer/packages" className="w-full">
                  <button className={`w-full h-12 rounded-xl text-base font-bold transition-colors ${
                    isPopular 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" 
                      : "border-2 border-slate-200 text-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary"
                  }`}>
                    خرید و فعال‌سازی
                  </button>
                </Link>
              </div>
            );
          }) : (
            <div className="col-span-3 text-center py-20 text-slate-500">
              در حال حاضر تعرفه‌ای ثبت نشده است.
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-3xl bg-white p-8 border border-slate-200 shadow-sm text-center sm:text-right">
          <div className="h-16 w-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 border border-green-100">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">پرداخت امن از طریق درگاه شاپرک</h4>
            <p className="text-slate-500 mt-2 leading-relaxed">
              تمامی پرداخت‌های جابیکس از طریق درگاه‌های امن بانکی کشور انجام شده و بلافاصله پس از پرداخت موفق، سهمیه آگهی شما در پنل کاربری شارژ خواهد شد.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}