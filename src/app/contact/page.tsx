import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Megaphone, Handshake, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "광고 및 제휴 문의 | 수도권 팁픽(Tip-Pick)",
  description: "수도권 팁픽과 함께하실 광고주 및 제휴 파트너를 모집합니다.",
};

const adTypes = [
  {
    icon: Megaphone,
    title: "배너 광고",
    desc: "메인 페이지 및 블로그 페이지에 배너 광고를 게재합니다. 매일 업데이트되는 콘텐츠와 함께 수도권 생활 정보에 관심 있는 독자에게 효과적으로 노출됩니다.",
    color: "cyan",
  },
  {
    icon: Handshake,
    title: "콘텐츠 제휴",
    desc: "지역 행사, 축제, 이벤트 홍보 콘텐츠를 팁픽 에디터가 직접 작성하여 게재합니다. 서울·인천·경기 지역 주민들에게 자연스럽게 행사 정보를 전달합니다.",
    color: "emerald",
  },
  {
    icon: Newspaper,
    title: "뉴스레터 제휴",
    desc: "팁픽 구독자 대상 뉴스레터를 통한 제휴 광고를 제공합니다. 생활 정보에 관심 높은 수도권 독자층에게 직접 메시지를 전달할 수 있습니다.",
    color: "violet",
  },
];

const colorMap: Record<string, { border: string; bg: string; icon: string; badge: string; badgeText: string }> = {
  cyan: {
    border: "border-cyan-100",
    bg: "bg-cyan-50",
    icon: "text-cyan-500",
    badge: "bg-cyan-500/20 border-cyan-500/30",
    badgeText: "text-cyan-400",
  },
  emerald: {
    border: "border-emerald-100",
    bg: "bg-emerald-50",
    icon: "text-emerald-500",
    badge: "bg-emerald-500/20 border-emerald-500/30",
    badgeText: "text-emerald-400",
  },
  violet: {
    border: "border-violet-100",
    bg: "bg-violet-50",
    icon: "text-violet-500",
    badge: "bg-violet-500/20 border-violet-500/30",
    badgeText: "text-violet-400",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100">
      <Header />

      <main className="container mx-auto px-6 py-20 max-w-4xl space-y-20">

        {/* Hero */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 text-cyan-700 text-xs font-black uppercase tracking-widest rounded-full border border-cyan-200">
            광고 및 제휴 문의
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.15]">
            함께 만들어가는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">수도권 생활 정보</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            팁픽은 매일 업데이트되는 수도권 생활 정보 큐레이션 서비스로,{" "}
            <span className="font-black text-slate-800">서울·인천·경기 지역 주민</span>들에게
            지원금, 축제, 행사 정보를 제공합니다.
          </p>
        </section>

        {/* 광고 유형 */}
        <section className="space-y-6">
          <h2 className="text-3xl font-black text-slate-900 text-center">광고 유형</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adTypes.map(({ icon: Icon, title, desc, color }) => {
              const c = colorMap[color];
              return (
                <div
                  key={title}
                  className={`bg-white p-8 rounded-[2.5rem] border-2 ${c.border} shadow-sm hover:shadow-lg transition-all space-y-5`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${c.icon}`} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-sm">{desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 문의 CTA */}
        <section className="bg-slate-900 p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden text-center space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest rounded-full border border-cyan-500/30">
              문의하기
            </div>
            <h3 className="text-3xl font-black text-white">이메일로 문의해 주세요</h3>
            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl mx-auto">
              광고 단가, 게재 일정, 제휴 조건 등 궁금한 사항을 아래 이메일로 보내주시면
              영업일 기준 <span className="text-white font-black">2일 이내</span> 답변 드립니다.
            </p>
            <a
              href="mailto:jeepno1ykr1@gmail.com"
              className="inline-flex items-center gap-3 mt-4 px-8 py-4 rounded-2xl font-black text-lg text-white transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #00CCFF, #33FF99)" }}
            >
              <Mail className="w-5 h-5" />
              jeepno1ykr1@gmail.com
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
