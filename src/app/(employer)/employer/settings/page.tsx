"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Save, 
  CheckCircle2,
  Info,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// تعریف قوانین اعتبارسنجی
const employerProfileSchema = z.object({
  companyName: z.string().min(3, "نام شرکت الزامی است"),
  website: z.string().url("آدرس وب‌سایت معتبر نیست").or(z.literal("")).optional(),
  email: z.string().email("ایمیل معتبر نیست"),
  phone: z.string().min(8, "شماره تماس معتبر نیست"),
  address: z.string().min(5, "آدرس دقیق الزامی است"),
  bio: z.string().min(20, "توضیحات شرکت باید حداقل ۲۰ حرف باشد"),
});

type ProfileFormValues = z.infer<typeof employerProfileSchema>;

export default function EmployerSettingsPage() {
  const supabase = createClient();
  const { user } = useStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // استیت‌های مربوط به لوگو
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: "",
      website: "",
      email: "",
      phone: "",
      address: "",
      bio: "",
    }
  });

  // خواندن اطلاعات فعلی از دیتابیس
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_name, website, email, telephone, address, bio, logo_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          reset({
            companyName: data.company_name || "",
            website: data.website || "",
            email: data.email || "",
            phone: data.telephone || "",
            address: data.address || "",
            bio: data.bio || "",
          });
          setCurrentLogoUrl(data.logo_url || null);
        }
      } catch (err) {
        console.error("خطا در دریافت اطلاعات:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfile();
  }, [user?.id, reset, supabase]);

  // ذخیره اطلاعات هویتی و لوگو در دیتابیس
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      let finalLogoUrl = currentLogoUrl;

      // ۱. اگر فایل جدیدی برای لوگو انتخاب شده بود، اول آن را آپلود می‌کنیم
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        // آپلود در باکت jobix-storage
        const { error: uploadError } = await supabase.storage
          .from('jobix-storage')
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        // دریافت لینک پابلیک عکس آپلود شده
        const { data: publicUrlData } = supabase.storage
          .from('jobix-storage')
          .getPublicUrl(filePath);

        finalLogoUrl = publicUrlData.publicUrl;
      } else if (logoFile === null && currentLogoUrl) {
        // این حالت برای زمانی است که کاربر عکس را حذف کرده (در FileUpload روی ضربدر زده)
        // فعلا برای سادگی فقط لینک را از دیتابیس پاک می‌کنیم
        finalLogoUrl = null;
      }

      // ۲. ذخیره نهایی در دیتابیس پروفایل
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          company_name: data.companyName,
          website: data.website,
          email: data.email,
          telephone: data.phone,
          address: data.address,
          bio: data.bio,
          logo_url: finalLogoUrl, // فیلد جدید
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setCurrentLogoUrl(finalLogoUrl); // بروزرسانی استیت لوکال
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (err: any) {
      console.error("خطا در ذخیره اطلاعات:", err);
      setErrorMessage(err.message || "خطایی در ذخیره اطلاعات رخ داد. لطفاً دوباره تلاش کنید.");
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
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500">
      {/* هدر */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
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

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* ستون راست: لوگو */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <FileUpload 
              label="لوگوی شرکت" 
              defaultImage={currentLogoUrl}
              onChange={(file) => setLogoFile(file)} 
            />
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-blue-800 border border-blue-100">
                <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" />
                <p className="text-xs leading-relaxed font-medium">
                  لوگوی شما در تمامی آگهی‌ها و جستجوها نمایش داده می‌شود. شرکت‌های دارای لوگو ۵۰٪ بازدید بیشتری دارند.
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
                placeholder="https://example.com"
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

          <div className="flex justify-end pb-10">
            <Button 
              type="submit" 
              size="lg" 
              className="rounded-2xl px-10 shadow-lg shadow-primary/20 h-12"
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