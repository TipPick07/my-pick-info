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

async function getBenefit(id: string) {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return data.benefits.find((b: Benefit) => b.id === id);
}

export default async function BenefitDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const benefit = await getBenefit(id);

  if (!benefit) return <div className="flex items-center justify-center h-screen font-bold text-slate-400 text-xl">혜택 정보를 불러오고 있습니다...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
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
        <article className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* 카드 내부 패딩 */}
          <div className="p-8 md:p-14">
            
            {/* 지역 및 상태 태그 */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-black">
                <MapPin className="w-3.5 h-3.5" />
                {benefit.region}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-black ${
                benefit.isEmergency 
                  ? "bg-rose-50 text-rose-600" 
                  : "bg-emerald-50 text-emerald-600"
              }`}>
                {benefit.deadline}
              </span>
            </div>

            {/* 타이틀 */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-10 tracking-tight leading-[1.2]">
              {benefit.title}
            </h1>

            {/* 핵심 요약 박스 (Gradient Box) */}
            <section className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-[2rem] p-8 md:p-10 mb-12 border border-indigo-100/30">
              <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <Sparkles className="w-6 h-6 fill-indigo-100" />
                <h2 className="text-lg font-black uppercase tracking-wider">한눈에 보는 핵심 요약</h2>
              </div>
              
              <div className="grid gap-6">
                <div className="flex gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400">지원 대상</p>
                    <p className="text-lg font-bold text-slate-800 leading-snug">{benefit.target}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400">신청 기한</p>
                    <p className="text-lg font-bold text-slate-800 leading-snug">{benefit.deadline}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400">지원 내용</p>
                    <p className="text-lg font-bold text-slate-800 leading-relaxed whitespace-pre-line">{benefit.details}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 1분 자격 진단기 */}
            <EligibilityChecker quiz={benefit.eligibilityQuiz} />

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
            </div>

            {/* 하단 CTA 버튼 */}
            <footer className="mt-16">
              <a
                href={(benefit.link || "").startsWith('http') ? benefit.link : `https://${benefit.link || ""}`}
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

          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
