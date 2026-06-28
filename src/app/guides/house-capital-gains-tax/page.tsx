import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 거래형/세금 가이드 — 집 팔 때 양도소득세(1세대 1주택 비과세 중심)
 *
 * ▷ 백로그 §8-2: 양도세는 변수(주택수·조정지역·비과세·중과)가 많아 범용 계산기 부정확 위험 →
 *   '가이드 글'로 다루기 권장. 그 권장을 이행한 첫 세금 가이드.
 * ▷ 독립 정적 라우트입니다. src/content/posts/*.md(블로그)도, public/data/pick-info.json(크롤링)도
 *   건드리지 않으므로 자동발행 파이프라인과 충돌하지 않습니다.
 * ▷ 본문은 마크다운이 아니라 JSX로 직접 배치합니다(표 깨짐 버그 클래스 원천 차단).
 * ▷ 외부 커스텀 컴포넌트는 Header/Footer만 재사용. SectionTitle·DepthCard·표·FAQ는 전부 이 파일 안 인라인
 *   (daycare-admission과 동일 토큰·시그니처).
 * ▷ 기본세율(6~45%)·누진공제액은 종합소득세 계산기(IncomeTaxCalculator)와 동일값(전 구간 검산 일치).
 * ▷ 제휴 링크 없음 — 순수 정보 가이드. 데이터층 무접촉.
 *
 * [사실 검증 2026-06-28]
 * - 1세대 1주택 비과세: 2년 보유 + (2017.8.3 이후 조정대상지역 취득분) 2년 거주, 양도가액 12억 이하.
 * - 장기보유특별공제: 일반 연 2%(최대 30%) / 1세대 1주택 보유 4%+거주 4%(최대 80%).
 * - 세율: 보유 1년 미만 70%, 1~2년 60%, 2년 이상 기본세율. 다주택 중과 조정지역 2주택 +20%p·3주택 +30%p.
 * - 다주택 중과 유예 2026.5.9 종료(정부 2026.2.12 관계부처합동 발표) → 조정지역 다주택 중과 부활.
 * - 일시적 2주택: 종전 취득 1년 후 신규 취득 + 종전 2년 보유 + 신규 취득 후 3년 내 종전 양도.
 * 출처: 국세청(nts.go.kr) 양도세 개요·세율·장특공, 정책브리핑(korea.kr) 중과 유예 종료, 국토부 조정대상지역.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/house-capital-gains-tax/";
const UPDATED = "2026-06-28"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_FINANCE = "/guides/parenting-family-finance/"; // 집 살 때 대출(짝 글)
const SRC_JEONSE = "/blog/2026-06-26-jeonse-wolse-buy-comparison/"; // 살까/전세갈까
const SRC_INCOMETAX = "/tools/income-tax/"; // 양도세 기본세율 = 종소세 누진세율 동일
const SRC_MONEY = "/money/";

// 공식 출처 (staleness 완화 — 최신값 확인 링크)
const SRC_NTS = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7707&mi=2308"; // 국세청 양도세 개요
const SRC_HOMETAX = "https://hometax.go.kr"; // 홈택스 양도세 모의계산
const SRC_MOLIT = "https://www.molit.go.kr/policy/stable/sta_b_03.jsp"; // 국토부 조정대상지역 지정현황

const OG_TITLE =
  "집 팔 때 양도소득세 — 1세대 1주택 12억 비과세·장기보유공제·세율 (2026)";
const OG_DESC =
  "1세대 1주택은 2년 보유(조정지역 취득은 2년 거주)·양도가액 12억까지 비과세. 장기보유특별공제 최대 80%, 다주택 중과 부활(2026.5)까지 한 표로 정리한 가이드.";

export const metadata: Metadata = {
  title:
    "집 팔 때 양도소득세 — 1세대 1주택 비과세·장기보유공제·세율 한눈에 (2026) | 팁픽",
  description: OG_DESC,
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${SITE}${PATH}`,
    title: OG_TITLE,
    description: OG_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
  },
};

/* ─────────────────────────  본문 데이터 (SSOT · 페이지 본문 그대로)  ───────────────────────── */

