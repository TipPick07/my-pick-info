import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 세금 가이드 — 개인사업자·프리랜서 세금 큰그림 (부가세·종소세·3.3%)
 *
 * ▷ 독립 정적 라우트. posts/*.md·pick-info.json 무접촉(자동발행 파이프라인과 충돌 없음).
 * ▷ 본문은 JSX 직접 배치(표 깨짐 버그 클래스 원천 차단).
 * ▷ 외부 컴포넌트는 Header/Footer만. SectionTitle·DepthCard는 파일 안 인라인
 *   (house-capital-gains-tax와 동일 토큰·시그니처).
 * ▷ 제휴 링크 없음 — 순수 정보 가이드.
 *
 * [사실 검증 2026-07-07]
 * - 부가세 확정신고: 개인 일반과세자 7.1~7.25(1기)·다음해 1.1~1.25(2기), 간이과세자 다음해 1.1~1.25 연 1회.
 * - 예정고지(4·10월)·예정부과(간이 7월): 직전 납부세액 50%, 50만원 미만 고지 생략, 확정신고 시 기납부 차감.
 * - 간이과세 기준: 직전 연도 공급대가 1억 400만원 미만(과세유흥·부동산임대 4,800만 미만),
 *   납부의무 면제 연 4,800만 미만, 업종별 부가가치율 15~40%, 간이 환급 불가.
 * - 신용카드매출전표 발행 세액공제 1.3%·연 1,000만 한도(2026.12.31까지, 직전 매출 10억 이하 개인).
 * - 전자세금계산서 의무: 직전 공급가액(면세 포함) 8,000만원 이상 개인.
 * - 프리랜서(인적용역) 부가세 면세, 3.3%(소득세 3%+지방 0.3%) 원천징수 = 선납,
 *   다음해 5월 종합소득세 확정신고로 정산(경비·공제 반영, 환급 다수).
 * - 계산 예시(자체): 연매출 6,000만 카페, 매입 3,300만(부가세 포함) 가정 —
 *   일반 600만−300만=300만 vs 간이(음식점 부가가치율 15%) 6,000만×15%×10%=90만, 차이 210만.
 * - 계산 예시(자체): 연매출 6,000만 카페, 매입 3,300만(부가세 포함) 가정 —
 *   일반 600만−300만=300만 vs 간이(음식점 부가가치율 15%) 6,000만×15%×10%=90만, 차이 210만.
 * 출처: 국세청 부가가치세 신고납부기한·기본정보(nts.go.kr), 부가가치세법 §46·§48, 홈택스.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/self-employed-freelancer-tax/";
const UPDATED = "2026-07-07"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_VAT = "/blog/2026-07-07-vat-filing-guide/"; // 부가세 신고(짝 글)
const SRC_SIMPLE = "/blog/2026-07-07-simplified-vs-general-taxpayer/"; // 간이vs일반(짝 글)
const SRC_INCOMETAX_GUIDE = "/guides/comprehensive-income-tax-filing/"; // 종소세 가이드
const SRC_INCOMETAX_CALC = "/tools/income-tax/"; // 종소세 계산기
const SRC_MONEY = "/money/";

// 공식 출처 (staleness 완화 — 최신값 확인 링크)
const SRC_NTS = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2273&cntntsId=7694"; // 국세청 부가세 신고납부기한
const SRC_HOMETAX = "https://hometax.go.kr";

const OG_TITLE = "개인사업자·프리랜서 세금 — 부가세·종소세·3.3% 한눈에 (2026)";
const OG_DESC =
  "사업자 세금은 달력이 반입니다. 1월·7월 부가세, 5월 종합소득세, 프리랜서 3.3% 환급까지 — 유형별로 언제 무엇을 신고하는지 한 표로 정리한 가이드.";

export const metadata: Metadata = {
  title: "개인사업자·프리랜서 세금 — 부가세·종소세·3.3% 한눈에 (2026) | 팁픽",
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

// ★ 핵심 비교표 — 일반과세 vs 간이과세 vs 프리랜서
const COMPARE = [
  {
    axis: "부가가치세",
    general: "매출세액 10% − 매입세액 (환급 가능)",
    simple: "매출 × 부가가치율(15~40%) × 10%",
    free: "면세 — 신고 대상 아님",
    accent: true,
  },
  {
    axis: "부가세 신고",
    general: "연 2회 (7월·다음 해 1월)",
    simple: "연 1회 (다음 해 1월)",
    free: "없음",
  },
  {
    axis: "소득세",
    general: "5월 종합소득세 확정신고",
    simple: "5월 종합소득세 확정신고",
    free: "3.3% 선납 후 5월 정산(환급 다수)",
    accent: true,
  },
  {
    axis: "세금계산서",
    general: "발급 (직전 8,000만↑ 전자 의무)",
    simple: "직전 매출 4,800만↑만 발급 의무",
    free: "발급 불가 (원천징수영수증)",
  },
  {
    axis: "유리한 경우",
    general: "초기 투자 큼 · B2B 거래 많음",
    simple: "소비자 상대 소규모 (매출 1.04억 미만)",
    free: "고용 없이 몸으로 하는 용역",
  },
];

// 부가가치세 (DepthCard)
const VAT_ROWS = [
  {
    k: "누가",
    v: "사업자등록을 한 과세사업자 전부. 매출이 없어도 '무실적 신고'는 해야 합니다. 면세사업자(학원·병원 등)와 인적용역 프리랜서는 부가세 신고 대상이 아닙니다.",
  },
  {
    k: "언제",
    v: "개인 일반과세자는 7월 1~25일(상반기분)과 다음 해 1월 1~25일(하반기분) 연 2회. 간이과세자는 다음 해 1월 연 1회가 원칙입니다. 4월·10월 예정고지(간이는 7월 예정부과)로 직전 세액의 절반을 중간에 내고, 확정신고 때 차감받습니다.",
    accent: true,
  },
  {
    k: "얼마나",
    v: "일반과세자는 매출세액(10%)에서 매입세액을 뺀 금액. 간이과세자는 매출에 업종별 부가가치율(15~40%)과 10%를 곱한 금액입니다. 간이과세자는 연 매출 4,800만 원 미만이면 납부가 면제됩니다(신고는 필요).",
  },
  {
    k: "절세 포인트",
    v: "증빙이 곧 돈입니다. 세금계산서·현금영수증·사업용 신용카드(홈택스 등록) 매입분만 공제됩니다. 카드·현금영수증 매출이 있는 소규모 사업자는 발행액의 1.3%(연 1,000만 한도) 발행 세액공제도 챙기세요.",
    accent: true,
  },
];

// 종합소득세 (DepthCard)
const INCOME_ROWS = [
  {
    k: "누가",
    v: "개인사업자·프리랜서 등 사업소득이 있는 사람 전부. 직장인이라도 부업 사업소득이 있으면 대상입니다. 다음 해 5월에 1년 치 소득을 모아 신고합니다.",
  },
  {
    k: "프리랜서 3.3%",
    v: "보수에서 미리 떼는 3.3%(소득세 3% + 지방소득세 0.3%)는 '선납'일 뿐 신고를 대신해 주지 않습니다. 5월에 경비·공제를 반영해 정산하면 미리 낸 세금이 더 많아 환급받는 경우가 많습니다 — 신고를 안 하면 돌려받을 돈도 사라집니다.",
    accent: true,
  },
  {
    k: "경비 처리",
    v: "소득세는 '매출 − 경비'인 소득에 매깁니다. 재료비·임차료·통신비·차량유지비 등 사업 관련 지출의 증빙을 모아 두는 것이 최대 절세입니다. 매출 규모에 따라 장부 작성(간편장부·복식부기) 의무가 달라집니다.",
  },
  {
    k: "안 하면",
    v: "무신고 가산세(20%)와 납부지연 가산세가 붙고, 건강보험료 산정·대출 심사에도 불리해집니다. 소득 증빙이 필요한 프리랜서일수록 5월 신고가 곧 신용입니다.",
  },
];

// 사업자 세금 달력
const CALENDAR = [
  { when: "1월 1~25일", what: "부가가치세 확정신고 (일반 하반기분 · 간이 연 1회)", who: "일반·간이", accent: true },
  { when: "4월", what: "부가세 예정고지 납부 (직전 세액의 50% · 50만 원 미만 생략)", who: "개인 일반" },
  { when: "5월", what: "종합소득세 확정신고 (프리랜서 3.3% 정산·환급 포함)", who: "사업자·프리랜서 전부", accent: true },
  { when: "7월 1~25일", what: "부가가치세 확정신고 (일반 상반기분)", who: "개인 일반", accent: true },
  { when: "7월", what: "부가세 예정부과 납부 (간이 · 직전 세액의 50%)", who: "간이" },
  { when: "10월", what: "부가세 예정고지 납부 (직전 세액의 50%)", who: "개인 일반" },
];

const FAQS = [
  {
    q: "프리랜서인데 3.3%를 이미 뗐으면 세금이 끝난 것 아닌가요?",
    a: "아닙니다. 3.3%는 미리 낸 세금(선납)일 뿐이고, 다음 해 5월 종합소득세 신고로 최종 세액을 확정해야 합니다. 경비와 각종 공제를 반영하면 미리 낸 세금이 더 많은 경우가 흔해서, 신고하면 환급받는 프리랜서가 많습니다. 신고하지 않으면 환급도 없고 무신고 가산세 위험만 남습니다.",
  },
  {
    q: "간이과세자는 부가세를 아예 안 내나요?",
    a: "아닙니다. 간이과세자도 매출에 업종별 부가가치율(15~40%)과 10%를 곱한 부가세를 냅니다. 다만 연 매출(공급대가) 4,800만 원 미만이면 납부 의무가 면제되고, 이 경우에도 1월 신고 자체는 해야 합니다.",
  },
  {
    q: "사업자등록 없이 일하는 프리랜서도 부가세 신고를 하나요?",
    a: "고용 없이 독립적으로 일하는 인적용역(작가·디자이너·개발 외주·강사 등)은 부가가치세가 면세라 부가세 신고 대상이 아닙니다. 소득세만 5월에 신고하면 됩니다. 다만 직원을 두거나 사업장을 갖춰 사업 형태가 되면 사업자등록과 부가세 신고 의무가 생길 수 있습니다.",
  },
  {
    q: "매출이 0원인데도 신고해야 하나요?",
    a: "네. 사업자등록이 유지되는 한 부가세는 무실적 신고라도 해야 하고, 폐업했다면 폐업일이 속한 달의 다음 달 25일까지 폐업 확정신고를 해야 합니다. 방치하면 가산세와 불이익이 쌓입니다.",
  },
  {
    q: "신고 기한을 놓쳤어요. 어떻게 하죠?",
    a: "가능한 한 빨리 '기한 후 신고'를 하세요. 무신고 가산세(납부세액의 20%)가 붙지만, 기한 후 1개월 이내 신고하면 가산세의 50%를 깎아 주는 등 빨리 할수록 감면 폭이 큽니다. 납부가 어려우면 분납·납부기한 연장도 세무서에 신청할 수 있습니다.",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트(파일 내부 · 표준 토큰과 동일)  ───────────────────────── */

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

