import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { CheckCircle2, Lightbulb } from "lucide-react";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata = {
  title: "팁픽은 왜 만들었나 | 팁픽(Tip-Pick)",
  description: "데이터는 공공기관이, 꿀팁은 팁픽이. 복잡한 공공데이터 속에서 당신에게 필요한 진짜 이득만 골라내는 스마트한 전구, 팁픽입니다.",
};

const verifiedFeatures = [
  "매일 자동화 시스템이 공공데이터포털 API를 동기화",
  "AI가 핵심 혜택을 추출하고 에디터가 최종 검수",
  "접근 가능한 공식 신청 링크만 직접 검증하여 제공",
  "지역·대상별 맞춤 필터로 나에게 꼭 맞는 혜택 탐색",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-20 max-w-4xl space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.4)]">
              <Image
                src="/images/logo-tippick.png"
                alt="팁픽 로고"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 text-cyan-700 text-xs font-black uppercase tracking-widest rounded-full border border-cyan-200">
            팁픽은 왜 만들었나
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.15]">
            데이터는 공공기관이,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">꿀팁은 팁픽이.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            복잡한 공공데이터 속에서 오직 당신에게 필요한{" "}
            <span className="font-black text-slate-800">'진짜 이득'</span>만 골라내는
            스마트한 전구, 팁픽입니다.
          </p>
        </section>

        {/* Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border-2 border-cyan-100 shadow-sm hover:shadow-[0_8px_30px_rgba(6,182,212,0.1)] transition-all space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
              <Lightbulb className="w-7 h-7 text-cyan-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">왜 만들었나요?</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              정보의 홍수 속에서 내 지역에 꼭 맞는 혜택과 행사를 찾기는 쉽지 않습니다.
              팁픽은 복잡한 공공 데이터를 친숙한 매거진 스타일로 가공하여,
              지역 주민들이 신청 기회를 놓치지 않도록 돕기 위해 탄생했습니다.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-all space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">데이터 출처</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              제공되는 모든 정보는 공공데이터포털(data.go.kr) 및 각 지방자치단체의
              공식 API 데이터를 바탕으로 합니다. 매일 자동화 시스템이 데이터를
              동기화하고, 에디터가 최종 검수합니다.
            </p>
          </div>
        </section>

        {/* 검증된 정보 섹션 */}
        <section className="bg-slate-900 p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />

          <div className="relative space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                ✓ 팁픽의 검증 시스템
              </div>
              <h3 className="text-3xl font-black text-white">AI + 에디터 협업, 이중 검증</h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl">
                팁픽의 모든 콘텐츠는 Gemini AI가 방대한 공공 데이터를 분석하고,
                에디터가 최종 검수하는 <span className="text-white font-black">이중 검증 시스템</span>으로 운영됩니다.
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 font-medium text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <CoupangBanner />
      </main>

      <Footer />
    </div>
  );
}
