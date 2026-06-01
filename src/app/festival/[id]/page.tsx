import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  ExternalLink,
  Lightbulb,
  CheckCircle2,
  Info
} from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MdContent from '@/components/MdContent';
import SummaryCard from '@/components/SummaryCard';

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
  mapx?: string;
  mapy?: string;
  content?: string;
  targetPersona?: string;
  coreValue?: string;
  practicalTip?: string;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const festival = await getFestival(id);

  if (!festival) {
    return {
      title: '축제 정보 | 팁픽(Tip-Pick)',
      description: '서울, 인천, 경기 지역의 즐거운 축제와 행사를 확인하세요.',
    };
  }

  const description = festival.description ? festival.description.slice(0, 160) : '축제 상세 정보입니다.';

  return {
    title: `${festival.title} | 팁픽(Tip-Pick)`,
    description: description,
    alternates: {
      canonical: `https://tip-pick.com/festival/${id}/`,
    },
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
  const params = data.festivals.map((f: { id: string }) => ({ id: f.id.toString() }));
  // output: export 모드에서 빈 배열이면 빌드 오류 — placeholder 보장
  return params.length > 0 ? params : [{ id: 'placeholder' }];
}

async function getFestival(id: string) {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return data.festivals.find((f: Festival) => f.id === id);
}

function isValidUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export default async function FestivalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const festival = await getFestival(id);

  if (!festival) return <div className="flex items-center justify-center h-screen font-bold text-slate-400">정보를 찾는 중...</div>;

  // 본문 텍스트 분리 (설명 유무와 버튼 로직은 완전히 독립)
  const description = festival.description || '';
  const hasDescription = description.trim().length > 0;
  const firstSentence = hasDescription ? description.split('.')[0] + '.' : '';
  const restDescription = hasDescription ? description.replace(firstSentence, '').trim() : '';

  // Event JSON-LD 날짜 파싱 (YYYY.MM.DD~YYYY.MM.DD 또는 YYYY.MM.DD)
  const dateParts = (festival.date || '').split('~');
  const toIsoDate = (d: string) => d.trim().replace(/\./g, '-');
  const eventStartDate = dateParts[0] ? toIsoDate(dateParts[0]) : '';
  const eventEndDate = dateParts[1] ? toIsoDate(dateParts[1]) : eventStartDate;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": festival.title,
    "description": festival.description || '',
    "image": festival.image
      ? (festival.image.startsWith('http') ? festival.image : `https://tip-pick.com${festival.image}`)
      : '',
    "url": `https://tip-pick.com/festival/${festival.id}/`,
    ...(eventStartDate && { "startDate": eventStartDate }),
    ...(eventEndDate && { "endDate": eventEndDate }),
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": festival.location || festival.region || '수도권',
      "address": {
        "@type": "PostalAddress",
        "addressLocality": festival.location || festival.region || '',
        "addressCountry": "KR"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "수도권 팁픽(Tip-Pick)",
      "url": "https://tip-pick.com"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Event JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://tip-pick.com" },
              { "@type": "ListItem", "position": 2, "name": "축제/행사", "item": "https://tip-pick.com/festivals" },
              { "@type": "ListItem", "position": 3, "name": festival.title, "item": `https://tip-pick.com/festival/${festival.id}/` }
            ]
          })
        }}
      />
      <Header />
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
              {festival.targetPersona && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-black rounded-full">
                  🎯 추천 대상: {festival.targetPersona}
                </span>
              )}
              {festival.coreValue && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full">
                  ✨ 핵심 매력: {festival.coreValue}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              {festival.title}
            </h1>
          </header>

          {/* 핵심 정보 박스 */}
          <SummaryCard
            category="festival"
            rows={[
              { label: '행사 기간', value: festival.date },
              { label: '행사 장소', value: festival.location },
            ]}
          />

          {/* 본문 (상세 설명) — 버튼 로직과 완전 독립 렌더링 */}
          <section className="text-lg font-medium text-slate-700 leading-[1.8] space-y-10">
            {hasDescription ? (
              <>
                {/* 인용구 스타일 */}
                <div className="border-l-4 border-indigo-500 pl-6 my-10">
                  <p className="text-2xl font-black text-slate-900 leading-snug">
                    {firstSentence}
                  </p>
                </div>
                {restDescription && <p>{restDescription}</p>}
              </>
            ) : (
              <p className="text-slate-400 italic">주최 측에서 제공한 상세 설명이 없습니다.</p>
            )}

            {/* 추천 포인트 강조 박스 또는 블로그형 본문 */}
            {festival.content && festival.content.trim().length > 10 ? (
              <div className="mt-8">
                <MdContent>{festival.content}</MdContent>
              </div>
            ) : (
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
            )}
          </section>
          {/* 지도 위젯 */}
          {(festival.mapx && festival.mapy) ? (
            <section className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-6 pt-5 pb-3">행사 위치</p>
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(festival.mapx) - 0.008},${parseFloat(festival.mapy) - 0.005},${parseFloat(festival.mapx) + 0.008},${parseFloat(festival.mapy) + 0.005}&layer=mapnik&marker=${festival.mapy},${festival.mapx}`}
                width="100%"
                height="360"
                style={{ border: 0 }}
                loading="lazy"
                title={`${festival.title} 위치 지도`}
              />
            </section>
          ) : festival.location ? (
            <section className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="font-bold text-sm">{festival.location}</span>
              </div>
              <a
                href={`https://map.naver.com/p/search/${encodeURIComponent(festival.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black text-indigo-600 hover:underline whitespace-nowrap"
              >
                지도에서 보기 →
              </a>
            </section>
          ) : null}

          {/* 팁픽 가이드 */}
          {festival.practicalTip && (
            <section className="rounded-[2rem] overflow-hidden border border-emerald-100 relative group mt-2">
              <div className="border-t-4 border-emerald-400" />
              <div className="bg-emerald-50/50 p-8 relative overflow-hidden">
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
                    {festival.practicalTip}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 하단 CTA 버튼 — 항상 렌더링 (URL 유효 시 공식 링크, 아니면 네이버 검색) */}
          <footer className="pt-4">
            {isValidUrl(festival.link) ? (
              <a
                href={festival.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 w-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-xl px-8 py-6 rounded-[1.5rem] shadow-xl shadow-slate-100 hover:shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                공식 홈페이지 방문하기
                <ExternalLink className="w-6 h-6" />
              </a>
            ) : (
              <a
                href={`https://search.naver.com/search.naver?query=${encodeURIComponent(festival.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xl px-8 py-6 rounded-[1.5rem] transition-all active:scale-[0.98]"
              >
                🔍 네이버에서 상세 정보 검색하기
                <ExternalLink className="w-6 h-6" />
              </a>
            )}
          </footer>

        </article>
      </div>

      <Footer />
    </div>
  );
}
