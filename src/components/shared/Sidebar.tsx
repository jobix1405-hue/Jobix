"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  X 
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: "employer" | "job-seeker";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useStore();

  // لینک‌های اختصاصی بر اساس نقش کاربر
  const links: SidebarItem[] = role === "employer" 
    ? [
        { name: "پیشخوان", href: "/employer", icon: LayoutDashboard },
        { name: "آگهی‌های من", href: "/employer/jobs", icon: Briefcase },
        { name: "رزومه‌های دریافتی", href: "/employer/applications", icon: Users },
        { name: "پیام‌ها", href: "/employer/messages", icon: MessageSquare },
        { name: "تنظیمات شرکت", href: "/employer/settings", icon: Settings },
      ]
    : [
        { name: "پیشخوان", href: "/job-seeker", icon: LayoutDashboard },
        { name: "رزومه من", href: "/job-seeker/resume", icon: Briefcase },
        { name: "درخواست‌های من", href: "/job-seeker/applications", icon: Users },
        { name: "پیام‌ها", href: "/job-seeker/messages", icon: MessageSquare },
        { name: "تنظیمات حساب", href: "/job-seeker/settings", icon: Settings },
      ];

  return (
    <>
      {/* Overlay برای حالت موبایل */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* بدنه سایدبار */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-white border-l border-slate-200 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* هدر سایدبار */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <span className="text-xl font-extrabold text-primary">
            {role === "employer" ? "پنل کارفرما" : "پنل کارجو"}
          </span>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* لینک‌های منو */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <link.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* بخش خروج */}
        <div className="p-4 border-t border-slate-100">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            خروج از حساب
          </button>
        </div>
      </aside>
    </>
  );
}