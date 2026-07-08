import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ElectricityBillCalculator from "@/components/ElectricityBillCalculator";

const SITE = "https://tip-pick.com";
const PATH = "/tools/electricity-bill/";

export const metadata: Metadata = {
  title: "전기요금 계산기 2026 | 주택용 누진제·여름 요금 바로 확인 | 팁픽",
  description:
    "월 사용량(kWh)만 넣으면 2026년 주택용 누진제 전기요금을 바로 계산. 하계(7~8월) 완화 구간·기후환경요금·부가세·전력기금까지 반영한 예상 청구액 확인.",
  alternates: { canonical: `${SITE}${PATH}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE}${PATH}`,
    title: "전기요금 계산기 2026 | 주택용 누진제·여름 요금 바로 확인 | 팁픽",
    description:
      "사용량(kWh)으로 2026 주택용 누진제 전기요금 예상 청구액을 바로 확인. 하계 완화 구간·부가세·전력기금 반영.",
  },
};

export default function ElectricityBillToolPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-14">
        <header className="space-y-4 mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            전기요금 계산기
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            월 사용량(kWh)만 넣으면{" "}
            <span className="font-black text-brand-dark">주택용 누진제</span>를 반영한 2026년 예상
            전기요금을 바로 확인해 드려요.
          </p>
        </header>

        <ElectricityBillCalculator />

        <article className="mt-12 md:mt-16 space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">누진제, 여름엔 구간이 넓어져요</h2>
            <p>
              주택용 전기요금은 많이 쓸수록 단가가 비싸지는{" "}
              <strong className="text-slate-800">누진제</strong>입니다. 평상시에는 200kWh·400kWh를
              기준으로 3단계로 나뉘지만, 냉방 수요가 큰{" "}
              <strong className="text-slate-800">하계(7~8월)에는 300kWh·450kWh로 구간이 완화</strong>
              됩니다. 같은 350kWh를 써도 여름에는 1~2단계, 봄가을에는 2단계 깊숙이 들어가 요금이
              달라지는 이유예요. 하계·동계에 1,000kWh를 넘기면 최고 단가의 슈퍼유저 요금이 붙습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">청구서에는 전기요금만 있지 않아요</h2>
            <p>
              실제 청구액은 기본요금 + 전력량요금에{" "}
              <strong className="text-slate-800">기후환경요금(9원/kWh)과 연료비조정액(+5원/kWh)</strong>
              을 더한 전기요금 계에, <strong className="text-slate-800">부가가치세 10%</strong>와{" "}
              <strong className="text-slate-800">전력산업기반기금 2.7%</strong>를 얹어 계산합니다. 이
              계산기는 그 구조를 그대로 반영했습니다. 요금을 줄이는 방법도 함께 챙겨 보세요 —
              기초수급·다자녀·출산가구라면{" "}
              <Link
                href="/blog/2026-07-08-electricity-welfare-discount/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                전기요금 복지할인
              </Link>
              , 전기를 아낀 만큼 돌려받는{" "}
              <Link
                href="/blog/2026-07-08-energy-cashback-guide/"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                에너지캐시백
              </Link>
              도 정리해 두었습니다.
            </p>
          </section>

          <p className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-500">
            ※ 본 계산기는 2026년 한국전력 주택용 요금표(저압·고압)를 적용한{" "}
            <strong className="text-slate-700">참고용</strong>입니다. 연료비조정액은 분기별로 변동될 수
            있고, 복지할인·에너지바우처·TV수신료·검침일 차이는 반영하지 않으므로 실제 청구액은
            한전ON(online.kepco.co.kr)에서 확인하시기 바랍니다.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
