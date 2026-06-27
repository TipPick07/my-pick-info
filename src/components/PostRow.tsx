"use client";

import Link from "next/link";
import type { PostData } from "@/lib/posts";
import { CATEGORIES } from "@/config/categories";

/** 카테고리 key → 썸네일용 짧은 라벨 */
const SHORT_LABEL: Record<string, string> = {
  money: "경제", benefits: "지원금", tools: "계산기",
  hot: "핫이슈", festivals: "나들이", tips: "꿀팁",
};

/** 글 category → 카테고리 색·이모지·짧은 라벨 (썸네일용). 매핑 없으면 중립 회색. */
function catMeta(postCategory: string) {
  const c = CATEGORIES.find((x) => x.postCategories.includes(postCategory));
  if (c) return { accent: c.accent, emoji: c.emoji, label: SHORT_LABEL[c.key] ?? c.label };
  return { accent: "#64748b", emoji: "📄", label: "정보" };
}

/** 글 목록 공용 카드(가로형). 사진 대신 카테고리 색 썸네일 — 글마다 이미지 불필요·완전 일관. */
export default function PostRow({ post }: { post: PostData }) {
  const meta = catMeta(post.category);
  return (
    <Link
      href={`/blog/${post.slug}/`}
      className="group flex items-stretch bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_4px_20px_rgba(0,204,255,0.10)] transition-all duration-300"
    >
      <div
        className="w-24 shrink-0 flex flex-col items-center justify-center gap-1 px-2"
        style={{ backgroundColor: `${meta.accent}14` }}
      >
        <span className="text-3xl leading-none">{meta.emoji}</span>
        <span className="text-[10px] font-black text-center leading-tight" style={{ color: meta.accent }}>
          {meta.label}
        </span>
      </div>
      <div className="flex-1 px-5 py-4 flex flex-col justify-center gap-1.5 min-w-0">
        <span className="text-[10px] font-bold text-slate-400">{post.date}</span>
        <h3 className="text-base font-black text-slate-800 group-hover:text-brand-dark transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{post.summary}</p>
      </div>
    </Link>
  );
}
