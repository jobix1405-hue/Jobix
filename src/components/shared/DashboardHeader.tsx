"use client";

import { Menu, Bell } from "lucide-react";
import { useStore } from "@/store/useStore";

export function DashboardHeader() {
  const { toggleSidebar, user } = useStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* دکمه منو موبایل */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* بخش نوتیفیکیشن و اطلاعات کاربر */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary ring-2 ring-white"></span>
        </button>
        
        {/* اطلاعات اکانت لاگین شده */}
        <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
          <span className="hidden text-sm font-bold text-slate-700 sm:block" dir="ltr">
            {user?.phone || 'در حال بارگذاری...'}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary border border-primary/20 shadow-sm">
            {user?.role === 'employer' ? 'ک' : 'ج'}
          </div>
        </div>
      </div>
    </header>
  );
}