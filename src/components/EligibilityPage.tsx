"use client";

import { useState, useMemo } from "react";
import { Search, X, ArrowRight, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import EligibilityChecker from "./EligibilityChecker";

interface Benefit {
  id: string;
  region: string;
  title: string;
  target: string;
  deadline: string;
  details: string;
  isEmergency: boolean;
  eligibilityQuiz?: string[];
}

interface BenefitQuestion {
  id: string;
  title: string;
  question: string;
}

interface EligibilityPageProps {
  benefits: Benefit[];
  benefitPool: BenefitQuestion[];
}

const REGIONS = ["전체", "서울", "경기", "인천", "전국"] as const;
type Region = typeof REGIONS[number];

const REGION_COLORS: Record<string, string> = {
  서울: "bg-blue-100 text-blue-700",
  경기: "bg-green-100 text-green-700",
  인천: "bg-purple-100 text-purple-700",
  전국: "bg-orange-100 text-orange-700",
};

function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}

function BenefitCard({ benefit, query }: { benefit: Benefit; query: string }) {
  const regionColor = REGION_COLORS[benefit.region] ?? "bg-slate-100 text-slate-600";

  return (
    <Link
      href={`/benefit/${benefit.id}`}
      className="group block bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${regionColor}`}>
            <MapPin className="w-3 h-3" />
            {benefit.region}
          </span>
          {benefit.isEmergency && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
              긴급
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
            <Clock className="w-3 h-3" />
            {benefit.deadline}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors" />
      </div>

      <h3
        className="font-bold text-slate-800 leading-snug mb-2 group-hover:text-indigo-700 transition-colors [&_mark]:bg-yellow-100 [&_mark]:text-slate-800 [&_mark]:rounded"
        dangerouslySetInnerHTML={{ __html: highlight(benefit.title, query) }}
      />

      {benefit.target && (
        <p
          className="text-sm text-slate-500 line-clamp-2 [&_mark]:bg-yellow-100 [&_mark]:text-slate-700 [&_mark]:rounded"
          dangerouslySetInnerHTML={{ __html: highlight(benefit.target, query) }}
        />
      )}
    </Link>
  );
}

export default function EligibilityPage({ benefits, benefitPool }: EligibilityPageProps) {
  const [tab, setTab] = useState<"search" | "quiz">("quiz");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region>("전체");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return benefits.filter((b) => {
      const matchRegion = region === "전체" || b.region === region;
      if (!matchRegion) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.target?.toLowerCase().includes(q) ||
        b.details?.toLowerCase().includes(q)
      );
    });
  }, [benefits, query, region]);

  return (
    <div className="w-full max-w-2xl">
      {/* 탭 */}
      <div className="flex bg-white border border-slate-200 rounded-2xl p-1.5 mb-8 shadow-sm">
        <button
          onClick={() => setTab("quiz")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all ${
            tab === "quiz"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          💡 퀴즈로 찾기
        </button>
        <button
          onClick={() => setTab("search")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all ${
            tab === "search"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🔍 검색으로 찾기
        </button>
      </div>

      {/* 퀴즈 탭 */}
      {tab === "quiz" && <EligibilityChecker benefitPool={benefitPool} />}

      {/* 검색 탭 */}
      {tab === "search" && (
        <div className="space-y-5">
          {/* 검색창 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="지원금 이름, 대상, 지역을 검색해보세요"
              className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 font-medium shadow-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 지역 필터 */}
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                  region === r
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* 결과 수 */}
          <p className="text-sm font-bold text-slate-400">
            {query || region !== "전체" ? (
              <>
                <span className="text-indigo-600">{filtered.length}개</span>의 혜택이 검색됐어요
              </>
            ) : (
              <>전체 <span className="text-indigo-600">{filtered.length}개</span> 혜택</>
            )}
          </p>

          {/* 결과 목록 */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((b) => (
                <BenefitCard key={b.id} benefit={b} query={query} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center space-y-3">
              <p className="text-4xl">🔍</p>
              <p className="font-bold text-slate-700">검색 결과가 없어요</p>
              <p className="text-sm text-slate-400">다른 키워드나 지역을 선택해보세요</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
