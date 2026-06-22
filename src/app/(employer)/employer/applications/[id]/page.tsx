"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Briefcase, GraduationCap, Code, 
  ChevronRight, Phone, Mail, FileText, Loader2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/Button";
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

export default function ApplicantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { user } = useStore();

  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id as string)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Error fetching applicant profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchProfile();
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

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <FileText className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">رزومه یافت نشد</h2>
        <Link href="/employer/applications" className="mt-4">
          <Button variant="outline">بازگشت به مدیریت رزومه‌ها</Button>
        </Link>
      </div>
    );
  }

  const fullName = profile.first_name ? `${profile.first_name} ${profile.last_name}` : 'کارجو (بدون نام)';

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500 pb-10">
      
      {/* دکمه بازگشت */}
      <Link 
        href="/employer/applications" 
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary mb-6"
      >
        <ChevronRight className="h-4 w-4" />
        بازگشت به برد کانبان
      </Link>

      <div className="space-y-6">
        
        {/* هدر رزومه */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-primary/10 to-transparent"></div>
          <div className="px-6 pb-8 pt-0 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="flex items-end gap-5 -mt-10">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white border-4 border-white shadow-md text-4xl font-bold text-slate-300 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10" />
                  )}
                </div>
                <div className="mb-2">
                  <h1 className="text-2xl font-extrabold text-slate-900">{fullName}</h1>
                  <p className="mt-1 text-lg font-medium text-slate-600">{profile.job_title || 'بدون عنوان شغلی'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleStartChat} 
                  isLoading={isStartingChat}
                  className="rounded-xl px-6"
                >
                  <MessageSquare className="h-4 w-4 ml-2" />
                  ارسال پیام
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                <Phone className="h-5 w-5 text-slate-400" />
                <span dir="ltr">{profile.phone_number || 'نامشخص'}</span>
              </div>
              {profile.email && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <span dir="ltr">{profile.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* درباره کارجو */}
        {profile.about_me && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> درباره من
            </h2>
            <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">
              {profile.about_me}
            </p>
          </div>
        )}

        {/* سوابق شغلی و تحصیلی */}
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
                  {profile.degree === 'diploma' ? 'دیپلم' : 
                   profile.degree === 'bachelor' ? 'کارشناسی' :
                   profile.degree === 'master' ? 'کارشناسی ارشد' :
                   profile.degree === 'phd' ? 'دکترا' : 'نامشخص'}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">مدرک تحصیلی ثبت نشده است.</p>
            )}
          </div>
        </div>

        {/* مهارت‌ها */}
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
    </div>
  );
}