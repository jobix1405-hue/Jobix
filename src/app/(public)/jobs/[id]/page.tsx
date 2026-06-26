"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, MapPin, Briefcase, Clock, DollarSign, 
  ChevronRight, Share2, Bookmark, CheckCircle2, AlertCircle, Loader2, Flag
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// توابع کمکی برای تبدیل نام‌های انگلیسی دیتابیس به فارسی
const getJobTypeLabel = (type: string) => {
  const types: Record<string, string> = { "full-time": "تمام وقت", "part-time": "پاره وقت", "remote": "دورکاری", "internship": "کارآموزی" };
  return types[type] || type;
};

const getSalaryLabel = (salary: string) => {
  const salaries: Record<string, string> = { "negotiable": "توافقی", "10-20": "۱۰ تا ۲۰ میلیون تومان", "20-30": "۲۰ تا ۳۰ میلیون تومان", "30+": "بیشتر از ۳۰ میلیون تومان" };
  return salaries[salary] || salary;
};

// دیتای تستی فقط برای حفظ ظاهر بخش شرایط و مزایا که در دیتابیس فیلد ندارن
const MOCK_ARRAYS = {
  requirements: [
    "حداقل ۳ سال سابقه کار مرتبط",
    "توانایی حل مسئله و کار گروهی",
    "تسلط به ابزارهای مدیریت نسخه مثل Git",
    "آشنایی با متدولوژی‌های چابک (Agile/Scrum)",
  ],
  benefits: [
    "بیمه تامین اجتماعی و بیمه تکمیلی",
    "ساعت کاری شناور",
    "پاداش‌های فصلی مبتنی بر عملکرد",
    "محیط کاری پویا، جوان و دوستانه"
  ]
};

