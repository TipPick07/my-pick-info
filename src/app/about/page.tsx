import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { CheckCircle2, Lightbulb } from "lucide-react";

export const metadata = {
  title: "팁픽은 왜 만들었나 | 팁픽(Tip-Pick)",
  alternates: { canonical: "/about/" },
  description: "지원금·경제·세금·생활정보를 비전문가도 이해하게 쉽게 정리하는 팁픽입니다.",
};

const principles = [
  "공식 자료·근거를 직접 확인하고 정리",
  "비전문가도 이해하게 쉬운 말로 재구성",
  "수치에는 기준 시점과 출처를 함께 표기",
  "확실하지 않으면 단정하지 않고, 공식 확인을 안내",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100">
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
            복잡한 정보,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">꼭 필요한 것만.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            정부 지원금·경제·세금부터 실생활 계산기까지 — 어렵고 흩어진 정보를{" "}
            <span className="font-black text-slate-800">비전문가 눈높이</span>로 정리해 드립니다.
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
              지원금·세금·경제 정보는 어렵고 여기저기 흩어져 있어, 정작 필요한 사람이
              기회를 놓치기 쉽습니다. 팁픽은 이런 정보를 비전문가도 이해하기 쉽게 정리해,
              꼭 필요한 분들이 놓치지 않도록 돕기 위해 시작했습니다.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-all space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">어떻게 정리하나요?</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              에디터가 정부·기관의 공식 자료와 근거를 직접 확인하고, 비전문가도 이해하기
              쉽게 다시 씁니다. 모든 수치에는 기준 시점과 출처를 함께 밝힙니다.
            </p>
          </div>
        </section>

        {/* 팁픽이 일하는 방식 */}
        <section className="bg-slate-900 p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />

          <div className="relative space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                ✓ 팁픽이 일하는 방식
              </div>
              <h3 className="text-3xl font-black text-white">에디터가 직접 쓰고, 근거를 확인합니다</h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl">
                팁픽의 모든 콘텐츠는 에디터가 공식 자료를 직접 확인하고,{" "}
                <span className="text-white font-black">비전문가 눈높이로 정리</span>해 제공합니다.
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {principles.map((p, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 font-medium text-sm leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 운영자 소개 */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 md:p-14 space-y-6 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-black uppercase tracking-widest rounded-full border border-cyan-200">
              운영자 소개
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-md">
              팁
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xl font-black text-slate-900">팁픽 운영자</p>
                <p className="text-sm text-slate-400 font-medium">1인이 직접 만들고 운영합니다</p>
              </div>
              <div className="text-slate-600 leading-relaxed space-y-3 font-medium">
                <p>
                  안녕하세요. 팁픽을 직접 만들고 운영하는 평범한 직장인입니다.
                </p>
                <p>
                  팁픽을 만들게 된 계기는 단순했어요. 지원금이나 세금 같은 정보를 찾으려고 할 때마다
                  너무 불편했거든요. 여러 사이트를 돌아다니고, 공고문을 뒤지고, 그러다 마감을
                  놓치기도 했습니다.
                </p>
                <p>
                  &quot;내가 직접 만들면 되겠다&quot; 싶어서 작은 정보 사이트로 시작했는데,
                  하다 보니 욕심이 생겼어요. 그래서 지금은 지원금·경제·생활정보를
                  폭넓게 다루는 팁픽이 됐습니다.
                </p>
                <p>
                  저처럼 바쁜 일상 속에서 꼭 필요한 정보를 놓치는 분들이 없었으면 하는 마음으로,
                  오늘도 팁픽을 운영하고 있습니다.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-3 text-sm">
                <a
                  href="mailto:jeepno1ykr1@gmail.com"
                  className="bg-cyan-50 border border-cyan-200 px-4 py-1.5 rounded-full font-bold transition-colors hover:bg-cyan-100"
                  style={{ color: "#00AACC" }}
                >
                  📧 jeepno1ykr1@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
