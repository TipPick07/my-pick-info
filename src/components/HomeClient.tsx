"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { PostData } from "@/lib/posts";
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

interface Benefit {
  id: string;
  region: string;
  title: string;
  target: string;
  deadline: string;
  isEmergency: boolean;
}

interface Data {
  weather: Weather[];
  festivals: Festival[];
  benefits: Benefit[];
}

export default function HomeClient({ data, posts, weatherApiKey }: { data: Data, posts: PostData[], weatherApiKey: string }) {
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

  const filteredBenefits = filter === "전체" 
    ? data.benefits 
    : data.benefits.filter(b => b.region === filter || b.region === "전국");

  const regions = ["전체", "서울", "인천", "경기"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-20">
        {/* Hero & Filter */}
        <section className="text-center space-y-10 py-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              오늘의 수도권, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                당신을 위한 로컬 큐레이션
              </span>
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              서울, 인천, 경기 지역의 가장 핫한 소식과 알짜 혜택을 <br className="hidden md:block" /> 매일 아침 에디터가 직접 전달해 드립니다.
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

        {/* Main Content (2-Column) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Festivals (2/3) */}
          <section className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-900 border-l-8 border-indigo-600 pl-4">
                주목할 만한 축제/행사
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
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
                <div className="md:col-span-2 py-20 text-center text-slate-400 font-medium bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
                  해당 지역의 예정된 행사가 없습니다.
                </div>
              )}
            </div>
          </section>

          {/* Benefits (1/3) */}
          <aside className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-900 border-l-8 border-indigo-600 pl-4">
                알짜 혜택
              </h3>
            </div>
            <div className="space-y-4">
              {filteredBenefits.map((b) => (
                <Link key={b.id} href={`/benefit/${b.id}`} className={`block p-5 rounded-3xl border-2 transition-all hover:bg-white hover:shadow-lg group ${b.isEmergency ? "border-rose-100 bg-rose-50/50" : "border-slate-100 bg-white"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${b.isEmergency ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600 "}`}>
                      {b.region}
                    </span>
                    <span className={`text-xs font-bold ${b.isEmergency ? "text-rose-600" : "text-slate-400"}`}>
                      {b.deadline}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 mb-1 leading-snug group-hover:text-indigo-600 transition-colors">
                    {b.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-bold">{b.target}</p>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        {/* Blog Section */}
        <section className="space-y-8 pt-10">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">에디터의 시선</h3>
            <p className="text-slate-500 font-medium">수도권 곳곳에 숨겨진 이야기와 꿀팁을 전해드립니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col"
              >
                <div className="p-8 space-y-4 flex flex-col h-full">
                  <div className="flex items-center justify-between text-xs font-bold tracking-widest uppercase text-indigo-600">
                    <span className="bg-indigo-50 px-3 py-1 rounded-full">{post.category}</span>
                    <span className="text-slate-400 font-medium">{post.date}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-auto">
                    {post.summary}
                  </p>

                  <div className="pt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
            {posts.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="text-6xl text-slate-200">📝</div>
                <p className="text-slate-400">아직 등록된 블로그 게시글이 없습니다.</p>
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
