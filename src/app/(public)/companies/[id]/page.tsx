"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, MapPin, Globe, Briefcase, ChevronRight, 
  Clock, ShieldCheck, AlertCircle, Loader2, ChevronLeft 
} from "lucide-react";
import { createClient } from "@/lib/supabase";

// توابع کمکی برای آگهی‌ها
const getJobTypeLabel = (type: string) => {
  const types: Record<string, string> = { "full-time": "تمام وقت", "part-time": "پاره وقت", "remote": "دورکاری", "internship": "کارآموزی" };
  return types[type] || type;
};

const getSalaryLabel = (salary: string) => {
  const salaries: Record<string, string> = { "negotiable": "توافقی", "10-20": "۱۰ تا ۲۰ میلیون", "20-30": "۲۰ تا ۳۰ میلیون", "30+": "بیشتر از ۳۰ میلیون" };
  return salaries[salary] || salary;
};

export default function CompanyProfilePage() {
  const params = useParams();
  const supabase = createClient();
  
  const [company, setCompany] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // ۱. واکشی اطلاعات شرکت
        const { data: companyData, error: companyError } = await supabase
          .from('profiles')
          .select('id, company_name, logo_url, bio, address, website, is_verified')
          .eq('id', params.id as string)
          .single();

        if (companyError) throw companyError;
        setCompany(companyData);

        // ۲. واکشی آگهی‌های فعال این شرکت
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, location_text, job_type, salary_range, created_at')
          .eq('employer_id', params.id as string)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!jobsError && jobsData) {
          setActiveJobs(jobsData);
        }

      } catch (err) {
        console.error("Error fetching company data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchCompanyData();
  }, [params.id, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc]">
        <AlertCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">پروفایل شرکت یافت نشد</h2>
        <Link href="/companies" className="mt-6 text-primary hover:underline">
          بازگشت به دایرکتوری شرکت‌ها
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* لینک بازگشت */}
        <Link 
          href="/companies" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary mb-6"
        >
          <ChevronRight className="h-4 w-4" />
          لیست شرکت‌ها
        </Link>

        {/* هدر پروفایل شرکت */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm mb-8">
          <div className="h-40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
            {/* پترن تزئینی */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          <div className="px-6 pb-8 pt-0 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16">
              {/* لوگو شرکت */}
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl bg-white border-4 border-white shadow-lg text-5xl font-bold text-primary overflow-hidden z-10">
                {company.logo_url ? (
                  <img src={company.logo_url} alt="logo" className="w-full h-full object-cover"/>
                ) : (
                  company.company_name.charAt(0)
                )}
              </div>
              
              <div className="mb-2 flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  {company.company_name}
                  {company.is_verified && (
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full border border-blue-200 align-middle">
                      <ShieldCheck className="h-4 w-4" /> تایید شده
                    </span>
                  )}
                </h1>
                
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                  {company.address && (
                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {company.address}
                    </span>
                  )}
                  {company.website && (
                    <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hover:text-primary transition-colors" dir="ltr">
                      <Globe className="h-4 w-4 text-slate-400" />
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ستون درباره شرکت */}
          <div className="lg:col-span-1 space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                درباره شرکت
              </h2>
              {company.bio ? (
                <p className="text-slate-600 leading-relaxed text-sm text-justify whitespace-pre-wrap">
                  {company.bio}
                </p>
              ) : (
                <p className="text-slate-400 text-sm">توضیحاتی ثبت نشده است.</p>
              )}
            </div>
          </div>

          {/* ستون آگهی‌های فعال */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-secondary" />
              فرصت‌های شغلی فعال ({activeJobs.length})
            </h2>

            {activeJobs.length > 0 ? (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <Link 
                    key={job.id} 
                    href={`/jobs/${job.id}`} 
                    className="group block bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                          {job.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 border border-slate-100">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location_text || 'نامشخص'}
                          </span>
                          <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 border border-slate-100">
                            <Briefcase className="h-3.5 w-3.5" />
                            {getJobTypeLabel(job.job_type)}
                          </span>
                          <span className="flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 font-medium border border-green-100">
                            {getSalaryLabel(job.salary_range)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(job.created_at).toLocaleDateString('fa-IR')}
                        </span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 mt-2">
                          مشاهده
                          <ChevronLeft className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <Briefcase className="h-10 w-10 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">آگهی فعالی وجود ندارد</h3>
                <p className="mt-2 text-sm text-slate-500">
                  این شرکت در حال حاضر هیچ فرصت شغلی بازی ندارد.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}