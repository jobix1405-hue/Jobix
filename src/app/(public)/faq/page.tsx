import { Metadata } from "next";
import { HelpCircle, ChevronDown, MessageCircleQuestion } from "lucide-react";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description: "پاسخ به پرتکرارترین سوالات کارفرمایان و کارجویان درباره نحوه کار با پلتفرم کاریابی جابیکس.",
};

const JOB_SEEKER_FAQS = [
  {
    q: "آیا استفاده از جابیکس برای کارجویان رایگان است؟",
    a: "بله، ثبت‌نام، ساخت رزومه آنلاین و ارسال درخواست (Apply) برای آگهی‌های شغلی برای تمامی کارجویان کاملاً رایگان است و هیچ‌گاه هزینه‌ای دریافت نخواهد شد."
  },
  {
    q: "چگونه می‌توانم رزومه خود را ویرایش کنم؟",
    a: "شما می‌توانید با ورود به پنل کاربری خود و مراجعه به بخش «رزومه من»، تمامی اطلاعات هویتی، سوابق تحصیلی، شغلی و مهارت‌های خود را بروزرسانی کنید."
  },
  {
    q: "آیا می‌توانم بفهمم کارفرما رزومه من را دیده است؟",
    a: "بله. در داشبورد کاربری شما و در بخش «درخواست‌های من»، وضعیت هر درخواست به صورت زنده (در انتظار، دیده شده، دعوت به مصاحبه، رد شده) نمایش داده می‌شود."
  }
];

const EMPLOYER_FAQS = [
  {
    q: "هزینه درج آگهی استخدام چقدر است؟",
    a: "هزینه ثبت آگهی بستگی به بسته اشتراکی دارد که خریداری می‌کنید. برای مشاهده جزئیات و قیمت بسته‌ها، می‌توانید به صفحه «تعرفه‌ها» مراجعه نمایید."
  },
  {
    q: "آگهی ثبت شده تا چه زمانی در سایت فعال می‌ماند؟",
    a: "هر آگهی به صورت پیش‌فرض ۳۰ روز روی سایت فعال خواهد بود. البته در صورت استخدام نیروی مورد نظر، می‌توانید آگهی را از طریق پنل کارفرما زودتر متوقف کنید."
  },
  {
    q: "چگونه می‌توانم با کارجو مصاحبه کنم؟",
    a: "جابیکس دارای یک سیستم چت (پیام‌رسان) اختصاصی است. پس از تایید اولیه رزومه در برد کانبان (ATS)، می‌توانید از طریق دکمه «ارسال پیام»، به صورت مستقیم با کارجو گفتگو کرده و زمان مصاحبه را هماهنگ کنید."
  }
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      
      {/* هدر صفحه */}
      <section className="bg-white border-b border-slate-200 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 border border-primary/20 shadow-sm">
            <MessageCircleQuestion className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            سوالات <span className="text-primary">متداول</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            پاسخ به سوالاتی که ممکن است در مسیر استخدام یا کاریابی برای شما پیش بیاید.
          </p>
        </div>
      </section>

      {/* بخش آکاردئون‌ها (بدون نیاز به JS کلاینت‌ساید) */}
      <section className="mx-auto max-w-4xl px-6 lg:px-8 mt-12 space-y-12">
        
        {/* سوالات کارجویان */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary"></div>
            سوالات کارجویان
          </h2>
          <div className="space-y-4">
            {JOB_SEEKER_FAQS.map((faq, idx) => (
              <details key={idx} className="group rounded-2xl border border-slate-200 bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-bold hover:text-primary transition-colors">
                  <h3 className="text-base sm:text-lg">{faq.q}</h3>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:-rotate-180 group-hover:text-primary" />
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed text-sm sm:text-base border-t border-slate-100 pt-4 mt-2">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* سوالات کارفرمایان */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
            سوالات کارفرمایان و شرکت‌ها
          </h2>
          <div className="space-y-4">
            {EMPLOYER_FAQS.map((faq, idx) => (
              <details key={idx} className="group rounded-2xl border border-slate-200 bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-bold hover:text-blue-600 transition-colors">
                  <h3 className="text-base sm:text-lg">{faq.q}</h3>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:-rotate-180 group-hover:text-blue-600" />
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed text-sm sm:text-base border-t border-slate-100 pt-4 mt-2">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* تماس با پشتیبانی */}
        <div className="mt-12 rounded-3xl bg-slate-100 p-8 text-center border border-slate-200">
          <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">پاسخ خود را پیدا نکردید؟</h3>
          <p className="text-slate-500 mb-6">تیم پشتیبانی ما آماده راهنمایی شماست.</p>
          <a href="/contact" className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold text-primary shadow-sm border border-slate-200 hover:bg-slate-50 hover:border-primary/50 transition-all">
            ارتباط با پشتیبانی
          </a>
        </div>

      </section>
    </main>
  );
}