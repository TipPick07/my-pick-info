import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HourlyWageCalculator from "@/components/HourlyWageCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/hourly-wage/";

export const metadata: Metadata = {
  title: "시급·주휴수당 계산기 2026 | 최저임금·주휴 포함 주급 | 팁픽",
  description:
    "시급과 주 근무시간을 입력하면 주휴수당과 주급·월급을 바로 계산합니다. 2026년 최저시급 10,320원 기준, 주 15시간 이상 주휴수당까지 반영한 알바·파트타임 계산기.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "시급·주휴수당 계산기 2026 | 최저임금·주휴 포함 주급 | 팁픽",
    description:
      "시급·주 근무시간으로 주휴수당과 주급·월급을 바로 계산. 2026년 최저시급 10,320원 기준 알바·파트타임 계산기.",
  },
};

export default function HourlyWageToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            시급·주휴수당 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            시급과 주 근무시간을 입력하면{" "}
            <span className="font-black text-brand-dark">주휴수당 포함 주급</span>을 바로 계산해
            드려요. 2026년 최저시급 10,320원 기준입니다.
          </p>
        </header>

        <HourlyWageCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">주휴수당이 무엇인가요?</h2>
            <p>
              주휴수당은 <strong className="text-slate-800">1주 동안 정해진 근무일을 모두
              개근한 근로자에게 유급으로 주는 하루치 임금</strong>입니다. 1주 소정근로시간이{" "}
              <strong className="text-slate-800">15시간 이상</strong>이면 정규직·아르바이트
              구분 없이 받을 수 있습니다. 주 40시간을 일하는 경우 하루치인 8시간분(시급 ×
              8)이 주휴수당으로 더해지고, 40시간 미만이라면 일한 비율만큼{" "}
              <strong className="text-slate-800">(주 소정근로 ÷ 40 × 8) × 시급</strong>으로
              계산합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">2026년 최저임금은 얼마인가요?</h2>
            <p>
              2026년 최저시급은 <strong className="text-slate-800">10,320원</strong>입니다. 주
              40시간(주휴 포함 월 209시간) 기준 월급으로 환산하면 약{" "}
              <strong className="text-slate-800">2,156,880원</strong>이 됩니다. 시급이 이보다
              낮으면 최저임금 위반이므로, 위 계산기에서 시급을 입력하면 최저임금 미달 여부도
              함께 알려 드립니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">함께 보면 좋은 도구·글</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/tools/salary/" className="font-bold text-brand-dark underline underline-offset-2">연봉 실수령액 계산기</Link>
                {" "}— 정규직 전환이나 연봉 계약 시 세후 월급이 얼마인지 확인해 보세요.
              </li>
              <li>
                <Link href="/tools/annual-leave-allowance/" className="font-bold text-brand-dark underline underline-offset-2">연차수당 계산기</Link>
                {" "}— 주 15시간 이상 근무라면 연차수당도 챙길 수 있습니다. 미리 계산해 보세요.
              </li>
              <li>
                <Link href="/tools/" className="font-bold text-brand-dark underline underline-offset-2">팁픽 계산기 모음</Link>
                {" "}— 퇴직금·4대보험·대출 이자 등 생활 속 계산기를 한곳에 모았습니다.
              </li>
            </ul>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 월 환산액은 주급에 월평균 주수(약 4.345주)를 곱한{" "}
            <strong className="text-slate-700">참고용 근사치</strong>입니다. 실제 급여는 근무
            형태·공휴일·연장근로 등에 따라 달라질 수 있습니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
