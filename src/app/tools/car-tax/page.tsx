import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarTaxCalculator from "@/components/CarTaxCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/car-tax/";

export const metadata: Metadata = {
  title: "자동차세 계산기 2026 | 배기량·차령별 연간 자동차세 | 팁픽",
  description:
    "배기량과 차령만 입력하면 비영업용 승용차 연간 자동차세(지방교육세 포함)를 바로 계산합니다. cc당 세액과 차령 경감(3년차부터 5%, 12년↑ 50%)을 반영한 2026년 계산기.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "자동차세 계산기 2026 | 배기량·차령별 연간 자동차세 | 팁픽",
    description:
      "배기량·차령으로 비영업용 승용차 연간 자동차세를 바로 계산. cc당 세액·차령 경감 반영, 2026년 기준.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function CarTaxToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            자동차세 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            배기량과 차령을 입력하면{" "}
            <span className="font-black text-brand-dark">연간 자동차세(지방교육세 포함)</span>를
            바로 계산해 드려요. 비영업용 승용차 기준입니다.
          </p>
        </header>

        <CarTaxCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">자동차세는 어떻게 계산되나요?</h2>
            <p>
              비영업용 승용차의 자동차세 본세는{" "}
              <strong className="text-slate-800">배기량 × cc당 세액</strong>으로 정해집니다. cc당
              세액은 1,000cc 이하 80원, 1,600cc 이하 140원, 1,600cc 초과 200원입니다. 예를 들어
              2,000cc 차량이면 본세는 2,000 × 200 = 40만 원이고, 여기에{" "}
              <strong className="text-slate-800">지방교육세(자동차세의 30%)</strong>가 더해져 연
              52만 원이 됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">오래된 차는 자동차세가 줄어드나요?</h2>
            <p>
              네. 차령이 오래될수록 자동차세가 줄어듭니다.{" "}
              <strong className="text-slate-800">등록 후 3년차부터 매년 5%씩 경감</strong>되며,
              12년차 이상은 최대 50%까지 깎입니다. 예를 들어 12년 된 2,000cc 차량은 연 52만 원이
              아니라 절반인 26만 원만 내면 됩니다. 위 계산기에 차령(경과 연수)을 입력하면 경감이
              자동으로 반영됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">연납하면 할인받을 수 있어요</h3>
            <p>
              자동차세는 보통 6월과 12월에 절반씩 나눠 내지만, 1월에 1년치를 미리 내는{" "}
              <strong className="text-slate-800">연납(일시납)</strong>을 신청하면 일정 비율을
              할인받을 수 있습니다. 2026년 연납 공제율은{" "}
              <strong className="text-slate-800">연 5%</strong>(지방세법 시행령 기준)이며,
              납부일 이후 남은 기간에 대해 일할 적용되어 1월에 연납하면 연세액의 약 4.6%가
              공제됩니다. 신청 기간(1·3·6·9월)과 정확한 공제액은 위택스(wetax.go.kr)에서
              확인하세요.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">함께 보면 좋은 도구·글</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/tools/" className="font-bold text-brand-dark underline underline-offset-2">팁픽 계산기 모음</Link>
                {" "}— 연봉·대출·퇴직금 등 생활 속 계산기를 한곳에서 이용할 수 있습니다.
              </li>
              <li>
                <Link href="/blog/2026-07-01-car-insurance-saving-guide/" className="font-bold text-brand-dark underline underline-offset-2">자동차보험료 절약 가이드</Link>
                {" "}— 자동차세와 함께 고정비인 보험료를 아끼는 방법을 정리한 글입니다.
              </li>
              <li>
                <Link href="/tools/loan/" className="font-bold text-brand-dark underline underline-offset-2">대출 이자 계산기</Link>
                {" "}— 차량 구매 할부·오토론의 월 상환금과 총이자를 미리 계산해 보세요.
              </li>
            </ul>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 비영업용 승용차 기준의{" "}
            <strong className="text-slate-700">참고용 계산</strong>입니다. 영업용·승합·화물차는
            세액 체계가 다르며, 연납 할인은 반영되지 않은 연간 기준 금액입니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
