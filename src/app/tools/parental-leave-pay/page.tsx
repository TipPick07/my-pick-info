import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ParentalLeavePayCalculator from "@/components/ParentalLeavePayCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/parental-leave-pay/";

export const metadata: Metadata = {
  title: "육아휴직급여 계산기 2026 | 통상임금 기준 예상액 | 팁픽",
  description:
    "월 통상임금과 사용 개월수만 입력하면 육아휴직급여 예상액을 바로 계산합니다. 1~3개월 100%(상한 250만)·6+6 부모육아휴직제까지 반영한 2026년 참고용 계산기.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "육아휴직급여 계산기 2026 | 통상임금 기준 예상액 | 팁픽",
    description:
      "월 통상임금·사용 개월수로 육아휴직급여 예상액을 바로 계산. 6+6 부모육아휴직제 반영, 2026년 기준 참고용.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function ParentalLeavePayToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            육아휴직급여 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            월 통상임금과 사용 개월수만 입력하면{" "}
            <span className="font-black text-brand-dark">예상 육아휴직급여</span>를 바로 계산해
            드려요. 2025년 개편(상한 인상·사후지급금 폐지)과 6+6 부모육아휴직제까지 반영합니다.
          </p>
        </header>

        <ParentalLeavePayCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">육아휴직급여는 어떻게 계산되나요?</h2>
            <p>
              2025년 개편으로 육아휴직급여 상한이 크게 올랐습니다. 지급 구조는{" "}
              <strong className="text-slate-800">
                1~3개월은 통상임금 100%(상한 250만 원), 4~6개월은 100%(상한 200만 원), 7개월 이후는
                80%(상한 160만 원)
              </strong>
              이며, 하한은 월 70만 원입니다. 통상임금이 상한보다 높으면 상한까지만 지급되고, 낮으면
              통상임금대로 받습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">사후지급금이 없어졌어요</h2>
            <p>
              예전에는 육아휴직급여의 25%를 복직 6개월 뒤에 주는{" "}
              <strong className="text-slate-800">사후지급금</strong> 제도가 있었지만, 2025년부터
              폐지됐습니다. 이제는 급여 전액을 휴직 기간 중 매월 받기 때문에, 휴직 중 현금 흐름이
              한결 나아졌습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">6+6 부모육아휴직제</h3>
            <p>
              생후 18개월 이내 자녀를 두고 부모가 모두 육아휴직을 사용하면, 첫 6개월간 부모 각자에게{" "}
              <strong className="text-slate-800">
                통상임금 100%를 월 상한 250·250·300·350·400·450만 원
              </strong>
              까지 지급합니다. 위 계산기에서 &lsquo;6+6 부모육아휴직제&rsquo; 탭을 누르면 한 사람
              기준 금액을 확인할 수 있고, 부부가 각각 받으므로 실제 가구 지원액은 두 사람 몫을 합한
              규모가 됩니다. 7개월 이후에는 일반 기준(80%·상한 160만 원)으로 전환됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">함께 챙기면 좋은 지원</h3>
            <p>
              출산·육아 시기에는 매달 받는{" "}
              <Link href="/blog/2026-07-06-parental-allowance-guide/" className="text-brand-dark font-bold underline underline-offset-2">부모급여</Link>
              , 출생 시 목돈인{" "}
              <Link href="/blog/2026-07-06-birth-support-benefits/" className="text-brand-dark font-bold underline underline-offset-2">첫만남이용권·출산 지원금</Link>
              도 함께 챙기세요. 정부 지원금 전체는{" "}
              <Link href="/benefits/" className="text-brand-dark font-bold underline underline-offset-2">정부 지원금</Link>{" "}
              페이지에서 볼 수 있습니다.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 통상임금 기반의{" "}
            <strong className="text-slate-700">참고용 근사치</strong>입니다. 실제 급여는 통상임금
            산정·근무일수·고용보험 가입 기간에 따라 달라질 수 있으며, 정확한 금액은 고용24
            (work24.go.kr)와 고용센터에서 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
