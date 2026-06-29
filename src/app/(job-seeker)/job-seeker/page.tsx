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
  Target,
  ArrowUpLeft
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
  
  // برای جلوگیری از ارور رندر اولیه هوک Zustand، آن را اینجا می‌گیریم
  const [userId, setUserId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("کارجو");
  const [stats, setStats] = useState({ applied: 0, views: 0, saved: 0, profileCompletion: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  
  // استیت‌های جدید وضعیت اشتغال
  const [workStatus, setWorkStatus] = useState<string>("ready");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    // گرفتن کاربر از سشن بجای استور برای جلوگیری از مشکلات کلاینت
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
          
          // ست کردن وضعیت اشتغال کاربر از دیتابیس
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

        // ترکیب عنوان و مهارت‌ها برای جستجوی متنی فول‌تکست
        if (profile) {
          const searchTerms = `${profile.job_title || ''} ${profile.skills ? profile.skills.split(',').join(' ') : ''}`.trim();
          
          if (searchTerms) {
            // استفاده از موتور جستجوی متنی دیتابیس به جای لود کل جدول
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
  }, [userId, supabase]);

  // هندلر تغییر وضعیت اشتغال با کلیک دکمه
  const handleUpdateWorkStatus = async (statusId: string) => {
    if (!userId || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase.from('profiles').update({ work_status: statusId }).eq('id', userId);
      if (error) throw error;
      setWorkStatus(statusId);
    } catch (err) {
      console.error(err);
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
      
      {/* 1. هدر داشبورد و تغییر وضعیت */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">سلام {userName}، وقت بخیر 👋</h1>
          <p className="mt-2 text-sm text-slate-500">
            این خلاصه‌ای از فعالیت‌های شما در جابیکس است.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* ویجت تعاملی تغییر وضعیت اشتغال در هدر */}
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
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  workStatus === s.id ? s.activeClass + " shadow-sm border border-black/5" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <Link href="/jobs/map" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl h-10 bg-white border-slate-200 text-slate-700 hover:text-primary hover:border-primary shadow-sm">
              <Map className="ml-2 h-4 w-4" /> نقشه مشاغل
            </Button>
          </Link>
        </div>
      </div>

      {/* =======================================================
          2. بنر فوق‌العاده جذاب و خلاقانه جستجوی مشاغل
      ======================================================= */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 sm:p-12 shadow-2xl border border-slate-800">
        
        {/* افکت‌های نوری پس‌زمینه */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/40 blur-[80px]"></div>
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/30 blur-[80px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* متن بنر */}
          <div className="flex-1 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-blue-200 text-xs font-bold mb-5 backdrop-blur-md shadow-inner">
              <Sparkles className="h-4 w-4 text-amber-400" /> فصل جدید مسیر حرفه‌ای شما
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              شغل رویایی خود را <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">هوشمندانه شکار کنید!</span>
            </h2>
            
            <p className="text-slate-400 max-w-xl leading-relaxed text-sm sm:text-base mx-auto md:mx-0 text-justify font-medium">
              از میان هزاران فرصت شغلی در معتبرترین شرکت‌های ایران، دقیقاً همان شغلی که با استعداد و مهارت‌های شما همخوانی دارد را پیدا کنید.
            </p>
          </div>

          {/* دکمه‌های اکشن (باگ تداخل رنگ دکمه در اینجا برطرف شد) */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 mt-2 md:mt-0">
            <Link href="/jobs" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto !bg-white !text-slate-900 hover:!bg-slate-100 h-14 px-8 rounded-2xl font-extrabold shadow-xl shadow-white/10 transition-transform hover:scale-105 border-0">
                <Search className="ml-2 h-5 w-5 text-primary" /> جستجوی تمام آگهی‌ها
              </Button>
            </Link>
            <Link href="/jobs/map" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto !bg-white/10 hover:!bg-white/20 !text-white border border-white/20 h-14 px-6 rounded-2xl font-bold backdrop-blur-md transition-transform hover:scale-105">
                <Map className="ml-2 h-5 w-5 text-blue-300" /> نقشه مشاغل زنده
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* 3. کارت‌های آماری */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Briefcase className="h-7 w-7" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">درخواست‌های ارسال شده</p>
          <h3 className="text-4xl font-extrabold text-slate-900 mt-2">{stats.applied}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Eye className="h-7 w-7" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">بازدید کارفرمایان از رزومه</p>
          <h3 className="text-4xl font-extrabold text-slate-900 mt-2">{stats.views}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <Bookmark className="h-7 w-7" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">آگهی‌های نشان‌شده</p>
          <h3 className="text-4xl font-extrabold text-slate-900 mt-2">{stats.saved}</h3>
        </div>
      </div>

      {/* 4. بخش‌های پایینی */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ستون راست و وسط */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* کارت وضعیت رزومه */}
          {stats.profileCompletion < 100 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-50/50 to-white shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  رزومه شما هنوز کامل نیست! ({stats.profileCompletion}٪)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                  کارفرمایان به رزومه‌هایی که بالای ۸۰٪ تکمیل شده‌اند توجه بیشتری نشان می‌دهند. برای شانس استخدام بالاتر، اطلاعات خود را کامل کنید.
                </p>
                
                <div className="mt-5 h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000" style={{ width: `${stats.profileCompletion}%` }}></div>
                </div>
              </div>
              <Link href="/job-seeker/resume" className="w-full sm:w-auto shrink-0">
                <Button className="w-full h-12 shadow-lg shadow-orange-600/20 bg-orange-600 hover:bg-orange-700 border-none font-bold px-8">
                  تکمیل رزومه
                </Button>
              </Link>
            </div>
          )}

          {/* کارت درخواست‌های اخیر */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                آخرین درخواست‌های ارسالی
              </h3>
              <Link href="/job-seeker/applications" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                مشاهده همه <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentApps.map((app) => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all gap-4 group">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-white transition-colors">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{app.role}</h4>
                      <p className="text-sm font-medium text-slate-500 mt-1">{app.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:w-1/3 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                    {getStatusBadge(app.status)}
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {app.date}
                    </span>
                  </div>
                </div>
              ))}
              
              {recentApps.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
                  <Briefcase className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-500">شما هنوز برای هیچ شغلی رزومه ارسال نکرده‌اید.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ستون چپ: پیشنهادهای هوشمند */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-400 to-secondary"></div>
            
            <h3 className="font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              هوش مصنوعی جابیکس
            </h3>
            <p className="text-xs text-slate-500 mb-6 text-justify leading-relaxed font-medium">
              بر اساس مهارت‌ها و رزومه شما، این موقعیت‌های شغلی بالاترین شانس استخدام را برای شما دارند:
            </p>
            
            <div className="space-y-4">
              {recommendedJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 transition-all hover:border-primary/40 hover:bg-white hover:shadow-md">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors line-clamp-1">{job.title}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5 line-clamp-1">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {job.company}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                        job.match >= 75 ? "bg-green-100 text-green-700 border border-green-200" :
                        job.match >= 50 ? "bg-blue-100 text-blue-700 border border-blue-200" :
                        "bg-orange-100 text-orange-700 border border-orange-200"
                      }`}>
                        تطابق رزومه: {job.match}٪
                      </span>
                      <ArrowUpLeft className="h-4 w-4 text-slate-400 group-hover:text-primary transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
              
              {recommendedJobs.length === 0 && (
                <div className="py-10 text-center">
                  <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    با تکمیل فیلد مهارت‌ها در رزومه خود، هوش مصنوعی ما بهترین آگهی‌ها را پیدا می‌کند.
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