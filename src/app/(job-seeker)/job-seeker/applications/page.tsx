"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  CalendarClock, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// تعریف تایپ برای دیتای رزومه‌ها
type ApplicationStatus = "pending" | "reviewed" | "interview" | "rejected";

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  logoUrl?: string;
  location: string;
  appliedDate: string;
  status: ApplicationStatus;
}

// تابع کمکی برای استایل دادن به Badge وضعیت‌ها
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return {
        label: "در انتظار بررسی",
        color: "bg-orange-50 text-orange-600 border-orange-200",
        icon: <Clock className="h-4 w-4" />
      };
    case "reviewed":
      return {
        label: "دیده شده",
        color: "bg-blue-50 text-blue-600 border-blue-200",
        icon: <Eye className="h-4 w-4" />
      };
    case "interview":
      return {
        label: "دعوت به مصاحبه",
        color: "bg-green-50 text-green-600 border-green-200",
        icon: <CheckCircle2 className="h-4 w-4" />
      };
    case "rejected":
      return {
        label: "رد شده",
        color: "bg-red-50 text-red-600 border-red-200",
        icon: <XCircle className="h-4 w-4" />
      };
    default:
      return {
        label: "نامشخص",
        color: "bg-slate-50 text-slate-600 border-slate-200",
        icon: <Clock className="h-4 w-4" />
      };
  }
};

export default function ApplicationsTrackerPage() {
  const supabase = createClient();
  const { user } = useStore();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // استیت برای فیلتر کردن لیست (همه، در انتظار، مصاحبه و ...)
  const [filter, setFilter] = useState<"all" | "pending" | "interview" | "rejected">("all");

  // واکشی اطلاعات واقعی درخواست‌ها از دیتابیس
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // واکشی از جدول applications همراه با اطلاعات آگهی و کارفرما
        const { data, error: fetchError } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            created_at,
            job_id,
            jobs (
              title,
              location_text,
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
          const formattedData: JobApplication[] = data.map((app: any) => {
            const jobData = app.jobs || {};
            // پروفایل مربوط به آگهی (کارفرما) رو به صورت آرایه یا آبجکت برمی‌گردونه
            const employerProfile = Array.isArray(jobData.profiles) ? jobData.profiles[0] : jobData.profiles;
            
            return {
              id: app.id,
              jobId: app.job_id,
              jobTitle: jobData.title || "عنوان نامشخص",
              company: employerProfile?.company_name || "شرکت نامشخص",
              logoUrl: employerProfile?.logo_url,
              location: jobData.location_text || "نامشخص",
              appliedDate: new Date(app.created_at).toLocaleDateString('fa-IR'),
              status: app.status as ApplicationStatus,
            };
          });

          setApplications(formattedData);
        }
      } catch (err: any) {
        console.error("خطا در دریافت درخواست‌ها:", err);
        setError("خطایی در دریافت اطلاعات رخ داد. لطفاً صفحه را مجدداً بارگذاری کنید.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user?.id, supabase]);

  // اعمال فیلتر روی دیتا
  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    if (filter === "pending" && (app.status === "pending" || app.status === "reviewed")) return true;
    if (filter === "interview" && app.status === "interview") return true;
    if (filter === "rejected" && app.status === "rejected") return true;
    return false;
  });

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
      
      {/* هدر صفحه */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">درخواست‌های من</h1>
        <p className="mt-2 text-sm text-slate-500">
          وضعیت زنده رزومه‌های ارسال شده به کارفرمایان را در این بخش پیگیری کنید.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* تب‌های فیلتر */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all" ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          همه درخواست‌ها ({applications.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === "pending" ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          در انتظار و دیده شده
        </button>
        <button
          onClick={() => setFilter("interview")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === "interview" ? "bg-green-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          دعوت به مصاحبه
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === "rejected" ? "bg-red-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          رد شده
        </button>
      </div>

      {/* بخش لودینگ یا لیست درخواست‌ها */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium text-slate-500">در حال دریافت وضعیت درخواست‌ها...</p>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const statusConfig = getStatusBadge(app.status);
            
            return (
              <div 
                key={app.id} 
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                {/* اطلاعات اصلی */}
                <div className="flex items-start gap-4">
                  {/* لوگو یا حرف اول شرکت */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xl font-bold text-primary overflow-hidden">
                    {app.logoUrl ? (
                      <img src={app.logoUrl} alt={app.company} className="h-full w-full object-cover" />
                    ) : (
                      app.company.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {app.jobTitle}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {app.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {app.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4" />
                        ارسال در: {app.appliedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* وضعیت و دکمه */}
                <div className="flex sm:flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:border-0 sm:pt-0 sm:items-end">
                  
                  {/* تگ وضعیت */}
                  <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>

                  {/* دکمه مشاهده آگهی */}
                  <Link href={`/jobs/${app.jobId}`}>
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-400 hover:text-primary">
                      مشاهده آگهی <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // حالت خالی
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {applications.length === 0 ? "هنوز درخواستی ارسال نکرده‌اید" : "درخواستی در این دسته‌بندی یافت نشد"}
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            {applications.length === 0 
              ? "رزومه خود را تکمیل کنید و برای فرصت‌های شغلی مختلف ارسال کنید."
              : "می‌توانید در صفحه جستجوی مشاغل، آگهی‌های جدید را بررسی کنید."}
          </p>
          <Link href="/jobs" className="mt-6">
            <Button>جستجوی مشاغل جدید</Button>
          </Link>
        </div>
      )}

    </div>
  );
}