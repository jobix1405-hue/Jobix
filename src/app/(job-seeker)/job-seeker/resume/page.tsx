"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Briefcase, GraduationCap, Code, CheckCircle2, Save, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// ۱. تعریف قوانین اعتبارسنجی رزومه
const resumeSchema = z.object({
  firstName: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ حرف باشد"),
  jobTitle: z.string().min(3, "عنوان تخصصی خود را وارد کنید (مثلاً: برنامه‌نویس)"),
  aboutMe: z.string().max(500, "توضیحات نمی‌تواند بیشتر از ۵۰۰ حرف باشد").optional(),
  
  university: z.string().optional(),
  degree: z.string().optional(),
  
  lastCompany: z.string().optional(),
  lastPosition: z.string().optional(),
  
  skills: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

export default function ResumeBuilderPage() {
  const supabase = createClient();
  const { user } = useStore();

  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "skills">("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ۲. اتصال فرم به Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      aboutMe: "",
      university: "",
      degree: "",
      lastCompany: "",
      lastPosition: "",
      skills: "",
    }
  });

  // ۳. خواندن اطلاعات رزومه از دیتابیس در زمان لود صفحه
  useEffect(() => {
    const fetchResume = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, job_title, about_me, university, degree, last_company, last_position, skills')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          reset({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            jobTitle: data.job_title || "",
            aboutMe: data.about_me || "",
            university: data.university || "",
            degree: data.degree || "",
            lastCompany: data.last_company || "",
            lastPosition: data.last_position || "",
            skills: data.skills || "",
          });
        }
      } catch (err) {
        console.error("خطا در دریافت اطلاعات رزومه:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchResume();
  }, [user?.id, reset, supabase]);

  // ۴. هندل کردن ذخیره رزومه در دیتابیس
  const onSubmit = async (data: ResumeFormValues) => {
    if (!user?.id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          job_title: data.jobTitle,
          about_me: data.aboutMe,
          university: data.university,
          degree: data.degree,
          last_company: data.lastCompany,
          last_position: data.lastPosition,
          skills: data.skills,
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error("خطا در ذخیره رزومه:", err);
      setErrorMessage("خطایی در ذخیره رزومه رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // نمایش لودینگ اولیه
  if (isLoadingData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500">
      
      {/* هدر صفحه (شامل دکمه جدید برای مشاهده PDF) */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">رزومه من</h1>
          <p className="mt-2 text-sm text-slate-500">
            پروفایل و رزومه خود را تکمیل کنید تا شانس استخدام شما افزایش یابد.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* دکمه مشاهده رزومه پابلیک */}
          <Link href={`/resume/${user?.id}`} target="_blank">
            <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white">
              مشاهده رزومه آنلاین (PDF)
            </Button>
          </Link>

          {/* پیام موفقیت ذخیره */}
          {isSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700 border border-green-100 animate-in slide-in-from-left-4 h-10">
              <CheckCircle2 className="h-5 w-5" />
              ذخیره شد
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* =======================
            تب‌های ناوبری فرم
        ======================= */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "personal" 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">اطلاعات فردی</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("experience")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "experience" 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">سوابق و تحصيلات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === "skills" 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">مهارت‌ها</span>
          </button>
        </div>

        {/* =======================
            محتوای تب‌ها
        ======================= */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
          
          {/* تب ۱: اطلاعات فردی */}
          <div className={activeTab === "personal" ? "block space-y-6" : "hidden"}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="نام *"
                placeholder="مثال: علی"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label="نام خانوادگی *"
                placeholder="مثال: محمدی"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>
            
            <Input
              label="عنوان تخصصی (Job Title) *"
              placeholder="مثال: توسعه‌دهنده فرانت‌اند، مدیر فروش..."
              {...register("jobTitle")}
              error={errors.jobTitle?.message}
            />

            <Textarea
              label="درباره من (خلاصه رزومه)"
              placeholder="یک پاراگراف کوتاه در مورد اشتیاق، تجربه و اهداف شغلی خود بنویسید..."
              className="min-h-[150px]"
              {...register("aboutMe")}
              error={errors.aboutMe?.message}
            />
          </div>

          {/* تب ۲: سوابق و تحصیلات */}
          <div className={activeTab === "experience" ? "block space-y-8" : "hidden"}>
            
            {/* بخش سوابق شغلی */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Briefcase className="h-5 w-5 text-secondary" />
                <h3 className="font-bold text-slate-800">آخرین سابقه شغلی</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="نام شرکت"
                  placeholder="مثال: اسنپ"
                  {...register("lastCompany")}
                />
                <Input
                  label="سمت شغلی"
                  placeholder="مثال: طراح محصول"
                  {...register("lastPosition")}
                />
              </div>
            </div>

            {/* بخش تحصیلات */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-slate-800">آخرین مدرک تحصیلی</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="نام دانشگاه / موسسه"
                  placeholder="مثال: دانشگاه تهران"
                  {...register("university")}
                />
                <Select
                  label="مقطع تحصیلی"
                  options={[
                    { value: "diploma", label: "دیپلم" },
                    { value: "bachelor", label: "کارشناسی" },
                    { value: "master", label: "کارشناسی ارشد" },
                    { value: "phd", label: "دکترا" },
                  ]}
                  {...register("degree")}
                />
              </div>
            </div>
          </div>

          {/* تب ۳: مهارت‌ها */}
          <div className={activeTab === "skills" ? "block space-y-6" : "hidden"}>
            <div className="rounded-xl bg-blue-50 p-4 mb-6 border border-blue-100">
              <p className="text-sm text-blue-800">
                مهارت‌های تخصصی خود را با کاما (,) از هم جدا کنید. این کلمات کلیدی به سیستم هوشمند جابیکس کمک می‌کند تا آگهی‌های مرتبط را به شما پیشنهاد دهد.
              </p>
            </div>
            
            <Textarea
              label="مهارت‌های تخصصی و نرم"
              placeholder="مثال: React, Next.js, کار تیمی, حل مسئله, فن بیان"
              className="min-h-[150px]"
              {...register("skills")}
            />
          </div>

        </div>

        {/* =======================
            دکمه ذخیره نهایی
        ======================= */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button 
            type="submit" 
            size="lg" 
            className="rounded-xl px-8"
            isLoading={isSubmitting}
          >
            <Save className="ml-2 h-5 w-5" />
            ذخیره و بروزرسانی رزومه
          </Button>
        </div>

      </form>
    </div>
  );
}