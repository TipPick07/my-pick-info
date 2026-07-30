import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 세금 가이드 — 부동산 보유세(재산세 + 종합부동산세) 큰그림
 *
 * ▷ house-capital-gains-tax 토큰 그대로: HERO 3박스 / 핵심 비교표 / DepthCard 2 /
 *   보유세 달력 표 / 체크리스트 / amber / FAQ 5 / 관련 2 / CTA 2 / 면책+출처 / JSON-LD.
 * ▷ 외부 컴포넌트는 Header/Footer만, SectionTitle·DepthCard는 인라인.
 *
 * [사실 검증 2026-07-09]
 * - 재산세: 과세기준일 6/1, 주택 7/16~31·9/16~30 절반씩(20만 이하 7월 일시), 분납 250만 초과.
 *   과표 = 공시 × 공정시장가액비율(일반 60%, 1주택 43/44/45%), 표준세율 0.1~0.4% 4단계,
 *   1주택·공시 9억 이하 특례세율 0.05%p 인하(2026년 성립분까지 명시), 도시지역분 0.14%·지방교육세 20%,
 *   세부담상한 105/110/130%.
 * - 종부세: 인별 합산 9억(1주택 단독 12억) 공제, 공정시장가액비율 60%, 세율 2주택 이하 0.5~2.7%·
 *   3주택 이상 과표 12억 초과 2.0~5.0%(국세청 세율표), 재산세 중복분 공제, 고령(20/30/40)+장기(20/40/50)
 *   합산 80% 한도, 부부 공동명의 특례 신청 9/16~30, 납부 12/1~15·분납 250만 초과 6개월, 세부담상한 150%.
 * 출처: 국세청 종부세 세율(nts.go.kr cntntsId=7736)·세액계산 흐름도(7735), 지방세법·시행령,
 *   행정안전부 위택스, 부동산공시가격알리미.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/property-holding-tax/";
const UPDATED = "2026-07-09"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_PTAX = "/blog/2026-07-09-property-tax-payment-guide/"; // 재산세 글(짝)
const SRC_JONGBU = "/blog/2026-07-09-comprehensive-real-estate-tax/"; // 종부세 글(짝)
const SRC_CGT = "/guides/house-capital-gains-tax/"; // 팔 때 세금
const SRC_FIRSTHOME = "/guides/first-home-purchase/"; // 살 때 혜택
const SRC_MONEY = "/money/";

// 공식 출처 (staleness 완화 — 최신값 확인 링크)
const SRC_WETAX = "https://www.wetax.go.kr"; // 위택스 — 재산세 조회·납부
const SRC_HOMETAX = "https://hometax.go.kr"; // 홈택스 — 종부세 간이세액계산
const SRC_NTS_RATE = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2354&cntntsId=7736"; // 종부세 세율
const SRC_REALTY = "https://www.realtyprice.kr"; // 부동산공시가격알리미

const OG_TITLE = "부동산 보유세 — 재산세·종부세 총정리 (2026)";
const OG_DESC =
  "모두가 내는 재산세(7월·9월)와 공시 9억(1주택 12억) 초과만 내는 종부세(12월) — 계산 구조·1주택 혜택·보유세 달력을 한 표로 정리.";

