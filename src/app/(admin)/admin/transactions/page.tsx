"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, Search, ArrowDownRight, 
  ArrowUpRight, Building2, CalendarClock, Loader2 
} from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Transaction {
  id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  reference_id: string;
  created_at: string;
  employer: { company_name: string; logo_url: string };
  package: { name: string };
}

export default function AdminTransactionsPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            id, amount, status, reference_id, created_at,
            employer:profiles!transactions_employer_id_fkey(company_name, logo_url),
            package:packages!transactions_package_id_fkey(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = data?.map((txn: any) => ({
          ...txn,
          employer: Array.isArray(txn.employer) ? txn.employer[0] : txn.employer,
          package: Array.isArray(txn.package) ? txn.package[0] : txn.package,
        })) || [];

        setTransactions(formatted);

        // محاسبه کل درآمد سایت (تراکنش‌های موفق)
        const revenue = formatted
          .filter((t: Transaction) => t.status === 'success')
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
        setTotalRevenue(revenue);

      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [supabase]);

  const filteredTxns = transactions.filter(t => 
    t.employer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference_id?.includes(searchTerm)
  );

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      {/* هدر و کارت درآمد */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            گزارش مالی و تراکنش‌ها
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            مانیتورینگ پرداخت‌های کارفرمایان و درآمدهای پلتفرم جابیکس.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm min-w-[250px]">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">کل درآمد موفق سایت</p>
            <p className="text-xl font-extrabold text-green-700 mt-0.5">
              {(totalRevenue / 10).toLocaleString('fa-IR')} <span className="text-xs font-medium">تومان</span>
            </p>
          </div>
        </div>
      </div>

      {/* جستجو */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <Search className="h-5 w-5 text-slate-400 mr-3" />
        <input
          type="text"
          placeholder="جستجو نام شرکت یا کد پیگیری..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 h-10 px-3 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* لیست تراکنش‌ها */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">مشخصات کارفرما</th>
                <th className="px-6 py-4 font-medium">بسته خریداری شده</th>
                <th className="px-6 py-4 font-medium text-center">مبلغ (تومان)</th>
                <th className="px-6 py-4 font-medium text-center">کد پیگیری</th>
                <th className="px-6 py-4 font-medium text-center">وضعیت</th>
                <th className="px-6 py-4 font-medium text-center">تاریخ تراکنش</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.length > 0 ? (
                filteredTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden">
                          {txn.employer?.logo_url ? <img src={txn.employer.logo_url} alt="logo" className="w-full h-full object-cover" /> : <Building2 className="h-5 w-5" />}
                        </div>
                        <span className="font-bold text-slate-900">{txn.employer?.company_name || 'نامشخص'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {txn.package?.name || 'نامشخص'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-extrabold text-slate-900">
                        {(txn.amount / 10).toLocaleString('fa-IR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-500 bg-slate-50 rounded" dir="ltr">
                      {txn.reference_id || '---'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {txn.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          موفق
                        </span>
                      ) : txn.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          ناموفق
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                          در انتظار
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-1.5">
                        <CalendarClock className="h-4 w-4" />
                        {new Date(txn.created_at).toLocaleDateString('fa-IR')}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">تراکنشی یافت نشد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}