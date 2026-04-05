"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getRealTimeWeather } from "@/lib/weather";

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
  const [weatherData, setWeatherData] = useState<Weather[]>(data.weather);

  useEffect(() => {
    if (weatherApiKey) {
      getRealTimeWeather(weatherApiKey).then(res => {
        if (res && res.length > 0 && res[0].temp !== '에러') {
          setWeatherData(res);
        }
      });
    }
  }, [weatherApiKey]);

  const filteredFestivals = filter === "전체" 
    ? data.festivals 
    : data.festivals.filter(f => f.region === filter);

  const regions = ["전체", "서울", "인천", "경기"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Page Hero */}
        <section className="text-center space-y-6 py-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              오늘의 <span className="text-indigo-600">축제/행사</span> 소식
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              수도권 지역의 다채로운 축제와 생생한 행사 정보를 한눈에 확인하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  filter === r
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Weather Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weatherData.map((w) => (
            <div key={w.region} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white border-b-slate-200 flex items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="space-y-1">
                <p className="text-slate-500 font-bold text-sm">{w.region}의 날씨</p>
                <h3 className="text-3xl font-black text-slate-900">{w.temp}</h3>
                <p className="text-slate-600 font-medium">{w.status}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                {w.icon}
              </div>
            </div>
          ))}
        </section>

        {/* Festival Grid */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
            {filteredFestivals.map((f) => (
              <Link key={f.id} href={`/festival/${f.id}`} className="group cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl mb-4 bg-slate-200">
                  <img 
                    src={f.image} 
                    alt={f.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-indigo-600 shadow-sm">
                    {f.region}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-indigo-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-white shadow-sm">
                    {f.tag}
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {f.title}
                </h4>
                <p className="text-slate-500 font-bold text-sm flex items-center gap-1">
                  📅 {f.date}
                </p>
              </Link>
            ))}
            {filteredFestivals.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
                해당 지역의 예정된 행사가 없습니다.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <h1 className="text-xl font-black tracking-tighter text-white">수도권N라이프</h1>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                수도권 지역의 알짠 정보와 에디터의 생생한 리뷰를 큐레이션하는 프리미엄 로컬 포털입니다. 우리의 도시가 더욱 즐거워지도록 매일 새로운 소식을 전합니다.
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="text-white font-bold text-sm">바로가기</h5>
              <ul className="text-sm space-y-2 font-medium">
                <li><Link href="/festivals/" className="hover:text-white transition-colors">축제/행사</Link></li>
                <li><Link href="/benefits/" className="hover:text-white transition-colors">지원금/혜택</Link></li>
                <li><Link href="/blog/" className="hover:text-white transition-colors">블로그</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-white font-bold text-sm">정보 안내</h5>
              <ul className="text-sm space-y-2 font-medium">
                <li>데이터 출처: 공공데이터포털</li>
                <li>마지막 업데이트: 2026.04.05</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold tracking-wider uppercase">© 2026 Metropolitan N-Life. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
