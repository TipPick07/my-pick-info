import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RetirementPayCalculator from "@/components/RetirementPayCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/retirement-pay/";

export const metadata: Metadata = {
  title: "퇴직금 계산기 2026 | 평균임금 기준 예상 퇴직금 | 팁픽",
  description:
    "입사일·퇴사일과 최근 3개월 급여만 입력하면 평균임금 기준 예상 퇴직금을 바로 계산합니다. 상여금·연차수당까지 반영한 2026년 참고용 퇴직금 계산기.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "퇴직금 계산기 2026 | 평균임금 기준 예상 퇴직금 | 팁픽",
    description:
      "입사일·퇴사일과 최근 3개월 급여로 예상 퇴직금을 바로 계산. 상여금·연차수당 반영, 2026년 기준 참고용.",
  },
};

export default function RetirementPayToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            퇴직금 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            입사일·퇴사일과 최근 3개월 급여만 입력하면{" "}
            <span className="font-black text-brand-dark">평균임금 기준 예상 퇴직금</span>을
            바로 계산해 드려요. 상여금·연차수당까지 반영합니다.
          </p>
        </header>

        <RetirementPayCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">퇴직금은 어떻게 계산되나요?</h2>
            <p>
              법정 퇴직금은{" "}
              <strong className="text-slate-800">1일 평균임금 × 30일 × (재직일수 ÷ 365)</strong>로
              계산합니다. 1년 이상 계속 근로한 근로자라면 정규직·계약직·아르바이트 구분 없이, 1주
              소정근로시간이 15시간 이상이면 퇴직금을 받을 수 있습니다. 1년 미만 근무라면 퇴직금
              지급 대상이 아닙니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">평균임금이 무엇인가요?</h2>
            <p>
              평균임금은 퇴직 직전{" "}
              <strong className="text-slate-800">3개월 동안 받은 임금 총액을 그 기간의 총일수로
              나눈 1일치 임금</strong>입니다. 기본급뿐 아니라 정기적으로 받은 수당이 포함되며,
              연간 상여금과 연차수당은 3개월분(연액의 3/12)만큼을 더해 반영합니다. 그래서 단순히
              월급을 기준으로 한 금액보다 평균임금이 조금 더 높게 나오는 경우가 많습니다. 위
              계산기에서 상여금·연차수당을 입력하면 이 부분이 자동으로 반영됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">계산할 때 주의할 점</h3>
            <p>
              퇴직금에는 <strong className="text-slate-800">퇴직소득세</strong>가 별도로 부과되므로,
              실제 손에 쥐는 금액은 위 세전 금액보다 다소 줄어듭니다. 퇴직소득세는 근속연수공제와
              환산급여공제를 거쳐 비교적 낮은 세율이 적용되는 구조라 일반 소득세보다 부담이 작은
              편입니다. 또한 회사 규정에 따라 평균임금 산정에 포함되는 수당의 범위가 달라질 수
              있으니, 정확한 금액은 회사 인사·급여 담당 부서나 고용노동부 퇴직금 계산기로 함께
              확인하시기 바랍니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">함께 보면 좋은 도구·글</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/tools/annual-leave-allowance/" className="font-bold text-brand-dark underline underline-offset-2">연차수당 계산기</Link>
                {" "}— 퇴직 시 남은 연차의 수당을 계산해 평균임금 산정에 활용해 보세요.
              </li>
              <li>
                <Link href="/guides/unemployment-benefit-guide/" className="font-bold text-brand-dark underline underline-offset-2">실업급여 가이드</Link>
                {" "}— 퇴사 후 받을 수 있는 실업급여 조건과 금액을 정리한 가이드입니다.
              </li>
              <li>
                <Link href="/blog/2026-06-29-retirement-pay-lump-vs-pension/" className="font-bold text-brand-dark underline underline-offset-2">퇴직금 일시금 vs 연금 비교</Link>
                {" "}— 퇴직금을 한 번에 받을지 연금으로 받을지 세금 관점에서 비교한 글입니다.
              </li>
            </ul>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 평균임금 기반의{" "}
            <strong className="text-slate-700">참고용 근사치</strong>입니다. 직전 3개월 일수와
            수당 구성에 따라 실제 퇴직금과 차이가 있을 수 있으며, 퇴직소득세는 반영되지 않은 세전
            금액입니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
