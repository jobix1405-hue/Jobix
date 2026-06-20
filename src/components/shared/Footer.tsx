import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

// ساخت آیکون‌های SVG اختصاصی برای شبکه‌های اجتماعی
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* بخش معرفی و لوگو */}
          <div className="space-y-8 xl:col-span-1">
            <Image
              src="/logo-full.webp"
              alt="جابیکس"
              width={160}
              height={50}
              className="object-contain"
            />
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              جابیکس، هوشمندترین پلتفرم کاریابی و استخدام در ایران است که با استفاده از هوش مصنوعی، بهترین استعدادها را به بهترین شرکت‌ها متصل می‌کند.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#0077b5] transition-colors">
                <LinkedinIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#1DA1F2] transition-colors">
                <TwitterIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* بخش لینک‌ها */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 text-right">کارجویان</h3>
                <ul role="list" className="mt-6 space-y-4 text-right">
                  <li><Link href="/jobs" className="text-sm text-slate-500 hover:text-primary">جستجوی مشاغل</Link></li>
                  <li><Link href="/job-seeker" className="text-sm text-slate-500 hover:text-primary">رزومه‌ساز آنلاین</Link></li>
                  <li><Link href="#" className="text-sm text-slate-500 hover:text-primary">شرکت‌های برتر</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-900 text-right">کارفرمایان</h3>
                <ul role="list" className="mt-6 space-y-4 text-right">
                  <li><Link href="/employer" className="text-sm text-slate-500 hover:text-primary">ثبت آگهی استخدام</Link></li>
                  <li><Link href="#" className="text-sm text-slate-500 hover:text-primary">تعرفه‌ها</Link></li>
                  <li><Link href="#" className="text-sm text-slate-500 hover:text-primary">جستجوی رزومه‌ها</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 text-right">پشتیبانی</h3>
                <ul role="list" className="mt-6 space-y-4 text-right">
                  <li><Link href="#" className="text-sm text-slate-500 hover:text-primary">سوالات متداول</Link></li>
                  <li><Link href="#" className="text-sm text-slate-500 hover:text-primary">قوانین و مقررات</Link></li>
                  <li><Link href="#" className="text-sm text-slate-500 hover:text-primary">حریم خصوصی</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 text-right">تماس با ما</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span dir="ltr">۰۲۱ - ۸۸۸۸ ۸۸۸۸</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <span dir="ltr">info@jobix.ir</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-500">
                    <MapPin className="h-5 w-5 shrink-0 text-slate-400 mt-0.5" />
                    <span>تهران، پارک فناوری پردیس، ساختمان جابیکس</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t border-slate-200 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-slate-500 text-center">
            &copy; {new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} تمامی حقوق برای پلتفرم جابیکس محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}