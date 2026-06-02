import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 | 수도권 팁픽(Tip-Pick)",
  description: "팁픽(Tip-Pick) 개인정보처리방침을 확인하세요.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className="container mx-auto max-w-3xl px-6 py-16 space-y-10">

        <div className="space-y-2">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-black text-slate-900">개인정보처리방침</h1>
          <p className="text-slate-500 text-sm">최종 업데이트: 2026년 4월 27일</p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-10 space-y-8 text-slate-700 text-[15px] leading-relaxed">

          <p>
            수도권 팁픽(이하 &quot;팁픽&quot; 또는 &quot;사이트&quot;)은 이용자의 개인정보를 중요하게 생각하며,
            「개인정보 보호법」 및 관련 법령에 따라 아래와 같이 개인정보처리방침을 수립·공개합니다.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>1. 수집하는 개인정보 항목</h2>
            <p>
              팁픽은 별도의 회원가입을 요구하지 않으며, 이용자의 이름·주소·전화번호 등
              개인식별정보를 직접 수집하지 않습니다.
            </p>
            <p>다만, 서비스 품질 개선을 위해 아래 도구를 통해 <strong>비식별 통계 데이터</strong>를 자동 수집할 수 있습니다.</p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li>페이지 방문 횟수</li>
              <li>체류 시간 및 클릭 패턴</li>
              <li>접속 기기 및 브라우저 유형</li>
              <li>유입 경로 (검색어, 참조 URL 등)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>2. 쿠키(Cookie) 사용</h2>
            <p>팁픽 및 제3자 광고·통계 서비스는 쿠키를 사용합니다.</p>
            <p>
              <strong>쿠키란?</strong> 웹사이트가 이용자의 브라우저에 저장하는 소규모 텍스트 파일로,
              이용자를 식별하거나 방문 기록을 저장하는 데 사용됩니다.
            </p>
            <p>
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.
              단, 쿠키를 거부할 경우 일부 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>3. Google AdSense 및 광고 서비스</h2>
            <p>
              팁픽은 <strong>Google AdSense</strong>를 통해 광고를 게재합니다. Google을 포함한
              제3자 광고 업체는 쿠키를 사용하여 이용자의 관심사에 기반한 맞춤형 광고를 제공합니다.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li>Google의 광고 쿠키 사용으로 인해 이용자의 이전 방문 정보가 활용될 수 있습니다.</li>
              <li>
                이용자는{" "}
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#00CCFF" }}>
                  Google 광고 설정
                </a>
                {" "}에서 맞춤형 광고를 비활성화할 수 있습니다.
              </li>
              <li>
                Google 개인정보처리방침:{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#00CCFF" }}>
                  https://policies.google.com/privacy
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>4. Google Analytics</h2>
            <p>
              팁픽은 <strong>Google Analytics</strong>를 사용하여 사이트 방문 통계를 분석합니다.
              수집된 데이터는 익명으로 처리되며 개인 식별에 사용되지 않습니다.
            </p>
            <p>
              Google Analytics 데이터 수집 거부:{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#00CCFF" }}>
                https://tools.google.com/dlpage/gaoptout
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>5. 쿠팡 파트너스 및 기타 제휴 서비스</h2>
            <p>
              팁픽은 쿠팡 파트너스 등 제휴 마케팅 프로그램에 참여할 수 있습니다.
              이를 통해 적격 구매 발생 시 수수료를 받을 수 있으며, 이용자에게 추가 비용은 발생하지 않습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>6. 개인정보의 보유 및 이용 기간</h2>
            <p>
              팁픽은 이용자의 개인정보를 수집 목적 달성 후 즉시 파기합니다.
              단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>7. 개인정보처리방침 변경</h2>
            <p>
              본 방침은 법령·서비스 변경에 따라 업데이트될 수 있습니다.
              변경 시 사이트 내 공지 또는 본 페이지를 통해 안내합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-900 border-l-4 pl-3" style={{ borderColor: "#33FF99" }}>8. 문의</h2>
            <p>개인정보와 관련한 문의사항은 아래로 연락해 주시기 바랍니다.</p>
            <p className="font-bold">
              📧{" "}
              <a href="mailto:jeepno1ykr1@gmail.com" className="underline" style={{ color: "#00CCFF" }}>
                jeepno1ykr1@gmail.com
              </a>
            </p>
            <p className="text-slate-500">운영자: 수도권 팁픽 (tip-pick.com)</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
