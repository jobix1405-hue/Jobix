"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  Eye,
  Users,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

// تایپ وضعیت آگهی‌ها
type JobStatus = "active" | "paused" | "draft" | "expired";

// دیتای تستی برای آگهی‌های کارفرما
const INITIAL_MY_JOBS = [
  {
    id: "job-1",
    title: "برنامه‌نویس ارشد فرانت‌اند (React/Next.js)",
    status: "active" as JobStatus,
    views: 1240,
    applicants: 45,
    createdAt: "۱۴۰۳/۰۸/۱۰",
    expiresAt: "۱۴۰۳/۰۹/۱۰",
  },
  {
    id: "job-2",
    title: "طراح رابط کاربری (UI/UX Designer)",
    status: "paused" as JobStatus,
    views: 850,
    applicants: 12,
    createdAt: "۱۴۰۳/۰۷/۱۵",
    expiresAt: "۱۴۰۳/۰۸/۱۵",
  },
  {
    id: "job-3",
    title: "توسعه‌دهنده بک‌اند (Node.js)",
    status: "draft" as JobStatus,
    views: 0,
    applicants: 0,
    createdAt: "۱۴۰۳/۰۸/۱۸",
    expiresAt: "-",
  },
  {
    id: "job-4",
    title: "مدیر محصول",
    status: "expired" as JobStatus,
    views: 3200,
    applicants: 120,
    createdAt: "۱۴۰۳/۰۵/۰۱",
    expiresAt: "۱۴۰۳/۰۶/۰۱",
  },
];

// تابع کمکی برای استایل دادن به وضعیت آگهی
const getStatusConfig = (status: JobStatus) => {
  switch (status) {
    case "active":
      return { label: "فعال", color: "bg-green-100 text-green-700 border-green-200" };
    case "paused":
      return { label: "متوقف شده", color: "bg-orange-100 text-orange-700 border-orange-200" };
    case "draft":
      return { label: "پیش‌نویس", color: "bg-slate-100 text-slate-700 border-slate-200" };
    case "expired":
      return { label: "منقضی شده", color: "bg-red-100 text-red-700 border-red-200" };
  }
};

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState(INITIAL_MY_JOBS);
  const [searchTerm, setSearchTerm] = useState("");
  
  // استیت‌های مربوط به مودال حذف
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // فیلتر کردن آگهی‌ها بر اساس سرچ
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تغییر وضعیت آگهی (فعال/متوقف)
  const toggleJobStatus = (id: string, currentStatus: JobStatus) => {
    if (currentStatus === "draft" || currentStatus === "expired") return;
    
    const newStatus = currentStatus === "active" ? "paused" : "active";
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
  };

  // هندل کردن حذف آگهی
  const confirmDelete = (id: string) => {
    setJobToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (jobToDelete) {
      setJobs(jobs.filter(job => job.id !== jobToDelete));
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500">
      
      {/* هدر صفحه و دکمه ثبت آگهی جدید */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">آگهی‌های من</h1>
          <p className="mt-2 text-sm text-slate-500">
            مدیریت، ویرایش و بررسی وضعیت آگهی‌های شغلی شرکت شما.
          </p>
        </div>
        <Link href="/employer/post-job">
          <Button className="w-full sm:w-auto rounded-xl px-6 h-12">
            <Plus className="ml-2 h-5 w-5" />
            ثبت آگهی جدید
          </Button>
        </Link>
      </div>

      {/* نوار جستجو */}
      <div className="mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <Search className="h-5 w-5 text-slate-400 mr-3" />
        <input
          type="text"
          placeholder="جستجو در عنوان آگهی‌ها..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 h-10 px-3 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* لیست آگهی‌ها */}
      <div className="flex flex-col gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const statusConfig = getStatusConfig(job.status);

            return (
              <div 
                key={job.id} 
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 transition-all hover:border-primary/30 hover:shadow-md"
              >
                {/* اطلاعات اصلی آگهی */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mt-3">
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400">تاریخ ثبت:</span> {job.createdAt}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400">انقضا:</span> {job.expiresAt}
                    </span>
                  </div>
                </div>

                {/* آمارهای آگهی */}
                <div className="flex items-center gap-6 border-y lg:border-y-0 lg:border-x border-slate-100 py-4 lg:py-0 lg:px-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">بازدید</span>
                    </div>
                    <span className="font-bold text-slate-900">{job.views.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">رزومه</span>
                    </div>
                    <span className={`font-bold ${job.applicants > 0 ? 'text-primary' : 'text-slate-900'}`}>
                      {job.applicants.toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>

                {/* دکمه‌های عملیات */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0">
                  
                  {/* دکمه رزومه‌ها (فقط اگه پیش‌نویس نباشه) */}
                  {job.status !== "draft" && (
                    <Link href={`/employer/applications?job=${job.id}`}>
                      <Button variant="outline" size="sm" className="h-10 px-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800">
                        بررسی رزومه‌ها
                      </Button>
                    </Link>
                  )}

                  {/* دکمه توقف / پخش */}
                  {(job.status === "active" || job.status === "paused") && (
                    <button 
                      onClick={() => toggleJobStatus(job.id, job.status)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      title={job.status === "active" ? "توقف موقت" : "فعال‌سازی مجدد"}
                    >
                      {job.status === "active" ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                    </button>
                  )}

                  {/* دکمه ویرایش */}
                  <Link href={`/employer/post-job?edit=${job.id}`}>
                    <button 
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      title="ویرایش آگهی"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </Link>

                  {/* دکمه حذف */}
                  <button 
                    onClick={() => confirmDelete(job.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                    title="حذف آگهی"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                </div>
              </div>
            );
          })
        ) : (
          // حالت خالی (بدون نتیجه)
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <div className="mb-4 rounded-full bg-white p-4 shadow-sm text-slate-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">آگهی یافت نشد</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              هیچ آگهی با این عنوان پیدا نشد. می‌توانید یک آگهی جدید ثبت کنید.
            </p>
          </div>
        )}
      </div>

      {/* مودال تایید حذف آگهی */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="حذف آگهی شغلی"
      >
        <div className="flex flex-col items-center text-center pb-4 pt-2">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">آیا از حذف این آگهی مطمئن هستید؟</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            با حذف این آگهی، تمامی اطلاعات آن از داشبورد شما پاک خواهد شد. رزومه‌های دریافتی همچنان در بخش رزومه‌ها باقی می‌مانند. (این عملیات غیرقابل بازگشت است)
          </p>
          
          <div className="mt-8 flex w-full gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              انصراف
            </Button>
            <Button 
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 focus:ring-red-600" 
              onClick={executeDelete}
            >
              بله، حذف شود
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}