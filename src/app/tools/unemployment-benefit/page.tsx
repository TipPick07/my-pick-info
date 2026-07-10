import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnemploymentBenefitCalculator from "@/components/UnemploymentBenefitCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/unemployment-benefit/";

export const metadata: Metadata = {
  title: "실업급여 계산기 2026 | 1일 구직급여·소정급여일수·총액 확인 | 팁픽",
  description:
    "월 평균임금과 고용보험 가입기간만 넣으면 2026년 실업급여(구직급여) 예상액을 바로 계산. 1일 상한 68,100원·하한 66,048원, 소정급여일수 120~270일 반영.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "실업급여 계산기 2026 | 1일 구직급여·소정급여일수·총액 확인 | 팁픽",
    description:
      "월 평균임금·가입기간으로 2026 실업급여 예상 수령액을 바로 확인. 상한 68,100·하한 66,048원, 120~270일 반영.",
  },
};

export default function UnemploymentBenefitToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            실업급여 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            월 평균임금과 가입기간만 넣으면{" "}
            <span className="font-black text-brand-dark">2026년 구직급여</span> 예상 수령액을 바로
            확인해 드려요.
          </p>
        </header>

        <UnemploymentBenefitCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">실업급여, 어떻게 정해지나요?</h2>
            <p>
              구직급여는 <strong className="text-slate-800">이직 전 3개월 평균임금의 60%</strong>를
              하루 단위로 지급합니다. 다만 2026년(이직일 1월 1일 이후) 기준{" "}
              <strong className="text-slate-800">1일 상한 68,100원·하한 66,048원</strong>이 있어,
              대략 월급 335만~344만 원 구간을 벗어나면 대부분 상한이나 하한 금액을 받게 됩니다.
              받는 기간(소정급여일수)은 이직일 당시 나이와 고용보험 가입기간에 따라{" "}
              <strong className="text-slate-800">120~270일</strong>로 정해집니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">받기 전·후에 챙길 것</h2>
            <p>
              수급 요건(비자발 이직·180일)과 신청 절차는{" "}
              <Link
                href="/guides/unemployment-benefit-guide/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                실업급여·고용보험 가이드
              </Link>
              에 전체 그림으로 정리해 두었습니다. 수급 중 절반 이상 남기고 재취업하면 남은 급여의
              50%를 돌려주는{" "}
              <Link
                href="/blog/2026-07-10-early-reemployment-allowance/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                조기재취업수당
              </Link>
              도 있고, 고용보험 요건이 안 된다면{" "}
              <Link
                href="/blog/2026-07-10-national-employment-support-program/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                국민취업지원제도(월 60만 원)
              </Link>
              가 대안입니다.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 2026년 상·하한액과 소정급여일수 표를 적용한{" "}
            <strong className="text-slate-700">참고용</strong>입니다. 실제 수급 자격(이직 사유·피보험
            단위기간)과 금액은 고용센터 심사로 확정되며, 이직일이 2025년 이전이면 그 시점 기준이
            적용됩니다. 정확한 내용은 고용24(work24.go.kr)에서 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
