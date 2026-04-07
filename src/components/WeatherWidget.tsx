"use client";

import { 
  LucideIcon, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Snowflake 
} from "lucide-react";
import WeatherModal from "./WeatherModal";
import { useState } from "react";

interface WeatherData {
  region: string;
  temp: string;
  status: string;
  weatherCode: number;
  lastUpdated: string;
  daily: any[];
}

interface WeatherWidgetProps {
  region: string;
  weatherData: WeatherData | null;
}

const getWeatherIcon = (code: number): LucideIcon => {
  if (code === 0) return Sun;
  if (code === 1 || code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return Cloud; 
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return Snowflake;
  if (code >= 80 && code <= 82) return CloudDrizzle;
  if (code >= 85 && code <= 86) return Snowflake;
  if (code >= 95 && code <= 99) return CloudLightning;
  return Cloud;
};

export default function WeatherWidget({ region, weatherData }: WeatherWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 로딩 중 (Skeleton UI)
  if (!weatherData) {
    return (
      <div
        className="bg-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-sm animate-pulse"
        style={{ border: "2px solid rgba(0,204,255,0.1)" }}
      >
        <div className="space-y-3 flex-1">
          <div className="h-3 w-16 bg-slate-100 rounded-full" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl" />
          <div className="h-3 w-20 bg-slate-100 rounded-full" />
        </div>
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-50" />
      </div>
    );
  }

  const { temp, status, weatherCode, lastUpdated, daily } = weatherData;
  const Icon = getWeatherIcon(weatherCode);

  return (
    <>
      <div
        className="bg-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-sm hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
        style={{ border: "2px solid rgba(0,204,255,0.2)" }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(0,204,255,0.5)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,204,255,0.15)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(0,204,255,0.2)";
          e.currentTarget.style.boxShadow = "";
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="space-y-1">
          <p className="font-bold text-sm" style={{ color: "#00CCFF" }}>{region}의 날씨</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-slate-900">{temp}</h3>
            <span className="text-[11px] text-slate-400 font-medium mb-1">{lastUpdated}</span>
          </div>
          <p className="text-slate-600 font-medium">{status}</p>
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform"
          style={{ background: "linear-gradient(135deg, rgba(0,204,255,0.08), rgba(51,255,153,0.08))", border: "1px solid rgba(0,204,255,0.15)" }}
        >
          <Icon size={32} strokeWidth={2.5} className={(weatherCode === 0) ? "text-amber-500" : "text-slate-500"} />
        </div>
      </div>

      {isModalOpen && (
        <WeatherModal 
          region={region} 
          dailyData={daily} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
