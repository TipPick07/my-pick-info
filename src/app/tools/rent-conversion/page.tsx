import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RentConversionCalculator from "@/components/RentConversionCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/rent-conversion/";

export const metadata: Metadata = {
  title: "전월세 전환 계산기 | 전세·월세 전환 월세·보증금 (법정 전환율) | 팁픽",
  description:
    "전세를 월세로, 월세를 전세로 바꿀 때 월세·보증금이 얼마가 되는지 바로 계산합니다. 2026년 법정 전환율(기준금리+2%) 기준, 양방향 환산.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "전월세 전환 계산기 | 전세·월세 환산 (법정 전환율) | 팁픽",
    description:
      "전세·월세 전환 월세·보증금을 양방향으로 계산. 2026년 법정 전환율 4.5% 기준.",
  },
};

export default function RentConversionToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            전월세 전환 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            전세를 월세로, 월세를 전세로 바꿀 때{" "}
            <span className="font-black text-brand-dark">월세·보증금이 얼마</span>가 되는지 바로
            계산해 드려요. 2026년 법정 전환율을 기본값으로 넣었습니다.
          </p>
        </header>

        <RentConversionCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">전월세 전환율이란?</h2>
            <p>
              전세보증금을 월세로 바꿀 때 적용하는 비율입니다. 보증금을 줄이는 대신 월세를 매길 때,
              줄어든 보증금에 이 비율을 곱해 1년치 월세를 정하고 12로 나눠 한 달 월세를 구합니다.
              주택임대차보호법 제7조의2에 근거한 세입자 보호 장치예요.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">법정 상한은 얼마인가요?</h2>
            <p>
              법으로 정한 전환율 상한은 <strong className="text-slate-800">기준금리 + 2%</strong>와{" "}
              <strong className="text-slate-800">기준금리의 2배</strong> 중 낮은 값입니다. 기준금리가
              2.5%인 2026년 6월 기준으로는 <strong className="text-slate-800">연 4.5%</strong>(2.5% + 2%)가
              상한이에요. 이 상한을 넘겨 받은 월세는 초과한 부분이 무효가 될 수 있습니다. 다만 이
              상한은 계약 갱신·전환 시의 보호 기준이고, 신규 계약이나 시장에서는 더 높은 전환율이
              쓰이기도 합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">계산 예시</h2>
            <p>
              전세보증금 3억 원짜리 집을, 보증금 5,000만 원만 남기고 나머지를 월세로 돌린다고 해
              볼게요. 월세로 전환되는 보증금은 2억 5,000만 원이고, 전환율 4.5%를 적용하면 한 해
              월세는 1,125만 원, 한 달 월세는 <strong className="text-slate-800">약 93만 7,500원</strong>이
              됩니다. 반대로 월세를 전세로 환산할 때는 월세에 12를 곱해 전환율로 나눈 뒤 월세보증금을
              더하면 돼요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 법정 전환율 상한은 기준금리에 따라 달라집니다(2026년 6월 기준 4.5%). 실제 계약의
            전환율은 협의·시장 상황에 따라 다를 수 있어, 본 계산기는{" "}
            <strong className="text-slate-700">참고용</strong>입니다. 집을 살지 전세로 갈지 고민이라면{" "}
            <Link
              href="/blog/2026-06-26-jeonse-wolse-buy-comparison/"
              className="font-bold text-brand-dark underline underline-offset-2"
            >
              전세 vs 월세 vs 매매
            </Link>{" "}
            글과{" "}
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
