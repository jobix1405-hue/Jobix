import { Metadata } from "next";
import { Shield, Lock, EyeOff, Server, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حفظ حریم خصوصی، نحوه جمع‌آوری، استفاده و محافظت از اطلاعات کاربران در جابیکس.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      
      {/* هدر صفحه */}
      <section className="bg-white border-b border-slate-200 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600 mb-6 border border-green-100 shadow-sm">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            سیاست <span className="text-green-600">حریم خصوصی</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            ما در جابیکس متعهد به حفظ امنیت و حریم خصوصی داده‌های شما هستیم. در این صفحه می‌خوانید که چگونه از اطلاعات شما محافظت می‌کنیم.
          </p>
        </div>
      </section>

      {/* محتوای حریم خصوصی */}
      <section className="mx-auto max-w-4xl px-6 lg:px-8 mt-12 space-y-8">

        {/* بخش اول: چه اطلاعاتی جمع آوری میکنیم */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-green-200 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
              <Server className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">چه اطلاعاتی را جمع‌آوری می‌کنیم؟</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm text-justify">
            <p>هنگام استفاده از جابیکس، اطلاعات زیر از شما دریافت و در پایگاه داده‌های امن ما ذخیره می‌شود:</p>
            <ul className="list-disc list-inside space-y-2 mr-2">
              <li><strong>اطلاعات حساب کاربری:</strong> شماره موبایل (برای احراز هویت OTP).</li>
              <li><strong>اطلاعات کارجویان:</strong> نام، نام خانوادگی، سوابق تحصیلی، سوابق شغلی، مهارت‌ها و آدرس ایمیل.</li>
              <li><strong>اطلاعات کارفرمایان:</strong> نام شرکت، آدرس، زمینه فعالیت، لوگو و اطلاعات آگهی‌های شغلی.</li>
              <li><strong>اطلاعات سیستمی:</strong> کوکی‌ها، آدرس IP و نوع مرورگر جهت بهبود تجربه کاربری و آنالیز ترافیک سایت.</li>
            </ul>
          </div>
        </div>

        {/* بخش دوم: نحوه استفاده */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-green-200 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
              <UserCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">چگونه از اطلاعات شما استفاده می‌کنیم؟</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm text-justify">
            <p>اطلاعات جمع‌آوری شده صرفاً برای مقاصد زیر مورد استفاده قرار می‌گیرند:</p>
            <ul className="list-disc list-inside space-y-2 mr-2">
              <li>ارائه خدمات اصلی پلتفرم (ایجاد ارتباط میان کارجو و کارفرما).</li>
              <li>بهبود الگوریتم‌های هوش مصنوعی برای پیشنهاد دقیق‌تر آگهی‌ها و رزومه‌ها.</li>
              <li>ارسال اطلاع‌رسانی‌های ضروری نظیر تغییر وضعیت رزومه یا پیام‌های چت.</li>
              <li>جلوگیری از تقلب، اسپم و فعالیت‌های غیرقانونی در بستر پلتفرم.</li>
            </ul>
          </div>
        </div>

        {/* بخش سوم: عدم فروش اطلاعات */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-green-200 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
              <EyeOff className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">اشتراک‌گذاری اطلاعات با اشخاص ثالث</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm text-justify">
            <p>
              جابیکس به هیچ عنوان اطلاعات هویتی و تماسی شما را به شرکت‌های تبلیغاتی یا اشخاص ثالث نمی‌فروشد و اجاره نمی‌دهد.
            </p>
            <p>
              زمانی که شما (کارجو) رزومه خود را برای یک فرصت شغلی ارسال می‌کنید (Apply)، اطلاعات پروفایل شما مستقیماً در اختیار کارفرمای مربوطه قرار می‌گیرد تا بتواند با شما در تماس باشد. همچنین در صورت درخواست مراجع قضایی ذی‌صلاح با ارائه حکم قانونی، جابیکس موظف به همکاری خواهد بود.
            </p>
          </div>
        </div>

        {/* بخش چهارم: امنیت و حقوق کاربر */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-green-200 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600 border border-green-100">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">امنیت داده‌ها و حقوق شما</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm text-justify">
            <p>
              ما از تکنولوژی‌های رمزنگاری پیشرفته و پایگاه داده ایمن (Supabase RLS) برای جلوگیری از دسترسی‌های غیرمجاز به اطلاعات شما استفاده می‌کنیم.
            </p>
            <p>
              <strong>حق پاک‌کردن داده‌ها:</strong> شما هر زمان که تمایل داشته باشید، می‌توانید از طریق بخش تنظیمات حساب کاربری، درخواست حذف دائمی اکانت خود را ثبت کنید. با این کار تمامی رزومه‌ها، آگهی‌ها و پیام‌های شما به صورت کامل از سرورهای ما حذف خواهند شد.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}