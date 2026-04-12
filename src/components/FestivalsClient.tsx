"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeatherModal from "@/components/WeatherModal";
import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, Snowflake, LucideIcon
} from "lucide-react";
import CoupangBanner from "./CoupangBanner";

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

const REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  "서울": { lat: 37.5665, lon: 126.9780 },
  "인천": { lat: 37.4563, lon: 126.7052 },
  "경기": { lat: 37.2636, lon: 127.0286 },
};

const FALLBACK_WEATHER: Record<string, WeatherData> = {
  "서울": { region: "서울", temp: "--°", status: "로딩 중", weatherCode: 0, lastUpdated: "업데이트 대기", daily: [] },
  "인천": { region: "인천", temp: "--°", status: "로딩 중", weatherCode: 2, lastUpdated: "업데이트 대기", daily: [] },
  "경기": { region: "경기", temp: "--°", status: "로딩 중", weatherCode: 0, lastUpdated: "업데이트 대기", daily: [] },
};

const STATUS_MAP: Record<number, string> = {
  0: "맑음", 1: "구름조금", 2: "흐림", 3: "흐림",
  45: "안개", 48: "안개",
  51: "약한비", 53: "비", 55: "강한비",
  61: "비", 63: "비", 65: "강한비",
  71: "눈", 73: "눈", 75: "강한눈",
  80: "소나기", 81: "소나기", 82: "강한소나기",
  95: "천둥번개",
};

function getWeatherIcon(code: number): LucideIcon {
  if (code === 0) return Sun;
  if (code <= 3) return Cloud;
  if (code <= 48) return Cloud;
  if (code <= 67) return CloudRain;
  if (code <= 77) return Snowflake;
  if (code <= 82) return CloudDrizzle;
  if (code <= 86) return Snowflake;
  if (code <= 99) return CloudLightning;
  return Cloud;
}

const ITEMS_PER_PAGE = 20;

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range: (number | '...')[] = [1];
  if (current > 3) range.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) range.push(i);
  if (current < total - 2) range.push('...');
  range.push(total);
  return range;
}

