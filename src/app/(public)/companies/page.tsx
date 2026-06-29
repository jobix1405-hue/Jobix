"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, MapPin, Search, ShieldCheck, ChevronLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Company {
  id: string;
  company_name: string;
  logo_url: string;
  bio: string;
  address: string;
  is_verified: boolean;
}

export default function CompaniesDirectoryPage() {
  const supabase = createClient();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // واکشی کاربرانی که نقش کارفرما دارند و نام شرکتشان ثبت شده
        const { data, error } = await supabase
          .from('profiles')
          .select('id, company_name, logo_url, bio, address, is_verified')
          .eq('role', 'employer')
          .not('company_name', 'is', null)
          .order('is_verified', { ascending: false }); // تایید شده‌ها اول باشن

        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [supabase]);

  // فیلتر کردن بر اساس سرچ
  const filteredCompanies = companies.filter(company => 
    company.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      
      {/* هدر صفحه */}
      <div className="bg-white border-b border-slate-200 py-12 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">
            دایرکتوری شرکت‌های برتر
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            با معتبرترین شرکت‌های ایران آشنا شوید و فرصت‌های شغلی فعال آن‌ها را بررسی کنید.
          </p>

          <div className="flex items-center gap-2 max-w-xl mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="h-5 w-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="جستجوی نام شرکت..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 flex-1 bg-transparent px-2 text-sm focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* لیست شرکت‌ها */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-slate-500 font-medium">در حال دریافت اطلاعات شرکت‌ها...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link 
                key={company.id} 
                href={`/companies/${company.id}`}
                className="group flex flex-col justify-between bg-white rounded-3xl border border-slate-200 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    {/* لوگو شرکت */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-2xl font-bold text-primary overflow-hidden shadow-sm">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
                      ) : (
                        company.company_name.charAt(0)
                      )}
                    </div>

                    <div>
                      {/* 🔥 FIX: اسم شرکت قبل از آیکون تایید قرار گرفت */}
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {company.company_name}
                        {company.is_verified && (
                          <span title="تایید شده" className="flex items-center shrink-0">
                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                          </span>
                        )}
                      </h2>

                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="line-clamp-1">{company.address || 'آدرس نامشخص'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 text-justify">
                    {company.bio || 'توضیحاتی برای این شرکت ثبت نشده است.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>مشاهده پروفایل و آگهی‌ها</span>
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center max-w-2xl mx-auto">
            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">شرکتی یافت نشد</h3>
            <p className="mt-2 text-sm text-slate-500">
              با جستجوی شما هیچ شرکتی در سیستم پیدا نشد. لطفاً نام دیگری را امتحان کنید.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}