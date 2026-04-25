"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PostData } from "@/lib/posts";
import AdBanner from "@/components/AdBanner";
import CoupangBanner from "./CoupangBanner";

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

interface TodayUpdates {
  festivals: PostData[];
  benefits: PostData[];
  totalCount: number;
}

// ── 지원금 만료 체크 ─────────────────────────────────────────────────────────
function parseBenefitEndDate(deadline: string): Date | null {
  if (!deadline) return null;
  const matches = [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  return new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
}

function isBenefitExpired(deadline: string, today: Date): boolean {
  const end = parseBenefitEndDate(deadline);
  if (!end) return false; // 상시 등 날짜 없으면 미만료
  return end < today;
}
// ────────────────────────────────────────────────────────────────────────────

// ── 축제 날짜 유틸 ──────────────────────────────────────────────────────────
function parseFestivalDates(dateStr: string): { start: Date | null; end: Date | null } {
  if (!dateStr || dateStr === '상시') return { start: null, end: null };
  const parts = dateStr.split('~');
  const parse = (s: string) => {
    const m = s.trim().match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
    return m ? new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])) : null;
  };
  return { start: parse(parts[0]), end: parse(parts[parts.length - 1]) };
}

function isFestivalExpired(dateStr: string, today: Date): boolean {
  const { end } = parseFestivalDates(dateStr);
  if (!end) return false;
  return end < today;
}

function sortFestivals<T extends { date: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const { start: aS, end: aE } = parseFestivalDates(a.date);
    const { start: bS, end: bE } = parseFestivalDates(b.date);
    const aStart = aS ? aS.getTime() : Infinity;
    const bStart = bS ? bS.getTime() : Infinity;
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = aE ? aE.getTime() : Infinity;
    const bEnd = bE ? bE.getTime() : Infinity;
    return aEnd - bEnd;
  });
}
// ────────────────────────────────────────────────────────────────────────────

