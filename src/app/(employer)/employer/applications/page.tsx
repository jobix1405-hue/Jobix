"use client";

import { useState } from "react";
import { 
  GripVertical, 
  User, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// تعریف تایپ وضعیت‌های درخواست
type ApplicationStatus = "pending" | "reviewed" | "interview" | "rejected";

// دیتای تستی برای رزومه‌های دریافتی
const INITIAL_APPLICATIONS = [
  {
    id: "app-1",
    applicantName: "علی محمدی",
    jobTitle: "برنامه‌نویس فرانت‌اند",
    date: "۲ ساعت پیش",
    matchScore: 92, // درصد تطابق هوشمند
    status: "pending" as ApplicationStatus,
  },
  {
    id: "app-2",
    applicantName: "سارا حسینی",
    jobTitle: "طراح UI/UX",
    date: "۱ روز پیش",
    matchScore: 85,
    status: "pending" as ApplicationStatus,
  },
  {
    id: "app-3",
    applicantName: "رضا کریمی",
    jobTitle: "برنامه‌نویس فرانت‌اند",
    date: "۳ روز پیش",
    matchScore: 60,
    status: "reviewed" as ApplicationStatus,
  },
  {
    id: "app-4",
    applicantName: "مریم احمدی",
    jobTitle: "مدیر محصول",
    date: "هفته پیش",
    matchScore: 98,
    status: "interview" as ApplicationStatus,
  },
];

// تنظیمات ستون‌های کانبان
const COLUMNS = [
  { id: "pending", title: "دریافت شده", icon: Clock, color: "border-orange-200 bg-orange-50 text-orange-700" },
  { id: "reviewed", title: "در حال بررسی", icon: Eye, color: "border-blue-200 bg-blue-50 text-blue-700" },
  { id: "interview", title: "دعوت به مصاحبه", icon: CheckCircle2, color: "border-green-200 bg-green-50 text-green-700" },
  { id: "rejected", title: "رد شده", icon: XCircle, color: "border-red-200 bg-red-50 text-red-700" },
];

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  
  // استیت برای تشخیص اینکه کدوم کارت الان در حال کشیده شدنه
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  // وقتی کاربر شروع به کشیدن کارت می‌کنه
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAppId(id);
    e.dataTransfer.effectAllowed = "move";
    // برای استایل‌دهی موقع درگ کردن
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.classList.add("opacity-50");
    }, 0);
  };

  // وقتی کارت رو رها می‌کنه (پایان درگ)
  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setDraggedAppId(null);
    const element = document.getElementById(id);
    if (element) element.classList.remove("opacity-50");
  };

  // اجازه میده کارت روی ستون رها بشه
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // وقتی کارت توی ستون جدید رها میشه، وضعیتش آپدیت میشه
  const handleDrop = (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();
    if (!draggedAppId) return;

    setApplications((prev) =>
      prev.map((app) =>
        app.id === draggedAppId ? { ...app, status: newStatus } : app
      )
    );
    setDraggedAppId(null);
  };

  return (
    <div className="flex h-full flex-col animate-in fade-in duration-500">
      {/* هدر صفحه */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">مدیریت رزومه‌ها (ATS)</h1>
        <p className="mt-2 text-sm text-slate-500">
          برای تغییر وضعیت، کارت رزومه‌ها را بکشید و در ستون مورد نظر رها کنید (Drag & Drop).
        </p>
      </div>

      {/* 
        باکس اصلی کانبان 
        در موبایل به صورت عمودی و در دسکتاپ به صورت افقی (اسکرول دار) نمایش داده می‌شود
      */}
      <div className="flex flex-1 flex-col gap-6 overflow-x-auto pb-4 lg:flex-row">
        
        {COLUMNS.map((column) => {
          // فیلتر کردن رزومه‌های مربوط به این ستون
          const columnApps = applications.filter((app) => app.status === column.id);

          return (
            <div 
              key={column.id}
              className="flex min-w-[300px] flex-1 flex-col rounded-2xl bg-slate-100/50 p-4 transition-colors"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as ApplicationStatus)}
            >
              {/* هدر ستون */}
              <div className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 ${column.color}`}>
                <div className="flex items-center gap-2 font-bold">
                  <column.icon className="h-5 w-5" />
                  {column.title}
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/50 text-xs font-bold text-inherit">
                  {columnApps.length}
                </span>
              </div>

              {/* لیست کارت‌های این ستون */}
              <div className="flex flex-col gap-3 min-h-[150px]">
                {columnApps.map((app) => (
                  <div
                    key={app.id}
                    id={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onDragEnd={(e) => handleDragEnd(e, app.id)}
                    className="group relative flex cursor-grab flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:cursor-grabbing"
                  >
                    {/* آیکون درگ (نقطه چین) */}
                    <div className="absolute left-3 top-4 cursor-grab text-slate-300 group-hover:text-slate-400">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* اطلاعات فردی */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{app.applicantName}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{app.jobTitle}</p>
                      </div>
                    </div>

                    {/* تگ درصد تطابق (هوش مصنوعی) و زمان */}
                    <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {app.date}
                      </div>
                      <div className={`flex items-center gap-1 rounded-md px-2 py-1 font-bold ${
                        app.matchScore >= 90 ? "bg-green-100 text-green-700" :
                        app.matchScore >= 70 ? "bg-blue-100 text-blue-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        تطابق: {app.matchScore}٪
                      </div>
                    </div>

                    {/* دکمه‌های اکشن سریع */}
                    <div className="mt-1 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700">
                        مشاهده رزومه
                      </Button>
                    </div>
                  </div>
                ))}

                {/* اگه ستون خالی بود */}
                {columnApps.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
                    کارت را اینجا رها کنید
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}