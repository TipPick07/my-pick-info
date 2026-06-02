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
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

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

interface SituationTile {
  key: string;
  emoji: string;
  label: string;
  tagline: string;
  benefits: number;
  posts: number;
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

const FALLBACK_IMG = '/images/blogs/korea-welfare-benefit-322.png';

export default function HomeClient({ data, posts, weatherApiKey, todayUpdates, situations, bannerConfig }: { data: Data, posts: PostData[], weatherApiKey: string, todayUpdates?: TodayUpdates, situations?: SituationTile[], bannerConfig?: { isActive: boolean; imageUrl: string; linkUrl: string } }) {
  const [filter, setFilter] = useState("전체");
  const [benefitFilter, setBenefitFilter] = useState("전체 보기");

  // KST 기준 오늘 날짜
  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

  // ── 탐색(브라우즈)용 — 지역/카테고리 필터 적용 ──
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
        if (benefitFilter === "주거/임대 지원") {
          return (b.title + " " + b.target).match(/주거|청년안심|LH|SH|GH|전세|월세|임대|행복주택|국민임대/);
        }
        return true;
      }),
    todayKST
  ).slice(0, 5);

  const regions = ["전체", "서울", "인천", "경기"];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-10 space-y-14">

        {/* ── Hero Section ── */}
        <section className="text-center space-y-7 py-2">
          <div className="flex justify-center">
            <div className="relative w-20 h-20 rounded-[1.75rem] overflow-hidden shadow-[0_8px_30px_rgba(0,204,255,0.18)]">
              <Image src="/images/logo-tippick.png" alt="팁픽 로고" fill className="object-cover" priority />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              당신의 일상에{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                혜택과 즐거움
              </span>
              을 픽(Pick)하세요!
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              나열된 공고문 대신, 에디터가 직접 분석한 지원금/축제 총정리와 실무 팁을 확인하세요.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button href="/benefits/" variant="primary" className="text-base md:text-lg px-9 py-4">
                💡 에디터 추천 큐레이션 보기
              </Button>
              <Button href="/festivals/" variant="secondary" className="text-base md:text-lg px-9 py-4">
                이번 주 나들이 보기
              </Button>
            </div>
          </div>
        </section>

        <CustomBanner config={bannerConfig} />

        {/* ── 상황별 진입 타일 (wayfinding) ── */}
        {situations && situations.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">🎯 내 상황에 맞는 혜택</h2>
              <Link href="/situations/" className="text-sm font-bold text-brand-dark hover:text-brand transition-colors">전체 보기 →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {situations.map((s) => (
                <Link
                  key={s.key}
                  href={`/situations/${s.key}/`}
                  className="group bg-white rounded-2xl border border-slate-100 p-4 text-center hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_6px_24px_rgba(0,204,255,0.12)] transition-all duration-300"
                >
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <p className="font-black text-slate-900 text-sm leading-tight group-hover:text-brand-dark transition-colors">{s.label}</p>
                  <p className="mt-2 text-[11px] font-black text-emerald-600">지원금 {s.benefits}건</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 탐색: 지역 필터 + 축제·지원금 2-Column ── */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[1.75rem] border border-slate-100 shadow-sm px-6 py-5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-black text-slate-900">📍 지역별 축제·지원금</span>
              <span className="text-xs font-bold text-brand-dark bg-cyan-50 px-2.5 py-1 rounded-full">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* 축제/행사 (2/3) */}
            <section className="lg:col-span-2 space-y-6">
              <SectionHeading title="주목할 만한 축제/행사" accentColor="#00CCFF" moreHref="/festivals/" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                {filteredFestivals.slice(0, 4).map((f) => (
                  <Link key={f.id} href={`/festival/${f.id}/`} className="group cursor-pointer">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] mb-3 bg-slate-100">
                      <img
                        src={f.image || FALLBACK_IMG}
                        alt={f.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-brand-dark shadow-sm">
                        {f.region}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-neon-blue px-3 py-1 rounded-full text-xs font-black text-white shadow-sm">
                        {f.tag}
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 transition-colors mb-1 group-hover:text-brand-dark">
                      {f.title}
                    </h4>
                    <p className="text-slate-500 font-bold text-sm flex items-center gap-1">
                      📅 {f.date}
                    </p>
                  </Link>
                ))}
                {filteredFestivals.length === 0 && (
                  <div className="md:col-span-2 py-16 text-center text-slate-400 font-medium bg-slate-50 rounded-[1.75rem] border-2 border-dashed border-slate-200">
                    해당 지역의 예정된 행사가 없습니다.
                  </div>
                )}
              </div>
            </section>

            {/* 혜택/지원금 (1/3) */}
            <aside className="space-y-6">
              <SectionHeading title="내 돈 찾는 지원금" accentColor="#33FF99" moreHref="/benefits/" />

              <div className="flex gap-2 px-2 overflow-x-auto pb-1 scrollbar-hide">
                {["전체 보기", "주거/임대 지원"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setBenefitFilter(tab)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      benefitFilter === tab
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
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
                    className={`group block p-4 rounded-[1.75rem] border transition-all duration-300 hover:-translate-y-0.5 ${
                      b.isEmergency
                        ? "border-rose-100 bg-rose-50/50 hover:border-rose-300 hover:shadow-[0_4px_16px_rgba(244,63,94,0.12)]"
                        : "border-slate-100 bg-white hover:border-brand/40 hover:shadow-[0_4px_16px_rgba(0,204,255,0.12)]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        b.isEmergency ? "bg-rose-500 text-white" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        💡 {b.region}
                      </span>
                      <span className={`text-xs font-bold ${b.isEmergency ? "text-rose-600" : "text-slate-400"}`}>
                        {b.deadline}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mb-0.5 leading-snug group-hover:text-brand-dark transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-slate-500 text-xs font-bold line-clamp-1">{b.target}</p>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>

        {/* ── 팁픽 가이드 (블로그) — 보조 콘텐츠 ── */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                💡 팁픽 가이드
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                팁픽(Tip-Pick) 가이드
              </h3>
            </div>
            <Link href="/blog/" className="text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
              전체 보기 →
            </Link>
          </div>

          <div className="space-y-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}/`}
                className="group flex items-stretch bg-white rounded-[1.75rem] overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_4px_20px_rgba(0,204,255,0.10)] transition-all duration-300"
              >
                <div className="relative w-32 shrink-0 overflow-hidden bg-slate-100">
                  <img
                    src={post.image || FALLBACK_IMG}
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
                  />
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black text-brand-dark shadow border border-white/50 tracking-wider">
                    {({ festival: '축제', benefit: '지원금', benefits: '지원금', election: '선거', info: '정보' } as Record<string, string>)[post.category ?? ''] ?? post.category}
                  </div>
                </div>

                <div className="flex-1 px-5 py-4 flex flex-col justify-center gap-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span>💡 팁픽 큐레이션</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 group-hover:text-brand-dark transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-1">
                    {post.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {post.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="text-[9px] bg-cyan-50 text-brand-dark px-2 py-0.5 rounded-md">
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
        <AdFit width="320" height="100" />
      </main>

      <Footer />
    </div>
  );
}
