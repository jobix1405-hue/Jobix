"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Edit2, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase";

interface JobPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  job_count: number;
  duration_days: number;
  is_active: boolean;
}

export default function AdminPackagesPage() {
  const supabase = createClient();
  const [packages, setPackages] = useState<JobPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // استیت‌های مودال ویرایش/افزودن
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPkg, setEditingPkg] = useState<JobPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // فیلدهای فرم
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    job_count: "",
    duration_days: "",
    is_active: true
  });

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [supabase]);

  // باز کردن مودال برای ایجاد بسته جدید
  const handleAddNew = () => {
    setEditingPkg(null);
    setFormData({ name: "", description: "", price: "", job_count: "", duration_days: "", is_active: true });
    setError(null);
    setIsModalOpen(true);
  };

  // باز کردن مودال برای ویرایش
  const handleEdit = (pkg: JobPackage) => {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price.toString(),
      job_count: pkg.job_count.toString(),
      duration_days: pkg.duration_days.toString(),
      is_active: pkg.is_active
    });
    setError(null);
    setIsModalOpen(true);
  };

  // ذخیره در دیتابیس (Insert یا Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.job_count || !formData.duration_days) {
      setError("لطفاً تمامی فیلدهای ستاره‌دار را پر کنید.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      job_count: Number(formData.job_count),
      duration_days: Number(formData.duration_days),
      is_active: formData.is_active
    };

    try {
      if (editingPkg) {
        // بروزرسانی
        const { error: updateError } = await supabase
          .from('packages')
          .update(payload)
          .eq('id', editingPkg.id);
        if (updateError) throw updateError;
      } else {
        // ساخت جدید
        const { error: insertError } = await supabase
          .from('packages')
          .insert(payload);
        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      fetchPackages(); // رفرش لیست
    } catch (err: any) {
      setError(err.message || "خطا در ذخیره اطلاعات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // تغییر سریع وضعیت فعال/غیرفعال از روی جدول
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      setPackages(packages.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
      await supabase.from('packages').update({ is_active: !currentStatus }).eq('id', id);
    } catch (err) {
      alert("خطا در تغییر وضعیت.");
    }
  };

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      {/* هدر */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            مدیریت تعرفه‌ها و اشتراک‌ها
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            قیمت‌گذاری و ایجاد بسته‌های ثبت آگهی برای کارفرمایان.
          </p>
        </div>
        <Button onClick={handleAddNew} className="rounded-xl px-6 h-12 shadow-sm">
          <Plus className="ml-1 h-5 w-5" /> تعریف بسته جدید
        </Button>
      </div>

      {/* لیست تعرفه‌ها */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">نام بسته</th>
                <th className="px-6 py-4 font-medium text-center">تعداد آگهی</th>
                <th className="px-6 py-4 font-medium text-center">اعتبار (روز)</th>
                <th className="px-6 py-4 font-medium text-center">قیمت (تومان)</th>
                <th className="px-6 py-4 font-medium text-center">وضعیت نمایش</th>
                <th className="px-6 py-4 font-medium text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.length > 0 ? packages.map((pkg) => (
                <tr key={pkg.id} className={`transition-colors ${pkg.is_active ? 'hover:bg-slate-50/50' : 'bg-slate-50/50 opacity-70'}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-base">{pkg.name}</div>
                    <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={pkg.description}>
                      {pkg.description || 'بدون توضیحات'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">
                    {pkg.job_count}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">
                    {pkg.duration_days}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-extrabold text-primary text-base bg-primary/5 px-3 py-1 rounded-lg">
                      {(pkg.price / 10).toLocaleString('fa-IR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleActiveStatus(pkg.id, pkg.is_active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        pkg.is_active 
                          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                      }`}
                      title="برای تغییر وضعیت کلیک کنید"
                    >
                      {pkg.is_active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {pkg.is_active ? 'فعال' : 'غیرفعال'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button 
                      onClick={() => handleEdit(pkg)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors mr-auto"
                      title="ویرایش بسته"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">هیچ بسته‌ای تعریف نشده است.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال ساخت / ویرایش بسته */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingPkg ? "ویرایش تعرفه" : "تعریف تعرفه جدید"}
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <Input 
            label="نام بسته (مثال: پایه، حرفه‌ای، سازمانی) *" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          
          <Input 
            label="توضیح کوتاه زیر نام بسته" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="مثال: مناسب برای استارتاپ‌های کوچک"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="تعداد مجاز ثبت آگهی *" 
              type="number"
              dir="ltr"
              value={formData.job_count}
              onChange={(e) => setFormData({...formData, job_count: e.target.value})}
            />
            <Input 
              label="اعتبار بسته (تعداد روز) *" 
              type="number"
              dir="ltr"
              value={formData.duration_days}
              onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
            />
          </div>

          <Input 
            label="قیمت به ریال *" 
            type="number"
            dir="ltr"
            placeholder="مثلاً: 1000000"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
          <p className="text-xs text-slate-500 font-medium -mt-2">
            مبلغ وارد شده: <strong className="text-primary text-sm">{(Number(formData.price || 0) / 10).toLocaleString('fa-IR')}</strong> تومان
          </p>

          <label className="flex items-center gap-3 mt-4 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-primary rounded border-slate-300"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            />
            <span className="text-sm font-bold text-slate-700">این بسته بلافاصله در سایت به کاربران نمایش داده شود</span>
          </label>

          <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" className="flex-1 h-12" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              انصراف
            </Button>
            <Button type="submit" className="flex-1 h-12" isLoading={isSubmitting}>
              {editingPkg ? "ذخیره تغییرات" : "ایجاد بسته"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}