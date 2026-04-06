import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const festival = await getFestival(id);

  if (!festival) {
    return {
      title: '수도권N라이프 축제 정보',
      description: '서울, 인천, 경기 지역의 즐거운 축제와 행사를 확인하세요.',
    };
  }

  const description = festival.description ? festival.description.slice(0, 160) : '축제 상세 정보입니다.';

  return {
    title: `${festival.title} | 수도권N라이프`,
    description: description,
    openGraph: {
      title: festival.title,
      description: description,
      images: [festival.image || ""],
    },
  };
}

export async function generateStaticParams() {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return data.festivals.map((f: { id: string }) => ({
    id: f.id.toString(),
  }));
}

async function getFestival(id: string) {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return data.festivals.find((f: Festival) => f.id === id);
}

export default async function FestivalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const festival = await getFestival(id);

  if (!festival) return <div className="flex items-center justify-center h-screen font-bold text-slate-400">정보를 찾는 중...</div>;

  // 본문 텍스트가 있을 경우 첫 문장이나 일부를 인용구로 처리하기 위해 분리
  const firstSentence = festival.description.split('.')[0] + '.';
  const restDescription = festival.description.replace(firstSentence, '').trim();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        
        {/* 뒤로가기 버튼 */}
        <Link 
          href="/festivals/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>목록으로 돌아가기</span>
        </Link>

        {/* 메인 콘텐츠 카드 */}
        <article className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm overflow-hidden p-8 md:p-14 space-y-12">
          
          {/* 상단 태그 및 타이틀 */}
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-black rounded-full">
                <MapPin className="w-3 h-3" /> {festival.region}
              </span>
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full">
                {festival.tag}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              {festival.title}
            </h1>
          </header>

          {/* 핵심 정보 박스 (가로형) */}
          <section className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="flex items-center gap-5">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">행사 기간</p>
                <p className="text-lg font-black text-slate-800">{festival.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">행사 장소</p>
                <p className="text-lg font-black text-slate-800 leading-snug">{festival.location}</p>
              </div>
            </div>
          </section>

          {/* 본문 (상세 설명) */}
          <section className="text-lg font-medium text-slate-700 leading-[1.8] space-y-10">
            {/* 인용구 스타일 */}
            <div className="border-l-4 border-indigo-500 pl-6 my-10">
              <p className="text-2xl font-black text-slate-900 leading-snug">
                {firstSentence}
              </p>
            </div>

            <p>{restDescription}</p>

            {/* 추천 포인트 강조 박스 */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-white p-8 md:p-12 rounded-[2.5rem] border border-indigo-100/50 my-12 shadow-sm space-y-8">
              <div className="flex items-center gap-3 text-indigo-600">
                <Sparkles className="w-6 h-6" />
                <h4 className="text-xl font-black">추천 포인트</h4>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <li className="space-y-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm">1</div>
                  <p className="text-sm font-bold text-slate-600">지역 고유의 테마를 가장 생동감 있게 체험할 수 있는 기회</p>
                </li>
                <li className="space-y-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm">2</div>
                  <p className="text-sm font-bold text-slate-600">가족, 연인, 친구와 함께 잊지 못할 추억을 남길 수 있는 최고의 포토존</p>
                </li>
                <li className="space-y-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-indigo-600 text-sm shadow-sm">3</div>
                  <p className="text-sm font-bold text-slate-600">현지에서만 맛보고 즐길 수 있는 다채로운 문화 프로그램 구성</p>
                </li>
              </ul>
            </div>
          </section>

          {/* 하단 CTA 버튼 */}
          <footer className="pt-4">
            <a 
              href={(festival.link || "").startsWith('http') ? festival.link : `https://${festival.link || ""}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-xl px-8 py-6 rounded-[1.5rem] shadow-xl shadow-slate-100 hover:shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              공식 홈페이지 방문하기
              <ExternalLink className="w-6 h-6" />
            </a>
          </footer>

        </article>

      </div>
    </div>
  );
}
