import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SalaryCalculator from "@/components/SalaryCalculator";

/**
 * 연봉 실수령액 계산기 — 독립 정적 라우트(서버 컴포넌트).
 *
 * ▷ output:"export" + trailingSlash → metadata 내보내기 위해 서버 컴포넌트 유지.
 * ▷ 인터랙티브 로직은 "use client" <SalaryCalculator/>로 분리.
 * ▷ 본 페이지 본문은 SEO/애드센스용 정보 섹션 포함.
 */

const SITE = "https://tip-pick.com";
const PATH = "/tools/salary/";

export const metadata: Metadata = {
  title: "연봉 실수령액 계산기 2026 | 4대보험·세금 공제 후 월급 | 팁픽",
  description:
    "2026년 기준 연봉 실수령액 계산기. 국민연금·건강보험·장기요양·고용보험과 소득세·지방소득세를 공제한 월 실수령액과 연 실수령액을 바로 확인하세요. 비과세액·부양가족 반영.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "연봉 실수령액 계산기 2026 | 4대보험·세금 공제 후 월급 | 팁픽",
    description:
      "연봉을 입력하면 4대보험과 세금을 뺀 월 실수령액을 바로 계산합니다. 비과세액·부양가족 수까지 반영한 2026년 기준 참고용 계산기.",
  },
};

export default function SalaryToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        {/* 헤더 */}
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            연봉 실수령액 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            연봉을 입력하면 4대보험과 세금을 뺀{" "}
            <span className="font-black text-brand-dark">월 실수령액</span>을 바로
            계산해 드려요. 비과세액과 부양가족 수까지 반영한 2026년 기준
            계산입니다.
          </p>
        </header>

        {/* 계산기 위젯 */}
        <SalaryCalculator />

        {/* ── SEO / 정보 섹션 ── */}
        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">
              실수령액이란 무엇인가요?
            </h2>
            <p>
              실수령액은 계약서에 적힌 연봉이나 세전 월급에서{" "}
              <strong className="text-slate-800">4대보험료와 세금이 모두 빠진 뒤</strong>,
              실제로 내 통장에 입금되는 금액을 말합니다. 흔히 &quot;세후 월급&quot;,
              &quot;실수령&quot;이라고도 부르죠. 같은 연봉이라도 비과세 항목, 부양가족 수에
              따라 실수령액이 달라지기 때문에, 단순히 연봉을 12로 나눈 금액과는 차이가
              납니다. 이직이나 연봉 협상을 앞두고 있다면, 세전 숫자보다 이
              &quot;실제로 손에 들어오는 금액&quot;을 기준으로 비교하는 것이 훨씬 현실적인
              판단에 도움이 됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">
              연봉에서 왜 4대보험과 세금이 빠지나요?
            </h2>
            <p>
              월급에서 빠지는 항목은 크게 <strong className="text-slate-800">4대보험</strong>과{" "}
              <strong className="text-slate-800">세금</strong> 두 가지로 나뉩니다. 4대보험은
              국민연금, 건강보험, 장기요양보험, 고용보험으로 구성되며, 노후 연금·의료비·실업
              급여 등을 보장받기 위해 근로자와 회사가 나누어 부담합니다. 근로자가 부담하는
              비율은 대략 국민연금 4.75%, 건강보험 3.595%, 장기요양보험(건강보험료의 약 13.14%),
              고용보험 0.9% 수준입니다. 여기에 더해 매달 미리 떼어 두는{" "}
              <strong className="text-slate-800">소득세(원천징수)</strong>와, 소득세의 10%에
              해당하는 <strong className="text-slate-800">지방소득세</strong>가 함께 공제됩니다.
              소득세는 부양가족이 많을수록 줄어드는 구조라, 같은 연봉이라도 가족 구성에 따라
              실수령액이 달라집니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">
              비과세액은 어떤 의미인가요?
            </h3>
            <p>
              비과세액은 말 그대로 <strong className="text-slate-800">세금과 보험료가 부과되지
              않는 급여</strong>를 뜻합니다. 대표적으로 월 20만원까지의 식대, 일정 한도의
              자가운전 보조금, 출산·보육 수당 등이 비과세 항목에 해당합니다. 같은 연봉이라도
              비과세 비중이 크면 과세 대상 금액이 줄어들어, 4대보험료와 소득세 부담이 낮아지고
              결과적으로 실수령액이 늘어납니다. 그래서 연봉을 비교할 때는 총액뿐 아니라{" "}
              <strong className="text-slate-800">비과세 항목이 얼마나 포함되어 있는지</strong>도
              함께 살펴보는 것이 좋습니다. 위 계산기에서 월 비과세액을 조정해 보면, 실수령액이
              어떻게 달라지는지 직접 확인할 수 있습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">함께 보면 좋은 도구·글</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/tools/insurance/" className="font-bold text-brand-dark underline underline-offset-2">4대보험 계산기</Link>
                {" "}— 월급에서 빠지는 국민연금·건강보험·고용보험료만 따로 떼어 확인할 수 있습니다.
              </li>
              <li>
                <Link href="/tools/income-tax/" className="font-bold text-brand-dark underline underline-offset-2">종합소득세 계산기</Link>
                {" "}— 프리랜서·부업 소득이 있다면 5월 종합소득세 예상 세액도 함께 계산해 보세요.
              </li>
              <li>
                <Link href="/blog/2026-06-27-net-salary-2026-guide/" className="font-bold text-brand-dark underline underline-offset-2">연봉 실수령액 가이드</Link>
                {" "}— 연봉 구간별 실수령액 표와 공제 구조를 자세히 정리한 글입니다.
              </li>
            </ul>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 2026년 요율을 바탕으로 한{" "}
            <strong className="text-slate-700">참고용 근사치</strong>입니다. 소득세는 근로소득
            간이세액을 단순화하여 추정하므로, 실제 회사에서 적용하는 원천징수액 및 연말정산
            결과와 차이가 있을 수 있습니다. 정확한 금액은 국세청 홈택스 또는 회사 급여 담당
            부서를 통해 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
