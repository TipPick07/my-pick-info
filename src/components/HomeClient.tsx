"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { PostData } from "@/lib/posts";
import { getRealTimeWeather } from "@/lib/weather";
import AdBanner from "@/components/AdBanner";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-20">

        {/* ── Hero Section ── */}
        <section className="text-center space-y-10 py-10">
          {/* 로고 */}
          <div className="flex justify-center">
            <div className="relative w-28 h-28 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.35)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] transition-all duration-500">
              <Image
                src="/images/logo-tippick.png"
                alt="팁픽 로고"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              오늘 당신이 놓칠 뻔한 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                현금 혜택
              </span>
              , 팁픽이 대신 골라드립니다!
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              복잡한 공공데이터 속에서 오직 당신에게 필요한{" "}
              <span className="font-black text-slate-700">&apos;진짜 이득&apos;</span>만 골라내는
              스마트한 전구, 팁픽입니다.
            </p>
            {/* CTA 배너 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/benefits/"
                className="group relative px-10 py-4 bg-slate-900 text-white font-black text-lg rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.0)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  💡 지금 바로 Pick 하세요
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute inset-0 bg-slate-900" />
                <span className="relative z-10 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 group-hover:text-white transition-colors">
                  💡 지금 바로 Pick 하세요 →
                </span>
              </Link>
              <Link
                href="/festivals/"
                className="px-10 py-4 border-2 border-slate-200 text-slate-600 font-bold text-lg rounded-2xl hover:border-cyan-400 hover:text-cyan-600 transition-all duration-300"
              >
                이번 주말 어디 가?
              </Link>
            </div>
          </div>

          {/* 지역 필터 */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  filter === r
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_4px_20px_rgba(6,182,212,0.4)]"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* ── 날씨 위젯 ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weatherData.map((w) => (
            <div key={w.region} className="bg-white p-6 rounded-[2rem] border-2 border-cyan-100 hover:border-cyan-300 flex items-center justify-between shadow-sm hover:shadow-[0_4px_20px_rgba(6,182,212,0.15)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="space-y-1">
                <p className="text-cyan-600 font-bold text-sm">{w.region}의 날씨</p>
                <h3 className="text-3xl font-black text-slate-900">{w.temp}</h3>
                <p className="text-slate-600 font-medium">{w.status}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform border border-cyan-100">
                {w.icon}
              </div>
            </div>
          ))}
        </section>

        {/* ── 메인 컨텐츠 (2-Column) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* 축제/행사 (2/3) */}
          <section className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-900 border-l-8 border-cyan-500 pl-4">
                주목할 만한 축제/행사
              </h3>
              <Link href="/festivals/" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors">
                전체 보기 →
              </Link>
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
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-cyan-600 shadow-sm">
                      {f.region}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-cyan-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-white shadow-sm">
                      {f.tag}
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 group-hover:text-cyan-600 transition-colors mb-2">
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

          {/* 혜택/지원금 (1/3) */}
          <aside className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-slate-900 border-l-8 border-emerald-500 pl-4">
                내 돈 찾는 지원금
              </h3>
              <Link href="/benefits/" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                전체 보기 →
              </Link>
            </div>
            <div className="space-y-4">
              {filteredBenefits.map((b) => (
                <Link key={b.id} href={`/benefit/${b.id}`} className={`block p-5 rounded-3xl border-2 transition-all hover:bg-white hover:shadow-lg group ${b.isEmergency ? "border-rose-100 bg-rose-50/50" : "border-slate-100 bg-white"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${b.isEmergency ? "bg-rose-500 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                      💡 {b.region}
                    </span>
                    <span className={`text-xs font-bold ${b.isEmergency ? "text-rose-600" : "text-slate-400"}`}>
                      {b.deadline}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 mb-1 leading-snug group-hover:text-cyan-600 transition-colors">
                    {b.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-bold">{b.target}</p>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        {/* Ad Banner */}
        <AdBanner />

        {/* ── 팁픽 가이드 (블로그) 섹션 ── */}
        <section className="space-y-8 pt-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-200">
              💡 팁픽 가이드
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              팁픽(Tip-Pick) 가이드
            </h3>
            <p className="text-slate-500 font-medium">데이터는 공공기관이, 꿀팁은 팁픽이.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:border-cyan-100 transition-all duration-700 hover:-translate-y-2 flex flex-col"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                  <img
                    src={post.image || 'https://images.unsplash.com/photo-1516414920216-7057aeb0217a?q=80&w=800&auto=format&fit=crop'}
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-[1000ms]"
                  />
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black text-cyan-600 shadow-xl border border-white/50 tracking-wider">
                    {post.category}
                  </div>
                </div>

                <div className="p-8 space-y-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">💡 팁픽 큐레이션</span>
                    <span>{post.date}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-auto">
                    {post.summary}
                  </p>

                  <div className="pt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
            {posts.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="text-6xl text-slate-200">💡</div>
                <p className="text-slate-400">아직 등록된 팁픽 가이드가 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                  <Image src="/images/logo-tippick.png" alt="팁픽" fill className="object-cover" />
                </div>
                <h1 className="text-xl font-black tracking-tighter text-white">팁픽<span className="text-cyan-400">.</span></h1>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                데이터는 공공기관이, 꿀팁은 팁픽이. 복잡한 공공데이터 속에서 오직 당신에게 필요한 &#39;진짜 이득&#39;만 골라내는 스마트한 전구입니다.
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="text-white font-bold text-sm">바로가기</h5>
              <ul className="text-sm space-y-2 font-medium">
                <li><Link href="/festivals/" className="hover:text-cyan-400 transition-colors">이번 주말 어디 가?</Link></li>
                <li><Link href="/benefits/" className="hover:text-emerald-400 transition-colors">내 돈 찾는 지원금</Link></li>
                <li><Link href="/blog/" className="hover:text-white transition-colors">팁픽 인사이트</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-white font-bold text-sm">정보 안내</h5>
              <ul className="text-sm space-y-2 font-medium">
                <li>데이터 출처: 공공데이터포털</li>
                <li>마지막 업데이트: 2026.04.06</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold tracking-wider uppercase">© 2026 팁픽(Tip-Pick). All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors">Instagram</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
