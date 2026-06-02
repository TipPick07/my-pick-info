"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PostData } from "@/lib/posts";
import AdBanner from "@/components/AdBanner";
import AdFit from "@/components/AdFit";
import CustomBanner from "@/components/CustomBanner";

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
  isToday?: boolean;
  date?: string;
}

// ── 지원금 만료 체크 ─────────────────────────────────────────────────────────
function parseBenefitEndDate(deadline: string): Date | null {
  if (!deadline) return null;
  const matches = [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  return new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
}

function parseBenefitStartDate(deadline: string): Date | null {
  if (!deadline) return null;
  const matches = [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (matches.length === 0) return null;
  const first = matches[0];
  return new Date(parseInt(first[1]), parseInt(first[2]) - 1, parseInt(first[3]));
}

function isBenefitExpired(deadline: string, today: Date): boolean {
  const end = parseBenefitEndDate(deadline);
  if (!end) return false; // 상시 등 날짜 없으면 미만료
  return end < today;
}

function isBenefitOngoing(deadline: string, today: Date): boolean {
  const matches = deadline ? [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)] : [];
  if (matches.length === 0) return true; // 상시
  const start = parseBenefitStartDate(deadline);
  const end = parseBenefitEndDate(deadline);
  return (!start || start <= today) && (!end || end >= today);
}

function sortBenefitsHome(list: Benefit[], today: Date): Benefit[] {
  return [...list].sort((a, b) => {
    const aOngoing = isBenefitOngoing(a.deadline, today);
    const bOngoing = isBenefitOngoing(b.deadline, today);
    if (aOngoing && !bOngoing) return -1;
    if (!aOngoing && bOngoing) return 1;
    const aEnd = parseBenefitEndDate(a.deadline);
    const bEnd = parseBenefitEndDate(b.deadline);
    return (aEnd ? aEnd.getTime() : Infinity) - (bEnd ? bEnd.getTime() : Infinity);
  });
}
// ────────────────────────────────────────────────────────────────────────────

function getDDayLabel(deadline: string, today: Date): string {
  const end = parseBenefitEndDate(deadline);
  if (!end) return "";
  const diff = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return "마감";
}

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

function isFestivalOngoing(dateStr: string, today: Date): boolean {
  const { start, end } = parseFestivalDates(dateStr);
  if (!start && !end) return true; // 상시
  const startOk = !start || start <= today;
  const endOk = !end || end >= today;
  return startOk && endOk;
}

function sortFestivals<T extends { date: string }>(list: T[], today: Date): T[] {
  return [...list].sort((a, b) => {
    const aOngoing = isFestivalOngoing(a.date, today);
    const bOngoing = isFestivalOngoing(b.date, today);
    // 1순위: 진행중 먼저
    if (aOngoing && !bOngoing) return -1;
    if (!aOngoing && bOngoing) return 1;
    // 2순위: 종료일 오름차순
    const { end: aE } = parseFestivalDates(a.date);
    const { end: bE } = parseFestivalDates(b.date);
    const aEnd = aE ? aE.getTime() : Infinity;
    const bEnd = bE ? bE.getTime() : Infinity;
    return aEnd - bEnd;
  });
}
// ────────────────────────────────────────────────────────────────────────────

export default function HomeClient({ data, posts, weatherApiKey, todayUpdates, bannerConfig }: { data: Data, posts: PostData[], weatherApiKey: string, todayUpdates?: TodayUpdates, bannerConfig?: { isActive: boolean; imageUrl: string; linkUrl: string } }) {
  const [filter, setFilter] = useState("전체");
  const [benefitFilter, setBenefitFilter] = useState("전체 보기");

  // KST 기준 오늘 날짜
  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

  const closingSoonBenefits = data.benefits.filter((b) => {
    const end = parseBenefitEndDate(b.deadline);
    if (!end) return false;
    const diff = (end.getTime() - todayKST.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const filteredFestivals = sortFestivals(
    (filter === "전체" ? data.festivals : data.festivals.filter(f => f.region === filter))
      .filter((f: Festival) => !isFestivalExpired(f.date, todayKST)),
    todayKST
  );

  const filteredBenefits = sortBenefitsHome(
    (filter === "전체"
      ? data.benefits
      : data.benefits.filter(b => b.region === filter || b.region === "전국"))
      .filter(b => !isBenefitExpired(b.deadline, todayKST))
      .filter(b => {
        if (benefitFilter === "LH/SH 주거 지원") {
          return (b.title + " " + b.target).match(/주거|청년안심|LH|SH|전세|월세|임대/);
        }
        if (benefitFilter === "소상공인") {
          return (b.title + " " + b.target).match(/소상공인|자영업|창업/);
        }
        return true;
      }),
    todayKST
  ).slice(0, 5);

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
              나열된 공고문 대신, 에디터가 직접 분석한 지원금/축제 총정리와 실무 팁을 확인하세요.
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
                  💡 에디터 추천 큐레이션 보기
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
                이번 주 나들이 보기
              </Link>
            </div>
          </div>
        </section>

        {/* 직접 광고 영업용 고정 배너 영역 */}
        <CustomBanner config={bannerConfig} />

        {/* ── D-Day 위젯 Section ── */}
        {closingSoonBenefits.length > 0 && (
          <section className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-[2rem] p-5 shadow-sm border border-rose-100/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-rose-500 text-white p-3 rounded-2xl shadow-lg animate-pulse shrink-0">
                <span className="text-2xl">🚨</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                서두르세요! 이번 주 마감되는 혜택이 총{" "}
                <span className="text-rose-500">{closingSoonBenefits.length}건</span> 있습니다.
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {closingSoonBenefits.slice(0, 2).map((benefit) => {
                const dday = getDDayLabel(benefit.deadline, todayKST);
                return (
                  <Link
                    key={benefit.id}
                    href={`/benefit/${benefit.id}/`}
                    className="group bg-white p-4 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3"
                  >
                    <span className="text-slate-800 font-bold group-hover:text-rose-600 transition-colors text-sm line-clamp-1 flex-1">
                      {benefit.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-xs font-medium">{benefit.deadline}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${dday === "D-Day" ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-600"}`}>
                        {dday}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 오늘자 업데이트 요약 위젯 ── */}
        {todayUpdates && (todayUpdates.festivals.length > 0 || todayUpdates.benefits.length > 0) && (
          <section className="bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-[2rem] p-5 shadow-sm border border-cyan-100/50">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse">
                  오늘의 신규 Pick
                </span>
                {todayUpdates.date && (
                  <span className="inline-flex items-center gap-1 bg-white text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                    📅 {todayUpdates.date.replace(/-/g, '.')} 업데이트
                  </span>
                )}
                <h3 className="text-slate-800 font-bold text-base md:text-lg">
                  {todayUpdates.isToday ? '오늘 아침 새로운 소식을 추가했어요!' : '최근 새로운 소식을 추가했어요!'}
                </h3>
              </div>
              <div className={`grid gap-4 ${todayUpdates.festivals.length > 0 && todayUpdates.benefits.length > 0 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>

                {/* 축제/행사 요약 박스 — 항목 있을 때만 노출 */}
                {todayUpdates.festivals.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <h4 className="font-black text-slate-800 mb-2 flex items-center gap-1">
                      🎉 축제/행사
                    </h4>
                    <ul className="space-y-1.5">
                      {todayUpdates.festivals.slice(0, 3).map((f) => (
                        <li key={f.slug} className="text-sm text-slate-600 truncate font-medium">
                          <Link href={`/blog/${f.slug}/`} className="hover:text-cyan-600 transition-colors">
                            · {f.title}
                          </Link>
                        </li>
                      ))}
                      {todayUpdates.festivals.length > 3 && (
                        <li className="text-xs text-slate-400 pt-1">외 {todayUpdates.festivals.length - 3}건 더보기...</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* 혜택/지원금 요약 박스 — 항목 있을 때만 노출 */}
                {todayUpdates.benefits.length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <h4 className="font-black text-slate-800 mb-2 flex items-center gap-1">
                      💰 혜택/지원금
                    </h4>
                    <ul className="space-y-1.5">
                      {todayUpdates.benefits.slice(0, 3).map((b) => (
                        <li key={b.slug} className="text-sm text-slate-600 truncate font-medium">
                          <Link href={`/blog/${b.slug}/`} className="hover:text-emerald-600 transition-colors">
                            · {b.title}
                          </Link>
                        </li>
                      ))}
                      {todayUpdates.benefits.length > 3 && (
                        <li className="text-xs text-slate-400 pt-1">외 {todayUpdates.benefits.length - 3}건 더보기...</li>
                      )}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          </section>
        )}

        {/* ── 지역 필터 바 — 거르는 콘텐츠(축제·지원금) 바로 위에 배치 ── */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm px-6 py-5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-black text-slate-900">📍 지역별 축제·지원금</span>
              <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full">
                {filter === "전체" ? "전체 지역" : filter}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${filter === r ? "text-white scale-105" : "bg-slate-50 text-slate-600 border border-slate-200/70 hover:bg-slate-100"}`}
                  style={filter === r ? {
                    background: "linear-gradient(to right, #00CCFF, #33FF99)",
                    boxShadow: "0 4px 18px rgba(0,204,255,0.32)"
                  } : {}}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* ── 메인 컨텐츠 (2-Column) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 축제/행사 (2/3) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900 pl-4" style={{ borderLeft: "6px solid #00CCFF" }}>
                주목할 만한 축제/행사
              </h3>
              <Link href="/festivals/" className="text-sm font-bold transition-colors" style={{ color: "#00CCFF" }}>
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              {filteredFestivals.slice(0, 4).map((f) => (
                <Link key={f.id} href={`/festival/${f.id}/`} className="group cursor-pointer">
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
              <Link href="/benefits/" className="text-sm font-bold transition-colors" style={{ color: "#33FF99", filter: "brightness(0.75)" }}>
                전체 보기 →
              </Link>
            </div>

            {/* ── 지원금 고가치 필터 탭 ── */}
            <div className="flex gap-2 px-2 overflow-x-auto pb-1 scrollbar-hide">
              {["전체 보기", "LH/SH 주거 지원", "소상공인"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBenefitFilter(tab)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    benefitFilter === tab
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                      : "bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredBenefits.map((b) => (
                <Link
                  key={b.id}
                  href={`/benefit/${b.id}/`}
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
        </div>

        {/* ── 팁픽 가이드 (블로그) 섹션 — 가로형 카드 (핵심 콘텐츠 아래 보조 콘텐츠) ── */}
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
            <Link href="/blog/" className="text-sm font-bold transition-colors" style={{ color: "#059669" }}>
              전체 보기 →
            </Link>
          </div>

          <div className="space-y-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}/`}
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
                    {({ festival: '축제', benefit: '지원금', benefits: '지원금', election: '선거', info: '정보' } as Record<string, string>)[post.category ?? ''] ?? post.category}
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

        {/* Ad Banner */}
        <AdBanner />

        {/* 메인 화면 중간 카카오 애드핏 광고 */}
        <AdFit width="320" height="100" />
      </main>

      <Footer />
    </div>
  );
}
