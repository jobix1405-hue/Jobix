"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MapSelector } from "@/components/shared/MapSelector";
import { Briefcase, CheckCircle2, MapPin, AlertCircle, Loader2, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// شمای اعتبارسنجی با پشتیبانی از فیلدهای جدید آبشاری و فیلد کاستوم
const jobSchema = z.object({
  title: z.string().min(5, "عنوان آگهی باید حداقل ۵ حرف باشد"),
  level1: z.string().min(1, "انتخاب دسته اصلی الزامی است"),
  level2: z.string().min(1, "انتخاب زیردسته الزامی است"),
  category: z.string().min(1, "انتخاب عنوان شغلی الزامی است"),
  customCategoryTitle: z.string().optional(),
  jobType: z.string().min(1, "نوع همکاری باید مشخص شود"),
  salary: z.string().min(1, "بازه حقوقی را مشخص کنید"),
  location: z.string().min(2, "شهر محل کار را وارد کنید"),
  description: z.string().min(50, "توضیحات آگهی باید حداقل ۵۰ کاراکتر باشد"),
  coordinates: z.array(z.number()).optional(),
}).superRefine((data, ctx) => {
  // اگر کارفرما گزینه "سایر" را انتخاب کرد، حتماً باید فیلد متنی را پر کند
  if (data.category === "custom" && (!data.customCategoryTitle || data.customCategoryTitle.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "لطفاً عنوان شغلی مورد نظر خود را وارد کنید",
      path: ["customCategoryTitle"]
    });
  }
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // استیت‌های دیتابیس
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  
  // استیت‌های مربوط به دسته‌بندی درختی
  const [allCategories, setAllCategories] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      level1: "",
      level2: "",
      category: "",
      customCategoryTitle: ""
    }
  });

  const watchLevel1 = watch("level1");
  const watchLevel2 = watch("level2");
  const watchCategory = watch("category");

  // با تغییر سطح 1، سطوح بعدی ریست میشن
  useEffect(() => {
    setValue("level2", "");
    setValue("category", "");
    setValue("customCategoryTitle", "");
  }, [watchLevel1, setValue]);

  // با تغییر سطح 2، سطح 3 ریست میشه
  useEffect(() => {
    setValue("category", "");
    setValue("customCategoryTitle", "");
  }, [watchLevel2, setValue]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) return;
      try {
        // ۱. واکشی کل دسته‌بندی‌ها (چون کلاً حدود 120 تاست، یکجا می‌گیریم که سرعت فرم بالا بره)
        const { data: catData } = await supabase.from('job_categories').select('id, title, level, parent_id');
        if (catData) setAllCategories(catData);
      } catch (err) {
        console.error("خطا در دریافت اطلاعات اولیه:", err);
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchInitialData();
  }, [user?.id, supabase]);

  // فیلتر کردن گزینه‌ها بر اساس دیتای درختی
  const level1Options = allCategories
    .filter(c => c.level === 1)
    .map(c => ({ value: c.id, label: c.title }));

  const level2Options = allCategories
    .filter(c => c.level === 2 && c.parent_id === watchLevel1)
    .map(c => ({ value: c.id, label: c.title }));

  const level3Options = allCategories
    .filter(c => c.level === 3 && c.parent_id === watchLevel2)
    .map(c => ({ value: c.title, label: c.title })); // اینجا خود تایتل رو ذخیره می‌کنیم که تو آگهی راحت نشون بدیم

  // اضافه کردن گزینه دستی به آخر لیست مشاغل
  if (watchLevel2) {
    level3Options.push({ value: "custom", label: "➕ عنوان شغلی من در لیست نیست" });
  }

  const onSubmit = async (data: JobFormValues) => {
    if (!user?.id) return setErrorMessage("مشکلی در حساب کاربری وجود دارد!");

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      let finalJobCategory = data.category;

      // اگر کاربر شغل جدیدی وارد کرده بود، اول اون رو تو دیتابیس دسته‌بندی‌ها ذخیره می‌کنیم
      if (data.category === "custom" && data.customCategoryTitle) {
        finalJobCategory = data.customCategoryTitle.trim();
        const randomSlug = Math.random().toString(36).substring(2, 10); // اسلاگ رندوم
        
        const { error: catError } = await supabase.from('job_categories').insert({
          title: finalJobCategory,
          slug: randomSlug,
          level: 3,
          parent_id: data.level2,
          is_verified: false // این رو ادمین باید بعداً تایید کنه
        });
        
        if (catError) console.error("خطا در ذخیره شغل جدید:", catError);
      }

      // =================================================================
      // 🚨 ثبت مستقیم در جدول jobs (بدون چک کردن سهمیه و محدودیت) 🚨
      // =================================================================
      const { error: insertError } = await supabase.from('jobs').insert({
        employer_id: user.id,
        title: data.title,
        category: finalJobCategory,
        job_type: data.jobType,
        salary_range: data.salary,
        location_text: data.location,
        description: data.description,
        lat: data.coordinates?.[0] || null,
        lng: data.coordinates?.[1] || null,
        status: 'active' // آگهی به محض ثبت فعال میشه
      });

      if (insertError) throw insertError;

      setIsSuccess(true);
    } catch (err: any) {
      console.error("خطا در ثبت آگهی:", err);
      setErrorMessage(err.message || "خطایی در ثبت آگهی رخ داد. لطفاً فیلدها را بررسی کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitialData) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-medium">در حال آماده‌سازی فرم...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 rounded-full bg-green-100 p-4 shadow-sm border border-green-200">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">آگهی شما با موفقیت ثبت شد!</h2>
        <p className="mt-2 text-slate-600 max-w-md leading-relaxed">
          آگهی شما هم‌اکنون در سیستم به صورت عمومی فعال است و کارجویان می‌توانند آن را مشاهده کنند.
        </p>
        <Button className="mt-8 rounded-xl px-8" onClick={() => router.push('/employer/jobs')}>
          مشاهده آگهی‌های من
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500">
      <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Briefcase className="h-6 w-6 text-primary" />
            ثبت آگهی استخدام جدید
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            اطلاعات شغل مورد نیاز خود را با دقت وارد کنید تا بهترین کارجویان را پیدا کنید.
          </p>
        </div>
        <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
          <span className="text-sm font-bold text-green-800">حالت تستی:</span>
          <span className="text-sm font-extrabold text-green-700 bg-white px-3 py-0.5 rounded-lg border border-green-200">
            ثبت رایگان و نامحدود
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        
        {/* عنوان آگهی */}
        <Input
          label="عنوان آگهی شغلی (برای نمایش به کارجو) *"
          placeholder="مثال: برنامه‌نویس ارشد فرانت‌اند (React)"
          {...register("title")}
          error={errors.title?.message}
        />

        {/* بخش دسته‌بندی درختی */}
        <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            انتخاب دسته‌بندی استاندارد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="گروه شغلی *"
              options={level1Options}
              {...register("level1")}
              error={errors.level1?.message}
            />
            <Select
              label="زیردسته *"
              options={level2Options}
              disabled={!watchLevel1}
              {...register("level2")}
              error={errors.level2?.message}
            />
            <Select
              label="عنوان شغلی استاندارد *"
              options={level3Options}
              disabled={!watchLevel2}
              {...register("category")}
              error={errors.category?.message}
            />
          </div>

          {/* فیلد کاستوم (اگر کاربر شغلش تو لیست نبود) */}
          {watchCategory === "custom" && (
            <div className="animate-in fade-in slide-in-from-top-2 pt-2">
              <Input
                label="عنوان شغلی مورد نظر شما *"
                placeholder="عنوان شغلی را تایپ کنید..."
                {...register("customCategoryTitle")}
                error={errors.customCategoryTitle?.message}
              />
              <p className="text-xs text-orange-600 mt-2 font-medium">
                * این عنوان پس از ثبت، برای بررسی به مدیریت ارسال می‌شود اما آگهی شما بلافاصله با همین عنوان منتشر خواهد شد.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Select
            label="نوع همکاری *"
            options={[
              { value: "full-time", label: "تمام وقت" },
              { value: "part-time", label: "پاره وقت" },
              { value: "remote", label: "دورکاری (Remote)" },
              { value: "internship", label: "کارآموزی" },
            ]}
            {...register("jobType")}
            error={errors.jobType?.message}
          />
          <Select
            label="بازه حقوقی *"
            options={[
              { value: "negotiable", label: "توافقی" },
              { value: "10-20", label: "۱۰ تا ۲۰ میلیون تومان" },
              { value: "20-30", label: "۲۰ تا ۳0 میلیون تومان" },
              { value: "30+", label: "بیشتر از ۳۰ میلیون تومان" },
            ]}
            {...register("salary")}
            error={errors.salary?.message}
          />
          <Input
            label="شهر محل کار *"
            placeholder="مثال: تهران"
            {...register("location")}
            error={errors.location?.message}
          />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              موقعیت دقیق روی نقشه (اختیاری)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              با انتخاب دقیق مکان شرکت روی نقشه، کارجویان محلی راحت‌تر آگهی شما را پیدا می‌کنند.
            </p>
          </div>
          <MapSelector 
            onLocationSelect={(lat, lng) => setValue("coordinates", [lat, lng])} 
          />
        </div>

        <div>
          <Textarea
            label="توضیحات و شرایط احراز شغل *"
            placeholder="شرح وظایف، مهارت‌های مورد نیاز، مزایا و..."
            {...register("description")}
            error={errors.description?.message}
            className="min-h-[200px]"
          />
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
          <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => router.back()}>
            انصراف
          </Button>
          <Button type="submit" size="lg" isLoading={isSubmitting} className="rounded-xl px-8 shadow-lg shadow-primary/20">
            ثبت و انتشار فوری آگهی
          </Button>
        </div>

      </form>
    </div>
  );
}