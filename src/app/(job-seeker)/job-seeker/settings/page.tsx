"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Clock, ChevronLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MOCK_JOBS } from "@/lib/mock-data"; // استفاده از دیتای مرکزی

export default function JobsPage() {
  // استیت برای متن جستجو و شهر
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  // منطق فیلتر کردن هوشمند مشاغل
  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = job.location.toLowerCase().includes(locationTerm.toLowerCase());
      
      return matchesSearch && matchesLocation;
    });
  }, [searchTerm, locationTerm]);

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      {/* هدر جستجو */}
      <div className="bg-white border-b border-slate-200 py-8 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="flex-1 w-full relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="عنوان شغل یا شرکت..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 bg-transparent pr-12 pl-4 text-sm focus:outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-slate-200"></div>
            <div className="flex-1 w-full relative">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="شهر..." 
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="w-full h-12 bg-transparent pr-12 pl-4 text-sm focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        {/* سایدبار فیلترها (سمت راست) */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
              <Filter className="h-5 w-5 text-primary" />
              فیلترهای پیشرفته
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              به زودی فیلترهای دسته‌بندی و حقوق به این بخش متصل خواهند شد.
            </p>
          </div>
        </aside>

        {/* لیست آگهی‌ها */}
        <div className="w-full lg:w-3/4 space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-800">
              {filteredJobs.length > 0 
                ? `تعداد ${filteredJobs.length} فرصت شغلی یافت شد` 
                : "متاسفانه شغلی با این مشخصات پیدا نشد"}
            </h2>
          </div>

          {filteredJobs.map((job) => (
            <Link 
              key={job.id} 
              href={`/jobs/${job.id}`} 
              className="group block bg-white rounded-2xl border border-slate-200 p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                    {job.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-500">{job.companyName}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                        <MapPin size={14} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                        <Briefcase size={14} /> {job.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={14} /> {job.postedAt}
                  </span>
                  <ChevronLeft className="text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-[-4px]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}