import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalCostCapCalculator from "@/components/MedicalCostCapCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/medical-cost-cap/";

export const metadata: Metadata = {
  title: "본인부담상한제 환급 계산기 (2026) | 팁픽",
  description:
    "1년간 낸 병원비 중 얼마를 돌려받는지 바로 계산합니다. 소득분위와 급여 본인부담금을 넣으면 2026년 상한액(1분위 90만~10분위 843만 원) 기준 환급 예상액을 보여 드립니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "본인부담상한제 환급 계산기 (2026) | 팁픽",
    description: "소득분위별 상한액으로 계산하는 병원비 환급 예상액.",
  },
};

export default function MedicalCostCapToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            본인부담상한제 환급 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            소득분위와 1년치 병원비만 넣으면{" "}
            <span className="font-black text-brand-dark">돌려받을 금액</span>을 계산해 드려요.
            2026년 상한액(1분위 90만 원~10분위 843만 원) 기준입니다.
          </p>
        </header>

        <MedicalCostCapCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">
              왜 병원비 전부가 계산에 안 들어가나요?
            </h2>
            <p>
              상한제가 세어 주는 것은{" "}
              <strong className="text-slate-800">건강보험이 적용된 급여 항목의 본인부담금</strong>
              뿐이기 때문입니다. 도수치료·미용 시술 같은 비급여, 1인실 상급병실료 차액, 본인부담률이
              높게 매겨진 선별급여는 아무리 많이 내도 0원으로 칩니다. 그래서 총 병원비 1,000만 원
              중 비급여가 400만 원이었다면 계산 대상은 600만 원이고, 4~5분위 기준 환급액은 427만 원,
              최종 부담은 573만 원이 됩니다. 비급여를 덮는 건 상한제가 아니라 실손보험입니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">언제 돈이 들어오나요?</h2>
            <p>
              여러 병원에 나눠 낸 경우는{" "}
              <strong className="text-slate-800">진료한 다음 해 8월경</strong> 공단이 지급신청
              안내문을 보내고, 신청하면 계좌로 들어옵니다(사후환급). 한 병원에서만 치료받아 그
              병원 진료비가 최고상한액을 넘으면 병원이 공단에 직접 청구해 환자가 신청할 필요가
              없습니다(사전급여 — 요양병원 입원은 제외). 안내문을 못 받았어도 공단 홈페이지·앱에서
              조회·신청할 수 있고, 청구권 소멸시효는 3년입니다. 자격과 절차는{" "}
              <Link
                href="/blog/2026-07-28-medical-cost-cap-refund/"
                className="font-bold text-brand-dark underline"
              >
                본인부담상한제 정리 글
              </Link>
              에서 확인하세요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 2026년 상한액 기준의{" "}
            <strong className="text-slate-700">참고용 계산</strong>입니다. 소득분위는 다음 해 보험료가
            확정된 뒤 정해지고 제외 항목 판정도 공단 기준을 따르므로, 실제 환급액은 국민건강보험공단
            (nhis.or.kr · 1577-1000) 조회 결과와 다를 수 있습니다. 보험료 자체를 줄이는 방법은{" "}
            <Link href="/guides/health-insurance-saving/" className="font-bold text-brand-dark underline">
              건강보험료 절감 가이드
            </Link>
            에 정리해 두었습니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
