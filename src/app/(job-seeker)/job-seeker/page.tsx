"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Eye, 
  Bookmark, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Loader2,
  Map,       // 🔥 اضافه شده برای نقشه
  Sparkles   // 🔥 اضافه شده برای پیشنهاد ویژه
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { calculateMatchScore } from "@/lib/matching"; // الگوریتم هوشمند

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending": return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-bold">در انتظار</span>;
    case "reviewed": return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">دیده شده</span>;
    case "interview": return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">مصاحبه</span>;
    case "rejected": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold">رد شده</span>;
    default: return null;
  }
};

export default function JobSeekerDashboard() {
  const supabase = createClient();
  const { user } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("کارجو");
  const [stats, setStats] = useState({ applied: 0, views: 0, saved: 0, profileCompletion: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        let completionRate = 0;
        
        if (profile) {
          if (profile.first_name) setUserName(profile.first_name);
          
          const checkFields = ['first_name', 'last_name', 'job_title', 'about_me', 'skills', 'university', 'last_company'];
          const filledFields = checkFields.filter(f => profile[f] && profile[f].trim() !== '').length;
          completionRate = Math.round((filledFields / checkFields.length) * 100);
        }

        const { data: applications } = await supabase
          .from('applications')
          .select(`id, status, created_at, jobs (id, title, profiles (company_name))`)
          .eq('job_seeker_id', user.id)
          .order('created_at', { ascending: false });

        if (applications) {
          const formattedApps = applications.slice(0, 4).map((app: any) => {
            const jp = Array.isArray(app.jobs?.profiles) ? app.jobs?.profiles[0] : app.jobs?.profiles;
            return {
              id: app.id,
              role: app.jobs?.title || 'نامشخص',
              company: jp?.company_name || 'شرکت نامشخص',
              status: app.status,
              date: new Date(app.created_at).toLocaleDateString('fa-IR')
            };
          });
          setRecentApps(formattedApps);
        }

        const { count: savedCount } = await supabase
          .from('saved_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('job_seeker_id', user.id);

        // واکشی آگهی‌های فعال برای پیشنهاد هوشمند
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, title, description, profiles(company_name)')
          .eq('status', 'active');

        if (jobs && profile) {
          // محاسبه امتیاز تطابق برای هر آگهی
          const scoredJobs = jobs.map((j: any) => {
            const jp = Array.isArray(j.profiles) ? j.profiles[0] : j.profiles;
            const matchScore = calculateMatchScore(
              { job_title: profile.job_title, skills: profile.skills },
              { title: j.title, description: j.description }
            );

            return {
              id: j.id,
              title: j.title,
              company: jp?.company_name || 'نامشخص',
              match: matchScore
            };
          });

          // مرتب‌سازی بر اساس بالاترین درصد و انتخاب ۳ تای اول
          const topRecommendations = scoredJobs
            .sort((a, b) => b.match - a.match)
            .slice(0, 3);

          setRecommendedJobs(topRecommendations);
        }

        setStats({
          applied: applications?.length || 0,
          views: 0, 
          saved: savedCount || 0,
          profileCompletion: completionRate
        });

      } catch (err) {
        console.error("Error fetching job seeker dashboard:", err);
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
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">سلام {userName}، وقت بخیر 👋</h1>
          <p className="mt-2 text-sm text-slate-500">
            این خلاصه‌ای از فعالیت‌های شما در جابیکس است.
          </p>
        </div>
        
        {/* 🔥 اضافه شدن دکمه نقشه زنده */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/jobs/map">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl h-11 bg-white border-slate-200 text-slate-700 hover:text-primary hover:border-primary shadow-sm">
              <Map className="ml-2 h-4 w-4" /> نقشه زنده مشاغل
            </Button>
          </Link>
          <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">درخواست‌های ارسال شده</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.applied}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md opacity-70">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Eye className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">بازدید کارفرمایان از رزومه</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.views}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Bookmark className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">آگهی‌های ذخیره شده</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.saved}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* کارت وضعیت رزومه */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            {/* برگرداندن افکت تار زیبا */}
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl"></div>
            
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-secondary" />
              وضعیت رزومه شما
            </h3>
            
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-slate-600 font-medium">میزان تکمیل پروفایل</span>
              <span className="text-lg font-bold text-primary">{stats.profileCompletion}٪</span>
            </div>
            
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000" 
                style={{ width: `${stats.profileCompletion}%` }}
              ></div>
            </div>

            {/* برگرداندن متن راهنما */}
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              کارفرمایان به رزومه‌هایی که بالای ۸۰٪ تکمیل شده‌اند توجه بیشتری نشان می‌دهند.
            </p>

            <Link href="/job-seeker/resume">
              <Button className="w-full rounded-xl">ویرایش رزومه</Button>
            </Link>
          </div>

          {/* 🔥 کارت پیشنهاد شغلی ویژه (با ظاهر جدید) */}
          <div className="bg-white p-6 rounded-3xl border border-primary/20 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            
            <h3 className="font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              پیشنهاد شغلی ویژه برای شما
            </h3>
            
            <div className="space-y-4">
              {recommendedJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                  <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50 transition-all hover:border-primary/30 hover:bg-white">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {job.company}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        job.match >= 75 ? "bg-green-100 text-green-700" :
                        job.match >= 50 ? "bg-blue-100 text-blue-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        تطابق: {job.match}٪
                      </span>
                      <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
              {recommendedJobs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">آگهی جدیدی یافت نشد.</p>
              )}
            </div>
            
            <Link href="/jobs">
              <Button variant="ghost" className="w-full mt-4 text-sm text-primary hover:bg-primary/5">
                مشاهده همه فرصت‌ها
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900">آخرین درخواست‌ها</h3>
              <Link href="/job-seeker/applications" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                مشاهده همه <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentApps.map((app) => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{app.role}</h4>
                      <p className="text-sm text-slate-500 mt-1">{app.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:w-1/3 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                    {getStatusBadge(app.status)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {app.date}
                    </span>
                  </div>
                </div>
              ))}
              
              {recentApps.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Briefcase className="h-10 w-10 text-slate-300 mb-3" />
                  {/* برگرداندن متن صحیح */}
                  <p className="text-sm text-slate-500">هنوز برای هیچ شغلی رزومه ارسال نکرده‌اید.</p>
                </div>
              )}
            </div>

            {/* 🔥 برگرداندن باکس دعوت به تکمیل رزومه که هوش مصنوعی قبلی به اشتباه پاک کرده بود */}
            {stats.profileCompletion < 100 && (
              <div className="mt-8 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl p-5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">آیا می‌خواهید بیشتر دیده شوید؟</h4>
                    <p className="text-xs text-slate-600 mt-1">با اضافه کردن نمونه کار و مهارت‌ها، شانس دعوت به مصاحبه را افزایش دهید.</p>
                  </div>
                </div>
                <Link href="/job-seeker/resume">
                  <Button variant="outline" size="sm" className="bg-white border-primary text-primary hover:bg-primary hover:text-white shrink-0">
                    تکمیل رزومه
                  </Button>
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}