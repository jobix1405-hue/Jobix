"use client";

import { useState, useEffect } from "react";
import { Users, Building2, Briefcase, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({ seekers: 0, employers: 0, jobs: 0, applications: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: seekers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'job_seeker');
        const { count: employers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer');
        const { count: jobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
        const { count: applications } = await supabase.from('applications').select('*', { count: 'exact', head: true });

        setStats({
          seekers: seekers || 0,
          employers: employers || 0,
          jobs: jobs || 0,
          applications: applications || 0
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [supabase]);

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">پیشخوان مدیریت کُل</h1>
        <p className="mt-2 text-sm text-slate-500">خلاصه وضعیت سیستم و کاربران جابیکس در یک نگاه.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="h-6 w-6" /></div>
          </div>
          <p className="text-sm font-medium text-slate-500">کل کارجویان</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.seekers}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Building2 className="h-6 w-6" /></div>
          </div>
          <p className="text-sm font-medium text-slate-500">شرکت‌های ثبت‌شده</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.employers}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center"><Briefcase className="h-6 w-6" /></div>
          </div>
          <p className="text-sm font-medium text-slate-500">کل آگهی‌های شغلی</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.jobs}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center"><FileText className="h-6 w-6" /></div>
          </div>
          <p className="text-sm font-medium text-slate-500">کل رزومه‌های ارسالی</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.applications}</h3>
        </div>
      </div>
    </div>
  );
}