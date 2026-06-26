"use client";

import { useEffect, useState } from "react";
import { BellRing, Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // برای جلوگیری از ارور Hydration در نکست‌جی‌اس، مقدار اولیه را false می‌گذاریم
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // ۱. بررسی می‌کنیم که آیا کاربر قبلاً روی ضربدر (بستن) کلیک کرده است یا خیر؟
    const isDismissed = localStorage.getItem("jobix_pwa_dismissed");
    
    // اگر قبلاً نبسته بود، اجازه می‌دیم بنر نمایش داده بشه
    if (!isDismissed) {
      setShowBanner(true);
    }

    // ۲. بررسی قابلیت نصب (PWA)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // ۳. بررسی وضعیت دسترسی به نوتیفیکیشن‌ها
    if ("Notification" in window) {
      setIsSubscribed(Notification.permission === "granted");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const requestNotificationPermission = async () => {
    // چک کردن ایمن برای اینکه اگر پنجره مرورگر در دسترس نبود خطا ندهد
    if (typeof window === 'undefined' || !("Notification" in window)) {
      alert("مرورگر شما از نوتیفیکیشن پشتیبانی نمی‌کند.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setIsSubscribed(true);
      alert("نوتیفیکیشن‌ها با موفقیت فعال شدند!");
    }
  };

  // تابعی برای بستن بنر و ذخیره در حافظه مرورگر
  const handleDismiss = () => {
    setShowBanner(false);
    // ذخیره در LocalStorage تا با رفرش هم دوباره باز نشه
    localStorage.setItem("jobix_pwa_dismissed", "true"); 
  };

  // 👈 این خط مشکل شما رو حل می‌کنه: اول با ایمنی کامل چک می‌کنه window لود شده باشه
  const hasNotification = typeof window !== 'undefined' && "Notification" in window;
  
  // بررسی می‌کنیم آیا اصلاً نیازی هست این بنر رو نشون بدیم؟
  const needsAction = isInstallable || (!isSubscribed && hasNotification);

  // اگر کاربر قبلا بسته بود یا هر دو مورد انجام شده بود، هیچی رندر نکن
  if (!showBanner || !needsAction) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-primary/20 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900">تجربه بهتر با اپلیکیشن جابیکس</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            جابیکس را روی سیستم خود نصب کنید و از آخرین آگهی‌ها سریع‌تر مطلع شوید.
          </p>
        </div>
        
        {/* دکمه بستن که به هندلر جدید متصل شده است */}
        <button onClick={handleDismiss} className="text-slate-400 hover:text-red-500 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {isInstallable && (
          <Button onClick={handleInstallClick} className="w-full text-sm h-10 shadow-md">
            <Download className="mr-2 h-4 w-4" />
            نصب اپلیکیشن (PWA)
          </Button>
        )}
        
        {!isSubscribed && hasNotification && (
          <Button 
            onClick={requestNotificationPermission} 
            variant="outline" 
            className="w-full text-sm h-10 border-primary text-primary hover:bg-primary/5"
          >
            <BellRing className="mr-2 h-4 w-4" />
            فعال‌سازی نوتیفیکیشن‌ها
          </Button>
        )}
      </div>
    </div>
  );
}