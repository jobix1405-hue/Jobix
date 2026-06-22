"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// کامپوننت اصلی فرم
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next'); // خوندن پارامتر مقصد
  const supabase = createClient();
  const { setUser } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatPhoneNumber = (phone: string) => {
    let formatted = phone.trim();
    if (formatted.startsWith("0")) {
      formatted = "+98" + formatted.substring(1);
    } else if (!formatted.startsWith("+")) {
      formatted = "+98" + formatted;
    }
    return formatted;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (phoneNumber.length < 10 || phoneNumber.length > 11) {
      setErrorMessage("لطفاً یک شماره موبایل معتبر وارد کنید.");
      return;
    }
    
    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        phone: formattedPhone 
      });

      if (error) {
        console.error("OTP Send Error:", error.message);
        setErrorMessage("خطا در ارسال پیامک. لطفاً دقایقی دیگر تلاش کنید یا شماره را بررسی کنید.");
      } else {
        setStep(2); 
      }
    } catch (err) {
      setErrorMessage("خطای ارتباط با سرور.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otp.length < 4) {
      setErrorMessage("لطفاً کد تایید را به درستی وارد کنید.");
      return;
    }
    
    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error("OTP Verify Error:", error.message);
        setErrorMessage("کد وارد شده اشتباه است یا منقضی شده.");
      } else if (data.user) {
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        router.refresh();

        if (profile?.role) {
          // 🔥 تغییر مهم: مسیردهی داینامیک بر اساس نقش ادمین، کارفرما یا کارجو
          let redirectUrl = '/job-seeker';
          if (profile.role === 'admin') redirectUrl = '/admin';
          else if (profile.role === 'employer') redirectUrl = '/employer';

          router.push(nextUrl || redirectUrl);
        } else {
          // 🔥 تخصیص هوشمند نقش بر اساس نیت کاربر (Intent)
          let intendedRole: "employer" | "job_seeker" | null = null;
          
          if (nextUrl?.includes('employer')) intendedRole = 'employer';
          else if (nextUrl?.includes('job-seeker')) intendedRole = 'job_seeker';

          if (intendedRole) {
            // ۱. نقش رو در دیتابیس آپدیت کن
            await supabase.from('profiles').update({ role: intendedRole }).eq('id', data.user.id);
            
            // ۲. آپدیت استیت گلوبال
            setUser({
              id: data.user.id,
              phone: data.user.phone || '',
              role: intendedRole
            });
            
            // ۳. هدایت مستقیم بدون صفحه اضافی
            router.push(nextUrl || (intendedRole === 'employer' ? '/employer' : '/job-seeker'));
          } else {
            // فقط اگه کاربر مستقیم زده بود روی دکمه لاگین سایت، بره Onboarding
            router.push('/onboarding');
          }
        }
      }
    } catch (err) {
      setErrorMessage("خطای ارتباط با سرور هنگام تایید کد.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 sm:max-w-sm lg:max-w-md border border-slate-100 relative">
        
        {isLoading && (
          <div className="absolute top-0 left-0 h-1 w-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-primary w-1/2 animate-[progress_1s_ease-in-out_infinite]"></div>
          </div>
        )}

        <div className="p-8 sm:p-10">
          
          <div className="mb-8 flex justify-center">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/logo-minimal.webp"
                alt="جابیکس"
                width={120}
                height={40}
                className="object-contain w-auto h-auto"
                priority
              />
            </Link>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">ورود / ثبت‌نام</h2>
                <p className="mt-2 text-sm text-slate-500">
                  برای ادامه، شماره موبایل خود را وارد کنید
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="tel"
                  dir="ltr"
                  placeholder="0912 345 6789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="text-center text-xl tracking-widest h-14"
                  maxLength={11}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
                isLoading={isLoading}
                disabled={phoneNumber.length < 10 || isLoading}
              >
                تایید و دریافت کد
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-500">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">کد تایید را وارد کنید</h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  کد پیامک شده به شماره <span className="font-bold text-slate-800" dir="ltr">{phoneNumber}</span> را وارد کنید.
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  dir="ltr"
                  placeholder="-  -  -  -  -  -"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="text-center text-3xl tracking-[0.3em] h-14 font-bold"
                  maxLength={6} 
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
                  isLoading={isLoading}
                  disabled={otp.length < 4 || isLoading}
                >
                  ورود به جابیکس
                </Button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" />
                  ویرایش شماره موبایل
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="bg-slate-50 py-4 text-center text-xs text-slate-500 border-t border-slate-100">
          با ورود به جابیکس، <Link href="#" className="font-semibold text-slate-700 hover:text-primary transition-colors">شرایط و قوانین</Link> آن را می‌پذیرم.
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}

// چون از useSearchParams استفاده می‌کنیم، کل فرم باید در Suspense رپ بشه
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}