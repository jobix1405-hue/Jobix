"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Briefcase as BriefcaseIcon, 
  ChevronLeft, 
  BookmarkMinus, 
  Loader2,
  AlertCircle,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// تابع کمکی برای تبدیل نوع همکاری
const getJobTypeLabel = (type: string) => {
  const types: Record<string, string> = { "full-time": "تمام وقت", "part-time": "پاره وقت", "remote": "دورکاری", "internship": "کارآموزی" };
  return types[type] || type;
};

// تابع کمکی برای تبدیل حقوق
const getSalaryLabel = (salary: string) => {
  const salaries: Record<string, string> = { "negotiable": "توافقی", "10-20": "۱۰ تا ۲۰ میلیون", "20-30": "۲۰ تا ۳۰ میلیون", "30+": "بیشتر از ۳۰ میلیون" };
  return salaries[salary] || salary;
};

interface SavedJob {
  id: string; // آیدی رکورد ذخیره شده در جدول saved_jobs
  jobId: string; // آیدی آگهی
  title: string;
  companyName: string;
  logoUrl?: string;
  location: string;
  jobType: string;
  salary: string;
  savedAt: string;
}

export default function SavedJobsPage() {
  const supabase = createClient();
  const { user } = useStore();

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // واکشی آگهی‌های ذخیره شده
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('saved_jobs')
          .select(`
            id,
            job_id,
            created_at,
            jobs (
              title,
              location_text,
              job_type,
              salary_range,
              profiles (
                company_name,
                logo_url
              )
            )
          `)
          .eq('job_seeker_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (data) {
          const formattedData: SavedJob[] = data.map((item: any) => {
            const jobData = item.jobs || {};
            // پروفایل شرکت
            const employerProfile = Array.isArray(jobData.profiles) ? jobData.profiles[0] : jobData.profiles;
            
            return {
              id: item.id,
              jobId: item.job_id,
              title: jobData.title || "عنوان نامشخص",
              companyName: employerProfile?.company_name || "شرکت نامشخص",
              logoUrl: employerProfile?.logo_url,
              location: jobData.location_text || "نامشخص",
              jobType: jobData.job_type || "نامشخص",
              salary: jobData.salary_range || "نامشخص",
              savedAt: new Date(item.created_at).toLocaleDateString('fa-IR'),
            };
          });

          setSavedJobs(formattedData);
        }
      } catch (err: any) {
        console.error("خطا در دریافت آگهی‌های نشان‌شده:", err);
        setError("خطایی در دریافت اطلاعات رخ داد. لطفاً صفحه را مجدداً بارگذاری کنید.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, [user?.id, supabase]);

  // حذف آگهی از نشان‌شده‌ها
  const handleRemoveSavedJob = async (savedId: string) => {
    // آپدیت آنی رابط کاربری (Optimistic UI)
    const previousJobs = [...savedJobs];
    setSavedJobs(savedJobs.filter(job => job.id !== savedId));

    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedId);

      if (error) throw error;
    } catch (err) {
      console.error("Error removing saved job:", err);
      // برگرداندن به حالت قبل در صورت بروز خطا
      setSavedJobs(previousJobs);
      alert("خطا در حذف آگهی. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
      
      {/* هدر صفحه */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          آگهی‌های نشان‌شده
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          لیست فرصت‌های شغلی که ذخیره کرده‌اید تا سر فرصت بررسی کنید یا برایشان رزومه بفرستید.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* بخش لودینگ یا لیست آگهی‌ها */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium text-slate-500">در حال دریافت آگهی‌ها...</p>
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => (
            <div 
              key={job.id} 
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div>
                <div className="flex items-start gap-4">
                  {/* لوگو شرکت */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xl font-bold text-primary overflow-hidden">
                    {job.logoUrl ? (
                      <img src={job.logoUrl} alt={job.companyName} className="h-full w-full object-cover" />
                    ) : (
                      job.companyName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {job.companyName}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 border border-slate-100">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 border border-slate-100">
                    <BriefcaseIcon className="h-3 w-3 text-slate-400" />
                    {getJobTypeLabel(job.jobType)}
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 border border-green-100">
                    {getSalaryLabel(job.salary)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <button
                  onClick={() => handleRemoveSavedJob(job.id)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                >
                  <BookmarkMinus className="h-4 w-4" />
                  حذف از نشان‌شده‌ها
                </button>
                
                <Link href={`/jobs/${job.jobId}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-primary hover:bg-primary/5">
                    مشاهده آگهی <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // حالت خالی
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm text-slate-400">
            <Bookmark className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">هیچ آگهی نشان‌شده‌ای ندارید</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
            شما می‌توانید در صفحه جستجوی مشاغل، آگهی‌های جذاب را با کلیک روی دکمه "نشان کردن" ذخیره کنید تا بعداً به آن‌ها سر بزنید.
          </p>
          <Link href="/jobs" className="mt-6">
            <Button>مشاهده فرصت‌های شغلی</Button>
          </Link>
        </div>
      )}

    </div>
  );
}