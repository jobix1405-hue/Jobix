"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, MapPin, Globe, Briefcase, ChevronRight, 
  Clock, ShieldCheck, AlertCircle, Loader2, ChevronLeft,
  Star, Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// توابع کمکی برای آگهی‌ها
const getJobTypeLabel = (type: string) => {
  const types: Record<string, string> = { "full-time": "تمام وقت", "part-time": "پاره وقت", "remote": "دورکاری", "internship": "کارآموزی" };
  return types[type] || type;
};

const getSalaryLabel = (salary: string) => {
  const salaries: Record<string, string> = { "negotiable": "توافقی", "10-20": "۱۰ تا ۲۰ میلیون", "20-30": "۲۰ تا ۳۰ میلیون", "30+": "بیشتر از ۳۰ میلیون" };
  return salaries[salary] || salary;
};

// لیست بج‌های اختصاصی شرکت‌ها
const COMPANY_BADGES = [
  { id: "great_culture", label: "محیط کار عالی" },
  { id: "fast_response", label: "پاسخگویی سریع" },
  { id: "on_time_pay", label: "حقوق به موقع" },
  { id: "pro_management", label: "مدیریت حرفه‌ای" },
];

// 👈 معیارهای امتیازدهی چندگانه به شرکت
const COMPANY_CRITERIA = [
  { id: "environment", label: "محیط کار" },
  { id: "payment", label: "پرداخت به‌موقع حقوق" },
  { id: "management", label: "مدیریت و رهبری" },
  { id: "growth", label: "فرصت رشد و یادگیری" },
];

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { user } = useStore();
  
  const [company, setCompany] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // استیت‌های مودال ارزیابی
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // ۱. واکشی اطلاعات شرکت
        const { data: companyData, error: companyError } = await supabase
          .from('profiles')
          .select('id, company_name, logo_url, bio, address, website, is_verified')
          .eq('id', params.id as string)
          .single();

        if (companyError) throw companyError;
        setCompany(companyData);

        // ۲. واکشی آگهی‌های فعال این شرکت
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, location_text, job_type, salary_range, created_at')
          .eq('employer_id', params.id as string)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!jobsError && jobsData) {
          setActiveJobs(jobsData);
        }

        // ۳. واکشی ارزیابی‌ها
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('score, badge, review_text')
          .eq('ratee_id', params.id as string);

        if (ratingsData) setRatings(ratingsData);

      } catch (err) {
        console.error("Error fetching company data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchCompanyData();
  }, [params.id, supabase]);

  const handleOpenRatingModal = () => {
    if (!user) return router.push(`/login?next=/companies/${params.id}`);
    setIsRatingModalOpen(true);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !company?.id) return;

    const filledCriteria = COMPANY_CRITERIA.filter(c => criteriaScores[c.id] > 0);
    if (filledCriteria.length < COMPANY_CRITERIA.length || !selectedBadge) {
      return alert("لطفاً به همه معیارها امتیاز دهید و یک نشان را انتخاب کنید.");
    }

    const avgScore = Math.round(
      (Object.values(criteriaScores).reduce((a, b) => a + b, 0) / COMPANY_CRITERIA.length) * 10
    ) / 10;

    setIsSubmittingRating(true);
    try {
      const { error } = await supabase.from('ratings').insert({
        rater_id: user.id,
        ratee_id: company.id,
        score: avgScore,
        criteria_scores: criteriaScores,
        badge: selectedBadge,
        review_text: reviewText
      });

      if (error) {
        if (error.code === '23505') throw new Error("شما قبلاً ارزیابی خود را برای این شرکت ثبت کرده‌اید.");
        throw error;
      }

      setRatings([...ratings, { score: avgScore, criteria_scores: criteriaScores, badge: selectedBadge, review_text: reviewText }]);
      setIsRatingModalOpen(false);
      setCriteriaScores({});
      
    } catch (err: any) {
      alert(err.message || "خطا در ثبت ارزیابی.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc]">
        <AlertCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">پروفایل شرکت یافت نشد</h2>
        <Link href="/companies" className="mt-6 text-primary hover:underline">
          بازگشت به دایرکتوری شرکت‌ها
        </Link>
      </div>
    );
  }

  const avgScore = ratings.length > 0 ? (ratings.reduce((a, b) => a + b.score, 0) / ratings.length).toFixed(1) : 'جدید';
  
  // محاسبه تعداد هر بج با تایپ‌اسکریپت امن
  const badgeCounts = ratings.reduce((acc: Record<string, number>, curr) => {
    acc[curr.badge] = (acc[curr.badge] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* لینک بازگشت */}
        <Link 
          href="/companies" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary mb-6"
        >
          <ChevronRight className="h-4 w-4" />
          لیست شرکت‌ها
        </Link>

        {/* هدر پروفایل شرکت */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm mb-8">
          <div className="h-40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
            {/* پترن تزئینی */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          <div className="px-6 pb-8 pt-0 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 justify-between">
              
              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                {/* لوگو شرکت */}
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl bg-white border-4 border-white shadow-lg text-5xl font-bold text-primary overflow-hidden z-10">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="logo" className="w-full h-full object-cover"/>
                  ) : (
                    company.company_name.charAt(0)
                  )}
                </div>
                
                <div className="mb-2 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                    {company.company_name}
                    {company.is_verified && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full border border-blue-200 align-middle">
                        <ShieldCheck className="h-4 w-4" /> تایید شده
                      </span>
                    )}
                  </h1>
                  
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                    {company.address && (
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {company.address}
                      </span>
                    )}
                    {company.website && (
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hover:text-primary transition-colors" dir="ltr">
                        <Globe className="h-4 w-4 text-slate-400" />
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* دکمه ثبت ارزیابی */}
              <div className="mt-4 sm:mt-0 pb-2">
                <Button variant="outline" onClick={handleOpenRatingModal} className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 bg-white shadow-sm">
                  <Star className="h-4 w-4 ml-2 fill-orange-500 text-orange-500" /> ثبت ارزیابی شرکت
                </Button>
              </div>

            </div>

            {/* بخش نمایش امتیازها و مدال‌ها */}
            {(ratings.length > 0) && (
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl">
                  <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
                  <span className="font-extrabold text-orange-700">{avgScore}</span>
                  <span className="text-xs text-orange-600/80">({ratings.length} رای)</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {Object.entries(badgeCounts).map(([badgeId, count]) => {
                    const badgeLabel = COMPANY_BADGES.find(b => b.id === badgeId)?.label || badgeId;
                    return (
                      <span key={badgeId} className="flex items-center gap-1.5 text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100">
                        <Award className="h-4 w-4" /> {badgeLabel} 
                        {/* تبدیل به Number برای رفع خطای تایپ‌اسکریپت */}
                        <span className="bg-green-200/50 px-1.5 rounded-md text-[10px]">{Number(count)}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ستون درباره شرکت */}
          <div className="lg:col-span-1 space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                درباره شرکت
              </h2>
              {company.bio ? (
                <p className="text-slate-600 leading-relaxed text-sm text-justify whitespace-pre-wrap">
                  {company.bio}
                </p>
              ) : (
                <p className="text-slate-400 text-sm">توضیحاتی ثبت نشده است.</p>
              )}
            </div>
          </div>

          {/* ستون آگهی‌های فعال */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-secondary" />
              فرصت‌های شغلی فعال ({activeJobs.length})
            </h2>

            {activeJobs.length > 0 ? (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <Link 
                    key={job.id} 
                    href={`/jobs/${job.id}`} 
                    className="group block bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                          {job.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 border border-slate-100">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location_text || 'نامشخص'}
                          </span>
                          <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 border border-slate-100">
                            <Briefcase className="h-3.5 w-3.5" />
                            {getJobTypeLabel(job.job_type)}
                          </span>
                          <span className="flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 font-medium border border-green-100">
                            {getSalaryLabel(job.salary_range)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(job.created_at).toLocaleDateString('fa-IR')}
                        </span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 mt-2">
                          مشاهده
                          <ChevronLeft className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <Briefcase className="h-10 w-10 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">آگهی فعالی وجود ندارد</h3>
                <p className="mt-2 text-sm text-slate-500">
                  این شرکت در حال حاضر هیچ فرصت شغلی بازی ندارد.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* مودال ارزیابی شرکت */}
      <Modal isOpen={isRatingModalOpen} onClose={() => !isSubmittingRating && setIsRatingModalOpen(false)} title={`ارزیابی شرکت ${company.company_name}`}>
        <form onSubmit={handleSubmitRating} className="space-y-6 pt-2">
          
          {/* بخش امتیازدهی ستاره‌ای */}
          <div className="space-y-4">
            {COMPANY_CRITERIA.map((criterion) => (
              <div key={criterion.id}>
                <label className="block text-sm font-bold text-slate-700 mb-2">{criterion.label}</label>
                <div className="flex gap-1.5 flex-row-reverse">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCriteriaScores(prev => ({ ...prev, [criterion.id]: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`h-7 w-7 ${(criteriaScores[criterion.id] || 0) >= star ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* بخش انتخاب نشان (Badge) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">کدام ویژگی در این شرکت بارزتر است؟</label>
            <div className="grid grid-cols-2 gap-3">
              {COMPANY_BADGES.map((badge) => (
                <button
                  key={badge.id} 
                  type="button" 
                  onClick={() => setSelectedBadge(badge.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedBadge === badge.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-primary/30'}`}
                >
                  <Award className="h-6 w-6 mb-1" />
                  <span className="text-xs font-bold">{badge.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Textarea 
            label="تجربه خود را بنویسید (اختیاری)" 
            placeholder="تجربه مصاحبه یا همکاری خود با این شرکت را بنویسید..." 
            value={reviewText} 
            onChange={(e) => setReviewText(e.target.value)} 
            className="min-h-[80px]"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsRatingModalOpen(false)} disabled={isSubmittingRating}>انصراف</Button>
            <Button type="submit" className="flex-1 shadow-lg" isLoading={isSubmittingRating}>ثبت ارزیابی</Button>
          </div>
        </form>
      </Modal>

    </main>
  );
}