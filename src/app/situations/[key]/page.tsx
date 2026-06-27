import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, ArrowRight, MapPin, Clock, FileText, Sparkles } from 'lucide-react';
import {
  SITUATIONS,
  getSituation,
  getBenefitsForSituation,
  getPostsForSituation,
} from '@/lib/situations';

export async function generateStaticParams() {
  return SITUATIONS.map((s) => ({ key: s.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  const sit = getSituation(key);
  if (!sit) {
    return { robots: { index: false, follow: false }, title: '맞춤 혜택 모음 | 팁픽(Tip-Pick)' };
  }
  return {
    robots: { index: false, follow: false },
    title: sit.metaTitle,
    description: sit.metaDescription,
    openGraph: {
      title: sit.metaTitle,
      description: sit.metaDescription,
      url: `https://tip-pick.com/situations/${key}/`,
    },
    alternates: { canonical: `https://tip-pick.com/situations/${key}/` },
  };
}

export default async function SituationHubPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const sit = getSituation(key);
  if (!sit) notFound();

  const benefits = getBenefitsForSituation(sit).slice(0, 18);
  const posts = getPostsForSituation(sit).slice(0, 9);
  const others = SITUATIONS.filter((s) => s.key !== sit.key);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">

        <Link href="/situations/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#00CCFF] font-bold mb-8 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>전체 상황별 모음</span>
        </Link>

        {/* 히어로 */}
        <header className="space-y-5 mb-12">
          <div className="text-6xl">{sit.emoji}</div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {sit.label} 맞춤 혜택 모음
          </h1>
          <p className="text-lg md:text-xl font-bold text-[#00AACC]">{sit.tagline}</p>
          <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl">{sit.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-black rounded-full">
              💰 지원금 {benefits.length}건
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-black rounded-full">
              📖 가이드 {posts.length}건
            </span>
          </div>
        </header>

        {/* 지원금 섹션 */}
        {benefits.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-500" /> 받을 수 있는 지원금
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((b) => (
                <Link
                  key={b.id}
                  href={`/benefit/${b.id}/`}
                  className="group block bg-white rounded-3xl border-2 border-slate-100 p-6 hover:border-emerald-200 hover:shadow-[0_4px_24px_rgba(16,185,129,0.12)] transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-black rounded-full">
                      <MapPin className="w-3 h-3" /> {b.region}
                    </span>
                    {b.deadline && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                        <Clock className="w-3 h-3" /> {b.deadline}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-800 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {b.title.replace(/^\[[^\]]*\]\s*/, '')}
                  </h3>
                  {b.target && <p className="mt-2 text-sm text-slate-500 font-medium line-clamp-2">{b.target}</p>}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                    자세히 보기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 가이드 섹션 */}
        {posts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-500" /> 함께 보면 좋은 가이드
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}/`}
                  className="group block bg-white rounded-3xl border-2 border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-[0_4px_24px_rgba(99,102,241,0.12)] transition-all hover:-translate-y-0.5"
                >
                  <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image || '/images/blogs/korea-welfare-benefit-322.png'}
                      alt={p.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-black text-slate-800 leading-snug line-clamp-3 group-hover:text-indigo-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 font-bold">{p.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mb-16">
          <Link
            href="/eligibility/"
            className="group flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-slate-900 hover:bg-indigo-600 text-white px-8 py-8 rounded-[2rem] shadow-xl transition-all active:scale-[0.99]"
          >
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xl md:text-2xl font-black">🔍 내 자격, 1분 만에 정밀 진단</p>
              <p className="text-white/70 font-medium">몇 가지 질문에 답하면 나에게 맞는 숨은 지원금을 찾아드려요.</p>
            </div>
            <span className="inline-flex items-center gap-2 font-black text-lg whitespace-nowrap">
              맞춤 혜택 찾기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </section>

        {/* 다른 상황 */}
        <section>
          <h2 className="text-xl font-black text-slate-900 mb-5">다른 상황도 둘러보기</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {others.map((s) => (
              <Link
                key={s.key}
                href={`/situations/${s.key}/`}
                className="group flex items-center gap-2 bg-slate-50 hover:bg-[#00CCFF]/10 border border-slate-100 rounded-2xl px-4 py-4 transition-colors"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-sm font-black text-slate-700 group-hover:text-[#00AACC] transition-colors">{s.label}</span>
              </Link>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
