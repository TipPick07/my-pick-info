import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IncomeTaxCalculator from "@/components/IncomeTaxCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/income-tax/";

export const metadata: Metadata = {
  title: "종합소득세 계산기 2026 | 과세표준별 세율·실효세율 | 팁픽",
  description:
    "2026년 종합소득세 계산기. 과세표준을 입력하면 누진세율(6~45%)로 산출세액·지방소득세·총 납부세액과 실효세율을 정확히 계산합니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "종합소득세 계산기 2026 | 과세표준별 세율·실효세율 | 팁픽",
    description: "과세표준 입력만으로 누진세율(6~45%) 산출세액·지방세·실효세율을 바로 계산.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

const BRACKETS: [string, string, string][] = [
  ["1,400만원 이하", "6%", "-"],
  ["1,400만 ~ 5,000만", "15%", "126만원"],
  ["5,000만 ~ 8,800만", "24%", "576만원"],
  ["8,800만 ~ 1.5억", "35%", "1,544만원"],
  ["1.5억 ~ 3억", "38%", "1,994만원"],
  ["3억 ~ 5억", "40%", "2,594만원"],
  ["5억 ~ 10억", "42%", "3,594만원"],
  ["10억 초과", "45%", "6,594만원"],
];

export default function IncomeTaxToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">종합소득세 계산기</h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            과세표준을 입력하면 <span className="font-black text-brand-dark">누진세율(6~45%)</span>로
            산출세액과 지방소득세, 총 납부세액을 2026년 기준으로 계산해 드려요.
          </p>
        </header>

        <IncomeTaxCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">종합소득세란?</h2>
            <p>
              종합소득세는 1년간의 <strong className="text-slate-800">이자·배당·사업·근로·연금·기타소득</strong>을
              합산해 매기는 세금입니다. 소득에서 각종 공제를 뺀 <strong className="text-slate-800">과세표준</strong>에
              누진세율을 적용해 계산하며, 매년 5월에 신고·납부합니다. 산출된 세금에는 그 10%에 해당하는
              지방소득세가 추가로 붙습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">2026년 종합소득세 세율표</h2>
            <p>
              세율은 과세표준이 클수록 단계적으로 높아지는 <strong className="text-slate-800">누진세율</strong>입니다.
              위 계산기는 아래 표를 그대로 적용합니다.
            </p>
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-4 py-3 text-left font-black">과세표준</th>
                    <th className="px-4 py-3 text-left font-black">세율</th>
                    <th className="px-4 py-3 text-left font-black">누진공제</th>
                  </tr>
                </thead>
                <tbody>
                  {BRACKETS.map((b) => (
                    <tr key={b[0]} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-700">{b[0]}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{b[1]}</td>
                      <td className="px-4 py-3 text-slate-500">{b[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500">
              예) 과세표준 5,000만원 → 5,000만 × 15% − 126만 = <strong>624만원</strong>(지방세 별도).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">함께 보면 좋은 글</h3>
            <ul className="space-y-1.5">
              <li>· <Link href="/blog/2026-06-27-year-end-tax-settlement-guide/" className="text-brand-dark font-bold hover:underline">연말정산 환급 많이 받는 법</Link></li>
              <li>· <Link href="/tools/salary/" className="text-brand-dark font-bold hover:underline">연봉 실수령액 계산기</Link></li>
              <li>· <Link href="/money/" className="text-brand-dark font-bold hover:underline">돈이 되는 경제 더 보기</Link></li>
            </ul>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 산출세액은 2026년 세율로 정확히 계산하나, <strong className="text-slate-700">세액공제·감면·가산세는 반영하지 않은</strong> 참고용입니다. 실제 신고세액은 국세청 홈택스에서 확인하세요.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
