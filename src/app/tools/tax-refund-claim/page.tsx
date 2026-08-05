import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TaxRefundClaimCalculator from "@/components/TaxRefundClaimCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/tax-refund-claim/";

export const metadata: Metadata = {
  title: "경정청구 환급액 계산기 (2026) | 팁픽",
  description:
    "연말정산에서 놓친 월세·의료비·교육비 공제를 5년까지 소급 청구하면 얼마를 돌려받는지 계산합니다. 공제율과 한도, 지방소득세까지 반영한 참고용 계산기입니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "경정청구 환급액 계산기 (2026) | 팁픽",
    description: "놓친 월세·의료비·교육비 공제를 5년 소급하면 얼마가 돌아오나.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function TaxRefundClaimToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            경정청구 환급액 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            연말정산에서 빠뜨린 공제를{" "}
            <span className="font-black text-brand-dark">5년까지 소급</span>하면 얼마가
            돌아오는지 계산해 드려요. 월세·의료비·교육비 공제율과 한도를 그대로 반영했습니다.
          </p>
        </header>

        <TaxRefundClaimCalculator />

        <article className="mt-12 space-y-8 text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              왜 세액공제액에 1.1을 곱하나
            </h2>
            <p>
              세액공제는 소득세를 직접 줄여 줍니다. 그런데 <strong>지방소득세는 소득세의 10%</strong>로
              매겨지므로, 소득세가 100만 원 줄면 지방소득세도 10만 원 함께 줄어듭니다. 그래서 실제
              환급액은 세액공제액의 1.1배가 됩니다. 이 계산기는 그 값을 보여 줍니다.
            </p>
            <p>
              다만 한 가지 전제가 있습니다. <strong>이미 낸 세금이 있어야 돌려받습니다.</strong> 소득이
              적어 결정세액이 0원이었다면 공제를 아무리 늘려도 환급은 생기지 않습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              항목마다 한도가 걸리는 지점이 다릅니다
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>월세</strong> — 총급여 5,500만 원 이하 17%, 7,000만 원 이하 15%. 공제 대상
                한도는 연 1,000만 원이라 <strong>월 84만 원쯤부터</strong> 위쪽이 빠집니다.
              </li>
              <li>
                <strong>의료비</strong> — 총급여의 3%를 넘는 금액에만 15%. 총급여 5,000만 원이면
                문턱이 150만 원이라 <strong>의료비 150만 원은 공제액이 0원</strong>입니다.
              </li>
              <li>
                <strong>교육비</strong> — 15%. 본인은 한도가 없고, 대학생 자녀는 900만 원,
                취학전·초중고는 300만 원까지입니다.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              지금 청구할 수 있는 연도
            </h2>
            <p>
              경정청구는 법정신고기한(5월 31일)이 지난 후 <strong>5년</strong> 이내입니다. 그래서
              2026년 8월 현재 청구 가능한 것은 <strong>2021~2025년 귀속 5개 연도</strong>이고,
              2020년 귀속분은 올해 5월 31일에 이미 닫혔습니다. 다음 마감은 2027년 5월 31일입니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">이어서 보면 좋은 것</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <Link href="/blog/2026-08-03-hidden-money-refund-deadline/" className="text-brand-dark font-bold underline underline-offset-2">
                  숨은 내 돈 찾기 — 창구별 시효
                </Link>{" "}
                — 세금 말고도 되찾을 곳이 다섯 군데 더 있습니다
              </li>
              <li>
                <Link href="/guides/hidden-money-checkup/" className="text-brand-dark font-bold underline underline-offset-2">
                  숨은 돈 통합 조회 가이드
                </Link>{" "}
                — 홈택스 경정청구까지 가는 동선
              </li>
              <li>
                <Link href="/blog/2026-06-27-year-end-tax-settlement-guide/" className="text-brand-dark font-bold underline underline-offset-2">
                  연말정산 환급 구조
                </Link>{" "}
                — 무엇을 놓쳤는지부터 짚기
              </li>
            </ul>
          </section>

          <p className="text-xs text-slate-400 leading-relaxed">
            본 계산기는 2026년 기준 공제율·한도를 반영한 참고용 도구입니다. 실제 환급액은 그 해의
            총급여, 다른 공제 항목, 결정세액에 따라 달라지며 결정세액을 넘어설 수 없습니다. 청구
            항목에는 증빙이 필요하고, 확정신고 대상자는 절차가 다를 수 있습니다. 정확한 금액과
            신청 방법은 국세청 홈택스와 관할 세무서(국세상담센터 126)에서 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
