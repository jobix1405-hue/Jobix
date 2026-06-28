"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Briefcase, GraduationCap, Code, 
  ChevronRight, Phone, Mail, FileText, Loader2, MessageSquare,
  Star, Award, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

interface ApplicantProfile {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string;
  about_me: string;
  university: string;
  degree: string;
  last_company: string;
  last_position: string;
  skills: string;
  phone_number: string;
  email: string;
  avatar_url: string;
}

const SEEKER_BADGES = [
  { id: "punctual", label: "منظم و وقت‌شناس" },
  { id: "responsible", label: "مسئولیت‌پذیر" },
  { id: "professional", label: "متخصص و حرفه‌ای" },
  { id: "team_player", label: "روحیه کار تیمی" },
];

export default function ApplicantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { user } = useStore();

  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // استیت‌های مودال ارزیابی
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchProfileAndRatings = async () => {
      try {
        // واکشی پروفایل
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id as string)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // واکشی ارزیابی‌ها
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('score, badge, review_text')
          .eq('ratee_id', params.id as string);

        if (ratingsData) setRatings(ratingsData);

      } catch (err) {
        console.error("Error fetching applicant profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchProfileAndRatings();
  }, [params.id, supabase]);

  const handleStartChat = async () => {
    if (!user?.id || !profile?.id) return;
    setIsStartingChat(true);

    try {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('employer_id', user.id)
        .eq('job_seeker_id', profile.id)
        .maybeSingle();

      if (existingConv) {
        router.push('/employer/messages');
        return;
      }

      await supabase.from('conversations').insert({
        employer_id: user.id,
        job_seeker_id: profile.id,
      });
      
      router.push('/employer/messages');
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("خطا در برقراری ارتباط.");
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile?.id) return;
    if (score === 0 || !selectedBadge) return alert("لطفاً هم امتیاز ستاره‌ای و هم نشان را انتخاب کنید.");

    setIsSubmittingRating(true);
    try {
      const { error } = await supabase.from('ratings').insert({
        rater_id: user.id,
        ratee_id: profile.id,
        score,
        badge: selectedBadge,
        review_text: reviewText
      });

      if (error) {
        if (error.code === '23505') throw new Error("شما قبلاً ارزیابی خود را برای این شخص ثبت کرده‌اید.");
        throw error;
      }

      setRatings([...ratings, { score, badge: selectedBadge, review_text: reviewText }]);
      setIsRatingModalOpen(false);
      
    } catch (err: any) {
      alert(err.message || "خطا در ثبت ارزیابی.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  if (!profile) return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center">
      <FileText className="h-16 w-16 text-slate-300 mb-4" />
      <h2 className="text-xl font-bold text-slate-800">رزومه یافت نشد</h2>
      <Link href="/employer/applications" className="mt-4"><Button variant="outline">بازگشت به مدیریت رزومه‌ها</Button></Link>
    </div>
  );

  const fullName = profile.first_name ? `${profile.first_name} ${profile.last_name}` : 'کارجو (بدون نام)';
  const avgScore = ratings.length > 0 ? (ratings.reduce((a, b) => a + b.score, 0) / ratings.length).toFixed(1) : 'جدید';
  
  // محاسبه تعداد هر بج
  const badgeCounts = ratings.reduce((acc: Record<string, number>, curr) => {
    acc[curr.badge] = (acc[curr.badge] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500 pb-10">
      <Link href="/employer/applications" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary mb-6">
        <ChevronRight className="h-4 w-4" /> بازگشت به برد کانبان
      </Link>

      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-primary/10 to-transparent"></div>
          <div className="px-6 pb-8 pt-0 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="flex items-end gap-5 -mt-10">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white border-4 border-white shadow-md text-4xl font-bold text-slate-300 overflow-hidden relative">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" /> : <User className="h-10 w-10" />}
                </div>
                <div className="mb-2">
                  <h1 className="text-2xl font-extrabold text-slate-900">{fullName}</h1>
                  <p className="mt-1 text-lg font-medium text-slate-600">{profile.job_title || 'بدون عنوان شغلی'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsRatingModalOpen(true)} className="rounded-xl px-4 border-orange-200 text-orange-600 hover:bg-orange-50">
                  <Star className="h-4 w-4 ml-2 fill-orange-500 text-orange-500" /> ارزیابی کارجو
                </Button>
                <Button onClick={handleStartChat} isLoading={isStartingChat} className="rounded-xl px-6">
                  <MessageSquare className="h-4 w-4 ml-2" /> ارسال پیام
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
                    const badgeLabel = SEEKER_BADGES.find(b => b.id === badgeId)?.label || badgeId;
                    return (
                      <span key={badgeId} className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100">
                        <Award className="h-4 w-4" /> {badgeLabel} 
                        {/* 🔥 حل ارور تایپ اسکریپت با تبدیل به عدد */}
                        <span className="bg-blue-200/50 px-1.5 rounded-md text-[10px]">{Number(count)}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                <Phone className="h-5 w-5 text-slate-400" /> <span dir="ltr">{profile.phone_number || 'نامشخص'}</span>
              </div>
              {profile.email && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                  <Mail className="h-5 w-5 text-slate-400" /> <span dir="ltr">{profile.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {profile.about_me && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> درباره من
            </h2>
            <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{profile.about_me}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Briefcase className="h-5 w-5 text-secondary" /> آخرین سابقه شغلی
            </h2>
            {profile.last_company ? (
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-lg">{profile.last_position || 'سمت نامشخص'}</h3>
                <p className="text-slate-500">{profile.last_company}</p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">سابقه‌ای ثبت نشده است.</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <GraduationCap className="h-5 w-5 text-blue-500" /> آخرین مدرک تحصیلی
            </h2>
            {profile.university ? (
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-lg">دانشگاه {profile.university}</h3>
                <p className="text-slate-500">
                  {profile.degree === 'diploma' ? 'دیپلم' : profile.degree === 'bachelor' ? 'کارشناسی' : profile.degree === 'master' ? 'کارشناسی ارشد' : profile.degree === 'phd' ? 'دکترا' : 'نامشخص'}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">مدرک تحصیلی ثبت نشده است.</p>
            )}
          </div>
        </div>

        {profile.skills && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Code className="h-5 w-5 text-green-500" /> مهارت‌های تخصصی
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.split(',').map((skill, index) => (
                <span key={index} className="rounded-lg bg-slate-100 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isRatingModalOpen} onClose={() => !isSubmittingRating && setIsRatingModalOpen(false)} title="ارزیابی کارجو">
        <form onSubmit={handleSubmitRating} className="space-y-6 pt-2">
          {/* بخش امتیازدهی ستاره‌ای */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 text-center">امتیاز شما به این شخص</label>
            <div className="flex justify-center gap-2 flex-row-reverse">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setScore(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`h-10 w-10 ${score >= star ? 'fill-orange-400 text-orange-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* بخش انتخاب نشان (Badge) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">یک نشان ویژه انتخاب کنید</label>
            <div className="grid grid-cols-2 gap-3">
              {SEEKER_BADGES.map((badge) => (
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
            label="توضیحات بیشتر (اختیاری)" 
            placeholder="تجربه مصاحبه یا برخورد خود با این شخص را بنویسید..." 
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

    </div>
  );
}