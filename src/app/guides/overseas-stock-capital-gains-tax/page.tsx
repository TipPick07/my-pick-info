import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 투자/세금 가이드 — 해외주식 양도소득세 신고 완전정복
 *
 * ▷ 독립 정적 라우트. src/content/posts/*.md(블로그)도 pick-info.json(크롤링)도 무접촉.
 * ▷ 본문은 JSX 직접 배치(표 깨짐 차단). 외부 컴포넌트는 Header/Footer만, 나머지 인라인
 *   (house-capital-gains-tax와 동일 토큰·시그니처).
 * ▷ 짝: 해외주식 양도세 계산기(/tools/overseas-stock-tax/) + 주식/ETF 세금 글.
 *
 * [사실 검증 2026-07-02]
 * - 해외 상장주식·ETF 매도 차익은 소액주주도 과세(국내 상장주식 소액주주 비과세와 대비).
 * - 연간(1/1~12/31) 실현손익 합산 − 기본공제 250만원 → 22%(양도세 20% + 지방세 2%).
 * - 신고: 양도한 해의 다음 해 5월 1~31일 홈택스 확정신고·납부(증권사 자동원천징수 없음).
 * - 손익통산은 같은 해 안에서만, 양도차손 이월공제 없음. 매수·매도일 기준환율로 원화 환산(환차익 포함).
 * - 배당은 별개(배당소득세 15.4%, 이자+배당 2천만원 초과 시 금융소득종합과세).
 * 출처: 국세청(nts.go.kr) 국외주식 양도소득세 안내, 홈택스 양도소득세 신고.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/overseas-stock-capital-gains-tax/";
const UPDATED = "2026-07-02";

const SRC_STOCK = "/blog/2026-07-02-stock-tax-guide/";
const SRC_ETF = "/blog/2026-07-02-etf-tax-guide/";
const SRC_CALC = "/tools/overseas-stock-tax/";
const SRC_MONEY = "/money/";

const SRC_NTS = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8800";
const SRC_HOMETAX = "https://hometax.go.kr";

const OG_TITLE =
  "해외주식 양도세 250만 원 공제, 5월 신고 순서";
const OG_DESC =
  "미국·중국 등 해외주식은 소액이라도 이익 250만 원을 넘으면 다음 해 5월에 직접 신고. 과세 요건·22% 세율·손익통산 절세까지 한 표로 정리한 가이드.";

export const metadata: Metadata = {
  title:
    "해외주식 양도세 250만 원 공제, 5월 신고 순서 | 팁픽",
  description: OG_DESC,
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${SITE}${PATH}`,
    title: OG_TITLE,
    description: OG_DESC,
    images: [`${SITE}/og-image-v2.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [`${SITE}/og-image-v2.png`],
  },
};

/* ─────────────────────────  본문 데이터  ───────────────────────── */

const COMPARE = [
  {
    axis: "매매차익 과세",
    one: "비과세 (소액주주)",
    multi: "과세 (소액도)",
    accent: true,
  },
  {
    axis: "세율",
    one: "대주주만 22~27.5%",
    multi: "22% (양도세 20% + 지방세 2%)",
  },
  {
    axis: "기본공제",
    one: "없음",
    multi: "연 250만원",
    accent: true,
  },
  {
    axis: "신고",
    one: "없음",
    multi: "다음 해 5월 직접 신고",
  },
  {
    axis: "원천징수",
    one: "해당 없음",
    multi: "없음 (스스로 납부)",
  },
];

const TAXABLE = [
  {
    k: "① 과세 대상",
    v: "미국·중국·일본 등 해외 거래소에 상장된 주식·ETF를 팔아 남긴 차익입니다. 국내 상장주식과 달리 소액이라도 이익이 나면 과세됩니다.",
  },
  {
    k: "② 기본공제 250만원",
    v: "1년(1/1~12/31) 동안의 해외주식 양도소득 전체에 대해 연 250만원을 공제합니다. 종목마다가 아니라 한 해 합산 기준으로 딱 한 번입니다.",
    accent: true,
  },
  {
    k: "③ 세율 22%",
    v: "공제 후 남은 과세표준에 22%(양도소득세 20% + 지방소득세 2%)를 적용합니다. 국내주식 대주주·부동산과 달리 보유기간에 따른 차등세율은 없습니다.",
  },
  {
    k: "④ 환율",
    v: "매수일과 매도일의 기준환율로 각각 원화로 환산해 차익을 계산합니다. 그래서 외화로는 이익이어도 환율에 따라 원화 기준 손익이 달라질 수 있습니다.",
    accent: true,
  },
];

