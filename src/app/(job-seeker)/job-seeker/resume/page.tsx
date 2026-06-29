"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  User, Briefcase, GraduationCap, Code, CheckCircle2, 
  Save, AlertCircle, Camera, Plus, Trash2, Video, Sparkles, Loader2, Upload
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// =========================================
// ۱. شمای اعتبارسنجی فرم (Zod)
// =========================================
const experienceSchema = z.object({
  company: z.string().min(2, "نام شرکت الزامی است"),
  position: z.string().min(2, "سمت شغلی الزامی است"),
});

const educationSchema = z.object({
  university: z.string().min(2, "نام دانشگاه الزامی است"),
  degree: z.string().min(2, "مقطع تحصیلی الزامی است"),
});

const resumeSchema = z.object({
  firstName: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ حرف باشد"),
  jobTitle: z.string().min(3, "عنوان تخصصی خود را وارد کنید"),
  aboutMe: z.string().max(1000, "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ حرف باشد").optional(),
  skills: z.string().optional(),
  workStatus: z.enum(['ready', 'negotiating', 'hired']),
  experiences: z.array(experienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

// =========================================
// کامپوننت اصلی
// =========================================
export default function ResumeBuilderPage() {
  const supabase = createClient();
  const { user } = useStore();

  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "skills" | "video">("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // استیت‌های عکس پروفایل
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // استیت مودال ویدیو
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      firstName: "", lastName: "", jobTitle: "", aboutMe: "", skills: "", 
      workStatus: "ready", experiences: [], educations: []
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experiences" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "educations" });

  // واکشی اطلاعات از دیتابیس
  useEffect(() => {
    const fetchResume = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) throw error;
        if (data) {
          // انتقال دیتای قدیمی به ساختار جدید (برای جلوگیری از حذف سوابق قبلی کاربران)
          let exp = data.work_experiences || [];
          if (exp.length === 0 && data.last_company) {
            exp.push({ company: data.last_company, position: data.last_position || '' });
          }
          let edu = data.educations || [];
          if (edu.length === 0 && data.university) {
            edu.push({ university: data.university, degree: data.degree || '' });
          }

          reset({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            jobTitle: data.job_title || "",
            aboutMe: data.about_me || "",
            skills: data.skills || "",
            workStatus: data.work_status || "ready",
            experiences: exp,
            educations: edu,
          });
          setAvatarUrl(data.avatar_url);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchResume();
  }, [user?.id, reset, supabase]);

  // =========================================
  // الگوریتم فشرده‌سازی فوق‌قوی تصویر (Client-Side)
  // =========================================
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; // سایز استاندارد پروفایل
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // کیفیت 0.6 باعث میشه حجم عکس بیاد زیر ۵۰ کیلوبایت!
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            else reject(new Error("Compression failed"));
          }, 'image/jpeg', 0.6); 
        };
      };
    });
  };

  // هندل آپلود عکس پروفایل
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      // فشرده‌سازی عکس قبل از آپلود
      const compressedFile = await compressImage(file);
      const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('jobix-storage').upload(filePath, compressedFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('jobix-storage').getPublicUrl(filePath);
      
      // ذخیره لینک عکس در پروفایل و ست کردن وضعیت تایید به pending
      await supabase.from('profiles').update({ 
        avatar_url: publicUrlData.publicUrl,
        avatar_status: 'pending' // این فیلد برای تایید ادمین است
      }).eq('id', user.id);
      
      setAvatarUrl(publicUrlData.publicUrl);
      alert("عکس با موفقیت آپلود شد و پس از تایید مدیریت، در رزومه نمایش داده می‌شود.");
    } catch (err) {
      console.error(err);
      alert("خطا در آپلود عکس");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ذخیره فرم
  const onSubmit = async (data: ResumeFormValues) => {
    if (!user?.id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: data.firstName,
        last_name: data.lastName,
        job_title: data.jobTitle,
        about_me: data.aboutMe,
        skills: data.skills,
        work_status: data.workStatus,
        work_experiences: data.experiences,
        educations: data.educations,
      }).eq('id', user.id);

      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setErrorMessage("خطایی در ذخیره رزومه رخ داد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500 pb-10">
      
      {/* هدر */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">رزومه ساز پیشرفته</h1>
          <p className="mt-2 text-sm text-slate-500">پروفایل خود را کامل کنید تا بهترین پیشنهادات شغلی را دریافت کنید.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/resume/${user?.id}`} target="_blank">
            <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white">مشاهده خروجی رزومه</Button>
          </Link>
          {isSuccess && <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700"><CheckCircle2 className="h-5 w-5" /> ذخیره شد</div>}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /> <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* تب‌ها */}
        <div className="flex overflow-x-auto gap-2 rounded-2xl bg-slate-100 p-1.5 scrollbar-hide">
          {[
            { id: "personal", label: "اطلاعات فردی", icon: User },
            { id: "experience", label: "سوابق شغلی", icon: Briefcase },
            { id: "education", label: "تحصیلات", icon: GraduationCap },
            { id: "skills", label: "مهارت‌ها", icon: Code },
            { id: "video", label: "رزومه ویدیویی", icon: Video }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex whitespace-nowrap items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* بدنه فرم */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
          
          {/* 1. اطلاعات فردی */}
          <div className={activeTab === "personal" ? "block space-y-8" : "hidden"}>
            
            {/* بخش آپلود عکس پروفایل */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <div className="relative group cursor-pointer" onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}>
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-slate-50 bg-slate-100 text-slate-300 overflow-hidden shadow-sm transition-all group-hover:border-primary/20">
                  {isUploadingAvatar ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <User className="h-10 w-10" />}
                </div>
                <div className="absolute -bottom-2 -right-2 rounded-full bg-white p-1.5 shadow-md border border-slate-100 text-slate-600 group-hover:text-primary group-hover:scale-110 transition-all">
                  <Camera className="h-4 w-4" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">عکس پروفایل (اختیاری)</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  رزومه‌های دارای تصویر حرفه‌ای تا ۳ برابر بیشتر مورد توجه کارفرمایان قرار می‌گیرند. (حجم به صورت خودکار بهینه‌سازی می‌شود)
                </p>
              </div>
            </div>

            {/* بخش وضعیت اشتغال */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">وضعیت فعلی اشتغال شما</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "ready", label: "آماده به کار", color: "text-green-700 bg-green-50 border-green-200 ring-green-500" },
                  { id: "negotiating", label: "در حال مذاکره", color: "text-yellow-700 bg-yellow-50 border-yellow-200 ring-yellow-500" },
                  { id: "hired", label: "مشغول به کار", color: "text-red-700 bg-red-50 border-red-200 ring-red-500" }
                ].map((status) => (
                  <label key={status.id} className="relative cursor-pointer">
                    <input type="radio" value={status.id} {...register("workStatus")} className="peer hidden" />
                    <div className={`flex items-center justify-center p-3 rounded-xl border text-sm font-bold transition-all peer-checked:ring-2 opacity-60 peer-checked:opacity-100 ${status.color}`}>
                      {status.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input label="نام *" placeholder="مثال: علی" {...register("firstName")} error={errors.firstName?.message} />
              <Input label="نام خانوادگی *" placeholder="مثال: محمدی" {...register("lastName")} error={errors.lastName?.message} />
            </div>
            <Input label="عنوان تخصصی (Job Title) *" placeholder="مثال: برنامه‌نویس ارشد فرانت‌اند" {...register("jobTitle")} error={errors.jobTitle?.message} />
            <Textarea label="درباره من (خلاصه رزومه)" placeholder="یک پاراگراف در مورد تجربه و اهداف خود بنویسید..." className="min-h-[120px]" {...register("aboutMe")} error={errors.aboutMe?.message} />
          </div>

          {/* 2. سوابق شغلی (آرایه داینامیک) */}
          <div className={activeTab === "experience" ? "block space-y-6" : "hidden"}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> سوابق کاری</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ company: "", position: "" })} className="rounded-lg h-9">
                <Plus className="h-4 w-4 ml-1" /> افزودن سابقه
              </Button>
            </div>
            
            {expFields.length === 0 && <p className="text-sm text-slate-400 text-center py-6">هنوز سابقه‌ای ثبت نکرده‌اید.</p>}
            
            {expFields.map((field, index) => (
              <div key={field.id} className="relative bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <button type="button" onClick={() => removeExp(index)} className="absolute left-4 top-4 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-2">
                  <Input label="نام شرکت *" placeholder="مثال: اسنپ" {...register(`experiences.${index}.company`)} />
                  <Input label="سمت شغلی *" placeholder="مثال: مدیر محصول" {...register(`experiences.${index}.position`)} />
                </div>
              </div>
            ))}
          </div>

          {/* 3. تحصیلات (آرایه داینامیک) */}
          <div className={activeTab === "education" ? "block space-y-6" : "hidden"}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> سوابق تحصیلی</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ university: "", degree: "" })} className="rounded-lg h-9">
                <Plus className="h-4 w-4 ml-1" /> افزودن مدرک
              </Button>
            </div>

            {eduFields.length === 0 && <p className="text-sm text-slate-400 text-center py-6">مدرک تحصیلی ثبت نشده است.</p>}

            {eduFields.map((field, index) => (
              <div key={field.id} className="relative bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <button type="button" onClick={() => removeEdu(index)} className="absolute left-4 top-4 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-2">
                  <Input label="دانشگاه / موسسه *" placeholder="مثال: دانشگاه تهران" {...register(`educations.${index}.university`)} />
                  <Select label="مقطع تحصیلی *" options={[{ value: "diploma", label: "دیپلم" }, { value: "bachelor", label: "کارشناسی" }, { value: "master", label: "کارشناسی ارشد" }, { value: "phd", label: "دکترا" }]} {...register(`educations.${index}.degree`)} />
                </div>
              </div>
            ))}
          </div>

          {/* 4. مهارت‌ها */}
          <div className={activeTab === "skills" ? "block space-y-6" : "hidden"}>
            <div className="rounded-xl bg-blue-50 p-4 mb-4 border border-blue-100 text-sm text-blue-800 leading-relaxed">
              مهارت‌های تخصصی خود را با کاما (,) از هم جدا کنید. سیستم هوشمند جابیکس از این کلمات برای پیشنهاد بهترین آگهی‌ها به شما استفاده می‌کند.
            </div>
            <Textarea label="لیست مهارت‌ها" placeholder="مثال: React, مدیریت زمان, فروش B2B, فتوشاپ" className="min-h-[150px]" {...register("skills")} />
          </div>

          {/* 5. رزومه ویدیویی */}
          <div className={activeTab === "video" ? "block space-y-6" : "hidden"}>
            <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 border-dashed text-center">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Video className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">رزومه ویدیویی خود را بسازید</h3>
              <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                با ضبط یک ویدیوی کوتاه ۳۰ ثانیه‌ای، خودتان را به کارفرمایان معرفی کنید و شانس استخدام خود را ۳ برابر کنید.
              </p>
              <Button type="button" onClick={() => setIsVideoModalOpen(true)} className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20">
                <Upload className="ml-2 h-5 w-5" /> آپلود ویدیوی معرفی
              </Button>
            </div>
          </div>

        </div>

        {/* دکمه ذخیره نهایی */}
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="rounded-xl px-10 h-12 shadow-lg shadow-primary/20" isLoading={isSubmitting}>
            <Save className="ml-2 h-5 w-5" /> بروزرسانی پروفایل
          </Button>
        </div>
      </form>

      {/* مودال «به زودی» برای آپلود ویدیو */}
      <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)}>
        <div className="flex flex-col items-center text-center py-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
            <div className="h-20 w-20 bg-white border-2 border-amber-100 rounded-full flex items-center justify-center shadow-lg relative z-10">
              <Sparkles className="h-10 w-10 text-amber-500" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">این ویژگی به زودی فعال می‌شود!</h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-8">
            تیم مهندسی جابیکس در حال آماده‌سازی زیرساخت‌های لازم برای پردازش و فشرده‌سازی ویدیوهای شماست. این قابلیت فوق‌العاده جذاب در آپدیت بعدی در دسترس خواهد بود. منتظر باشید! 🚀
          </p>
          <Button onClick={() => setIsVideoModalOpen(false)} className="w-full sm:w-auto px-10 rounded-xl h-12 bg-slate-900 hover:bg-slate-800 text-white border-none">
            متوجه شدم
          </Button>
        </div>
      </Modal>

    </div>
  );
}