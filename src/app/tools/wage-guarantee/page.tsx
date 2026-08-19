import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WageGuaranteeCalculator from "@/components/WageGuaranteeCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/wage-guarantee/";

export const metadata: Metadata = {
  title: "대지급금 계산기 | 체불임금 도산·간이 상한액 계산 | 팁픽",
  description:
    "퇴직 당시 연령·월 체불임금·체불 개월 수를 넣으면 도산대지급금(최종 6개월분)과 간이대지급금(총 1,000만원)의 상한을 바로 계산합니다. 2026년 8월 20일 개정 기준.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "대지급금 계산기 | 체불임금 도산·간이 상한액 계산 | 팁픽",
    description:
      "연령별 월 상한을 적용해 도산대지급금·간이대지급금으로 받을 수 있는 금액을 계산합니다. 2026년 8월 20일 개정 반영.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function WageGuaranteeToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            대지급금 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            회사가 밀린 임금을 못 줄 때 국가가 대신 주는 돈,{" "}
            <span className="font-black text-brand-dark">연령별 상한을 적용해 얼마까지 나오는지</span>{" "}
            계산해 드려요.
          </p>
        </header>

        <WageGuaranteeCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">대지급금은 어떻게 계산하나요?</h2>
            <p>
              대지급금은 못 받은 금액을 그대로 주는 것이 아니라{" "}
              <strong className="text-slate-800">퇴직 당시 연령별 상한</strong>을 먼저 씌운 뒤
              계산합니다. 도산대지급금은 임금을 <strong className="text-slate-800">1개월분씩</strong>{" "}
              상한에 맞춰 자르고, 퇴직급여는 <strong className="text-slate-800">1년분씩</strong> 잘라
              최종 3년분까지 더합니다. 2026년 8월 20일부터 임금 지급범위가 최종 3개월분에서{" "}
              <strong className="text-slate-800">최종 6개월분</strong>으로 늘어, 총 상한이 2,100만원에서{" "}
              <strong className="text-slate-800">3,150만원</strong>이 됐습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">연령별 상한액은 얼마인가요?</h2>
            <p>
              「체불 임금등 대지급금 상한액 고시」가 정한 금액입니다. 임금·휴업수당은 1개월분,
              퇴직급여등은 1년분 기준이에요.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 px-3 py-2 text-left font-black text-slate-700">퇴직 당시 연령</th>
                    <th className="border border-slate-200 px-3 py-2 text-right font-black text-slate-700">임금(월)·퇴직급여(연)</th>
                    <th className="border border-slate-200 px-3 py-2 text-right font-black text-slate-700">휴업수당(월)</th>
                    <th className="border border-slate-200 px-3 py-2 text-right font-black text-slate-700">도산 총 상한</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-200 px-3 py-2">30세 미만</td><td className="border border-slate-200 px-3 py-2 text-right">220만원</td><td className="border border-slate-200 px-3 py-2 text-right">154만원</td><td className="border border-slate-200 px-3 py-2 text-right">1,980만원</td></tr>
                  <tr><td className="border border-slate-200 px-3 py-2">30~40세</td><td className="border border-slate-200 px-3 py-2 text-right">310만원</td><td className="border border-slate-200 px-3 py-2 text-right">217만원</td><td className="border border-slate-200 px-3 py-2 text-right">2,790만원</td></tr>
                  <tr><td className="border border-slate-200 px-3 py-2">40~50세</td><td className="border border-slate-200 px-3 py-2 text-right">350만원</td><td className="border border-slate-200 px-3 py-2 text-right">245만원</td><td className="border border-slate-200 px-3 py-2 text-right">3,150만원</td></tr>
                  <tr><td className="border border-slate-200 px-3 py-2">50~60세</td><td className="border border-slate-200 px-3 py-2 text-right">330만원</td><td className="border border-slate-200 px-3 py-2 text-right">231만원</td><td className="border border-slate-200 px-3 py-2 text-right">2,970만원</td></tr>
                  <tr><td className="border border-slate-200 px-3 py-2">60세 이상</td><td className="border border-slate-200 px-3 py-2 text-right">230만원</td><td className="border border-slate-200 px-3 py-2 text-right">161만원</td><td className="border border-slate-200 px-3 py-2 text-right">2,070만원</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500">
              &lsquo;도산 총 상한&rsquo;은 6개월분 임금과 3년분 퇴직급여를 각각 상한까지 채웠을 때의 합계로,
              이 표의 값을 직접 곱해 낸 것입니다(예: 40~50세 = 350만×6 + 350만×3 = 3,150만원).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">도산과 간이는 무엇이 다른가요?</h3>
            <p>
              도산대지급금은 회사가 파산·회생 절차에 들어갔거나 노동청이{" "}
              <strong className="text-slate-800">도산등사실인정</strong>을 한 경우에 나옵니다. 간이대지급금은
              회사가 문을 닫지 않았더라도 확정판결이나 &lsquo;체불 임금등·사업주 확인서&rsquo;로 체불이 확정되면
              받을 수 있고, 상한이 임금 700만원·퇴직급여 700만원,{" "}
              <strong className="text-slate-800">합계 1,000만원</strong>입니다. 체불이 길수록 도산 쪽 금액이
              커지는데, 40~50세가 월 350만원을 6개월 못 받았다면 도산 2,100만원 대 간이 700만원으로{" "}
              <strong className="text-slate-800">1,400만원</strong> 차이가 납니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">함께 보면 좋은</h3>
            <p>
              신고부터 청구까지 순서가 궁금하면{" "}
              <Link href="/blog/2026-08-20-wage-arrears-guarantee-payment/" className="font-bold text-brand-dark underline underline-offset-2">
                임금체불 신고와 대지급금 받는 순서
              </Link>
              , 퇴직연금이 밀린 경우는{" "}
              <Link href="/guides/retirement-pension-arrears/" className="font-bold text-brand-dark underline underline-offset-2">
                퇴직연금이 안 들어왔을 때
              </Link>
              , 퇴직금 자체가 궁금하면{" "}
              <Link href="/tools/retirement-pay/" className="font-bold text-brand-dark underline underline-offset-2">
                퇴직금 계산기
              </Link>
              에서 이어서 볼 수 있어요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 「임금채권보장법」과 「체불 임금등 대지급금 상한액 고시」의 상한을 적용한{" "}
            <strong className="text-slate-700">참고용 상한 계산</strong>입니다. 실제 지급액은 근로복지공단이
            확정한 체불액을 넘지 않으며, 도산등사실인정 여부·퇴직일 요건·청구 기한에 따라 지급되지 않을 수도
            있습니다. 2026년 8월 20일 시행 기준이며, 정확한 판단은 근로복지공단(www.comwel.or.kr)과 관할
            지방고용노동관서에서 확인하세요.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
