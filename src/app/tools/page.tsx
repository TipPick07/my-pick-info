import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "실생활 계산기 | 연봉 실수령액·4대보험·종합소득세·대출 계산 | 팁픽",
  description:
    "연봉 실수령액, 대출 이자 등 실생활에 꼭 필요한 계산을 한 곳에서. 복잡한 숫자를 입력 한 번으로 정리해 드립니다.",
  alternates: { canonical: "/tools/" },
};

interface Tool {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  accent: string;
  ready: boolean;
}

const TOOLS: Tool[] = [
  {
    href: "/tools/salary/",
    emoji: "💸",
    title: "연봉 실수령액 계산기",
    desc: "4대보험·세금 공제 후 월급 실수령액을 바로 확인",
    accent: "#059669",
    ready: true,
  },
  {
    href: "/tools/loan/",
    emoji: "🏦",
    title: "대출 이자 계산기",
    desc: "원리금·원금균등 월 상환금과 총이자 한눈에",
    accent: "#007AA3",
    ready: true,
  },
  {
    href: "/tools/income-tax/",
    emoji: "🧾",
    title: "종합소득세 계산기",
    desc: "과세표준별 산출세액·지방세·실효세율 계산",
    accent: "#7C3AED",
    ready: true,
  },
  {
    href: "/tools/insurance/",
    emoji: "🛡️",
    title: "4대보험 계산기",
    desc: "국민연금·건강·장기요양·고용 근로자 부담액",
    accent: "#0EA5E9",
    ready: true,
  },
  {
    href: "/tools/retirement-pay/",
    emoji: "💼",
    title: "퇴직금 계산기",
    desc: "평균임금 기준 예상 퇴직금 계산",
    accent: "#DC2626",
    ready: true,
  },
  {
    href: "/tools/hourly-wage/",
    emoji: "⏰",
    title: "시급·주휴수당 계산기",
    desc: "주휴 포함 주급·월급, 최저임금 비교",
    accent: "#EA580C",
    ready: true,
  },
  {
    href: "/tools/car-tax/",
    emoji: "🚗",
    title: "자동차세 계산기",
    desc: "배기량·차령별 연간 자동차세",
    accent: "#0891B2",
    ready: true,
  },
  {
    href: "/tools/savings-interest/",
    emoji: "🐷",
    title: "예금·적금 이자 계산기",
    desc: "세후 만기 수령액(단리·복리)",
    accent: "#CA8A04",
    ready: true,
  },
  {
    href: "/tools/rent-conversion/",
    emoji: "🔄",
    title: "전월세 전환 계산기",
    desc: "전세·월세 전환(법정 전환율) 월세·보증금 환산",
    accent: "#0D9488",
    ready: true,
  },
  {
    href: "/tools/brokerage-fee/",
    emoji: "🏠",
    title: "부동산 중개보수 계산기",
    desc: "매매·전세·월세 복비를 법정 상한요율로 계산",
    accent: "#9333EA",
    ready: true,
  },
  {
    href: "/tools/annual-leave-allowance/",
    emoji: "🌴",
    title: "연차수당 계산기",
    desc: "미사용 연차 × 1일 통상임금 자동 계산",
    accent: "#16A34A",
    ready: true,
  },
  {
    href: "/tools/overseas-stock-tax/",
    emoji: "📈",
    title: "해외주식 양도세 계산기",
    desc: "연간 실현손익 → 250만 공제 후 양도세(22%)",
    accent: "#4F46E5",
    ready: true,
  },
  {
    href: "/tools/median-income/",
    emoji: "📊",
    title: "기준 중위소득 계산기",
    desc: "가구원수별 생계·주거급여 선정기준",
    accent: "#DB2777",
    ready: true,
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 md:py-14 space-y-10">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black text-brand-dark bg-cyan-50">
            🧮 실생활 계산기
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">실생활 계산기</h1>
          <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
            연봉·대출·세금까지, 복잡한 숫자를 입력 한 번으로 정리해 드립니다. 모든 계산은 사이트 안에서 바로 이뤄집니다.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOOLS.map((t) =>
            t.ready ? (
              <Link
                key={t.title}
                href={t.href}
                className="group bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_6px_24px_rgba(0,204,255,0.12)] transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: `${t.accent}14` }}
                >
                  {t.emoji}
                </div>
                <h2 className="text-lg font-black text-slate-900 group-hover:text-brand-dark transition-colors">{t.title}</h2>
                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{t.desc}</p>
                <span className="inline-block mt-4 text-sm font-bold text-brand-dark">계산하러 가기 →</span>
              </Link>
            ) : (
              <div
                key={t.title}
                className="bg-slate-50 rounded-[1.5rem] border border-slate-100 p-6 opacity-70"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-slate-200/60">
                  {t.emoji}
                </div>
                <h2 className="text-lg font-black text-slate-400">{t.title}</h2>
                <p className="text-slate-400 text-sm mt-1.5">{t.desc}</p>
                <span className="inline-block mt-4 text-xs font-bold text-slate-400 bg-slate-200/70 px-3 py-1 rounded-full">곧 공개</span>
              </div>
            )
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
