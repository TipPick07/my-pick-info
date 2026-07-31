import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LongtermCareCopayCalculator from "@/components/LongtermCareCopayCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/longterm-care-copay/";

export const metadata: Metadata = {
  title: "장기요양 본인부담금 계산기 (2026) | 팁픽",
  description:
    "부모님 요양에 한 달 얼마가 드는지 바로 계산합니다. 등급과 이용 형태(재가·시설), 감경 구분을 넣으면 2026년 수가 기준으로 공단 부담분과 내 부담액을 나눠 보여 드립니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "장기요양 본인부담금 계산기 (2026) | 팁픽",
    description: "등급·이용 형태·감경 구분으로 계산하는 한 달 요양 부담액.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function LongtermCareCopayToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            장기요양 본인부담금 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            등급과 이용 형태만 고르면{" "}
            <span className="font-black text-brand-dark">한 달에 내는 돈</span>을 계산해 드려요.
            2026년 수가(1등급 재가 월 한도 251만 2,900원 · 요양원 1일 9만 3,070원) 기준입니다.
          </p>
        </header>

        <LongtermCareCopayCalculator />

        <article className="mt-12 space-y-8 text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              공단이 85%, 내가 15% — 재가급여 구조
            </h2>
            <p>
              장기요양 등급을 받으면 등급별로 <strong>한 달에 쓸 수 있는 급여 한도액</strong>이
              정해집니다. 그 한도 안에서 방문요양·주야간보호 등을 이용하면 국민건강보험공단이
              85%를 내고 이용자가 <strong>15%</strong>를 냅니다. 2026년 한도액은 1등급 251만 2,900원,
              3등급 152만 8,200원, 5등급 120만 8,900원입니다.
            </p>
            <p>
              주의할 것은 <strong>한도를 넘긴 금액</strong>입니다. 초과분은 공단이 부담하지 않아
              감경 대상자라도 전액 본인이 냅니다. 계산기에서 이용 비율을 100% 넘게 넣어 보면 실질
              부담률이 어떻게 뛰는지 확인할 수 있어요.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              요양원은 일수로 계산합니다
            </h2>
            <p>
              시설급여(노인요양시설 입소)는 한도액이 아니라 <strong>1일당 수가 × 입소일수</strong>로
              계산하고, 본인부담률은 <strong>20%</strong>입니다. 2026년 1일 수가는 1등급 9만 3,070원,
              2등급 8만 6,340원, 3~5등급 8만 1,540원이에요. 30일 기준 1등급이면 급여비용 279만
              2,100원 중 <strong>55만 8,420원</strong>이 본인부담입니다.
            </p>
            <p>
              여기에 <strong>식사재료비·상급침실료 차액·이미용비</strong>가 따로 붙습니다. 이 비급여
              항목은 급여비용에 들어가지 않아 전액 본인부담이고, 시설마다 금액이 다릅니다. 계약 전
              비급여 항목을 반드시 확인하세요.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              감경은 신청하지 않아도 적용됩니다
            </h2>
            <p>
              건강보험료 순위와 재산 과세표준을 기준으로 <strong>40% 또는 60% 감경</strong>이
              자동 적용됩니다. 60% 감경이면 재가 부담률이 15%에서 6%로, 시설은 20%에서 8%로
              내려갑니다. 기초생활수급자(의료급여법 제3조제1항제1호)는 급여 부분 본인부담이
              없습니다. 내 구분이 무엇인지는 국민건강보험공단에서 확인할 수 있어요.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">이어서 보면 좋은 것</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <Link href="/blog/2026-07-31-longterm-care-copayment/" className="text-brand-dark font-bold underline underline-offset-2">
                  장기요양 본인부담금 등급별 정리
                </Link>{" "}
                — 재가와 시설의 부담 차이가 등급마다 달라지는 이유
              </li>
              <li>
                <Link href="/blog/2026-07-28-medical-cost-cap-refund/" className="text-brand-dark font-bold underline underline-offset-2">
                  본인부담상한제 환급
                </Link>{" "}
                — 병원비가 많았던 해에 돌려받는 제도
              </li>
              <li>
                <Link href="/guides/three-pillar-pension/" className="text-brand-dark font-bold underline underline-offset-2">
                  노후 3층 연금 가이드
                </Link>{" "}
                — 요양비를 감당할 소득 설계
              </li>
            </ul>
          </section>

          <p className="text-xs text-slate-400 leading-relaxed">
            본 계산기는 2026년 보건복지부 고시 수가를 기준으로 한 참고용 도구입니다. 실제 청구액은
            이용한 급여 종류·제공 시간·가산 항목과 기관별 비급여 금액에 따라 달라집니다. 정확한
            금액은 이용 기관과 국민건강보험공단(1577-1000)에서 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
