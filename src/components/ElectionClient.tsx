"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoupangBanner from "./CoupangBanner";
import { PostData } from "@/lib/posts";

interface Props {
  posts: PostData[];
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

export default function ElectionClient({ posts }: Props) {
  const [filter, setFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const regions = ["전체", "서울", "인천", "경기"];

  // 지역 필터링
  const filtered = (posts || []).filter((item) => {
    return filter === "전체" || item.region === filter;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border"
            style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC", borderColor: "rgba(0,204,255,0.25)" }}
          >
            🗳️ 우리 동네 선거 공약
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            우리 동네{" "}
            <span 
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #00CCFF, #33FF99)" }}
            >
              선거 공약 비교
            </span>
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
            복잡한 선거 공약, 팁픽이 지역별·가구별 실제 혜택으로 계산해 드립니다.
          </p>

          {/* 지역 필터 탭 */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => handleFilterChange(r)}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${filter === r
                    ? "text-white shadow-[0_4px_20px_rgba(0,204,255,0.35)]"
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

        {/* ── 콘텐츠 리스트 영역 (카드형 UI) ── */}
        <section className="space-y-6">
          {paginated.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border-2 border-dashed border-slate-200">
              해당 지역의 등록된 선거 공약 정보가 없습니다.
            </div>
          )}

          {paginated.map((item) => (
            <Link
              key={item.slug}
              href={`/election/${item.slug}`}
              className="group bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row hover:border-cyan-200 hover:shadow-[0_4px_20px_rgba(0,204,255,0.12)] transition-all duration-300"
            >

              {/* 이미지 (썸네일) */}
              <div className="relative w-full md:w-56 md:shrink-0 bg-slate-200 overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <img
                  src={item.image || "/images/og-default.png"}
                  alt={item.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/og-default.png"; }}
                />
                {item.region && (
                  <div className="absolute bottom-2 left-2">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-black text-white shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #00CCFF, #33FF99)",
                        textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        boxShadow: "0 2px 8px rgba(0,204,255,0.5)",
                      }}
                    >
                      📍 {item.region}
                    </span>
                  </div>
                )}
              </div>

              {/* 텍스트 내용 */}
              <div className="flex-1 p-6 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <h4 className="text-lg md:text-xl font-black text-slate-900 leading-snug group-hover:text-[#00CCFF] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">
                    {item.summary}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-slate-400 text-xs font-bold">📅 {item.date}</span>
                  <div className="text-[#00CCFF] text-sm font-black group-hover:translate-x-1 transition-transform">
                    자세히 보기 →
                  </div>
                </div>
              </div>
            </Link>
          ))}

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
