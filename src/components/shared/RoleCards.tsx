import { Building2, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function RoleCards() {
  return (
    <div className="mx-auto mt-12 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
      
      {/* کارت اول - کارفرما */}
      {/* 👈 لینک هوشمند: نقش در URL پاس داده می‌شود */}
      <Link href="/login?role=employer" className="group flex items-center gap-4 rounded-2xl bg-primary p-6 text-right text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Building2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-lg font-bold">من کارفرما هستم</span>
          <span className="mt-1 block text-sm text-white/70">
            بهترین استعدادها را پیدا کنید
          </span>
        </span>
        <ArrowLeft
          className="h-5 w-5 shrink-0 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>

      {/* کارت دوم - کارجو */}
      {/* 👈 لینک هوشمند: نقش در URL پاس داده می‌شود */}
      <Link href="/login?role=job_seeker" className="group flex items-center gap-4 rounded-2xl border-2 border-secondary/40 bg-white p-6 text-right text-primary shadow-lg shadow-secondary/5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-xl hover:shadow-secondary/15">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Briefcase className="h-7 w-7" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-lg font-bold">من کارجو هستم</span>
          <span className="mt-1 block text-sm text-slate-500">
            فرصت‌های شغلی مناسب شما
          </span>
        </span>
        <ArrowLeft
          className="h-5 w-5 shrink-0 text-secondary opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>
      
    </div>
  );
}