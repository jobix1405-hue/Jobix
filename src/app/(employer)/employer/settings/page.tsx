"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  CheckCircle2,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";

// تعریف قوانین اعتبارسنجی پروفایل کارفرما
const employerProfileSchema = z.object({
  companyName: z.string().min(3, "نام شرکت الزامی است"),
  website: z.string().url("آدرس وب‌سایت معتبر نیست").or(z.literal("")),
  email: z.string().email("ایمیل معتبر نیست"),
  phone: z.string().min(10, "شماره تماس معتبر نیست"),
  address: z.string().min(5, "آدرس دقیق الزامی است"),
  bio: z.string().min(20, "توضیحات شرکت باید کمی کامل‌تر باشد"),
});

type ProfileFormValues = z.infer<typeof employerProfileSchema>;

export default function EmployerSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: "شرکت نمونه",
      website: "https://example.com",
      email: "hr@example.com",
      phone: "02188888888",
      address: "تهران، میدان ونک، خیابان اصلی",
      bio: "ما یک شرکت پیشرو در زمینه تکنولوژی هستیم که به دنبال جذب بهترین استعدادهاست.",
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    setIsSubmitting(true);
    console.log("بروزرسانی پروفایل کارفرما:", data);
    
    // شبیه‌سازی ذخیره در دیتابیس
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500">
      {/* هدر */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تنظیمات پروفایل شرکت</h1>
          <p className="mt-2 text-sm text-slate-500">
            اطلاعات برند و راه‌های ارتباطی شرکت خود را مدیریت کنید.
          </p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700 border border-green-100 animate-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5" />
            تغییرات ذخیره شد
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* ستون راست: لوگو و اطلاعات هویتی */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <FileUpload 
              label="لوگوی شرکت" 
              onChange={(file) => console.log("فایل انتخاب شده:", file)} 
            />
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-blue-800">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  تکمیل بودن پروفایل شرکت، اعتماد کارجویان را تا ۴۰٪ افزایش می‌دهد.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ستون چپ: فرم اطلاعات */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="نام شرکت / برند *"
                {...register("companyName")}
                error={errors.companyName?.message}
                placeholder="مثلاً: جابیکس تک"
              />
              <Input
                label="وب‌سایت"
                {...register("website")}
                error={errors.website?.message}
                placeholder="https://..."
                dir="ltr"
              />
              <Input
                label="ایمیل عمومی شرکت *"
                {...register("email")}
                error={errors.email?.message}
                placeholder="info@company.com"
                dir="ltr"
              />
              <Input
                label="شماره تماس ثابت *"
                {...register("phone")}
                error={errors.phone?.message}
                placeholder="۰۲۱..."
                dir="ltr"
              />
            </div>

            <div className="mt-6">
              <Input
                label="آدرس دفتر مرکزی *"
                {...register("address")}
                error={errors.address?.message}
                placeholder="شهر، خیابان، کوچه، پلاک..."
              />
            </div>

            <div className="mt-6">
              <Textarea
                label="درباره شرکت (معرفی کوتاه) *"
                {...register("bio")}
                error={errors.bio?.message}
                placeholder="توضیحاتی در مورد فعالیت‌ها و فرهنگ سازمانی..."
                className="min-h-[150px]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="rounded-2xl px-10 shadow-lg shadow-primary/20"
              isLoading={isSubmitting}
            >
              <Save className="ml-2 h-5 w-5" />
              ذخیره تغییرات نهایی
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}