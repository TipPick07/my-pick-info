import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 노후·연금 가이드 — 3층 연금(국민연금·퇴직연금·개인연금) 한눈에
 *
 * ▷ 흩어진 노후 글(퇴직금 일시금vs연금·ISA/연금저축/IRP·기초연금)을 묶는 첫 '노후·연금' 허브 가이드.
 * ▷ 독립 정적 라우트. src/content/posts/*.md(블로그)도 public/data/pick-info.json(크롤링)도 건드리지 않음.
 * ▷ 본문은 JSX로 직접 배치(표 깨짐 방지). 외부 커스텀 컴포넌트는 Header/Footer만. SectionTitle·DepthCard는 인라인
 *   (house-capital-gains-tax / daycare-admission과 동일 토큰·시그니처).
 * ▷ 제휴 링크 없음 — 순수 정보 가이드. 데이터층 무접촉.
 *
 * [사실 검증 2026-06-30]
 * - 1층 국민연금: 최소 10년(120개월) 납부 → 노령연금 평생. 수급개시 출생연도별 61~65세(1969년생~ 65세).
 *   임의가입(소득無 18~59세)·임의계속가입(60세 이후 65세까지)·추후납부(추납)로 가입기간·연금액↑.
 *   연기연금 최대 5년(연 7.2%·최대 36%↑) / 조기연금 최대 5년(연 6%·최대 30%↓ 평생).
 * - 2층 퇴직연금: DB(회사 운용·확정)·DC(근로자 운용)·IRP(개인형). 일시금 대신 연금수령 시 퇴직소득세 30~40%
 *   (오래 나눠 받을수록↑, 2026.1.1~ 20년 초과분 50%) 감면. DC·IRP는 디폴트옵션(사전지정운용제도).
 * - 3층 개인연금: 연금저축(600만) + IRP 합산 900만 세액공제. 16.5%(총급여 5,500만/종합소득 4,500만 이하)
 *   ~13.2%(초과) → 900만 납입 시 최대 약 148.5만/118.8만 환급. 연금수령 시 연금소득세 3.3~5.5%(연령↑일수록↓).
 *   사적연금(연금저축+IRP 등) 합계 연 1,500만원 이하면 저율 분리과세 종결, 초과 시 종합과세 또는 16.5% 분리과세 선택.
 *   수령 요건: 만 55세 이상 + 가입 5년 이상 + 연금 형태 10년 이상 분할 수령.
 * 출처: 국민연금공단(nps.or.kr) 노령연금·임의가입·연기연금, 국세청(nts.go.kr) 연금계좌 세액공제·연금소득 과세,
 *   금융감독원 통합연금포털 '내 연금 한눈에'(100lifeplan.fss.or.kr).
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/three-pillar-pension/";
const UPDATED = "2026-06-30"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_RETIRE = "/blog/2026-06-29-retirement-pay-lump-vs-pension/"; // 퇴직금 일시금 vs 연금(2층 짝)
const SRC_ISA = "/blog/2026-06-25-isa-irp-pension-savings-comparison/"; // ISA·연금저축·IRP(3층 짝)
const SRC_BASIC = "/blog/2026-06-28-basic-pension-guide/"; // 기초연금(노후의 바닥 보강)
const SRC_MONEY = "/money/";

// 공식 출처 (staleness 완화 — 최신값 확인 링크)
const SRC_FSS = "https://100lifeplan.fss.or.kr"; // 금감원 통합연금포털 '내 연금 한눈에'
const SRC_NPS = "https://www.nps.or.kr"; // 국민연금공단 내 연금 알아보기
const SRC_NTS = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875"; // 국세청 연금계좌 세액공제

const OG_TITLE =
  "노후 3층 연금 — 국민·퇴직·개인연금 한눈에 (2026)";
const OG_DESC =
  "국민연금·퇴직연금·개인연금 3층을 한 표로 — 수급연령, 연금수령 세금 감면, 세액공제 900만원과 월급 400만 시뮬레이션까지 2026년 기준 정리.";

export const metadata: Metadata = {
  title: "노후 3층 연금 — 국민·퇴직·개인연금 한눈에 (2026) | 팁픽",
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

// ★ 핵심 비교표 — 1층/2층/3층
const COMPARE = [
  {
    axis: "운영 주체",
    one: "국가 (국민연금공단)",
    two: "회사 + 근로자",
    three: "나 자신",
  },
  {
    axis: "가입",
    one: "의무 (소득 있으면)",
    two: "직장인 대부분 자동",
    three: "자율 선택",
  },
  {
    axis: "핵심 혜택",
    one: "평생 지급·물가 반영",
    two: "퇴직급여 적립·운용",
    three: "납입액 세액공제",
    accent: true,
  },
  {
    axis: "받을 때 세금",
    one: "연금소득세 (낮은 편)",
    two: "퇴직소득세 30~50% 감면",
    three: "연금소득세 3.3~5.5%",
    accent: true,
  },
  {
    axis: "한 줄 요약",
    one: "노후의 바닥",
    two: "직장이 쌓아 주는 층",
    three: "내가 더 올리는 층",
  },
];

// 1층 국민연금 (DepthCard · v=본문 그대로, k=구조 라벨)
const PILLAR1 = [
  {
    k: "① 최소 10년",
    v: "가입기간이 10년(120개월) 이상이어야 평생 받는 노령연금이 나옵니다. 못 채우면 그동안 낸 보험료를 일시금(반환일시금)으로 돌려받는 데 그칩니다.",
  },
  {
    k: "② 받는 나이",
    v: "출생연도에 따라 만 61~65세에 시작합니다(아래 표). 1969년생부터는 만 65세예요.",
    accent: true,
  },
  {
    k: "③ 더 받는 법",
    v: "소득이 없어도 임의가입, 60세 이후에도 임의계속가입(65세까지), 못 낸 기간은 추후납부(추납)로 채워 가입기간과 연금액을 늘릴 수 있습니다.",
  },
  {
    k: "④ 연기는 +, 조기는 −",
    v: "받는 시기를 최대 5년 미루면 연 7.2%씩(최대 36%) 늘고, 최대 5년 앞당겨 받으면(조기연금) 연 6%씩(최대 30%) 평생 깎입니다. 당장 급하지 않다면 앞당기기는 신중히.",
    accent: true,
  },
  {
    k: "내 연금 확인",
    v: "국민연금공단 '내 연금 알아보기'에서 가입기간과 예상 수령액을 무료로 조회할 수 있습니다. 국민연금이 적다면 만 65세부터 받는 기초연금으로도 보탤 수 있어요.",
  },
];

// 2층 퇴직연금 (DepthCard)
const PILLAR2 = [
  {
    k: "DB (확정급여형)",
    v: "회사가 적립금을 운용하고, 받을 금액은 '퇴직 전 평균임금 × 근속연수'로 정해집니다. 운용 성과와 무관하게 정해진 금액을 받아요.",
  },
  {
    k: "DC (확정기여형)",
    v: "회사가 매년 일정액을 넣어 주고, 그 돈을 근로자가 직접 운용합니다. 잘 굴리면 더, 방치하면 덜 받습니다.",
    accent: true,
  },
  {
    k: "IRP (개인형)",
    v: "퇴직할 때 받은 퇴직급여를 모아 두는 계좌이자, 개인 돈을 더 넣어 굴릴 수도 있는 계좌입니다. 3층(개인연금)과도 연결돼요.",
  },
  {
    k: "연금으로 받으면 세금↓",
    v: "퇴직금을 일시금 대신 IRP에서 연금으로 나눠 받으면 퇴직소득세를 30~40%가량(오래 나눠 받을수록 더, 2026년부터 20년 초과분은 50%) 깎아 줍니다.",
    accent: true,
  },
  {
    k: "방치하지 말 것",
    v: "DC·IRP는 내가 운용 지시를 하지 않으면 디폴트옵션(사전지정운용제도)으로 굴러갑니다. 어떤 상품에 들어가 있는지 한 번은 확인하세요.",
  },
];

// 3층 개인연금 (DepthCard)
const PILLAR3 = [
  {
    k: "무엇인가",
    v: "국가·회사와 별개로 내가 더 쌓는 3층입니다. 연금저축(펀드·보험)과 IRP(개인 추가납입)가 대표 상품이에요.",
  },
  {
    k: "세액공제 (핵심)",
    v: "연금저축은 연 600만원, IRP를 더하면 합산 900만원까지 납입액을 세액공제받습니다. 직장인이 챙길 수 있는 가장 큰 절세 카드 중 하나예요.",
    accent: true,
  },
  {
    k: "공제율",
    v: "총급여 5,500만원(종합소득 4,500만원) 이하는 16.5%, 초과는 13.2%. 900만원을 채우면 한 해 약 119만~149만원을 환급받습니다.",
    accent: true,
  },
  {
    k: "받을 때 세금",
    v: "만 55세 이후 연금으로 받으면 연금소득세 3.3~5.5%(나이가 많을수록 낮음)로 가볍게 끝납니다. 사적연금 합계가 연 1,500만원을 넘으면 종합과세 또는 16.5% 분리과세 중 선택해요.",
  },
  {
    k: "수령 요건",
    v: "만 55세 이상 + 가입 5년 이상 + 연금 형태로 10년 이상 나눠 받아야 저율 과세 혜택을 받습니다. 중간에 깨면 혜택을 토해낼 수 있어요(아래 주의).",
  },
];

// 국민연금 수급개시연령 (출생연도별)
const AGE_ROWS = [
  { born: "1953 ~ 1956년생", age: "61세" },
  { born: "1957 ~ 1960년생", age: "62세" },
  { born: "1961 ~ 1964년생", age: "63세" },
  { born: "1965 ~ 1968년생", age: "64세" },
  { born: "1969년생 이후", age: "65세", accent: true },
];

// 3층 세액공제 (소득 구간별)
const DEDUCT_ROWS = [
  {
    base: "총급여 5,500만원 이하 (종합소득 4,500만원 이하)",
    rate: "16.5%",
    refund: "약 148.5만원",
    accent: true,
  },
  {
    base: "위 기준 초과",
    rate: "13.2%",
    refund: "약 118.8만원",
  },
];

const FAQS = [
  {
    q: "3층 연금, 꼭 다 갖춰야 하나요?",
    a: "1층 국민연금은 소득이 있으면 의무이고, 2층 퇴직연금은 직장인 대부분 회사가 자동으로 쌓아 줍니다. 선택은 3층(개인연금)인데, 납입액의 13.2~16.5%를 세액공제로 돌려받기 때문에 직장인에게는 사실상 필수에 가깝습니다.",
  },
  {
    q: "국민연금만으로 노후가 되나요?",
    a: "국민연금은 '노후의 바닥'을 깔아 주는 역할이라, 그것만으로 생활비 전체를 충당하기는 어려운 경우가 많습니다. 그래서 2층(퇴직연금)과 3층(개인연금)으로 위층을 쌓아 부족분을 메우는 구조로 설계합니다.",
  },
  {
    q: "연금저축과 IRP, 무엇부터 채울까요?",
    a: "세액공제 한도 안에서 채우는 게 핵심입니다. 흔히 연금저축으로 600만원을 채우고, IRP로 300만원을 더해 합산 900만원을 맞춥니다. IRP는 위험자산 투자 한도(적립금의 70%) 같은 제약이 있어 상품 구성이 조금 다릅니다.",
  },
  {
    q: "급한 일이 생겨 중간에 깨면요?",
    a: "세액공제를 받은 납입원금과 운용수익을 연금이 아닌 형태로 찾으면 기타소득세 16.5%가 붙습니다. 그동안 받은 세금 혜택을 사실상 되돌려주는 셈이라, 3층 개인연금은 '오래 묻어 둘 돈'으로만 넣는 게 안전합니다.",
  },
  {
    q: "국민연금 조기수령은 손해인가요?",
    a: "최대 5년 앞당겨 받을 수 있지만 평생 최대 30%가 깎입니다. 당장 소득이 급하지 않다면 불리할 수 있어요. 반대로 형편이 되면 최대 5년 미뤄(연기연금) 최대 36%를 더 받을 수도 있습니다. 내 건강·소득 상황에 따라 결정하세요.",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트(파일 내부 · 다른 가이드와 동일)  ───────────────────────── */

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