const FILING = [
  {
    k: "신고 시기",
    v: "주식을 판 해의 다음 해 5월 1일~31일에 확정신고·납부합니다. 예를 들어 2026년에 판 주식은 2027년 5월에 신고합니다.",
  },
  {
    k: "신고 방법",
    v: "국세청 홈택스 '양도소득세' 메뉴에서 신고합니다. 대부분의 증권사가 '해외주식 양도소득세 신고자료'를 제공하니, 내려받아 활용하면 계산 오류를 크게 줄일 수 있습니다.",
    accent: true,
  },
  {
    k: "필요경비",
    v: "매매수수료 등 거래에 든 비용은 필요경비로 빼 양도차익을 줄일 수 있습니다. 관련 내역을 챙겨 두세요.",
  },
  {
    k: "자동이 아니다",
    v: "국내 배당세와 달리 증권사가 양도세를 자동으로 떼지 않습니다. 스스로 신고하지 않으면 무신고·납부지연 가산세가 붙으니, 5월을 놓치지 마세요.",
    accent: true,
  },
];

const SAVE = [
  {
    k: "손익통산",
    v: "같은 해에 이익 난 종목과 손실 난 종목을 합쳐 계산합니다. 이익이 큰 해에는 손실 종목을 연내에 함께 정리하면 과세 대상 이익을 줄일 수 있습니다.",
    accent: true,
  },
  {
    k: "250만원 나눠 쓰기",
    v: "기본공제는 매년 새로 250만원이 주어집니다. 12월에 몰아 팔기보다 연말·연초로 나눠 실현하면 공제를 두 번 받을 수 있습니다.",
  },
  {
    k: "손실은 이월 안 됨",
    v: "올해 양도차손은 다음 해로 이월되지 않습니다. 통산은 '같은 해' 안에서만 가능하니, 손실 활용은 그 해 안에 끝내야 합니다.",
  },
  {
    k: "절세계좌 대안",
    v: "연금저축·ISA에서는 해외주식을 직접 살 수 없지만, 국내에 상장된 해외 ETF로 대체하면 과세이연·저율과세 혜택을 받을 수 있습니다.",
    accent: true,
  },
];

const EXAMPLE = [
  { profit: "250만원", base: "0원", tax: "0원", note: "공제 이하 — 세금 없음" },
  { profit: "500만원", base: "250만원", tax: "55만원", note: "" },
  { profit: "1,000만원", base: "750만원", tax: "165만원", note: "" },
  { profit: "3,000만원", base: "2,750만원", tax: "605만원", note: "" },
];

