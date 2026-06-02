"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const p = parseInt(new URLSearchParams(window.location.search).get('page') ?? '1', 10);
    if (!isNaN(p) && p > 1) setCurrentPage(p);
  }, []);

  const changePage = (p: number) => {
    setCurrentPage(p);
    const url = p === 1 ? window.location.pathname : `${window.location.pathname}?page=${p}`;
    window.history.replaceState(null, '', url);
  };

  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginated = posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {paginated.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}/`}
          className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_4px_24px_rgba(0,204,255,0.12)] hover:border-brand/30 transition-all duration-300 hover:-translate-y-1"
        >
          {/* 상단 와이드 썸네일 */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
            <img
              src={post.image || '/images/blogs/korea-welfare-benefit-322.png'}
              alt={post.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/blogs/korea-welfare-benefit-322.png';
              }}
            />
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-brand-dark shadow border border-white/50 tracking-wider">
              {({ festival: '축제', benefit: '지원금', benefits: '지원금', election: '선거', info: '정보' } as Record<string, string>)[post.category ?? ''] ?? post.category}
            </div>
          </div>

          {/* 하단 텍스트 */}
          <div className="flex-1 px-6 py-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="text-brand-dark">💡 팁픽 큐레이션</span>
              <span>{post.date}</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 line-clamp-2 leading-snug transition-colors group-hover:text-brand-dark">
              {post.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">
              {post.summary}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="text-[9px] px-2 py-0.5 rounded-md bg-cyan-50 text-brand-dark"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
      </div>

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
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${
                    currentPage === p ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-cyan-300"
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
    </div>
  );
}