export default function SingleJobPage() {
  const params = useParams(); // دریافت آیدی آگهی از آدرس مرورگر
  const router = useRouter();
  const supabase = createClient();
  const { user } = useStore();
  
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // استیت‌های مودال اپلای
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // استیت‌های بوکمارک (نشان‌کردن)
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingLoading, setIsSavingLoading] = useState(false);

  // استیت‌های مودال گزارش تخلف
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // واکشی اطلاعات آگهی و وضعیت ذخیره بودن
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        // ۱. واکشی دیتای آگهی
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*, profiles(*)')
          .eq('id', params.id as string)
          .single();

        if (jobError) throw jobError;
        setJobDetails(jobData);

        // 🚨 تغییر امنیتی: استفاده از RPC برای افزایش بازدید بصورت امن و جلوگیری از تقلب 🚨
        if (jobData) {
          try {
            await supabase.rpc('increment_job_view', { p_job_id: jobData.id });
          } catch (updateError) {
            console.error("Error updating views:", updateError);
          }
        }

        // ۲. بررسی اینکه آیا کاربر لاگین شده این آگهی را ذخیره کرده؟
        if (user?.id && user.role === 'job_seeker') {
          const { data: savedData } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('job_id', jobData.id)
            .eq('job_seeker_id', user.id)
            .single();

          if (savedData) setIsSaved(true);
        }

      } catch (err) {
        console.error("Error fetching job details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchJobData();
  }, [params.id, user?.id, supabase]);

  // هندل کردن باز شدن مودال اپلای
  const handleOpenApplyModal = () => {
    if (!user) {
      router.push(`/login?next=/jobs/${params.id}`);
      return;
    }
    if (user.role === 'employer') {
      alert("شما با حساب کارفرما وارد شده‌اید و نمی‌توانید رزومه ارسال کنید.");
      return;
    }
    setIsApplyModalOpen(true);
  };

  // ارسال درخواست کار واقعی
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !jobDetails?.id) return;

    setIsSubmitting(true);
    setApplyError(null);
    
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: jobDetails.id,
          job_seeker_id: user.id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error("شما قبلاً برای این موقعیت شغلی رزومه ارسال کرده‌اید.");
        }
        throw error;
      }

      setApplySuccess(true);
    } catch (err: any) {
      setApplyError(err.message || "خطایی در ارسال رزومه رخ داد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // هندلر بوکمارک کردن
  const handleToggleSave = async () => {
    if (!user) {
      router.push(`/login?next=/jobs/${params.id}`);
      return;
    }
    if (user.role === 'employer') {
      alert("کارفرمایان نیازی به ذخیره آگهی ندارند.");
      return;
    }

    setIsSavingLoading(true);
    try {
      if (isSaved) {
        // حذف از بوکمارک
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', jobDetails.id)
          .eq('job_seeker_id', user.id);
        setIsSaved(false);
      } else {
        // اضافه به بوکمارک
        await supabase
          .from('saved_jobs')
          .insert({ job_id: jobDetails.id, job_seeker_id: user.id });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setIsSavingLoading(false);
    }
  };

  // هندلر اشتراک‌گذاری
  const handleShare = async () => {
    const shareData = {
      title: `استخدام ${jobDetails.title} در ${jobDetails.profiles?.company_name}`,
      text: 'این فرصت شغلی را در جابیکس ببینید:',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // کپی در کلیپ‌بورد برای مرورگرهایی که پشتیبانی نمی‌کنند
        await navigator.clipboard.writeText(window.location.href);
        alert("لینک آگهی در حافظه کپی شد.");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // هندلر ثبت گزارش تخلف
  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push(`/login?next=/jobs/${params.id}`);
    if (!reportReason) return alert("لطفاً دلیل گزارش را انتخاب کنید.");

    setIsReporting(true);
    try {
      const { error } = await supabase.from('reports').insert({
        job_id: jobDetails.id,
        reporter_id: user.id,
        reason: reportReason,
        description: reportDesc
      });
      if (error) throw error;
      
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportReason("");
        setReportDesc("");
      }, 3000);
    } catch (err) {
      alert("خطا در ثبت گزارش.");
    } finally {
      setIsReporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc]">
        <AlertCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">آگهی مورد نظر یافت نشد</h2>
        <Link href="/jobs" className="mt-6">
          <Button variant="outline">بازگشت به لیست مشاغل</Button>
        </Link>
      </div>
    );
  }

  const companyName = jobDetails.profiles?.company_name || 'شرکت نامشخص';
  const logo = jobDetails.profiles?.logo_url;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* لینک بازگشت */}
        <Link 
          href="/jobs" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary mb-6"
        >
          <ChevronRight className="h-4 w-4" />
          بازگشت به لیست مشاغل
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row">
          
          {/* ستون اصلی (راست) - محتوای آگهی */}
          <div className="flex-1 space-y-6">
            
            {/* هدر آگهی (کارت بالایی) */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="h-32 bg-gradient-to-r from-primary/10 to-transparent"></div>
              <div className="px-6 pb-8 pt-0 sm:px-10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                  <div className="flex items-end gap-6 -mt-10">
                    {/* لوگو شرکت */}
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden">
                      {logo ? (
                        <img src={logo} alt="logo" className="w-full h-full object-cover"/>
                      ) : (
                        <Building2 className="h-12 w-12 text-slate-400" />
                      )}
                    </div>
                    <div className="mb-2">
                      <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                        {jobDetails.title}
                      </h1>
                      <div className="mt-2 flex items-center gap-2 text-slate-600 font-medium">
                        <Building2 className="h-5 w-5" />
                        {companyName}
                      </div>
                    </div>
                  </div>
                  
                  {/* دکمه‌های عملیات */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleShare}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-primary"
                      title="اشتراک گذاری"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleToggleSave}
                      disabled={isSavingLoading}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
                        isSaved 
                          ? "border-secondary bg-secondary/10 text-secondary" 
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-secondary"
                      }`}
                      title={isSaved ? "حذف از نشان‌شده‌ها" : "نشان کردن"}
                    >
                      {isSavingLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                      )}
                    </button>
                    <Button 
                      size="lg" 
                      className="h-12 rounded-xl px-8"
                      onClick={handleOpenApplyModal}
                    >
                      ارسال درخواست
                    </Button>
                  </div>
                </div>

                {/* تگ‌های اطلاعات کلی */}
                <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    {jobDetails.location_text || 'نامشخص'}
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                    {getJobTypeLabel(jobDetails.job_type)}
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <DollarSign className="h-5 w-5 text-slate-400" />
                    {getSalaryLabel(jobDetails.salary_range)}
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                    <Clock className="h-5 w-5 text-slate-400" />
                    {new Date(jobDetails.created_at).toLocaleDateString('fa-IR')}
                  </div>
                </div>
              </div>
            </div>

            {/* توضیحات آگهی */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">درباره این شغل</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {jobDetails.description}
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">شرایط و مهارت‌های مورد نیاز:</h3>
              <ul className="space-y-3">
                {MOCK_ARRAYS.requirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">مزایا و تسهیلات:</h3>
              <ul className="space-y-3">
                {MOCK_ARRAYS.benefits.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2 ml-1" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ستون کناری (چپ) - اطلاعات شرکت */}
          <aside className="w-full lg:w-1/3 space-y-6">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
                معرفی شرکت
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                  {logo ? (
                    <img src={logo} alt="logo" className="w-full h-full object-cover"/>
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{companyName}</h4>
                  {jobDetails.profiles?.website && (
                    <a href={jobDetails.profiles.website.startsWith('http') ? jobDetails.profiles.website : `https://${jobDetails.profiles.website}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-1 block" dir="ltr">
                      {jobDetails.profiles.website}
                    </a>
                  )}
                </div>
              </div>

              {jobDetails.profiles?.bio && (
                <div className="mb-6">
                  <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    {jobDetails.profiles.bio}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">اندازه شرکت:</span>
                  <span className="font-medium text-slate-900">نامشخص</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">صنعت:</span>
                  <span className="font-medium text-slate-900">فناوری اطلاعات</span>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-blue-50 p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    با ارسال رزومه، پروفایل شما در جابیکس برای کارفرما ارسال خواهد شد. حتماً قبل از ارسال، رزومه خود را تکمیل کنید.
                  </p>
                </div>
              </div>

              <Button 
                className="w-full mt-6 h-12 rounded-xl text-base"
                onClick={handleOpenApplyModal}
              >
                ارسال رزومه برای این شغل
              </Button>

              {/* دکمه گزارش تخلف */}
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors py-2"
              >
                <Flag className="h-4 w-4" /> گزارش مشکل در آگهی
              </button>

            </div>
          </aside>

        </div>
      </div>

      {/* ==============================================
          مودال (پاپ‌آپ) ارسال درخواست کار
          ============================================== */}
      <Modal 
        isOpen={isApplyModalOpen} 
        onClose={() => {
          if (!isSubmitting) {
            setIsApplyModalOpen(false);
            setApplySuccess(false);
            setApplyError(null);
          }
        }}
        title={applySuccess ? "درخواست با موفقیت ارسال شد" : "ارسال درخواست همکاری"}
      >
        {applySuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">رزومه شما برای کارفرما ارسال شد!</h3>
            <p className="mt-2 text-sm text-slate-500">
              می‌توانید وضعیت درخواست خود را از پنل کاربری بخش "درخواست‌های من" پیگیری کنید.
            </p>
            <Button 
              className="mt-6 w-full"
              onClick={() => {
                setIsApplyModalOpen(false);
                setApplySuccess(false);
              }}
            >
              متوجه شدم
            </Button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-5">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm overflow-hidden border border-slate-200">
                {logo ? (
                  <img src={logo} alt="logo" className="w-full h-full object-cover"/>
                ) : (
                  <Building2 className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{jobDetails.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{companyName}</p>
              </div>
            </div>

            {applyError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{applyError}</p>
              </div>
            )}

            <Input 
              label="ایمیل شما (اختیاری)"
              placeholder="example@gmail.com"
              type="email"
              dir="ltr"
            />

            <Textarea 
              label="کاور لتر یا پیام کوتاه برای کارفرما (اختیاری)"
              placeholder="توضیح دهید چرا برای این موقعیت شغلی مناسب هستید..."
              className="min-h-[100px]"
            />

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <Button 
                type="button" 
                variant="ghost" 
                className="flex-1"
                onClick={() => setIsApplyModalOpen(false)}
                disabled={isSubmitting}
              >
                انصراف
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                isLoading={isSubmitting}
              >
                تایید و ارسال رزومه
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ==============================================
          مودال (پاپ‌آپ) گزارش تخلف
          ============================================== */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => !isReporting && setIsReportModalOpen(false)} 
        title="گزارش آگهی نامناسب"
      >
        {reportSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h3 className="font-bold text-slate-900">گزارش شما ثبت شد</h3>
            <p className="text-sm text-slate-500 mt-2">مدیریت جابیکس به زودی این مورد را بررسی خواهد کرد.</p>
          </div>
        ) : (
          <form onSubmit={handleReport} className="space-y-4 pt-2">
            <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-xs text-orange-800 mb-4">
              در صورت مشاهده درخواست وجه، کلاهبرداری، اطلاعات دروغین یا رفتار نامناسب، مراتب را گزارش دهید.
            </div>
            
            <Select 
              label="دلیل گزارش *"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              options={[
                { value: "scam", label: "کلاهبرداری یا درخواست وجه" },
                { value: "fake", label: "آگهی دروغین یا شرکت نامعتبر" },
                { value: "inappropriate", label: "محتوای نامناسب یا توهین‌آمیز" },
                { value: "other", label: "سایر موارد" },
              ]}
            />
            
            <Textarea 
              label="توضیحات بیشتر (اختیاری)"
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder="لطفا جزئیات را بنویسید..."
            />
            
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                className="flex-1"
                onClick={() => setIsReportModalOpen(false)}
                disabled={isReporting}
              >
                انصراف
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                isLoading={isReporting}
              >
                ثبت گزارش
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </main>
  );
}