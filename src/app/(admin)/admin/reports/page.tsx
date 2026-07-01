"use client";

import { useState, useEffect } from "react";
import { Flag, Loader2, AlertTriangle, CheckCircle2, Trash2, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function AdminReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // ۱. دریافت گزارش‌ها به همراه اطلاعات آگهی (این رابطه مستقیم و سالمه)
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select(`
            id, reason, description, status, created_at, reporter_id,
            jobs (id, title, employer_id, profiles(company_name))
          `)
          .order('created_at', { ascending: false });

        if (reportsError) throw reportsError;
        const rows = reportsData || [];

        // 🔥 رفع باگ PGRST200: قبلاً اینجا با هینت "profiles!reporter_id_fkey" سعی می‌شد
        // پروفایل گزارش‌دهنده مستقیم توی همون کوئری جوین بشه، اما این اسم دقیقاً با نام
        // کلید خارجی واقعی روی جدول reports توی دیتابیس مطابقت نداشت و خطا می‌داد.
        // برای رفع کامل مشکل (بدون وابستگی به اسم دقیق fkey)، پروفایل گزارش‌دهنده‌ها رو
        // جداگانه واکشی و توی جاوااسکریپت به گزارش‌ها وصل می‌کنیم.
        const reporterIds = Array.from(
          new Set(rows.map((r: any) => r.reporter_id).filter(Boolean))
        );

        let profilesMap: Record<string, any> = {};
        if (reporterIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, phone_number')
            .in('id', reporterIds);

          if (profilesError) throw profilesError;

          profilesMap = (profilesData || []).reduce((acc: Record<string, any>, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }

        const merged = rows.map((r: any) => ({
          ...r,
          profiles: profilesMap[r.reporter_id] || null,
        }));

        setReports(merged);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [supabase]);

  const resolveReport = async (id: string) => {
    try {
      await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
      setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    } catch (error) {
      alert("خطا در بروزرسانی");
    }
  };

  const getReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
      scam: "درخواست وجه/کلاهبرداری",
      fake: "آگهی دروغین",
      inappropriate: "محتوای نامناسب",
      other: "سایر موارد"
    };
    return reasons[reason] || reason;
  };

  if (isLoading) return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Flag className="h-6 w-6 text-red-500" /> بررسی گزارش‌های تخلف
        </h1>
        <p className="mt-2 text-sm text-slate-500">گزارشات ارسالی کارجویان در مورد آگهی‌های نامناسب.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">آگهی / شرکت</th>
              <th className="px-6 py-4 font-medium">دلیل و گزارش‌دهنده</th>
              <th className="px-6 py-4 font-medium text-center">وضعیت</th>
              <th className="px-6 py-4 font-medium text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((r) => {
              const companyProfile = Array.isArray(r.jobs?.profiles) ? r.jobs?.profiles[0] : r.jobs?.profiles;
              
              return (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{r.jobs?.title}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> {companyProfile?.company_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-red-600">{getReasonText(r.reason)}</div>
                    <div className="text-xs text-slate-500 mt-1">توسط: {r.profiles?.first_name} {r.profiles?.last_name}</div>
                    {r.description && <div className="text-xs mt-2 bg-slate-50 p-2 rounded border border-slate-100">{r.description}</div>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.status === 'resolved' ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">بررسی شده</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 animate-pulse">در انتظار بررسی</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-left">
                    {r.status !== 'resolved' && (
                      <button onClick={() => resolveReport(r.id)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100">
                        علامت‌گذاری به عنوان حل شده
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {reports.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">هیچ گزارشی ثبت نشده است.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}