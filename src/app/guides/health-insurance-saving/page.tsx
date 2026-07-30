import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 금융 가이드 — 건강보험료 줄이는 법(직장·지역·피부양자 큰그림)
 *
 * ▷ house-capital-gains-tax 토큰 그대로: HERO 3박스 / 핵심 비교표(3열) / DepthCard 2 /
 *   상황별 전략 표 / 체크리스트 / amber / FAQ 5 / 관련 2 / CTA 2 / 면책+출처 / JSON-LD.
 * ▷ 외부 컴포넌트는 Header/Footer만, SectionTitle·DepthCard는 인라인.
 *
 * [사실 검증 2026-07-13]
 * - 2026 건강보험료율 7.19%(직장 본인 3.595%), 장기요양 = 건보료 × 13.14% (복지부 보도자료).
 * - 지역가입자: 소득 정률 7.19%(전액 본인), 공적연금 50% 반영, 금융소득 연 1,000만 초과 시 전액 합산,
 *   재산 = 과표 − 기본공제 1억 → 점수제(2026 점수당 211.5원), 전월세 보증금 30% 평가,
 *   자동차 부과 폐지(2024.2), 최저보험료 존재, 소득 조정분은 다음 해 11월 정산.
 * - 피부양자: 연소득 2,000만 이하 + 사업소득 0(미등록 500만 이하) + 재산 과표 5.4억 이하
 *   (5.4~9억은 소득 1,000만 이하), 형제자매는 65세↑/30세↓/장애 + 재산 1.8억 이하,
 *   부부 중 1인 소득요건 초과 시 부부 모두 탈락.
 * - 임의계속가입: 퇴직 전 18개월 중 직장가입 1년 이상 → 지역 첫 고지서 납부기한부터 2개월 내 신청,
 *   최대 36개월, 퇴직 전 보수 기준 본인부담분 수준.
 * 출처: 보건복지부 2026 보험료율 보도자료, 국민건강보험공단(nhis.go.kr) 부과체계·피부양자 기준,
 *   법제처 생활법령 지역가입자 보험료.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/health-insurance-saving/";
const UPDATED = "2026-07-13"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_REGIONAL = "/blog/2026-07-13-regional-health-insurance-premium/"; // 지역 산정(짝)
const SRC_DEPENDENT = "/blog/2026-07-13-health-insurance-dependent/"; // 피부양자(짝)
const SRC_RETIRE = "/blog/2026-05-08-retirement-health-insurance-benefits-guide/"; // 은퇴 건보료
const SRC_PENSION = "/guides/three-pillar-pension/"; // 연금 설계
const SRC_INSCALC = "/tools/insurance/"; // 4대보험 계산기
const SRC_MONEY = "/money/";

// 공식 출처 (staleness 완화 — 최신값 확인 링크)
const SRC_NHIS = "https://www.nhis.or.kr"; // 국민건강보험공단
const SRC_MOHW = "https://www.mohw.go.kr"; // 보건복지부

const OG_TITLE = "건강보험료 줄이는 법 — 직장·지역·피부양자 절감 (2026)";
const OG_DESC =
  "2026 건보료율 7.19% — 지역가입자 산정 구조와 피부양자 기준(소득 2,000만·재산 5.4억), 임의계속가입 등 절감 루트를 정리했습니다.";

