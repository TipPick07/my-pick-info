import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "면책공고 | 팁픽(Tip-Pick)",
  alternates: { canonical: "/disclaimer/" },
  description: "팁픽(Tip-Pick) 서비스 면책공고를 확인하세요.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className="container mx-auto max-w-3xl px-6 py-16 space-y-10">

        <div className="space-y-2">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-black text-slate-900">면책공고</h1>
          <p className="text-slate-500 text-sm">최종 업데이트: 2026년 4월 6일</p>
        </div>

        {/* 핵심 경고 박스 */}
        <div
          className="rounded-[2rem] p-8 space-y-2"
          style={{ background: "rgba(0,204,255,0.06)", border: "2px solid rgba(0,204,255,0.2)" }}
        >
          <p className="font-black text-slate-900 text-lg flex items-center gap-2">
            ⚠️ 모든 신청 전 공식 공고문을 반드시 확인하세요.
          </p>
          <p className="text-slate-600 leading-relaxed">
            팁픽이 제공하는 정보는 참고용이며, 실제 공고와 내용이 다를 수 있습니다.
            지원금 신청 등 중요한 사안은 반드시 해당 기관의 원문 공고를 재확인 후 진행해 주세요.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-10 space-y-8 text-slate-700 text-[15px] leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>정보의 정확성</h2>
            <p>팁픽은 정부·지자체의 공식 자료를 바탕으로 정보를 정리하며, 정확한 정보 제공을 위해 최선을 다합니다. 그러나 원천 자료의 변경이나 시점 차이로 제공되는 정보와 실제 공고 간 차이가 발생할 수 있습니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>외부 링크</h2>
            <p>팁픽 내 게시된 외부 사이트(공식 기관 홈페이지 등) 링크는 이용자의 편의를 위해 제공됩니다. 팁픽은 연결된 외부 사이트의 내용에 대한 책임을 지지 않습니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>손해 배상의 한계</h2>
            <p>팁픽이 제공하는 정보를 바탕으로 이용자가 내린 판단 및 이로 인해 발생한 모든 손해(지원금 신청 기간 초과, 서류 미비 등)에 대해 팁픽은 법적 책임을 지지 않습니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>문의</h2>
            <p>
              서비스 관련 문의:{" "}
              <a href="mailto:jeepno1ykr1@gmail.com" className="font-bold underline" style={{ color: "#00CCFF" }}>
                jeepno1ykr1@gmail.com
              </a>
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
