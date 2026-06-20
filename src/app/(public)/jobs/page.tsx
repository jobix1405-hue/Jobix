"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, MapPin, Briefcase, Clock, ChevronLeft, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

// دیتای تستی پیشرفته‌تر برای تست فیلترها
const MOCK_JOBS = [
  {
    id: "1",
    title: "برنامه‌نویس ارشد فرانت‌اند (React/Next.js)",
    company: "گروه فناوری دیجی‌کالا",
    location: "تهران، ونک",
    typeLabel: "تمام وقت",
    typeValue: "full-time",
    salaryLabel: "بیش از ۳۰ میلیون تومان",
    salaryValue: "30+",
    timeAgo: "۲ ساعت پیش",
    logo: "د"
  },
  {
    id: "2",
    title: "طراح رابط کاربری (UI/UX Designer)",
    company: "اسنپ",
    location: "دورکاری",
    typeLabel: "دورکاری",
    typeValue: "remote",
    salaryLabel: "توافقی",
    salaryValue: "negotiable",
    timeAgo: "۵ ساعت پیش",
    logo: "ا"
  },
  {
    id: "3",
    title: "مدیر دیجیتال مارکتینگ",
    company: "تپسی",
    location: "تهران، سعادت آباد",
    typeLabel: "تمام وقت",
    typeValue: "full-time",
    salaryLabel: "۲۰ تا ۳۰ میلیون تومان",
    salaryValue: "20-30",
    timeAgo: "۱ روز پیش",
    logo: "ت"
  },
  {
    id: "4",
    title: "توسعه‌دهنده بک‌اند (Python/Django)",
    company: "علی‌بابا",
    location: "تهران",
    typeLabel: "پاره وقت",
    typeValue: "part-time",
    salaryLabel: "۱۰ تا ۲۰ میلیون تومان",
    salaryValue: "10-20",
    timeAgo: "۲ روز پیش",
    logo: "ع"
  }
];

// کامپوننت اصلی سرچ که از SearchParams استفاده می‌کنه
function JobsSearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // خواندن مقادیر فعلی از URL
  const currentQ = searchParams.get("q") || "";
  const currentLoc = searchParams.get("loc") || "";
  const currentType = searchParams.get("type") || "";
  const currentSalary = searchParams.get("salary") || "";

  // استیت‌های محلی برای اینپوت‌های متنی (که موقع تایپ کردن لگ نداشته باشیم)
  const [searchQuery, setSearchQuery] = useState(currentQ);
  const [locationQuery, setLocationQuery] = useState(currentLoc);

  // تابع ساخت کوئری استرینگ جدید
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  // اعمال فیلتر سایدبار (رادیو باتن و چک باکس)
  const updateFilter = (key: string, value: string) => {
    router.push(pathname + "?" + createQueryString(key, value), { scroll: false });
  };

  // اعمال سرچ با دکمه "جستجوی مشاغل"
  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set("q", searchQuery);
    else params.delete("q");
    
    if (locationQuery) params.set("loc", locationQuery);
    else params.delete("loc");

    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  // حذف همه فیلترها
  const clearFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    router.push(pathname, { scroll: false });
  };

  // فیلتر کردن دیتای تستی بر اساس پارامترهای URL
  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      // سرچ متنی در عنوان و شرکت
      const matchesQ = !currentQ || 
        job.title.toLowerCase().includes(currentQ.toLowerCase()) || 
        job.company.toLowerCase().includes(currentQ.toLowerCase());
      
      // سرچ مکان
      const matchesLoc = !currentLoc || job.location.includes(currentLoc);
      
      // فیلتر نوع همکاری
      const matchesType = !currentType || job.typeValue === currentType;
      
      // فیلتر حقوق
      const matchesSalary = !currentSalary || job.salaryValue === currentSalary;

      return matchesQ && matchesLoc && matchesType && matchesSalary;
    });
  }, [currentQ, currentLoc, currentType, currentSalary]);

  const activeFiltersCount = [currentQ, currentLoc, currentType, currentSalary].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      {/* هدر جستجو */}
      <div className="bg-white border-b border-slate-200 py-8 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="flex-1 w-full relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="عنوان شغل یا مهارت (مثلاً React)..." 
                className="w-full h-12 bg-transparent pr-12 pl-4 text-sm focus:outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-slate-200"></div>
            <div className="flex-1 w-full relative">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="شهر یا استان..." 
                className="w-full h-12 bg-transparent pr-12 pl-4 text-sm focus:outline-none placeholder:text-slate-500"
              />
            </div>
            <Button onClick={handleSearchSubmit} className="w-full md:w-auto h-12 px-8 rounded-xl shrink-0">
              جستجوی مشاغل
            </Button>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* سایدبار فیلترها */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Filter className="h-5 w-5 text-primary" />
                فیلترها
              </div>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  <X className="h-3 w-3" /> حذف فیلترها
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* فیلتر نوع همکاری */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">نوع همکاری</h3>
                <div className="space-y-3">
                  {[
                    { value: "full-time", label: 'تمام وقت' },
                    { value: "part-time", label: 'پاره وقت' },
                    { value: "remote", label: 'دورکاری' },
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="jobType"
                        checked={currentType === type.value}
                        onChange={() => updateFilter("type", currentType === type.value ? "" : type.value)}
                        onClick={() => currentType === type.value && updateFilter("type", "")} // برای دیسلکت کردن
                        className="w-4 h-4 text-primary focus:ring-primary border-slate-300" 
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* فیلتر حقوق */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 border-t border-slate-100 pt-5">حقوق درخواستی</h3>
                <div className="space-y-3">
                  {[
                    { value: "negotiable", label: 'توافقی' },
                    { value: "10-20", label: '۱۰ تا ۲۰ میلیون' },
                    { value: "20-30", label: '۲۰ تا ۳۰ میلیون' },
                    { value: "30+", label: 'بیشتر از ۳۰ میلیون' },
                  ].map((salary) => (
                    <label key={salary.value} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="salaryRange"
                        checked={currentSalary === salary.value}
                        onChange={() => updateFilter("salary", currentSalary === salary.value ? "" : salary.value)}
                        onClick={() => currentSalary === salary.value && updateFilter("salary", "")}
                        className="w-4 h-4 text-primary focus:ring-primary border-slate-300" 
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{salary.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* لیست آگهی‌ها */}
        <div className="w-full lg:w-3/4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">
              <span className="text-primary">{filteredJobs.length}</span> فرصت شغلی پیدا شد
            </h2>
          </div>

          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Link 
                key={job.id} 
                href={`/jobs/${job.id}`} 
                className="group block bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                      {job.logo}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                        {job.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 font-medium">
                        {job.company}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.typeLabel}
                        </span>
                        <span className="flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs text-green-700 font-medium">
                          {job.salaryLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full gap-8">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {job.timeAgo}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      مشاهده آگهی
                      <ChevronLeft className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <Search className="h-10 w-10 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">نتیجه‌ای یافت نشد</h3>
              <p className="mt-2 text-sm text-slate-500">
                با این فیلترها آگهی شغلی پیدا نشد. لطفاً فیلترها را تغییر دهید یا کلمات دیگری را جستجو کنید.
              </p>
              <Button onClick={clearFilters} variant="outline" className="mt-6">
                پاک کردن فیلترها
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// برای جلوگیری از ارور Next.js موقع استفاده از useSearchParams در App Router
export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <JobsSearchContent />
    </Suspense>
  );
}