export const metadata: Metadata = {
  title: "건강보험료 줄이는 법 — 직장·지역·피부양자 절감 (2026) | 팁픽",
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

// ★ 핵심 비교표 — 직장 vs 지역 vs 피부양자
const COMPARE = [
  {
    axis: "보험료",
    work: "보수 × 7.19% (본인 3.595% + 회사 절반)",
    regional: "소득 × 7.19% 전액 본인 + 재산 점수제",
    dep: "0원",
    accent: true,
  },
  {
    axis: "재산 반영",
    work: "없음",
    regional: "과표 − 1억 공제 후 점수제 (전월세 보증금 30%)",
    dep: "자격 요건으로만 반영 (5.4억/9억)",
  },
  {
    axis: "연금소득",
    work: "보수 외 소득 2,000만 초과분에 추가 보험료",
    regional: "수령액의 50%만 반영",
    dep: "전액 소득 합산 — 연 2,000만 넘으면 탈락",
    accent: true,
  },
  {
    axis: "금융소득",
    work: "보수 외 소득으로 합산 판단",
    regional: "연 1,000만 초과 시 전액 반영",
    dep: "연 1,000만 초과 시 전액 합산",
  },
  {
    axis: "누가 해당",
    work: "근로자·임의계속가입자",
    regional: "자영업·프리랜서·은퇴자 등",
    dep: "직장가입자의 가족 중 요건 충족자",
  },
];

// 지역가입자 산정 구조 (DepthCard)
const REGIONAL_ROWS = [
  {
    k: "① 소득 7.19% 정률",
    v: "연소득 ÷ 12에 7.19%를 곱합니다. 직장과 같은 요율이지만 회사 부담이 없어 체감이 두 배입니다. 사업·근로·기타소득은 전액, 공적연금은 50%만 반영됩니다.",
    accent: true,
  },
  {
    k: "② 금융소득 1,000만 선",
    v: "이자·배당이 연 1,000만 원 이하면 보험료에 반영되지 않고, 초과하는 순간 전액 반영됩니다. 예금·배당 포트폴리오가 크다면 이 경계선 관리가 보험료를 가릅니다.",
  },
  {
    k: "③ 재산 점수제",
    v: "재산세 과세표준 합계에서 기본공제 1억 원을 뺀 뒤 60등급 점수표로 환산해 점수당 211.5원(2026)을 곱합니다. 무주택 전월세는 보증금의 30%만 평가하고, 자동차 부과는 폐지됐습니다(2024.2).",
  },
  {
    k: "④ 장기요양 13.14%",
    v: "산출된 건강보험료에 13.14%(2026년)가 장기요양보험료로 함께 부과됩니다. 고지서 총액이 건보료보다 큰 이유입니다.",
  },
  {
    k: "⑤ 11월 정산",
    v: "5월 종합소득세 신고 소득이 그해 11월부터 반영되고, 조정신청으로 깎았던 보험료도 다음 해 11월에 확정 소득으로 정산됩니다. 소득이 늘었다면 11월 인상을 미리 각오하세요.",
    accent: true,
  },
];

// 줄이는 루트 (DepthCard)
const SAVING_ROWS = [
  {
    k: "① 임의계속가입",
    v: "퇴직 전 18개월 중 직장가입 1년 이상이면, 지역가입자로 받은 첫 고지서의 납부기한부터 2개월 안에 신청해 최대 3년간 퇴직 전 보수 기준 본인부담분 수준으로 낼 수 있습니다. 퇴사 직후 보험료 폭탄의 공식 해법입니다.",
    accent: true,
  },
  {
    k: "② 피부양자 설계",
    v: "가족 중 직장가입자가 있다면 소득 2,000만·재산 5.4억·사업소득 0원 요건을 맞춰 피부양자로 등재하는 것이 가장 강력합니다. 연금 개시 시점과 금융소득 1,000만 경계를 미리 계산하세요.",
    accent: true,
  },
  {
    k: "③ 조정신청",
    v: "폐업·해촉·소득 감소가 있으면 증빙(폐업사실증명·해촉증명서 등)을 공단에 제출해 현재 소득 기준으로 조정받을 수 있습니다. 단, 다음 해 11월 정산으로 추징될 수 있으니 소득 변동을 계속 신고하세요.",
  },
  {
    k: "④ 재취업·직장 가입",
    v: "직장가입자가 되면 재산 보험료가 사라지고 회사가 절반을 부담합니다. 은퇴 후 소일거리라도 고용보험 적용 일자리로 일하면 보험료 구조가 유리해지는 경우가 많습니다.",
  },
  {
    k: "⑤ 재산·금융 구조 점검",
    v: "재산 과표(공시가격)·전월세 보증금·금융소득은 모두 경계선형 기준입니다. 큰 변화(주택 처분·증여, 예금 만기) 전에 보험료 영향을 공단 모의계산으로 먼저 확인하는 습관이 절약의 시작입니다.",
  },
];

// 상황별 전략 표
const SCENARIOS = [
  { who: "퇴사 직후 직장인", what: "임의계속가입 (2개월 내 신청)", memo: "최대 3년 직장 수준 유지 · 이후 피부양자/지역 비교", accent: true },
  { who: "은퇴 앞둔 부부", what: "피부양자 요건 사전 설계", memo: "연금 연 2,000만·금융 1,000만 경계 계산", accent: true },
  { who: "프리랜서·자영업", what: "조정신청 + 11월 정산 대비", memo: "해촉·폐업 증빙 제출, 소득 급감 시 즉시 신청" },
  { who: "금융소득 많은 은퇴자", what: "이자·배당 1,000만 경계 관리", memo: "ISA·비과세 상품 활용 시 합산 대상에서 제외" },
  { who: "무주택 전월세", what: "보증금 30% 평가 확인", memo: "기본공제 1억 → 보증금 약 3.3억까지 부담 미미" },
];

const FAQS = [
  {
    q: "퇴사하면 건강보험은 자동으로 지역가입자가 되나요?",
    a: "네, 별도 신청 없이 지역가입자로 전환되고 소득·재산 기준 보험료가 고지됩니다. 다만 첫 고지서 납부기한부터 2개월 안에 임의계속가입을 신청하면 최대 3년간 퇴직 전 보수 기준 본인부담분 수준으로 낼 수 있고, 가족 직장보험의 피부양자 요건이 되면 보험료가 0원입니다. 세 가지(지역·임의계속·피부양자)를 비교해 가장 싼 길을 고르세요.",
  },
  {
    q: "국민연금을 받기 시작하면 건보료가 오르나요?",
    a: "피부양자라면 연금을 포함한 연소득이 2,000만 원을 넘는 순간 탈락해 지역가입자가 됩니다. 지역가입자는 연금 수령액의 50%가 소득으로 반영돼 보험료가 늘어납니다. 연금 개시 연령을 조정하거나 수령 방식을 설계할 때 건보료 영향까지 함께 계산하는 것이 좋습니다.",
  },
  {
    q: "예금 이자가 늘어서 걱정입니다. 기준이 있나요?",
    a: "이자·배당 합계가 연 1,000만 원 이하면 지역 보험료에 반영되지 않고 피부양자 판정에도 합산되지 않습니다. 1,000만 원을 넘으면 전액이 반영되는 문턱 구조라, 경계선 부근이라면 만기 분산이나 ISA 같은 분리·비과세 계좌를 검토할 가치가 있습니다.",
  },
  {
    q: "조정신청으로 보험료를 깎았는데 나중에 더 내라고 할 수 있나요?",
    a: "있습니다. 조정된 보험료는 다음 해 11월 국세청 확정 소득으로 정산되어, 실제 소득이 조정 신고보다 많았다면 차액이 추징됩니다. 반대로 더 냈다면 환급됩니다. 조정은 '면제'가 아니라 '선반영'이라고 이해하는 것이 안전합니다.",
  },
  {
    q: "부부가 각각 얼마씩 재산이 있으면 피부양자 판정은 어떻게 되나요?",
    a: "재산 요건은 각자 따로 판정합니다(각자 과표 5.4억/9억 기준). 반면 소득 요건은 부부 중 한 명이라도 초과하면 두 사람 모두 피부양자가 될 수 없습니다. 사업소득이 있는 배우자가 있다면 특히 주의하세요.",
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

export default function HealthInsuranceSavingGuide() {
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
        name: "건강보험료 줄이는 법 가이드",
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
              2026년 기준 · 보험료율 7.19%
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              평생 따라오는 건강보험료,
              <br className="hidden sm:block" /> 합법적으로 줄이는 법 — 한눈에 정리 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              건강보험료는 세금만큼 크지만 절세처럼 설계하는 사람은 드뭅니다. 핵심은 내 자격이{" "}
              <strong>직장·지역·피부양자 중 어디냐</strong>입니다 — 같은 소득이라도 자격에 따라
              보험료가 0원에서 수십만 원까지 갈립니다. 이 가이드는 세 자격의 구조를 비교하고,
              임의계속가입·피부양자 설계·조정신청 같은 <strong>공식 절감 루트</strong>를 상황별로
              정리했습니다. (지역 산정 구조의 상세는{" "}
              <Link
                href={SRC_REGIONAL}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                지역가입자 건강보험료
              </Link>
              , 피부양자 기준은{" "}
              <Link
                href={SRC_DEPENDENT}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                피부양자 자격 조건
              </Link>{" "}
              참고)
            </p>

            {/* 핵심 요약 박스 (인라인 · 값은 본문에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "직장가입자",
                  v: "본인 3.595%",
                  d: "회사가 절반 부담 · 재산 무관",
                },
                {
                  k: "지역가입자",
                  v: "소득 7.19% + 재산",
                  d: "전액 본인 · 연금 50% 반영",
                },
                {
                  k: "피부양자",
                  v: "0원",
                  d: "소득 2,000만·재산 5.4억 관리가 핵심",
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
          {/* 1. ★ 핵심 비교표 — 직장 vs 지역 vs 피부양자 */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="직장 vs 지역 vs 피부양자 — 무엇이 다른가"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">직장가입자</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">지역가입자</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">피부양자</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARE.map((r) => (
                    <tr key={r.axis} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.axis}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.work}</td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.regional}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.dep}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. 지역 산정 구조 깊이 */}
          <section>
            <SectionTitle
              kicker="고지서가 정해지는 원리"
              title="지역가입자 보험료 — 다섯 개의 톱니바퀴"
            />
            <DepthCard
              tone="indigo"
              badge="산정 구조"
              title="소득 7.19% + 재산 점수제 (+장기요양 13.14%)"
              sub="국민건강보험공단 부과체계 기준"
              rows={REGIONAL_ROWS}
            />
          </section>

          {/* 3. 절감 루트 깊이 */}
          <section>
            <SectionTitle
              kicker="전부 합법적인 공식 제도"
              title="줄이는 다섯 가지 루트"
            />
            <DepthCard
              tone="slate"
              badge="절감 루트"
              title="임의계속·피부양자·조정신청·재취업·구조 점검"
              sub="상황에 맞는 것 하나만 잡아도 연 수십만 원"
              rows={SAVING_ROWS}
            />
          </section>

          {/* 4. 상황별 전략 표 */}
          <section>
            <SectionTitle kicker="내 상황은?" title="상황별 첫수 — 무엇부터 할까" />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">상황</th>
                    <th className="px-4 py-3 font-semibold">첫수</th>
                    <th className="px-4 py-3 font-semibold">메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SCENARIOS.map((r) => (
                    <tr key={r.who} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.who}
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

          {/* 4.5 자체 계산 예시 — 은퇴자 지역보험료 */}
          <section>
            <SectionTitle
              kicker="숫자로 따라가 보기"
              title="연금 1,800만·재산 3억 은퇴자 — 월 보험료 예시"
            />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <p className="text-sm leading-relaxed text-slate-700">
                국민연금 연 <strong>1,800만 원</strong>, 재산세 과세표준{" "}
                <strong>3억 원</strong>(그 외 소득·재산 없음)인 은퇴자가
                지역가입자일 때, 위 산정 구조를 그대로 대입해 봅니다. 재산 등급별
                점수는 공단 60등급표로 확인해야 하므로 여기서는{" "}
                <strong>700점으로 가정</strong>했습니다.
              </p>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
                <li>
                  ① <strong>소득분</strong> — 연금 1,800만 × 50% 반영 = 900만 → 월
                  75만 × 7.19% = <strong>약 53,925원</strong>
                </li>
                <li>
                  ② <strong>재산분</strong> — 과표 3억 − 기본공제 1억 = 2억 → 점수
                  환산(700점 가정) × 211.5원 = <strong>약 148,050원</strong>
                </li>
                <li>
                  ③ <strong>합계</strong> — 건강보험료 약 201,975원 + 장기요양
                  13.14%(약 26,540원) = <strong>월 약 228,500원</strong>
                </li>
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                포인트는 이 사례가 <strong>소득 2,000만 이하·재산 과표 5.4억
                이하</strong>라는 점입니다. 가족 중 직장가입자가 있어 피부양자로
                등재되면 같은 조건에서 보험료가 <strong>0원</strong>이 되므로, 등재
                가능 여부 확인이 월 20만 원대 지출을 가르는 첫수입니다. 실제
                점수·보험료는{" "}
                <a
                  href={SRC_NHIS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  공단 모의계산
                </a>
                으로 검산하세요.
              </p>
            </div>
          </section>

          {/* 5. 한 장 체크리스트 */}
          <section>
            <SectionTitle kicker="변화가 생기기 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">퇴사 예정</strong> — 지역 첫 고지서
                  납부기한부터 2개월, 임의계속가입 신청 데드라인 달력에 표시
                </li>
                <li>
                  <strong className="text-slate-800">연금 개시 전</strong> — 연금 포함 연소득이
                  2,000만을 넘는지 계산(피부양자 탈락 경계)
                </li>
                <li>
                  <strong className="text-slate-800">금융소득</strong> — 이자·배당 연 1,000만
                  경계 확인, 초과 예상이면 만기 분산·ISA 검토
                </li>
                <li>
                  <strong className="text-slate-800">사업자등록 전</strong> — 등록하면 소득
                  1원에도 피부양자 탈락, 부부 모두 영향임을 확인
                </li>
                <li>
                  <strong className="text-slate-800">소득 급감</strong> — 해촉·폐업 증빙으로
                  조정신청, 다음 해 11월 정산 대비 소득 변동 신고
                </li>
                <li>
                  <strong className="text-slate-800">연 1회</strong> — 공단 홈페이지에서 내
                  자격·보험료 산정 내역 확인(11월 갱신 반영 직후 권장)
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
                요율·기준은 해마다 오르고, 11월 정산이 따라옵니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                2026년 보험료율은 7.19%(장기요양 13.14%)로 전년보다 올랐고, 피부양자 소득·재산
                기준과 점수당 단가도 법령·고시로 매년 조정됩니다. 지역가입자 보험료는 11월에 새
                소득·재산이 반영되어 갑자기 오를 수 있고, 조정신청분은 다음 해 11월 정산으로
                추징·환급됩니다. 큰 결정(퇴사·연금 개시·주택 처분) 전에는 반드시{" "}
                <a
                  href={SRC_NHIS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  국민건강보험공단 모의계산
                </a>
                으로 내 사례를 확인하세요.
              </p>
            </div>
          </section>

          {/* 7. FAQ — 네이티브 details/summary */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="건보료에서 가장 많이 묻는 질문" />
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
                href={SRC_PENSION}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  노후 3층 연금 가이드 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  연금 수령 설계와 건보료는 한 몸 — 국민·퇴직·개인연금을 한 표로 정리한
                  에버그린 가이드.
                </p>
              </Link>
              <Link
                href={SRC_RETIRE}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  은퇴 후 건강보험료 줄이는 법 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  은퇴 시기에 특화된 실전 순서 — 임의계속가입과 피부양자 등재를 단계별로 짚은
                  글.
                </p>
              </Link>
            </div>
          </section>

          {/* 9. 발견 CTA — 제휴 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_NHIS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">공단에서 보험료 모의계산 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                nhis.or.kr · 내 소득·재산으로 바로 확인
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                세금·연금·보험 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 요율·기준은 2026년 기준({UPDATED} 확인)으로 보건복지부·국민건강보험공단
              공식 자료를 정리한 것입니다. 보험료율·피부양자 기준·점수당 단가는 매년 바뀌고,
              보험료는 세대별 소득·재산·자격 이력에 따라 크게 달라집니다. 자격 변동이나 큰 결정
              전에는 국민건강보험공단(☎1577-1000) 상담과 모의계산으로 확인하시기 바랍니다. 본
              내용은 정보 제공을 위한 것이며 개별 상담을 대신하지 않습니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 보건복지부 — 2026년 건강보험료율 7.19%·장기요양보험료율 결정 보도자료 (
                <a
                  href={SRC_MOHW}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  mohw.go.kr
                </a>
                )
              </li>
              <li>
                · 국민건강보험공단 — 지역가입자 부과체계·피부양자 인정 기준 (
                <a
                  href={SRC_NHIS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  nhis.or.kr
                </a>
                )
              </li>
              <li>· 법제처 찾기쉬운 생활법령정보 — 지역가입자 보험료 산정</li>
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
