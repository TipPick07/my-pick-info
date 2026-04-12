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

interface Data {
  benefits: Benefit[];
}

// deadline 문자열에서 마지막 날짜 파싱
function parseDeadlineDate(deadline: string): Date | null {
  if (!deadline) return null;
  const matches = [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  return new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
}

// D-Day 숫자 계산 (오늘 기준, 음수=만료)
function calcDDay(deadline: string): number | null {
  const date = parseDeadlineDate(deadline);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// 항목 상태 결정
type Status = "urgent" | "active" | "always";
function getStatus(b: Benefit): Status {
  if (b.isEmergency) return "urgent";
  const d = calcDDay(b.deadline);
  if (d !== null && d >= 0 && d <= 7) return "urgent";
  if (!b.deadline || b.deadline.includes("상시") || b.deadline.includes("매년") || b.deadline.includes("별도")) return "always";
  return "active";
}

// D-Day 라벨 텍스트
function getDDayLabel(deadline: string): string | null {
  const d = calcDDay(deadline);
  if (d === null) return null;
  if (d < 0) return "마감";
  if (d === 0) return "D-DAY";
  if (d <= 7) return `D-${d}`;
  return null;
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

export default function BenefitsClient({ data }: { data: Data }) {
  const [filter, setFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const regions = ["전체", "서울", "인천", "경기"];

  // 필터링
  const filtered =
    filter === "전체"
      ? data.benefits
      : data.benefits.filter((b) => b.region === filter || b.region === "전국");

  // 정렬: urgent 먼저 → 날짜 빠른 순 → 나머지
  const sorted = [...filtered].sort((a, b) => {
    const as = getStatus(a);
    const bs = getStatus(b);
    if (as === "urgent" && bs !== "urgent") return -1;
    if (as !== "urgent" && bs === "urgent") return 1;
    const ad = parseDeadlineDate(a.deadline);
    const bd = parseDeadlineDate(b.deadline);
    if (ad && bd) return ad.getTime() - bd.getTime();
    if (ad) return -1;
    if (bd) return 1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const urgentCount = sorted.filter((b) => getStatus(b) === "urgent").length;

  const handleFilterChange = (r: string) => {
    setFilter(r);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-10 space-y-8 max-w-3xl">

        {/* ── Hero ── */}
        <section className="text-center space-y-5 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-200">
            💡 내 돈 찾는 지원금
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            오늘 팁픽이 골라낸{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
              지원금/혜택
            </span>
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
            복잡한 공공데이터 속에서 당신에게 꼭 필요한 지원금을 팁픽이 대신 선별했습니다.{" "}
            <span className="font-black text-slate-700">지금 바로 확인해 보세요!</span>
          </p>

          {/* 긴급 카운터 배너 */}
          {urgentCount > 0 && (
            <div className="inline-flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-2.5 rounded-2xl text-sm font-black shadow-sm">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
              지금 이 순간,{" "}
              <span className="text-rose-600 underline underline-offset-2">
                {urgentCount}건의 혜택
              </span>
              이 마감을 앞두고 있습니다.
            </div>
          )}

          {/* 지역 필터 */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => handleFilterChange(r)}
                className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${filter === r
                    ? "text-white shadow-[0_4px_20px_rgba(6,182,212,0.4)]"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50"
                  }`}
                style={
                  filter === r
                    ? { background: "linear-gradient(to right, #00CCFF, #33FF99)" }
                    : {}
                }
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* ── 리스트 ── */}
        <section className="space-y-2.5">
          {paginated.length === 0 && sorted.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border-2 border-dashed border-slate-200">
              해당 지역의 예정된 혜택이 없습니다.
            </div>
          )}

          {paginated.map((b) => {
            const status = getStatus(b);
            const ddayLabel = getDDayLabel(b.deadline);
            const isUrgent = status === "urgent";
            const isAlways = status === "always";
            // 필터 지역과 정확히 일치하는 항목 (전국 제외) 하이라이트
            const isLocalMatch = filter !== "전체" && b.region === filter;

            return (
              <Link
                key={b.id}
                href={`/benefit/${b.id}`}
                className={`group flex items-stretch bg-white rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 ${isUrgent
                    ? "border-rose-200 hover:shadow-[0_4px_20px_rgba(244,63,94,0.15)] hover:border-rose-300"
                    : isLocalMatch
                      ? "border-cyan-200 hover:shadow-[0_4px_20px_rgba(0,204,255,0.12)] hover:border-cyan-300"
                      : "border-slate-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-slate-200"
                  }`}
              >
                {/* 왼쪽 강조 선 */}
                <div
                  className={`w-1 shrink-0 ${isUrgent
                      ? "bg-rose-500"
                      : isAlways
                        ? "bg-cyan-400"
                        : "bg-emerald-400"
                    }`}
                />

                {/* 카드 본문 */}
                <div className={`flex items-center gap-4 flex-1 px-5 py-4 ${isUrgent ? "bg-rose-50/20" : isLocalMatch ? "bg-cyan-50/20" : ""}`}>

                  {/* 좌: 상태 배지 */}
                  <div className="shrink-0 w-20 flex flex-col items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full text-center w-full ${isUrgent
                          ? "bg-rose-500 text-white"
                          : isAlways
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                    >
                      {isUrgent ? "마감임박" : isAlways ? "상시" : "모집중"}
                    </span>

                    {/* D-Day 배지 (7일 이내만) */}
                    {ddayLabel && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse w-full text-center">
                        {ddayLabel}
                      </span>
                    )}
                  </div>

                  {/* 중: 제목 + 요약 */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className={`font-black leading-snug line-clamp-2 text-sm md:text-base transition-colors ${isUrgent ? "text-slate-900 group-hover:text-rose-600" : "text-slate-900 group-hover:text-cyan-600"
                      }`}>
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
                          ? "bg-cyan-100 text-cyan-700"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {isLocalMatch && "📍 "}
                      {b.region}
                    </span>
                    <span
                      className={`block text-[10px] font-bold ${isUrgent ? "text-rose-600" : "text-slate-400"
                        }`}
                    >
                      {b.deadline}
                    </span>
                  </div>

                  {/* 화살표 */}
                  <div className="shrink-0 text-slate-300 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all text-sm">
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
                className="px-4 py-2 rounded-full text-sm font-bold border border-slate-200 bg-white disabled:opacity-30 hover:border-cyan-300 transition-colors"
              >
                ← 이전
              </button>
              {getPaginationRange(currentPage, totalPages).map((p, idx) =>
                p === '...'
                  ? <span key={`e${idx}`} className="text-slate-400 px-1">···</span>
                  : <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${currentPage === p ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-cyan-300"
                      }`}
                    style={currentPage === p ? { background: "linear-gradient(to right, #00CCFF, #33FF99)" } : {}}
                  >
                    {p}
                  </button>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full text-sm font-bold border border-slate-200 bg-white disabled:opacity-30 hover:border-cyan-300 transition-colors"
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
