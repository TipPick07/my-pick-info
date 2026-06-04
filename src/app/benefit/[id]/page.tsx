import { Metadata } from 'next';
import Link from 'next/link';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import fs from 'fs';
import path from 'path';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  ExternalLink,
  FileText,
  Info,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import EligibilityChecker from "@/components/EligibilityChecker";
import SummaryCard from '@/components/SummaryCard';
import { getRelatedBenefits } from "@/lib/situations";

interface Benefit {
  id: string;
  region: string;
  title: string;
  target: string;
  deadline: string;
  isEmergency: boolean;
  details: string;
  link: string;
  requirements?: string[];
  howToApply?: string[];
  eligibilityQuiz?: string[];
  tip?: string;
  detailedExplanation?: string;
  targetPersona?: string;
  coreValue?: string;
  simulation?: string;
  faq?: { q: string; a: string }[];
  rejectionReasons?: string[];
}

// 자주 묻는 질문: 큐레이션된 faq가 있으면 우선, 없으면 기존 필드에서 자동 파생
function buildFaq(b: Benefit): { q: string; a: string }[] {
  if (Array.isArray(b.faq) && b.faq.length > 0) return b.faq.filter((f) => f && f.q && f.a);
  const faq: { q: string; a: string }[] = [];
  if (b.target) faq.push({ q: '누가 받을 수 있나요?', a: b.target });
  if (b.simulation && b.simulation.trim()) faq.push({ q: '얼마를 받을 수 있나요?', a: b.simulation.trim() });
  if (b.deadline) {
    faq.push({
      q: '신청 기한은 언제까지인가요?',
      a: b.deadline === '상시'
        ? '상시 신청이 가능합니다. 다만 예산이 소진되면 조기 마감될 수 있으니 가능한 한 빨리 확인하세요.'
        : `${b.deadline}까지 신청할 수 있습니다. 마감일 직전에는 접수가 몰릴 수 있으니 여유 있게 준비하세요.`,
    });
  }
  if (b.howToApply && b.howToApply.length > 0) faq.push({ q: '어떻게 신청하나요?', a: b.howToApply.join(' / ') });
  if (b.requirements && b.requirements.length > 0) faq.push({ q: '어떤 서류가 필요한가요?', a: b.requirements.join(', ') });
  return faq;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const benefit = await getBenefit(id);

  if (!benefit) {
    return {
      title: '지원금 혜택 정보 | 팁픽(Tip-Pick)',
      description: '서울, 인천, 경기 지역의 꼭 필요한 지원금과 혜택 정보를 확인하세요.',
    };
  }

  const description = benefit.details ? benefit.details.slice(0, 160) : '지원금 상세 정보입니다.';

  return {
    title: `${benefit.title} | 팁픽(Tip-Pick)`,
    description: description,
    openGraph: {
      title: benefit.title,
      description: description,
      url: `https://tip-pick.com/benefit/${id}/`,
    },
    alternates: {
      canonical: `https://tip-pick.com/benefit/${id}/`,
    }
  };
}

export async function generateStaticParams() {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return data.benefits.map((b: { id: string }) => ({
    id: b.id.toString(),
  }));
}

// 원본 데이터의 '줄 맨 앞 불릿 기호(○ ▷ ■ ◦ ● ▪ ※ □ ◆)'와 앞뒤 공백·trailing 줄바꿈만 제거.
// 문장 내부 가운뎃점 '·'은 보존(제거 대상 아님).
function cleanBulletPrefix(s: string | undefined | null): string {
  return (s || '')
    .replace(/^[\s○▷■◦●▪※□◆]+/, '')
    .trim();
}

async function getBenefit(id: string) {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const b = data.benefits.find((bb: Benefit) => bb.id === id);
  if (b && b.target) b.target = cleanBulletPrefix(b.target);
  return b;
}

function isValidUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export default async function BenefitDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const benefit = await getBenefit(id);

  if (!benefit) return <div className="flex items-center justify-center h-screen font-bold text-slate-400 text-xl">혜택 정보를 불러오고 있습니다...</div>;

  const faq = buildFaq(benefit);
  const related = getRelatedBenefits(benefit);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100">
      {/* FAQPage JSON-LD (구글 FAQ 리치결과) */}
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faq.map((f) => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a },
              })),
            }),
          }}
        />
      )}
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://tip-pick.com" },
              { "@type": "ListItem", "position": 2, "name": "지원금/혜택", "item": "https://tip-pick.com/benefits" },
              { "@type": "ListItem", "position": 3, "name": benefit.title, "item": `https://tip-pick.com/benefit/${benefit.id}/` }
            ]
          })
        }}
      />
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">

        {/* 상단 네비게이션 */}
        <nav className="mb-10">
          <Link
            href="/benefits/"
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            목록으로 돌아가기
          </Link>
        </nav>

        {/* 메인 프리미엄 카드 */}
        <article className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

          {/* 카드 내부 패딩 */}
          <div className="p-8 md:p-14">

            {/* 지역 및 상태 태그 */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-black">
                <MapPin className="w-3.5 h-3.5" />
                {benefit.region}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-black ${benefit.isEmergency
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
                }`}>
                {benefit.deadline}
              </span>
              {benefit.targetPersona && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-black">
                  🎯 추천 대상: {benefit.targetPersona}
                </span>
              )}
              {benefit.coreValue && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-black">
                  💎 핵심 가치: {benefit.coreValue}
                </span>
              )}
            </div>

            {/* 타이틀 */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-10 tracking-tight leading-[1.2]">
              {benefit.title}
            </h1>

            {/* 핵심 요약 박스 */}
            <SummaryCard
              category="benefit"
              rows={[
                { label: '지원 대상', value: benefit.target },
                { label: '신청 기한', value: benefit.deadline },
                { label: '지원 내용', value: benefit.detailedExplanation || benefit.details },
              ]}
              className="mb-12"
            />

            {/* 1분 자격 진단기 */}
            <EligibilityChecker quiz={benefit.eligibilityQuiz} />

            {/* 체감 혜택 시뮬레이션 */}
            {benefit.simulation && (
              <section className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[2rem] p-8 md:p-10 mb-12 text-white shadow-xl relative overflow-hidden mt-12">
                <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                  <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-black flex items-center gap-2">
                    <Lightbulb className="w-7 h-7 text-yellow-300" />
                    체감 혜택 시뮬레이션
                  </h3>
                  <p className="text-lg font-bold text-cyan-50 leading-relaxed whitespace-pre-line">
                    {benefit.simulation}
                  </p>
                </div>
              </section>
            )}

            {/* 상세 섹션: 제출 서류 및 방법 */}
            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-900">
                  <FileText className="w-7 h-7 text-indigo-600" />
                  <h3 className="text-2xl font-black">제출 서류 및 신청 방법</h3>
                </div>

                <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 space-y-8">
                  {benefit.requirements && (
                    <div className="space-y-4">
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        필요한 서류
                      </p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                        {benefit.requirements.map((req: string, idx: number) => (
                          <li key={idx} className="flex gap-3 text-slate-600 items-start">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span className="text-[15px] font-medium leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {benefit.howToApply && (
                    <div className="space-y-4 pt-4 border-t border-slate-200/60">
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        진행 순서
                      </p>
                      <ul className="space-y-4 pl-1">
                        {benefit.howToApply.map((step: string, idx: number) => (
                          <li key={idx} className="flex gap-4 group">
                            <span className="w-7 h-7 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                              {idx + 1}
                            </span>
                            <span className="text-slate-600 font-bold leading-7">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* 팁픽 가이드 섹션 */}
              {benefit.tip && (
                <section className="rounded-[2rem] overflow-hidden border border-emerald-100 relative group">
                  <div className="border-t-4 border-emerald-400" />
                  <div className="bg-rose-50/50 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Info className="w-20 h-20 text-emerald-500" />
                    </div>
                    <div className="relative space-y-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-black text-lg">
                        <Lightbulb className="w-5 h-5 fill-emerald-100" />
                        <CheckCircle2 className="w-4 h-4" />
                        <h4>팁픽 가이드</h4>
                      </div>
                      <p className="text-emerald-900/80 font-bold leading-relaxed whitespace-pre-line text-lg">
                        {benefit.tip}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* 자주 거절되는 이유 / 주의사항 (데이터 있을 때만) */}
              {benefit.rejectionReasons && benefit.rejectionReasons.length > 0 && (
                <section className="rounded-[2rem] border border-amber-100 bg-amber-50/50 p-8">
                  <h3 className="text-xl font-black text-amber-800 flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5" /> 신청 전 꼭 확인 — 자주 거절되는 이유
                  </h3>
                  <ul className="space-y-2.5">
                    {benefit.rejectionReasons.map((r: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-amber-900/80 font-medium leading-relaxed">
                        <span className="text-amber-500 font-black shrink-0">⚠</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 자주 묻는 질문 (FAQ) — 기존 데이터에서 자동 구성 */}
              {faq.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Info className="w-6 h-6 text-cyan-500" /> 자주 묻는 질문
                  </h3>
                  <div className="space-y-3">
                    {faq.map((f, i) => (
                      <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                        <p className="font-black text-slate-800 mb-1.5">Q. {f.q}</p>
                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line">A. {f.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 관련 지원금 (같은 상황) — 내부 링크 + 허브 진입 */}
              {related && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-emerald-500" /> {related.sit.emoji} 함께 챙기면 좋은 {related.sit.label} 지원금
                    </h3>
                    <Link href={`/situations/${related.sit.key}/`} className="text-sm font-bold text-cyan-700 hover:text-cyan-900 whitespace-nowrap">
                      전체 보기 →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {related.items.map((r) => (
                      <Link
                        key={r.id}
                        href={`/benefit/${r.id}/`}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 hover:border-emerald-200 hover:shadow-[0_4px_16px_rgba(16,185,129,0.1)] transition-all"
                      >
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">{r.region}</span>
                        <span className="flex-1 min-w-0 text-sm font-bold text-slate-700 line-clamp-2 group-hover:text-emerald-700">{r.title.replace(/^\[[^\]]+\]\s*/, '')}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* 하단 CTA 버튼 — 유효한 URL이 있을 때만 렌더링 */}
            {isValidUrl(benefit.link) && (
              <footer className="mt-16">
                <a
                  href={benefit.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xl px-8 py-6 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.0)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all active:scale-[0.98] relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 group-hover:text-white transition-colors duration-300">
                      공식 신청 사이트로 자세히 보기
                    </span>
                    <ArrowRight className="w-6 h-6 text-cyan-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </span>
                </a>
                <p className="text-center text-slate-400 text-sm font-bold mt-4 italic">
                  해당 사이트로 이동하여 안전하게 신청하실 수 있습니다.
                </p>
              </footer>
            )}

          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
