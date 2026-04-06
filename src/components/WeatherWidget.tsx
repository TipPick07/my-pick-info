"use client";

import { useState, useEffect } from "react";
import WeatherModal from "./WeatherModal";

// 지역별 위경도 좌표 세팅
const REGION_COORDS: Record<string, { lat: number, lon: number }> = {
  "서울": { lat: 37.5665, lon: 126.9780 },
  "인천": { lat: 37.4563, lon: 126.7052 },
  "경기": { lat: 37.2636, lon: 127.0286 }, // 수원 기준
};

const getWeatherInfo = (code: number) => {
  if (code === 0) return { status: "맑음", icon: "☀️" };
  if (code === 1 || code === 2 || code === 3) return { status: "구름", icon: "⛅" };
  if (code === 45 || code === 48) return { status: "안개", icon: "🌫️" };
  if (code >= 51 && code <= 67) return { status: "비", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { status: "눈", icon: "❄️" };
  if (code >= 80 && code <= 82) return { status: "소나기", icon: "🌧️" };
  if (code >= 85 && code <= 86) return { status: "눈보라", icon: "❄️" };
  if (code >= 95 && code <= 99) return { status: "번개", icon: "⛈️" };
  return { status: "알 수 없음", icon: "☁️" };
};

interface WeatherWidgetProps {
  region: string;
}

export default function WeatherWidget({ region }: WeatherWidgetProps) {
  const [currentTemp, setCurrentTemp] = useState<string>("로딩중...");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [currentIcon, setCurrentIcon] = useState<string>("⏳");
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const coords = REGION_COORDS[region];
    if (!coords) return;

    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`;
        const res = await fetch(url);
        const data = await res.json();

        // 1. 실시간 날씨 데이터 설정
        if (data.current) {
          setCurrentTemp(`${Math.round(data.current.temperature_2m)}°`);
          const info = getWeatherInfo(data.current.weather_code);
          setCurrentStatus(info.status);
          setCurrentIcon(info.icon);
        }

        // 2. 7일 예보 데이터 조립
        if (data.daily) {
          const formattedDaily = data.daily.time.map((dateStr: string, idx: number) => ({
            date: dateStr,
            maxTemp: data.daily.temperature_2m_max[idx],
            minTemp: data.daily.temperature_2m_min[idx],
            icon: getWeatherInfo(data.daily.weather_code[idx]).icon,
          }));
          setDailyData(formattedDaily);
        }
      } catch (error) {
        console.error("날씨 정보 불러오기 실패:", error);
        setCurrentTemp("종료");
        setCurrentStatus("오류");
      }
    };

    fetchWeather();
  }, [region]);

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
          <h3 className="text-3xl font-black text-slate-900">{currentTemp}</h3>
          <p className="text-slate-600 font-medium">{currentStatus}</p>
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform"
          style={{ background: "linear-gradient(135deg, rgba(0,204,255,0.08), rgba(51,255,153,0.08))", border: "1px solid rgba(0,204,255,0.15)" }}
        >
          {currentIcon}
        </div>
      </div>

      {isModalOpen && (
        <WeatherModal 
          region={region} 
          dailyData={dailyData} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
