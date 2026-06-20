import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

// پیکربندی فونت وزیرمتن
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "Jobix | بازار هوشمند استخدام ایران",
  description: "پلتفرم هوشمند کاریابی و استخدام",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`h-full antialiased ${vazirmatn.variable}`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}