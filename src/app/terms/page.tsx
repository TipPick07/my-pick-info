import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "이용약관 | 수도권 팁픽(Tip-Pick)",
  description: "팁픽(Tip-Pick) 서비스 이용약관을 확인하세요.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-3xl px-6 py-16 space-y-10">

        <div className="space-y-2">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-black text-slate-900">이용약관</h1>
          <p className="text-slate-500 text-sm">최종 업데이트: 2026년 4월 6일</p>
        </div>

        <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-10 space-y-8 text-slate-700 text-[15px] leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제1조 (목적)</h2>
            <p>본 약관은 수도권 팁픽(이하 "팁픽" 또는 "서비스")이 제공하는 정보 큐레이션 서비스의 이용과 관련하여 팁픽과 이용자 사이의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제2조 (서비스의 내용)</h2>
            <p>팁픽은 공공데이터포털(data.go.kr) 및 각 지방자치단체의 공식 API를 활용하여 수도권(서울·인천·경기) 지역의 축제·행사, 지원금·혜택 정보를 제공합니다.</p>
            <p>제공되는 정보는 정확성을 위해 최선을 다하나, 원본 데이터 변경 또는 API 오류로 인해 실제 공고와 차이가 있을 수 있습니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제3조 (이용자의 의무)</h2>
            <p>이용자는 본 서비스를 통해 제공되는 정보를 상업적 목적으로 무단 복제·배포하여서는 안 됩니다. 모든 정보는 개인적·비영리적 이용에 한합니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제4조 (면책)</h2>
            <p>팁픽은 이용자가 서비스를 통해 얻은 정보를 토대로 내린 결정 및 이로 인해 발생한 손해에 대하여 책임을 지지 않습니다. 지원금 신청 전에는 반드시 해당 기관의 공식 공고문을 확인하시기 바랍니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제5조 (약관의 변경)</h2>
            <p>팁픽은 필요에 따라 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 고지합니다. 계속적인 서비스 이용은 변경된 약관에 동의하는 것으로 간주합니다.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
