"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp, 
  Clock, 
  Plus,
  Building2,
  ChevronLeft,
  FileText,
  AlertTriangle,
  Loader2,
  Sparkles,
  Search // 👈 اضافه شدن آیکون سرچ
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

interface EmployerStats {
  activeJobs: number;
  totalResumes: number;
  unreadResumes: number;
  totalViews: number;
}

interface RecentApp {
  id: string;
  applicantName: string;
  jobTitle: string;
  matchScore: number;
  time: string;
  isUnread: boolean;
}

export default function EmployerDashboard() {
  const supabase = createClient();
  const { user } = useStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("کارفرما");
  const [isProfileVerified, setIsProfileVerified] = useState(false);
  const [stats, setStats] = useState<EmployerStats>({ activeJobs: 0, totalResumes: 0, unreadResumes: 0, totalViews: 0 });
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        // ۱. دریافت اطلاعات پروفایل شرکت
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, address')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setCompanyName(profile.company_name || "کارفرما");
          // فعلاً اگر آدرس و نام شرکت پر باشه، فرض می‌کنیم پروفایل تکمیله (تا فاز تایید ادمین)
          if (profile.company_name && profile.address) setIsProfileVerified(true);
        }

        // ۲. دریافت آمار آگهی‌ها
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, status, views')
          .eq('employer_id', user.id);

        let activeCount = 0;
        let viewsCount = 0;
        
        if (jobs) {
          jobs.forEach(job => {
            if (job.status === 'active') activeCount++;
            viewsCount += (job.views || 0);
          });
        }

        // ۳. دریافت آمار رزومه‌ها و آخرین درخواست‌ها
        const { data: applications } = await supabase
          .from('applications')
          .select(`
            id, 
            status, 
            created_at, 
            jobs!inner(title, employer_id), 
            profiles!applications_job_seeker_id_fkey(first_name, last_name)
          `)
          .eq('jobs.employer_id', user.id)
          .order('created_at', { ascending: false });

        let totalRes = 0;
        let unreadRes = 0;

        if (applications) {
          totalRes = applications.length;
          unreadRes = applications.filter(app => app.status === 'pending').length;
          
          // آماده‌سازی ۵ درخواست آخر
          const formattedApps = applications.slice(0, 5).map((app: any) => ({
            id: app.id,
            applicantName: app.profiles?.first_name ? `${app.profiles.first_name} ${app.profiles.last_name}` : "کاربر بدون نام",
            jobTitle: app.jobs?.title || "نامشخص",
            matchScore: Math.floor(Math.random() * 30) + 70, // دیتای شبیه‌سازی تا فاز AI
            time: new Date(app.created_at).toLocaleDateString('fa-IR'),
            isUnread: app.status === 'pending'
          }));
          
          setRecentApps(formattedApps);
        }

        setStats({
          activeJobs: activeCount,
          totalViews: viewsCount,
          totalResumes: totalRes,
          unreadResumes: unreadRes
        });

      } catch (err) {
        console.error("Error fetching employer dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">در حال آماده‌سازی پیشخوان...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-6">
      
      {/* هدر داشبورد */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            سلام، {companyName}
            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            به پنل مدیریت آگهی‌ها و استخدام خوش آمدید.
          </p>
        </div>
        
        {/* دکمه‌های هدر (ویرایش شده برای اضافه شدن جستجوی کارجو) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <div className="hidden lg:block text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href="/employer/search-seekers" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full rounded-xl h-10 px-4 bg-white border-slate-200 text-slate-700 hover:text-primary hover:border-primary shadow-sm">
                <Search className="ml-1 h-4 w-4" /> جستجوی کارجو
              </Button>
            </Link>
            <Link href="/employer/post-job" className="flex-1 sm:flex-none">
              <Button className="w-full rounded-xl h-10 px-4 shadow-sm">
                <Plus className="ml-1 h-4 w-4" /> ثبت آگهی جدید
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ویجت‌های آماری */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-4">
        
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">آگهی‌های فعال شما</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.activeJobs}</h3>
            <span className="text-sm text-slate-400">مورد</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-primary/20 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg">
              {stats.unreadResumes} بررسی نشده
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 relative z-10">کل رزومه‌های دریافتی</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.totalResumes}</h3>
            <span className="text-sm text-slate-400">نفر</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
              <Eye className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">بازدید کارجویان از آگهی‌ها</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.totalViews.toLocaleString('fa-IR')}</h3>
            <span className="text-sm text-slate-400">بار</span>
          </div>
        </div>

      </div>

      {/* گرید بخش‌های پایینی */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                آخرین رزومه‌های دریافتی
              </h3>
              <Link href="/employer/applications" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                مدیریت رزومه‌ها <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentApps.map((app) => (
                <div 
                  key={app.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-colors gap-4 ${
                    app.isUnread ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-400 shadow-sm">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{app.applicantName}</h4>
                        {app.isUnread && (
                          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{app.jobTitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:w-2/5 border-t sm:border-0 border-slate-200/60 pt-3 sm:pt-0">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                      app.matchScore >= 90 ? "bg-green-100 text-green-700" :
                      app.matchScore >= 80 ? "bg-blue-100 text-blue-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      تطابق سیستم: {app.matchScore}٪
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {app.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {recentApps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileText className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">هنوز رزومه‌ای برای آگهی‌های شما ارسال نشده است.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          
          {!isProfileVerified && (
            <div className="bg-white p-4 rounded-3xl border border-orange-200 bg-orange-50/50 shadow-sm relative overflow-hidden">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                تکمیل اطلاعات شرکت
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                پروفایل شرکت شما تایید نشده است. کارجویان به شرکت‌های تایید شده ۳ برابر بیشتر اعتماد می‌کنند.
              </p>
              <Link href="/employer/settings">
                <Button variant="outline" className="w-full rounded-xl border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white bg-white">
                  تکمیل مدارک و پروفایل
                </Button>
              </Link>
            </div>
          )}

          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
              دسترسی سریع
            </h3>
            <div className="space-y-3">
              <Link href="/employer/jobs" className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" /> مدیریت آگهی‌ها
                </span>
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              </Link>
              <Link href="/employer/settings" className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" /> ویرایش صفحه شرکت
                </span>
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}