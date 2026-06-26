import { Metadata } from "next";
import { Scale, FileText, Building2, Briefcase, AlertTriangle, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "شرایط و قوانین استفاده از خدمات پلتفرم هوشمند کاریابی جابیکس برای کارجویان و کارفرمایان.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      
      {/* هدر صفحه */}
      <section className="bg-white border-b border-slate-200 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 mb-6 border border-slate-200 shadow-sm">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            قوانین و مقررات <span className="text-primary">جابیکس</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            کاربر گرامی، استفاده از خدمات جابیکس به معنای پذیرش تمامی شرایط و قوانین زیر است. لطفاً پیش از استفاده، این موارد را به دقت مطالعه فرمایید.
          </p>
          <p className="mt-2 text-xs text-slate-400">آخرین بروزرسانی: خرداد ۱۴۰۳</p>
        </div>
      </section>

      {/* محتوای قوانین */}
      <section className="mx-auto max-w-4xl px-6 lg:px-8 mt-12 space-y-8">
        
        {/* بند ۱: تعاریف و اصول کلی */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
            <FileText className="h-6 w-6 text-primary" />
            ۱. اصول و تعاریف کلی
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm text-justify">
            <p>
              وب‌سایت جابیکس تابع قوانین جمهوری اسلامی ایران، قانون تجارت الکترونیک و قانون حمایت از حقوق مصرف‌کننده است. پلتفرم جابیکس صرفاً یک واسط هوشمند میان کارجو و کارفرما بوده و هیچ‌گونه رابطه استخدامی بین پلتفرم و کاربران وجود ندارد.
            </p>
            <ul className="list-disc list-inside space-y-2 mr-2">
              <li><strong>کارفرما:</strong> شخص حقیقی یا حقوقی که برای تامین نیروی انسانی خود در سایت آگهی ثبت می‌کند.</li>
              <li><strong>کارجو:</strong> فردی که به دنبال شغل بوده و رزومه خود را در سیستم ثبت می‌نماید.</li>
            </ul>
          </div>
        </div>

        {/* بند ۲: قوانین کارجویان */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Briefcase className="h-6 w-6 text-secondary" />
            ۲. تعهدات کارجویان
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm text-justify">
            <p>
              کارجو موظف است اطلاعات هویتی، تحصیلی و شغلی خود را با دقت و صداقت کامل وارد نماید. مسئولیت صحت محتوای رزومه تماماً بر عهده شخص کارجو است.
            </p>
            <p>
              ارسال درخواست‌های مکرر و بی‌ربط (اسپم) به آگهی‌های شغلی ممنوع بوده و در صورت گزارش کارفرمایان، جابیکس حق مسدودسازی حساب کارجو را برای خود محفوظ می‌دارد. خدمات جابیکس برای تمامی کارجویان کاملاً رایگان است.
            </p>
          </div>
        </div>

        {/* بند ۳: قوانین کارفرمایان */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Building2 className="h-6 w-6 text-blue-600" />
            ۳. تعهدات کارفرمایان و شرکت‌ها
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm text-justify">
            <p>
              شرکت‌ها موظف‌اند اطلاعات هویتی و قانونی کسب‌وکار خود را به درستی وارد کنند. ثبت آگهی‌های دارای محتوای توهین‌آمیز، هرمی، شبکه‌ای، غیراخلاقی یا درخواست مبالغ مالی از کارجو به هر بهانه‌ای مطلقاً ممنوع است.
            </p>
            <p>
              کارفرما حق ندارد اطلاعات تماس و رزومه‌های دریافتی را در اختیار اشخاص ثالث قرار دهد و باید حریم خصوصی متقاضیان را به طور کامل حفظ نماید.
            </p>
          </div>
        </div>

        {/* بند ۴: پرداخت‌ها و تعرفه‌ها */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
            <CreditCard className="h-6 w-6 text-green-600" />
            ۴. پرداخت‌ها و بسته‌های اشتراک
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm text-justify">
            <p>
              خرید بسته‌های ثبت آگهی توسط کارفرمایان قطعی بوده و وجه پرداختی در صورت انصراف، قابل استرداد نیست (مگر در موارد نقص فنی اثبات شده از سوی پلتفرم).
            </p>
            <p>
              سهمیه‌های خریداری شده دارای محدودیت زمانی (مثلاً ۳۰ روزه) هستند و پس از پایان مهلت، باطل خواهند شد. مسئولیت استفاده به موقع از سهمیه‌ها بر عهده کاربر است.
            </p>
          </div>
        </div>

        {/* بند ۵: سلب مسئولیت */}
        <div className="bg-red-50 rounded-3xl p-8 border border-red-100 shadow-sm">
          <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2 border-b border-red-200 pb-4">
            <AlertTriangle className="h-6 w-6" />
            ۵. سلب مسئولیت
          </h2>
          <div className="space-y-4 text-red-700 leading-relaxed text-sm text-justify">
            <p>
              جابیکس هیچ‌گونه دخالتی در فرآیند مصاحبه، عقد قرارداد، میزان حقوق و شرایط کاری بین کارفرما و کارجو ندارد و صرفاً بستر ارتباطی است. بنابراین هرگونه اختلاف حقوقی، مالی یا کیفری بین طرفین، ارتباطی به پلتفرم جابیکس نخواهد داشت.
            </p>
            <p>
              تیم پشتیبانی جابیکس به صورت مستمر بر کیفیت آگهی‌ها نظارت دارد، اما تضمینی بابت امنیت صددرصدی جلسات مصاحبه حضوری ارائه نمی‌دهد. لطفاً در مراجعه به شرکت‌ها نکات ایمنی را رعایت فرمایید.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}