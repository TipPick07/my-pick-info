import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KPassRefundCalculator from "@/components/KPassRefundCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/k-pass-refund/";

export const metadata: Metadata = {
  title: "K-패스 환급 계산기 2026 | 유형별 교통비 환급액 | 팁픽",
  description:
    "월 대중교통비와 유형(일반 20%·청년 30%·다자녀 30~50%·저소득 53.3%)만 넣으면 K-패스 월·연 환급액을 바로 계산합니다. 2026년 기본 환급률 기준 참고용.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "K-패스 환급 계산기 2026 | 유형별 교통비 환급액 | 팁픽",
    description:
      "월 교통비 × 유형별 환급률(20~53.3%)로 K-패스 월·연 환급액을 바로 계산. 2026년 기준 참고용.",
    images: [`${SITE}/og-image-v2.png`],
  },
};

export default function KPassRefundToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            K-패스 환급 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            월 대중교통비와 유형만 고르면{" "}
            <span className="font-black text-brand-dark">매달 돌려받을 금액</span>을 바로
            계산해 드려요.
          </p>
        </header>

        <KPassRefundCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">K-패스 환급은 어떻게 계산되나요?</h2>
            <p>
              한 달에 대중교통을 <strong className="text-slate-800">15회 이상</strong> 이용하면, 그 달
              지출액에 유형별 환급률을 곱한 금액을 다음 달에 돌려받습니다. 환급률은{" "}
              <strong className="text-slate-800">일반 20%, 청년(19~34세) 30%, 2자녀 가구 30%, 3자녀
              이상 50%, 저소득층 53.3%</strong>예요. 2026년부터 월 60회 이용 상한이 폐지돼 많이 탈수록
              그만큼 더 돌려받습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">환급을 받으려면</h2>
            <p>
              <strong className="text-slate-800">K-패스 카드 발급 + 회원가입</strong> 두 단계를 모두
              마쳐야 실적이 쌓입니다. 발급·신청 순서와 유형별 조건은{" "}
              <Link
                href="/blog/2026-07-12-k-pass-benefit-guide/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                K-패스 안내 글
              </Link>
              에서, 서울 정기권(기후동행카드)과의 비교는{" "}
              <Link
                href="/blog/2026-05-08-k-pass-transit-daytrip-guide/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                교통비 절약 3종 비교
              </Link>
              에서 확인하세요.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 기본 환급률 기준{" "}
            <strong className="text-slate-700">참고용</strong>입니다. 정부·지자체의 한시 인상
            이벤트(추가 환급)나 지역 패스(The 경기패스 등) 추가 혜택은 반영하지 않으며, 실제 환급액은
            K-패스 앱에서 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
