"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

  if (!data) return <div className="flex items-center justify-center h-screen font-bold text-slate-400">팁픽이 정보를 불러오는 중입니다...</div>;

  const filteredBenefits = filter === "전체"
    ? data.benefits
    : data.benefits.filter(b => b.region === filter || b.region === "전국");

  const regions = ["전체", "서울", "인천", "경기"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Page Hero */}
        <section className="text-center space-y-6 py-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-200">
            💡 내 돈 찾는 지원금
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              오늘 팁픽이 골라낸{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                지원금/혜택
              </span>
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              복잡한 공공데이터 속에서 당신에게 꼭 필요한 지원금을 팁픽이 대신 선별했습니다.{" "}
              <span className="font-black text-slate-700">지금 바로 확인해 보세요!</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  filter === r
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_4px_20px_rgba(6,182,212,0.4)]"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBenefits.map((b) => (
              <Link
                key={b.id}
                href={`/benefit/${b.id}`}
                className={`block p-8 rounded-[2.5rem] border-2 transition-all hover:-translate-y-1 hover:shadow-2xl group ${
                  b.isEmergency
                    ? "border-rose-100 bg-white hover:shadow-rose-100/50 hover:border-rose-200"
                    : "border-slate-100 bg-white hover:shadow-cyan-100/50 hover:border-cyan-200"
                }`}
              >
                {/* 카드 상단 아이콘 */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 ${
                  b.isEmergency ? "bg-rose-50" : "bg-cyan-50"
                }`}>
                  💡
                </div>

                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${
                    b.isEmergency
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {b.region}
                  </span>
                  <span className={`text-sm font-bold ${b.isEmergency ? "text-rose-600" : "text-slate-400"}`}>
                    {b.deadline}
                  </span>
                </div>

                <h4 className="text-xl font-black text-slate-900 mb-3 leading-snug group-hover:text-cyan-600 transition-colors">
                  {b.title}
                </h4>
                <p className="text-slate-500 text-sm font-bold mb-6">{b.target}</p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-cyan-600 text-sm font-black group-hover:translate-x-1 transition-transform inline-block">
                    팁픽 가이드 보기 →
                  </span>
                  {b.isEmergency && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
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

      <Footer />
    </div>
  );
}
