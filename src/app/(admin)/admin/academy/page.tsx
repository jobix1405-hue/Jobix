"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap, Plus, Trash2, Loader2, AlertCircle,
  Edit2, Search, Tag, Link as LinkIcon, Clock,
  Eye, EyeOff, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase";

interface Course {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  related_job_titles: string;
  external_url: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  title: "",
  description: "",
  duration: "",
  related_job_titles: "",
  external_url: "",
};

export default function AdminAcademyPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // فرم ایجاد دوره جدید
  const [form, setForm] = useState(emptyForm);

  // مودال ویرایش
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw new Error(fetchError.message || "خطای دیتابیس");
      setCourses(data || []);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      alert("خطا در دریافت دوره‌ها: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      return setError("عنوان دوره الزامی است.");
    }
    if (!form.related_job_titles.trim()) {
      return setError("حداقل یک عنوان شغلی مرتبط را وارد کنید (با کاما جدا کنید).");
    }

    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("courses").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        duration: form.duration.trim() || null,
        related_job_titles: form.related_job_titles.trim(),
        external_url: form.external_url.trim() || null,
        is_active: true,
      });

      if (insertError) throw insertError;

      setForm(emptyForm);
      fetchCourses();
    } catch (err: any) {
      console.error("Error adding course:", err);
      setError(err.message || "خطا در ثبت دوره");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (course: Course) => {
    setCourseToEdit(course);
    setEditForm({
      title: course.title,
      description: course.description || "",
      duration: course.duration || "",
      related_job_titles: course.related_job_titles || "",
      external_url: course.external_url || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseToEdit) return;

    if (!editForm.title.trim() || !editForm.related_job_titles.trim()) {
      alert("عنوان دوره و عناوین شغلی مرتبط الزامی هستند.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from("courses")
        .update({
          title: editForm.title.trim(),
          description: editForm.description.trim() || null,
          duration: editForm.duration.trim() || null,
          related_job_titles: editForm.related_job_titles.trim(),
          external_url: editForm.external_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseToEdit.id);

      if (updateError) throw updateError;

      setIsEditModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      console.error("Error updating course:", err);
      alert("خطا در ذخیره تغییرات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (course: Course) => {
    try {
      const { error: toggleError } = await supabase
        .from("courses")
        .update({ is_active: !course.is_active })
        .eq("id", course.id);

      if (toggleError) throw toggleError;
      setCourses(prev =>
        prev.map(c => (c.id === course.id ? { ...c, is_active: !c.is_active } : c))
      );
    } catch (err) {
      alert("خطا در تغییر وضعیت نمایش دوره.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این دوره مطمئن هستید؟ درخواست‌های ثبت‌شده برای آن نیز حذف خواهند شد.")) return;

    try {
      const { error: deleteError } = await supabase.from("courses").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("خطا در حذف دوره.");
    }
  };

  const displayCourses = courses.filter(
    c =>
      c.title.includes(searchTerm) ||
      (c.related_job_titles || "").includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 space-y-8 pb-10">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          تعریف آکادمی
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          دوره‌های آموزشی را تعریف و به «عنوان‌های شغلی» مرتبط وصل کنید. کارجویانی که در رزومه‌شان
          همان عنوان شغلی را دارند، این دوره‌ها را در آکادمی خود پیشنهادی می‌بینند.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ستون راست: فرم ثبت دوره جدید */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleAddCourse}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              افزودن دوره جدید
            </h2>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="عنوان دوره *"
                placeholder="مثال: دوره جامع منابع انسانی"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />

              <Textarea
                label="توضیحات دوره"
                placeholder="توضیح کوتاهی درباره سرفصل‌ها و مخاطب دوره..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />

              <Input
                label="مدت زمان دوره"
                placeholder="مثال: ۶ هفته"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
              />

              <div>
                <Input
                  label="عناوین شغلی مرتبط *"
                  placeholder="کارشناس جذب, کارشناس منابع انسانی, HR Generalist"
                  value={form.related_job_titles}
                  onChange={e => setForm({ ...form, related_job_titles: e.target.value })}
                />
                <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  چند عنوان را با کاما (,) از هم جدا کنید. دقیقاً همان عنوانی که کارجویان در «عنوان شغلی» رزومه خود می‌نویسند.
                </p>
              </div>

              <Input
                label="لینک ثبت‌نام / اطلاعات بیشتر (اختیاری)"
                placeholder="https://..."
                dir="ltr"
                value={form.external_url}
                onChange={e => setForm({ ...form, external_url: e.target.value })}
              />

              <Button type="submit" className="w-full mt-2 h-12 rounded-xl shadow-lg shadow-primary/20" isLoading={isSubmitting}>
                <Plus className="h-4 w-4 ml-2" />
                ثبت دوره
              </Button>
            </div>
          </form>
        </div>

        {/* ستون چپ: لیست دوره‌ها */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو در عنوان دوره یا عنوان شغلی..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-3 pr-9 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-4">
            {displayCourses.length > 0 ? (
              displayCourses.map(course => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          {course.title}
                        </h3>
                        {course.is_active ? (
                          <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded border border-green-200">
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded border border-slate-200">
                            غیرفعال
                          </span>
                        )}
                      </div>

                      {course.description && (
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">{course.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        {course.duration && (
                          <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-slate-600 border border-slate-100">
                            <Clock className="h-3.5 w-3.5" /> {course.duration}
                          </span>
                        )}
                        {course.external_url && (
                          <a
                            href={course.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg text-blue-600 border border-blue-100 hover:bg-blue-100"
                          >
                            <LinkIcon className="h-3.5 w-3.5" /> لینک دوره
                          </a>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(course.related_job_titles || "")
                          .split(",")
                          .map(t => t.trim())
                          .filter(Boolean)
                          .map((title, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/5 text-primary px-2.5 py-1 text-[11px] font-bold border border-primary/10"
                            >
                              <Tag className="h-3 w-3" /> {title}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive(course)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors"
                        title={course.is_active ? "غیرفعال کردن" : "فعال کردن"}
                      >
                        {course.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                        title="ویرایش"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <GraduationCap className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">هنوز دوره‌ای تعریف نشده است. از فرم سمت راست شروع کنید.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* مودال ویرایش دوره */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title="ویرایش دوره"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
          <Input
            label="عنوان دوره *"
            value={editForm.title}
            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
          />
          <Textarea
            label="توضیحات دوره"
            value={editForm.description}
            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
          />
          <Input
            label="مدت زمان دوره"
            value={editForm.duration}
            onChange={e => setEditForm({ ...editForm, duration: e.target.value })}
          />
          <Input
            label="عناوین شغلی مرتبط *"
            value={editForm.related_job_titles}
            onChange={e => setEditForm({ ...editForm, related_job_titles: e.target.value })}
          />
          <Input
            label="لینک ثبت‌نام / اطلاعات بیشتر"
            dir="ltr"
            value={editForm.external_url}
            onChange={e => setEditForm({ ...editForm, external_url: e.target.value })}
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
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              ذخیره تغییرات
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}