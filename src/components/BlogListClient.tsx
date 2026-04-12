"use client";

import { useState } from "react";
import Link from "next/link";
import { PostData } from "@/lib/posts";

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

export default function BlogListClient({ posts }: { posts: PostData[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginated = posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {paginated.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group flex items-center bg-white rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-sm hover:shadow-[0_4px_24px_rgba(0,204,255,0.14)] hover:border-[rgba(0,204,255,0.3)] transition-all duration-300 hover:-translate-y-0.5"
        >
          {/* 왼쪽 정방형 썸네일 */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 shrink-0 overflow-hidden bg-slate-100">
            <img
              src={post.image || '/images/blogs/korea-welfare-benefit-322.png'}
              alt={post.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              style={{ filter: "saturate(1.05) brightness(0.96)" }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "rgba(0,204,255,0.07)" }}
            />
            <div
              className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black shadow border border-white/50 tracking-wider"
              style={{ color: "#00CCFF" }}
            >
              {post.category}
            </div>
          </div>

          {/* 오른쪽 텍스트 */}
          <div className="flex-1 px-6 py-5 flex flex-col justify-between gap-2 min-h-[144px] md:min-h-[176px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span style={{ color: "#00AACC" }}>💡 팁픽 큐레이션</span>
                <span>{post.date}</span>
              </div>
              <h3 className="text-base md:text-lg font-black text-slate-800 line-clamp-2 leading-snug transition-colors group-hover:text-[#00CCFF]">
                {post.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                {post.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 5).map(tag => (
                <span
                  key={tag}
                  className="text-[9px] px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(0,204,255,0.08)", color: "#00AACC" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}

      {posts.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="text-6xl text-slate-200">📝</div>
          <p className="text-slate-400">아직 등록된 블로그 게시글이 없습니다.</p>
        </div>
      )}

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
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${
                    currentPage === p ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-cyan-300"
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
    </div>
  );
}
