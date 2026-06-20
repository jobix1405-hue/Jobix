"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Building2, MapPin, Briefcase, Clock, DollarSign, 
  ChevronRight, Share2, Bookmark, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

// دیتای تستی و ساختگی (تا زمان اتصال به سوپابیس)
const MOCK_JOB_DETAILS = {
  id: "1",
  title: "برنامه‌نویس ارشد فرانت‌اند (React/Next.js)",
  company: "گروه فناوری دیجی‌کالا",
  location: "تهران، ونک",
  type: "تمام وقت",
  salary: "۳۰ تا ۴۰ میلیون تومان",
  timeAgo: "۲ ساعت پیش",
  logo: "د",
  companySize: "بیش از ۱۰۰۰ نفر",
  website: "www.digikala.com",
  description: "ما در تیم مهندسی به دنبال یک توسعه‌دهنده فرانت‌اند با انگیزه و باتجربه هستیم تا در ساخت و بهینه‌سازی پلتفرم‌های مقیاس‌پذیر به ما کمک کند. شما در این موقعیت شغلی نقش کلیدی در توسعه فیچرهای جدید و بهبود تجربه کاربری خواهید داشت.",
  requirements: [
    "حداقل ۳ سال سابقه کار مرتبط به عنوان توسعه‌دهنده فرانت‌اند",
    "تسلط کامل به React.js و فریم‌ورک Next.js (ترجیحاً App Router)",
    "تسلط به TypeScript و ابزارهای مدیریت State (مثل Zustand یا Redux)",
    "تجربه کار با Tailwind CSS و طراحی ریسپانسیو (Mobile-First)",
    "آشنایی عمیق با مفاهیم SSR، CSR و بهینه‌سازی پرفورمنس (Core Web Vitals)",
    "توانایی کار تیمی با متدولوژی‌های چابک (Agile/Scrum)",
  ],
  benefits: [
    "بیمه تامین اجتماعی و بیمه تکمیلی سطح یک",
    "ساعت کاری شناور و امکان یک روز دورکاری در هفته",
    "کمک هزینه آموزش و توسعه فردی",
    "پاداش‌های فصلی مبتنی بر عملکرد",
    "محیط کاری پویا، جوان و دوستانه"
  ]
};

