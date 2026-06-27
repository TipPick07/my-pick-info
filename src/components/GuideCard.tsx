import Link from "next/link";
import type { Guide } from "@/lib/guides";

/**
 * 가이드 카드 — /guides 허브와 메인에서 공유하는 공용 카드.
 * 통일·경량화(2026-06-27): 제각각이던 OG 이미지 썸네일을 제거하고,
 * 이모지 + 카테고리 + 제목 + 설명의 컴팩트 리스트형 카드로 통일.
 */
export default function GuideCard({ slug, title, description, category, emoji }: Guide) {
  return (
    <Link
      href={`/guides/${slug}/`}
      className="group flex items-stretch bg-white rounded-2xl border border-slate-100 shadow-sm hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_4px_20px_rgba(0,204,255,0.10)] transition-all duration-300"
    >
      <div className="w-16 shrink-0 flex items-center justify-center text-3xl bg-indigo-50/60">
        {emoji}
      </div>
      <div className="flex-1 px-5 py-4 flex flex-col justify-center gap-1.5 min-w-0">
        <span className="inline-block w-fit px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full">
          {category}
        </span>
        <h3 className="text-base font-black text-slate-900 group-hover:text-brand-dark transition-colors leading-snug line-clamp-2">
          {title}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}
