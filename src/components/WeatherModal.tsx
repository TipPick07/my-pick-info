"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface DailyWeather {
  date: string; // YYYY-MM-DD
  maxTemp: number;
  minTemp: number;
  icon: string;
}

interface WeatherModalProps {
  region: string;
  dailyData: DailyWeather[];
  onClose: () => void;
}

export default function WeatherModal({ region, dailyData, onClose }: WeatherModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 날짜 포맷 변환 (예: "04/07 (일)")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose} // 바깥 영역 클릭 시 닫힘
    >
      <div 
        className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative flex flex-col my-8 animation-scale-up"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="닫기"
        >
          <X size={24} />
        </button>

        <div className="p-8 pb-6 border-b border-slate-100 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-black rounded-full mb-3" style={{ background: "rgba(0,204,255,0.1)", color: "#00AACC" }}>
            7일 일기예보
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {region} 주간 날씨 예보
          </h3>
        </div>

        <div className="p-6 pt-2 pb-8 overflow-y-auto max-h-[60vh]">
          <ul className="space-y-3">
            {dailyData.map((day, idx) => (
              <li 
                key={day.date} 
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${idx === 0 ? "bg-slate-50 border border-slate-200/60" : "hover:bg-slate-50 border border-transparent"}`}
              >
                <span className="text-sm font-bold text-slate-600 w-16">
                  {idx === 0 ? "오늘" : formatDate(day.date)}
                </span>
                
                <span className="text-3xl" title="날씨 아이콘">
                  {day.icon}
                </span>
                
                <div className="flex items-center gap-3 text-sm font-black w-24 justify-end">
                  <span className="text-rose-500">{Math.round(day.maxTemp)}°</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-cyan-500">{Math.round(day.minTemp)}°</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