export const metadata: Metadata = {
  title: "부동산 보유세 — 재산세·종부세 총정리 (2026) | 팁픽",
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

/* ─────────────────────────  본문 데이터 (SSOT · 페이지 본문 그대로)  ───────────────────────── */

// ★ 핵심 비교표 — 재산세 vs 종부세
const COMPARE = [
  {
    axis: "누가 내나",
    ptax: "주택을 가진 사람 전부",
    jtax: "인별 합산 공시가격 9억(1주택 단독 12억) 초과자만",
    accent: true,
  },
  {
    axis: "기준일·단위",
    ptax: "6월 1일 소유자 · 물건별(시·군·구 부과)",
    jtax: "6월 1일 소유자 · 사람별 전국 합산(국세)",
  },
  {
    axis: "언제 내나",
    ptax: "7월 16~31일 · 9월 16~30일 (절반씩)",
    jtax: "12월 1~15일 (11월 말 고지)",
    accent: true,
  },
  {
    axis: "계산",
    ptax: "공시 × 43~60% × 0.1~0.4% (+도시지역분·교육세)",
    jtax: "(공시 합산 − 9억/12억) × 60% × 0.5~2.7% (3주택 최대 5%)",
  },
  {
    axis: "1주택 혜택",
    ptax: "공정시장가액비율 43~45% + 9억 이하 특례세율",
    jtax: "12억 공제 + 고령·장기보유 세액공제 최대 80%",
    accent: true,
  },
  {
    axis: "급등 방지",
    ptax: "세부담상한 105~130%",
    jtax: "세부담상한 150%",
  },
];

// 재산세 (DepthCard)
const PTAX_ROWS = [
  {
    k: "① 6월 1일이 가른다",
    v: "매년 6월 1일 현재 소유자(잔금일·등기일 중 빠른 날 기준)가 그해 재산세를 전부 부담합니다. 5월 말~6월 초에 사고팔 때는 잔금 날짜 하루가 1년치 세금을 가릅니다.",
    accent: true,
  },
  {
    k: "② 계산 구조",
    v: "공시가격 × 공정시장가액비율 = 과세표준, 여기에 0.1~0.4% 4단계 누진세율을 곱합니다. 비율은 일반 주택 60%, 1세대 1주택은 공시가격에 따라 43%(3억 이하)·44%(3~6억)·45%(6억 초과)로 낮춰줍니다.",
  },
  {
    k: "③ 1주택 특례세율",
    v: "1세대 1주택이면서 공시 9억 이하면 구간별 세율을 0.05%p씩 낮춘 특례세율(0.05~0.35%)이 자동 적용됩니다. 별도 신청은 필요 없지만, 고지서의 세율·과세표준이 특례 기준인지 확인해 보세요.",
    accent: true,
  },
  {
    k: "④ 납부·분납",
    v: "주택분은 7월과 9월에 절반씩 나옵니다(세액 20만 원 이하는 7월 일시 부과). 250만 원을 넘으면 분납 신청이 가능하고, 지방세는 카드 납부 수수료가 없어 무이자 할부·포인트 활용이 순이득입니다.",
  },
  {
    k: "⑤ 어디서 확인하나",
    v: "위택스(서울은 이택스)에서 고지 내역 조회·전자납부가 됩니다. 고지서에는 본세 외에 도시지역분(과세표준의 0.14%)과 지방교육세(본세의 20%)가 함께 붙습니다.",
  },
];

// 종부세 (DepthCard)
const JTAX_ROWS = [
  {
    k: "① 인별 합산이 핵심",
    v: "세대가 아니라 사람별로 전국 주택 공시가격을 합산해 9억 원을 넘는 부분만 과세합니다. 1세대 1주택 단독명의는 12억 원까지 공제 — 부부가 절반씩 가진 12억 아파트는 각자 6억이라 대상이 아닙니다.",
    accent: true,
  },
  {
    k: "② 계산 흐름",
    v: "(공시가격 합산 − 9억 또는 12억) × 공정시장가액비율 60% = 과세표준 × 세율(2주택 이하 0.5~2.7%, 3주택 이상은 과표 12억 초과 구간부터 2.0~5.0%). 같은 부분에 부과된 재산세 상당액은 빼주고, 산출세액의 20%가 농어촌특별세로 붙습니다.",
  },
  {
    k: "③ 1주택 세액공제",
    v: "1세대 1주택 단독명의자는 고령자 공제(60세 20%·65세 30%·70세 40%)와 장기보유 공제(5년 20%·10년 40%·15년 50%)를 합해 최대 80%까지 세액을 깎습니다.",
  },
  {
    k: "④ 부부 공동명의 선택",
    v: "공동명의 1주택은 매년 ① 각자 9억씩 총 18억 공제(기본) ② 12억 공제 + 고령·장기 세액공제(1주택 특례) 중 유리한 쪽을 고를 수 있습니다. 특례 신청은 9월 16~30일 홈택스에서 합니다.",
    accent: true,
  },
  {
    k: "⑤ 납부",
    v: "11월 말 고지서가 나오고 12월 1~15일에 냅니다. 250만 원 초과분은 6개월 이내 분납 신청이 가능하며, 전년 보유세 대비 150% 세부담상한이 적용됩니다.",
  },
];

// 보유세 달력 (한 해 흐름)
const CALENDAR = [
  { when: "4월 말", what: "공동주택 공시가격 확정 공시", memo: "부동산공시가격알리미에서 조회 — 그해 보유세의 출발점", accent: true },
  { when: "6월 1일", what: "과세기준일", memo: "이날 소유자가 재산세·종부세 모두 부담 (잔금 시점 전략)", accent: true },
  { when: "7월 16~31일", what: "재산세 1기분 납부", memo: "주택 연세액의 1/2 + 건축물분 (20만 이하는 일시 부과)" },
  { when: "9월 16~30일", what: "재산세 2기분 납부 + 종부세 특례 신청", memo: "주택 나머지 1/2 + 토지분 / 부부 공동명의·합산배제 신청 기간" },
  { when: "11월 말", what: "종부세 고지서 발송", memo: "홈택스 간이세액계산으로 미리 가늠 가능" },
  { when: "12월 1~15일", what: "종부세 납부", memo: "250만 초과 분납 6개월 · 농어촌특별세 20% 포함" },
];

const FAQS = [
  {
    q: "5월에 집을 사면 그해 재산세는 누가 내나요?",
    a: "6월 1일 현재 소유자가 냅니다. 5월 31일까지 잔금·등기를 마쳤다면 매수인이, 6월 2일 이후라면 매도인이 그해 재산세(그리고 종부세 대상이라면 종부세까지)를 부담합니다. 사는 쪽은 6월 1일 이후 잔금이, 파는 쪽은 5월 31일 이전 잔금이 유리합니다.",
  },
  {
    q: "재산세와 종부세를 둘 다 내면 이중과세 아닌가요?",
    a: "겹치는 부분은 조정됩니다. 종부세를 계산할 때 같은 과세대상에 이미 부과된 재산세 상당액을 공제한 뒤 세액을 산출하므로, 같은 금액에 두 번 온전히 과세되지는 않습니다.",
  },
  {
    q: "우리 집 공시가격은 어디서 확인하나요?",
    a: "부동산공시가격알리미(realtyprice.kr)에서 주소만 넣으면 조회됩니다. 매년 4월 말 확정되며, 공시가격에 이의가 있으면 열람 기간에 의견을 제출할 수 있습니다. 재산세·종부세 모두 이 공시가격에서 출발합니다.",
  },
  {
    q: "부부 공동명의면 종부세가 무조건 유리한가요?",
    a: "공제 총액은 18억(각 9억)으로 단독명의 12억보다 큽니다. 다만 공동명의는 고령·장기보유 세액공제를 못 받는 것이 기본이라, 공시가격이 18억을 넘고 부부가 고령·장기보유라면 '1주택 특례'(12억 공제 + 세액공제)로 신청하는 쪽이 유리해질 수 있습니다. 매년 9월에 선택할 수 있으니 홈택스 간이계산으로 비교해 보세요.",
  },
  {
    q: "올해 고지서가 작년보다 훌쩍 올랐어요. 왜 그런가요?",
    a: "공시가격 상승이 가장 큰 원인입니다. 다만 재산세는 공시가격 구간별 105~130%, 보유세 전체(종부세)는 150%의 세부담상한이 있어 전년 대비 무한정 오르지는 않습니다. 상한까지 몇 년에 걸쳐 단계적으로 오를 수는 있으니, 공시가격 추이를 매년 4월에 확인해 두는 것이 좋습니다.",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트(파일 내부 · daycare와 동일)  ───────────────────────── */

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

export default function PropertyHoldingTaxGuide() {
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
        name: "부동산 보유세 가이드",
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
              2026년 기준 · 재산세 + 종합부동산세
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              집 가지고 있으면 내는 세금,
              <br className="hidden sm:block" /> 재산세·종부세 — 한눈에 정리 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              보유세는 두 층입니다 — 집을 가진 사람 <strong>모두가 내는 재산세</strong>(7월·9월)와, 인별
              합산 공시가격이 <strong>9억 원(1세대 1주택 단독명의 12억 원)을 넘는 사람만 추가로 내는
              종부세</strong>(12월). 대부분의 1주택자는 재산세만 알면 되고, 기준을 넘는 분은 명의 구조가
              세금을 가릅니다. 이 가이드는 두 세금의 계산 구조 → 1주택 혜택 → 한 해 달력 순서로
              정리했습니다. (집을 <em>팔 때</em>의 세금은{" "}
              <Link
                href={SRC_CGT}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                양도소득세 가이드
              </Link>
              , 처음 <em>살 때</em>의 혜택은{" "}
              <Link
                href={SRC_FIRSTHOME}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                생애최초 주택구입 가이드
              </Link>{" "}
              참고)
            </p>

            {/* 핵심 요약 박스 (인라인 · 값은 본문에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "재산세",
                  v: "7월·9월 절반씩",
                  d: "모든 주택 소유자 · 1주택 특례 43~45%",
                },
                {
                  k: "종부세",
                  v: "공시 9억(1주택 12억) 초과만",
                  d: "12월 납부 · 세액공제 최대 80%",
                },
                {
                  k: "기준일",
                  v: "6월 1일",
                  d: "이날 소유자가 1년치 부담",
                },
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
          {/* 1. ★ 핵심 비교표 — 재산세 vs 종부세 */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="재산세 vs 종부세 — 무엇이 다른가"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      재산세 (지방세)
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      종합부동산세 (국세)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARE.map((r) => (
                    <tr key={r.axis} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.axis}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.ptax}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.jtax}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. 재산세 깊이 */}
          <section>
            <SectionTitle
              kicker="모두가 내는 기본 보유세"
              title="재산세 — 6월 1일·7월·9월이 핵심"
            />
            <DepthCard
              tone="indigo"
              badge="재산세"
              title="공시가격 × 43~60% × 0.1~0.4% (1주택 특례 자동)"
              sub="지방세법 · 위택스 기준"
              rows={PTAX_ROWS}
            />
            {/* 예시 계산 */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                예시 — 공시가격 5억 원 1세대 1주택
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                과세표준 = 5억 × <strong>44%</strong> = 2.2억 원 → 특례세율 본세{" "}
                <strong>26만 원</strong> + 도시지역분(2.2억 × 0.14%) 30만 8천 원 + 지방교육세(본세 ×
                20%) 5만 2천 원 = <strong>연 62만 원</strong>, 7월·9월에 각 31만 원. 같은 집을
                다주택자가 보유하면(비율 60%·표준세율) 연 110만 원대 — 1주택 특례의 힘이 이만큼
                큽니다. 상세 계산 구조는{" "}
                <Link
                  href={SRC_PTAX}
                  className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  재산세 납부 총정리
                </Link>
                에서 확인하세요.
              </p>
            </div>
          </section>

          {/* 3. 종부세 깊이 */}
          <section>
            <SectionTitle
              kicker="기준을 넘는 사람만"
              title="종부세 — 9억·12억과 명의 구조"
            />
            <DepthCard
              tone="slate"
              badge="종부세"
              title="(공시 합산 − 9억/12억) × 60% × 0.5~2.7%"
              sub="국세청 종합부동산세 기준"
              rows={JTAX_ROWS}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              대상인지 애매하다면{" "}
              <Link
                href={SRC_JONGBU}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                종합부동산세 기준 총정리
              </Link>
              에서 인별 합산 사례별로 확인할 수 있습니다.
            </p>
          </section>

          {/* 4. 보유세 달력 */}
          <section>
            <SectionTitle kicker="한 해 흐름" title="부동산 보유세 달력" />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">시기</th>
                    <th className="px-4 py-3 font-semibold">무슨 일</th>
                    <th className="px-4 py-3 font-semibold">메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CALENDAR.map((r) => (
                    <tr key={r.when} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.when}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.what}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. 한 장 체크리스트 */}
          <section>
            <SectionTitle kicker="고지서 받기 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">잔금 시점</strong> — 5~6월에 사고판다면
                  6월 1일 전후로 잔금일 조정(사는 쪽 6/2 이후 · 파는 쪽 5/31 이전 유리)
                </li>
                <li>
                  <strong className="text-slate-800">공시가격</strong> — 매년 4월
                  부동산공시가격알리미에서 확인(보유세의 출발점)
                </li>
                <li>
                  <strong className="text-slate-800">1주택 특례</strong> — 재산세 고지서에
                  공정시장가액비율 43~45%·특례세율이 반영됐는지 확인
                </li>
                <li>
                  <strong className="text-slate-800">부부 공동명의</strong> — 종부세 특례(12억
                  공제+세액공제)와 각자 9억 공제 중 유리한 쪽을 9월 16~30일에 선택
                </li>
                <li>
                  <strong className="text-slate-800">납부 방법</strong> — 지방세 카드 수수료
                  없음(무이자·포인트 활용), 250만 초과면 분납 신청
                </li>
                <li>
                  <strong className="text-slate-800">12월 대비</strong> — 종부세 대상이면
                  11월 고지 전에 홈택스 간이세액계산으로 미리 가늠
                </li>
              </ul>
            </div>
          </section>

          {/* 6. ⚠️ 시점 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 매년 바뀌는 숫자
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                공정시장가액비율·특례는 시행령으로 매년 정해집니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                재산세의 공정시장가액비율(1주택 43~45%)과 9억 이하 특례세율은 법령상 한시 규정을
                연장해 온 것으로, 이 글은 2026년 성립분 기준입니다. 종부세도 공제금액·세율이 정부
                세법 개정에 따라 바뀔 수 있고, 공시가격 상승기에는 세부담상한까지 몇 년에 걸쳐
                오를 수 있습니다. 고지서 금액이 크거나 명의·매매 결정을 앞두고 있다면{" "}
                <a
                  href={SRC_HOMETAX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  홈택스 간이세액계산
                </a>
                과 관할 지자체·세무 전문가에게 최신 기준을 확인하세요.
              </p>
            </div>
          </section>

          {/* 7. FAQ — 네이티브 details/summary */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="보유세에서 가장 많이 묻는 질문" />
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

          {/* 8. 관련 가이드·글 (짧게) */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 가이드·글" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_CGT}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  집 팔 때 양도소득세 가이드 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  보유의 끝 — 1세대 1주택 12억 비과세·장기보유특별공제 최대 80%를 한 표로 정리한
                  가이드.
                </p>
              </Link>
              <Link
                href={SRC_FIRSTHOME}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  생애최초 주택구입 가이드 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  보유의 시작 — 정책대출·취득세 감면·청약까지, 처음 집 살 때 챙길 3대 혜택.
                </p>
              </Link>
            </div>
          </section>

          {/* 9. 발견 CTA — 제휴 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_WETAX}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">위택스에서 재산세 조회·납부 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                wetax.go.kr · 내 고지 내역 바로 확인
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                세금·대출·내집마련 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 비율·세율·공제는 2026년 기준({UPDATED} 확인)으로 국세청·행정안전부 등
              공식 자료를 정리한 것입니다. 공정시장가액비율과 특례세율은 매년 시행령으로 정해지고,
              보유세는 명의·주택 수·공시가격에 따라 결과가 크게 달라집니다. 납부·명의 변경 전
              위택스·홈택스에서 최신 기준을 확인하고, 금액이 큰 결정은 세무 전문가와 상담하시기
              바랍니다. 본 내용은 정보 제공을 위한 것이며 세무 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국세청 종합부동산세 세율·세액계산 흐름도 (
                <a
                  href={SRC_NTS_RATE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  nts.go.kr
                </a>
                )
              </li>
              <li>· 지방세법·시행령 — 재산세 세율·공정시장가액비율·세부담상한</li>
              <li>
                · 행정안전부 위택스 — 재산세 고지·납부 (
                <a
                  href={SRC_WETAX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  wetax.go.kr
                </a>
                )
              </li>
              <li>
                · 부동산공시가격알리미 (
                <a
                  href={SRC_REALTY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  realtyprice.kr
                </a>
                )
              </li>
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
