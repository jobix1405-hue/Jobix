import { Metadata } from "next";
import { MapPin, Phone, Mail, Send, Clock, Building2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "ارتباط با تیم پشتیبانی جابیکس. آماده پاسخگویی به سوالات، پیشنهادات و انتقادات شما هستیم.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      
      {/* هدر صفحه */}
      <section className="bg-white border-b border-slate-200 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            ارتباط با <span className="text-primary">جابیکس</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            تیم پشتیبانی ما شنبه تا چهارشنبه پاسخگوی سوالات شما عزیزان است. در صورت بروز هرگونه مشکل، از طریق فرم زیر با ما در ارتباط باشید.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* اطلاعات تماس و نقشه */}
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              اطلاعات دفتر مرکزی
            </h2>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">آدرس مراجعه حضوری:</h4>
                  <p className="text-slate-600 mt-1 text-sm leading-relaxed">تهران، پارک فناوری پردیس، خیابان نوآوری، ساختمان جابیکس، طبقه سوم</p>
                </div>
              </li>
              
              <li className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">شماره تماس (ساعات اداری):</h4>
                  <p className="text-slate-600 mt-1 text-sm" dir="ltr">۰۲۱ - ۸۸۸۸ ۸۸۸۸</p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-50 text-secondary flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">ایمیل پشتیبانی:</h4>
                  <p className="text-slate-600 mt-1 text-sm font-medium" dir="ltr">support@jobixx.ir</p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">ساعات کاری:</h4>
                  <p className="text-slate-600 mt-1 text-sm">شنبه تا چهارشنبه: ۹ صبح الی ۱۷ عصر</p>
                </div>
              </li>
            </ul>
          </div>

          {/* نقشه استاتیک گوگل (سبک و بدون ارور استیت) */}
          <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm overflow-hidden h-[300px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.93297157833!2d51.40880311526017!3d35.727845380183574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e011082c5f1cd%3A0xc68ed106b50937a0!2sTehran%2C%20Tehran%20Province%2C%20Iran!5e0!3m2!1sen!2s!4v1680000000000!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '1.25rem' }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </div>

        {/* فرم تماس */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in slide-in-from-left-8 duration-700 h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-6">ارسال پیام به پشتیبانی</h2>
          
          <form action="#" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input 
                label="نام و نام خانوادگی *" 
                placeholder="مثال: علی رضایی" 
                name="name" 
                required 
              />
              <Input 
                label="شماره موبایل *" 
                placeholder="0912..." 
                name="phone" 
                dir="ltr"
                required 
              />
            </div>
            
            <Input 
              label="آدرس ایمیل (اختیاری)" 
              placeholder="example@gmail.com" 
              name="email"
              type="email" 
              dir="ltr" 
            />

            <Input 
              label="موضوع پیام *" 
              placeholder="گزارش باگ، مشکل در پرداخت و..." 
              name="subject" 
              required 
            />

            <Textarea 
              label="متن پیام شما *" 
              placeholder="پیام خود را به صورت کامل اینجا بنویسید..." 
              name="message"
              className="min-h-[150px]"
              required 
            />

            <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-lg shadow-lg shadow-primary/20">
              <Send className="ml-2 h-5 w-5 rotate-180" />
              ارسال پیام
            </Button>
            
            <p className="text-xs text-slate-400 text-center mt-4">
              معمولاً پیام‌ها در کمتر از ۲۴ ساعت کاری پاسخ داده خواهند شد.
            </p>
          </form>
        </div>

      </section>
    </main>
  );
}