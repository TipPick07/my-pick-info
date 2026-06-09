import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Guide } from "@/lib/guides";

/**
 * 가이드 카드 — /guides 허브와 메인 첫 화면에서 공유하는 공용 카드.
 *
 * ▷ src/app/guides/page.tsx 인라인 카드(구 60–94행)를 마크업·className 변경 없이 그대로 추출한 것.
 *   DOM 구조·hover 그림자·rounded·next/image 설정·"가이드 보기 →" 전부 추출 전과 동일.
 * ▷ 클라이언트 훅 없음 → 서버 컴포넌트(허브와 동일 경계). props는 guides.ts의 Guide 항목 단위.
 */
export default function GuideCard({
  slug,
  title,
  description,
  category,
  emoji,
  image,
}: Guide) {
  return (
    <Link
      href={`/guides/${slug}/`}
      className="group block bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden hover:border-[#00CCFF]/40 hover:shadow-[0_6px_28px_rgba(0,204,255,0.14)] transition-all hover:-translate-y-1"
    >
      {image && (
        <div className="relative w-full aspect-[1200/630] bg-slate-50">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-8">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full">
          {emoji} {category}
        </span>
        <h2 className="mt-4 text-2xl font-black text-slate-900 group-hover:text-[#00AACC] transition-colors leading-snug">
          {title}
        </h2>
        <p className="mt-2 text-slate-600 font-medium leading-relaxed">{description}</p>

        <div className="mt-5 flex items-center justify-end">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-400 group-hover:text-[#00AACC] transition-colors">
            가이드 보기
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
