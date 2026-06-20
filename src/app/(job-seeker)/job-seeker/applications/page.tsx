"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  CalendarClock, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye 
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// دیتای تستی برای درخواست‌های کارجو
const MOCK_APPLICATIONS = [
  {
    id: "1",
    jobId: "1",
    jobTitle: "برنامه‌نویس ارشد فرانت‌اند (React/Next.js)",
    company: "گروه فناوری دیجی‌کالا",
    logo: "د",
    location: "تهران، ونک",
    appliedDate: "۱۴۰۳/۰۸/۱۵",
    status: "interview", // وضعیت: مصاحبه
  },
  {
    id: "2",
    jobId: "2",
    jobTitle: "طراح رابط کاربری (UI/UX Designer)",
    company: "اسنپ",
    logo: "ا",
    location: "دورکاری",
    appliedDate: "۱۴۰۳/۰۸/۱۰",
    status: "reviewed", // وضعیت: دیده شده
  },
  {
    id: "3",
    jobId: "3",
    jobTitle: "توسعه‌دهنده بک‌اند (Node.js)",
    company: "تپسی",
    logo: "ت",
    location: "تهران، سعادت آباد",
    appliedDate: "۱۴۰۳/۰۸/۰۵",
    status: "pending", // وضعیت: در انتظار بررسی
  },
  {
    id: "4",
    jobId: "4",
    jobTitle: "مدیر محصول",
    company: "علی‌بابا",
    logo: "ع",
    location: "تهران، سهروردی",
    appliedDate: "۱۴۰۳/۰۷/۲۰",
    status: "rejected", // وضعیت: رد شده
  }
];

// یک تابع کمکی برای استایل دادن به Badge وضعیت‌ها
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
        label: "تایید برای مصاحبه",
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
  // استیت برای فیلتر کردن لیست (همه، در انتظار، مصاحبه و ...)
  const [filter, setFilter] = useState<"all" | "pending" | "interview" | "rejected">("all");

  // اعمال فیلتر روی دیتا
  const filteredApplications = MOCK_APPLICATIONS.filter((app) => {
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
          وضعیت رزومه‌های ارسال شده به کارفرمایان را در این بخش پیگیری کنید.
        </p>
      </div>

      {/* تب‌های فیلتر */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all" ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          همه درخواست‌ها ({MOCK_APPLICATIONS.length})
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

      {/* لیست درخواست‌ها */}
      {filteredApplications.length > 0 ? (
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
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xl font-bold text-primary">
                    {app.logo}
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
        // حالت خالی (زمانی که فیلتر نتیجه‌ای نداره)
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">درخواستی یافت نشد</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            در این دسته‌بندی هنوز هیچ درخواستی ندارید. می‌توانید در صفحه جستجوی مشاغل، آگهی‌های جدید را بررسی کنید.
          </p>
          <Link href="/jobs" className="mt-6">
            <Button>جستجوی مشاغل جدید</Button>
          </Link>
        </div>
      )}

    </div>
  );
}