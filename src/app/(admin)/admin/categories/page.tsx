"use client";

import { useState, useEffect } from "react";
import { 
  Layers, Plus, Trash2, Loader2, AlertCircle, 
  CheckCircle2, Search, GitMerge, FolderTree, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase";

interface Category {
  id: string;
  title: string;
  slug: string;
  level: number;
  parent_id: string | null;
  is_verified: boolean;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // استیت‌های فرم ایجاد
  const [creationLevel, setCreationLevel] = useState<1 | 2>(1);
  const [selectedLevel1Id, setSelectedLevel1Id] = useState(""); 
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  // 🔥 استیت‌های مودال ویرایش
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParentId, setEditParentId] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('job_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message || "خطای دیتابیس");
      }
      
      setCategories(data || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      alert("خطا در دریافت اطلاعات: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const level1Options = categories
    .filter(c => c.level === 1)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(c => ({ value: c.id, label: c.title }));

  const getParentPath = (cat: Category) => {
    if (cat.level === 1) return "گروه اصلی";
    if (cat.level === 2) {
      const parent = categories.find(c => c.id === cat.parent_id);
      return parent ? parent.title : 'نامشخص';
    }
    return "-";
  };

  // هندلر ایجاد دسته‌بندی جدید
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !slug) {
      return setError("لطفاً هم عنوان و هم نام انگلیسی را وارد کنید.");
    }
    if (creationLevel === 2 && !selectedLevel1Id) {
      return setError("برای ساخت عنوان شغلی، باید گروه اصلی آن را انتخاب کنید.");
    }
    
    setIsSubmitting(true);
    
    try {
      let finalParentId = null;
      if (creationLevel === 2) finalParentId = selectedLevel1Id;

      const { error: insertError } = await supabase
        .from('job_categories')
        .insert({ 
          title, 
          slug: slug.toLowerCase(),
          level: creationLevel,
          parent_id: finalParentId,
          is_verified: true 
        });

      if (insertError) {
        if (insertError.code === '23505') throw new Error("این نام انگلیسی (Slug) قبلاً ثبت شده است.");
        throw insertError;
      }

      setTitle("");
      setSlug("");
      fetchCategories();
      
    } catch (err: any) {
      setError(err.message || "خطا در ثبت اطلاعات");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 هندلر باز کردن مودال ویرایش
  const handleOpenEdit = (cat: Category) => {
    setCategoryToEdit(cat);
    setEditTitle(cat.title);
    setEditSlug(cat.slug);
    setEditParentId(cat.parent_id || "");
    setIsEditModalOpen(true);
  };

  // 🔥 هندلر ذخیره تغییرات ویرایش
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;

    if (!editTitle || !editSlug) {
      alert("لطفاً فیلدهای اجباری را پر کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('job_categories')
        .update({
          title: editTitle,
          slug: editSlug.toLowerCase(),
          parent_id: categoryToEdit.level === 2 ? editParentId : null
        })
        .eq('id', categoryToEdit.id);

      if (updateError) throw updateError;

      setIsEditModalOpen(false);
      fetchCategories(); // رفرش لیست
    } catch (err: any) {
      console.error("Error updating:", err);
      alert("خطا در ذخیره تغییرات. ممکن است نام انگلیسی (Slug) تکراری باشد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase.from('job_categories').update({ is_verified: true }).eq('id', id);
      if (error) throw error;
      setCategories(categories.map(c => c.id === id ? { ...c, is_verified: true } : c));
    } catch (err) {
      alert("خطا در تایید وضعیت.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این مورد مطمئن هستید؟ در صورت وجود آگهی فعال با این عنوان، سیستم اجازه حذف نخواهد داد.")) return;
    
    try {
      const { error } = await supabase.from('job_categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert("خطا! به دلیل اتصال آگهی‌های فعال به این دسته‌بندی، امکان حذف وجود ندارد. به جای حذف، آن را ویرایش کنید.");
    }
  };

  const pendingCount = categories.filter(c => !c.is_verified).length;
  
  const displayCategories = categories
    .filter(c => activeTab === "pending" ? !c.is_verified : true)
    .filter(c => c.title.includes(searchTerm) || c.slug.includes(searchTerm));

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          مدیریت دسته‌بندی‌های شغلی
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          ایجاد و ویرایش ساختار درختی مشاغل (گروه اصلی {'>'} عنوان شغلی)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ستون راست: فرم ثبت جدید */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddCategory} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4 flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              افزودن مورد جدید
            </h2>
            
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">چه چیزی می‌خواهید بسازید؟</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { level: 1, label: "گروه اصلی" },
                    { level: 2, label: "عنوان شغلی" }
                  ].map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => {
                        setCreationLevel(item.level as 1|2);
                        setError(null);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        creationLevel === item.level 
                          ? "bg-white text-primary shadow-sm" 
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                
                {creationLevel === 2 && (
                  <Select 
                    label="گروه اصلی را انتخاب کنید *"
                    options={level1Options}
                    value={selectedLevel1Id}
                    onChange={(e) => setSelectedLevel1Id(e.target.value)}
                  />
                )}

                <Input 
                  label={`عنوان ${creationLevel === 1 ? 'گروه اصلی' : 'شغلی'} (فارسی) *`}
                  placeholder={creationLevel === 1 ? "مثال: فناوری اطلاعات" : "مثال: برنامه‌نویسی"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                
                <Input 
                  label="نام انگلیسی (Slug) *" 
                  placeholder={creationLevel === 1 ? "مثال: it" : "مثال: programming"}
                  dir="ltr"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                />
              </div>

              <Button type="submit" className="w-full mt-2 h-12 rounded-xl shadow-lg shadow-primary/20" isLoading={isSubmitting}>
                <Plus className="h-4 w-4 ml-2" /> 
                ثبت و ذخیره
              </Button>
            </div>
          </form>
        </div>

        {/* ستون چپ: لیست دیتاها */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex gap-2 w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 sm:flex-none relative px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "pending" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                صندوق بررسی مشاغل جدید
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "all" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                کل ساختار مشاغل
              </button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">عنوان</th>
                    <th className="px-6 py-4 font-medium">مسیر درختی</th>
                    <th className="px-6 py-4 font-medium text-center">وضعیت</th>
                    <th className="px-6 py-4 font-medium text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayCategories.length > 0 ? displayCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${cat.level === 1 ? 'bg-primary' : 'bg-green-500'}`}></span>
                          {cat.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-mono" dir="ltr">{cat.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium flex items-center gap-1.5 mt-2">
                        <GitMerge className="h-4 w-4 text-slate-400" />
                        {getParentPath(cat)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {cat.is_verified ? (
                          <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded border border-green-200">تایید شده</span>
                        ) : (
                          <span className="inline-flex px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded border border-orange-200 animate-pulse">در انتظار بررسی</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          {!cat.is_verified && (
                            <button 
                              onClick={() => handleApprove(cat.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors"
                              title="تایید شغل پیشنهادی"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* 🔥 دکمه ویرایش */}
                          <button 
                            onClick={() => handleOpenEdit(cat)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                            title="ویرایش دسته‌بندی"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                        {activeTab === "pending" ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="h-10 w-10 text-green-300 mb-3" />
                            صندوق بررسی خالی است. هیچ شغل جدیدی پیشنهاد نشده.
                          </div>
                        ) : (
                          "موردی یافت نشد."
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* 🔥 مودال ویرایش دسته‌بندی */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title="ویرایش دسته‌بندی"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
          
          {categoryToEdit?.level === 2 && (
            <Select 
              label="جابجایی به یک گروه اصلی دیگر"
              options={level1Options}
              value={editParentId}
              onChange={(e) => setEditParentId(e.target.value)}
            />
          )}

          <Input 
            label="عنوان (فارسی) *"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          
          <Input 
            label="نام انگلیسی (Slug) *"
            dir="ltr"
            value={editSlug}
            onChange={(e) => setEditSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
          />

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <Button 
              type="button" 
              variant="ghost" 
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              isLoading={isSubmitting}
            >
              ذخیره تغییرات
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}