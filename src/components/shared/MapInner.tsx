"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
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

// کامپوننت مدیریت ایونت‌های کلیک روی نقشه
function LocationMarker({ position, setPosition, onLocationSelect }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

export default function MapInner({ onLocationSelect, defaultLocation }: MapInnerProps) {
  // مختصات پیش‌فرض: تهران 
  const TEHRAN_CENTER: [number, number] = [35.6997, 51.3380];
  const [position, setPosition] = useState<[number, number] | null>(defaultLocation || null);

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-slate-200 z-0">
      <MapContainer 
        center={defaultLocation || TEHRAN_CENTER} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="h-full w-full !z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}