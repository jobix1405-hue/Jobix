"use client";

import Link from "next/link";
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Plus,
  Building2,
  ChevronLeft,
  FileText,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// دیتای تستی برای داشبورد کارفرما
const MOCK_STATS = {
  activeJobs: 3,
  totalResumes: 124,
  unreadResumes: 12,
  totalViews: 4500,
};

const RECENT_APPLICATIONS = [
  { id: 1, applicantName: "علی محمدی", jobTitle: "برنامه‌نویس فرانت‌اند", matchScore: 92, time: "۲ ساعت پیش", isUnread: true },
  { id: 2, applicantName: "سارا حسینی", jobTitle: "طراح UI/UX", matchScore: 85, time: "۵ ساعت پیش", isUnread: true },
  { id: 3, applicantName: "رضا کریمی", jobTitle: "مدیر محصول", matchScore: 65, time: "۱ روز پیش", isUnread: false },
  { id: 4, applicantName: "مریم احمدی", jobTitle: "برنامه‌نویس فرانت‌اند", matchScore: 88, time: "۲ روز پیش", isUnread: false },
];

export default function EmployerDashboard() {
  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      {/* هدر داشبورد */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">سلام، جابیکس‌تک 👋</h1>
          <p className="mt-2 text-sm text-slate-500">
            به پنل مدیریت آگهی‌ها و استخدام خوش آمدید.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <Link href="/employer/post-job">
            <Button className="rounded-xl h-10 px-4 shadow-sm">
              <Plus className="ml-1 h-4 w-4" /> ثبت آگهی جدید
            </Button>
          </Link>
        </div>
      </div>

      {/* ویجت‌های آماری (ردیف اول) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        
        {/* کارت آگهی‌های فعال */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
              ظرفیت: ۵ آگهی
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">آگهی‌های فعال شما</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900">{MOCK_STATS.activeJobs}</h3>
            <span className="text-sm text-slate-400">مورد</span>
          </div>
        </div>

        {/* کارت رزومه‌های دریافتی */}
        <div className="bg-white p-6 rounded-3xl border border-primary/20 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
          {/* هاله پس‌زمینه کارت مهم */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg">
              {MOCK_STATS.unreadResumes} بررسی نشده
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 relative z-10">کل رزومه‌های دریافتی</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <h3 className="text-3xl font-extrabold text-slate-900">{MOCK_STATS.totalResumes}</h3>
            <span className="text-sm text-slate-400">نفر</span>
          </div>
        </div>

        {/* کارت بازدید آگهی‌ها */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
              <Eye className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="h-3 w-3" /> +۲۴٪ این هفته
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">بازدید کارجویان از آگهی‌ها</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900">{MOCK_STATS.totalViews.toLocaleString('fa-IR')}</h3>
            <span className="text-sm text-slate-400">بار</span>
          </div>
        </div>

      </div>

      {/* گرید بخش‌های پایینی (ردیف دوم) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ستون راست (آخرین رزومه‌ها) */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                آخرین رزومه‌های دریافتی
              </h3>
              <Link href="/employer/applications" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                مدیریت رزومه‌ها <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {RECENT_APPLICATIONS.map((app) => (
                <div 
                  key={app.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-colors gap-4 ${
                    app.isUnread ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-400 shadow-sm">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{app.applicantName}</h4>
                        {app.isUnread && (
                          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{app.jobTitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:w-2/5 border-t sm:border-0 border-slate-200/60 pt-3 sm:pt-0">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                      app.matchScore >= 90 ? "bg-green-100 text-green-700" :
                      app.matchScore >= 80 ? "bg-blue-100 text-blue-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      تطابق سیستم: {app.matchScore}٪
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {app.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* در صورت خالی بودن رزومه‌ها */}
            {RECENT_APPLICATIONS.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">هنوز رزومه‌ای برای آگهی‌های شما ارسال نشده است.</p>
              </div>
            )}
          </div>
        </div>

        {/* ستون چپ (وضعیت شرکت و دسترسی سریع) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* ویجت وضعیت احراز هویت */}
          <div className="bg-white p-6 rounded-3xl border border-orange-200 bg-orange-50/50 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              تکمیل اطلاعات شرکت
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              پروفایل شرکت شما تایید نشده است. کارجویان به شرکت‌های تایید شده (تیک سبز) ۳ برابر بیشتر اعتماد می‌کنند. لطفاً مدارک شرکت را تکمیل کنید.
            </p>

            <Link href="/employer/settings">
              <Button variant="outline" className="w-full rounded-xl border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white bg-white">
                تکمیل مدارک و پروفایل
              </Button>
            </Link>
          </div>

          {/* ویجت دسترسی سریع */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
              دسترسی سریع
            </h3>
            <div className="space-y-3">
              <Link href="/employer/jobs" className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" /> مدیریت آگهی‌ها
                </span>
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              </Link>
              <Link href="/employer/settings" className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" /> ویرایش صفحه شرکت
                </span>
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}