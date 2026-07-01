"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle2, ShieldCheck, Loader2, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  job_count: number;
  duration_days: number;
}

function PackagesContent() {
  const supabase = createClient();
  const { user } = useStore();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // واکشی پکیج‌های فعال از دیتابیس
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;
        setPackages(data || []);
      } catch (err) {
        console.error("خطا در دریافت تعرفه‌ها:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, [supabase]);

  // هندلر دکمه پرداخت (ارسال به API بک‌اند)
  const handlePayment = async () => {
    if (!user?.id || !selectedPackage) return;
    setIsProcessing(true);

    try {
      // ارسال درخواست به بک‌اندی که خودمون ساختیم
      const res = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId: selectedPackage.id }),
      });

      const data = await res.json();

      if (data.url) {
        // هدایت کاربر به درگاه پرداخت (یا لینک شبیه‌ساز)
        window.location.href = data.url;
      } else {
        alert(data.error || "خطا در اتصال به درگاه پرداخت");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("خطا در عملیات پرداخت:", err);
      alert("خطایی در ارتباط با سرور رخ داد.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-medium">در حال بارگذاری تعرفه‌ها...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 pb-6">
      
      {/* پیام خطای بازگشت از درگاه */}
      {paymentStatus === 'failed' && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 animate-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5" />
          پرداخت ناموفق بود یا توسط شما لغو شد. لطفاً دوباره تلاش کنید.
        </div>
      )}

      {paymentStatus === 'invalid' && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 animate-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5" />
          تراکنش نامعتبر است.
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-600 border border-orange-100 animate-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5" />
          خطایی در بررسی تراکنش رخ داد. در صورت کسر وجه، مبلغ تا ۷۲ ساعت آینده به حساب شما بازمی‌گردد.
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          تعرفه‌های ثبت آگهی استخدام
        </h1>
        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
          با انتخاب یکی از بسته‌های زیر، آگهی شغلی خود را منتشر کنید و بهترین استعدادها را به تیم خود اضافه کنید.
        </p>
      </div>

      {/* نمایش پکیج‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-center">
        {packages.map((pkg, index) => {
          const isPopular = index === 1;

          return (
            <div 
              key={pkg.id} 
              className={`relative flex flex-col rounded-3xl bg-white p-6 transition-all duration-300 ${
                isPopular 
                  ? "border-2 border-primary shadow-xl shadow-primary/10 scale-100 md:scale-105 z-10" 
                  : "border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-primary py-1 text-center text-xs font-bold text-white shadow-sm">
                  مقرون به صرفه
                </div>
              )}

              <div className="mb-4">
                <h3 className={`text-xl font-bold ${isPopular ? "text-primary" : "text-slate-900"}`}>
                  {pkg.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed min-h-[40px]">
                  {pkg.description}
                </p>
              </div>

              <div className="mb-6 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">
                  {(pkg.price / 10).toLocaleString('fa-IR')}
                </span>
                <span className="ml-1 text-sm font-semibold text-slate-500">تومان</span>
              </div>

              <ul className="mb-6 flex-1 space-y-4 text-sm text-slate-600">
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
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  پشتیبانی اختصاصی کارفرمایان
                </li>
              </ul>

              <Button 
                variant={isPopular ? "primary" : "outline"}
                className={`w-full h-12 rounded-xl text-base ${isPopular ? "shadow-lg shadow-primary/20" : "border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary"}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                خرید این بسته
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-start gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
        <ShieldCheck className="h-8 w-8 text-green-600 shrink-0" />
        <div>
          <h4 className="font-bold text-slate-900">پرداخت امن و تضمین شده</h4>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            تمامی تراکنش‌های جابیکس از طریق درگاه‌های امن بانکی (شاپرک) انجام می‌شود. بلافاصله پس از پرداخت، سهمیه آگهی به حساب شما اضافه خواهد شد.
          </p>
        </div>
      </div>

      {/* مودال تایید انتقال به درگاه پرداخت */}
      <Modal 
        isOpen={!!selectedPackage} 
        onClose={() => !isProcessing && setSelectedPackage(null)}
        title="تایید و انتقال به درگاه"
      >
        {selectedPackage && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-600 text-sm">بسته انتخابی:</span>
                <span className="font-bold text-slate-900">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-600 text-sm">تعداد آگهی مجاز:</span>
                <span className="font-bold text-slate-900">{selectedPackage.job_count} عدد</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-slate-600 font-medium">مبلغ قابل پرداخت:</span>
                <span className="text-xl font-extrabold text-primary">
                  {(selectedPackage.price / 10).toLocaleString('fa-IR')} <span className="text-sm font-medium">تومان</span>
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 flex items-start gap-2 border border-blue-100 text-blue-800">
              <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" />
              <p className="text-xs leading-relaxed">
                در حال حاضر به دلیل عدم اتصال درگاه بانکی اصلی (فاز توسعه)، با کلیک روی دکمه زیر تراکنش شما به صورت موفق شبیه‌سازی شده و به صفحه بعد منتقل می‌شوید.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button 
                variant="ghost" 
                className="flex-1 h-12"
                onClick={() => setSelectedPackage(null)}
                disabled={isProcessing}
              >
                انصراف
              </Button>
              <Button 
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                onClick={handlePayment}
                isLoading={isProcessing}
              >
                <CreditCard className="ml-2 h-5 w-5" />
                اتصال به درگاه بانک
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// رپ کردن کل محتوا در Suspense برای جلوگیری از ارور useSearchParams
export default function EmployerPackagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      </div>
    }>
      <PackagesContent />
    </Suspense>
  );
}