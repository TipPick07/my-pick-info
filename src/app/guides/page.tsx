import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GUIDES } from "@/lib/guides";

/**
 * 가이드 허브 — 플래그십 에버그린 가이드 목록.
 *
 * ▷ 독립 정적 라우트. posts/*.md · public/data/pick-info.json 미경유 → 자동발행 파이프라인과 무관.
 * ▷ 목록은 src/lib/guides.ts(GUIDES) 단일 SSOT를 map. sitemap도 같은 배열을 사용.
 * ▷ 허브 자체 og:image 는 사이트 공용 이미지(/og-image.png)가 없어 비워둠(임의 차용 금지).
 *   → 공용 OG 이미지 생성 시 이 파일 openGraph/twitter 에 images 추가.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/";
const OG_TITLE = "팁픽 가이드 — 수도권 지원금·혜택 에버그린 가이드 모음";
const OG_DESC =
  "흩어진 수도권 지원금과 혜택을 주제별로 깊이 있게 정리한 팁픽의 플래그십 가이드 모음입니다.";

export const metadata: Metadata = {
  title: "팁픽 가이드 — 수도권 지원금·혜택 에버그린 가이드 모음 | 팁픽",
  description:
    "육아·가족 지원금부터 생애주기·상황별 혜택까지 — 한 페이지에서 끝까지 이해되는 팁픽의 플래그십 가이드를 모았습니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: OG_TITLE,
    description: OG_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
  },
};

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">

        <header className="space-y-4 mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            팁픽 가이드
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            지원금은 흩어져 있어 전체 그림을 잡기 어렵습니다. 팁픽이 주제별로
            <span className="font-black text-[#00AACC]"> 끝까지 이해되는 가이드</span>로 정리했어요.
            우리 상황에 맞는 가이드를 골라 한 번에 확인하세요.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}/`}
              className="group block bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden hover:border-[#00CCFF]/40 hover:shadow-[0_6px_28px_rgba(0,204,255,0.14)] transition-all hover:-translate-y-1"
            >
              {g.image && (
                <div className="relative w-full aspect-[1200/630] bg-slate-50">
                  <Image
                    src={g.image}
                    alt={g.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full">
                  {g.emoji} {g.category}
                </span>
                <h2 className="mt-4 text-2xl font-black text-slate-900 group-hover:text-[#00AACC] transition-colors leading-snug">
                  {g.title}
                </h2>
                <p className="mt-2 text-slate-600 font-medium leading-relaxed">{g.description}</p>

                <div className="mt-5 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-400 group-hover:text-[#00AACC] transition-colors">
                    가이드 보기
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 상황별 혜택으로 연결 */}
        <div className="mt-10 text-center">
          <Link
            href="/situations/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#00AACC] transition-colors"
          >
            찾는 주제가 없나요? 상황별 혜택 모음 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
