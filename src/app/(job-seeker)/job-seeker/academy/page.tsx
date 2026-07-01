"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Map, Target, Rocket, 
  Loader2, Sparkles, ChevronLeft, BookOpen,
  Clock, Send, CheckCircle2, PhoneCall, Award, ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { normalizeText } from "@/lib/matching";

interface Course {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  related_job_titles: string;
  external_url: string | null;
}

type RequestStatus = "pending" | "contacted" | "registered" | "completed";

// بررسی می‌کند آیا این دوره با عنوان شغلی کارجو مرتبط است یا نه
// (تطبیق دو طرفه و نرمال‌شده، دقیقاً با همان منطق تطبیق آگهی‌ها در lib/matching.ts)
function jobTitleMatchesCourse(relatedJobTitles: string, seekerJobTitle: string): boolean {
  const normSeeker = normalizeText(seekerJobTitle);
  if (!normSeeker) return false;

  return (relatedJobTitles || "")
    .split(",")
    .map(t => normalizeText(t))
    .filter(Boolean)
    .some(t => normSeeker.includes(t) || t.includes(normSeeker));
}

const STATUS_LABELS: Record<RequestStatus, { label: string; className: string; icon: any }> = {
  pending: { label: "در انتظار تماس", className: "bg-orange-100 text-orange-700 border-orange-200", icon: PhoneCall },
  contacted: { label: "تماس گرفته شد", className: "bg-blue-100 text-blue-700 border-blue-200", icon: PhoneCall },
  registered: { label: "ثبت‌نام قطعی", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  completed: { label: "دوره تکمیل شد", className: "bg-purple-100 text-purple-700 border-purple-200", icon: Award },
};

export default function AcademyPage() {
  const supabase = createClient();
  const { user } = useStore();

  const [currentJob, setCurrentJob] = useState<string>("در حال بررسی...");
  const [isLoading, setIsLoading] = useState(true);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [myRequests, setMyRequests] = useState<Record<string, RequestStatus>>({});
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademyData = async () => {
      if (!user?.id) return;
      try {
        // دریافت شغل فعلی کاربر از پروفایل (برای نقشه راه شغلی و تطبیق دوره‌ها)
        const { data: profile } = await supabase
          .from('profiles')
          .select('job_title')
          .eq('id', user.id)
          .single();
          
        const jobTitle = profile?.job_title || "";
        setCurrentJob(jobTitle || "بدون سمت");

        // دریافت دوره‌های فعال آکادمی
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description, duration, related_job_titles, external_url')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (coursesError) throw coursesError;
        setCourses(coursesData || []);

        // دریافت درخواست‌های قبلی خود کاربر برای این دوره‌ها
        const { data: requestsData, error: requestsError } = await supabase
          .from('course_requests')
          .select('course_id, status')
          .eq('job_seeker_id', user.id);

        if (requestsError) throw requestsError;

        const requestsMap: Record<string, RequestStatus> = {};
        (requestsData || []).forEach((r: any) => {
          requestsMap[r.course_id] = r.status;
        });
        setMyRequests(requestsMap);

      } catch (err) {
        console.error("خطا در دریافت اطلاعات آکادمی:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingCourses(false);
      }
    };

    fetchAcademyData();
  }, [user?.id, supabase]);

  const handleRequestCourse = async (courseId: string) => {
    if (!user?.id || myRequests[courseId]) return;

    setRequestingId(courseId);
    try {
      const { error } = await supabase.from('course_requests').insert({
        job_seeker_id: user.id,
        course_id: courseId,
        status: 'pending',
      });

      if (error) {
        // اگر قبلاً درخواست ثبت شده بود (ایندکس یکتا)، فقط وضعیت را sync می‌کنیم
        if (error.code === '23505') {
          setMyRequests(prev => ({ ...prev, [courseId]: 'pending' }));
          return;
        }
        throw error;
      }

      setMyRequests(prev => ({ ...prev, [courseId]: 'pending' }));
    } catch (err) {
      console.error("خطا در ثبت درخواست دوره:", err);
      alert("خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.");
    } finally {
      setRequestingId(null);
    }
  };

  const matchedCourses = courses.filter(c => jobTitleMatchesCourse(c.related_job_titles, currentJob));

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500 pb-10">
      
      {/* 🌟 بنر تبلیغاتی و انگیزشی */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-900 p-8 sm:p-12 shadow-xl mb-10 text-white border border-primary/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur-md border border-white/20 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-300" /> آکادمی تخصصی جابیکس
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
              خودت را بساز،<br /> رشد کن و بدرخش!
            </h1>
            <p className="text-blue-100 max-w-md leading-relaxed text-sm sm:text-base text-justify">
              مسیر شغلی شما به نقطه فعلی ختم نمی‌شود. با گذراندن دوره‌های تخصصی هدفمند، مهارت‌های خود را ارتقا دهید و برای موقعیت‌های شغلی رویایی خود آماده شوید.
            </p>
          </div>
          <div className="shrink-0">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border-4 border-white/20 shadow-2xl">
              <Rocket className="h-14 w-14 text-white -rotate-12" />
            </div>
          </div>
        </div>
      </div>

      {/* 🗺️ نقشه راه و وضعیت فعلی */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Map className="h-6 w-6 text-secondary" /> نقشه راه شغلی شما
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
          
          <div className="flex-1 flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full">
            <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">سمت فعلی</span>
            <h3 className="text-lg font-bold text-slate-800">{currentJob}</h3>
          </div>

          <div className="flex items-center justify-center text-slate-300 md:rotate-0 rotate-90">
            <div className="w-16 h-1 bg-slate-200 rounded-full relative">
              <ChevronLeft className="absolute -left-3 -top-2.5 h-6 w-6 text-slate-300" />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center text-center p-4 bg-primary/5 rounded-2xl border border-primary/20 w-full">
            <span className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
              <Target className="h-3 w-3" /> هدف بعدی شما
            </span>
            <h3 className="text-lg font-bold text-primary">ارتقای سطح و مدیریت</h3>
          </div>

        </div>
      </div>

      {/* 📚 دوره‌های پیشنهادی، متناسب با عنوان شغلی کارجو */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" /> دوره‌های پیشنهادی برای شما
        </h2>

        {isLoadingCourses ? (
          <div className="flex items-center justify-center bg-white rounded-3xl border border-slate-200 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : currentJob === "بدون سمت" ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300 py-16 text-center px-6">
            <Target className="h-10 w-10 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">اول عنوان شغلی خود را مشخص کنید</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
              برای دریافت دوره‌های پیشنهادی متناسب با مسیر شغلی‌تان، ابتدا «عنوان شغلی» را در رزومه خود تکمیل کنید.
            </p>
            <Link href="/job-seeker/resume" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              تکمیل رزومه
            </Link>
          </div>
        ) : matchedCourses.length > 0 ? (
          <div className="space-y-4">
            {matchedCourses.map((course) => {
              const status = myRequests[course.id];
              const statusInfo = status ? STATUS_LABELS[status] : null;
              const StatusIcon = statusInfo?.icon;

              return (
                <div key={course.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{course.title}</h3>
                      {course.description && (
                        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{course.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        {course.duration && (
                          <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-slate-600 border border-slate-100">
                            <Clock className="h-3.5 w-3.5" /> {course.duration}
                          </span>
                        )}
                        {course.external_url && (
                          <a
                            href={course.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg text-blue-600 border border-blue-100 hover:bg-blue-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> اطلاعات بیشتر
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {statusInfo ? (
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border ${statusInfo.className}`}>
                          {StatusIcon && <StatusIcon className="h-4 w-4" />}
                          {statusInfo.label}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestCourse(course.id)}
                          disabled={requestingId === course.id}
                          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {requestingId === course.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          درخواست شرکت در دوره
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative overflow-hidden flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300 py-16 text-center px-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-amber-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <div className="h-16 w-16 bg-white border-2 border-amber-100 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <Sparkles className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">به زودی...</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
              فعلاً دوره‌ای متناسب با سمت «{currentJob}» تعریف نشده. دوره‌های تخصصی این مسیر شغلی به‌زودی اضافه می‌شوند.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}