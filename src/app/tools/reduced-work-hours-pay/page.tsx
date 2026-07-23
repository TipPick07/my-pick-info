import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReducedWorkHoursPayCalculator from "@/components/ReducedWorkHoursPayCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/reduced-work-hours-pay/";

export const metadata: Metadata = {
  title: "육아기 근로시간 단축 급여 계산기 (2026) | 팁픽",
  description:
    "근무 시간을 줄이면 월급이 얼마나 남는지 바로 계산합니다. 통상임금과 줄이는 시간을 넣으면 2026년 기준(최초 10시간분 상한 250만 원) 회사 급여와 고용보험 단축급여를 나눠 보여 드립니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "육아기 근로시간 단축 급여 계산기 (2026) | 팁픽",
    description:
      "통상임금·단축 시간으로 계산하는 육아기 근로시간 단축 급여와 월 실수령액.",
  },
};

export default function ReducedWorkHoursPayToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            육아기 근로시간 단축 급여 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            통상임금과 줄이는 시간만 넣으면{" "}
            <span className="font-black text-brand-dark">단축 기간 월 실수령액</span>을 회사 급여와
            고용보험 지원금으로 나눠 계산해 드려요. 2026년 상향된 상한액 기준입니다.
          </p>
        </header>

        <ReducedWorkHoursPayCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">왜 최초 10시간이 유리한가요?</h2>
            <p>
              지원금이 두 덩어리로 나뉘기 때문입니다. 매주{" "}
              <strong className="text-slate-800">최초 10시간 단축분은 통상임금의 100%</strong>
              (상한 월 250만 원)를 채워 주고, 그 이상 줄인 시간부터는{" "}
              <strong className="text-slate-800">80%</strong>(상한 월 160만 원)로 떨어집니다. 그래서
              주 40시간 근무자가 하루 2시간(주 10시간)을 줄이면 통상임금 350만 원 기준 월
              325만 원이 남아 <strong className="text-slate-800">원래 월급의 92.9%</strong>가
              유지됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">얼마나 오래 쓸 수 있나요?</h2>
            <p>
              기본 1년이지만, <strong className="text-slate-800">육아휴직 중 쓰지 않은 기간의 2배</strong>가
              가산돼 최대 3년까지 늘어납니다. 자녀가 만 12세 이하 또는 초등학교 6학년 이하면
              대상이고, 단축 후 근로시간은 주 15시간 이상 35시간 이하여야 합니다. 휴직과 단축의
              순서를 어떻게 짜느냐에 따라 총 수령액이 달라지니, 전일 휴직 쪽 금액은{" "}
              <Link href="/tools/parental-leave-pay/" className="font-bold text-brand-dark underline">
                육아휴직급여 계산기
              </Link>
              로 비교해 보세요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 2026년 기준의{" "}
            <strong className="text-slate-700">참고용 계산</strong>입니다. 회사 급여는 단축 시간에
            비례한다고 가정했고 4대보험·세금 공제는 반영하지 않았습니다. 신청 자격과 절차는{" "}
            <Link
              href="/blog/2026-07-24-reduced-work-hours-childcare-pay/"
              className="font-bold text-brand-dark underline"
            >
              육아기 근로시간 단축 급여 정리 글
            </Link>
            과 고용24(work24.go.kr)에서 확인하세요.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
