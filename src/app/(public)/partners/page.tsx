"use client";

import { 
  ExternalLink, 
  ShoppingBag, 
  Truck, 
  Gem, 
  Briefcase, 
  Network, 
  Bitcoin, 
  ArrowRight,
  Zap,       
  Bot,       
  LayoutDashboard, 
  Shirt,     
  Code2,     
  Sparkles,
  Palette
} from "lucide-react";
import Link from "next/link";

// لیست کامل همکاران تجاری و پروژه‌های اکوسیستم ما (با تم جابیکس)
const partners = [
  {
    id: 1,
    title: "تیم مهندسی کیا دِو | KiyaDev",
    description: "طراحی، توسعه و پشتیبانی سیستم‌های پیشرفته تحت وب، فروشگاه‌های مدرن و اپلیکیشن‌های موبایل با متدهای روز دنیا.",
    features: ["توسعه وب و موبایل", "هوش مصنوعی", "معماری سیستم"],
    url: "https://kiyadev.ir", 
    icon: Code2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "hover:border-blue-300",
    glow: "hover:shadow-blue-500/10"
  },
  {
    id: 2,
    title: "صرافی تیوان اکس | TivanEx",
    description: "پلتفرم معاملاتی نسل ۳ با امنیت سایبری در کلاس جهانی. خرید و فروش آنی بیت‌کوین و تتر با موتور مچینگ فراصوت و کیف پول سرد.",
    features: ["بلاکچین و Web3", "امنیت بانکی", "تراکنش آنی"],
    url: "https://tivan-ex.vercel.app", 
    icon: Bitcoin,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "hover:border-emerald-300",
    glow: "hover:shadow-emerald-500/10"
  },
  {
    id: 3,
    title: "نکسوس سولانا | توکن‌ساز",
    description: "اولین پلتفرم No-Code ساخت توکن روی شبکه سولانا. ایجاد ارز دیجیتال شخصی و میم‌کوین در کمتر از ۱ دقیقه با هزینه ناچیز و امنیت بلاکچینی.",
    features: ["ساخت توکن SPL", "شبکه پرسرعت سولانا", "بدون کدنویسی"],
    url: "https://nexus-solana-taupe.vercel.app",
    icon: Zap,
    color: "text-fuchsia-600", 
    bgColor: "bg-fuchsia-50",
    borderColor: "hover:border-fuchsia-300",
    glow: "hover:shadow-fuchsia-500/10"
  },
  {
    id: 4,
    title: "مایند اوربیت | هوش مصنوعی",
    description: "دستیار هوشمند مبتنی بر مدل‌های پیشرفته زبانی (LLM). پاسخگویی به سوالات، تولید محتوا، کدنویسی و حل مسائل پیچیده با پشتیبانی کامل فارسی.",
    features: ["چت‌بات هوشمند", "تولید محتوا و کد", "مدل زبانی Gemini"],
    url: "https://mind-orbit-lyart.vercel.app",
    icon: Bot,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "hover:border-cyan-300",
    glow: "hover:shadow-cyan-500/10"
  },
  {
    id: 5,
    title: "آلفا سیستم | داشبورد مدیریتی",
    description: "سامانه جامع مدیریت منابع سازمانی (ERP). مدیریت هوشمند پرسنل، حقوق و دستمزد، و کنترل پروژه‌ها با ابزارهای بصری و نمودارهای تحلیلی.",
    features: ["پنل مدیریت ERP", "مدیریت پروژه‌ها (Kanban)", "تحلیل داده‌ها"],
    url: "https://alpha-system-eight.vercel.app",
    icon: LayoutDashboard,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "hover:border-orange-300",
    glow: "hover:shadow-orange-500/10"
  },
  {
    id: 6,
    title: "لوکس شاپ | استایل و مد",
    description: "فروشگاه اینترنتی مدرن پوشاک و اکسسوری. تجربه خریدی لوکس با رابط کاربری مینیمال، سبد خرید هوشمند و فرآیند پرداخت آسان.",
    features: ["فروشگاه آنلاین مدرن", "مد و فشن", "تجربه کاربری عالی"],
    url: "https://luxe-shop-ten.vercel.app",
    icon: Shirt,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "hover:border-amber-300",
    glow: "hover:shadow-amber-500/10"
  },
  {
    id: 7,
    title: "فروشگاه آنلاین کوکونات",
    description: "بازار آنلاین میوه و پروتئین شهر پرند. خرید آنلاین تازه‌ترین محصولات با تحویل فوری درب منزل. تجربه‌ای راحت و سریع برای شهروندان.",
    features: ["مارکت‌پلیس محلی", "لجستیک هوشمند", "تحویل فوری"],
    url: "https://cocodelivery.ir", 
    icon: Truck,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "hover:border-green-300",
    glow: "hover:shadow-green-500/10"
  },
  {
    id: 8,
    title: "گالری جواهرات اَلِف جِم",
    description: "طراحی و ساخت جواهرات دست‌ساز با طلای ۱۸ عیار و سنگ‌های قیمتی اصل. ترکیب هنر مینیمال و مدرن برای خلق آثار ماندگار.",
    features: ["لوکس و فشن", "سنگ‌های قیمتی", "طراحی اختصاصی"],
    url: "https://alefgem.com", 
    icon: Gem,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "hover:border-purple-300",
    glow: "hover:shadow-purple-500/10"
  },
  {
    id: 9,
    title: "سوغات شاپ اینترنشنال",
    description: "اولین پلتفرم ارسال هدیه به ایران با پرداخت ارزی و کریپتو. پل ارتباطی ایرانیان خارج از کشور با عزیزانشان در داخل کشور.",
    features: ["پرداخت کریپتو", "فین‌تک فرامرزی", "E-Commerce"],
    url: "https://soughat.shop", 
    icon: ShoppingBag,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "hover:border-rose-300",
    glow: "hover:shadow-rose-500/10"
  },
  {
    id: 10,
    title: "قلاب جادویی | Gholab Jadooi",
    description: "فروشگاه تخصصی و آنلاین دست‌بافت‌های فانتزی. خرید زیباترین دسته گل‌های جاودان کاموایی و عروسک‌های آمیگورومی با بهترین کیفیت.",
    features: ["فروشگاه آنلاین", "هنر دست", "کادو و گیفت"],
    url: "https://gholabjadooi.ir", 
    icon: Palette,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "hover:border-pink-300",
    glow: "hover:shadow-pink-500/10"
  }
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
      {/* هاله‌های نوری پس‌زمینه מתناسب با تم جابیکس */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="mb-12 text-right">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-6 transition-colors text-sm font-bold">
            <ArrowRight className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
          
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-sm w-fit">
              <Network className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-slate-700">شبکه اکوسیستم دیجیتال ما</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              پروژه‌ها و <span className="text-primary">همکاران تجاری</span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-3xl leading-relaxed text-justify mt-2">
              پلتفرم هوشمند جابیکس بخشی از اکوسیستم بزرگ توسعه‌یافته توسط تیم فنی ماست. در این صفحه می‌توانید سایر پلتفرم‌ها، فروشگاه‌ها و سرویس‌های دیجیتال همکار که تحت حمایت و پایش ما هستند را مشاهده فرمایید.
            </p>
          </div>
        </div>

        {/* گرید کارت‌ها */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            return (
              <a
                key={partner.id}
                href={partner.url}
                target="_blank"
                rel="dofollow" 
                className={`group animate-in fade-in slide-in-from-bottom-4 relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl ${partner.borderColor} ${partner.glow}`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div>
                  {/* هدر کارت */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`rounded-2xl p-3 ${partner.bgColor} ${partner.color} transition-transform group-hover:scale-110 duration-300`}>
                      <Icon size={26} strokeWidth={2} />
                    </div>
                    <div className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 flex items-center gap-1">
                      <Briefcase size={12} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-bold">پروژه فعال</span>
                    </div>
                  </div>

                  <h2 className="mb-3 text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {partner.title}
                  </h2>
                  
                  <p className="text-sm leading-relaxed text-slate-500 mb-6 text-justify">
                    {partner.description}
                  </p>

                  {/* ویژگی‌ها / تگ‌ها */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {partner.features.map((feature, idx) => (
                      <span key={idx} className="text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-lg">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* فوتر کارت */}
                <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className={`text-xs font-bold transition-colors flex items-center gap-1 ${partner.color}`}>
                    مشاهده وب‌سایت
                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <div className="flex items-center gap-1 text-slate-300 group-hover:text-slate-900 transition-colors">
                    <span className="text-xs hidden sm:inline-block" dir="ltr">
                      {partner.url.replace('https://', '')}
                    </span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}