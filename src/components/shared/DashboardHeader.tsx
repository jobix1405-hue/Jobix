"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, BellRing, Building2, ShieldCheck, User, Megaphone, X, ChevronDown, Settings, LogOut } from "lucide-react";
import { useStore } from "@/store/useStore";
import { createClient } from "@/lib/supabase";

interface AppNotification {
  id: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

// 👈 اینترفیس پیام‌های سراسری
interface Announcement {
  id: string;
  title: string;
  body: string;
}

export function DashboardHeader() {
  const { toggleSidebar, user, setUser } = useStore();
  const supabase = createClient();
  const router = useRouter();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 👈 استیت‌های اطلاعیه سراسری
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  // 👈 استیت‌های منوی کاربر (دراپ‌داون خروج/تنظیمات) و اطلاعات برند کارفرما
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [employerCompanyName, setEmployerCompanyName] = useState<string | null>(null);
  const [employerLogoUrl, setEmployerLogoUrl] = useState<string | null>(null);

  // واکشی نوتیفیکیشن‌ها و اطلاعیه‌ها
  useEffect(() => {
    if (!user?.id || !user?.role) return;

    const fetchDashboardData = async () => {
      // ۱. واکشی نوتیفیکیشن‌های شخصی
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifs) {
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      }

      // ۲. 👈 واکشی اطلاعیه‌های سراسری (Announcements)
      // خواندن آیدی پیام‌هایی که قبلاً کاربر بسته است از لوکال استوریج
      const dismissedIds = JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");

      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .in('target_role', ['all', user.role])
        .order('created_at', { ascending: false });

      if (announcementsData && announcementsData.length > 0) {
        // پیدا کردن اولین پیامی که کاربر آن را نبسته است
        const unreadAnnouncement = announcementsData.find(a => !dismissedIds.includes(a.id));
        if (unreadAnnouncement) {
          setActiveAnnouncement(unreadAnnouncement);
        }
      }
    };

    fetchDashboardData();

    // اتصال به WebSockets برای دریافت زنده نوتیفیکیشن‌ها
    const channel = supabase.channel(`notifications_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications(prev => [newNotif, ...prev].slice(0, 10));
          setUnreadCount(prev => prev + 1);
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, user?.role, supabase]);

  // 👈 واکشی نام شرکت و لوگو (فقط برای کارفرما) تا در هدر به‌جای شماره موبایل نمایش داده شود
  useEffect(() => {
    if (!user?.id || user?.role !== 'employer') return;

    const fetchEmployerBrand = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('company_name, logo_url')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setEmployerCompanyName(data.company_name || null);
        setEmployerLogoUrl(data.logo_url || null);
      }
    };

    fetchEmployerBrand();
  }, [user?.id, user?.role, supabase]);

  // بستن منوها وقتی بیرونشان کلیک میشه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleDropdown = async () => {
    const willOpen = !isDropdownOpen;
    setIsDropdownOpen(willOpen);
    setIsUserMenuOpen(false);

    if (willOpen && unreadCount > 0 && user?.id) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    }
  };

  // 👈 باز/بسته کردن منوی کاربر (تنظیمات و خروج)
  const handleToggleUserMenu = () => {
    setIsUserMenuOpen(prev => !prev);
    setIsDropdownOpen(false);
  };

  // 👈 تابع خروج از حساب کاربری (منتقل شده از سایدبار به این دراپ‌داون)
  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  // 👈 بستن بنر اطلاعیه
  const dismissAnnouncement = () => {
    if (!activeAnnouncement) return;
    const dismissedIds = JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");
    dismissedIds.push(activeAnnouncement.id);
    localStorage.setItem("dismissed_announcements", JSON.stringify(dismissedIds));
    setActiveAnnouncement(null);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('fa-IR', {
      hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric'
    });
  };

  // 👈 مسیر صفحه تنظیمات بر اساس نقش کاربر (ادمین فعلاً صفحه تنظیمات اختصاصی ندارد)
  const settingsHref = user?.role === 'employer'
    ? '/employer/settings'
    : user?.role === 'job_seeker'
      ? '/job-seeker/settings'
      : null;

  const roleLabel = user?.role === 'employer' ? 'حساب کارفرما' : user?.role === 'admin' ? 'مدیر سیستم' : 'حساب کارجو';

  const hasEmployerLogo = user?.role === 'employer' && !!employerLogoUrl;
  const headerDisplayName = user?.role === 'employer' && employerCompanyName ? employerCompanyName : (user?.phone || 'در حال بارگذاری...');

  return (
    <div className="flex flex-col sticky top-0 z-30 w-full">

      {/* 👈 بنر اطلاعیه سراسری ادمین (فقط اگر پیامی باشد رندر می‌شود) */}
      {activeAnnouncement && (
        <div className="bg-primary px-4 py-3 text-white flex items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
            <span className="flex items-center gap-1.5 font-bold text-yellow-300 shrink-0">
              <Megaphone className="h-4 w-4" /> {activeAnnouncement.title}
            </span>
            <span className="hidden sm:block text-primary-200">|</span>
            <p className="text-sm text-primary-50 leading-relaxed text-justify">
              {activeAnnouncement.body}
            </p>
          </div>
          <button
            onClick={dismissAnnouncement}
            className="shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="بستن پیام"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* هدر اصلی داشبورد */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggleDropdown} className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              {unreadCount > 0 ? (
                <>
                  <BellRing className="h-5 w-5 text-secondary animate-bell-ring" />
                  {/* Badge عدد نوتیفیکیشن‌های خوانده‌نشده */}
                  <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white ring-2 ring-white shadow-md">
                    {unreadCount > 9 ? "+9" : unreadCount}
                  </span>
                </>
              ) : (
                <Bell className="h-5 w-5" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top-left z-50">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm">اعلان‌ها</h3>
                  {notifications.length > 0 && (
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                      {notifications.length} پیام
                    </span>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notif) => (
                        <Link key={notif.id} href={notif.link || "#"} onClick={() => setIsDropdownOpen(false)} className={`block p-4 transition-colors hover:bg-slate-50 ${!notif.is_read ? 'bg-primary/5' : ''}`}>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-primary' : 'font-semibold text-slate-800'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">{formatTime(notif.created_at)}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed text-justify">{notif.message}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Bell className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm">هیچ اعلانی ندارید.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 👈 دراپ‌داون کاربر: جایگزین بلوک قبلی (شماره موبایل + آیکون). شامل لوگوی شرکت (کارفرما)، لینک تنظیمات/رمز عبور و دکمه خروج */}
          <div className="relative border-r border-slate-200 pr-4" ref={userMenuRef}>
            <button
              onClick={handleToggleUserMenu}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 hover:bg-slate-100 transition-colors"
            >
              <span className="hidden text-sm font-bold text-slate-700 sm:block" dir={hasEmployerLogo || (user?.role === 'employer' && employerCompanyName) ? 'rtl' : 'ltr'}>
                {headerDisplayName}
              </span>

              {hasEmployerLogo ? (
                <img
                  src={employerLogoUrl as string}
                  alt={employerCompanyName || 'لوگوی شرکت'}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
                  {user?.role === 'employer' ? <Building2 className="h-5 w-5" /> : user?.role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
              )}

              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top-left z-50">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-4 border-b border-slate-100">
                  {hasEmployerLogo ? (
                    <img
                      src={employerLogoUrl as string}
                      alt={employerCompanyName || 'لوگوی شرکت'}
                      className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
                      {user?.role === 'employer' ? <Building2 className="h-5 w-5" /> : user?.role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate" dir={user?.role === 'employer' && employerCompanyName ? 'rtl' : 'ltr'}>
                      {headerDisplayName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{roleLabel}</p>
                  </div>
                </div>

                <div className="py-2">
                  {settingsHref && (
                    <Link
                      href={settingsHref}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      تنظیمات و تغییر رمز عبور
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    خروج از حساب
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}