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
import { TOPICS } from "@/lib/topics";
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
const KAKAO_OPENCHAT_URL = "https://open.kakao.com/o/gdb5gJsi"; // 카카오 오픈채팅: 팁픽 | 정부 지원금·경제·생활정보

export default function HomeClient({ data, posts, todayUpdates, bannerConfig }: { data: Data, posts: PostData[], todayUpdates?: TodayUpdates, bannerConfig?: { isActive: boolean; imageUrl: string; linkUrl: string } }) {
  // KST 기준 오늘 날짜
  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/tools/salary/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">💸 연봉 실수령액 계산기</Link>
            <Link href="/tools/unemployment-benefit/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">📋 실업급여 계산기</Link>
            <Link href="/tools/retirement-pay/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">💼 퇴직금 계산기</Link>
            <Link href="/tools/income-tax/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">🧾 종합소득세 계산기</Link>
            <Link href="/tools/car-tax/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">🚗 자동차세 계산기</Link>
            <Link href="/tools/insurance/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">🛡️ 4대보험 계산기</Link>
            <Link href="/tools/loan/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">🏦 대출 이자 계산기</Link>
            <Link href="/tools/median-income/" className="bg-white rounded-xl border border-slate-100 px-5 py-4 font-bold text-slate-800 hover:border-brand hover:text-brand-dark transition-colors flex items-center gap-2">📊 기준 중위소득 계산기</Link>
          </div>
        </section>

        {/* ── 주제별 모아보기 (2026-08-06 신설 — 홈에서 토픽 허브로 링크를 뿌린다) ── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">📚 주제별로 모아보기</h2>
            <Link href="/topics/" className="text-sm font-bold text-brand-dark hover:text-brand transition-colors">전체 보기 →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}/`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand-dark transition-colors"
              >
                {t.keyword}
              </Link>
            ))}
          </div>
        </section>

        {/* ── 팁픽 가이드 (에버그린) — GuideCard 공용 카드 ── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">📘 깊이 있는 금융·생활 가이드</h2>
            <Link href="/guides/" className="text-sm font-bold text-brand-dark hover:text-brand transition-colors">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {GUIDES.slice(0, 6).map((g) => (
              <GuideCard key={g.slug} {...g} />
            ))}
          </div>
        </section>

        {/* ── 탐색: 지역 필터 + 축제 (전국 나들이 카테고리 공개 시에만 노출) ── */}

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

        {/* ── 카카오톡 오픈채팅 CTA ── */}
        <section>
          <a
            href={KAKAO_OPENCHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[1.75rem] border border-[#FEE500] bg-gradient-to-r from-[#FEE500]/40 to-[#FEE500]/10 px-6 py-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(254,229,0,0.30)]"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FEE500] text-2xl">💬</span>
              <div>
                <p className="text-lg md:text-xl font-black text-slate-900">새 글·지원금 소식, 카톡으로 가장 먼저</p>
                <p className="mt-0.5 text-sm text-slate-600">지원금·경제·계산기 업데이트를 오픈채팅으로 받아보세요</p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#3C1E1E] px-5 py-2.5 text-sm font-black text-[#FEE500] transition-colors group-hover:bg-black">
              카카오톡 오픈채팅 입장 →
            </span>
          </a>
        </section>

        {/* Ad Banner */}
        <AdBanner />
        <AdFit width="320" height="100" />
      </main>

      <Footer />
    </div>
  );
}
