"use client";

import { useState, useEffect } from "react";
import { PostData } from "@/lib/posts";
import PostRow from "@/components/PostRow";

const ITEMS_PER_PAGE = 10;

function getPaginationRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range: (number | "...")[] = [1];
  if (current > 3) range.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) range.push(i);
  if (current < total - 2) range.push("...");
  range.push(total);
  return range;
}

export default function BlogListClient({ posts }: { posts: PostData[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const p = parseInt(new URLSearchParams(window.location.search).get("page") ?? "1", 10);
    if (!isNaN(p) && p > 1) setCurrentPage(p);
  }, []);

  const changePage = (p: number) => {
    setCurrentPage(p);
    const url = p === 1 ? window.location.pathname : `${window.location.pathname}?page=${p}`;
    window.history.replaceState(null, "", url);
  };

  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginated = posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((post) => (
          <PostRow key={post.slug} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="text-6xl text-slate-200">📝</div>
          <p className="text-slate-400">아직 등록된 글이 없습니다.</p>
        </div>
      )}

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
            p === "..."
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
