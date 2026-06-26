"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, Bell, BellRing, Building2, ShieldCheck, User } from "lucide-react";
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

export function DashboardHeader() {
  const { toggleSidebar, user } = useStore();
  const supabase = createClient();
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // واکشی نوتیفیکیشن‌ها و گوش دادن به تغییرات زنده
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10); // گرفتن ۱۰ تای آخر

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    // اتصال به WebSockets برای دریافت زنده نوتیفیکیشن‌ها
    const channel = supabase.channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // اضافه شدن به صدر لیست
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);

  // بستن منو وقتی بیرونش کلیک میشه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // هندلر باز کردن منو و "خوانده شده" کردن پیام‌ها
  const handleToggleDropdown = async () => {
    const willOpen = !isDropdownOpen;
    setIsDropdownOpen(willOpen);

    if (willOpen && unreadCount > 0 && user?.id) {
      // صفر کردن روی رابط کاربری به صورت آنی
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      // آپدیت در دیتابیس در پس‌زمینه
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('fa-IR', {
      hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric'
    });
  };

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
        
        {/* کادر نوتیفیکیشن‌ها */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleToggleDropdown}
            className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            {unreadCount > 0 ? (
              <>
                <BellRing className="h-5 w-5 text-secondary animate-pulse" />
                <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary ring-2 ring-white"></span>
                </span>
              </>
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </button>

          {/* دراپ‌دان (منوی بازشونده) نوتیفیکیشن‌ها */}
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
                      <Link 
                        key={notif.id} 
                        href={notif.link || "#"}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`block p-4 transition-colors hover:bg-slate-50 ${!notif.is_read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-primary' : 'font-semibold text-slate-800'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">
                            {formatTime(notif.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed text-justify">
                          {notif.message}
                        </p>
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
        
        {/* اطلاعات اکانت لاگین شده */}
        <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
          <span className="hidden text-sm font-bold text-slate-700 sm:block" dir="ltr">
            {user?.phone || 'در حال بارگذاری...'}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
            {user?.role === 'employer' ? (
              <Building2 className="h-5 w-5" />
            ) : user?.role === 'admin' ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}