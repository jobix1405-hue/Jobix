"use client";

import { Menu, Bell } from "lucide-react";
import { useStore } from "@/store/useStore";

export function DashboardHeader() {
  const { toggleSidebar } = useStore();

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

      {/* بخش نوتیفیکیشن و پروفایل (استاتیک برای الان) */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          م
        </div>
      </div>
    </header>
  );
}