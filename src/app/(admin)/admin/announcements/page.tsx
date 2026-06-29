"use client";

import { useState, useEffect } from "react";
import { Megaphone, Send, Users, Building2, Globe, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase";

interface Announcement {
  id: string;
  title: string;
  body: string;
  target_role: string;
  is_active: boolean;
  created_at: string;
}

export default function AnnouncementsPage() {
  const supabase = createClient();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استیت‌های فرم
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetRole, setTargetRole] = useState<"all" | "job_seeker" | "employer">("all");

  // واکشی لیست پیام‌های قبلی
  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [supabase]);

  // ثبت پیام جدید
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return alert("لطفاً عنوان و متن پیام را وارد کنید.");

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{ title, body, target_role: targetRole, is_active: true }]);

      if (error) throw error;

      alert("پیام با موفقیت ثبت و منتشر شد.");
      setTitle("");
      setBody("");
      fetchAnnouncements(); // رفرش لیست
    } catch (err: any) {
      console.error(err);
      alert("خطا در ثبت پیام.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // حذف پیام
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پیام مطمئن هستید؟")) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("خطا در حذف پیام.");
    }
  };

  const getTargetLabel = (role: string) => {
    if (role === "job_seeker") return "کارجویان";
    if (role === "employer") return "کارفرمایان";
    return "همه کاربران";
  };

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500 space-y-8 pb-10">
      
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          مدیریت اطلاعیه‌ها (Announcements)
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          پیام‌های ثبت شده در این بخش، مستقیماً در داشبورد کاربران به صورت یک بنر جذاب نمایش داده می‌شوند.
        </p>
      </div>

      {/* فرم ثبت پیام */}
      <form onSubmit={handleSendAnnouncement} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          
          <div>
            <label className="text-sm font-bold text-slate-700 mb-3 block">گیرندگان پیام را مشخص کنید *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="relative cursor-pointer">
                <input type="radio" name="audience" value="all" checked={targetRole === "all"} onChange={() => setTargetRole("all")} className="peer hidden" />
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 text-slate-500 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                  <Globe className="h-6 w-6 mb-2" />
                  <span className="font-bold text-sm">همه کاربران</span>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input type="radio" name="audience" value="job_seeker" checked={targetRole === "job_seeker"} onChange={() => setTargetRole("job_seeker")} className="peer hidden" />
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 text-slate-500 peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-600 transition-all">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="font-bold text-sm">فقط کارجویان</span>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input type="radio" name="audience" value="employer" checked={targetRole === "employer"} onChange={() => setTargetRole("employer")} className="peer hidden" />
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 text-slate-500 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600 transition-all">
                  <Building2 className="h-6 w-6 mb-2" />
                  <span className="font-bold text-sm">فقط کارفرمایان</span>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <Input 
              label="عنوان پیام *" 
              placeholder="مثال: قطعی موقت سرورها در روز جمعه" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />

            <Textarea 
              label="متن پیام *" 
              placeholder="توضیحات کامل..." 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
          <Button type="submit" size="lg" className="rounded-xl px-10 shadow-lg shadow-primary/20 h-12" isLoading={isSubmitting}>
            <Send className="ml-2 h-5 w-5" />
            انتشار اطلاعیه
          </Button>
        </div>
      </form>

      {/* لیست پیام‌های ثبت شده */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800">اطلاعیه‌های منتشر شده</h2>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : announcements.length > 0 ? (
            <table className="w-full text-right text-sm">
              <thead className="bg-white text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">عنوان پیام</th>
                  <th className="px-6 py-4 font-medium text-center">مخاطبین</th>
                  <th className="px-6 py-4 font-medium text-center">تاریخ انتشار</th>
                  <th className="px-6 py-4 font-medium text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xs">{item.body}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold border border-slate-200">
                        {getTargetLabel(item.target_role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500" dir="ltr">
                      {new Date(item.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="حذف دائمی">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>هیچ اطلاعیه‌ای در سیستم ثبت نشده است.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}