// ★ 핵심 비교표 — 1세대 1주택(실수요) vs 다주택(조정지역)
const COMPARE = [
  {
    axis: "비과세",
    one: "양도가액 12억까지 비과세",
    multi: "비과세 없음 (전액 과세)",
    accent: true,
  },
  {
    axis: "기본 요건",
    one: "2년 보유 (조정지역 취득은 +2년 거주)",
    multi: "해당 없음",
  },
  {
    axis: "세율 (2년 이상)",
    one: "비과세 · 12억 초과분만 기본세율 6~45%",
    multi: "기본세율 + 20~30%p (조정지역 중과)",
    accent: true,
  },
  {
    axis: "장기보유특별공제",
    one: "최대 80% (보유 40% + 거주 40%)",
    multi: "중과 대상은 배제 (일반은 6~30%)",
  },
  {
    axis: "결정 변수",
    one: "보유·거주 기간 + 양도가액",
    multi: "조정지역 여부 + 주택 수",
  },
];

// 1세대 1주택 비과세 (DepthCard · v=본문 그대로, k=구조 라벨)
const EXEMPT = [
  {
    k: "① 1세대 1주택",
    v: "양도일 현재 1세대가 국내에 주택 1채만 보유해야 합니다. '세대'는 본인과 배우자, 같이 사는 직계존비속을 함께 묶어 셉니다. 분양권·조합원입주권도 주택 수에 포함될 수 있으니, 흩어진 권리까지 합쳐 정말 1주택인지부터 확인하세요.",
  },
  {
    k: "② 2년 이상 보유",
    v: "취득일부터 양도일까지 2년 이상 보유해야 합니다. 2년을 못 채우고 팔면 비과세가 안 되고 단기 세율(아래 세율표)이 붙습니다.",
  },
  {
    k: "③ 거주요건(조정지역)",
    v: "2017년 8월 3일 이후 조정대상지역에서 취득한 주택은 보유만으로는 부족하고 2년 이상 실제 거주까지 해야 비과세됩니다. 비조정지역에서 취득했다면 거주요건 없이 2년 보유로 충분합니다.",
    accent: true,
  },
  {
    k: "12억 기준 (고가주택)",
    v: "양도가액 12억원 이하면 위 요건 충족 시 전액 비과세입니다. 12억을 넘어도 전체가 과세되는 게 아니라 '12억 초과분에 해당하는 양도차익'만 과세됩니다(나머지는 여전히 비과세).",
  },
  {
    k: "갈아타기(일시적 2주택)",
    v: "이사로 잠깐 2주택이 된 경우, ① 종전주택 취득 후 1년이 지나 새 집을 사고 ② 종전주택을 2년 이상 보유했으며 ③ 새 집을 산 날부터 3년 안에 종전주택을 팔면 1주택으로 보아 비과세합니다. 단 하루라도 넘기면 비과세가 사라집니다.",
    accent: true,
  },
];

// 장기보유특별공제 (DepthCard · v=본문 그대로, k=구조 라벨)
const LTD = [
  {
    k: "일반 (연 2%)",
    v: "3년 이상 보유한 토지·건물·일반 주택은 보유기간 1년당 2%씩, 15년 이상이면 최대 30%를 양도차익에서 빼 줍니다.",
  },
  {
    k: "1세대 1주택 (연 4%+4%)",
    v: "1세대 1주택은 훨씬 큽니다. 보유기간 1년당 4%(최대 40%) + 거주기간 1년당 4%(최대 40%)를 합해 최대 80%까지 공제합니다. 10년 이상 보유하고 거주하면 80%입니다.",
    accent: true,
  },
  {
    k: "80%를 받으려면",
    v: "보유 3년 이상 + 거주 2년 이상이라는 전제가 있어야 80% 표(4%+4%)가 적용됩니다. 거주를 거의 안 했다면 보유분 위주로만 적용되어 공제율이 크게 줄어듭니다.",
  },
  {
    k: "언제 위력을 발휘하나",
    v: "12억 이하 1주택은 어차피 전액 비과세라 장특공이 필요 없습니다. 장특공이 결정적인 건 12억 초과 고가주택의 '과세되는 부분'으로, 80% 공제 여부에 따라 세금이 크게 달라집니다.",
  },
  {
    k: "중과 대상은 배제",
    v: "조정대상지역 다주택 중과가 적용되는 주택은 장기보유특별공제 자체가 배제됩니다(아무리 오래 보유해도 공제 0). 그래서 다주택 중과는 세 부담이 더 무겁습니다.",
  },
];

