import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "جابیکس | بازار هوشمند استخدام ایران",
  description: "جابیکس، پلتفرم هوشمند کاریابی و استخدام",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`h-full antialiased ${vazirmatn.variable}`}>
      <body className="min-h-full flex flex-col">
        {/* AuthProvider تمامی صفحات را در بر می‌گیرد تا استیت کاربر همه‌جا در دسترس باشد */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}