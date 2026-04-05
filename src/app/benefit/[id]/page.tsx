import Link from "next/link";

interface Benefit {
  id: string;
  region: string;
  title: string;
  target: string;
  deadline: string;
  isEmergency: boolean;
  details: string;
  link: string;
}

// 정적 배포를 위해 미리 경로를 생성합니다.
export async function generateStaticParams() {
  const data = require("../../../../public/data/pick-info.json");
  return data.benefits.map((b: { id: string }) => ({
    id: b.id,
  }));
}

async function getBenefit(id: string) {
  const data = require("../../../../public/data/pick-info.json");
  return data.benefits.find((b: Benefit) => b.id === id);
}

export default async function BenefitDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const benefit = await getBenefit(id);

  if (!benefit) return <div className="flex items-center justify-center h-screen font-bold text-slate-400">혜택 정보를 찾는 중...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 py-12">
      <main className="container mx-auto px-6 max-w-5xl space-y-12">
        {/* Top Navigation */}
        <Link 
          href="/benefits/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
        >
          ← 목록으로
        </Link>

        {/* Content Content Container */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl p-10 md:p-20 space-y-12 overflow-hidden relative">
          {/* subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
          
          <div className="space-y-4 relative">
            <span className={`px-4 py-1.5 text-xs font-black text-white rounded-full ${benefit.isEmergency ? "bg-rose-500" : "bg-indigo-600"}`}>
              {benefit.region}
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight pt-2">
              {benefit.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <div className="space-y-4">
              <p className="text-slate-400 font-black text-sm uppercase tracking-widest leading-none">지원 대상</p>
              <p className="text-2xl font-black text-slate-700">{benefit.target}</p>
            </div>
            <div className="space-y-4">
              <p className="text-slate-400 font-black text-sm uppercase tracking-widest leading-none">신청 기한</p>
              <p className={`text-2xl font-black ${benefit.isEmergency ? "text-rose-600" : "text-indigo-600"}`}>{benefit.deadline}</p>
            </div>
          </div>

          <div className="space-y-10 pt-10 border-t border-slate-100">
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 border-l-8 border-indigo-600 pl-4">수혜 내용 및 신청 안내</h3>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium">
                {benefit.details}
              </p>
            </div>
          </div>

          <div className="pt-10 flex flex-col md:row items-center justify-center gap-6">
            <a 
              href={benefit.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto px-16 py-6 bg-slate-900 text-white rounded-[2rem] text-xl font-black hover:bg-slate-800 transition-all shadow-2xl active:scale-95 text-center"
            >
              지금 바로 신청하기 →
            </a>
            <p className="text-slate-400 text-sm font-bold italic">신청 시 해당 기관의 홈페이지로 연결됩니다.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
