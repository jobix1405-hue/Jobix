import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import Script from "next/script"; // 👈 ابزار مخصوص نکست برای حل خطای اسکریپت اضافه شد
import { AuthProvider } from "@/components/providers/AuthProvider";
import { PwaManager } from "@/components/pwa/PwaManager";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

// اضافه کردن متادیتای Viewport مخصوص PWA
export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // برای تجربه کاربری شبیه به اپلیکیشن بومی
};

// 👇 بمب سئو: تمامی کلمات کلیدی، توضیحات گوگل و شبکه‌های اجتماعی اینجا تنظیم شد
export const metadata: Metadata = {
  title: {
    template: "%s | جابیکس",
    default: "جابیکس | بازار هوشمند کاریابی و استخدام ایران",
  },
  description: "جابیکس (Jobix) پلتفرم هوشمند کاریابی، استخدام و رزومه‌ساز آنلاین. جدیدترین آگهی‌های استخدام شرکت‌های معتبر را پیدا کنید و سریع‌تر استخدام شوید.",
  keywords: [
    "کاریابی",
    "استخدام",
    "آگهی استخدام",
    "کاریابی آنلاین",
    "جابیکس",
    "jobix",
    "استخدام برنامه نویس",
    "کاریابی تهران",
    "پیدا کردن کار",
    "رزومه ساز آنلاین",
    "استخدام شرکت های معتبر",
    "استخدام فوری",
    "کاریابی هوشمند"
  ],
  authors: [{ name: "تیم جابیکس" }],
  creator: "جابیکس",
  publisher: "جابیکس",
  manifest: "/manifest.json", // 👈 اتصال فایل مانیفست برای PWA
  openGraph: {
    title: "جابیکس | بازار هوشمند کاریابی و استخدام ایران",
    description: "سریع‌ترین مسیر برای پیدا کردن شغل رویایی شما. در جابیکس رزومه بسازید و برای معتبرترین شرکت‌ها ارسال کنید.",
    url: "https://jobixx.ir",
    siteName: "جابیکس (Jobix)",
    images: [
      {
        url: "https://jobixx.ir/logo-minimal.webp",
        width: 1200,
        height: 630,
        alt: "جابیکس - پلتفرم هوشمند کاریابی و استخدام",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "جابیکس | پلتفرم هوشمند استخدام",
    description: "جدیدترین فرصت‌های شغلی را در جابیکس کشف کنید.",
    images: ["https://jobixx.ir/logo-minimal.webp"],
  },
  alternates: {
    canonical: "https://jobixx.ir",
  },
};

// نامه رسمی به گوگل برای معرفی لوگو و برند (JSON-LD)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "جابیکس",
  "url": "https://jobixx.ir",
  "logo": "https://jobixx.ir/icon-512.png",
  "description": "جابیکس، پلتفرم هوشمند کاریابی و استخدام در ایران",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // دریافت آیدی گوگل آنالیتیکس از فایل متغیرهای محیطی (.env)
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="fa" dir="rtl" className={`h-full antialiased ${vazirmatn.variable}`}>
      <head>
        {/* تزریق کدهای معرفی ساختار به گوگل */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        
        {/* 👈 Google Analytics (GA4) با استفاده از کامپوننت Script جایگزین شد تا ارور نده */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* AuthProvider تمامی صفحات را در بر می‌گیرد تا استیت کاربر همه‌جا در دسترس باشد */}
        <AuthProvider>
          {children}
          {/* 👇 اضافه شدن مدیر PWA و درخواست پوش نوتیفیکیشن */}
          <PwaManager />
        </AuthProvider>
      </body>
    </html>
  );
}