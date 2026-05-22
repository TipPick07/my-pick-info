"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoupangBanner from "./CoupangBanner";

interface Benefit {
  id: string;
  region: string;
  title: string;
  target: string;
  deadline: string;
  isEmergency: boolean;
}

function parseStartDate(deadline: string): Date | null {
  if (!deadline) return null;
  const matches = [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (matches.length === 0) return null;
  const first = matches[0];
  return new Date(parseInt(first[1]), parseInt(first[2]) - 1, parseInt(first[3]));
}

function parseEndDate(deadline: string): Date | null {
  if (!deadline) return null;
  const matches = [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  return new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
}

function calcDDay(deadline: string, today: Date): number | null {
  const end = parseEndDate(deadline);
  if (!end) return null;
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isBenefitOngoing(deadline: string, today: Date): boolean {
  const matches = deadline ? [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)] : [];
  if (matches.length === 0) return true; // 상시
  const start = parseStartDate(deadline);
  const end = parseEndDate(deadline);
  return (!start || start <= today) && (!end || end >= today);
}

function sortByDeadline(list: Benefit[], today: Date): Benefit[] {
  return [...list].sort((a, b) => {
    const aOngoing = isBenefitOngoing(a.deadline, today);
    const bOngoing = isBenefitOngoing(b.deadline, today);
    if (aOngoing && !bOngoing) return -1;
    if (!aOngoing && bOngoing) return 1;
    const aEnd = parseEndDate(a.deadline);
    const bEnd = parseEndDate(b.deadline);
    return (aEnd ? aEnd.getTime() : Infinity) - (bEnd ? bEnd.getTime() : Infinity);
  });
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

export default function DeadlineClient({ items }: { items: Benefit[] }) {
  const [filter, setFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const regions = ["전체", "서울", "인천", "경기"];

  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

  const filtered = items.filter((b) =>
    filter === "전체" || b.region === filter || b.region === "전국"
  );

  const sorted = sortByDeadline(filtered, todayKST);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (r: string) => {
    setFilter(r);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-100">
      <Header />

      <main className="container mx-auto px-6 py-10 space-y-8 max-w-3xl">

        {/* ── Hero ── */}
        <section className="text-center space-y-5 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-widest rounded-full border border-rose-200">
            🚨 마감 임박 지원금
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            놓치면 끝!{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
              D-30 이내 혜택
            </span>
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
            신청 기간이 30일 이내로 남은 혜택만 모았어요.{" "}
            <span className="font-black text-slate-700">지금 바로 확인하고 챙기세요!</span>
          </p>

          {/* 지역 필터 탭 */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => handleFilterChange(r)}
                className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${filter === r
                  ? "text-white shadow-[0_4px_20px_rgba(244,63,94,0.4)]"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50"
                }`}
                style={filter === r ? { background: "linear-gradient(to right, #f43f5e, #fb923c)" } : {}}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* ── 리스트 ── */}
        <section className="space-y-2.5">
          {sorted.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border-2 border-dashed border-slate-200">
              현재 마감 임박 지원금이 없습니다.
            </div>
          )}

          {paginated.map((b) => {
            const dday = calcDDay(b.deadline, todayKST);
            const isLocalMatch = filter !== "전체" && b.region === filter;

            return (
              <Link
                key={b.id}
                href={`/benefit/${b.id}/`}
                className="group flex items-stretch bg-white rounded-2xl overflow-hidden border border-rose-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(244,63,94,0.15)] hover:border-rose-300"
              >
                {/* 왼쪽 강조 선 */}
                <div className="w-1 shrink-0 bg-rose-500" />

                {/* 카드 본문 */}
                <div className="flex items-center gap-4 flex-1 px-5 py-4 bg-rose-50/20">

                  {/* 좌: D-Day 배지 */}
                  <div className="shrink-0 w-20 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full text-center w-full bg-rose-500 text-white">
                      마감임박
                    </span>
                    {dday !== null && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse w-full text-center">
                        {dday === 0 ? "D-DAY" : `D-${dday}`}
                      </span>
                    )}
                  </div>

                  {/* 중: 제목 + 요약 */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="font-black leading-snug line-clamp-2 text-sm md:text-base text-slate-900 group-hover:text-rose-600 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-slate-500 text-xs line-clamp-1 font-medium">
                      {b.target}
                    </p>
                  </div>

                  {/* 우: 지역 + 마감일 */}
                  <div className="shrink-0 text-right space-y-1 min-w-[72px]">
                    <span
                      className={`block text-[10px] font-black px-2 py-0.5 rounded-full text-center ${isLocalMatch
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isLocalMatch && "📍 "}
                      {b.region}
                    </span>
                    <span className="block text-[10px] font-bold text-rose-600">
                      {b.deadline}
                    </span>
                  </div>

                  {/* 화살표 */}
                  <div className="shrink-0 text-sm text-slate-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all">
                    →
                  </div>
                </div>
              </Link>
            );
          })}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full text-sm font-bold border border-slate-200 bg-white disabled:opacity-30 hover:border-rose-300 transition-colors"
              >
                ← 이전
              </button>
              {getPaginationRange(currentPage, totalPages).map((p, idx) =>
                p === '...'
                  ? <span key={`e${idx}`} className="text-slate-400 px-1">···</span>
                  : <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${currentPage === p ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300"}`}
                    style={currentPage === p ? { background: "linear-gradient(to right, #f43f5e, #fb923c)" } : {}}
                  >
                    {p}
                  </button>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full text-sm font-bold border border-slate-200 bg-white disabled:opacity-30 hover:border-rose-300 transition-colors"
              >
                다음 →
              </button>
            </div>
          )}
        </section>

        <CoupangBanner />
      </main>

      <Footer />
    </div>
  );
}
