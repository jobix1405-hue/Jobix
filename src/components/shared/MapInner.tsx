"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { LocateFixed, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// حل مشکل لود نشدن آیکون پین دیفالت Leaflet در Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapInnerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLocation?: [number, number];
}

// ۱. کامپوننت مدیریت ایونت‌های کلیک روی نقشه برای پین کردن
function LocationMarker({ position, setPosition, onLocationSelect }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

// ۲. کامپوننت کمکی برای پرواز (FlyTo) نقشه به سمت کاربر پس از یافتن لوکیشن
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapInner({ onLocationSelect, defaultLocation }: MapInnerProps) {
  // مختصات پیش‌فرض: تهران 
  const TEHRAN_CENTER: [number, number] = [35.6997, 51.3380];
  
  const [position, setPosition] = useState<[number, number] | null>(defaultLocation || null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(defaultLocation || TEHRAN_CENTER);
  const [isLocating, setIsLocating] = useState(false);

  // ۳. هندلر دریافت موقعیت از مرورگر کاربر
  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault(); // 🔥 جلوگیری از سابمیت شدن فرم ثبت آگهی
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      alert("مرورگر شما از قابلیت مکان‌یابی پشتیبانی نمی‌کند.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        setMapCenter(newPos);
        onLocationSelect(newPos[0], newPos[1]); // ثبت خودکار لوکیشن در فرم
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        alert("امکان یافتن موقعیت شما وجود ندارد. لطفاً دسترسی Location (مکان‌یابی) را برای این سایت روشن کنید.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-slate-200 z-0">
      
      {/* 👈 دکمه شناور مکان‌یابی */}
      <button
        type="button" 
        onClick={handleLocateMe}
        className="absolute bottom-6 left-4 z-[1000] flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-lg border border-slate-200 hover:bg-slate-50 hover:text-primary transition-all"
        title="یافتن مکان فعلی من"
      >
        {isLocating ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <LocateFixed className="h-5 w-5 text-primary" />
        )}
        مکان‌یابی من
      </button>

      <MapContainer 
        center={mapCenter || TEHRAN_CENTER} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="h-full w-full !z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}