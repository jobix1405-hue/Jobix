"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Loader2, Building2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";

interface Company {
  id: string;
  company_name: string;
  phone_number: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminCompaniesPage() {
  const supabase = createClient();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name, phone_number, is_verified, created_at')
        .eq('role', 'employer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // آپدیت آنی UI
      setCompanies(companies.map(c => c.id === id ? { ...c, is_verified: !currentStatus } : c));
    } catch (err) {
      alert("خطا در تغییر وضعیت تایید شرکت.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">تایید هویت شرکت‌ها</h1>
        <p className="mt-2 text-sm text-slate-500">
          لیست کارفرمایان ثبت‌شده. به شرکت‌های معتبر تیک آبی بدهید تا کارجویان به آنها اعتماد کنند.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">نام شرکت</th>
                <th className="px-6 py-4 font-medium text-center">شماره تماس</th>
                <th className="px-6 py-4 font-medium text-center">وضعیت تایید</th>
                <th className="px-6 py-4 font-medium text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {company.company_name ? company.company_name.charAt(0) : <Building2 className="h-5 w-5" />}
                      </div>
                      <span className="font-bold text-slate-800">{company.company_name || 'نامشخص'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600" dir="ltr">
                    {company.phone_number}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {company.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                        <ShieldCheck className="h-4 w-4" /> تایید شده
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200">
                        <ShieldAlert className="h-4 w-4" /> در انتظار بررسی
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <Button
                      size="sm"
                      variant={company.is_verified ? "outline" : "primary"}
                      isLoading={processingId === company.id}
                      onClick={() => toggleVerification(company.id, company.is_verified)}
                      className={`h-9 text-xs w-32 ${company.is_verified ? 'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {!processingId && (company.is_verified ? <XCircle className="h-4 w-4 ml-1.5" /> : <CheckCircle2 className="h-4 w-4 ml-1.5" />)}
                      {company.is_verified ? 'لغو تایید' : 'تایید هویت'}
                    </Button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">هیچ شرکتی ثبت نشده است.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}