export default function FestivalsClient({ data, weatherApiKey }: { data: any; weatherApiKey: string }) {
  const [filter, setFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [weatherResults, setWeatherResults] = useState<Record<string, WeatherData | null>>({
    "서울": null, "인천": null, "경기": null,
  });
  const [modalRegion, setModalRegion] = useState<string | null>(null);

  useEffect(() => {
    const CACHE_KEY = "tip-pick-weather";
    const CACHE_TTL = 30 * 60 * 1000;

    const saved = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
    let initialResults: Record<string, WeatherData> | null = null;
    let lastFetchTime = 0;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.results && typeof parsed.fetchTime === "number") {
          initialResults = parsed.results;
          lastFetchTime = parsed.fetchTime;
        } else {
          initialResults = parsed;
        }
        setWeatherResults(initialResults!);
      } catch (e) { }
    }

    async function fetchAllWeather() {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} 기준`;
      const regions = ["서울", "인천", "경기"];
      const lats = regions.map((r) => REGION_COORDS[r].lat).join(",");
      const lons = regions.map((r) => REGION_COORDS[r].lon).join(",");

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        const dataArr = await res.json();

        const results: Record<string, WeatherData> = {};
        regions.forEach((name, idx) => {
          const d = Array.isArray(dataArr) ? dataArr[idx] : dataArr;
          results[name] = {
            region: name,
            temp: `${Math.round(d.current.temperature_2m)}°`,
            status: STATUS_MAP[d.current.weather_code] || "흐림",
            weatherCode: d.current.weather_code,
            lastUpdated: timeStr,
            daily: d.daily.time.map((dateStr: string, i: number) => ({
              date: dateStr,
              maxTemp: d.daily.temperature_2m_max[i],
              minTemp: d.daily.temperature_2m_min[i],
              weatherCode: d.daily.weather_code[i],
            })),
          };
        });

        setWeatherResults(results);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ results, fetchTime: Date.now() }));
      } catch (err) {
        const fallback: Record<string, WeatherData> = {};
        ["서울", "인천", "경기"].forEach((name) => {
          fallback[name] = (initialResults && initialResults[name]) || FALLBACK_WEATHER[name];
        });
        setWeatherResults(fallback);
      }
    }

    if (initialResults && Date.now() - lastFetchTime < CACHE_TTL) return;
    fetchAllWeather();
  }, []);

  const filteredFestivals =
    filter === "전체"
      ? data.festivals
      : data.festivals.filter((f: Festival) => f.region === filter);

  const totalPages = Math.ceil(filteredFestivals.length / ITEMS_PER_PAGE);
  const paginatedFestivals = filteredFestivals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (r: string) => {
    setFilter(r);
    setCurrentPage(1);
  };

  const regions = ["전체", "서울", "인천", "경기"];
  const WEATHER_REGIONS = ["서울", "인천", "경기"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-10 space-y-8">

        {/* ── Hero ── */}
        <section className="text-center space-y-5 py-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border"
            style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC", borderColor: "rgba(0,204,255,0.25)" }}
          >
            📅 이번 주말 어디 가?
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            팁픽이 고른{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00CCFF, #33FF99)" }}
            >
              이번 주말 행사
            </span>
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
            복잡하게 검색할 필요 없어요.{" "}
            <span className="font-black text-slate-700">수도권 핫한 축제와 행사</span>를 팁픽이 대신 골라드립니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => handleFilterChange(r)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${filter === r
                  ? "text-white"
                  : "bg-white text-slate-600 border border-slate-200/50 hover:bg-slate-50"
                  }`}
                style={
                  filter === r
                    ? { background: "linear-gradient(to right, #00CCFF, #33FF99)", boxShadow: "0 4px 20px rgba(0,204,255,0.35)" }
                    : {}
                }
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* ── 슬림 날씨 가로 바 ── */}
        <section
          className="bg-white rounded-2xl border shadow-sm overflow-hidden"
          style={{ borderColor: "rgba(0,204,255,0.15)" }}
        >
          <div className="flex items-stretch divide-x divide-cyan-100/50">

            {/* 레이블 */}
            <div className="flex flex-col items-center justify-center px-4 py-3 shrink-0 bg-gradient-to-b from-cyan-50/60 to-white">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">오늘 날씨</span>
              <span className="text-[9px] text-slate-300 mt-0.5">수도권</span>
            </div>

            {/* 3개 지역 */}
            {WEATHER_REGIONS.map((region) => {
              const w = weatherResults[region];
              if (!w) {
                return (
                  <div key={region} className="flex-1 flex items-center justify-center gap-3 px-5 py-3 animate-pulse">
                    <div className="w-3 h-3 bg-slate-100 rounded-full" />
                    <div className="w-8 h-5 bg-slate-100 rounded" />
                    <div className="w-10 h-3 bg-slate-100 rounded" />
                  </div>
                );
              }

              const Icon = getWeatherIcon(w.weatherCode);
              const isSunny = w.weatherCode === 0;

              return (
                <button
                  key={region}
                  onClick={() => setModalRegion(region)}
                  className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3 hover:bg-cyan-50/40 transition-colors group"
                >
                  <span className="text-xs font-black text-slate-500 shrink-0">{region}</span>
                  <Icon
                    size={15}
                    strokeWidth={2}
                    className={`shrink-0 ${isSunny ? "text-amber-400" : "text-slate-400"} group-hover:scale-110 transition-transform`}
                  />
                  <span className="text-base font-black text-slate-900">{w.temp}</span>
                  <span className="text-xs text-slate-400 hidden sm:block">{w.status}</span>
                </button>
              );
            })}

            {/* 업데이트 시각 */}
            <div className="flex items-center justify-center px-4 py-3 shrink-0">
              <span className="text-[9px] text-slate-300 whitespace-nowrap">
                {weatherResults["서울"]?.lastUpdated ?? ""}
              </span>
            </div>
          </div>
        </section>

        {/* ── 축제 4열 그리드 ── */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
            {paginatedFestivals.map((f: Festival) => (
              <Link key={f.id} href={`/festival/${f.id}`} className="group cursor-pointer">
                {/* 이미지 — 21:9 슬림 비율 */}
                <div className="relative overflow-hidden rounded-2xl mb-2.5 bg-slate-200" style={{ aspectRatio: "21/9" }}>
                  <img
                    src={f.image || "https://tip-pick.com/images/branded_placeholder.png"}
                    alt={f.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://tip-pick.com/images/branded_placeholder.png";
                    }}
                  />
                  <div
                    className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm"
                    style={{ color: "#00CCFF" }}
                  >
                    {f.region}
                  </div>
                  <div
                    className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black text-white shadow-sm"
                    style={{ background: "#00CCFF" }}
                  >
                    {f.tag}
                  </div>
                </div>

                {/* 텍스트 */}
                <h4
                  className="text-sm font-black text-slate-900 line-clamp-2 leading-snug mb-1 group-hover:text-[#00CCFF] transition-colors"
                >
                  {f.title}
                </h4>
                <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
                  📅 {f.date}
                </p>
              </Link>
            ))}

            {filteredFestivals.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200">
                해당 지역의 예정된 행사가 없습니다.
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full text-sm font-bold border border-slate-200 bg-white disabled:opacity-30 hover:border-cyan-300 transition-colors"
              >
                ← 이전
              </button>
              {getPaginationRange(currentPage, totalPages).map((p, idx) =>
                p === '...'
                  ? <span key={`e${idx}`} className="text-slate-400 px-1">···</span>
                  : <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${currentPage === p ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-cyan-300"
                      }`}
                    style={currentPage === p ? { background: "linear-gradient(to right, #00CCFF, #33FF99)" } : {}}
                  >
                    {p}
                  </button>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full text-sm font-bold border border-slate-200 bg-white disabled:opacity-30 hover:border-cyan-300 transition-colors"
              >
                다음 →
              </button>
            </div>
          )}
        </section>
        <CoupangBanner />
      </main>

      {/* 날씨 상세 모달 */}
      {modalRegion && weatherResults[modalRegion] && (
        <WeatherModal
          region={modalRegion}
          dailyData={weatherResults[modalRegion]?.daily ?? []}
          onClose={() => setModalRegion(null)}
        />
      )}

      <Footer />
    </div>
  );
}
