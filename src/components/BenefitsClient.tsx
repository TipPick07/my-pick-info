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

// ── 날짜 파싱 유틸 ────────────────────────────────────────────────────────────
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

function isBenefitAlways(deadline: string): boolean {
  if (!deadline) return true;
  return !/\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2}/.test(deadline);
}

type BenefitStatus = "상시" | "모집중" | "마감";

function getBenefitStatus(deadline: string, today: Date): BenefitStatus {
  if (isBenefitAlways(deadline)) return "상시";
  const end = parseEndDate(deadline);
  if (end && end < today) return "마감";
  return "모집중";
}

// D-Day 숫자 계산
function calcDDay(deadline: string, today: Date): number | null {
  const end = parseEndDate(deadline);
  if (!end) return null;
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isBenefitOngoing(deadline: string, today: Date): boolean {
  if (isBenefitAlways(deadline)) return true;
  const start = parseStartDate(deadline);
  const end = parseEndDate(deadline);
  return (!start || start <= today) && (!end || end >= today);
}

function sortBenefits(list: Benefit[], today: Date): Benefit[] {
  const getOrder = (deadline: string) => {
    if (getBenefitStatus(deadline, today) === "마감") return 2;
    if (isBenefitOngoing(deadline, today)) return 0;
    return 1;
  };
  return [...list].sort((a, b) => {
    const aOrder = getOrder(a.deadline);
    const bOrder = getOrder(b.deadline);
    if (aOrder !== bOrder) return aOrder - bOrder;
    const aEnd = parseEndDate(a.deadline);
    const bEnd = parseEndDate(b.deadline);
    return (aEnd ? aEnd.getTime() : Infinity) - (bEnd ? bEnd.getTime() : Infinity);
  });
}
// ─────────────────────────────────────────────────────────────────────────────

type StatusFilter = "전체" | "상시" | "모집중" | "마감";

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const regions = ["전체", "서울", "인천", "경기"];
  const STATUS_OPTIONS: StatusFilter[] = ["전체", "상시", "모집중", "마감"];

  // KST 기준 오늘 날짜
  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

  // 지역 + 진행 상태 AND 필터
  const filtered = data.benefits.filter((b) => {
    const regionOk = filter === "전체" || b.region === filter || b.region === "전국";
    const statusOk = statusFilter === "전체" || getBenefitStatus(b.deadline, todayKST) === statusFilter;
    return regionOk && statusOk;
  });

  const sorted = sortBenefits(filtered, todayKST);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // 마감 임박 카운트 (모집중 + D-Day 7일 이내 또는 isEmergency)
  const urgentCount = data.benefits.filter((b) => {
    if (getBenefitStatus(b.deadline, todayKST) === "마감") return false;
    if (b.isEmergency) return true;
    const d = calcDDay(b.deadline, todayKST);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  const handleFilterChange = (r: string) => {
    setFilter(r);
    setCurrentPage(1);
  };

  const handleStatusChange = (s: StatusFilter) => {
    setStatusFilter(s);
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

          {/* 지역 필터 + 진행 상태 드롭다운 */}
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

            {/* 진행 상태 드롭다운 */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-full text-sm font-bold bg-white text-slate-600 border border-slate-200/50 hover:bg-slate-100 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-200"
                style={statusFilter !== "전체" ? { borderColor: "#00CCFF", color: "#00AACC" } : {}}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === "전체" ? "진행 상태" : s}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
            </div>
          </div>
        </section>

        {/* ── 리스트 ── */}
        <section className="space-y-2.5">
          {sorted.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border-2 border-dashed border-slate-200">
              {statusFilter !== "전체"
                ? `${filter === "전체" ? "수도권" : filter} 지역의 '${statusFilter}' 지원금이 없습니다.`
                : "해당 지역의 예정된 혜택이 없습니다."}
            </div>
          )}

          {paginated.map((b) => {
            const benefitStatus = getBenefitStatus(b.deadline, todayKST);
            const isExpired = benefitStatus === "마감";
            const isAlways = benefitStatus === "상시";
            const dday = calcDDay(b.deadline, todayKST);
            const isUrgent = !isExpired && (b.isEmergency || (dday !== null && dday >= 0 && dday <= 7));
            const isLocalMatch = filter !== "전체" && b.region === filter;

            const cardContent = (
              <>
                {/* 왼쪽 강조 선 */}
                <div
                  className={`w-1 shrink-0 ${isExpired
                    ? "bg-slate-300"
                    : isUrgent
                      ? "bg-rose-500"
                      : isAlways
                        ? "bg-cyan-400"
                        : "bg-emerald-400"
                    }`}
                />

                {/* 카드 본문 */}
                <div className={`flex items-center gap-4 flex-1 px-5 py-4 ${isUrgent && !isExpired ? "bg-rose-50/20" : isLocalMatch && !isExpired ? "bg-cyan-50/20" : ""}`}>

                  {/* 좌: 상태 배지 */}
                  <div className="shrink-0 w-20 flex flex-col items-center gap-1.5">
                    {isExpired ? (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full text-center w-full bg-slate-500 text-white">
                        종료
                      </span>
                    ) : (
                      <>
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
                        {dday !== null && dday >= 0 && dday <= 7 && (
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse w-full text-center">
                            {dday === 0 ? "D-DAY" : `D-${dday}`}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* 중: 제목 + 요약 */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className={`font-black leading-snug line-clamp-2 text-sm md:text-base transition-colors ${isExpired
                        ? "text-slate-400"
                        : isUrgent
                          ? "text-slate-900 group-hover:text-rose-600"
                          : "text-slate-900 group-hover:text-cyan-600"
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
                      className={`block text-[10px] font-bold ${isExpired ? "text-slate-400" : isUrgent ? "text-rose-600" : "text-slate-400"}`}
                    >
                      {b.deadline}
                    </span>
                  </div>

                  {/* 화살표 */}
                  <div className={`shrink-0 text-sm transition-all ${isExpired ? "text-slate-200" : "text-slate-300 group-hover:text-cyan-400 group-hover:translate-x-0.5"}`}>
                    →
                  </div>
                </div>
              </>
            );

            if (isExpired) {
              return (
                <div
                  key={b.id}
                  className="flex items-stretch bg-white rounded-2xl overflow-hidden border border-slate-100 opacity-50 cursor-not-allowed select-none"
                >
                  {cardContent}
                </div>
              );
            }

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
                {cardContent}
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
