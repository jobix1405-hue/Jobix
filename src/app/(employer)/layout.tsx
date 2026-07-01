import React from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { DashboardHeader } from '@/components/shared/DashboardHeader';

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* سایدبار با نقش کارفرما */}
      <Sidebar role="employer" />

      {/* محتوای اصلی */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}