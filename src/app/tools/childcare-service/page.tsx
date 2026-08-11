import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChildcareServiceCalculator from "@/components/ChildcareServiceCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/childcare-service/";

export const metadata: Metadata = {
  title: "아이돌봄서비스 시간당 12,790원, 본인부담금 계산 | 팁픽",
  description:
    "아이돌봄서비스 월 본인부담금을 바로 계산합니다. 소득유형(가~마형)·아이 나이·이용 시간을 고르면 2026년 단가(시간당 12,790원) 기준 정부지원액과 내 부담금을 나눠 보여 드립니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "아이돌봄서비스 시간당 12,790원, 본인부담금 계산 | 팁픽",
    description:
      "아이돌봄서비스 월 본인부담금 계산 — 소득유형·나이·이용시간 기준 정부지원액 분해.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function ChildcareServiceToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            아이돌봄서비스 본인부담금 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            소득 유형과 이용 시간만 고르면{" "}
            <span className="font-black text-brand-dark">월 본인부담금</span>을 정부지원액과 나눠
            계산해 드려요. 2026년 시간제 기본형 단가 기준입니다.
          </p>
        </header>

        <ChildcareServiceCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">정부지원율은 어떻게 정해지나요?</h2>
            <p>
              아이돌봄서비스 요금은 전국 동일하게 시간당{" "}
              <strong className="text-slate-800">12,790원(2026년 시간제 기본형)</strong>이고, 이 중
              정부가 얼마를 대신 내주는지가 가구 소득에 따라 갈립니다. 기준 중위소득{" "}
              <strong className="text-slate-800">75% 이하(가형)는 만 2세 이하 기준 85%</strong>를
              지원받아 시간당 약 1,900원만 부담하는 반면, 250%를 넘는 마형은 전액 본인부담입니다.
              2026년부터 지원 대상이 중위소득 200%에서 <strong className="text-slate-800">250%
              이하로 확대</strong>돼, 맞벌이 중산층 가구도 라형(10~15% 지원)으로 들어올 수 있게
              됐습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">지원 시간에도 한도가 있나요?</h2>
            <p>
              네. 정부지원이 적용되는 시간은 <strong className="text-slate-800">연 960시간(일반
              가구)</strong>이 기준이고, 한부모·장애부모 등 일부 취약가구는 더 넓게 인정됩니다.
              월로 나누면 약 80시간 — 이 계산기에서 월 80시간을 넘기면 경고가 뜨는 이유입니다.
              한도를 넘긴 시간은 지원 없이 전액 본인부담으로 이용할 수 있습니다.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 2026년 시간제 기본형 단가 기준의{" "}
            <strong className="text-slate-700">참고용 계산</strong>입니다. 종합형(16,620원)·질병감염아동
            (15,340원)·영아종일제는 단가와 지원 구조가 다르고, 야간·휴일 가산(50%)과 취약가구 추가
            지원은 반영되지 않았습니다. 신청 자격과 지원율은{" "}
            <Link href="/blog/2026-07-22-childcare-service-support/" className="font-bold text-brand-dark underline">
              아이돌봄서비스 정리 글
            </Link>
            과 아이돌봄 홈페이지(idolbom.go.kr)에서 확인하세요.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
