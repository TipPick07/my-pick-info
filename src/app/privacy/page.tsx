import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 | 수도권 팁픽(Tip-Pick)",
  description: "팁픽(Tip-Pick) 개인정보처리방침을 확인하세요.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-3xl px-6 py-16 space-y-10">

        <div className="space-y-2">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-black text-slate-900">개인정보처리방침</h1>
          <p className="text-slate-500 text-sm">최종 업데이트: 2026년 4월 6일</p>
        </div>

        <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-10 space-y-8 text-slate-700 text-[15px] leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>수집하는 개인정보 항목</h2>
            <p>팁픽은 별도의 회원가입을 요구하지 않으며, 개인식별정보를 직접 수집하지 않습니다.</p>
            <p>서비스 품질 개선을 위해 Google Analytics 등 통계 도구를 통해 페이지 방문 횟수, 체류 시간 등 <strong>비식별 집계 데이터</strong>를 자동 수집할 수 있습니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>쿠키(Cookie) 사용</h2>
            <p>팁픽은 서비스 편의성 향상을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>광고 및 제3자 서비스</h2>
            <p>팁픽은 Google AdSense, 쿠팡 파트너스 등의 제3자 광고 서비스를 사용할 수 있습니다. 이러한 서비스는 각 제공사의 개인정보처리방침을 따릅니다.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>문의 및 처리</h2>
            <p>개인정보와 관련한 문의 사항은 아래 이메일로 연락해 주시기 바랍니다.</p>
            <p className="font-bold">
              📧{" "}
              <a href="mailto:jeepno1ykr1@gmail.com" className="underline" style={{ color: "#00CCFF" }}>
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