export default function ThreePillarPensionGuide() {
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
        name: "노후 3층 연금 가이드",
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
              2026년 기준 · 3층 연금 설계
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              노후 준비의 기본, 3층 연금
              <br className="hidden sm:block" /> — 국민·퇴직·개인연금 한눈에 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              노후 준비는 복잡해 보이지만 뼈대는 &lsquo;3층 집&rsquo;으로 정리됩니다. 바닥을 까는{" "}
              <strong>1층 국민연금</strong>, 직장이 쌓아 주는 <strong>2층 퇴직연금</strong>, 내가 더 올리는{" "}
              <strong>3층 개인연금</strong>이에요. 1층만으로는 생활비가 부족하기 쉬워서, 2층과 3층으로
              위를 채우는 게 핵심입니다. 이 글은 세 층을 한 표로 비교하고, 각 층에서 &lsquo;더 받는 법&rsquo;과
              세금 혜택을 짚어 드립니다. (퇴직금을 일시금으로 받을지 연금으로 받을지는{" "}
              <Link
                href={SRC_RETIRE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                퇴직금 일시금 vs 연금
              </Link>
              , 3층 절세계좌 고르기는{" "}
              <Link
                href={SRC_ISA}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                ISA·연금저축·IRP 비교
              </Link>{" "}
              참고)
            </p>

            {/* 핵심 요약 박스 (인라인 · 값은 본문에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "1층 국민연금",
                  v: "평생 받는 기본",
                  d: "10년 이상 납부 → 만 61~65세",
                },
                {
                  k: "2층 퇴직연금",
                  v: "DB · DC · IRP",
                  d: "연금수령 시 세금 30~50%↓",
                },
                {
                  k: "3층 개인연금",
                  v: "세액공제 900만원",
                  d: "최대 16.5% 환급",
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
          {/* 1. ★ 핵심 비교표 — 3층 (글의 중심) */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="1층 · 2층 · 3층 — 무엇이 다른가"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      1층 국민연금
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      2층 퇴직연금
                    </th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      3층 개인연금
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
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.one}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.two}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.three}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. 1층 국민연금 */}
          <section>
            <SectionTitle
              kicker="노후의 바닥"
              title="1층 국민연금 — 10년 채우고, 더 받는 법"
            />
            <DepthCard
              tone="indigo"
              badge="1층"
              title="평생 지급 · 물가에 따라 오르는 공적연금"
              sub="국민연금공단 기준"
              rows={PILLAR1}
            />

            {/* 수급개시연령 표 */}
            <p className="mt-8 mb-3 text-sm font-semibold text-slate-700">
              노령연금 받기 시작하는 나이 (출생연도별 · 2026)
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[360px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">출생연도</th>
                    <th className="px-4 py-3 font-semibold">수급 개시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {AGE_ROWS.map((r) => (
                    <tr key={r.born}>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.born}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.age}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. 2층 퇴직연금 */}
          <section>
            <SectionTitle
              kicker="직장이 쌓아 주는 층"
              title="2층 퇴직연금 — DB·DC·IRP와 연금수령"
            />
            <DepthCard
              tone="slate"
              badge="2층"
              title="DB(확정급여) · DC(확정기여) · IRP(개인형)"
              sub="퇴직급여를 노후 연금으로"
              rows={PILLAR2}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              퇴직금을 일시금으로 받을지 연금으로 받을지 더 깊이 보려면{" "}
              <Link
                href={SRC_RETIRE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                퇴직금 일시금 vs 연금
              </Link>
              을 참고하세요.
            </p>
          </section>

          {/* 4. 3층 개인연금 + 세액공제 표 */}
          <section>
            <SectionTitle
              kicker="내가 더 올리는 층"
              title="3층 개인연금 — 세액공제 900만원"
            />
            <DepthCard
              tone="indigo"
              badge="3층"
              title="연금저축 + IRP = 합산 900만원 세액공제"
              sub="직장인의 가장 큰 절세 카드"
              rows={PILLAR3}
            />

            {/* 세액공제 표 */}
            <p className="mt-8 mb-3 text-sm font-semibold text-slate-700">
              연금저축·IRP 세액공제 (합산 900만원 한도 · 2026)
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">소득 구간</th>
                    <th className="px-4 py-3 font-semibold">공제율</th>
                    <th className="px-4 py-3 font-semibold">900만원 납입 시 환급</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DEDUCT_ROWS.map((r) => (
                    <tr key={r.base} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.base}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.rate}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.refund}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              연금저축 단독 한도는 600만원, IRP를 합치면 900만원입니다(지방소득세 포함 세율 기준). 어떤 절세계좌를
              고를지는{" "}
              <Link
                href={SRC_ISA}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                ISA·연금저축·IRP 비교
              </Link>
              에서 이어집니다.
            </p>
          </section>

          {/* 4.5 계산 예시 — 월급 400만 직장인의 3층 합산 시뮬레이션 */}
          <section>
            <SectionTitle
              kicker="직접 계산해 보면"
              title="월급 400만 직장인, 3층을 합치면 월 얼마일까"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-800">
                만 30세, 세전 월급 400만원(총급여 4,800만원)이 60세까지 30년간
                유지되고, 임금 상승·물가·운용수익은 0%로 단순화하며, 연금은
                65세부터 20년(240개월)간 나눠 받는다고 가정
              </strong>
              한 시뮬레이션입니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">층</th>
                    <th className="px-4 py-3 font-semibold">계산 (가정 포함)</th>
                    <th className="px-4 py-3 font-semibold">예상 월연금</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      1층 국민연금
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      30년 가입 기준 월 90만원으로 가정 — 실제 값은 소득
                      이력에 따라 다르니 공단 &lsquo;내 연금 알아보기&rsquo;에서
                      확인
                    </td>
                    <td className="px-4 py-3 font-medium text-indigo-700">
                      약 90만원 (가정)
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      2층 퇴직연금
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      DB 가정: 평균임금 400만원 × 근속 30년 = 1억 2,000만원 →
                      240개월 분할
                    </td>
                    <td className="px-4 py-3 font-medium text-indigo-700">
                      월 50만원
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      3층 개인연금
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      연금저축에 연 600만원(월 50만원)씩 30~54세 25년 납입 =
                      1억 5,000만원 → 240개월 분할
                    </td>
                    <td className="px-4 py-3 font-medium text-indigo-700">
                      월 62.5만원
                    </td>
                  </tr>
                  <tr className="bg-indigo-50/40 align-top">
                    <td className="px-4 py-3 font-bold text-indigo-700">합산</td>
                    <td className="px-4 py-3 text-slate-600">
                      90만 + 50만 + 62.5만
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-700">
                      월 약 202.5만원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 세전·명목 기준 자체 계산 예시입니다. 총급여 5,500만원 이하
              구간이라 3층 납입분 600만원에는 매년 16.5%인 99만원의 세액공제
              환급이 별도로 붙고, 수령 시에는 연금소득세(3.3~5.5%)가
              차감됩니다. 내 실제 예상액은 통합연금포털 &lsquo;내 연금
              한눈에&rsquo;에서 확인하세요.
            </p>
          </section>

          {/* 5. 한 장 체크리스트 */}
          <section>
            <SectionTitle kicker="지금 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">1층</strong> — 내 가입기간이 10년을 넘었나? &lsquo;내 연금
                  알아보기&rsquo;로 예상 수령액 확인
                </li>
                <li>
                  <strong className="text-slate-800">1층 보강</strong> — 경력단절·납부예외 기간이 있다면 추납·임의(계속)가입
                  검토
                </li>
                <li>
                  <strong className="text-slate-800">2층</strong> — 내 퇴직연금이 DB인지 DC인지 확인, DC·IRP면 방치
                  말고 운용(디폴트옵션) 점검
                </li>
                <li>
                  <strong className="text-slate-800">2층 수령</strong> — 퇴직금은 IRP로 받아 연금화하면 퇴직소득세
                  감면
                </li>
                <li>
                  <strong className="text-slate-800">3층</strong> — 연말정산 세액공제 한도(연 900만원)를 채우고 있나
                </li>
                <li>
                  <strong className="text-slate-800">받을 때</strong> — 사적연금 합계가 연 1,500만원을 넘는지 미리
                  보고 수령 시기를 분산
                </li>
              </ul>
            </div>
          </section>

          {/* 6. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 가입 전 꼭 확인
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                연금은 &lsquo;받을 때&rsquo;까지 길게 보는 상품입니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                연금은 수십 년을 묻어 두고 세제 혜택을 받는 장기 상품이라, 중간에 깨면 그동안 받은 세금 혜택을
                되돌려줘야 할 수 있습니다. DC·IRP처럼 직접 운용하는 계좌는 원금 손실 가능성도 있어요. 또 유불리는
                소득·나이·이미 가진 다른 연금에 따라 사람마다 다릅니다. 이 글은 2026년 6월 기준 일반적인 제도를
                정리한 것이니, 가입·수령 전 국민연금공단과{" "}
                <a
                  href={SRC_FSS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  통합연금포털 &lsquo;내 연금 한눈에&rsquo;
                </a>
                에서 내 상황을 확인하고, 큰 결정은 전문가와 상담하시길 권합니다.
              </p>
            </div>
          </section>

          {/* 7. FAQ — 네이티브 details/summary */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="노후 연금, 가장 많이 묻는 질문" />
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

          {/* 8. 관련 가이드·글 */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 글" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_RETIRE}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  퇴직금 일시금 vs 연금 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  2층 퇴직연금을 받을 때 — 일시금과 연금수령의 세금 차이를 정리한 글.
                </p>
              </Link>
              <Link
                href={SRC_ISA}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  ISA · 연금저축 · IRP 비교 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  3층 개인연금을 채울 때 — 절세계좌 3종의 한도·세제·꺼내는 법 비교.
                </p>
              </Link>
            </div>
          </section>

          {/* 9. 발견 CTA — 제휴 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_FSS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">내 연금 한눈에 조회 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                통합연금포털 · 국민·퇴직·개인연금을 한 화면에
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                연금·세금·내집마련 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 제도·요건·세율은 2026년 6월 기준({UPDATED} 확인)으로 국민연금공단·국세청 등 공식 자료를
              정리한 것입니다. 연금 제도와 세법은 바뀔 수 있고, 유불리는 개별 사안(소득·나이·가입기간·다른 연금 보유
              등)에 따라 크게 달라집니다. 가입·수령 전 국민연금공단과 통합연금포털에서 최신 기준과 내 예상 수령액을
              확인하고, 큰 결정은 전문가와 상담하시기 바랍니다. 본 내용은 정보 제공을 위한 것이며 투자·세무 자문이
              아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국민연금공단 — 노령연금 수급연령·임의가입·연기연금 (
                <a
                  href={SRC_NPS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  nps.or.kr
                </a>
                )
              </li>
              <li>
                · 국세청 — 연금계좌 세액공제 한도·연금소득 과세 (
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
                · 금융감독원 통합연금포털 &lsquo;내 연금 한눈에&rsquo; (
                <a
                  href={SRC_FSS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  100lifeplan.fss.or.kr
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