// 세율 — 보유기간별 + 다주택 중과
const RATE_ROWS = [
  { hold: "보유 1년 미만", rate: "70%", note: "주택·조합원입주권 (분양권도 70%)" },
  { hold: "1년 이상 ~ 2년 미만", rate: "60%", note: "주택·조합원입주권 (분양권은 1년 이상 60%)" },
  { hold: "2년 이상", rate: "기본세율 6~45%", note: "아래 누진세율표 적용", accent: true },
  { hold: "조정지역 2주택 (중과)", rate: "기본세율 +20%p", note: "2026.5.10 유예 종료로 부활", accent: true },
  { hold: "조정지역 3주택 이상 (중과)", rate: "기본세율 +30%p", note: "2026.5.10 유예 종료로 부활", accent: true },
];

// 기본세율 누진표 (종합소득세 계산기와 동일값 · 전 구간 검산 일치)
const BRACKETS = [
  { base: "1,400만원 이하", rate: "6%", deduct: "—" },
  { base: "5,000만원 이하", rate: "15%", deduct: "126만원" },
  { base: "8,800만원 이하", rate: "24%", deduct: "576만원" },
  { base: "1.5억원 이하", rate: "35%", deduct: "1,544만원" },
  { base: "3억원 이하", rate: "38%", deduct: "1,994만원" },
  { base: "5억원 이하", rate: "40%", deduct: "2,594만원" },
  { base: "10억원 이하", rate: "42%", deduct: "3,594만원" },
  { base: "10억원 초과", rate: "45%", deduct: "6,594만원" },
];

