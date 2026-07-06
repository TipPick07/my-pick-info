import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "이용약관 | 팁픽(Tip-Pick)",
  alternates: { canonical: "/terms/" },
  description: "팁픽(Tip-Pick) 서비스 이용약관을 확인하세요.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className="container mx-auto max-w-3xl px-6 py-16 space-y-10">

        <div className="space-y-2">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-black text-slate-900">이용약관</h1>
          <p className="text-slate-500 text-sm">최종 업데이트: 2026년 4월 27일</p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-10 space-y-8 text-slate-700 text-[15px] leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제1조 (목적)</h2>
            <p>
              본 약관은 팁픽(이하 &quot;팁픽&quot; 또는 &quot;사이트&quot;)이 제공하는 정보 큐레이션 서비스의
              이용과 관련하여 팁픽과 이용자 사이의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제2조 (서비스의 내용)</h2>
            <p>
              팁픽은 정부·지자체의 공식 자료를 바탕으로
              정부 지원금·복지, 경제·생활 정보를 제공합니다.
            </p>
            <p>팁픽이 제공하는 정보는 다음을 포함합니다.</p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li>경제·세금·생활 정보</li>
              <li>정부·지자체 지원금 및 혜택 정보</li>
              <li>마감 임박 지원금 알림</li>
              <li>블로그 형태의 생활 정보 콘텐츠</li>
            </ul>
            <p>
              제공되는 정보는 정확성을 위해 최선을 다하나, 원본 데이터 변경 또는 API 오류로 인해
              실제 공고와 차이가 있을 수 있습니다. 지원금 신청 등 중요한 사안은 반드시 해당 기관의
              공식 공고문을 재확인하시기 바랍니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제3조 (서비스 이용)</h2>
            <ol className="list-decimal pl-6 space-y-1 text-slate-600">
              <li>팁픽의 서비스는 별도의 회원가입 없이 무료로 이용할 수 있습니다.</li>
              <li>이용자는 본 약관에 동의하는 조건으로 서비스를 이용할 수 있습니다.</li>
              <li>팁픽은 서비스 제공을 위해 광고를 게재할 수 있으며, 이용자는 이에 동의합니다.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제4조 (이용자의 의무)</h2>
            <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ol className="list-decimal pl-6 space-y-1 text-slate-600">
              <li>팁픽이 제공하는 정보를 상업적 목적으로 무단 복제·배포·판매하는 행위</li>
              <li>팁픽의 운영을 방해하거나 서버에 과부하를 일으키는 행위</li>
              <li>타인의 권리를 침해하거나 법령에 위반되는 행위</li>
              <li>팁픽이 제공하는 정보를 왜곡하여 제3자를 기망하는 행위</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제5조 (지식재산권)</h2>
            <p>
              팁픽이 작성한 블로그 콘텐츠, 디자인, 로고 등 모든 저작물의 지식재산권은
              팁픽에 귀속됩니다. 단, 공공기관이 제공하는 공공데이터는 해당 기관의
              이용 정책을 따릅니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제6조 (광고 및 외부 링크)</h2>
            <ol className="list-decimal pl-6 space-y-1 text-slate-600">
              <li>팁픽은 Google AdSense, 쿠팡 파트너스 등 광고 및 제휴 서비스를 운영합니다.</li>
              <li>
                팁픽 내 외부 링크(공식 기관 홈페이지 등)는 이용자의 편의를 위해 제공되며,
                연결된 외부 사이트의 내용에 대한 책임을 지지 않습니다.
              </li>
              <li>광고를 통한 구매·신청 등은 이용자의 판단과 책임 하에 이루어집니다.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제7조 (면책)</h2>
            <ol className="list-decimal pl-6 space-y-1 text-slate-600">
              <li>
                팁픽은 이용자가 서비스를 통해 얻은 정보를 토대로 내린 결정 및 이로 인해
                발생한 손해에 대하여 책임을 지지 않습니다.
              </li>
              <li>
                지원금 신청 기간 초과, 서류 미비 등으로 인한 불이익에 대해 팁픽은 법적 책임을
                지지 않습니다.
              </li>
              <li>
                팁픽은 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해
                책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제8조 (서비스 변경 및 중단)</h2>
            <p>
              팁픽은 운영상·기술상 필요에 따라 서비스 내용을 변경하거나 중단할 수 있으며,
              이 경우 사전에 공지합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제9조 (약관의 변경)</h2>
            <p>
              팁픽은 필요에 따라 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해
              고지합니다. 계속적인 서비스 이용은 변경된 약관에 동의하는 것으로 간주합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>제10조 (준거법 및 관할)</h2>
            <p>
              본 약관은 대한민국 법률에 따라 해석되며, 팁픽과 이용자 간 분쟁이 발생할 경우
              민사소송법상 관할 법원을 제1심 법원으로 합니다.
            </p>
          </section>

          <section className="space-y-3 pt-2 border-t border-slate-100">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#00CCFF" }}>문의</h2>
            <p className="font-bold">
              📧{" "}
              <a href="mailto:jeepno1ykr1@gmail.com" className="underline" style={{ color: "#00CCFF" }}>
                jeepno1ykr1@gmail.com
              </a>
            </p>
            <p className="text-slate-500">사이트: tip-pick.com</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
