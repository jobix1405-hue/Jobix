"use client";

import Link from "next/link";
import { 
  Briefcase, 
  Eye, 
  Bookmark, 
  ChevronLeft, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// دیتای تستی برای داشبورد
const MOCK_STATS = {
  applied: 12,
  views: 45,
  saved: 8,
  profileCompletion: 75, // درصد تکمیل پروفایل
};

const RECENT_APPLICATIONS = [
  { id: 1, role: "برنامه‌نویس فرانت‌اند", company: "دیجی‌کالا", status: "interview", date: "۲ روز پیش" },
  { id: 2, role: "توسعه‌دهنده React", company: "اسنپ", status: "reviewed", date: "۵ روز پیش" },
  { id: 3, role: "طراح UI/UX", company: "تپسی", status: "pending", date: "هفته پیش" },
];

const RECOMMENDED_JOBS = [
  { id: "1", title: "توسعه‌دهنده ارشد فرانت‌اند", company: "علی‌بابا", location: "تهران", salary: "۳۰-۴۰ میلیون", match: 92 },
  { id: "2", title: "برنامه‌نویس React.js", company: "کافه بازار", location: "دورکاری", salary: "توافقی", match: 85 },
];

// تابع کمکی وضعیت درخواست
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending": return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-bold">در انتظار</span>;
    case "reviewed": return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">دیده شده</span>;
    case "interview": return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">مصاحبه</span>;
    default: return null;
  }
};

export default function JobSeekerDashboard() {
  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      {/* هدر داشبورد و پیام خوش‌آمدگویی */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">سلام، وقت بخیر 👋</h1>
          <p className="mt-2 text-sm text-slate-500">
            این خلاصه‌ای از فعالیت‌های شما در جابیکس است.
          </p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* ویجت‌های آماری (ردیف اول) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        
        {/* کارت درخواست‌ها */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="h-3 w-3" /> +۲ این ماه
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">درخواست‌های ارسال شده</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{MOCK_STATS.applied}</h3>
        </div>

        {/* کارت بازدید رزومه */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Eye className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="h-3 w-3" /> +۱۲٪ رشد
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">بازدید کارفرمایان از رزومه</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{MOCK_STATS.views}</h3>
        </div>

        {/* کارت آگهی‌های نشان‌شده */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Bookmark className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">آگهی‌های ذخیره شده</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{MOCK_STATS.saved}</h3>
        </div>

      </div>

      {/* گرید بخش‌های پایینی (ردیف دوم) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ستون راست (تکمیل پروفایل + پیشنهادات) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* ویجت تکمیل پروفایل */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            {/* بک‌گراند دکوری */}
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl"></div>
            
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-secondary" />
              وضعیت رزومه شما
            </h3>
            
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-slate-600 font-medium">میزان تکمیل پروفایل</span>
              <span className="text-lg font-bold text-primary">{MOCK_STATS.profileCompletion}٪</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000" 
                style={{ width: `${MOCK_STATS.profileCompletion}%` }}
              ></div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              کارفرمایان به رزومه‌هایی که بالای ۸۰٪ تکمیل شده‌اند توجه بیشتری نشان می‌دهند.
            </p>

            <Link href="/job-seeker/resume">
              <Button className="w-full rounded-xl">تکمیل رزومه</Button>
            </Link>
          </div>

          {/* ویجت آگهی‌های پیشنهادی */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">
              پیشنهادات هوشمند برای شما
            </h3>
            <div className="space-y-4">
              {RECOMMENDED_JOBS.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                  <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50 transition-all hover:border-primary/30 hover:bg-white">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {job.company}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                        تطابق: {job.match}٪
                      </span>
                      <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/jobs">
              <Button variant="ghost" className="w-full mt-4 text-sm text-primary hover:bg-primary/5">
                مشاهده همه فرصت‌ها
              </Button>
            </Link>
          </div>

        </div>

        {/* ستون چپ (آخرین درخواست‌ها) */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900">پیگیری آخرین درخواست‌ها</h3>
              <Link href="/job-seeker/applications" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                مشاهده همه <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {RECENT_APPLICATIONS.map((app) => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400">
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{app.role}</h4>
                      <p className="text-sm text-slate-500 mt-1">{app.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:w-1/3 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                    {getStatusBadge(app.status)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {app.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* بنر ارتقا رزومه */}
            <div className="mt-8 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl p-5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">آیا می‌خواهید بیشتر دیده شوید؟</h4>
                  <p className="text-xs text-slate-600 mt-1">با اضافه کردن نمونه کار و مهارت‌ها، شانس دعوت به مصاحبه را افزایش دهید.</p>
                </div>
              </div>
              <Link href="/job-seeker/resume">
                <Button variant="outline" size="sm" className="bg-white border-primary text-primary hover:bg-primary hover:text-white shrink-0">
                  ویرایش رزومه
                </Button>
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}