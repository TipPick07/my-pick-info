import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YouthSavingsAccountCalculator from "@/components/YouthSavingsAccountCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/youth-savings-account/";

export const metadata: Metadata = {
  title: "청년내일저축계좌 계산기 — 정부지원금 만기 수령액 | 팁픽",
  description:
    "청년내일저축계좌 3년 만기 수령액을 바로 계산합니다. 월 저축액·정부 매칭(신규 30만·기존 10만)·이자를 넣으면 본인 원금·정부지원금·이자로 나눠 보여 드립니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "청년내일저축계좌 계산기 — 정부지원금 만기 수령액 | 팁픽",
    description:
      "청년내일저축계좌 3년 만기 수령액을 본인 원금·정부지원금·이자로 나눠 계산합니다.",
  },
};

export default function YouthSavingsAccountToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            청년내일저축계좌 만기 수령액 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            월 저축액과 가입 유형만 고르면{" "}
            <span className="font-black text-brand-dark">3년 만기 수령액</span>을 본인 원금·정부지원금·
            이자로 나눠 계산해 드려요.
          </p>
        </header>

        <YouthSavingsAccountCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">정부지원금은 어떻게 붙나요?</h2>
            <p>
              청년내일저축계좌의 핵심은{" "}
              <strong className="text-slate-800">본인이 저축한 달마다 정부가 정액을 얹어 주는</strong>{" "}
              구조입니다. 2026년 신규 모집(기준 중위소득 50% 이하)은 본인이 월 10만 원 이상 저축하면
              정부가 <strong className="text-slate-800">월 30만 원</strong>을 매칭해, 3년 뒤 적립금이
              본인 360만 원 + 정부 1,080만 원 = <strong className="text-slate-800">1,440만 원</strong>이
              됩니다. 여기에 은행 적금 이자(최대 연 5%, 비과세)가 더해집니다. 정부 매칭은 저축액을
              50만 원까지 늘려도 <strong className="text-slate-800">월 30만 원 그대로</strong>라, 저축을
              더 하면 본인 원금과 이자만 커집니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">중간에 그만두면 어떻게 되나요?</h2>
            <p>
              3년을 채우지 못하고 중도 해지하면{" "}
              <strong className="text-slate-800">정부지원금은 받지 못하고</strong> 본인이 저축한 원금과
              그 이자만 돌려받습니다. 다만 실직·휴직 등으로 잠시 저축을 못 할 때를 대비해 2026년부터
              적립 중지 기간이 최대 12개월로 늘었습니다. 위 계산기에서 &quot;납입 개월&quot;을 36보다
              작게 넣으면 중간에 저축을 멈췄을 때의 예상 적립액을 가늠할 수 있습니다.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 2026년 기준의{" "}
            <strong className="text-slate-700">참고용 계산</strong>입니다. 이자는 일반 정기적금(단리)
            으로 근사했으며 은행 상품·우대금리에 따라 실제 수령액과 차이가 있을 수 있습니다. 자격·
            소득·재산 요건은{" "}
            <Link href="/blog/2026-07-20-youth-tomorrow-savings-account-guide/" className="font-bold text-brand-dark underline">
              청년내일저축계좌 안내
            </Link>
            에서 확인하세요.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
