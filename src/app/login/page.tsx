"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  // مدیریت Stateهای فرم (مرحله ۱: شماره موبایل، مرحله ۲: کد تایید)
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // شبیه‌سازی ارسال شماره موبایل (بعداً به Supabase وصل می‌شود)
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    
    setIsLoading(true);
    // یک وقفه ۱.۵ ثانیه‌ای برای نمایش انیمیشن لودینگ دکمه
    setTimeout(() => {
      setIsLoading(false);
      setStep(2); // رفتن به مرحله بعد
    }, 1500);
  };

  // شبیه‌سازی تایید کد و ورود
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("لاگین موفق! (اینجا بعداً با توجه به نقش کاربر به پنل مربوطه هدایت می‌شود)");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      {/* کادر اصلی فرم */}
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 sm:max-w-sm lg:max-w-md border border-slate-100">
        <div className="p-8 sm:p-10">
          
          {/* بخش لوگو */}
          <div className="mb-8 flex justify-center">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/logo-minimal.webp"
                alt="جابیکس"
                width={120}
                height={40}
                className="object-contain w-auto h-auto" // این دو تا کلاس رو اضافه کن
              />
            </Link>
          </div>

          {/* =========================================
              مرحله اول: دریافت شماره موبایل
             ========================================= */}
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
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-center text-xl tracking-widest h-14"
                  maxLength={11}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg rounded-xl"
                isLoading={isLoading}
                disabled={phoneNumber.length < 10}
              >
                تایید و ادامه
              </Button>
            </form>
          )}

          {/* =========================================
              مرحله دوم: دریافت کد تایید (OTP)
             ========================================= */}
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
                  placeholder="-  -  -  -"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center text-3xl tracking-[0.5em] h-14"
                  maxLength={5}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg rounded-xl"
                  isLoading={isLoading}
                  disabled={otp.length < 4}
                >
                  ورود به جابیکس
                </Button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                  ویرایش شماره موبایل
                </button>
              </div>
            </form>
          )}

        </div>

        {/* فوتر فرم */}
        <div className="bg-slate-50 py-4 text-center text-xs text-slate-500 border-t border-slate-100">
          با ورود به جابیکس، <Link href="#" className="font-semibold text-slate-700 hover:text-primary transition-colors">شرایط و قوانین</Link> آن را می‌پذیرم.
        </div>
      </div>
    </div>
  );
}