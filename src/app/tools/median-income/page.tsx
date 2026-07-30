import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedianIncomeCalculator from "@/components/MedianIncomeCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/median-income/";

export const metadata: Metadata = {
  title: "기준 중위소득 계산기 2026 | 생계·의료·주거·교육급여 자격선 | 팁픽",
  description:
    "가구원수만 넣으면 2026년 기준 중위소득과 생계급여(32%)·의료(40%)·주거(48%)·교육급여(50%) 선정기준을 바로 확인. 기초생활보장 자격 판정용 참고 계산기.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "기준 중위소득 계산기 2026 | 생계·의료·주거·교육급여 자격선 | 팁픽",
    description:
      "가구원수로 2026 기준 중위소득과 4대 급여(생계·의료·주거·교육) 선정기준을 바로 확인. 기초생활보장 자격 참고용.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function MedianIncomeToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            기준 중위소득 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            가구원수만 고르면{" "}
            <span className="font-black text-brand-dark">2026년 기준 중위소득</span>과 생계·의료·주거·교육급여
            선정기준을 바로 확인해 드려요.
          </p>
        </header>

        <MedianIncomeCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">기준 중위소득이 뭔가요?</h2>
            <p>
              기준 중위소득은 정부가 매년 고시하는{" "}
              <strong className="text-slate-800">복지 지원의 소득 기준선</strong>입니다. 전 국민을 소득순으로
              줄 세웠을 때 한가운데 있는 값으로, 기초생활보장을 비롯한 수많은 복지사업이 이 값의 몇 %를
              기준으로 대상을 정해요. 2026년 기준 중위소득은 역대 최대인 6.51% 올랐습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">4대 급여 선정기준</h2>
            <p>
              기초생활보장 4대 급여는 가구 <strong className="text-slate-800">소득인정액</strong>(소득 + 재산
              환산액)이 기준 중위소득 대비 <strong className="text-slate-800">생계 32% · 의료 40% · 주거 48% ·
              교육 50%</strong> 이하일 때 자격이 됩니다. 생계급여는 이 기준액에서 소득인정액을 뺀 부족분을
              현금으로 지원해요. 자세한 내용은{" "}
              <Link
                href="/blog/2026-07-04-livelihood-benefit-guide/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                생계급여 안내
              </Link>
              와{" "}
              <Link
                href="/blog/2026-07-04-housing-benefit-guide/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                주거급여 안내
              </Link>
              에서 확인하세요.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">2026년 가구원수별 기준 중위소득 (1~4인)</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[360px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">가구원수</th>
                    <th className="px-4 py-3 font-semibold">기준 중위소득 (월, 100%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">1인 가구</td>
                    <td className="px-4 py-3 text-slate-600">2,564,238원</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">2인 가구</td>
                    <td className="px-4 py-3 text-slate-600">4,199,292원</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">3인 가구</td>
                    <td className="px-4 py-3 text-slate-600">5,359,036원</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">4인 가구</td>
                    <td className="px-4 py-3 text-slate-600">6,494,738원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              복지사업 공고에 자주 나오는 &quot;중위 ○○% 이하&quot;는 위 표의 100% 값에 비율을 곱하면
              바로 나옵니다. 예를 들어{" "}
              <strong className="text-slate-800">3인 가구 중위 150%</strong>는 5,359,036원 × 1.5 ={" "}
              <strong className="text-slate-800">8,038,554원</strong>입니다. 5인 이상 가구는 위
              계산기에서 바로 확인하세요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 2026년 기준 중위소득 고시값에 급여별 비율을 적용한{" "}
            <strong className="text-slate-700">참고용</strong>입니다. 실제 자격은 소득인정액(근로소득공제·재산
            환산 등)에 따라 달라지므로, 복지로(bokjiro.go.kr) 모의계산과 주민센터에서 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
