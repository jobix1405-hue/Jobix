"use client";

import { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, ShieldAlert, Key, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next'); 
  const isBannedError = searchParams.get('error') === 'banned';
  
  const supabase = createClient();
  const { setUser } = useStore();

  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // در صورت مسدود بودن، کاربر را خارج می‌کنیم
  useEffect(() => {
    if (isBannedError) {
      supabase.auth.signOut().then(() => setUser(null));
    }
  }, [isBannedError, supabase, setUser]);

  // تابع مشترک برای پردازش بعد از لاگین موفق (جلوگیری از تکرار کد)
  const processLoginSuccess = async (userId: string, userPhone: string) => {
    // ۱. واکشی پروفایل که به لطف تریگر جدید در دیتابیس قطعا ساخته شده است
    let { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', userId)
      .maybeSingle();

    // ۲. برنامه‌نویسی تدافعی: اگر به ندرت تریگر دیتابیس با تاخیر مواجه شد، خودمان می‌سازیمش
    if (!profile) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        phone_number: userPhone,
        is_banned: false
      });
      
      if (insertError) {
        console.error("Fallback Insert Error:", insertError.message);
      }
      
      profile = { role: null, is_banned: false };
    }

    // ۳. بررسی وضعیت مسدودی کاربر
    if (profile?.is_banned) {
      await supabase.auth.signOut();
      setUser(null);
      setStep(1);
      setOtp("");
      setPassword("");
      router.replace('/login?error=banned');
      return;
    }

    // ۴. بروزرسانی استیت سراسری سیستم
    setUser({
      id: userId,
      phone: userPhone,
      role: profile?.role || null
    });

    router.refresh();

    // ۵. مسیردهی هوشمند بر اساس نقش (Role)
    if (profile?.role) {
      let redirectUrl = '/job-seeker';
      if (profile.role === 'admin') redirectUrl = '/admin';
      else if (profile.role === 'employer') redirectUrl = '/employer';

      router.push(nextUrl || redirectUrl);
    } else {
      // اگر کاربر نقشی نداشت (ثبت‌نام جدید)
      let intendedRole: "employer" | "job_seeker" | null = null;
      
      if (nextUrl?.includes('employer')) intendedRole = 'employer';
      else if (nextUrl?.includes('job-seeker')) intendedRole = 'job_seeker';

      if (intendedRole) {
        // استفاده از upsert برای محکم‌کاری
        await supabase.from('profiles').upsert({ 
          id: userId,
          phone_number: userPhone,
          role: intendedRole
        });
        
        setUser({
          id: userId,
          phone: userPhone,
          role: intendedRole
        });
        router.push(nextUrl || (intendedRole === 'employer' ? '/employer' : '/job-seeker'));
      } else {
        router.push('/onboarding');
      }
    }
  };

  // ۱. لاگین با رمز عبور ثابت
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phoneNumber.startsWith("09") || phoneNumber.length !== 11) {
      return setErrorMessage("شماره موبایل باید ۱۱ رقمی باشد و با 09 شروع شود.");
    }
    if (!password) {
      return setErrorMessage("لطفاً رمز عبور خود را وارد کنید.");
    }
    
    setIsLoading(true);
    const formattedPhone = "+98" + phoneNumber.substring(1);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password: password,
      });

      if (error) {
        setErrorMessage("شماره موبایل یا رمز عبور اشتباه است.");
      } else if (data.user) {
        await processLoginSuccess(data.user.id, data.user.phone || formattedPhone);
      }
    } catch (err) {
      setErrorMessage("خطای ارتباط با سرور.");
    } finally {
      setIsLoading(false);
    }
  };

  // ۲. درخواست کد تایید OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phoneNumber.startsWith("09") || phoneNumber.length !== 11) {
      setErrorMessage("شماره موبایل باید ۱۱ رقمی باشد و با 09 شروع شود (مثلاً 09123456789)");
      return;
    }
    
    setIsLoading(true);
    const formattedPhone = "+98" + phoneNumber.substring(1);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        phone: formattedPhone 
      });

      if (error) {
        console.error("OTP Send Error:", error.message);
        setErrorMessage("خطا در ارسال پیامک. لطفاً شماره را بررسی کنید.");
      } else {
        setStep(2); 
      }
    } catch (err) {
      setErrorMessage("خطای ارتباط با سرور.");
    } finally {
      setIsLoading(false);
    }
  };

  // ۳. تایید کد OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otp.length < 4) {
      setErrorMessage("لطفاً کد تایید را به درستی وارد کنید.");
      return;
    }
    
    setIsLoading(true);
    const formattedPhone = "+98" + phoneNumber.substring(1);

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
        await processLoginSuccess(data.user.id, data.user.phone || formattedPhone);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("خطای ارتباط با سرور هنگام تایید کد.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 sm:max-w-sm lg:max-w-md border border-slate-100 relative">
        
        {isLoading && (
          <div className="absolute top-0 left-0 h-1 w-full bg-slate-100 overflow-hidden z-10">
            <div className="h-full bg-primary w-1/2 animate-[progress_1s_ease-in-out_infinite]"></div>
          </div>
        )}

        <div className="p-8 sm:p-10 relative">
          
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

          {isBannedError && (
            <div className="mb-6 flex flex-col items-center justify-center gap-2 rounded-2xl bg-red-50 p-4 text-center border border-red-100 animate-in fade-in zoom-in duration-500">
              <ShieldAlert className="h-8 w-8 text-red-500 mb-1" />
              <p className="text-sm font-bold text-red-700">حساب کاربری شما مسدود شده است!</p>
              <p className="text-xs text-red-600">به دلیل نقض قوانین پلتفرم، امکان ورود به حساب را ندارید.</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* تب انتخاب روش ورود */}
          {step === 1 && (
            <div className="mb-6 flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => { setLoginMethod("otp"); setErrorMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === "otp" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                <MessageSquare className="h-4 w-4" /> با پیامک
              </button>
              <button
                onClick={() => { setLoginMethod("password"); setErrorMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === "password" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                <Key className="h-4 w-4" /> با رمز عبور
              </button>
            </div>
          )}

          {/* فرم ورود با پیامک */}
          {step === 1 && loginMethod === "otp" && (
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
                  placeholder="09123456789"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setPhoneNumber(val);
                  }}
                  className="text-center text-2xl tracking-[0.2em] h-14 font-semibold text-slate-700"
                  maxLength={11}
                  disabled={isLoading}
                  autoFocus
                />

                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="block text-[10px] text-slate-400 text-center mb-2 font-medium">ورود سریع با شماره‌های تستی:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPhoneNumber("09010601610")}
                        className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-2 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        تست ادمین
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoneNumber("09222222222")}
                        className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        تست کارفرما
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoneNumber("09333333333")}
                        className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-2 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        تست کارجو
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all"
                isLoading={isLoading}
                disabled={phoneNumber.length !== 11 || isLoading}
              >
                تایید و دریافت کد
              </Button>
            </form>
          )}

          {/* فرم ورود با رمز عبور */}
          {step === 1 && loginMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">ورود با رمز عبور</h2>
                <p className="mt-2 text-sm text-slate-500">
                  موبایل و رمز عبور خود را وارد کنید
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="text-center text-xl tracking-[0.2em] h-12 font-bold text-slate-700"
                  maxLength={11}
                  disabled={isLoading}
                  autoFocus
                />
                
                <Input
                  type="password"
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center text-xl tracking-[0.3em] h-12 font-bold text-slate-700"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all"
                isLoading={isLoading}
                disabled={phoneNumber.length !== 11 || !password || isLoading}
              >
                ورود به حساب کاربری
              </Button>
            </form>
          )}

          {/* فرم تایید کد OTP (مرحله ۲) */}
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
                  className="text-center text-3xl tracking-[0.3em] h-14 font-bold text-slate-700"
                  maxLength={6} 
                  disabled={isLoading}
                  autoFocus
                />
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setOtp("123456")}
                      className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      وارد کردن خودکار کد تستی (123456)
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all"
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
          با ورود به جابیکس، <Link href="/terms" className="font-semibold text-slate-700 hover:text-primary transition-colors">شرایط و قوانین</Link> آن را می‌پذیرم.
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