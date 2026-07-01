import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OverseasStockTaxCalculator from "@/components/OverseasStockTaxCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/overseas-stock-tax/";

export const metadata: Metadata = {
  title: "해외주식 양도세 계산기 2026 | 250만 공제·22% 예상 세액 | 팁픽",
  description:
    "올해 해외주식 실현손익만 입력하면 250만원 기본공제 후 양도소득세(22%)를 바로 계산합니다. 손익통산·세후 손익까지 보여 주는 2026년 참고용 해외주식 양도세 계산기.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "해외주식 양도세 계산기 2026 | 250만 공제·22% 예상 세액 | 팁픽",
    description:
      "올해 해외주식 실현손익으로 250만 공제 후 양도세(22%)를 바로 계산. 손익통산·세후 손익까지, 2026년 기준 참고용.",
  },
};

export default function OverseasStockTaxToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            해외주식 양도세 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            올해 판 해외주식의{" "}
            <span className="font-black text-brand-dark">실현손익</span>만 입력하면 250만원 공제 후
            양도소득세(22%)를 바로 계산해 드려요.
          </p>
        </header>

        <OverseasStockTaxCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">해외주식 세금은 어떻게 계산되나요?</h2>
            <p>
              한 해(1/1~12/31) 동안 판 해외주식·해외상장 ETF의{" "}
              <strong className="text-slate-800">이익과 손실을 모두 합산</strong>한 뒤, 기본공제{" "}
              <strong className="text-slate-800">250만원</strong>을 빼고 남은 금액에{" "}
              <strong className="text-slate-800">22%</strong>(양도소득세 20% + 지방소득세 2%)를 적용합니다.
              국내주식 소액주주는 매매차익이 비과세지만, 해외주식은 소액이라도 이익이 나면 과세됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">언제, 어떻게 신고하나요?</h2>
            <p>
              주식을 판 해의{" "}
              <strong className="text-slate-800">다음 해 5월(1일~31일)</strong>에 국세청 홈택스로 직접
              신고·납부합니다. 증권사가 자동으로 떼 주지 않으므로 스스로 챙겨야 하며, 놓치면
              무신고·납부지연 가산세가 붙습니다. 자세한 신고 절차와 절세법은{" "}
              <Link
                href="/guides/overseas-stock-capital-gains-tax/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                해외주식 양도소득세 가이드
              </Link>
              에서, 국내주식·ETF까지 세금 전체 그림은{" "}
              <Link
                href="/blog/2026-07-02-stock-tax-guide/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                주식 세금 총정리
              </Link>
              에서 확인하세요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 기본공제 250만원과 단일세율 22%를 적용한{" "}
            <strong className="text-slate-700">참고용 근사치</strong>입니다. 환율 환산·필요경비·기타
            해외 양도소득 합산 여부에 따라 실제 세액과 차이가 있을 수 있으며, 정확한 신고는 홈택스와
            세무 전문가로 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
