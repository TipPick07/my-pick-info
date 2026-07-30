import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnualLeaveAllowanceCalculator from "@/components/AnnualLeaveAllowanceCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/annual-leave-allowance/";

export const metadata: Metadata = {
  title: "연차수당 계산기 2026 | 미사용 연차 통상임금 계산 | 팁픽",
  description:
    "월 통상임금과 미사용 연차 일수만 입력하면 통상시급·1일 통상임금·연차수당을 바로 계산합니다. 통상임금 209시간 기준, 2026년 참고용 연차수당 계산기.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "연차수당 계산기 2026 | 미사용 연차 통상임금 계산 | 팁픽",
    description:
      "월 통상임금과 미사용 연차 일수로 연차수당을 바로 계산. 통상시급·1일 통상임금 자동 산정, 2026년 기준 참고용.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function AnnualLeaveAllowanceToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            연차수당 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            월 통상임금과 미사용 연차 일수만 입력하면{" "}
            <span className="font-black text-brand-dark">통상시급·1일 통상임금·연차수당</span>을
            바로 계산해 드려요.
          </p>
        </header>

        <AnnualLeaveAllowanceCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">연차수당은 어떻게 계산하나요?</h2>
            <p>
              연차수당은{" "}
              <strong className="text-slate-800">1일 통상임금 × 미사용 연차일수</strong>로
              계산합니다. 쓰지 못하고 남은 연차를 회사가 돈으로 정산해 주는 것이에요. 여기서
              &lsquo;1일 통상임금&rsquo;은 통상시급에 하루 소정근로시간(주 40시간 근무자는 8시간)을 곱한
              값입니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">통상임금·통상시급이 무엇인가요?</h2>
            <p>
              통상임금은 기본급처럼{" "}
              <strong className="text-slate-800">정기적·일률적·고정적으로 지급되는 임금</strong>을
              말합니다. 성과급이나 변동 수당은 대체로 빠집니다. 통상시급은{" "}
              <strong className="text-slate-800">월 통상임금 ÷ 월 소정근로시간</strong>으로 구하는데,
              주 40시간 근무자는 주휴시간을 포함해 월 209시간을 적용합니다. 예를 들어 월 통상임금이
              300만원이면 통상시급은 약 14,354원, 1일 통상임금(8시간)은 약 114,832원이 됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">연차는 며칠 생기나요?</h3>
            <p>
              근로기준법상 1년간 80% 이상 출근하면{" "}
              <strong className="text-slate-800">15일</strong>의 연차가 생깁니다. 입사 1년 미만이면
              1개월 개근할 때마다 1일씩(최대 11일) 발생하고, 3년 이상 계속 근무하면 2년마다 1일씩
              가산되어 <strong className="text-slate-800">최대 25일</strong>까지 늘어납니다. 이렇게 생긴
              연차 중 쓰지 못한 일수에 위 계산이 적용됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">함께 보면 좋은</h3>
            <p>
              퇴직·이직을 앞두고 있다면{" "}
              <Link href="/guides/unemployment-benefit-guide/" className="font-bold text-brand-dark underline underline-offset-2">
                실업급여·고용보험 완전정복
              </Link>
              , 퇴직금이 궁금하면{" "}
              <Link href="/tools/retirement-pay/" className="font-bold text-brand-dark underline underline-offset-2">
                퇴직금 계산기
              </Link>
              , 더 많은 돈 이야기는{" "}
              <Link href="/money/" className="font-bold text-brand-dark underline underline-offset-2">
                돈이 되는 경제
              </Link>
              에서 이어서 볼 수 있어요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 통상임금 기반의{" "}
            <strong className="text-slate-700">참고용 근사치</strong>입니다. 통상임금에 포함되는 수당의
            범위·월 소정근로시간·회사 규정에 따라 실제 금액과 차이가 있을 수 있으며, 세전 기준입니다.
            연차수당 청구권의 소멸시효는 원칙적으로 3년입니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
