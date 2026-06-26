"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Briefcase, Trash2, ExternalLink, 
  Loader2, AlertCircle, Building2, CalendarClock 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase";

// تایپ داده‌های آگهی برای ادمین
interface AdminJobData {
  id: string;
  title: string;
  status: string;
  created_at: string;
  views: number;
  employer: {
    company_name: string;
  };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 border border-green-200">فعال</span>;
    case "paused":
      return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">متوقف شده</span>;
    case "draft":
      return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">پیش‌نویس</span>;
    default:
      return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">نامشخص</span>;
  }
};

export default function AdminJobsPage() {
  const supabase = createClient();
  
  const [jobs, setJobs] = useState<AdminJobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // استیت‌های مودال حذف
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, title, status, created_at, views,
          profiles!jobs_employer_id_fkey (company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // مرتب‌سازی و مپ کردن داده‌ها
      const formattedJobs = data?.map((job: any) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        created_at: job.created_at,
        views: job.views,
        employer: Array.isArray(job.profiles) ? job.profiles[0] : job.profiles,
      })) || [];

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Error fetching admin jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (job.employer?.company_name && job.employer.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const confirmDelete = (id: string) => {
    setJobToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);

    try {
      // 1. حذف از دیتابیس
      const { error } = await supabase.from('jobs').delete().eq('id', jobToDelete);
      if (error) throw error;

      // 2. آپدیت UI
      setJobs(jobs.filter(job => job.id !== jobToDelete));
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("خطا در حذف آگهی. ممکن است این آگهی دارای رزومه‌های متصل باشد.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      {/* هدر */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          مدیریت آگهی‌های شغلی
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          مشاهده، نظارت و مدیریت تمامی آگهی‌های ثبت شده در جابیکس.
        </p>
      </div>

      {/* جستجو */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <Search className="h-5 w-5 text-slate-400 mr-3" />
        <input
          type="text"
          placeholder="جستجو در عنوان آگهی یا نام شرکت..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 h-10 px-3 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* لیست آگهی‌ها */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">عنوان آگهی / شرکت</th>
                <th className="px-6 py-4 font-medium text-center">وضعیت</th>
                <th className="px-6 py-4 font-medium text-center">بازدید</th>
                <th className="px-6 py-4 font-medium text-center">تاریخ ثبت</th>
                <th className="px-6 py-4 font-medium text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.employer?.company_name || 'شرکت نامشخص'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                      {job.views || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-1.5">
                        <CalendarClock className="h-4 w-4" />
                        {new Date(job.created_at).toLocaleDateString('fa-IR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/jobs/${job.id}`} target="_blank">
                          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="مشاهده در سایت">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => confirmDelete(job.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" 
                          title="حذف دائمی"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    آگهی شغلی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال تایید حذف */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="حذف دائمی آگهی"
      >
        <div className="flex flex-col items-center text-center pb-4 pt-2">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">آیا از حذف این آگهی مطمئن هستید؟</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            با حذف این آگهی توسط مدیریت، کارفرما دیگر به آن دسترسی نخواهد داشت و از سایت حذف می‌شود. (غیرقابل بازگشت)
          </p>
          <div className="mt-8 flex w-full gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              انصراف
            </Button>
            <Button className="flex-1 h-12 bg-red-600 hover:bg-red-700 border-none" onClick={executeDelete} isLoading={isDeleting}>
              بله، حذف شود
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}