import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SavingsInterestCalculator from "@/components/SavingsInterestCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/savings-interest/";

export const metadata: Metadata = {
  title: "예금·적금 이자 계산기 | 세후 만기 수령액 (단리·복리) | 팁픽",
  description:
    "예금·적금의 만기 수령액을 세후로 바로 계산합니다. 원금·이율·기간과 단리/월복리를 선택하면 이자소득세 15.4%를 뺀 실제 수령액을 알려 드립니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "예금·적금 이자 계산기 | 세후 만기 수령액 (단리·복리) | 팁픽",
    description:
      "예금·적금 만기 수령액을 세후로 계산. 단리/월복리 선택, 이자소득세 15.4% 반영.",
  },
};

export default function SavingsInterestToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            예금·적금 이자 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            원금·이율·기간만 입력하면{" "}
            <span className="font-black text-brand-dark">세후 만기 수령액</span>을 바로 계산해
            드려요. 예금·적금, 단리·복리를 모두 지원합니다.
          </p>
        </header>

        <SavingsInterestCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">예금과 적금, 이자 계산이 다른가요?</h2>
            <p>
              네, 다릅니다. <strong className="text-slate-800">예금</strong>은 목돈을 한 번에 맡기는
              방식이라, 단리는 &quot;원금 × 이율 × 기간&quot;으로 계산합니다. 월복리를 선택하면 매달
              이자가 원금에 더해져 다음 달 이자를 다시 불립니다.{" "}
              <strong className="text-slate-800">적금</strong>은 매달 나눠 넣기 때문에, 먼저 넣은
              돈은 오래, 나중에 넣은 돈은 짧게 이자가 붙습니다. 그래서 같은 연이율이라도 적금의
              실제 수령 이자는 예금보다 적게 느껴질 수 있습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">이자에서 세금은 얼마나 떼나요?</h2>
            <p>
              이자에는 2026년 기준 <strong className="text-slate-800">이자소득세 15.4%</strong>(소득세 14% +
              지방소득세 1.4%)가 부과됩니다. 예를 들어 세전 이자가 30만 원이라면 약 46,200원이
              세금으로 빠지고 253,800원이 실제 이자로 남습니다. 위 계산기는 이 세금을 자동으로
              빼고 &quot;세후 만기 수령액&quot;을 보여 줍니다. 비과세·세금우대 상품(청년 우대형 등)은
              이 세금이 면제되거나 줄어들 수 있습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">관련 도구·글</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <Link
                  href="/tools/youth-savings-account/"
                  className="font-bold text-brand-dark underline underline-offset-2"
                >
                  청년내일저축계좌 계산기
                </Link>{" "}
                — 정부지원금까지 더한 3년 만기 수령액 계산
              </li>
              <li>
                <Link
                  href="/blog/2026-05-29-youth-savings-mirae-vs-doyak-guide/"
                  className="font-bold text-brand-dark underline underline-offset-2"
                >
                  청년미래적금 vs 청년도약계좌 비교
                </Link>{" "}
                — 두 청년 자산형성 상품의 조건·혜택 비교
              </li>
              <li>
                <Link
                  href="/blog/2026-06-29-parking-account-cma-guide/"
                  className="font-bold text-brand-dark underline underline-offset-2"
                >
                  파킹통장·CMA 비상금 굴리는 법
                </Link>{" "}
                — 만기 전 여윳돈을 하루 단위로 굴리는 방법
              </li>
            </ul>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 일반과세(15.4%)를 적용한{" "}
            <strong className="text-slate-700">참고용 계산</strong>입니다. 적금은 일반 정기적금
            (단리) 기준이며, 은행별 이자 계산 방식·우대금리·비과세 여부에 따라 실제 수령액과 차이가
            있을 수 있습니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