const FAQS = [
  {
    q: "얼마를 벌면 신고해야 하나요?",
    a: "한 해 해외주식 실현손익을 합산해 이익이 250만원을 넘으면 신고·납부 대상입니다. 250만원 이하이거나 손실이면 낼 세금이 없어 신고 의무가 없습니다. 다만 손실 종목을 이익 종목과 통산하려면 함께 신고해야 합니다.",
  },
  {
    q: "세금은 증권사가 알아서 떼 주나요?",
    a: "아니요. 국내 배당세(15.4% 원천징수)와 달리 해외주식 양도세는 증권사가 자동으로 떼지 않습니다. 본인이 판 해의 다음 해 5월에 홈택스로 직접 신고·납부해야 하며, 놓치면 무신고·납부지연 가산세가 붙습니다.",
  },
  {
    q: "환율은 어떻게 반영되나요?",
    a: "매수일과 매도일의 기준환율로 각각 원화로 환산해 차익을 계산합니다. 그래서 달러로는 이익이어도 환율이 내렸다면 원화 기준 이익은 줄어들 수 있고, 반대의 경우 환차익이 과세 대상에 포함됩니다.",
  },
  {
    q: "손해를 봤는데 통산은 어떻게 하나요?",
    a: "같은 해에 판 종목끼리 이익과 손실을 합산(손익통산)해 순이익에만 과세합니다. 단 통산은 그해 안에서만 가능하고, 남은 손실을 다음 해로 이월하는 공제는 없습니다. 그래서 이익이 큰 해에 손실 종목을 함께 정리하는 것이 절세에 유리합니다.",
  },
  {
    q: "해외주식 배당도 양도세로 신고하나요?",
    a: "아니요. 배당은 양도소득세와 별개입니다. 배당소득세 15.4%가 적용되고(해외는 현지 원천징수 후 정산), 이자·배당을 합쳐 연 2천만원을 넘으면 금융소득종합과세 대상이 됩니다. 양도세(판 차익)와 배당세(받은 배당)를 구분하세요.",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트  ───────────────────────── */

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
        {kicker}
      </p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function DepthCard({
  tone,
  badge,
  title,
  sub,
  rows,
}: {
  tone: "indigo" | "slate";
  badge: string;
  title: string;
  sub: string;
  rows: { k: string; v: string; accent?: boolean }[];
}) {
  const head = tone === "indigo" ? "bg-indigo-600" : "bg-slate-900";
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className={`px-5 py-4 ${head}`}>
        <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
        <p className="mt-2 text-lg font-bold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-white/70">{sub}</p>
      </div>
      <dl className="divide-y divide-slate-100 bg-white">
        {rows.map((r) => (
          <div
            key={r.k}
            className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:gap-4"
          >
            <dt className="w-full shrink-0 text-sm font-semibold text-slate-700 sm:w-40">
              {r.k}
            </dt>
            <dd
              className={`text-sm leading-relaxed ${
                r.accent ? "font-medium text-indigo-700" : "text-slate-600"
              }`}
            >
              {r.v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ─────────────────────────  페이지  ───────────────────────── */

export default function OverseasStockCapitalGainsTaxGuide() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${SITE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "해외주식 양도소득세 가이드",
        item: `${SITE}${PATH}`,
      },
    ],
  };

  return (
    <>
      <Header />

      <main className="bg-white text-slate-800">
        {/* HERO */}
        <section className="border-b border-slate-100 bg-gradient-to-b from-indigo-50/60 to-white">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
              2026년 기준 · 해외주식 양도세
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              해외주식 양도소득세,
              <br className="hidden sm:block" /> 이익 250만 원 넘으면 5월에 신고 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              해외주식으로 이익을 냈다면 국내주식과 달리 세금을 <strong>스스로 챙겨야 합니다.</strong>{" "}
              미국·중국 주식이나 해외 상장 ETF를 팔아 남긴 이익이 한 해 250만 원을 넘으면, 다음 해 5월에
              직접 양도소득세를 신고해야 해요. 증권사가 알아서 떼 주지 않기 때문에 놓치면 가산세가 붙습니다.
              이 글은 과세 요건 → 신고 방법 → 절세 순서로, 얼마를 언제 어떻게 내는지 정리했습니다. (직접
              계산은{" "}
              <Link
                href={SRC_CALC}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                해외주식 양도세 계산기
              </Link>
              , 국내·ETF까지 세금 전체 그림은{" "}
              <Link
                href={SRC_STOCK}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                주식 세금 총정리
              </Link>{" "}
              참고)
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { k: "세율", v: "22%", d: "양도세 20% + 지방세 2%" },
                { k: "기본공제", v: "연 250만원", d: "해외 양도소득 합산 1회" },
                { k: "신고", v: "다음 해 5월", d: "홈택스 직접 신고" },
              ].map((c) => (
                <div
                  key={c.k}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold text-indigo-600">{c.k}</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{c.v}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-16 px-5 py-14">
          {/* 1. 핵심 비교표 */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="국내주식 vs 해외주식 — 세금이 이렇게 다르다"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      국내주식 (소액주주)
                    </th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      해외주식
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARE.map((r) => (
                    <tr key={r.axis} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.axis}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.one}</td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.multi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. 과세 요건 */}
          <section>
            <SectionTitle
              kicker="언제·얼마를 내나"
              title="해외주식 양도세 — 250만 공제 후 22%"
            />
            <DepthCard
              tone="indigo"
              badge="과세 요건"
              title="연간 실현손익 − 250만원 → × 22%"
              sub="국세청 국외주식 양도소득세 기준"
              rows={TAXABLE}
            />
          </section>

          {/* 3. 신고·납부 */}
          <section>
            <SectionTitle
              kicker="스스로 챙겨야 한다"
              title="신고·납부 — 다음 해 5월, 홈택스"
            />
            <DepthCard
              tone="slate"
              badge="신고"
              title="증권사가 안 떼 준다 — 직접 확정신고"
              sub="양도한 해의 다음 해 5월 1~31일"
              rows={FILING}
            />
          </section>

          {/* 4. 예시 계산 표 + 계산 흐름 */}
          <section>
            <SectionTitle kicker="숫자로 보기" title="이익별 양도세 예시" />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">연간 실현이익</th>
                    <th className="px-4 py-3 font-semibold">과세표준 (−250만)</th>
                    <th className="px-4 py-3 font-semibold">세금 (22%)</th>
                    <th className="px-4 py-3 font-semibold">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {EXAMPLE.map((r) => (
                    <tr key={r.profit}>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.profit}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.base}</td>
                      <td className="px-4 py-3 font-medium text-indigo-700">
                        {r.tax}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              내 이익으로 바로 계산하려면{" "}
              <Link
                href={SRC_CALC}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                해외주식 양도세 계산기
              </Link>
              를 이용하세요(손익통산·세후 손익까지 계산).
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                세금이 정해지는 순서
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                <strong>연간 실현손익</strong>(이익 − 손실, 원화 환산) →{" "}
                <strong>− 기본공제 250만원</strong> = 과세표준 →{" "}
                <strong>× 22%</strong>(양도세 20% + 지방세 2%) = 낼 세금. 매매수수료 등 필요경비는
                차익에서 빠지고, 손실 종목은 같은 해 이익과 통산됩니다.
              </p>
            </div>
          </section>

          {/* 5. 절세 */}
          <section>
            <SectionTitle kicker="세금 줄이기" title="해외주식 절세 4가지" />
            <DepthCard
              tone="indigo"
              badge="절세"
              title="손익통산 · 공제 분산 · 절세계좌 대안"
              sub="같은 해 안에서 설계"
              rows={SAVE}
            />
          </section>

          {/* 6. 체크리스트 */}
          <section>
            <SectionTitle kicker="팔기 전·신고 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">대상</strong> — 해외 상장 주식·ETF를
                  팔았는가(국내주식·국내상장 ETF는 규칙이 다름)
                </li>
                <li>
                  <strong className="text-slate-800">이익</strong> — 연간 실현손익 합계가
                  250만 원을 넘는가(넘으면 신고 의무)
                </li>
                <li>
                  <strong className="text-slate-800">통산</strong> — 손실 종목을 같은 해에
                  정리해 순이익을 줄였는가
                </li>
                <li>
                  <strong className="text-slate-800">환율</strong> — 매수·매도 기준환율로 원화
                  환산했는가(환차익 포함)
                </li>
                <li>
                  <strong className="text-slate-800">시기</strong> — 판 해의 다음 해 5월
                  1~31일에 홈택스 확정신고
                </li>
                <li>
                  <strong className="text-slate-800">자료</strong> — 증권사 양도소득세
                  신고자료·매매수수료 내역 준비
                </li>
              </ul>
            </div>
          </section>

          {/* 7. 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 놓치면 가산세
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                해외주식 양도세는 &lsquo;스스로&rsquo; 신고해야 합니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                증권사가 자동으로 떼 주지 않으니, 5월 신고를 놓치면 무신고·납부지연 가산세가
                붙습니다. 양도차손은 다음 해로 이월되지 않고, 환율 변동으로 원화 기준 손익이
                외화 기준과 다를 수 있습니다. 배당은 양도세와 별개(배당소득세 15.4%)라는 점도
                기억하세요. 금액이 크거나 국내주식 양도소득과 합산이 얽힌 경우라면 반드시{" "}
                <a
                  href={SRC_HOMETAX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  국세청 홈택스
                </a>
                와 세무 전문가로 확인하시기 바랍니다.
              </p>
            </div>
          </section>

          {/* 8. FAQ */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="해외주식 세금, 가장 많이 묻는 질문" />
            <div className="space-y-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm [&_summary]:list-none"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                    {f.q}
                    <span className="text-indigo-500 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 9. 관련 글 */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 가이드·글" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_STOCK}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">주식 세금 총정리 →</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  국내·해외 양도세와 배당세, 금융소득종합과세까지 주식 세금의 전체 그림.
                </p>
              </Link>
              <Link
                href={SRC_ETF}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">ETF 세금 완벽정리 →</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  국내주식형·기타·해외상장 ETF의 세금 차이와 &lsquo;같은 S&amp;P500&rsquo; 국내 vs 해외 비교.
                </p>
              </Link>
            </div>
          </section>

          {/* 10. CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href={SRC_CALC}
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">해외주식 양도세 계산기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                내 실현손익으로 세금 바로 계산
              </span>
            </Link>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                세금·투자·재테크 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 세율·공제·신고 절차는 2026년 기준({UPDATED} 확인)으로 국세청 등 공식
              자료를 정리한 것입니다. 세법은 수시로 바뀌고, 해외주식 양도세는 환율 환산·필요경비·
              국내주식 양도소득 합산 등 개별 사안에 따라 결과가 달라질 수 있습니다. 신고·납부 전
              국세청 홈택스에서 최신 기준을 확인하고, 금액이 큰 거래는 세무 전문가와 상담하시기
              바랍니다. 본 내용은 정보 제공을 위한 것이며 세무 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국세청 &lsquo;주식 등 양도소득세(국외주식)&rsquo; 안내 (
                <a
                  href={SRC_NTS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  nts.go.kr
                </a>
                )
              </li>
              <li>· 국세청 홈택스 양도소득세 신고 (hometax.go.kr)</li>
            </ul>
          </footer>
        </div>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
