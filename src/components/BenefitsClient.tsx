"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Benefit {
  id: string;
  region: string;
  title: string;
  target: string;
  deadline: string;
  isEmergency: boolean;
  addedAt?: string;
  highlight?: string;
  details?: string;
  simulation?: string;
  detailedExplanation?: string;
}

interface Data {
  benefits: Benefit[];
}

// ── 날짜 파싱 유틸 ────────────────────────────────────────────────────────────
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

// 등록일 추출: addedAt 우선, 없으면 id에 박힌 13자리 ms 타임스탬프로 폴백
function getAddedDate(b: Benefit): Date | null {
  if (b.addedAt) {
    const m = b.addedAt.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
    if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  // 'fixed-' 는 수기 교정 배치 id라 발견 시점이 아님 → 폴백 제외
  if (!(b.id || '').startsWith('fixed-')) {
    const ts = (b.id || '').match(/(\d{13})/);
    if (ts) {
      const d = new Date(parseInt(ts[1]));
      if (!isNaN(d.getTime()) && d.getFullYear() >= 2024 && d.getFullYear() <= 2100) return d;
    }
  }
  return null;
}

// 신규 여부: 등록 7일 이내
function isBenefitNew(b: Benefit, today: Date): boolean {
  const added = getAddedDate(b);
  if (!added) return false;
  const days = (today.getTime() - added.getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 7;
}

// 마감 임박 여부: 실제 마감일(D-Day 0~30) 기준 — stale isEmergency로 상시 항목이 잡히지 않게 통일
function isBenefitUrgent(deadline: string, today: Date): boolean {
  if (getBenefitStatus(deadline, today) !== "모집중") return false;
  const d = calcDDay(deadline, today);
  return d !== null && d >= 0 && d <= 30;
}

// ── 금액 추출 유틸 ────────────────────────────────────────────────────────────
// highlight 필드 우선, 없으면 본문에서 "최대 ◯◯만원" 류를 추출해 카드 강조에 사용
function extractAmount(b: Benefit): string | null {
  if (b.highlight && b.highlight.trim()) return b.highlight.trim();
  const sources = [b.title, b.simulation, b.details, b.detailedExplanation];
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  // 1순위: "최대 …원" (월/억/천만 단위 허용)
  for (const src of sources) {
    if (!src) continue;
    const m = src.match(/최대\s*(?:월\s*)?[\d,]+\s*(?:억\s*)?(?:[\d,]+\s*)?(?:천\s*)?만?\s*원/);
    if (m) return clean(m[0]);
  }
  // 2순위: "월 …만원"
  for (const src of sources) {
    if (!src) continue;
    const m = src.match(/월\s*[\d,]+\s*만\s*원/);
    if (m) return clean(m[0]);
  }
  // 3순위: 일반 "…만원" / "…억"
  for (const src of sources) {
    if (!src) continue;
    const m = src.match(/[\d,]+\s*(?:억\s*)?(?:[\d,]+\s*)?(?:천\s*)?만\s*원/);
    if (m) return clean(m[0]);
  }
  return null;
}

// 정렬용 금액 수치화 (억/만/천만 합산)
function amountValue(b: Benefit): number {
  const s = extractAmount(b);
  if (!s) return 0;
  let val = 0;
  const eok = s.match(/([\d,]+)\s*억/);
  if (eok) val += parseInt(eok[1].replace(/,/g, ""), 10) * 1e8;
  const cheonman = s.match(/([\d,]+)\s*천\s*만/);
  if (cheonman) val += parseInt(cheonman[1].replace(/,/g, ""), 10) * 1e7;
  // 단순 "…만원" 케이스 (억/천만 미포함)
  if (!eok && !cheonman) {
    const m = s.match(/([\d,]+)\s*만\s*원/);
    if (m) val += parseInt(m[1].replace(/,/g, ""), 10) * 1e4;
    else {
      const won = s.match(/([\d,]+)\s*원/);
      if (won) val += parseInt(won[1].replace(/,/g, ""), 10);
    }
  }
  return val;
}

// ── 정렬 ──────────────────────────────────────────────────────────────────────
type SortKey = "마감임박순" | "최신등록순" | "금액높은순";
const SORT_OPTIONS: SortKey[] = ["마감임박순", "최신등록순", "금액높은순"];

// 정렬용 마감 버킷: 0 = 마감일 있는 진행 항목, 1 = 상시(마감일 없음), 2 = 마감(종료)
// ※ 배지(getBenefitStatus)·D-Day와 동일하게 '마감일(end)' 기준만 사용.
//    단일 날짜 공고(예: 2026.06.30)를 시작일로 오판해 '미시작'으로 빠지는 문제를 막기 위해
//    시작일 비교(isBenefitOngoing)는 정렬에 쓰지 않는다.
function deadlineBucket(deadline: string, today: Date): number {
  if (isBenefitAlways(deadline)) return 1;
  const end = parseEndDate(deadline);
  if (end && end < today) return 2;
  return 0;
}

function sortBenefits(list: Benefit[], today: Date, sortKey: SortKey): Benefit[] {
  const arr = [...list];
  // 종료(마감) 항목은 어떤 정렬에서도 항상 맨 뒤
  const expiredRank = (deadline: string) => (deadlineBucket(deadline, today) === 2 ? 1 : 0);

  if (sortKey === "최신등록순") {
    return arr.sort((a, b) => {
      const e = expiredRank(a.deadline) - expiredRank(b.deadline);
      if (e !== 0) return e;
      const ad = getAddedDate(a)?.getTime() ?? -Infinity;
      const bd = getAddedDate(b)?.getTime() ?? -Infinity;
      return bd - ad;
    });
  }
  if (sortKey === "금액높은순") {
    return arr.sort((a, b) => {
      const e = expiredRank(a.deadline) - expiredRank(b.deadline);
      if (e !== 0) return e;
      return amountValue(b) - amountValue(a);
    });
  }
  // 마감임박순 (기본): 마감일 있는 진행 항목(가까운 순) → 상시 → 종료
  return arr.sort((a, b) => {
    const ba = deadlineBucket(a.deadline, today);
    const bb = deadlineBucket(b.deadline, today);
    if (ba !== bb) return ba - bb;
    const aEnd = parseEndDate(a.deadline);
    const bEnd = parseEndDate(b.deadline);
    return (aEnd ? aEnd.getTime() : Infinity) - (bEnd ? bEnd.getTime() : Infinity);
  });
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const [sortKey, setSortKey] = useState<SortKey>("마감임박순");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const p = parseInt(new URLSearchParams(window.location.search).get('page') ?? '1', 10);
    if (!isNaN(p) && p > 1) setCurrentPage(p);
  }, []);

  const changePage = (p: number) => {
    setCurrentPage(p);
    const url = p === 1 ? window.location.pathname : `${window.location.pathname}?page=${p}`;
    window.history.replaceState(null, '', url);
  };
  const regions = ["전체", "서울", "인천", "경기"];

  // KST 기준 오늘 날짜
  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

  // 지역 필터
  const filtered = data.benefits.filter((b) => {
    return filter === "전체" || b.region === filter || b.region === "전국";
  });

  const sorted = sortBenefits(filtered, todayKST, sortKey);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // 마감 임박 카운트 — 실제 마감일(D-Day 0~30) 기준. 상시 항목은 제외(불일치 방지)
  const urgentCount = data.benefits.filter((b) => isBenefitUrgent(b.deadline, todayKST)).length;

  const handleFilterChange = (r: string) => {
    setFilter(r);
    changePage(1);
  };

  const handleSortChange = (s: SortKey) => {
    setSortKey(s);
    changePage(1);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="max-w-5xl mx-auto w-full px-4 py-10 space-y-8">

        {/* ── Hero ── */}
        <section className="text-center space-y-5 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-200">
            💡 내 돈 찾는 지원금
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            오늘 팁픽이 골라낸{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
              지원금/혜택
            </span>
          </h1>
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
        </section>

        {/* ── 필터 바: 지역 탭 + 정렬 드롭다운 ── */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => handleFilterChange(r)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${filter === r
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">총 {sorted.length}건</span>
            <div className="relative">
              <select
                value={sortKey}
                onChange={(e) => handleSortChange(e.target.value as SortKey)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-full text-sm font-bold bg-white text-slate-600 border border-slate-200/50 hover:bg-slate-100 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-200"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
            </div>
          </div>
        </section>

        {/* ── 카드 그리드 ── */}
        <section>
          {sorted.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border-2 border-dashed border-slate-200">
              해당 지역의 예정된 혜택이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginated.map((b) => {
                const benefitStatus = getBenefitStatus(b.deadline, todayKST);
                const isExpired = benefitStatus === "마감";
                const isAlways = benefitStatus === "상시";
                const dday = calcDDay(b.deadline, todayKST);
                const isUrgent = isBenefitUrgent(b.deadline, todayKST);
                const isNew = !isExpired && !isUrgent && isBenefitNew(b, todayKST);
                const isLocalMatch = filter !== "전체" && b.region === filter;
                const amount = extractAmount(b);
                const cleanTitle = b.title.replace(/^\[[^\]]*\]\s*/, "");

                const cardInner = (
                  <>
                    {/* 상단: 상태 배지 + 지역 */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isExpired ? (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-500 text-white">
                            종료
                          </span>
                        ) : (
                          <>
                            <span
                              className={`text-[10px] font-black px-2.5 py-1 rounded-full ${isUrgent
                                  ? "bg-rose-500 text-white"
                                  : isAlways
                                    ? "bg-cyan-100 text-cyan-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                            >
                              {isUrgent ? "마감임박" : isAlways ? "상시" : "모집중"}
                            </span>
                            {isNew && (
                              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-indigo-500 text-white">
                                NEW
                              </span>
                            )}
                            {dday !== null && dday >= 0 && dday <= 30 && (
                              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-rose-600 text-white animate-pulse">
                                {dday === 0 ? "D-DAY" : `D-${dday}`}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${isLocalMatch
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-slate-100 text-slate-500"
                          }`}
                      >
                        {isLocalMatch && "📍 "}
                        {b.region}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className={`font-black leading-snug line-clamp-2 text-base md:text-lg transition-colors ${isExpired
                        ? "text-slate-400"
                        : isUrgent
                          ? "text-slate-900 group-hover:text-rose-600"
                          : "text-slate-900 group-hover:text-emerald-600"
                      }`}>
                      {cleanTitle}
                    </h3>

                    {/* 금액 강조 */}
                    {amount && (
                      <div className={`mt-3 inline-flex items-center gap-1.5 text-sm font-black ${isExpired ? "text-slate-400" : "text-emerald-600"}`}>
                        💰 {amount}
                      </div>
                    )}

                    {/* 대상 */}
                    {b.target && (
                      <p className="mt-2 text-sm text-slate-500 font-medium line-clamp-2">
                        {b.target}
                      </p>
                    )}

                    {/* 하단: 마감일 + CTA */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className={`text-xs font-bold ${isExpired ? "text-slate-400" : isUrgent ? "text-rose-600" : "text-slate-400"}`}>
                        {b.deadline || "상시 접수"}
                      </span>
                      {!isExpired && (
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                          자세히 보기
                          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </span>
                      )}
                    </div>
                  </>
                );

                if (isExpired) {
                  return (
                    <div
                      key={b.id}
                      className="block bg-white rounded-3xl border-2 border-slate-100 p-6 opacity-50 cursor-not-allowed select-none"
                    >
                      {cardInner}
                    </div>
                  );
                }

                return (
                  <Link
                    key={b.id}
                    href={`/benefit/${b.id}/`}
                    className={`group block bg-white rounded-3xl border-2 p-6 transition-all duration-200 hover:-translate-y-0.5 ${isUrgent
                        ? "border-rose-100 hover:border-rose-200 hover:shadow-[0_4px_24px_rgba(244,63,94,0.12)]"
                        : isLocalMatch
                          ? "border-cyan-100 hover:border-cyan-200 hover:shadow-[0_4px_24px_rgba(0,204,255,0.12)]"
                          : "border-slate-100 hover:border-emerald-200 hover:shadow-[0_4px_24px_rgba(16,185,129,0.1)]"
                      }`}
                  >
                    {cardInner}
                  </Link>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => changePage(Math.max(1, currentPage - 1))}
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
                    onClick={() => changePage(p as number)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${currentPage === p ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-cyan-300"
                      }`}
                    style={currentPage === p ? { background: "linear-gradient(to right, #00CCFF, #33FF99)" } : {}}
                  >
                    {p}
                  </button>
              )}
              <button
                onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full text-sm font-bold border border-slate-200 bg-white disabled:opacity-30 hover:border-cyan-300 transition-colors"
              >
                다음 →
              </button>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
