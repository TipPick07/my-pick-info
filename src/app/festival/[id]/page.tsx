import Link from "next/link";

interface Festival {
  id: string;
  region: string;
  title: string;
  date: string;
  location: string;
  tag: string;
  image: string;
  description: string;
  link: string;
}

// 정적 배포를 위해 미리 경로를 생성합니다.
export async function generateStaticParams() {
  const data = require("../../../../public/data/pick-info.json");
  return data.festivals.map((f: { id: string }) => ({
    id: f.id,
  }));
}

async function getFestival(id: string) {
  const data = require("../../../../public/data/pick-info.json");
  return data.festivals.find((f: Festival) => f.id === id);
}

export default async function FestivalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const festival = await getFestival(id);

  if (!festival) return <div className="flex items-center justify-center h-screen font-bold text-slate-400">정보를 찾는 중...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 pb-20">
      {/* Background Hero */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img 
          src={festival.image} 
          alt={festival.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 text-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-8">
          <Link 
            href="/festivals/" 
            className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md rounded-full text-sm font-bold text-slate-900 shadow-lg border border-white/50 hover:bg-white hover:-translate-x-1 transition-all"
          >
            ← 목록으로
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-6 -mt-32 relative z-10 space-y-12">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-black rounded-full shadow-lg shadow-indigo-200">
              {festival.region}
            </span>
            <span className="px-4 py-1.5 bg-white text-indigo-600 text-sm font-black rounded-full shadow-md border border-slate-100">
              {festival.tag}
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
            {festival.title}
          </h2>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info Box */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-xl space-y-8">
              <h3 className="text-2xl font-black text-slate-900 border-l-8 border-indigo-600 pl-4">상세 설명</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {festival.description}
              </p>
            </div>
          </div>

          {/* Sidebar Summary */}
          <aside className="space-y-6">
            <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl space-y-6">
              <h3 className="text-xl font-black">핵심 요약</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-slate-400 font-bold">축제 기간</span>
                  <span className="font-black">{festival.date}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-slate-400 font-bold">장소</span>
                  <span className="font-black text-right max-w-[150px]">{festival.location}</span>
                </div>
              </div>
              <a 
                href={festival.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full py-4 bg-indigo-600 text-white text-center rounded-2xl font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 mt-4"
              >
                자세히 보기 →
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