export default function SingleJobPage() {
  const params = useParams(); // دریافت آیدی آگهی از آدرس مرورگر
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // شبیه‌سازی ارسال درخواست کار
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // بعداً اینجا کدهای سوپابیس قرار میگیره
    setTimeout(() => {
      setIsSubmitting(false);
      setApplySuccess(true);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* لینک بازگشت */}
        <Link 
          href="/jobs" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary mb-6"
        >
          <ChevronRight className="h-4 w-4" />
          بازگشت به لیست مشاغل
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row">
          
          {/* ستون اصلی (راست) - محتوای آگهی */}
          <div className="flex-1 space-y-6">
            
            {/* هدر آگهی (کارت بالایی) */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="h-32 bg-gradient-to-r from-primary/10 to-transparent"></div>
              <div className="px-6 pb-8 pt-0 sm:px-10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                  <div className="flex items-end gap-6 -mt-10">
                    {/* لوگو شرکت */}
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white border-4 border-white shadow-md text-4xl font-bold text-primary">
                      {MOCK_JOB_DETAILS.logo}
                    </div>
                    <div className="mb-2">
                      <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                        {MOCK_JOB_DETAILS.title}
                      </h1>
                      <div className="mt-2 flex items-center gap-2 text-slate-600 font-medium">
                        <Building2 className="h-5 w-5" />
                        {MOCK_JOB_DETAILS.company}
                      </div>
                    </div>
                  </div>
                  
                  {/* دکمه‌های عملیات */}
                  <div className="flex items-center gap-3">
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-primary">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-secondary">
                      <Bookmark className="h-5 w-5" />
                    </button>
                    <Button 
                      size="lg" 
                      className="h-12 rounded-xl px-8"
                      onClick={() => setIsApplyModalOpen(true)}
                    >
                      ارسال درخواست
                    </Button>
                  </div>
                </div>

                {/* تگ‌های اطلاعات کلی */}
                <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    {MOCK_JOB_DETAILS.location}
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                    {MOCK_JOB_DETAILS.type}
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <DollarSign className="h-5 w-5 text-slate-400" />
                    {MOCK_JOB_DETAILS.salary}
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <Clock className="h-5 w-5 text-slate-400" />
                    {MOCK_JOB_DETAILS.timeAgo}
                  </div>
                </div>
              </div>
            </div>

            {/* توضیحات آگهی */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">درباره این شغل</h2>
              <p className="text-slate-600 leading-relaxed">
                {MOCK_JOB_DETAILS.description}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">شرایط و مهارت‌های مورد نیاز:</h3>
              <ul className="space-y-3">
                {MOCK_JOB_DETAILS.requirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">مزایا و تسهیلات:</h3>
              <ul className="space-y-3">
                {MOCK_JOB_DETAILS.benefits.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2 ml-1" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ستون کناری (چپ) - اطلاعات شرکت */}
          <aside className="w-full lg:w-1/3 space-y-6">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
                معرفی شرکت
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-2xl font-bold text-slate-400">
                  {MOCK_JOB_DETAILS.logo}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{MOCK_JOB_DETAILS.company}</h4>
                  <a href={`https://${MOCK_JOB_DETAILS.website}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-1 block">
                    {MOCK_JOB_DETAILS.website}
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">اندازه شرکت:</span>
                  <span className="font-medium text-slate-900">{MOCK_JOB_DETAILS.companySize}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">صنعت:</span>
                  <span className="font-medium text-slate-900">فناوری اطلاعات / نرم‌افزار</span>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-blue-50 p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    با ارسال رزومه، پروفایل شما در جابیکس برای کارفرما ارسال خواهد شد. حتماً قبل از ارسال، رزومه خود را تکمیل کنید.
                  </p>
                </div>
              </div>

              <Button 
                className="w-full mt-6 h-12 rounded-xl text-base"
                onClick={() => setIsApplyModalOpen(true)}
              >
                ارسال رزومه برای این شغل
              </Button>
            </div>
          </aside>

        </div>
      </div>

      {/* ==============================================
          مودال (پاپ‌آپ) ارسال درخواست کار
          ============================================== */}
      <Modal 
        isOpen={isApplyModalOpen} 
        onClose={() => {
          if (!isSubmitting) {
            setIsApplyModalOpen(false);
            setApplySuccess(false);
          }
        }}
        title={applySuccess ? "درخواست با موفقیت ارسال شد" : "ارسال درخواست همکاری"}
      >
        {applySuccess ? (
          // حالت موفقیت آمیز بودن ارسال
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">رزومه شما برای کارفرما ارسال شد!</h3>
            <p className="mt-2 text-sm text-slate-500">
              می‌توانید وضعیت درخواست خود را از پنل کاربری بخش "درخواست‌های من" پیگیری کنید.
            </p>
            <Button 
              className="mt-6 w-full"
              onClick={() => {
                setIsApplyModalOpen(false);
                setApplySuccess(false);
              }}
            >
              متوجه شدم
            </Button>
          </div>
        ) : (
          // فرم ارسال درخواست
          <form onSubmit={handleApply} className="space-y-5">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary font-bold shadow-sm">
                {MOCK_JOB_DETAILS.logo}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{MOCK_JOB_DETAILS.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{MOCK_JOB_DETAILS.company}</p>
              </div>
            </div>

            <Input 
              label="ایمیل شما (اختیاری)"
              placeholder="example@gmail.com"
              type="email"
              dir="ltr"
            />

            <Textarea 
              label="کاور لتر یا پیام کوتاه برای کارفرما (اختیاری)"
              placeholder="توضیح دهید چرا برای این موقعیت شغلی مناسب هستید..."
              className="min-h-[100px]"
            />

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <Button 
                type="button" 
                variant="ghost" 
                className="flex-1"
                onClick={() => setIsApplyModalOpen(false)}
                disabled={isSubmitting}
              >
                انصراف
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                isLoading={isSubmitting}
              >
                تایید و ارسال رزومه
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </main>
  );
}