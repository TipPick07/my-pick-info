import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';
import { SITUATIONS, getSituationCounts } from '@/lib/situations';

export const metadata: Metadata = {
  title: '상황별 맞춤 혜택 모음 | 내 상황에 딱 맞는 지원금 - 팁픽(Tip-Pick)',
  description: '육아·청년·중장년·주거·장애인 등 내 상황에 맞는 수도권 지원금과 가이드를 한곳에 모았습니다. 흩어진 혜택을 상황별로 큐레이션했습니다.',
  alternates: { canonical: 'https://tip-pick.com/situations/' },
};

export default function SituationsIndexPage() {
  const cards = SITUATIONS.map((s) => ({ ...s, counts: getSituationCounts(s) }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">

        <header className="space-y-4 mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            내 상황에 딱 맞는 혜택
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            지원금은 흩어져 있어 찾기 어렵습니다. 팁픽이 <span className="font-black text-[#00AACC]">생애주기·상황별</span>로
            지원금과 가이드를 한곳에 모았어요. 내 상황을 골라 한 번에 확인하세요.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((s) => (
            <Link
              key={s.key}
              href={`/situations/${s.key}/`}
              className="group block bg-white rounded-[2rem] border-2 border-slate-100 p-8 hover:border-[#00CCFF]/40 hover:shadow-[0_6px_28px_rgba(0,204,255,0.14)] transition-all hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{s.emoji}</div>
              <h2 className="text-2xl font-black text-slate-900 group-hover:text-[#00AACC] transition-colors">
                {s.label}
              </h2>
              <p className="mt-2 text-slate-600 font-medium leading-relaxed">{s.tagline}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full">
                    지원금 {s.counts.benefits}건
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full">
                    가이드 {s.counts.posts}건
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#00CCFF] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* 전체 지원금 — 상황 분류에 없는 혜택까지 한 번에 */}
        <div className="mt-10 text-center">
          <Link
            href="/benefits/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#00AACC] transition-colors"
          >
            찾는 혜택이 없나요? 전체 지원금 목록·지역별 검색 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
