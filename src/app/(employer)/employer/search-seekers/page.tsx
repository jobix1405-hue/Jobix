"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, MapPin, Code, User, Briefcase, 
  ChevronLeft, Loader2, Sparkles, Filter, X, ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";

interface SeekerProfile {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string;
  skills: string;
  address: string;
  avatar_url: string;
  about_me: string;
  work_status: string; // 👈 فیلد وضعیت اشتغال اضافه شد
}

const PAGE_SIZE = 30;

// 👈 تابع کمکی برای نمایش زیبای وضعیت اشتغال
const getWorkStatusBadge = (status: string) => {
  switch (status) {
    case 'ready': 
      return <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-md text-[10px] font-bold">🟢 آماده به کار</span>;
    case 'negotiating': 
      return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">🟡 در حال مذاکره</span>;
    case 'hired': 
      return <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold">🔴 مشغول به کار</span>;
    default: 
      return null;
  }
};

export default function SearchSeekersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [seekers, setSeekers] = useState<SeekerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [titleTerm, setTitleTerm] = useState("");
  const [skillTerm, setSkillTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchSeekers = async (pageIndex: number, isAppend: boolean = false) => {
    if (isAppend) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // 👈 فیلد work_status به کوئری اضافه شد
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, job_title, skills, address, avatar_url, about_me, work_status', { count: 'exact' })
        .eq('role', 'job_seeker')
        .eq('is_banned', false)
        .not('job_title', 'is', null);

      if (titleTerm) query = query.ilike('job_title', `%${titleTerm}%`);
      if (skillTerm) query = query.ilike('skills', `%${skillTerm}%`);
      if (locationTerm) query = query.ilike('address', `%${locationTerm}%`);

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      
      const formattedData = data || [];

      if (isAppend) {
        setSeekers(prev => [...prev, ...formattedData]);
      } else {
        setSeekers(formattedData);
      }

      if (count !== null && (pageIndex + 1) * PAGE_SIZE >= count) {
        setHasMore(false);
      } else if (formattedData.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (err) {
      console.error("Error fetching seekers:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSeekers(0, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchSeekers(0, false);
  };

  const clearFilters = () => {
    setTitleTerm("");
    setSkillTerm("");
    setLocationTerm("");
    setPage(0);
    setTimeout(() => fetchSeekers(0, false), 100);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSeekers(nextPage, true);
  };

  const activeFiltersCount = [titleTerm, skillTerm, locationTerm].filter(Boolean).length;

  return (
    <div className="flex h-full flex-col animate-in fade-in duration-500 pb-10">
      
      <button 
        onClick={() => router.back()} 
        className="mb-4 flex w-fit items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> بازگشت به پیشخوان
      </button>

      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            شکارچی استعداد (Headhunting)
            <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            در بانک رزومه‌های جابیکس جستجو کنید و بهترین نیروها را مستقیماً به مصاحبه دعوت کنید.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Filter className="h-4 w-4 text-primary" /> فیلترهای جستجو
          </h2>
          {activeFiltersCount > 0 && (
            <button 
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:text-red-700"
            >
              <X className="h-3 w-3" /> پاک کردن فیلترها
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Briefcase className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="عنوان شغلی (مثال: حسابدار)"
              value={titleTerm}
              onChange={(e) => setTitleTerm(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Code className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="مهارت (مثال: React یا فروش)"
              value={skillTerm}
              onChange={(e) => setSkillTerm(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="شهر یا استان"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto h-11 px-8 rounded-xl shadow-lg shadow-primary/20">
            <Search className="ml-2 h-4 w-4" /> جستجو در رزومه‌ها
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-500">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">در حال اسکن دیتابیس رزومه‌ها...</p>
        </div>
      ) : seekers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {seekers.map((seeker) => (
              <div 
                key={seeker.id} 
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-2xl font-bold text-slate-400 shadow-sm overflow-hidden">
                      {seeker.avatar_url ? (
                        <img src={seeker.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                          {seeker.first_name ? `${seeker.first_name} ${seeker.last_name}` : "کارجو (بدون نام)"}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-500 line-clamp-1">
                        {seeker.job_title}
                      </p>
                      
                      {/* 👈 نمایش وضعیت اشتغال در کارت جستجو */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {getWorkStatusBadge(seeker.work_status)}
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <MapPin className="h-3 w-3" /> {seeker.address || "مکان نامشخص"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {seeker.about_me && (
                    <p className="mt-4 text-xs leading-relaxed text-slate-500 line-clamp-2 text-justify">
                      {seeker.about_me}
                    </p>
                  )}

                  {seeker.skills && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {seeker.skills.split(',').slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                          {skill.trim()}
                        </span>
                      ))}
                      {seeker.skills.split(',').length > 4 && (
                        <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                          +{seeker.skills.split(',').length - 4} بیشتر
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link href={`/employer/applications/${seeker.id}`}>
                    <Button variant="outline" className="w-full rounded-xl bg-slate-50 border-slate-200 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all">
                      مشاهده پروفایل و ارسال پیام
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore} 
                isLoading={isLoadingMore}
                className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white shadow-sm px-8"
              >
                {!isLoadingMore && <ChevronDown className="ml-2 h-4 w-4" />}
                نمایش کارجویان بیشتر
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center shadow-sm">
          <div className="mb-4 rounded-full bg-slate-50 p-4">
            <Search className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">کارجویی یافت نشد</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            با فیلترهای فعلی هیچ رزومه‌ای در سیستم پیدا نشد. لطفاً فیلترها را تغییر دهید و دوباره تلاش کنید.
          </p>
        </div>
      )}
    </div>
  );
}