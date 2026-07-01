"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Save, 
  CheckCircle2,
  Info,
  AlertCircle,
  Lock, // 👈 آیکون جدید
  Key   // 👈 آیکون جدید
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// تعریف قوانین اعتبارسنجی اطلاعات شرکت
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

  // 🔥 استیت‌های مربوط به رمز عبور
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

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

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      let finalLogoUrl = currentLogoUrl;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('jobix-storage')
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('jobix-storage')
          .getPublicUrl(filePath);

        finalLogoUrl = publicUrlData.publicUrl;
      } else if (logoFile === null && currentLogoUrl) {
        finalLogoUrl = null;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          company_name: data.companyName,
          website: data.website,
          email: data.email,
          telephone: data.phone,
          address: data.address,
          bio: data.bio,
          logo_url: finalLogoUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setCurrentLogoUrl(finalLogoUrl);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (err: any) {
      console.error("خطا در ذخیره اطلاعات:", err);
      setErrorMessage(err.message || "خطایی در ذخیره اطلاعات رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 هندلر تغییر رمز عبور در دیتابیس (Supabase Auth)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'رمز عبور و تکرار آن یکسان نیستند.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      
      setPasswordMessage({ type: 'success', text: 'رمز عبور با موفقیت ذخیره شد. از این پس می‌توانید با رمز عبور نیز وارد شوید.' });
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: 'خطا در تنظیم رمز عبور. لطفاً دوباره تلاش کنید.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoadingData) return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>;

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500 pb-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تنظیمات پروفایل شرکت</h1>
          <p className="mt-2 text-sm text-slate-500">اطلاعات برند و راه‌های ارتباطی شرکت خود را مدیریت کنید.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700 border border-green-100 animate-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5" /> تغییرات ذخیره شد
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /> <p>{errorMessage}</p>
        </div>
      )}

      {/* فرم اطلاعات شرکت */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <FileUpload label="لوگوی شرکت" defaultImage={currentLogoUrl} onChange={(file) => setLogoFile(file)} />
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-blue-800 border border-blue-100">
              <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" />
              <p className="text-xs leading-relaxed font-medium">لوگوی شما در تمامی آگهی‌ها نمایش داده می‌شود. شرکت‌های دارای لوگو ۵۰٪ بازدید بیشتری دارند.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="نام شرکت / برند *" {...register("companyName")} error={errors.companyName?.message} placeholder="مثلاً: جابیکس تک" />
              <Input label="وب‌سایت" {...register("website")} error={errors.website?.message} placeholder="https://example.com" dir="ltr" />
              <Input label="ایمیل عمومی شرکت *" {...register("email")} error={errors.email?.message} placeholder="info@company.com" dir="ltr" />
              <Input label="شماره تماس ثابت *" {...register("phone")} error={errors.phone?.message} placeholder="۰۲۱..." dir="ltr" />
            </div>
            <div className="mt-4"><Input label="آدرس دفتر مرکزی *" {...register("address")} error={errors.address?.message} placeholder="شهر، خیابان..." /></div>
            <div className="mt-4"><Textarea label="درباره شرکت (معرفی کوتاه) *" {...register("bio")} error={errors.bio?.message} className="min-h-[150px]" /></div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="rounded-2xl px-6 shadow-lg shadow-primary/20 h-12" isLoading={isSubmitting}>
              <Save className="ml-2 h-5 w-5" /> ذخیره تغییرات نهایی
            </Button>
          </div>
        </div>
      </form>

      {/* 🔥 فرم تنظیم رمز عبور */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-8">
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">تنظیمات امنیتی و رمز عبور</h2>
            <p className="text-sm text-slate-500 mt-1">با تنظیم رمز عبور، برای ورود دیگر نیازی به منتظر ماندن برای پیامک ندارید.</p>
          </div>
        </div>
        
        <form onSubmit={handleUpdatePassword} className="p-4 sm:p-6">
          {passwordMessage && (
            <div className={`mb-4 flex items-start gap-2 rounded-xl p-4 text-sm border ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {passwordMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
              <p className="font-bold">{passwordMessage.text}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
            <Input 
              label="رمز عبور جدید" 
              type="password"
              placeholder="حداقل ۶ کاراکتر"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Key className="h-4 w-4" />}
            />
            <Input 
              label="تکرار رمز عبور" 
              type="password"
              placeholder="تکرار رمز عبور..."
              dir="ltr"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Key className="h-4 w-4" />}
            />
          </div>

          <div className="mt-4 flex">
            <Button type="submit" isLoading={isUpdatingPassword} disabled={!password || !confirmPassword} className="rounded-xl px-6 h-11 bg-slate-800 hover:bg-slate-900 text-white">
              <Save className="ml-2 h-4 w-4" /> ذخیره رمز عبور
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}