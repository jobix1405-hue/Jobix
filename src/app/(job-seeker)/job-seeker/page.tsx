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
  Map,       
  Sparkles,
  RefreshCw,
  Search,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { calculateMatchScore } from "@/lib/matching";

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
  
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("کارجو");
  const [stats, setStats] = useState({ applied: 0, views: 0, saved: 0, profileCompletion: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  
  const [workStatus, setWorkStatus] = useState<string>("ready");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase.auth]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        let completionRate = 0;
        
        if (profile) {
          if (profile.first_name) setUserName(profile.first_name);
          if (profile.work_status) setWorkStatus(profile.work_status);
          
          const checkFields = ['first_name', 'last_name', 'job_title', 'about_me', 'skills', 'university', 'last_company'];
          const filledFields = checkFields.filter(f => profile[f] && profile[f].trim() !== '').length;
          completionRate = Math.round((filledFields / checkFields.length) * 100);
        }

        const { data: applications } = await supabase
          .from('applications')
          .select(`id, status, created_at, jobs (id, title, profiles (company_name))`)
          .eq('job_seeker_id', userId)
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
          .eq('job_seeker_id', userId);

        let jobsQuery = supabase
          .from('jobs')
          .select('id, title, description, profiles(company_name)')
          .eq('status', 'active');

        if (profile) {
          const searchTerms = `${profile.job_title || ''} ${profile.skills ? profile.skills.split(',').join(' ') : ''}`.trim();
          if (searchTerms) {
            jobsQuery = jobsQuery.textSearch('fts_doc', searchTerms, { type: 'websearch', config: 'simple' });
          }
        }

        const { data: jobs } = await jobsQuery.order('created_at', { ascending: false }).limit(20);

        if (jobs && profile) {
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

          const topRecommendations = scoredJobs
            .sort((a, b) => b.match - a.match)
            .slice(0, 4); // تعداد نمایش رو کردیم ۴ تا

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
  }, [userId, supabase]);

  const handleUpdateWorkStatus = async (statusId: string) => {
    if (!userId || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase.from('profiles').update({ work_status: statusId }).eq('id', userId);
      if (error) throw error;
      setWorkStatus(statusId);
    } catch (err) {
      alert("خطا در تغییر وضعیت اشتغال");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">در حال آماده‌سازی پیشخوان...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8 pb-10">
      
      {/* 1. هدر داشبورد */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">سلام {userName}، وقت بخیر 👋</h1>
          <p className="mt-2 text-sm text-slate-500">
            این خلاصه‌ای از فعالیت‌های شما در جابیکس است.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden w-full sm:w-auto">
            {isUpdatingStatus && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <RefreshCw className="h-4 w-4 text-primary animate-spin" />
              </div>
            )}
            {[
              { id: "ready", label: "آماده به کار", activeClass: "bg-green-100 text-green-700" },
              { id: "negotiating", label: "در مذاکره", activeClass: "bg-amber-100 text-amber-700" },
              { id: "hired", label: "مشغول به کار", activeClass: "bg-slate-100 text-slate-700" }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => handleUpdateWorkStatus(s.id)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  workStatus === s.id ? s.activeClass + " shadow-sm border border-black/5" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. بنر عظیم و خیره‌کننده جستجوی مشاغل (حل مشکل UX) */}
      <div className="bg-gradient-to-r from-primary to-blue-800 rounded-[2rem] p-8 sm:p-10 text-white shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        {/* پترن‌های پس‌زمینه بنر */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl"></div>

        <div className="relative z-10 flex-1 text-center md:text-right">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 flex items-center justify-center md:justify-start gap-2">
            <Rocket className="h-8 w-8 text-amber-400" />
            شغل رویایی شما همینجاست!
          </h2>
          <p className="text-blue-100 max-w-xl leading-relaxed text-sm sm:text-base mx-auto md:mx-0 text-justify">
            از میان هزاران آگهی شغلی فعال در جابیکس، فرصت مناسب خود را پیدا کنید. می‌توانید به صورت لیستی جستجو کنید یا آگهی‌های اطراف خود را به صورت زنده روی نقشه ببینید.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
          <Link href="/jobs" className="w-full sm:w-auto">
             <Button className="w-full bg-white text-primary hover:bg-slate-50 h-14 px-8 rounded-2xl font-bold shadow-lg text-base border-none transition-transform hover:scale-105">
                <Search className="ml-2 h-5 w-5" /> جستجوی تمام آگهی‌ها
             </Button>
          </Link>
          <Link href="/jobs/map" className="w-full sm:w-auto">
             <Button className="w-full bg-blue-700/50 hover:bg-blue-600 text-white border border-blue-400/30 h-14 px-6 rounded-2xl font-bold shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
                <Map className="ml-2 h-5 w-5" /> جستجو روی نقشه
             </Button>
          </Link>
        </div>
      </div>

      {/* 3. کارت‌های آماری */}
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

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md opacity-80">
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
          <p className="text-sm font-medium text-slate-500">آگهی‌های نشان‌شده</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.saved}</h3>
        </div>
      </div>

      {/* 4. بخش‌های پایینی (مدیریت شده و مهندسی شده) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ستون راست و وسط: درخواست‌ها و تکمیل پروفایل */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* کارت درخواست‌های اخیر */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                آخرین درخواست‌های شما
              </h3>
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
                  <p className="text-sm text-slate-500">هنوز برای هیچ شغلی رزومه ارسال نکرده‌اید.</p>
                </div>
              )}
            </div>
          </div>

          {/* کارت تکمیل پروفایل */}
          {stats.profileCompletion < 100 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-50/50 to-white shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  رزومه شما کامل نیست! ({stats.profileCompletion}٪)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                  کارفرمایان به رزومه‌هایی که بالای ۸۰٪ تکمیل شده‌اند توجه بیشتری نشان می‌دهند. لطفاً مهارت‌ها و سوابق خود را تکمیل کنید.
                </p>
                
                <div className="mt-4 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${stats.profileCompletion}%` }}></div>
                </div>
              </div>
              <Link href="/job-seeker/resume" className="w-full sm:w-auto shrink-0">
                <Button className="w-full shadow-md bg-orange-600 hover:bg-orange-700 border-none">
                  تکمیل رزومه
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ستون چپ: پیشنهادهای هوشمند */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-primary/20 shadow-md relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            
            <h3 className="font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              پیشنهادهای هوشمند (AI)
            </h3>
            
            <div className="space-y-4">
              {recommendedJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 transition-all hover:border-primary/30 hover:bg-white hover:shadow-md">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors line-clamp-1">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 line-clamp-1">
                      <Building2 className="h-3 w-3 shrink-0" /> {job.company}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                        job.match >= 75 ? "bg-green-100 text-green-700 border border-green-200" :
                        job.match >= 50 ? "bg-blue-100 text-blue-700 border border-blue-200" :
                        "bg-orange-100 text-orange-700 border border-orange-200"
                      }`}>
                        تطابق: {job.match}٪
                      </span>
                      <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
              {recommendedJobs.length === 0 && (
                <div className="py-10 text-center">
                  <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    با تکمیل مهارت‌ها در رزومه خود، هوش مصنوعی جابیکس بهترین آگهی‌ها را به شما پیشنهاد می‌دهد.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}