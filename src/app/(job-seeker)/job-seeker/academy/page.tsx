"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, Map, Target, Rocket, 
  Loader2, CheckCircle2, AlertCircle, PlayCircle, Sparkles, ChevronLeft, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

interface Course {
  id: string;
  title: string;
  prerequisite_job: string;
  target_job: string;
  description: string;
  duration: string;
  start_date: string;
}

export default function AcademyPage() {
  const supabase = createClient();
  const { user } = useStore();

  const [currentJob, setCurrentJob] = useState<string>("در حال بررسی...");
  const [courses, setCourses] = useState<Course[]>([]);
  const [requestedCourses, setRequestedCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademyData = async () => {
      if (!user?.id) return;
      try {
        // ۱. دریافت شغل فعلی کاربر از پروفایل
        const { data: profile } = await supabase
          .from('profiles')
          .select('job_title')
          .eq('id', user.id)
          .single();
          
        const jobTitle = profile?.job_title || "بدون سمت";
        setCurrentJob(jobTitle);

        // ۲. دریافت لیست دوره‌ها
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (coursesError) throw coursesError;
        setCourses(coursesData || []);

        // ۳. دریافت لیست دوره‌هایی که این کاربر قبلاً درخواست داده
        const { data: requestsData } = await supabase
          .from('course_requests')
          .select('course_id')
          .eq('job_seeker_id', user.id);

        if (requestsData) {
          setRequestedCourses(requestsData.map(req => req.course_id));
        }

      } catch (err) {
        console.error("خطا در دریافت اطلاعات آکادمی:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcademyData();
  }, [user?.id, supabase]);

  const handleRequestCourse = async (courseId: string) => {
    if (!user?.id) return;
    setRequestLoading(courseId);

    try {
      const { error } = await supabase
        .from('course_requests')
        .insert({
          course_id: courseId,
          job_seeker_id: user.id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') throw new Error("شما قبلاً برای این دوره درخواست داده‌اید.");
        throw error;
      }

      setRequestedCourses(prev => [...prev, courseId]);
      alert("درخواست شما با موفقیت ثبت شد و به زودی برای هماهنگی با شما تماس خواهیم گرفت.");
    } catch (err: any) {
      alert(err.message || "خطا در ثبت درخواست.");
    } finally {
      setRequestLoading(null);
    }
  };

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

      {/* 📚 لیست دوره‌های پیشنهادی */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" /> دوره‌های پیشنهادی برای شما
        </h2>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => {
              const isRequested = requestedCourses.includes(course.id);

              return (
                <div key={course.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-primary/30 transition-all flex flex-col h-full">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 mb-3">
                      مسیر: {course.prerequisite_job || 'عمومی'} ➔ {course.target_job}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{course.title}</h3>
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed text-justify line-clamp-3">
                      {course.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1.5"><PlayCircle className="h-4 w-4 text-slate-400" /> {course.duration}</span>
                      <span className="flex items-center gap-1.5"><Target className="h-4 w-4 text-slate-400" /> شروع: {course.start_date}</span>
                    </div>

                    <Button 
                      onClick={() => handleRequestCourse(course.id)}
                      disabled={isRequested}
                      isLoading={requestLoading === course.id}
                      variant={isRequested ? "outline" : "primary"}
                      className={`h-10 text-xs px-4 rounded-xl ${isRequested ? 'border-green-200 text-green-700 bg-green-50' : 'shadow-md'}`}
                    >
                      {isRequested ? <><CheckCircle2 className="h-4 w-4 ml-1.5" /> ثبت‌نام شدید</> : "درخواست ثبت‌نام"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300 py-16 text-center">
            <GraduationCap className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">دوره‌ای یافت نشد</h3>
            <p className="mt-2 text-sm text-slate-500">در حال حاضر دوره‌ای برای نمایش وجود ندارد.</p>
          </div>
        )}
      </div>

    </div>
  );
}