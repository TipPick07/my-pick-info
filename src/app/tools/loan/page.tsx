import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoanCalculator from "@/components/LoanCalculator";

/**
 * 대출 이자 계산기 — 독립 정적 라우트(서버 컴포넌트).
 *
 * ▷ output:"export" + trailingSlash → metadata 내보내기 위해 서버 컴포넌트 유지.
 * ▷ 인터랙티브 로직은 "use client" <LoanCalculator/>로 분리.
 * ▷ 본 페이지 본문은 SEO/애드센스용 정보 섹션 포함.
 */

const SITE = "https://tip-pick.com";
const PATH = "/tools/loan/";

export const metadata: Metadata = {
  title: "대출 이자 계산기 | 원리금·원금균등 월 상환금·총이자 | 팁픽",
  description:
    "대출 금액·이자율·기간만 입력하면 원리금균등·원금균등·만기일시 상환 방식별 월 상환금과 총이자, 총 상환액을 바로 계산합니다. 첫 12개월 상환 스케줄까지 한눈에.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "대출 이자 계산기 | 원리금·원금균등 월 상환금·총이자 | 팁픽",
    description:
      "원리금균등·원금균등·만기일시 상환 방식별 월 상환금과 총이자를 즉시 계산하는 대출 이자 계산기. 상환 스케줄까지 확인하세요.",
  },
};

export default function LoanToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        {/* 헤더 */}
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            대출 이자 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            대출 금액과 이자율, 기간만 입력하면 상환 방식별{" "}
            <span className="font-black text-brand-dark">월 상환금과 총이자</span>를
            바로 계산해 드려요. 원리금균등·원금균등·만기일시를 비교해 보세요.
          </p>
        </header>

        {/* 계산기 위젯 */}
        <LoanCalculator />

        {/* ── SEO / 정보 섹션 ── */}
        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">
              원리금균등 vs 원금균등, 무엇이 다른가요?
            </h2>
            <p>
              <strong className="text-slate-800">원리금균등상환</strong>은 매달 갚는 금액(원금
              + 이자)이 처음부터 끝까지 동일한 방식입니다. 매달 나가는 돈이 일정해 자금 계획을
              세우기 쉽고, 초기 부담이 비교적 작다는 장점이 있어 가장 널리 쓰입니다. 2026년 기준으로도 주택담보대출·신용대출 대부분이 이 방식을 기본으로 안내합니다. 다만 초반에는
              상환액 중 이자 비중이 크고 원금은 천천히 줄어듭니다. 반면{" "}
              <strong className="text-slate-800">원금균등상환</strong>은 매달 갚는 원금이 동일하고,
              남은 잔액에 대한 이자만 더해지는 방식입니다. 그래서 첫 달 상환액이 가장 크고 시간이
              갈수록 점점 줄어듭니다. 초기 부담은 크지만, 원금이 빠르게 줄어드는 만큼{" "}
              <strong className="text-slate-800">전체적으로 내는 이자 총액은 더 적습니다.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">
              총이자 관점에서 어느 게 유리한가요?
            </h2>
            <p>
              같은 금액·같은 이자율·같은 기간이라면,{" "}
              <strong className="text-slate-800">원금균등상환이 총이자가 가장 적습니다.</strong>
              원금을 빠르게 갚아 나가면서 이자가 붙는 잔액 자체가 빠르게 줄어들기 때문입니다.
              반대로 만기일시상환은 만기까지 원금이 그대로 남아 있어, 매달 이자만 내다가 마지막에
              원금을 한 번에 갚는 구조라 총이자가 가장 많습니다. 정리하면 총이자는 보통{" "}
              <strong className="text-slate-800">원금균등 &lt; 원리금균등 &lt; 만기일시</strong>{" "}
              순서입니다. 다만 원금균등은 초기 상환 부담이 크기 때문에, 당장의 현금 흐름이
              빠듯하다면 매달 일정한 원리금균등이 현실적으로 더 편할 수 있습니다. 위 계산기에서
              상환 방식을 바꿔 가며 총이자를 직접 비교해 보세요.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">중도상환은 무엇인가요?</h3>
            <p>
              중도상환은 약정한 만기보다 일찍 원금의 일부 또는 전부를 갚는 것을 말하며, 남은 이자
              부담을 줄일 수 있지만 금융기관에 따라 일정 기간 내에는{" "}
              <strong className="text-slate-800">중도상환수수료</strong>가 붙을 수 있으니 미리
              확인하는 것이 좋습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">함께 보면 좋은 도구·글</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/tools/rent-conversion/" className="font-bold text-brand-dark underline underline-offset-2">전월세 전환율 계산기</Link>
                {" "}— 전세 보증금과 월세를 오갈 때 어느 쪽이 유리한지 비교할 수 있습니다.
              </li>
              <li>
                <Link href="/tools/brokerage-fee/" className="font-bold text-brand-dark underline underline-offset-2">부동산 중개보수 계산기</Link>
                {" "}— 매매·전세·월세 계약 시 중개수수료 상한을 미리 확인해 보세요.
              </li>
              <li>
                <Link href="/blog/2026-06-28-stress-dsr-loan-limit-2026/" className="font-bold text-brand-dark underline underline-offset-2">스트레스 DSR 대출 한도 가이드</Link>
                {" "}— 2026년 스트레스 DSR 규제에서 내 대출 한도가 얼마나 되는지 정리한 글입니다.
              </li>
            </ul>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 입력한 조건을 바탕으로 한 단순 계산 결과입니다. 실제 대출의 적용 금리,
            상환 방식, 수수료 등은{" "}
            <strong className="text-slate-700">금융기관의 심사 및 약정 조건에 따라 달라질 수
            있습니다.</strong>{" "}
            대출 실행 전 반드시 해당 금융기관의 정확한 조건을 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
