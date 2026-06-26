"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// آیکون پین دیفالت Leaflet برای مشاغل
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface JobMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  company_name: string;
  salary_range: string;
  distance_meters?: number; // فاصله محاسبه شده توسط دیتابیس
}

interface JobsMapInnerProps {
  jobs: JobMarker[];
  userLocation: [number, number] | null;
  radiusKm: number;
}

// کامپوننت کمکی برای پرواز (FlyTo) نقشه به سمت کاربر
function MapCenterUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function JobsMapInner({ jobs, userLocation, radiusKm }: JobsMapInnerProps) {
  // مختصات مرکز ایران (تهران)
  const TEHRAN_CENTER: [number, number] = [35.6997, 51.3380];

  // تابع فرمت کردن فاصله (تبدیل متر به کیلومتر اگه زیاد بود)
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} متر`;
    return `${(meters / 1000).toFixed(1)} کیلومتر`;
  };

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={userLocation || TEHRAN_CENTER} 
        zoom={userLocation ? 12 : 11} 
        className="h-full w-full !z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* آپدیت کننده مرکز نقشه موقع گرفتن لوکیشن */}
        <MapCenterUpdater center={userLocation} />

        {/* نمایش موقعیت کاربر و هاله شعاع جستجو */}
        {userLocation && (
          <>
            {/* دایره رادار */}
            <Circle 
              center={userLocation} 
              radius={radiusKm * 1000} 
              pathOptions={{ fillColor: '#1e3a8a', fillOpacity: 0.1, color: '#1e3a8a', weight: 1, dashArray: '5, 5' }} 
            />
            {/* نقطه آبی نشان‌دهنده خود کاربر */}
            <CircleMarker 
              center={userLocation} 
              radius={8}
              pathOptions={{ fillColor: '#3b82f6', fillOpacity: 1, color: '#ffffff', weight: 3 }}
            >
              {/* 🔥 ارور تایپ‌اسکریپت اینجا بود که حل شد (dir به تگ div داخلی منتقل شد) */}
              <Popup className="font-vazirmatn text-right">
                <div dir="rtl">
                  <p className="font-bold text-blue-600 m-0 text-center">شما اینجا هستید</p>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* نمایش آگهی‌های یافت شده */}
        {jobs.map((job) => (
          <Marker key={job.id} position={[job.lat, job.lng]} icon={customIcon}>
            <Popup className="font-vazirmatn text-right">
              <div className="p-1 min-w-[170px]" dir="rtl">
                <h3 className="font-bold text-slate-900 text-[14px] mb-1 leading-tight">{job.title}</h3>
                <p className="text-[12px] font-medium text-slate-600 mb-2">{job.company_name}</p>
                
                {job.distance_meters !== undefined && (
                  <p className="text-[11px] font-bold text-secondary flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-md mb-2">
                    فاصله تا شما: {formatDistance(job.distance_meters)}
                  </p>
                )}

                <div className="mt-3">
                  <Link 
                    href={`/jobs/${job.id}`} 
                    className="block w-full text-center bg-primary text-white text-xs py-2 rounded-lg hover:bg-primary/90 transition-colors font-bold shadow-sm"
                  >
                    مشاهده آگهی
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}