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
import GuideCard from "@/components/GuideCard";
import { GUIDES } from "@/lib/guides";
import { visibleCategories, isCategoryLive } from "@/config/categories";
import PostRow from "@/components/PostRow";

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

  // KST 기준 오늘 날짜
  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

  // ── 탐색(브라우즈)용 — 지역/카테고리 필터 적용 ──
  const filteredFestivals = sortFestivals(
    (filter === "전체" ? data.festivals : data.festivals.filter(f => f.region === filter))
      .filter((f: Festival) => !isFestivalExpired(f.date, todayKST)),
    todayKST
  );

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
              복잡한 정보,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                꼭 필요한 것만
              </span>
              {" "}골라드려요
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              정부 지원금부터 경제·세금, 실생활 계산기까지 — 돈 되는 정보를 비전문가 눈높이로 정리합니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button href="/benefits/" variant="primary" className="text-base md:text-lg px-9 py-4">
                🏛️ 정부 지원금 보기
              </Button>
              <Button href="/tools/" variant="secondary" className="text-base md:text-lg px-9 py-4">
                🧮 실생활 계산기
              </Button>
            </div>
            {todayUpdates?.date && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-brand-dark px-3.5 py-1.5 rounded-full text-xs font-bold">
                  📅 최근 업데이트 {todayUpdates.date.replace(/-/g, '.')}
                </span>
              </div>
            )}
          </div>
        </section>

        <CustomBanner config={bannerConfig} />

        {/* ── 카테고리 바로가기 (잡블로그 IA, 승인 모드 반영) ── */}
        <section className="space-y-5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight px-1">무엇을 찾고 계세요?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visibleCategories().map((c) => (
              <Link
                key={c.key}
                href={c.href}
                className="group bg-white rounded-2xl border border-slate-100 p-5 hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-300"
                style={{ borderTopWidth: 3, borderTopColor: c.accent }}
              >
                <div className="text-3xl mb-2">{c.emoji}</div>
                <p className="font-black text-slate-900 text-base group-hover:text-brand-dark transition-colors">{c.label}</p>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{c.short}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 실생활 계산기 바로가기 (체류시간·고단가) ── */}
        <section className="bg-gradient-to-br from-slate-50 to-cyan-50/40 rounded-[1.75rem] border border-slate-100 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">🧮 실생활 계산기</h2>
            <Link href="/tools/" className="text-sm font-bold text-brand-dark hover:text-brand transition-colors">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/tools/salary/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">💸 연봉 실수령액 계산기</Link>
            <Link href="/tools/loan/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">🏦 대출 이자 계산기</Link>
          </div>
        </section>

        {/* ── 팁픽 가이드 (에버그린) — GuideCard 공용 카드 ── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">📘 깊이 있는 금융·생활 가이드</h2>
            <Link href="/guides/" className="text-sm font-bold text-brand-dark hover:text-brand transition-colors">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {GUIDES.map((g) => (
              <GuideCard key={g.slug} {...g} />
            ))}
          </div>
        </section>

        {/* ── 탐색: 지역 필터 + 축제 (전국 나들이 카테고리 공개 시에만 노출) ── */}
        {isCategoryLive("festivals") && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[1.75rem] border border-slate-100 shadow-sm px-6 py-5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-black text-slate-900">📍 지역별 축제</span>
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

          <section className="space-y-6">
            <SectionHeading title="주목할 만한 축제/행사" accentColor="#00CCFF" moreHref="/festivals/" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              {filteredFestivals.slice(0, 6).map((f) => (
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
                <div className="md:col-span-3 py-16 text-center text-slate-400 font-medium bg-slate-50 rounded-[1.75rem] border-2 border-dashed border-slate-200">
                  해당 지역의 예정된 행사가 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
        )}

        {/* ── 최신 글 (경제·지원금 통합 피드, 카테고리 배지로 구분) ── */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">📝 최신 글</h2>
            <Link href="/blog/" className="text-sm font-bold text-brand-dark hover:text-brand transition-colors">전체 보기 →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
          {posts.length === 0 && (
            <div className="py-16 text-center space-y-4">
              <div className="text-5xl text-slate-200">💡</div>
              <p className="text-slate-400">아직 등록된 글이 없습니다.</p>
            </div>
          )}
        </section>

        {/* Ad Banner */}
        <AdBanner />
        <AdFit width="320" height="100" />
      </main>

      <Footer />
    </div>
  );
}
