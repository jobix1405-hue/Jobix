import React from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { DashboardHeader } from '@/components/shared/DashboardHeader';

export default function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* سایدبار با نقش کارجو */}
      <Sidebar role="job-seeker" />

      {/* محتوای اصلی */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}