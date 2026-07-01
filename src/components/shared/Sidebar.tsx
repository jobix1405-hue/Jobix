"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { createClient } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Settings, 
  X,
  Bookmark, 
  ShieldCheck, 
  CreditCard,
  Layers,
  Package,
  AlertTriangle,
  GraduationCap,
  Megaphone,
  BookOpen 
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: "employer" | "job-seeker" | "admin"; 
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const { isSidebarOpen, toggleSidebar, user } = useStore();

  // 👈 تعداد درخواست‌های چت در انتظار پاسخ (برای بج روی آیکون «پیام‌ها»)
  const [pendingChatCount, setPendingChatCount] = useState(0);

  useEffect(() => {
    if (!user?.id || role === "admin") return;

    const fetchPendingChats = async () => {
      let query = supabase.from('conversations').select('id', { count: 'exact', head: true });

      if (role === "employer") {
        query = query.eq('employer_id', user.id).eq('status', 'pending_employer').eq('is_deleted_by_employer', false);
      } else {
        query = query.eq('job_seeker_id', user.id).eq('status', 'pending_seeker').eq('is_deleted_by_seeker', false);
      }

      const { count } = await query;
      setPendingChatCount(count || 0);
    };

    fetchPendingChats();

    // اتصال زنده: با هر تغییر در گفتگوهای مرتبط با این کاربر، شمارش دوباره انجام می‌شود
    const filterColumn = role === "employer" ? "employer_id" : "job_seeker_id";
    const channel = supabase
      .channel(`sidebar_chat_requests_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `${filterColumn}=eq.${user.id}`
      }, () => {
        fetchPendingChats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, role, supabase]);

  // تنظیم لینک‌های اختصاصی بر اساس هر سه نقش
  let links: SidebarItem[] = [];
  
  if (role === "admin") {
    links = [
      { name: "پیشخوان مدیریت", href: "/admin", icon: LayoutDashboard },
      { name: "مدیریت شرکت‌ها", href: "/admin/companies", icon: ShieldCheck },
      { name: "مدیریت آگهی‌ها", href: "/admin/jobs", icon: Briefcase },
      { name: "کاربران پلتفرم", href: "/admin/users", icon: Users },
      { name: "دسته‌بندی‌های شغلی", href: "/admin/categories", icon: Layers },
      { name: "مدیریت تعرفه‌ها", href: "/admin/packages", icon: Package },
      { name: "گزارشات مالی", href: "/admin/transactions", icon: CreditCard },
      { name: "گزارشات تخلف", href: "/admin/reports", icon: AlertTriangle },
      { name: "تعریف آکادمی", href: "/admin/academy", icon: BookOpen }, // 👈 اضافه شد: تعریف دوره‌ها و اتصال به عناوین شغلی
      { name: "درخواست‌های آکادمی", href: "/admin/course-requests", icon: GraduationCap },
      { name: "اطلاع‌رسانی سراسری", href: "/admin/announcements", icon: Megaphone },
    ];
  } else if (role === "employer") {
    links = [
      { name: "پیشخوان", href: "/employer", icon: LayoutDashboard },
      { name: "آگهی‌های من", href: "/employer/jobs", icon: Briefcase },
      { name: "رزومه‌های دریافتی", href: "/employer/applications", icon: Users },
      { name: "پیام‌ها", href: "/employer/messages", icon: MessageSquare },
      { name: "تنظیمات شرکت", href: "/employer/settings", icon: Settings },
    ];
  } else {
    links = [
      { name: "پیشخوان", href: "/job-seeker", icon: LayoutDashboard },
      { name: "رزومه من", href: "/job-seeker/resume", icon: Briefcase },
      { name: "آکادمی و مسیر شغلی", href: "/job-seeker/academy", icon: GraduationCap },
      { name: "آگهی‌های نشان‌شده", href: "/job-seeker/saved-jobs", icon: Bookmark },
      { name: "درخواست‌های من", href: "/job-seeker/applications", icon: Users },
      { name: "پیام‌ها", href: "/job-seeker/messages", icon: MessageSquare },
      { name: "تنظیمات حساب", href: "/job-seeker/settings", icon: Settings },
    ];
  }

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
            {role === "admin" ? "مدیریت کل جابیکس" : role === "employer" ? "پنل کارفرما" : "پنل کارجو"}
          </span>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* لینک‌های منو */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href + '/') && link.href !== '/admin' && link.href !== '/employer' && link.href !== '/job-seeker');
            const isMessagesLink = link.href === '/employer/messages' || link.href === '/job-seeker/messages';
            const showChatBadge = isMessagesLink && pendingChatCount > 0;
            
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
                <span className="relative flex items-center justify-center">
                  <link.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-slate-400"} ${showChatBadge ? "animate-bell-ring text-secondary" : ""}`} />
                  {showChatBadge && (
                    <span className="absolute -right-2 -top-2 flex min-w-[16px] h-[16px] items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold text-white ring-2 ring-white shadow-md">
                      {pendingChatCount > 9 ? "+9" : pendingChatCount}
                    </span>
                  )}
                </span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* 👈 بخش خروج حذف شد: دکمه «خروج از حساب» طبق چک‌لیست فاز دوم به دراپ‌داون کاربر در DashboardHeader منتقل شد */}
      </aside>
    </>
  );
}