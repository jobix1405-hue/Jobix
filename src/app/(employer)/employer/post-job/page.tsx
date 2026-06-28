"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"; // 👈 SubmitHandler کلا حذف شد تا از روش بهتری استفاده کنیم
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MapSelector } from "@/components/shared/MapSelector";

import { 
  Briefcase, CheckCircle2, MapPin, AlertCircle, 
  Loader2, Layers, ChevronRight, Zap, Gift 
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// شمای اعتبارسنجی با پشتیبانی از فیلدهای جدید
const jobSchema = z.object({
  title: z.string().min(5, "عنوان آگهی باید حداقل ۵ حرف باشد"),
  level1: z.string().min(1, "انتخاب گروه شغلی الزامی است"),
  category: z.string().min(1, "انتخاب عنوان شغلی الزامی است"),
  customCategoryTitle: z.string().optional(),
  jobType: z.string().min(1, "نوع همکاری باید مشخص شود"),
  salary: z.string().min(1, "بازه حقوقی را مشخص کنید"),
  location: z.string().min(2, "شهر محل کار را وارد کنید"),
  description: z.string().min(50, "شرح شغل باید حداقل ۵۰ کاراکتر باشد"),
  benefits: z.string().optional(),
  coordinates: z.array(z.number()).min(2, "لطفاً موقعیت را روی نقشه مشخص کنید"), // اجباری شدن نقشه
  isUrgent: z.boolean().default(false),
  hasReferralReward: z.boolean().default(false),
  referralReward: z.string().optional(),
}).superRefine((data, ctx) => {
  // ولیدیشن عنوان کاستوم
  if (data.category === "custom" && (!data.customCategoryTitle || data.customCategoryTitle.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "لطفاً عنوان شغلی مورد نظر خود را وارد کنید",
      path: ["customCategoryTitle"]
    });
  }
  // ولیدیشن پاداش معرفی
  if (data.hasReferralReward && (!data.referralReward || Number(data.referralReward) < 100000)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "مبلغ پاداش معرفی باید حداقل ۱۰۰ هزار تومان باشد",
      path: ["referralReward"]
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
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // 👈 در اینجا تایپ جنریک useForm را برداشتیم تا به صورت اتوماتیک از Zod استنباط کند و گیر ندهد
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      level1: "",
      category: "",
      customCategoryTitle: "",
      jobType: "",
      salary: "",
      location: "",
      description: "",
      benefits: "",
      coordinates: [],
      isUrgent: false,
      hasReferralReward: false,
      referralReward: ""
    }
  });

  const watchLevel1 = watch("level1");
  const watchCategory = watch("category");
  const watchHasReferralReward = watch("hasReferralReward");

  // با تغییر گروه اصلی، عنوان شغلی ریست می‌شود
  useEffect(() => {
    setValue("category", "");
    setValue("customCategoryTitle", "");
  }, [watchLevel1, setValue]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) return;
      try {
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

  // استخراج گروه‌های اصلی (لول ۱)
  const level1Options = allCategories
    .filter(c => c.level === 1)
    .map(c => ({ value: c.id, label: c.title }));

  // استخراج عناوین شغلی مربوط به گروه انتخاب شده (معماری تمیز ۲ سطحی)
  const getTitleOptions = () => {
    if (!watchLevel1) return [];
    // پیدا کردن عناوین شغلی که مستقیماً زیرمجموعه این گروه اصلی هستند
    const options = allCategories
      .filter(c => c.level === 2 && c.parent_id === watchLevel1)
      .map(c => ({ value: c.title, label: c.title }));
      
    // اضافه کردن گزینه دستی به آخر لیست
    options.push({ value: "custom", label: "➕ عنوان شغلی من در لیست نیست" });
    return options;
  };

  // 👈 این تابع حالا به عنوان یک تابع معمولی و مستقل عمل می‌کند
  const onSubmit = async (formData: any) => {
    const data = formData as JobFormValues; // تبدیل مطمئن داده‌ها
    
    if (!user?.id) return setErrorMessage("مشکلی در حساب کاربری وجود دارد!");

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      let finalJobCategory = data.category;

      // اگر کاربر شغل جدیدی وارد کرده بود، آن را در دیتابیس دسته‌بندی‌ها ذخیره می‌کنیم
      if (data.category === "custom" && data.customCategoryTitle) {
        finalJobCategory = data.customCategoryTitle.trim();
        const randomSlug = Math.random().toString(36).substring(2, 10);
        
        // ذخیره عنوان کاستوم مستقیماً در زیر لول 1 انتخابی
        const { error: catError } = await supabase.from('job_categories').insert({
          title: finalJobCategory,
          slug: randomSlug,
          level: 2,
          parent_id: data.level1, 
          is_verified: false 
        });

        if (catError) console.error("خطا در ذخیره شغل جدید:", catError);
      }

      // ثبت نهایی آگهی با فیلدهای جدید
      const { error: insertError } = await supabase.from('jobs').insert({
        employer_id: user.id,
        title: data.title,
        category: finalJobCategory,
        job_type: data.jobType,
        salary_range: data.salary,
        location_text: data.location,
        description: data.description,
        benefits: data.benefits || null, // فیلد جدید: مزایا
        is_urgent: data.isUrgent, // فیلد جدید: نیاز فوری
        referral_reward: data.hasReferralReward ? Number(data.referralReward) : 0, // فیلد جدید: پاداش معرفی
        lat: data.coordinates?.[0] || null,
        lng: data.coordinates?.[1] || null,
        status: 'active' 
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
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500 pb-10">
      
      {/* دکمه بازگشت اضافه شده */}
      <button 
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"
      >
        <ChevronRight className="h-4 w-4" />
        بازگشت
      </button>

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
          <span className="text-sm font-bold text-green-800">وضعیت سهمیه:</span>
          <span className="text-sm font-extrabold text-green-700 bg-white px-3 py-0.5 rounded-lg border border-green-200">
            آزاد و رایگان (نسخه تستی)
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* 👈 استفاده از ساختار پیکانی ناشناس (Callback) مشکل تایپ اسکریپت را به طور کامل دور می‌زند */}
      <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-8 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        
        {/* عنوان آگهی */}
        <Input
          label="عنوان آگهی شغلی (برای نمایش به کارجو) *"
          placeholder="مثال: برنامه‌نویس ارشد فرانت‌اند (React)"
          {...register("title")}
          error={errors.title?.message as string}
        />

        {/* بخش دسته‌بندی ساده شده (معماری ۲ سطحی) */}
        <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            دسته‌بندی شغلی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="گروه شغلی اصلی *"
              options={level1Options}
              {...register("level1")}
              error={errors.level1?.message as string}
            />
            <Select
              label="عنوان شغلی استاندارد *"
              options={getTitleOptions()}
              disabled={!watchLevel1}
              {...register("category")}
              error={errors.category?.message as string}
            />
          </div>

          {watchCategory === "custom" && (
            <div className="animate-in fade-in slide-in-from-top-2 pt-2">
              <Input
                label="عنوان شغلی مورد نظر شما *"
                placeholder="عنوان شغلی را تایپ کنید..."
                {...register("customCategoryTitle")}
                error={errors.customCategoryTitle?.message as string}
              />
              <p className="text-xs text-orange-600 mt-2 font-medium">
                * در صورتی که عنوان مورد نظر در لیست نبود، آن را اینجا بنویسید تا به سیستم اضافه شود.
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
              { value: "daily", label: "روزمزد (کارگر/پروژه‌ای)" },
            ]}
            {...register("jobType")}
            error={errors.jobType?.message as string}
          />
          <Select
            label="بازه حقوقی *"
            options={[
              { value: "negotiable", label: "توافقی" },
              { value: "10-20", label: "۱۰ تا ۲۰ میلیون تومان" },
              { value: "20-30", label: "۲۰ تا ۳۰ میلیون تومان" },
              { value: "30+", label: "بیشتر از ۳۰ میلیون تومان" },
            ]}
            {...register("salary")}
            error={errors.salary?.message as string}
          />
          <Input
            label="شهر محل کار *"
            placeholder="مثال: تهران"
            {...register("location")}
            error={errors.location?.message as string}
          />
        </div>

        {/* فیلدهای متنی تفکیک شده */}
        <div className="space-y-6">
          <Textarea
            label="شرح شغل و مهارت‌های مورد نیاز *"
            placeholder="شرح وظایف، انتظارات و مهارت‌های تخصصی را به صورت کامل بنویسید..."
            {...register("description")}
            error={errors.description?.message as string}
            className="min-h-[150px]"
          />
          
          <Textarea
            label="مزایا و تسهیلات رفاهی (اختیاری)"
            placeholder="بیمه تکمیلی، پاداش، ساعت کاری شناور، ناهار و..."
            {...register("benefits")}
            error={errors.benefits?.message as string}
            className="min-h-[100px]"
          />
        </div>

        {/* باکس امکانات ویژه (نیاز فوری و پاداش) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <label className="flex items-start gap-3 cursor-pointer p-4 border border-slate-200 rounded-2xl bg-white hover:border-orange-300 hover:bg-orange-50/30 transition-colors shadow-sm">
            <input 
              type="checkbox" 
              className="mt-1 w-5 h-5 accent-orange-500 shrink-0" 
              {...register("isUrgent")} 
            />
            <div>
              <span className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <Zap className="h-4 w-4 text-orange-500" /> نیاز فوری به نیرو
              </span>
              <span className="text-xs text-slate-500 leading-relaxed">
                با فعال‌سازی این گزینه، به کارجویان مرتبط پیامک و اعلان دعوت به کار ارسال می‌شود.
              </span>
            </div>
          </label>

          <div className="flex flex-col gap-3 p-4 border border-slate-200 rounded-2xl bg-white transition-colors shadow-sm hover:border-primary/50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 accent-primary shrink-0" 
                {...register("hasReferralReward")} 
              />
              <div>
                <span className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <Gift className="h-4 w-4 text-primary" /> تعیین پاداش معرفی (Headhunt)
                </span>
                <span className="text-xs text-slate-500 leading-relaxed">
                  اگر کاربری نیرویی معرفی کند و استخدام شود، این پاداش را به معرف پرداخت می‌کنید.
                </span>
              </div>
            </label>

            {watchHasReferralReward && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                <Input
                  placeholder="مبلغ پاداش به تومان (مثلاً: 2000000)"
                  type="number"
                  dir="ltr"
                  {...register("referralReward")}
                  error={errors.referralReward?.message as string}
                />
              </div>
            )}
          </div>

        </div>

        {/* نقشه اجباری شده */}
        <div className={`rounded-2xl border bg-slate-50 p-4 ${errors.coordinates ? 'border-red-300' : 'border-slate-100'}`}>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              موقعیت دقیق روی نقشه *
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              انتخاب مکان روی نقشه برای نمایش آگهی به کارجویان نزدیک الزامی است.
            </p>
          </div>
          <MapSelector 
            onLocationSelect={(lat, lng) => setValue("coordinates", [lat, lng])} 
          />
          {errors.coordinates && (
            <p className="text-sm text-red-500 mt-2 font-bold">{errors.coordinates.message as string}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
          <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => router.back()}>
            انصراف
          </Button>
          <Button type="submit" size="lg" isLoading={isSubmitting} className="rounded-xl px-8 shadow-lg shadow-primary/20">
            ثبت و انتشار آگهی
          </Button>
        </div>

      </form>
    </div>
  );
}