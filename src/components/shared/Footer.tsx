import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Code2, Library } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* بخش معرفی و لوگو */}
          <div className="flex flex-col gap-4 xl:col-span-1">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Image
                  src="/logo-full.webp"
                  alt="جابیکس"
                  width={160}
                  height={50}
                  className="object-contain"
                />
              </Link>
              <Link 
                href="/partners" 
                title="EcoSystem"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 opacity-[0.03] hover:opacity-100 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Library className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-sm leading-relaxed text-slate-500 max-w-xs -mt-1">
              <strong className="text-slate-800 font-bold text-base">بازار هوشمند استخدام ایران</strong>
              <br />
              <span className="font-medium mt-1 inline-block text-slate-500">مرجع رسانه‌ای منابع انسانی</span>
            </p>
            
            {/* راه‌های ارتباطی و رسانه‌ها */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a 
                href="https://t.me/jobixxhr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/10"
              >
                <Image src="/icons/telegram.png" alt="کانال تلگرام جابیکس" width={22} height={22} className="transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xs font-bold text-blue-700">کانال تلگرام</span>
              </a>
              <a 
                href="https://ble.ir/jobixx" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-green-500/10"
              >
                <Image src="/icons/bale.png" alt="کانال بله جابیکس" width={22} height={22} className="rounded-full transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xs font-bold text-green-700">ارتباط در بله</span>
              </a>
            </div>
          </div>

          {/* بخش لینک‌ها */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 text-right">کارجویان</h3>
                <ul role="list" className="mt-6 space-y-4 text-right">
                  <li><Link href="/jobs" className="text-sm text-slate-500 hover:text-primary transition-colors">جستجوی مشاغل</Link></li>
                  <li><Link href="/job-seeker/resume" className="text-sm text-slate-500 hover:text-primary transition-colors">رزومه‌ساز آنلاین</Link></li>
                  <li><Link href="/companies" className="text-sm text-slate-500 hover:text-primary transition-colors">شرکت‌های برتر</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-900 text-right">کارفرمایان</h3>
                <ul role="list" className="mt-6 space-y-4 text-right">
                  <li><Link href="/employer/post-job" className="text-sm text-slate-500 hover:text-primary transition-colors">ثبت آگهی استخدام</Link></li>
                  <li><Link href="/pricing" className="text-sm text-slate-500 hover:text-primary transition-colors">تعرفه‌ها</Link></li>
                  <li><Link href="/employer" className="text-sm text-slate-500 hover:text-primary transition-colors">پنل مدیریت رزومه‌ها</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 text-right">پشتیبانی و قوانین</h3>
                <ul role="list" className="mt-6 space-y-4 text-right">
                  <li><Link href="/about" className="text-sm text-slate-500 hover:text-primary transition-colors">درباره ما</Link></li>
                  <li><Link href="/faq" className="text-sm text-slate-500 hover:text-primary transition-colors">سوالات متداول</Link></li>
                  <li><Link href="/terms" className="text-sm text-slate-500 hover:text-primary transition-colors">قوانین و مقررات</Link></li>
                  <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-primary transition-colors">حریم خصوصی</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 text-right">ارتباط با ما</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span dir="ltr">09010601610</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href="mailto:jobix1405@gmail.com" className="hover:text-primary transition-colors" dir="ltr">jobix1405@gmail.com</a>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-500">
                    <MapPin className="h-5 w-5 shrink-0 text-slate-400 mt-0.5" />
                    <span><Link href="/contact" className="hover:text-primary transition-colors">تهران، پارک فناوری پردیس، ساختمان جابیکس</Link></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* --- نوار پایین فوتر --- */}
        <div className="mt-16 border-t border-slate-200 pt-8 sm:mt-20 lg:mt-24 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-xs leading-5 text-slate-500 text-center lg:text-right">
            &copy; {new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} تمامی حقوق برای پلتفرم هوشمند کاریابی جابیکس محفوظ است.
          </p>
          <a 
            href="https://kiyadev.ir" 
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-slate-50 hover:bg-slate-900 border border-slate-200 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-medium group-hover:text-slate-400">
                طراحی و مهندسی توسط
              </span>
              <span className="text-xs font-bold text-slate-700 group-hover:text-white flex items-center gap-1">
                KiyaDev Team
                <Code2 className="h-3 w-3 text-secondary group-hover:text-orange-400" />
              </span>
            </div>
            <div className="h-8 w-8 bg-white group-hover:bg-white/10 rounded-lg flex items-center justify-center shadow-sm transition-colors border border-slate-100 group-hover:border-transparent">
               <Code2 className="h-4 w-4 text-slate-600 group-hover:text-white" />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}