export default function HomeClient({ data, posts, weatherApiKey, todayUpdates }: { data: Data, posts: PostData[], weatherApiKey: string, todayUpdates?: TodayUpdates }) {
  const [filter, setFilter] = useState("전체");

  // KST 기준 오늘 날짜
  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

  const filteredFestivals = sortFestivals(
    (filter === "전체" ? data.festivals : data.festivals.filter(f => f.region === filter))
      .filter((f: Festival) => !isFestivalExpired(f.date, todayKST))
  );

  // 마감된 지원금 제외 후 최신 5개 (배열 뒤쪽 = 최근 등록)
  const filteredBenefits = (filter === "전체"
    ? data.benefits
    : data.benefits.filter(b => b.region === filter || b.region === "전국"))
    .filter(b => !isBenefitExpired(b.deadline, todayKST))
    .slice(-5);

  const regions = ["전체", "서울", "인천", "경기"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-14">

        {/* ── Hero Section ── */}
        <section className="text-center space-y-8 py-6">
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

          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              당신의 일상에{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                혜택과 즐거움
              </span>
              을 픽(Pick)하세요!
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              꼭 챙겨야 할 쏠쏠한 현금 혜택부터 우리 동네 숨은 축제까지.{" "}
              수많은 공공데이터 속에서 오직 당신에게 필요한{" "}
              <span className="font-black text-slate-700">진짜 정보</span>만 큐레이션 합니다.
            </p>
            {/* CTA 배너 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/benefits/"
                className="group relative px-10 py-4 bg-slate-900 text-white font-black text-lg rounded-2xl overflow-hidden transition-all duration-300"
                style={{ boxShadow: "0 0 0 rgba(0,204,255,0)" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 30px rgba(0,204,255,0.45)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,204,255,0)")}
              >
                <span className="relative z-10 flex items-center gap-2">
                  💡 지금 바로 Pick 하세요 →
                </span>
              </Link>
              <Link
                href="/festivals/"
                className="px-10 py-4 border-2 border-slate-200 text-slate-600 font-bold text-lg rounded-2xl transition-all duration-300"
                style={{ border: "2px solid #e2e8f0" }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#00CCFF";
                  e.currentTarget.style.color = "#00CCFF";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "";
                }}
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

        {/* ── D-Day 위젯 Section ── */}
        <section className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-[2rem] p-5 shadow-sm border border-rose-100/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-rose-500 text-white p-3 rounded-2xl shadow-lg animate-pulse">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900">놓치면 0원! 이번 주 마감 혜택</h3>
                <p className="text-slate-500 text-sm font-medium">서두르세요! 곧 신청이 마감되는 혜택들이에요.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {data.benefits
                .filter((b: any) => b.isEmergency)
                .slice(0, 2)
                .map((benefit: any) => (
                  <Link
                    key={benefit.id}
                    href={`/benefit/${benefit.id}/`}
                    className="flex-1 md:flex-none group bg-white p-4 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-black">
                        {benefit.deadline.includes('마감') ? '마감임박' : benefit.deadline.includes('선착순') ? '선착순' : 'CHECK'}
                      </span>
                      <span className="text-slate-800 font-bold group-hover:text-rose-600 transition-colors">
                        {benefit.title}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* ── 오늘자 업데이트 요약 위젯 ── */}
        {todayUpdates && todayUpdates.totalCount > 0 && (
          <section className="bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-[2rem] p-5 shadow-sm border border-cyan-100/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse">
                  오늘의 신규 Pick
                </span>
                <h3 className="text-slate-800 font-bold text-base md:text-lg">
                  오늘 아침, <span className="text-cyan-600 font-black">{todayUpdates.totalCount}건</span>의 새로운 정보가 추가되었어요!
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 축제/행사 요약 박스 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-2 flex items-center gap-1">
                    🎉 축제/행사 <span className="text-cyan-600">({todayUpdates.festivals.length}건)</span>
                  </h4>
                  {todayUpdates.festivals.length > 0 ? (
                    <ul className="space-y-1.5">
                      {todayUpdates.festivals.slice(0, 3).map((f) => (
                        <li key={f.slug} className="text-sm text-slate-600 truncate font-medium">
                          <Link href={`/blog/${f.slug}`} className="hover:text-cyan-600 transition-colors">
                            · {f.title}
                          </Link>
                        </li>
                      ))}
                      {todayUpdates.festivals.length > 3 && (
                        <li className="text-xs text-slate-400 pt-1">외 {todayUpdates.festivals.length - 3}건 더보기...</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 mt-1">오늘 추가된 축제/행사는 없습니다.</p>
                  )}
                </div>

                {/* 혜택/지원금 요약 박스 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-2 flex items-center gap-1">
                    💰 혜택/지원금 <span className="text-emerald-600">({todayUpdates.benefits.length}건)</span>
                  </h4>
                  {todayUpdates.benefits.length > 0 ? (
                    <ul className="space-y-1.5">
                      {todayUpdates.benefits.slice(0, 3).map((b) => (
                        <li key={b.slug} className="text-sm text-slate-600 truncate font-medium">
                          <Link href={`/blog/${b.slug}`} className="hover:text-emerald-600 transition-colors">
                            · {b.title}
                          </Link>
                        </li>
                      ))}
                      {todayUpdates.benefits.length > 3 && (
                        <li className="text-xs text-slate-400 pt-1">외 {todayUpdates.benefits.length - 3}건 더보기...</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 mt-1">오늘 추가된 지원금은 없습니다.</p>
                  )}
                </div>

              </div>
            </div>
          </section>
        )}

        {/* ── 메인 컨텐츠 (2-Column) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 축제/행사 (2/3) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900 pl-4" style={{ borderLeft: "6px solid #00CCFF" }}>
                주목할 만한 축제/행사
              </h3>
              <div className="flex items-center gap-4">
                <Link href="/weekly/" className="text-sm font-bold transition-colors" style={{ color: "#00CCFF" }}>
                  📅 이번 주 행사 보기 →
                </Link>
                <Link href="/festivals/" className="text-sm font-bold transition-colors" style={{ color: "#00CCFF" }}>
                  전체 보기 →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              {filteredFestivals.slice(0, 4).map((f) => (
                <Link key={f.id} href={`/festival/${f.id}`} className="group cursor-pointer">
                  {/* 이미지 높이 16:9 비율로 슬림하게 */}
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] mb-3 bg-slate-200">
                    <img
                      src={f.image || '/images/blogs/korea-welfare-benefit-322.png'}
                      alt={f.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/blogs/korea-welfare-benefit-322.png';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black shadow-sm" style={{ color: "#00CCFF" }}>
                      {f.region}
                    </div>
                    <div className="absolute bottom-3 right-3 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-white shadow-sm" style={{ background: "#00CCFF" }}>
                      {f.tag}
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 transition-colors mb-1 group-hover:text-[#00CCFF]">
                    {f.title}
                  </h4>
                  <p className="text-slate-500 font-bold text-sm flex items-center gap-1">
                    📅 {f.date}
                  </p>
                </Link>
              ))}
              {filteredFestivals.length === 0 && (
                <div className="md:col-span-2 py-16 text-center text-slate-400 font-medium bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200">
                  해당 지역의 예정된 행사가 없습니다.
                </div>
              )}
            </div>
          </section>

          {/* 혜택/지원금 (1/3) */}
          <aside className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900 pl-4" style={{ borderLeft: "6px solid #33FF99" }}>
                내 돈 찾는 지원금
              </h3>
              <div className="flex items-center gap-4">
                <Link href="/deadline/" className="text-sm font-bold text-rose-500 transition-colors hover:text-rose-600">
                  🚨 마감 임박 지원금 보기 →
                </Link>
                <Link href="/benefits/" className="text-sm font-bold transition-colors" style={{ color: "#33FF99", filter: "brightness(0.75)" }}>
                  전체 보기 →
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {filteredBenefits.map((b) => (
                <Link
                  key={b.id}
                  href={`/benefit/${b.id}`}
                  className={`block p-4 rounded-[2rem] border-2 transition-all group ${b.isEmergency ? "border-rose-100 bg-rose-50/50" : "border-slate-100 bg-white"
                    }`}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = b.isEmergency ? "0 4px 16px rgba(244,63,94,0.15)" : "0 4px 16px rgba(0,204,255,0.15)";
                    e.currentTarget.style.borderColor = b.isEmergency ? "#fecdd3" : "rgba(0,204,255,0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = b.isEmergency ? "#ffe4e6" : "#f1f5f9";
                  }}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${b.isEmergency ? "bg-rose-500 text-white" : "text-white"
                      }`} style={b.isEmergency ? {} : { background: "rgba(51,255,153,0.25)", color: "#059669" }}>
                      💡 {b.region}
                    </span>
                    <span className={`text-xs font-bold ${b.isEmergency ? "text-rose-600" : "text-slate-400"}`}>
                      {b.deadline}
                    </span>
                  </div>
                  <h4
                    className="font-black text-slate-900 text-sm mb-0.5 leading-snug"
                    onMouseEnter={e => (e.currentTarget.style.color = "#00CCFF")}
                    onMouseLeave={e => (e.currentTarget.style.color = "")}
                  >
                    {b.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-bold line-clamp-1">{b.target}</p>
                </Link>
              ))}
            </div>
            {/* 더보기 버튼 */}
            <Link
              href="/benefits/"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[2rem] border-2 border-dashed text-sm font-black transition-all duration-300"
              style={{ borderColor: "rgba(51,255,153,0.5)", color: "#059669" }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(51,255,153,0.08)";
                e.currentTarget.style.borderColor = "#33FF99";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.borderColor = "rgba(51,255,153,0.5)";
              }}
            >
              더보기 →
            </Link>
          </aside>
        </div>

        {/* Ad Banner */}
        <AdBanner />


        {/* ── 팁픽 가이드 (블로그) 섹션 — 가로형 카드 ── */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full border" style={{ backgroundColor: "rgba(51,255,153,0.1)", color: "#059669", borderColor: "rgba(51,255,153,0.3)" }}>
                💡 팁픽 가이드
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                팁픽(Tip-Pick) 가이드
              </h3>
            </div>
            <Link href="/blog" className="text-sm font-bold transition-colors" style={{ color: "#059669" }}>
              전체 보기 →
            </Link>
          </div>

          <div className="space-y-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-stretch bg-white rounded-[1.75rem] overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-0.5 transition-all duration-300"
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,204,255,0.12)";
                  e.currentTarget.style.borderColor = "rgba(0,204,255,0.25)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "#f1f5f9";
                }}
              >
                {/* 왼쪽 이미지 */}
                <div className="relative w-32 shrink-0 overflow-hidden bg-slate-100">
                  <img
                    src={post.image || '/images/blogs/korea-welfare-benefit-322.png'}
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/blogs/korea-welfare-benefit-322.png';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black text-cyan-600 shadow border border-white/50 tracking-wider">
                    {post.category}
                  </div>
                </div>

                {/* 오른쪽 텍스트 */}
                <div className="flex-1 px-5 py-4 flex flex-col justify-center gap-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span>💡 팁픽 큐레이션</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-1">
                    {post.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {post.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="text-[9px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
            {posts.length === 0 && (
              <div className="py-16 text-center space-y-4">
                <div className="text-5xl text-slate-200">💡</div>
                <p className="text-slate-400">아직 등록된 팁픽 가이드가 없습니다.</p>
              </div>
            )}
          </div>
        </section>
        <CoupangBanner />
      </main>

      <Footer />
    </div>
  );
}
