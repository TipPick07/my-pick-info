"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

interface Benefit {
  id: string;
  region: string;
  title: string;
  target: string;
  deadline: string;
  isEmergency: boolean;
}

interface Data {
  benefits: Benefit[];
}

export default function BenefitsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [filter, setFilter] = useState("전체");

  useEffect(() => {
    fetch("/data/pick-info.json")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <div className="flex items-center justify-center h-screen font-bold text-slate-400">데이터를 불러오는 중...</div>;

  const filteredBenefits = filter === "전체" 
    ? data.benefits 
    : data.benefits.filter(b => b.region === filter || b.region === "전국");

  const regions = ["전체", "서울", "인천", "경기"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Page Hero */}
        <section className="text-center space-y-6 py-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              오늘의 <span className="text-indigo-600">지원금/혜택</span> 소식
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              수도권 지역의 꼭 필요한 복지 혜택과 맞춤형 지원 정보를 한눈에 확인하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  filter === r
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Benefits List */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBenefits.map((b) => (
              <Link key={b.id} href={`/benefit/${b.id}`} className={`block p-8 rounded-[2.5rem] border-2 transition-all hover:-translate-y-1 hover:shadow-2xl group ${b.isEmergency ? "border-rose-100 bg-white" : "border-slate-100 bg-white"}`}>
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${b.isEmergency ? "bg-rose-500 text-white shadow-lg shadow-rose-100" : "bg-slate-100 text-slate-600"}`}>
                    {b.region}
                  </span>
                  <span className={`text-sm font-bold ${b.isEmergency ? "text-rose-600" : "text-slate-400"}`}>
                    {b.deadline}
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                  {b.title}
                </h4>
                <p className="text-slate-500 text-sm font-bold mb-6">{b.target}</p>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-indigo-600 text-sm font-black group-hover:translate-x-1 transition-transform inline-block">자세히 보기 →</span>
                  {b.isEmergency && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                </div>
              </Link>
            ))}
            {filteredBenefits.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
                해당 지역의 예정된 혜택이 없습니다.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <h1 className="text-xl font-black tracking-tighter text-white">수도권N라이프</h1>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                수도권 지역의 알짠 정보와 에디터의 생생한 리뷰를 큐레이션하는 프리미엄 로컬 포털입니다. 우리의 도시가 더욱 즐거워지도록 매일 새로운 소식을 전합니다.
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="text-white font-bold text-sm">바로가기</h5>
              <ul className="text-sm space-y-2 font-medium">
                <li><Link href="/festivals/" className="hover:text-white transition-colors">축제/행사</Link></li>
                <li><Link href="/benefits/" className="hover:text-white transition-colors">지원금/혜택</Link></li>
                <li><Link href="/blog/" className="hover:text-white transition-colors">블로그</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-white font-bold text-sm">정보 안내</h5>
              <ul className="text-sm space-y-2 font-medium">
                <li>데이터 출처: 공공데이터포털</li>
                <li>마지막 업데이트: 2026.04.05</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold tracking-wider uppercase">© 2026 Metropolitan N-Life. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
