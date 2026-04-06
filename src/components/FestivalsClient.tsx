"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeatherWidget from "@/components/WeatherWidget";

interface Weather {
  region: string;
  temp: string;
  status: string;
  icon: string;
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
  weather: Weather[];
  festivals: Festival[];
}

export default function FestivalsClient({ data, weatherApiKey }: { data: Data, weatherApiKey: string }) {
  const [filter, setFilter] = useState("전체");
  const filteredFestivals = filter === "전체"
    ? data.festivals
    : data.festivals.filter(f => f.region === filter);

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
          <WeatherWidget region="서울" />
          <WeatherWidget region="인천" />
          <WeatherWidget region="경기" />
        </section>

        {/* Festival Grid */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
            {filteredFestivals.map((f) => (
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
