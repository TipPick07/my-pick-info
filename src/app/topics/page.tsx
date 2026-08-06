import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TOPICS } from "@/lib/topics";

const SITE = "https://tip-pick.com";

export const metadata: Metadata = {
  title: "주제별 모아보기 — 지원금·세금·생활금융 | 팁픽(Tip-Pick)",
  description:
    "청년 자산형성, 교통비, 에너지바우처, 기초생활수급자, 건강보험료 등 주제별로 글·가이드·계산기를 묶어 두었습니다.",
  alternates: { canonical: "/topics/" },
  openGraph: {
    title: "주제별 모아보기 | 팁픽(Tip-Pick)",
    description: "같은 주제의 글·가이드·계산기를 한 페이지에서 확인하세요.",
    url: `${SITE}/topics/`,
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function TopicsHubPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100">
      <Header />
      <main className="max-w-5xl mx-auto w-full px-4 py-12 space-y-10">
        <section className="text-center space-y-5 max-w-3xl mx-auto py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border border-cyan-200 bg-cyan-50 text-brand-dark">
            \ud83d\udcda 주제별 모아보기
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
            주제별 모아보기
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            같은 주제의 글·가이드·계산기를{" "}
            <span className="font-black text-slate-700">한 페이지에 묶었습니다</span>.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}/`}
              className="block rounded-2xl border border-slate-200 p-5 hover:border-cyan-300 hover:shadow-md transition"
            >
              <h2 className="text-lg font-black text-slate-900">{t.title}</h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
                {t.description}
              </p>
              <p className="mt-3 text-xs font-bold text-brand-dark">
                글 {t.posts.length}편
                {t.guides?.length ? ` · 가이드 ${t.guides.length}` : ""}
                {t.tools?.length ? ` · 계산기 ${t.tools.length}` : ""}
              </p>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
