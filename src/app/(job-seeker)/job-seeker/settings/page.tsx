"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Settings, 
  Save, 
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ShieldAlert
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// ۱. تعریف قوانین اعتبارسنجی
const accountSettingsSchema = z.object({
  email: z.string().email("فرمت ایمیل معتبر نیست").optional().or(z.literal("")),
  address: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof accountSettingsSchema>;

export default function JobSeekerSettingsPage() {
  const supabase = createClient();
  const { user } = useStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      email: "",
      address: "",
    }
  });

  // ۲. خواندن اطلاعات فعلی کاربر از دیتابیس
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email, address')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          reset({
            email: data.email || "",
            address: data.address || "",
          });
        }
      } catch (err) {
        console.error("خطا در دریافت اطلاعات تنظیمات:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSettings();
  }, [user?.id, reset, supabase]);

  // ۳. ذخیره تغییرات در دیتابیس
  const onSubmit = async (data: SettingsFormValues) => {
    if (!user?.id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: data.email,
          address: data.address,
        })
        .eq('id', user.id);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("خطا در ذخیره تنظیمات:", err);
      setErrorMessage("خطایی در ذخیره اطلاعات رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in duration-500">
      
      {/* هدر */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            تنظیمات حساب کاربری
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            مدیریت اطلاعات ارتباطی و تنظیمات امنیتی حساب شما.
          </p>
        </div>
        
        {showSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700 border border-green-100 animate-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5" />
            تغییرات ذخیره شد
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        
        {/* باکس اطلاعات اصلی */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">اطلاعات ارتباطی</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* فیلد شماره موبایل (فقط نمایشی) */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">شماره موبایل (تایید شده)</label>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
                <Phone className="h-5 w-5 text-green-600" />
                <span dir="ltr" className="font-semibold">{user?.phone}</span>
                <span className="mr-auto text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">
                  غیرقابل تغییر
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="آدرس ایمیل پشتیبان"
                {...register("email")}
                error={errors.email?.message}
                placeholder="example@gmail.com"
                dir="ltr"
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                label="شهر و منطقه سکونت"
                {...register("address")}
                error={errors.address?.message}
                placeholder="مثال: تهران، پونک"
                icon={<MapPin className="h-4 w-4" />}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="rounded-xl px-8 shadow-lg shadow-primary/20"
                isLoading={isSubmitting}
              >
                <Save className="ml-2 h-5 w-5" />
                ذخیره تغییرات
              </Button>
            </div>
          </form>
        </div>

        {/* باکس تنظیمات امنیتی (حذف اکانت) */}
        <div className="rounded-3xl border border-red-100 bg-red-50/30 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            مدیریت حساب و امنیت
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            با حذف حساب کاربری، تمامی اطلاعات شما از جمله رزومه، درخواست‌های شغلی و سوابق پیام‌ها برای همیشه پاک شده و غیرقابل بازگشت خواهد بود.
          </p>
          
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white bg-white">
            حذف دائمی حساب کاربری
          </Button>
        </div>

      </div>
    </div>
  );
}