const FAQS = [
  {
    q: "1주택인데 양도세를 한 푼도 안 내나요?",
    a: "2년 이상 보유(조정대상지역에서 취득했다면 2년 이상 거주까지)했고 양도가액이 12억원 이하이면 비과세라 사실상 안 냅니다. 12억을 넘으면 12억 초과분에 해당하는 차익만 과세되고, 거기에 장기보유특별공제(최대 80%)가 적용됩니다.",
  },
  {
    q: "산 지 2년이 안 됐는데 지금 팔아야 해요.",
    a: "보유 2년 미만이면 비과세가 안 되고 단기 세율이 붙습니다. 1년 미만이면 70%, 1년 이상 2년 미만이면 60%로 매우 무겁습니다. 급한 사정이 아니라면 2년을 채운 뒤 파는 쪽이 세금에서 크게 유리합니다.",
  },
  {
    q: "이사하려고 새 집을 샀는데 옛 집이 안 팔려요.",
    a: "일시적 2주택 특례가 있습니다. 종전주택을 취득하고 1년이 지나 새 집을 샀고, 종전주택을 2년 이상 보유했다면, 새 집을 산 날부터 3년 안에 종전주택을 팔면 1주택 비과세를 받습니다. 기한을 하루라도 넘기면 비과세가 사라지니 처분 시점을 꼭 챙기세요.",
  },
  {
    q: "다주택 중과가 정말 부활했나요? 조정대상지역은 어떻게 확인하죠?",
    a: "네. 정부가 2026년 2월 다주택자 양도세 중과 유예를 예정대로 2026년 5월 9일 종료한다고 발표했고, 그에 따라 조정대상지역 다주택 양도에는 중과(2주택 +20%p, 3주택 이상 +30%p)가 부활했습니다. 조정대상지역은 국토교통부가 수시로 지정·해제하므로(2025년 10월 대책으로 서울 전역·경기 일부 재지정), 팔기 전에 국토부·국세청에서 최신 상태를 확인하세요.",
  },
  {
    q: "양도세는 언제, 어떻게 신고하나요?",
    a: "양도일(잔금일과 등기일 중 빠른 날)이 속한 달의 말일부터 2개월 안에 예정신고·납부합니다. 한 해에 2건 이상 팔았다면 다음 해 5월에 합산해 확정신고합니다. 취득세·중개수수료·법무사 비용·자본적지출(샤시·확장 등) 영수증을 모아 두면 필요경비로 빼 양도차익을 줄일 수 있습니다.",
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

export default function HouseCapitalGainsTaxGuide() {
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
        name: "집 팔 때 양도소득세 가이드",
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
              2026년 기준 · 1세대 1주택 비과세
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              집 팔 때 양도소득세,
              <br className="hidden sm:block" /> 1주택이면 12억까지 비과세 — 한눈에 정리 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              집을 팔 때 양도세의 핵심은 단 하나입니다 — <strong>내가 &lsquo;1세대 1주택 비과세&rsquo;에 해당하는가.</strong>{" "}
              실수요로 한 채 가진 분은 2년 보유(조정지역에서 샀다면 2년 거주)만 채우면 양도가액 12억원까지
              세금이 거의 없습니다. 반대로 2026년 5월 9일자로 다주택 양도세 중과 유예가 끝나면서(정부 2026년 2월 발표),
              조정대상지역 다주택자는 중과가 다시 붙습니다. 이 글은 비과세 요건 → 장기보유특별공제 → 세율 순서로,
              내가 어디에 해당하는지부터 짚어 드립니다. (집을 <em>살 때</em>의 대출은{" "}
              <Link
                href={SRC_FINANCE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                주택 대출 가이드
              </Link>
              , 살까/전세로 갈까는{" "}
              <Link
                href={SRC_JEONSE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                전세 vs 월세 vs 매매
              </Link>{" "}
              참고)
            </p>

            {/* 핵심 요약 박스 (인라인 · 값은 본문에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "1세대 1주택",
                  v: "12억까지 비과세",
                  d: "2년 보유 (+조정지역 2년 거주)",
                },
                {
                  k: "장기보유특별공제",
                  v: "최대 80%",
                  d: "보유 40% + 거주 40%",
                },
                {
                  k: "다주택 중과",
                  v: "2026.5.10 부활",
                  d: "조정지역 2주택 +20%p · 3주택 +30%p",
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
          {/* 1. ★ 핵심 비교표 — 1주택 vs 다주택 (글의 중심) */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="1세대 1주택 vs 다주택 — 무엇이 다른가"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      1세대 1주택 (실수요)
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      다주택 (조정지역)
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
                        {r.one}
                      </td>
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

          {/* 2. 1세대 1주택 비과세 깊이 */}
          <section>
            <SectionTitle
              kicker="대부분 여기에 해당"
              title="1세대 1주택 비과세 — 2년·12억이 핵심"
            />
            <DepthCard
              tone="indigo"
              badge="비과세"
              title="2년 보유 + (조정지역) 2년 거주 + 12억 이하"
              sub="국세청 양도소득세 기준"
              rows={EXEMPT}
            />
          </section>

          {/* 3. 장기보유특별공제 깊이 */}
          <section>
            <SectionTitle
              kicker="오래 가질수록 깎인다"
              title="장기보유특별공제 — 1주택은 최대 80%"
            />
            <DepthCard
              tone="slate"
              badge="장특공"
              title="일반 연 2%(최대 30%) vs 1주택 4%+4%(최대 80%)"
              sub="양도차익에서 빼 주는 공제"
              rows={LTD}
            />
          </section>

          {/* 4. 세율 표 (보유기간별 + 중과) + 기본세율 누진표 + 계산 흐름 */}
          <section>
            <SectionTitle kicker="얼마를 떼나" title="양도소득세율 — 보유기간이 가른다" />

            {/* 보유기간별 세율 */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold">세율</th>
                    <th className="px-4 py-3 font-semibold">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RATE_ROWS.map((r) => (
                    <tr key={r.hold} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.hold}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.rate}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 기본세율 누진표 */}
            <p className="mt-8 mb-3 text-sm font-semibold text-slate-700">
              2년 이상 보유 시 적용되는 기본세율 (과세표준 기준 · 2026)
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">과세표준</th>
                    <th className="px-4 py-3 font-semibold">세율</th>
                    <th className="px-4 py-3 font-semibold">누진공제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BRACKETS.map((b) => (
                    <tr key={b.base}>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {b.base}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.rate}</td>
                      <td className="px-4 py-3 text-slate-500">{b.deduct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              산출세액 = 과세표준 × 세율 − 누진공제. 이 기본세율표는 종합소득세와 같아서{" "}
              <Link
                href={SRC_INCOMETAX}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                종합소득세 계산기
              </Link>
              로 세액 감을 잡아볼 수 있습니다(양도세 전용 계산은 홈택스 모의계산 권장).
            </p>

            {/* 계산 흐름 */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                세금이 정해지는 순서
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                <strong>양도차익</strong>(판 값 − 산 값 − 필요경비) →{" "}
                <strong>− 장기보유특별공제</strong> = 양도소득금액 →{" "}
                <strong>− 기본공제 250만원</strong>(연 1회) = 과세표준 →{" "}
                <strong>× 세율 − 누진공제</strong> = 산출세액. 취득세·중개수수료·법무사
                비용·샤시 등 자본적지출은 필요경비로 빠지니 영수증을 모아 두면 세금이
                줄어듭니다.
              </p>
            </div>
          </section>

          {/* 5. 한 장 체크리스트 */}
          <section>
            <SectionTitle kicker="팔기 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">주택 수</strong> — 내 세대가 정말
                  1주택인가(분양권·입주권·상속·공동명의까지 합산해 확인)
                </li>
                <li>
                  <strong className="text-slate-800">기간</strong> — 보유 2년 이상?
                  조정지역에서 취득했다면 거주 2년 이상까지 채웠는가
                </li>
                <li>
                  <strong className="text-slate-800">금액</strong> — 양도가액 12억 이하인가
                  (초과면 초과분만 과세 + 장기보유특별공제 활용)
                </li>
                <li>
                  <strong className="text-slate-800">갈아타기</strong> — 일시적 2주택이면
                  &lsquo;새 집 산 날부터 3년 내 종전주택 양도&rsquo; 기한 안인가
                </li>
                <li>
                  <strong className="text-slate-800">다주택</strong> — 조정지역 여부와 중과
                  해당 여부 확인(2026.5.10 이후 중과 부활)
                </li>
                <li>
                  <strong className="text-slate-800">영수증</strong> — 취득세·중개수수료·자본적
                  지출 등 필요경비 증빙 챙기기 / 같은 해 2건 이상 양도면 합산 확정신고
                </li>
              </ul>
            </div>
          </section>

          {/* 6. ⚠️ 시점 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 큰 거래 전 꼭 확인
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                양도세는 변수가 많아 &lsquo;내 사례&rsquo; 확인이 필수입니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                양도세는 주택 수·취득 시점·지역·보유/거주 기간·금액에 따라 결과가 크게
                달라집니다. 2026년 5월 9일자로 다주택 중과 유예가 종료됐고, 조정대상지역과
                세법은 수시로 바뀝니다. 상속·증여·재건축·임대주택 등록·다가구처럼 예외가
                많은 경우도 흔합니다. 이 글은 2026년 6월 기준 일반적인 1주택 사례를 정리한
                것이니, 금액이 큰 거래라면 반드시{" "}
                <a
                  href={SRC_HOMETAX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  국세청 홈택스 양도소득세 모의계산
                </a>
                으로 확인하고, 세무사와 상담하시길 권합니다.
              </p>
            </div>
          </section>

          {/* 7. FAQ — 네이티브 details/summary */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="집 팔 때 가장 많이 묻는 질문" />
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
                href={SRC_FINANCE}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  출산 가구 주택 대출 가이드 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  집을 &lsquo;살 때&rsquo; 쪽 — 신생아 특례 디딤돌·버팀목의 소득·한도·금리를 한 표로
                  비교한 에버그린 가이드.
                </p>
              </Link>
              <Link
                href={SRC_JEONSE}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  전세 vs 월세 vs 매매 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  살까 말까 단계 — 초기 목돈·매달 부담·리스크를 기준으로 내 상황에 맞는 선택을
                  고르는 법.
                </p>
              </Link>
            </div>
          </section>

          {/* 9. 발견 CTA — 제휴 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_HOMETAX}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">홈택스에서 양도세 모의계산 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                hometax.go.kr · 내 사례로 정확히 계산
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
              본 페이지의 요건·세율·공제는 2026년 6월 기준({UPDATED} 확인)으로 국세청 등 공식
              자료를 정리한 것입니다. 조정대상지역 지정과 세법은 수시로 바뀌고, 양도세는
              개별 사안(주택 수·취득 시점·지역·보유/거주 기간·상속·증여·임대 등록 등)에 따라
              결과가 크게 달라집니다. 신고·납부 전 국세청 홈택스 모의계산과 국토교통부
              조정대상지역 현황에서 최신 기준을 확인하고, 금액이 큰 거래는 세무 전문가와
              상담하시기 바랍니다. 본 내용은 정보 제공을 위한 것이며 세무 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국세청 양도소득세 개요·세율·장기보유특별공제 (
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
              <li>
                · 대한민국 정책브리핑 — &lsquo;다주택자 양도세 중과&rsquo; 유예 5월 9일 종료
                (2026.2.12, 관계부처합동)
              </li>
              <li>
                · 국토교통부 조정대상지역·투기과열지구 지정 현황 (
                <a
                  href={SRC_MOLIT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  molit.go.kr
                </a>
                )
              </li>
              <li>· 국세청 홈택스 양도소득세 모의계산 (hometax.go.kr)</li>
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
