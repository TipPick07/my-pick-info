"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeatherWidget from "@/components/WeatherWidget";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Snowflake, 
  Wind,
  LucideIcon
} from "lucide-react";

interface WeatherData {
  region: string;
  temp: string;
  status: string;
  weatherCode: number;
  lastUpdated: string;
  daily: any[];
}

interface Festival {
  id: string;
  region: string;
  title: string;
  date: string;
  tag: string;
  image: string;
}

interface Data {
  weather: any[];
  festivals: Festival[];
}

const REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  "서울": { lat: 37.5665, lon: 126.9780 },
  "인천": { lat: 37.4563, lon: 126.7052 },
  "경기": { lat: 37.2636, lon: 127.0286 },
};

// getWeatherInfo 함수 제거 (statusMap으로 대체됨)

const FALLBACK_WEATHER: Record<string, WeatherData> = {
  "서울": { region: "서울", temp: "18°", status: "맑음", weatherCode: 0, lastUpdated: "업데이트 대기", daily: [] },
  "인천": { region: "인천", temp: "16°", status: "구름", weatherCode: 2, lastUpdated: "업데이트 대기", daily: [] },
  "경기": { region: "경기", temp: "17°", status: "맑음", weatherCode: 0, lastUpdated: "업데이트 대기", daily: [] },
};

export default function FestivalsClient({ data, weatherApiKey }: { data: any, weatherApiKey: string }) {
  const [filter, setFilter] = useState("전체");
  const [weatherResults, setWeatherResults] = useState<Record<string, WeatherData | null>>({
    "서울": null,
    "인천": null,
    "경기": null,
  });

  useEffect(() => {
    // 1. localStorage에서 기존 데이터 로드 시도
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tip-pick-weather') : null;
    let initialResults: Record<string, WeatherData> | null = null;
    if (saved) {
      try {
        initialResults = JSON.parse(saved);
        setWeatherResults(initialResults!);
      } catch (e) {
        console.error("Failed to parse saved weather", e);
      }
    }

    async function fetchAllWeather() {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} 기준`;

      const regions = ["서울", "인천", "경기"];
      const lats = regions.map(r => REGION_COORDS[r].lat).join(",");
      const lons = regions.map(r => REGION_COORDS[r].lon).join(",");
      
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
        const dataArr = await res.json();
        
        // Open-Meteo는 여러 좌표 요청 시 배열로 반환함
        const results: Record<string, WeatherData> = {};
        
        const statusMap: Record<number, string> = {
          0: "맑음", 1: "구름조금", 2: "흐림", 3: "흐림",
          45: "안개", 48: "안개",
          51: "약한 비", 53: "비", 55: "강한 비",
          61: "비", 63: "비", 65: "강한 비",
          71: "눈", 73: "눈", 75: "강한 눈",
          80: "소나기", 81: "소나기", 82: "강한 소나기",
          95: "천둥번개",
        };

        regions.forEach((name, idx) => {
          const d = Array.isArray(dataArr) ? dataArr[idx] : dataArr;
          const formattedDaily = d.daily.time.map((dateStr: string, dIdx: number) => ({
            date: dateStr,
            maxTemp: d.daily.temperature_2m_max[dIdx],
            minTemp: d.daily.temperature_2m_min[dIdx],
            weatherCode: d.daily.weather_code[dIdx],
          }));

          results[name] = {
            region: name,
            temp: `${Math.round(d.current.temperature_2m)}°`,
            status: statusMap[d.current.weather_code] || "구름",
            weatherCode: d.current.weather_code,
            lastUpdated: timeStr,
            daily: formattedDaily,
          };
          console.log(`Weather fetch success for ${name}:`, d.current.temperature_2m);
        });

        setWeatherResults(results);
        localStorage.setItem('tip-pick-weather', JSON.stringify(results));
      } catch (err) {
        console.error("Batch weather fetch error:", err);
        // 전체 실패 시 기존 데이터 유지 또는 FALLBACK 사용
        const newResults: Record<string, WeatherData> = {};
        regions.forEach(name => {
          const existing = initialResults ? initialResults[name] : null;
          if (existing) console.log(`Using cached data for ${name} from localStorage (Batch failed)`);
          newResults[name] = existing || FALLBACK_WEATHER[name];
        });
        setWeatherResults(newResults);
      }
    }

    fetchAllWeather();
  }, []);

  const filteredFestivals = filter === "전체"
    ? data.festivals
    : data.festivals.filter((f: Festival) => f.region === filter);

  const regions = ["전체", "서울", "인천", "경기"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Page Hero */}
        <section className="text-center space-y-6 py-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border"
            style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC", borderColor: "rgba(0,204,255,0.25)" }}
          >
            📅 이번 주말 어디 가?
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              팁픽이 고른{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00CCFF, #33FF99)" }}>
                이번 주말 행사
              </span>
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              복잡하게 검색할 필요 없어요. <span className="font-black text-slate-700">수도권 핫한 축제와 행사</span>를 팁픽이 대신 골라드립니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${filter === r ? "text-white" : "bg-white text-slate-600 border border-slate-200/50 hover:bg-slate-50"}`}
                style={filter === r ? {
                  background: "linear-gradient(to right, #00CCFF, #33FF99)",
                  boxShadow: "0 4px 20px rgba(0,204,255,0.35)"
                } : {}}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Weather Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <WeatherWidget region="서울" weatherData={weatherResults["서울"]} />
          <WeatherWidget region="인천" weatherData={weatherResults["인천"]} />
          <WeatherWidget region="경기" weatherData={weatherResults["경기"]} />
        </section>

        {/* Festival Grid */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
            {filteredFestivals.map((f: Festival) => (
              <Link
                key={f.id}
                href={`/festival/${f.id}`}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] mb-4 bg-slate-200">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black shadow-sm" style={{ color: "#00CCFF" }}>
                    {f.region}
                  </div>
                  <div className="absolute bottom-4 right-4 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-white shadow-sm" style={{ background: "#00CCFF" }}>
                    {f.tag}
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-900 transition-colors mb-2 group-hover:text-[#00CCFF]">
                  {f.title}
                </h4>
                <p className="text-slate-500 font-bold text-sm flex items-center gap-1">
                  📅 {f.date}
                </p>
              </Link>
            ))}
            {filteredFestivals.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                해당 지역의 예정된 행사가 없습니다.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
