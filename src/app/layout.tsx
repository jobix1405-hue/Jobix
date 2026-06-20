import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}