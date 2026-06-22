"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MapSelector } from "@/components/shared/MapSelector";
import { Briefcase, CheckCircle2, MapPin, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

const jobSchema = z.object({
  title: z.string().min(5, "عنوان آگهی باید حداقل ۵ حرف باشد"),
  category: z.string().min(1, "لطفاً دسته‌بندی شغلی را انتخاب کنید"),
  jobType: z.string().min(1, "نوع همکاری باید مشخص شود"),
  salary: z.string().min(1, "بازه حقوقی را مشخص کنید"),
  location: z.string().min(2, "شهر محل کار را وارد کنید"),
  description: z.string().min(50, "توضیحات آگهی باید حداقل ۵۰ کاراکتر باشد"),
  coordinates: z.array(z.number()).optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobFormValues) => {
    if (!user?.id) {
      setErrorMessage("شما وارد حساب کاربری نشده‌اید!");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // اینسرت کردن دیتا در جدول jobs
      const { error } = await supabase
        .from('jobs')
        .insert({
          employer_id: user.id,
          title: data.title,
          category: data.category,
          job_type: data.jobType,
          salary_range: data.salary,
          location_text: data.location,
          description: data.description,
          lat: data.coordinates?.[0] || null,
          lng: data.coordinates?.[1] || null,
          status: 'active' // برای تست، آگهی رو مستقیماً فعال می‌کنیم
        });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err: any) {
      console.error("خطا در ثبت آگهی:", err);
      setErrorMessage("خطایی در ثبت آگهی رخ داد. لطفاً فیلدها را بررسی کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 rounded-full bg-green-100 p-4 shadow-sm border border-green-200">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">آگهی شما با موفقیت ثبت شد!</h2>
        <p className="mt-2 text-slate-600 max-w-md">
          آگهی شما هم‌اکنون در سیستم فعال است و کارجویان می‌توانند برای آن رزومه ارسال کنند.
        </p>
        <Button 
          className="mt-8 rounded-xl px-8" 
          onClick={() => router.push('/employer/jobs')}
        >
          مشاهده آگهی‌های من
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Briefcase className="h-6 w-6 text-primary" />
          ثبت آگهی استخدام جدید
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          اطلاعات شغل مورد نیاز خود را با دقت وارد کنید تا بهترین کارجویان را پیدا کنید.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        
        {/* ردیف اول: عنوان و دسته بندی */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="عنوان آگهی شغلی *"
            placeholder="مثال: برنامه‌نویس فرانت‌اند (React)"
            {...register("title")}
            error={errors.title?.message}
          />
          <Select
            label="دسته‌بندی شغلی *"
            options={[
              { value: "software", label: "توسعه نرم‌افزار و برنامه‌نویسی" },
              { value: "sales", label: "فروش و بازاریابی" },
              { value: "design", label: "طراحی و گرافیک" },
              { value: "finance", label: "مالی و حسابداری" },
            ]}
            {...register("category")}
            error={errors.category?.message}
          />
        </div>

        {/* ردیف دوم: نوع همکاری، حقوق و موقعیت */}
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

        {/* ردیف سوم: نقشه */}
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

        {/* ردیف چهارم: توضیحات آگهی */}
        <div>
          <Textarea
            label="توضیحات و شرایط احراز شغل *"
            placeholder="شرح وظایف، مهارت‌های مورد نیاز، مزایا و..."
            {...register("description")}
            error={errors.description?.message}
            className="min-h-[200px]"
          />
        </div>

        {/* دکمه ارسال */}
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