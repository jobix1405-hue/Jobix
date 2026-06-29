"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Phone, CheckCircle2, Loader2, Clock, User, Check, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface CourseRequest {
  id: string;
  status: 'pending' | 'contacted' | 'registered';
  created_at: string;
  course: { title: string };
  profiles: { first_name: string; last_name: string; phone_number: string };
}

export default function AdminCourseRequestsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_requests')
        .select(`
          id, status, created_at,
          course:courses(title),
          profiles(first_name, last_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = data?.map((req: any) => ({
        ...req,
        course: Array.isArray(req.course) ? req.course[0] : req.course,
        profiles: Array.isArray(req.profiles) ? req.profiles[0] : req.profiles,
      })) || [];
      
      setRequests(formatted);
    } catch (err) {
      console.error("Error fetching course requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // آپدیت آنی UI
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
      
      const { error } = await supabase
        .from('course_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      alert("خطا در بروزرسانی وضعیت");
      fetchRequests(); // بازگردانی در صورت خطا
    }
  };

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8 pb-10">
      
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          درخواست‌های آکادمی
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          مدیریت کارجویانی که برای شرکت در دوره‌های آموزشی (ارتقای مهارت) درخواست داده‌اند.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">اطلاعات کارجو</th>
                <th className="px-6 py-4 font-medium">دوره درخواستی</th>
                <th className="px-6 py-4 font-medium text-center">تاریخ ثبت</th>
                <th className="px-6 py-4 font-medium text-center">وضعیت فعلی</th>
                <th className="px-6 py-4 font-medium text-left">تغییر وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {req.profiles?.first_name ? `${req.profiles.first_name} ${req.profiles.last_name}` : 'کارجو'}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium" dir="ltr">
                            <Phone className="h-3 w-3" /> {req.profiles?.phone_number || 'بدون شماره'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                        {req.course?.title || 'نامشخص'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {new Date(req.created_at).toLocaleDateString('fa-IR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {req.status === 'registered' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          ثبت‌نام قطعی
                        </span>
                      ) : req.status === 'contacted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          تماس گرفته شد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                          در انتظار تماس
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'contacted')}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors text-xs font-bold"
                          >
                            <Phone className="h-3.5 w-3.5" /> تماس گرفتم
                          </button>
                        )}
                        {req.status === 'contacted' && (
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'registered')}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors text-xs font-bold"
                          >
                            <Check className="h-3.5 w-3.5" /> ثبت‌نام شد
                          </button>
                        )}
                        {req.status === 'registered' && (
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" /> تکمیل شده
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    هیچ درخواستی برای آکادمی ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}