export default function SelfEmployedFreelancerTaxGuide() {
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
        name: "개인사업자·프리랜서 세금 가이드",
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
              2026년 기준 · 사업자 세금 달력
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              개인사업자·프리랜서 세금,
              <br className="hidden sm:block" /> 1월·5월·7월만 기억하면 됩니다 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              사업자 세금은 복잡해 보이지만 뼈대는 두 개뿐입니다 —{" "}
              <strong>부가가치세(1월·7월)와 종합소득세(5월).</strong> 여기에 내 유형(일반과세·간이과세·프리랜서)에
              따라 신고 방법이 달라질 뿐입니다. 이 가이드는 유형별 차이 → 세금별 핵심 → 1년 달력 순서로,
              사업 첫해에도 놓치는 것 없이 챙기도록 정리했습니다. (부가세 신고 실무는{" "}
              <Link
                href={SRC_VAT}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                부가가치세 신고
              </Link>
              , 유형 선택은{" "}
              <Link
                href={SRC_SIMPLE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                간이과세 vs 일반과세
              </Link>{" "}
              참고)
            </p>

            {/* 핵심 요약 박스 (인라인 · 값은 본문에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "부가가치세",
                  v: "1월 · 7월",
                  d: "일반 연 2회 / 간이 1월 연 1회",
                },
                {
                  k: "종합소득세",
                  v: "5월 확정신고",
                  d: "사업자·프리랜서 전부",
                },
                {
                  k: "프리랜서 3.3%",
                  v: "5월에 정산",
                  d: "선납일 뿐 — 신고해야 환급",
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
          {/* 1. ★ 핵심 비교표 — 일반 vs 간이 vs 프리랜서 */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="일반과세 vs 간이과세 vs 프리랜서 — 무엇이 다른가"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">일반과세자</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">간이과세자</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">프리랜서(인적용역)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARE.map((r) => (
                    <tr key={r.axis} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">{r.axis}</td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.general}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.simple}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.free}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              간이과세 기준은 직전 연도 매출(공급대가) 1억 400만 원 미만(과세유흥장소·부동산임대업은
              4,800만 원 미만)이며, 일부 업종·지역은 간이과세가 배제됩니다.
            </p>
          </section>

          {/* 1.5 계산 예시 — 간이 vs 일반 숫자로 */}
          <section>
            <SectionTitle
              kicker="숫자로 확인"
              title="연매출 6,000만 원 카페 — 간이 vs 일반, 부가세는 얼마나 다른가"
            />
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              표만으로는 감이 안 옵니다. <strong>연매출(공급대가) 6,000만 원 카페</strong>가 원두·임차료
              등으로 연간 매입 3,300만 원(부가세 포함)을 쓰고, 전액 세금계산서·사업용 카드로 증빙했다고
              가정해 봅니다 — 공급가액 3,000만 원 + 매입세액 300만 원입니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">일반과세자</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">간이과세자 (음식점업 15%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">계산식</td>
                    <td className="px-4 py-3 text-slate-600">
                      매출세액 600만(6,000만 × 10%) − 매입세액 300만
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      6,000만 × 부가가치율 15% × 10%
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">연간 부가세</td>
                    <td className="px-4 py-3 font-medium text-indigo-700">약 300만 원</td>
                    <td className="px-4 py-3 font-medium text-indigo-700">약 90만 원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              같은 매출인데 이 사례에서는 간이과세가 연 210만 원가량 유리합니다. 다만 이는 업종별
              부가가치율(음식점업 15%)과 매입 규모를 단순화한 가정 계산으로, 신용카드매출전표 발행
              세액공제(1.3%) 등을 반영하면 격차는 달라집니다. 반대로 개업 첫해 인테리어·설비 투자처럼
              매입세액이 매출세액보다 큰 해에는 일반과세자만 차액을 환급받을 수 있어(간이는 환급 불가)
              초기 투자가 큰 사업은 일반과세가 오히려 나을 수 있습니다.
            </p>
          </section>

          {/* 1.5 계산 예시 — 간이 vs 일반 숫자로 */}
          <section>
            <SectionTitle
              kicker="숫자로 확인"
              title="연매출 6,000만 원 카페 — 간이 vs 일반, 부가세는 얼마나 다른가"
            />
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              표만으로는 감이 안 옵니다. <strong>연매출(공급대가) 6,000만 원 카페</strong>가 원두·임차료
              등으로 연간 매입 3,300만 원(부가세 포함)을 쓰고, 전액 세금계산서·사업용 카드로 증빙했다고
              가정해 봅니다 — 공급가액 3,000만 원 + 매입세액 300만 원입니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">일반과세자</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">간이과세자 (음식점업 15%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">계산식</td>
                    <td className="px-4 py-3 text-slate-600">
                      매출세액 600만(6,000만 × 10%) − 매입세액 300만
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      6,000만 × 부가가치율 15% × 10%
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">연간 부가세</td>
                    <td className="px-4 py-3 font-medium text-indigo-700">약 300만 원</td>
                    <td className="px-4 py-3 font-medium text-indigo-700">약 90만 원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              같은 매출인데 이 사례에서는 간이과세가 연 210만 원가량 유리합니다. 다만 이는 업종별
              부가가치율(음식점업 15%)과 매입 규모를 단순화한 가정 계산으로, 신용카드매출전표 발행
              세액공제(1.3%) 등을 반영하면 격차는 달라집니다. 반대로 개업 첫해 인테리어·설비 투자처럼
              매입세액이 매출세액보다 큰 해에는 일반과세자만 차액을 환급받을 수 있어(간이는 환급 불가)
              초기 투자가 큰 사업은 일반과세가 오히려 나을 수 있습니다.
            </p>
          </section>

          {/* 2. 부가가치세 깊이 */}
          <section>
            <SectionTitle
              kicker="세금 ① — 받아 둔 돈 정산"
              title="부가가치세 — 1월·7월의 세금"
            />
            <DepthCard
              tone="indigo"
              badge="부가세"
              title="매출의 10%는 처음부터 내 돈이 아닙니다"
              sub="국세청 부가가치세 기준"
              rows={VAT_ROWS}
            />
          </section>

          {/* 3. 종합소득세 깊이 */}
          <section>
            <SectionTitle
              kicker="세금 ② — 번 만큼 낸다"
              title="종합소득세 — 5월의 세금, 프리랜서는 환급 기회"
            />
            <DepthCard
              tone="slate"
              badge="종소세"
              title="매출 − 경비 = 소득에 6~45% 누진세율"
              sub="다음 해 5월 확정신고"
              rows={INCOME_ROWS}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              세율 구조·공제 항목은{" "}
              <Link
                href={SRC_INCOMETAX_GUIDE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                종합소득세 신고 가이드
              </Link>
              에서 자세히 다루고, 예상 세액은{" "}
              <Link
                href={SRC_INCOMETAX_CALC}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                종합소득세 계산기
              </Link>
              로 바로 확인할 수 있습니다.
            </p>
          </section>

          {/* 4. 사업자 세금 달력 */}
          <section>
            <SectionTitle kicker="1년이 한눈에" title="사업자 세금 달력 — 이 여섯 줄이 전부" />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">시기</th>
                    <th className="px-4 py-3 font-semibold">할 일</th>
                    <th className="px-4 py-3 font-semibold">대상</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CALENDAR.map((r) => (
                    <tr key={r.when + r.what} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">{r.when}</td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.what}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              예정고지·예정부과로 낸 금액은 확정신고 때 이미 낸 세금으로 차감됩니다. 고지 세액이
              50만 원 미만이면 고지가 생략됩니다.
            </p>
          </section>

          {/* 5. 한 장 체크리스트 */}
          <section>
            <SectionTitle kicker="사업 첫해에 세팅" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">유형 확인</strong> — 나는 일반과세·간이과세·프리랜서(면세)
                  중 무엇인가. 사업자등록증과 홈택스에서 확인
                </li>
                <li>
                  <strong className="text-slate-800">통장·카드 분리</strong> — 사업용 계좌와 사업용
                  신용카드를 따로 만들고, 카드는 홈택스에 등록(매입 자료 자동 수집)
                </li>
                <li>
                  <strong className="text-slate-800">부가세 통장</strong> — 매출의 10%는 받는 즉시
                  별도 통장에 이체(신고 달 자금난 예방)
                </li>
                <li>
                  <strong className="text-slate-800">증빙 습관</strong> — 지출은 세금계산서·현금영수증(지출증빙용)·카드로.
                  간이영수증·계좌이체만으로는 공제를 놓칩니다
                </li>
                <li>
                  <strong className="text-slate-800">달력 등록</strong> — 1월·7월(부가세)·5월(종소세)을
                  휴대폰 캘린더에 반복 일정으로
                </li>
                <li>
                  <strong className="text-slate-800">프리랜서</strong> — 원천징수영수증을 모아 두고,
                  5월 신고로 3.3% 선납분을 반드시 정산(환급 확인)
                </li>
              </ul>
            </div>
          </section>

          {/* 6. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 단정하기 전에 확인
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                기준금액·배제 업종은 수시로 바뀝니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                간이과세 기준금액(현재 1억 400만 원)과 간이과세 배제 업종·지역, 각종 세액공제의
                한도·일몰은 세법 개정과 국세청 고시로 자주 바뀝니다. 업종(면세·과세 겸업), 공동사업,
                다중 사업장처럼 판단이 갈리는 사례도 많습니다. 이 가이드는 {UPDATED} 기준의 일반적인
                내용이니, 사업자등록·신고 전에{" "}
                <a
                  href={SRC_HOMETAX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  홈택스
                </a>
                와 관할 세무서에서 내 사례를 확인하고, 매출 규모가 커졌다면 세무사 기장을 검토하세요.
              </p>
            </div>
          </section>

          {/* 7. FAQ — 네이티브 details/summary */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="사업자·프리랜서가 가장 많이 묻는 질문" />
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
                href={SRC_VAT}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  부가가치세 신고 — 1월·7월 실무 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  매출·매입세액 계산 구조, 예정고지, 카드 발행 세액공제까지 신고 실무를 짚는 짝 글.
                </p>
              </Link>
              <Link
                href={SRC_SIMPLE}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  간이과세 vs 일반과세 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  사업자등록 첫 단추 — 기준 1억 400만 원, 환급·세금계산서 차이로 고르는 법.
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
              <span className="text-sm font-bold">홈택스에서 신고·조회하기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                hometax.go.kr · 미리채움 자료로 셀프 신고
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                세금·대출·재테크 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 기한·기준금액·공제는 2026년 기준({UPDATED} 확인)으로 국세청 등 공식 자료를
              정리한 것입니다. 세법과 고시는 수시로 개정되고, 세금은 개별 사안(업종·매출 구조·겸업·공동사업
              등)에 따라 결과가 달라집니다. 신고·납부 전 홈택스와 관할 세무서에서 최신 기준을 확인하고,
              규모가 커진 사업은 세무 전문가와 상담하시기 바랍니다. 본 내용은 정보 제공을 위한 것이며
              세무 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국세청 부가가치세 신고납부기한·기본정보 (
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
              <li>· 부가가치세법 §46(신용카드 등 세액공제)·§48(예정고지) 및 시행령</li>
              <li>· 국세청 홈택스 — 부가가치세·종합소득세 신고 (hometax.go.kr)</li>
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
