import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  User, Briefcase, GraduationCap, Code, 
  Phone, Mail, MapPin, Download, ChevronRight, Loader2, AlertCircle, Award, Clock, Video
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";

interface ResumeData {
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
  address: string;
  avatar_url: string;
  video_resume_url: string;
}

export default function PublicResumePage() {
  const params = useParams();
  const supabase = createClient();
  
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [completedCourses, setCompletedCourses] = useState<{ id: string; title: string; duration: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id as string)
          .single();

        if (error) throw error;
        setResume(data);

        // واکشی دوره‌های آکادمی که این کارجو با موفقیت تکمیل کرده (به صورت خودکار در رزومه نمایش داده می‌شود)
        const { data: coursesData } = await supabase
          .from('course_requests')
          .select('id, course:courses(id, title, duration)')
          .eq('job_seeker_id', params.id as string)
          .eq('status', 'completed');

        const formattedCourses = (coursesData || []).map((req: any) => {
          const course = Array.isArray(req.course) ? req.course[0] : req.course;
          return { id: course?.id || req.id, title: course?.title || 'دوره نامشخص', duration: course?.duration || '' };
        });
        setCompletedCourses(formattedCourses);
      } catch (err) {
        console.error("Error fetching resume:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchResume();
  }, [params.id, supabase]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!resume || !resume.first_name) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc]">
        <AlertCircle className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">رزومه‌ای با این شناسه یافت نشد</h2>
        <p className="mt-2 text-sm text-slate-500">ممکن است کاربر اطلاعات خود را تکمیل نکرده باشد.</p>
        <Link href="/" className="mt-6">
          <Button variant="outline">بازگشت به صفحه اصلی</Button>
        </Link>
      </div>
    );
  }

  const fullName = `${resume.first_name} ${resume.last_name}`;

  return (
    <main className="min-h-screen bg-[#f8fafc] py-12 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        {/* نوار ابزار (در هنگام پرینت مخفی می‌شود) */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
            جابیکس
          </Link>
          <Button onClick={handlePrint} className="rounded-xl shadow-md">
            <Download className="mr-2 h-4 w-4" />
            دانلود PDF رزومه
          </Button>
        </div>

        {/* برگه اصلی رزومه (A4 Size) */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          
          {/* هدر رزومه */}
          <div className="bg-primary text-white p-8 sm:p-12 print:bg-primary print:text-white print:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-white border-4 border-white/20 text-5xl font-bold text-primary overflow-hidden shadow-xl">
                {resume.avatar_url ? (
                  <img src={resume.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  resume.first_name.charAt(0)
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-right">
                <h1 className="text-3xl sm:text-4xl font-extrabold">{fullName}</h1>
                <h2 className="text-lg sm:text-xl font-medium mt-2 text-primary-100">{resume.job_title || 'عنوانی ثبت نشده'}</h2>
                
                <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-3 text-sm text-primary-50">
                  <span className="flex items-center gap-1.5" dir="ltr">
                    {resume.phone_number} <Phone className="h-4 w-4" />
                  </span>
                  {resume.email && (
                    <span className="flex items-center gap-1.5" dir="ltr">
                      {resume.email} <Mail className="h-4 w-4" />
                    </span>
                  )}
                  {resume.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {resume.address}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* محتوای رزومه */}
          <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-12 print:p-8 print:gap-8">
            
            {/* ستون اصلی (راست) */}
            <div className="md:col-span-2 space-y-10">
              
              {/* خلاصه */}
              {resume.about_me && (
                <section>
                  <h3 className="text-xl font-bold text-slate-900 border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> خلاصه حرفه‌ای
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">
                    {resume.about_me}
                  </p>
                </section>
              )}

              {/* سوابق شغلی */}
              {resume.last_company && (
                <section>
                  <h3 className="text-xl font-bold text-slate-900 border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-secondary" /> سوابق شغلی
                  </h3>
                  <div className="relative pl-4 border-r-2 border-slate-100 pr-6 mr-2">
                    <div className="absolute -right-[9px] top-1.5 h-4 w-4 rounded-full bg-secondary ring-4 ring-white"></div>
                    <h4 className="text-lg font-bold text-slate-800">{resume.last_position || 'سمت نامشخص'}</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1">{resume.last_company}</p>
                  </div>
                </section>
              )}

              {/* سوابق تحصیلی */}
              {resume.university && (
                <section>
                  <h3 className="text-xl font-bold text-slate-900 border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-500" /> سوابق تحصیلی
                  </h3>
                  <div className="relative pl-4 border-r-2 border-slate-100 pr-6 mr-2">
                    <div className="absolute -right-[9px] top-1.5 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-white"></div>
                    <h4 className="text-lg font-bold text-slate-800">دانشگاه {resume.university}</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {resume.degree === 'diploma' ? 'دیپلم' : 
                       resume.degree === 'bachelor' ? 'کارشناسی' :
                       resume.degree === 'master' ? 'کارشناسی ارشد' :
                       resume.degree === 'phd' ? 'دکترا' : 'نامشخص'}
                    </p>
                  </div>
                </section>
              )}

              {/* دوره‌های آموزشی (خودکار از آکادمی جابیکس) */}
              {completedCourses.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-slate-900 border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" /> دوره‌های آموزشی
                  </h3>
                  <div className="space-y-3">
                    {completedCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl print:border print:border-slate-200 print:bg-white">
                        <span className="font-bold text-slate-800 text-sm">{course.title}</span>
                        {course.duration && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Clock className="h-3.5 w-3.5" /> {course.duration}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ستون کناری (چپ) */}
            <div className="space-y-10">
              
              {/* مهارت‌ها */}
              {resume.skills && (
                <section>
                  <h3 className="text-xl font-bold text-slate-900 border-b-2 border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-green-500" /> مهارت‌ها
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.split(',').map((skill, index) => (
                      <span key={index} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 print:border print:border-slate-300 print:bg-white">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* کیوآرکد و لینک (نمایشی برای پرینت) */}
              <section className="pt-6 border-t border-slate-100 print:block">
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  این رزومه از طریق پلتفرم هوشمند <strong>جابیکس</strong> ایجاد شده است.
                </p>
              </section>

            </div>

          </div>

          {/* 👈 ویدیوی معرفی کارجو - در پایین صفحه رزومه، بدون نیاز به خروج از صفحه */}
          {resume.video_resume_url && (
            <div className="border-t border-slate-100 p-8 sm:p-12 print:hidden">
              <h3 className="text-xl font-bold text-slate-900 pb-3 mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" /> ویدیوی معرفی
              </h3>
              <video
                src={resume.video_resume_url}
                controls
                className="w-full max-w-2xl mx-auto rounded-2xl border border-slate-200 shadow-sm bg-black block"
              >
                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
              </video>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}