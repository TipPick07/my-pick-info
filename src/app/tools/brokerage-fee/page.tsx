import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrokerageFeeCalculator from "@/components/BrokerageFeeCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/brokerage-fee/";

export const metadata: Metadata = {
  title: "부동산 중개보수(복비) 계산기 | 매매·전세·월세 법정 상한 | 팁픽",
  description:
    "집 매매·전세·월세 중개보수(복비)를 거래금액별 법정 상한요율로 바로 계산합니다. 월세 보증금 환산·한도액·부가세까지 2026년 기준으로 정리.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "부동산 중개보수(복비) 계산기 | 매매·전세·월세 | 팁픽",
    description:
      "거래금액별 법정 상한요율로 중개보수를 바로 계산. 월세 환산·한도액·부가세 반영(2026 기준).",
    images: [`${SITE}/og-image-v2.png`],
  },
};

const SALE_ROWS = [
  ["5천만원 미만", "0.6%", "25만원"],
  ["5천만원 ~ 2억원 미만", "0.5%", "80만원"],
  ["2억원 ~ 9억원 미만", "0.4%", "없음"],
  ["9억원 ~ 12억원 미만", "0.5%", "없음"],
  ["12억원 ~ 15억원 미만", "0.6%", "없음"],
  ["15억원 이상", "0.7%", "없음"],
];

const LEASE_ROWS = [
  ["5천만원 미만", "0.5%", "20만원"],
  ["5천만원 ~ 1억원 미만", "0.4%", "30만원"],
  ["1억원 ~ 6억원 미만", "0.3%", "없음"],
  ["6억원 ~ 12억원 미만", "0.4%", "없음"],
  ["12억원 ~ 15억원 미만", "0.5%", "없음"],
  ["15억원 이상", "0.6%", "없음"],
];

function RateTable({ caption, rows }: { caption: string; rows: string[][] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-slate-700">{caption}</p>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="px-4 py-3 font-semibold">거래금액</th>
              <th className="px-4 py-3 font-semibold">상한요율</th>
              <th className="px-4 py-3 font-semibold">한도액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r[0]}>
                <td className="px-4 py-3 font-semibold text-slate-700">{r[0]}</td>
                <td className="px-4 py-3 text-slate-600">{r[1]}</td>
                <td className="px-4 py-3 text-slate-500">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BrokerageFeeToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            부동산 중개보수 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            집을 사고팔거나 전세·월세 계약할 때 내는{" "}
            <span className="font-black text-brand-dark">중개보수(복비)</span>를 거래금액별 법정
            상한요율로 바로 계산해 드려요. 2026년 기준입니다.
          </p>
        </header>

        <BrokerageFeeCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">중개보수(복비)란?</h2>
            <p>
              집을 거래할 때 공인중개사에게 내는 수수료입니다. 법으로 거래금액 구간별 상한요율과
              한도액이 정해져 있고, 그 범위 안에서 중개사와 협의해 정합니다. 즉 아래 표의 요율은
              받을 수 있는 최댓값이고, 실제로는 더 낮게 협의할 수도 있어요.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl font-black text-slate-900">법정 상한요율표 (2026)</h2>
            <RateTable caption="주택 매매·교환" rows={SALE_ROWS} />
            <RateTable caption="주택 임대차 (전세·월세)" rows={LEASE_ROWS} />
            <p className="text-sm text-slate-500">
              중개보수 = 거래금액 × 상한요율. 한도액이 있는 구간은 계산값이 한도액을 넘으면 한도액까지만 받습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">월세는 거래금액을 어떻게 정하나요?</h2>
            <p>
              월세는 보증금에 월세액의 100배를 더해 거래금액을 정합니다. 다만 그렇게 더한 값이
              5천만원 미만이면 100배 대신 70배로 다시 계산해요. 예를 들어 보증금 1,000만 원에
              월세 60만 원이면 1,000만 원 + (60만 원 × 100) = 7,000만 원이 거래금액이 됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">부가가치세(VAT)는 따로 붙나요?</h2>
            <p>
              중개사가 일반과세 사업자라면 중개보수에 부가세 10%가 별도로 붙을 수 있습니다. 위
              계산기의 부가세 포함 항목을 체크하면 포함 금액까지 확인할 수 있어요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 위 요율은 법정 상한입니다. 실제 중개보수는 협의로 더 낮출 수 있고, 지방자치단체
            조례나 중개대상물(주거용 오피스텔·상가·토지 등)에 따라 요율이 달라질 수 있어 본
            계산기는 참고용입니다. 전세 계약이라면{" "}
            <Link
              href="/blog/2026-06-30-jeonse-deposit-protection-guide/"
              className="font-bold text-brand-dark underline underline-offset-2"
            >
              전세보증금 지키는 법
            </Link>
            , 살까 전세로 갈까 고민이라면{" "}
            <Link
              href="/blog/2026-06-26-jeonse-wolse-buy-comparison/"
              className="font-bold text-brand-dark underline underline-offset-2"
            >
              전세 vs 월세 vs 매매
            </Link>
            와{" "}
            <Link href="/money/" className="font-bold text-brand-dark underline underline-offset-2">
              돈이 되는 경제
            </Link>
            도 함께 보세요.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
