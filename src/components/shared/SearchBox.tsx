"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // هدایت کاربر (مهمان یا لاگین‌کرده) به صفحه لیست آگهی‌ها با کوئری جستجو
  // نکته مهم: این تابع هیچ چک لاگینی انجام نمی‌دهد و صفحه /jobs برای کاربر مهمان کاملاً باز است
  const handleSearch = () => {
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-primary/5 transition-shadow duration-300 focus-within:shadow-xl focus-within:shadow-primary/10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="جستجوی شغل، مهارت یا شرکت..."
          className="h-12 flex-1 bg-transparent px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <Button
          type="button"
          onClick={handleSearch}
          variant="secondary"
          className="h-12 rounded-xl px-6 font-semibold shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
        >
          <Search className="ml-2 h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">جستجو</span>
        </Button>
      </div>
    </div>
  );
}