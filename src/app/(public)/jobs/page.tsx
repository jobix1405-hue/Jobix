"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Search, MapPin, Briefcase, Clock, ChevronLeft, 
  Filter, X, Building2, Loader2, Map 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";

const JOB_TYPES: Record<string, string> = {
  "full-time": "تمام وقت",
  "part-time": "پاره وقت",
  "remote": "دورکاری",
  "internship": "کارآموزی"
};

const SALARY_RANGES: Record<string, string> = {
  "negotiable": "توافقی",
  "10-20": "۱۰ تا ۲۰ میلیون تومان",
  "20-30": "۲۰ تا ۳۰ میلیون تومان",
  "30+": "بیشتر از ۳۰ میلیون تومان"
};

function JobsSearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const currentQ = searchParams.get("q") || "";
  const currentLoc = searchParams.get("loc") || "";
  const currentType = searchParams.get("type") || "";
  const currentSalary = searchParams.get("salary") || "";

  const [searchQuery, setSearchQuery] = useState(currentQ);
  const [locationQuery, setLocationQuery] = useState(currentLoc);

  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // واکشی آگهی‌ها با فیلترینگ مستقیم از دیتابیس
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('jobs')
          .select(`
            *,
            profiles!inner(company_name, logo_url)
          `)
          .eq('status', 'active');

        if (currentQ) {
  // استفاده از موتور جستجوی متنی (Full-Text Search) به جای سرچ ساده
  query = query.textSearch('fts_doc', currentQ, {
    config: 'simple',
    type: 'websearch'
  });
}
        if (currentLoc) query = query.ilike('location_text', `%${currentLoc}%`);
        if (currentType) query = query.eq('job_type', currentType);
        if (currentSalary) query = query.eq('salary_range', currentSalary);

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [currentQ, currentLoc, currentType, currentSalary, supabase]);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    return params.toString();
  };

  const updateFilter = (key: string, value: string) => {
    router.push(pathname + "?" + createQueryString(key, value), { scroll: false });
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set("q", searchQuery);
    else params.delete("q");
    
    if (locationQuery) params.set("loc", locationQuery);
    else params.delete("loc");

    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    router.push(pathname, { scroll: false });
  };

  const activeFiltersCount = [currentQ, currentLoc, currentType, currentSalary].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      {/* هدر جستجو */}
      <div className="bg-white border-b border-slate-200 py-8 shadow-sm relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex-1 w-full relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="عنوان شغلی یا مهارت مورد نظر..." 
                className="w-full h-12 bg-transparent pr-12 pl-4 text-sm focus:outline-none placeholder:text-slate-500 font-medium"
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
                placeholder="استان یا شهر..." 
                className="w-full h-12 bg-transparent pr-12 pl-4 text-sm focus:outline-none placeholder:text-slate-500 font-medium"
              />
            </div>
            <Button onClick={handleSearchSubmit} className="w-full md:w-auto h-12 px-8 rounded-xl shrink-0 shadow-lg shadow-primary/20">
              جستجوی مشاغل
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* سایدبار فیلترها */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sticky top-28 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Filter className="h-5 w-5 text-primary" />
                فیلترهای پیشرفته
              </div>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors bg-red-50 px-2 py-1 rounded-lg"
                >
                  <X className="h-3 w-3" /> حذف همه
                </button>
              )}
            </div>

            <div className="space-y-8">
              {/* فیلتر نوع همکاری */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" /> نوع همکاری
                </h3>
                <div className="space-y-3">
                  {[
                    { value: "full-time", label: 'تمام وقت' },
                    { value: "part-time", label: 'پاره وقت' },
                    { value: "remote", label: 'دورکاری' },
                    { value: "internship", label: 'کارآموزی' },
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentType === type.value ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary/50'}`}>
                        {currentType === type.value && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={currentType === type.value}
                        onChange={() => updateFilter("type", currentType === type.value ? "" : type.value)}
                      />
                      <span className={`text-sm transition-colors ${currentType === type.value ? 'font-bold text-primary' : 'text-slate-600 group-hover:text-slate-900'}`}>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* فیلتر حقوق */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-t border-slate-100 pt-6 flex items-center gap-2">
                  <span className="text-slate-400 font-serif text-lg leading-none">﷼</span> حقوق درخواستی
                </h3>
                <div className="space-y-3">
                  {[
                    { value: "negotiable", label: 'توافقی' },
                    { value: "10-20", label: '۱۰ تا ۲۰ میلیون' },
                    { value: "20-30", label: '۲۰ تا ۳۰ میلیون' },
                    { value: "30+", label: 'بیشتر از ۳۰ میلیون' },
                  ].map((salary) => (
                    <label key={salary.value} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${currentSalary === salary.value ? 'border-primary' : 'border-slate-300 group-hover:border-primary/50'}`}>
                        {currentSalary === salary.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <input 
                        type="radio" 
                        name="salaryRange"
                        className="hidden"
                        checked={currentSalary === salary.value}
                        onChange={() => updateFilter("salary", currentSalary === salary.value ? "" : salary.value)}
                        onClick={() => currentSalary === salary.value && updateFilter("salary", "")}
                      />
                      <span className={`text-sm transition-colors ${currentSalary === salary.value ? 'font-bold text-primary' : 'text-slate-600 group-hover:text-slate-900'}`}>{salary.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* لیست آگهی‌ها */}
        <div className="w-full lg:w-3/4 space-y-4">
          
          {/* هدر بخش لیست (دکمه نقشه اضافه شد) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              {isLoading ? "در حال کاوش..." : <><span className="text-primary">{jobs.length}</span> فرصت شغلی پیدا شد</>}
            </h2>
            
            {/* 🔥 دکمه نمایش روی نقشه */}
            <Link 
              href="/jobs/map" 
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              <Map className="h-4 w-4 text-primary" />
              نمایش روی نقشه زنده
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 py-32 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-slate-500 text-sm font-medium">در حال دریافت جدیدترین آگهی‌ها...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              {jobs.map((job) => (
                <Link 
                  key={job.id} 
                  href={`/jobs/${job.id}`} 
                  className="group block bg-white rounded-3xl border border-slate-200 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 overflow-hidden border border-slate-100 shadow-sm">
                        {job.profiles?.logo_url ? (
                          <img src={job.profiles.logo_url} alt="logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-8 w-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 transition-colors group-hover:text-primary">
                          {job.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-slate-500 font-medium flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {job.profiles?.company_name || 'شرکت نامشخص'}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-100">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {job.location_text || 'نامشخص'}
                          </span>
                          <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-100">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            {JOB_TYPES[job.job_type] || job.job_type}
                          </span>
                          <span className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 border border-green-100">
                            {SALARY_RANGES[job.salary_range] || job.salary_range}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:h-full gap-4 border-t border-slate-100 md:border-0 pt-4 md:pt-0">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(job.created_at).toLocaleDateString('fa-IR')}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-bold text-primary transition-all duration-300 md:opacity-0 md:-translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0">
                        مشاهده کامل
                        <ChevronLeft className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-24 text-center shadow-sm">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">نتیجه‌ای یافت نشد</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                با این فیلترها آگهی شغلی پیدا نشد. لطفاً فیلترها را تغییر دهید یا کلمات دیگری را جستجو کنید.
              </p>
              <Button onClick={clearFilters} variant="outline" className="mt-6 border-slate-300 text-slate-600 hover:bg-slate-50">
                <X className="h-4 w-4 ml-2" />
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
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    }>
      <JobsSearchContent />
    </Suspense>
  );
}

// آیکون تیک اختصاصی
function Check(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}