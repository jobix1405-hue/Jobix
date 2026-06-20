import React from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-[#f8fafc]">
      <Header />
      
      {/* محتوای صفحات عمومی مثل صفحه اصلی */}
      <div className="flex-1">
        {children}
      </div>

      <Footer />
    </div>
  );
}