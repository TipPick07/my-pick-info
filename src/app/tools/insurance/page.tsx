import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InsuranceCalculator from "@/components/InsuranceCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/insurance/";

export const metadata: Metadata = {
  title: "4대보험 계산기 2026 | 국민연금·건강·장기요양·고용 근로자 부담 | 팁픽",
  description:
    "2026년 4대보험 계산기. 월 급여를 입력하면 국민연금(4.75%)·건강보험(3.595%)·장기요양·고용보험(0.9%)의 근로자 부담액과 합계를 정확히 계산합니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "4대보험 계산기 2026 | 근로자 부담 국민연금·건강·고용 | 팁픽",
    description: "월 급여만 입력하면 4대보험 근로자 부담액을 항목별로 바로 계산.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

const RATES: [string, string, string][] = [
  ["국민연금", "9.5%", "4.75%"],
  ["건강보험", "7.19%", "3.595%"],
  ["장기요양보험", "건강보험료의 13.14%", "절반"],
  ["고용보험(실업급여)", "1.8%", "0.9%"],
];

export default function InsuranceToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">4대보험 계산기</h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            월 급여를 입력하면 <span className="font-black text-brand-dark">국민연금·건강보험·장기요양·고용보험</span>의
            근로자 부담액을 2026년 기준으로 항목별로 계산해 드려요.
          </p>
        </header>

        <InsuranceCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">4대보험이란?</h2>
            <p>
              4대보험은 <strong className="text-slate-800">국민연금·건강보험·장기요양보험·고용보험</strong>을 말합니다.
              노후 연금, 의료비, 요양, 실업급여를 보장하기 위해 근로자와 회사가 보험료를 나누어 냅니다.
              아래 표의 &quot;총 요율&quot;을 근로자와 회사가 절반씩 부담하는 구조입니다(산재보험은 회사 전액 부담).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">2026년 4대보험 요율</h2>
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-4 py-3 text-left font-black">항목</th>
                    <th className="px-4 py-3 text-left font-black">총 요율</th>
                    <th className="px-4 py-3 text-left font-black">근로자 부담</th>
                  </tr>
                </thead>
                <tbody>
                  {RATES.map((row) => (
                    <tr key={row[0]} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-700">{row[0]}</td>
                      <td className="px-4 py-3 text-slate-500">{row[1]}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500">
              국민연금은 기준소득월액 하한 40만원·상한 637만원 구간에서만 부과됩니다(2025.7~2026.6).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">함께 보면 좋은 글</h3>
            <ul className="space-y-1.5">
              <li>· <Link href="/tools/salary/" className="text-brand-dark font-bold hover:underline">연봉 실수령액 계산기 (4대보험+세금 한번에)</Link></li>
              <li>· <Link href="/tools/income-tax/" className="text-brand-dark font-bold hover:underline">종합소득세 계산기</Link></li>
              <li>· <Link href="/money/" className="text-brand-dark font-bold hover:underline">돈이 되는 경제 더 보기</Link></li>
            </ul>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 2026년 요율 기준 근로자 부담분이며, 회사 부담분·산재보험은 제외했습니다. 실제 공제액은 보수월액 산정 방식에 따라 소폭 차이가 있을 수 있습니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
