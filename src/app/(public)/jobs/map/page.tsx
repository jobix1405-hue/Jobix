"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Map, List, Loader2, LocateFixed, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { JobsMap } from "@/components/shared/JobsMap";
import { Button } from "@/components/ui/Button";

export default function JobsMapPage() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // استیت‌های مکان‌یابی
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5); // پیش‌فرض ۵ کیلومتر
  const [isLocating, setIsLocating] = useState(false);

  // واکشی آگهی‌ها (عادی یا بر اساس شعاع)
  useEffect(() => {
    const fetchMapJobs = async () => {
      setIsLoading(true);
      try {
        if (userLocation) {
          // اگر کاربر مکانش رو مشخص کرده بود، تابع PostGIS رو صدا می‌زنیم
          const { data, error } = await supabase.rpc('get_jobs_within_radius', {
            search_lat: userLocation[0],
            search_lng: userLocation[1],
            radius_km: radiusKm
          });

          if (error) throw error;
          
          const formattedJobs = data?.map((job: any) => ({
            id: job.id,
            title: job.title,
            lat: job.lat,
            lng: job.lng,
            salary_range: job.salary_range,
            company_name: job.employer_name, // تغییر نام برای هماهنگی با UI
            distance_meters: job.distance_meters // فاصله دقیق تا کارجو
          })) || [];
          
          setJobs(formattedJobs);
        } else {
          // در غیر این صورت کل آگهی‌های لوکیشن‌دار ایران رو میاریم
          const { data, error } = await supabase
            .from('jobs')
            .select(`
              id, title, lat, lng, salary_range,
              profiles!inner(company_name)
            `)
            .eq('status', 'active')
            .not('lat', 'is', null)
            .not('lng', 'is', null);

          if (error) throw error;
          
          const formattedJobs = data?.map((job: any) => ({
            id: job.id,
            title: job.title,
            lat: job.lat,
            lng: job.lng,
            salary_range: job.salary_range,
            company_name: Array.isArray(job.profiles) ? job.profiles[0]?.company_name : job.profiles?.company_name
          })) || [];

          setJobs(formattedJobs);
        }
      } catch (err) {
        console.error("Error fetching map jobs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapJobs();
  }, [supabase, userLocation, radiusKm]);

  // هندلر دریافت لوکیشن با GPS گوشی/لپتاپ
  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("مرورگر شما از قابلیت مکان‌یابی پشتیبانی نمی‌کند.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert("امکان یافتن موقعیت شما وجود ندارد. لطفاً دسترسی Location را برای مرورگر روشن کنید.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <main className="h-screen pt-20 flex flex-col bg-slate-50 relative">
      {/* هدر صفحه نقشه */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-slate-200 bg-white z-20 shrink-0 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            نقشه زنده مشاغل
          </h1>
          <p className="text-xs text-slate-500 mt-1 hidden sm:block">
            {userLocation 
              ? `${jobs.length} شغل در شعاع ${radiusKm} کیلومتری شما یافت شد` 
              : "فرصت‌های شغلی اطراف خود را روی نقشه پیدا کنید"}
          </p>
        </div>
        
        <Link href="/jobs" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          <List className="h-4 w-4" />
          نمایش لیستی
        </Link>
      </div>

      {/* پنل ابزارهای مکان‌یابی (شناور روی نقشه) */}
      <div className="absolute top-28 right-4 sm:right-8 z-20 flex flex-col gap-4 w-64">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
          <Button 
            onClick={handleLocateMe}
            isLoading={isLocating}
            className="w-full shadow-md"
          >
            {!isLocating && <LocateFixed className="ml-2 h-5 w-5" />}
            مکان‌یابی من
          </Button>

          {userLocation && (
            <div className="mt-5 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-bold text-slate-700 flex justify-between">
                <span>شعاع جستجو:</span>
                <span className="text-primary">{radiusKm} کیلومتر</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full mt-2 accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium" dir="ltr">
                <span>1km</span>
                <span>50km</span>
              </div>
              
              <button 
                onClick={() => setUserLocation(null)}
                className="mt-3 w-full text-xs text-red-500 hover:text-red-700 font-medium py-1"
              >
                لغو رادار و نمایش کل ایران
              </button>
            </div>
          )}
        </div>
      </div>

      {/* بخش نمایش نقشه */}
      <div className="flex-1 relative z-0">
        {isLoading && !userLocation ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-sm text-slate-700 font-bold">در حال یافتن موقعیت آگهی‌ها...</span>
          </div>
        ) : null}
        
        <JobsMap jobs={jobs} userLocation={userLocation} radiusKm={radiusKm} />
      </div>
    </main>
  );
}