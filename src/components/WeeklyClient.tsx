"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Festival {
  id: string;
  region: string;
  title: string;
  date: string;
  tag: string;
  image: string;
  location?: string;
  description?: string;
}

function parseFestivalDates(dateStr: string): { start: Date | null; end: Date | null } {
  if (!dateStr || dateStr === '상시') return { start: null, end: null };
  const parts = dateStr.split('~');
  const parse = (s: string) => {
    const m = s.trim().match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
    return m ? new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])) : null;
  };
  return { start: parse(parts[0]), end: parse(parts[parts.length - 1]) };
}

function getFestivalStatus(dateStr: string, today: Date): "진행중" | "예정" | "완료" {
  const { start, end } = parseFestivalDates(dateStr);
  if (!start && !end) return "진행중";
  if (end && end < today) return "완료";
  if (start && start > today) return "예정";
  return "진행중";
}

function isFestivalOngoing(dateStr: string, today: Date): boolean {
  const { start, end } = parseFestivalDates(dateStr);
  if (!start && !end) return true;
  return (!start || start <= today) && (!end || end >= today);
}

function sortFestivals(list: Festival[], today: Date): Festival[] {
  return [...list].sort((a, b) => {
    const aOngoing = isFestivalOngoing(a.date, today);
    const bOngoing = isFestivalOngoing(b.date, today);
    if (aOngoing && !bOngoing) return -1;
    if (!aOngoing && bOngoing) return 1;
    const { end: aE } = parseFestivalDates(a.date);
    const { end: bE } = parseFestivalDates(b.date);
    return (aE ? aE.getTime() : Infinity) - (bE ? bE.getTime() : Infinity);
  });
}

const ITEMS_PER_PAGE = 10;

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range: (number | '...')[] = [1];
  if (current > 3) range.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) range.push(i);
  if (current < total - 2) range.push('...');
  range.push(total);
  return range;
}

export default function WeeklyClient({ items }: { items: Festival[] }) {
  const [filter, setFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const regions = ["전체", "서울", "인천", "경기"];

  const todayKST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  todayKST.setHours(0, 0, 0, 0);

  const filtered = sortFestivals(
    items.filter((f) => filter === "전체" || f.region === filter),
    todayKST
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (r: string) => {
    setFilter(r);
    setCurrentPage(1);
  };

  const statusColor: Record<string, string> = {
    "진행중": "#22c55e",
    "예정": "#00AACC",
    "완료": "#94a3b8",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* ── Hero ── */}
        <section className="text-center space-y-5 py-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border"
            style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC", borderColor: "rgba(0,204,255,0.25)" }}
          >
            📅 이번 주 행사
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            이번 주{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00CCFF, #33FF99)" }}
            >
              어디 가?
            </span>
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
            이번 주 수도권에서 열리는 행사만 팁픽이 골라드렸어요.{" "}
            <span className="font-black text-slate-700">지금 바로 확인하세요!</span>
          </p>

          {/* 지역 필터 탭 */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => handleFilterChange(r)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${filter === r
                  ? "text-white"
                  : "bg-white text-slate-600 border border-slate-200/50 hover:bg-slate-50"
                }`}
                style={filter === r
                  ? { background: "linear-gradient(to right, #00CCFF, #33FF99)", boxShadow: "0 4px 20px rgba(0,204,255,0.35)" }
                  : {}}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* ── 행사 리스트 ── */}
        <section>
          <div className="flex flex-col gap-4 font-sans">
            {paginated.map((f: Festival) => {
              const status = getFestivalStatus(f.date, todayKST);

              return (
                <Link
                  key={f.id}
                  href={`/festival/${f.id}/`}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row hover:border-cyan-200 hover:shadow-md transition-all duration-300"
                >
                  {/* 이미지 */}
                  <div className="relative w-full md:w-64 md:shrink-0 bg-slate-200 overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <img
                      src={f.image || "/images/placeholder-festival.svg"}
                      alt={f.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/placeholder-festival.svg";
                      }}
                    />
                    <div
                      className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black text-white shadow-sm"
                      style={{ background: statusColor[status] }}
                    >
                      {status}
                    </div>
                  </div>

                  {/* 텍스트 */}
                  <div className="flex-1 p-5 flex flex-col justify-center gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">{f.region}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white shadow-sm" style={{ background: "#00CCFF" }}>{f.tag}</span>
                    </div>
                    <h4 className="text-base md:text-lg font-black text-slate-900 leading-snug group-hover:text-[#00CCFF] transition-colors">
                      {f.title}
                    </h4>
                    {f.description && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{f.description}</p>
                    )}
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1">📅 {f.date}</p>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1">📍 {f.location || f.region}</p>
                  </div>
                </Link>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 font-medium bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200">
                이번 주 등록된 행사가 없습니다.
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
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
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${currentPage === p ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-cyan-300"}`}
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

      </main>

      <Footer />
    </div>
  );
}
