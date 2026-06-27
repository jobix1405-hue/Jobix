"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Briefcase, Building2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, setUser, isAuthLoading } = useStore();
  
  const [loadingRole, setLoadingRole] = useState<"job_seeker" | "employer" | null>(null);

  useEffect(() => {
    // اگر کاربر لاگین بود و از قبل نقش داشت، به صفحه اشتباهی نیاید
    if (!isAuthLoading && user?.role) {
      const route = user.role === "admin" ? "/admin" : (user.role === "employer" ? "/employer" : "/job-seeker");
      router.replace(route);
    }
  }, [user, isAuthLoading, router]);

  const handleSelectRole = async (role: "job_seeker" | "employer") => {
    if (!user?.id) return;
    
    setLoadingRole(role);
    try {
      // بروزرسانی پروفایلی که توسط تریگر دیتابیس ساخته شده
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // اگر نقش کارفرما بود، یک آگهی رایگان ۳۰ روزه بهش هدیه میدیم
      if (role === "employer") {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);
        
        const { error: subError } = await supabase.from('employer_subscriptions').insert({
          employer_id: user.id,
          total_jobs: 1, 
          used_jobs: 0,
          expires_at: expireDate.toISOString()
        });
        
        if (subError) console.error("Error giving free job package:", subError);
      }

      // تنظیم استیت و رفتن به پنل مربوطه
      setUser({ ...user, role });
      router.push(role === "employer" ? "/employer" : "/job-seeker");
      router.refresh();
      
    } catch (err) {
      console.error(err);
      alert("خطایی در ثبت اطلاعات رخ داد. لطفاً دوباره تلاش کنید.");
      setLoadingRole(null);
    }
  };

  // تا زمانی که وضعیت لاگین چک نشده، چیزی رندر نمی‌کنیم
  if (isAuthLoading || user?.role) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      
      <div className="mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
        <Image
          src="/logo-minimal.webp"
          alt="جابیکس"
          width={140}
          height={50}
          className="object-contain"
          priority
        />
      </div>

      <div className="w-full max-w-3xl text-center animate-in fade-in zoom-in-95 duration-500">
        <h1 className="flex items-center justify-center gap-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          به جابیکس خوش آمدید!
          <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          برای شروع، لطفاً مشخص کنید که با چه هدفی وارد پلتفرم شده‌اید؟
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          <button
            onClick={() => handleSelectRole("job_seeker")}
            disabled={loadingRole !== null}
            className={`group relative flex flex-col items-center rounded-3xl border-2 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              loadingRole === "job_seeker" ? "border-secondary ring-4 ring-secondary/20" : "border-slate-100 hover:border-secondary"
            }`}
          >
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-colors ${
              loadingRole === "job_seeker" ? "bg-secondary text-white" : "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white"
            }`}>
              <Briefcase className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">من کارجو هستم</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              به دنبال شغل جدید می‌گردم و می‌خواهم رزومه‌ام را برای شرکت‌های برتر ارسال کنم.
            </p>
            
            {loadingRole === "job_seeker" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
              </div>
            )}
          </button>

          <button
            onClick={() => handleSelectRole("employer")}
            disabled={loadingRole !== null}
            className={`group relative flex flex-col items-center rounded-3xl border-2 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              loadingRole === "employer" ? "border-primary ring-4 ring-primary/20" : "border-slate-100 hover:border-primary"
            }`}
          >
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-colors ${
              loadingRole === "employer" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
            }`}>
              <Building2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">من کارفرما هستم</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              به دنبال استخدام بهترین استعدادها برای شرکت و تیم توسعه خود هستم. <span className="block mt-1 font-bold text-primary">(۱ آگهی رایگان هدیه)</span>
            </p>

            {loadingRole === "employer" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            )}
          </button>

        </div>
      </div>
    </main>
  );
}