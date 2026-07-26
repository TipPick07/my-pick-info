import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 금융·예금 가이드 — 예금자보호 (보호 범위와 금액대별 예치 설계)
 *
 * ▷ 2026-07-27 A형 클러스터: 경제 글 "예금자보호 1억 — 이자까지 지키는 예치 상한"의 짝 허브.
 * ▷ 독립 정적 라우트. src/content/posts/*.md(블로그)도 public/data/pick-info.json(크롤링)도 건드리지 않음.
 * ▷ 본문은 JSX로 직접 배치(표 깨짐 방지). 외부 커스텀 컴포넌트는 Header/Footer만.
 *   SectionTitle·DepthCard는 인라인(retirement-pension / housing-pension과 동일 토큰·시그니처).
 * ▷ 제휴 링크 없음 — 순수 정보 가이드. 데이터층 무접촉.
 *
 * [사실 검증 2026-07-27]
 * - 보호 한도: 2025.9.1부터 1인당·금융회사당 1억원(원금 + 소정의 이자). 예금보험공사 공시.
 * - 소정의 이자 = 약정이자와 공사 결정이자(시중은행 1년 만기 정기예금 평균금리 감안) 중 적은 금액.
 * - 한도는 금융회사별 합산(지점 구분 없음). 예금 종류별·지점별이 아님.
 * - 별도 한도(각각 1억): 퇴직연금(DC·IRP·중소기업퇴직연금기금), 연금저축(신탁·보험), 사고보험금.
 * - 상향은 6개 법령 개정(예금자보호법·신협법·농협법·수협법·산림조합법·새마을금고법) — 상호금융도 1억.
 * - 상호금융은 예보가 아닌 각 중앙회 자체 기금이 보호. 우체국은 우체국예금·보험에 관한 법률에 따라 국가가 전액 보장.
 * - 비보호: CD·RP·펀드 등 금융투자상품·금융회사 발행채권·후순위채·증권사 CMA·주택청약종합저축(주택도시기금 관리).
 *   증권사 투자자예탁금은 보호(1억). 퇴직연금·연금저축·ISA는 계좌 안에서 원리금보장 상품으로 운용 중인 금액만 보호.
 * - 예금보험료율: 새 요율은 2028년 납입분부터 적용 예정(특별기여금은 2027년말까지) — 금융위 보도자료.
 * - 자체 계산(연 3.5% 1년 만기, python 검산): 안전 원금 9,661만(96,618,357원).
 *   1억 보유 → 338만 남음 / 3억 → 3곳 2억 8,986만 + 1,014만 / 5억 → 5곳 4억 8,309만 + 1,691만.
 * 출처: 예금보험공사(kdic.or.kr), 금융위원회 보도자료, 금융감독원.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/deposit-protection/";
const UPDATED = "2026-07-27"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_POST = "/blog/2026-07-27-deposit-protection-limit/"; // 클러스터 짝 글
const SRC_PARKING = "/blog/2026-06-29-parking-account-cma-guide/"; // 파킹통장·CMA
const SRC_ISA = "/blog/2026-06-25-isa-irp-pension-savings-comparison/"; // ISA·IRP·연금저축
const SRC_PENSION = "/guides/retirement-pension/"; // 퇴직연금 DB·DC·IRP
const SRC_CALC = "/tools/savings-interest/"; // 예금·적금 이자 계산기
const SRC_MONEY = "/money/";

// 공식 출처
const SRC_KDIC = "https://www.kdic.or.kr"; // 예금보험공사(보호대상·모의계산기)

const OG_TITLE = "예금자보호 완전정리 — 어디까지 얼마까지 (2026)";
const OG_DESC =
  "보호 한도 1억원은 원금+이자 합계 — 보호·비보호 상품 구분, 별도 한도 3종, 금액대별 예치 설계를 계산으로 정리한 가이드.";

export const metadata: Metadata = {
  title: "예금자보호 완전정리 — 어디까지 얼마까지 (2026) | 팁픽",
  description: OG_DESC,
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${SITE}${PATH}`,
    title: OG_TITLE,
    description: OG_DESC,
  },
  twitter: {
    card: "summary",
    title: OG_TITLE,
    description: OG_DESC,
  },
};

/* ─────────────────────────  본문 데이터 (SSOT · 페이지 본문 그대로)  ───────────────────────── */

// ★ 보호 대상 vs 비보호 (글의 중심 표)
const PRODUCTS = [
  {
    where: "은행",
    safe: "예금·적금·부금, 원금보전형 신탁, 외화예금, 표지어음",
    unsafe: "펀드·신탁 실적배당형, 양도성예금증서(CD), 환매조건부채권(RP), 은행 발행채권, 주택청약종합저축",
  },
  {
    where: "저축은행",
    safe: "예금·적금, 표지어음",
    unsafe: "후순위채권, 저축은행 발행채권",
    accent: true,
  },
  {
    where: "증권사",
    safe: "투자자예탁금(원금 + 예탁금 이용료), 원금보전형 신탁",
    unsafe: "주식·펀드 등 금융투자상품, 증권사 CMA(RP형·MMF형), 청약자예수금 외 투자 손익",
  },
  {
    where: "보험사",
    safe: "개인이 가입한 보험계약(해지환급금 등), 사고보험금(별도 한도)",
    unsafe: "변액보험 주계약(최저보증 제외), 보증보험·재보험",
  },
  {
    where: "상호금융·우체국",
    safe: "예·적금 (신협·농협·수협·산림조합·새마을금고 각 1억 / 우체국은 국가가 전액 보장)",
    unsafe: "공제상품 중 보호 대상이 아닌 상품, 출자금",
    accent: true,
  },
];

// 한도가 나뉘는 세 축 (DepthCard)
const AXES = [
  {
    k: "① 금융회사별",
    v: "같은 회사의 본점·지점 예금은 전부 합산해 1억원입니다. 지점을 나눠 넣는 것은 아무 의미가 없어요. 예외는 상호금융 — 지역 신협·새마을금고는 조합·금고마다 별도 법인이라 서로 다른 조합이면 각각 한도가 적용됩니다.",
    accent: true,
  },
  {
    k: "② 명의별",
    v: "한도는 예금자 1인당입니다. 부부가 같은 은행에 각자 명의로 두면 합계 2억원까지 보호 범위에 들어갑니다. 공동명의 예금은 지분만큼 나눠 계산하니, 한 사람 명의로 몰아 둔 계좌가 있다면 그것부터 확인하세요.",
  },
  {
    k: "③ 계좌 성격별",
    v: "퇴직연금(DC·IRP·중소기업퇴직연금기금), 연금저축, 사고보험금은 노후소득·사회보장 성격을 감안해 일반 예금과 합산하지 않고 각각 1억원까지 별도 보호됩니다. 같은 금융사라도 따로 세어 준다는 뜻이에요.",
    accent: true,
  },
  {
    k: "⚠️ 한도의 단위",
    v: "1억원은 원금이 아니라 원금 + 소정의 이자 합계입니다. 소정의 이자는 약정이자와 공사 결정이자(시중은행 1년 만기 정기예금 평균금리 감안) 중 적은 금액이라, 고금리 상품일수록 보호되는 이자가 약정이자보다 적게 잡힐 수 있습니다.",
  },
];

// 자체 계산 — 금액대별 예치 설계 (연 3.5% 1년 만기, python 검산)
const PLAN_ROWS = [
  {
    amount: "5,000만원",
    plan: "한 곳으로 충분",
    detail: "만기 원리금 5,175만원 — 한도까지 4,825만원 여유",
  },
  {
    amount: "1억원",
    plan: "9,661만원 + 나머지 338만원",
    detail: "1억을 한 곳에 다 넣으면 이자 350만원이 한도 밖",
    accent: true,
  },
  {
    amount: "3억원",
    plan: "3곳(2억 8,986만원) + 1,014만원",
    detail: "'3억이면 3곳' 어림셈이 한 계좌만큼 어긋나는 지점",
    accent: true,
  },
  {
    amount: "5억원",
    plan: "5곳(4억 8,309만원) + 1,691만원",
    detail: "연 이자 2,000만원(금융소득 종합과세) 경계는 5억 7,143만원부터",
  },
];

// 부실이 나면 실제로 어떻게 되나 (DepthCard)
const WHEN_FAIL = [
  {
    k: "지급 정지 → 공고",
    v: "금융회사에 보험사고(영업정지·파산 등)가 발생하면 예금보험공사가 지급 절차와 기간을 공고합니다. 이때 필요한 것은 신분증과 통장·증서 정도이고, 평소 별도 가입이나 신청을 해 둘 필요는 없습니다.",
  },
  {
    k: "가지급금 제도",
    v: "보험금 지급이 확정되기 전이라도 예금자의 급한 자금 사정을 고려해 공사가 가지급금을 먼저 지급할 수 있습니다. 금액·시기는 사고마다 공사가 정해 공고하므로, 사고 발생 시 공고문을 먼저 확인하는 것이 순서입니다.",
    accent: true,
  },
  {
    k: "한도 초과분",
    v: "1억원을 넘는 금액은 사라지는 것이 아니라 파산 절차에서 재산을 처분해 배당받습니다. 다만 얼마를, 언제 받을지는 그 회사의 남은 재산에 달려 있고 수년이 걸리기도 합니다. 한도는 '전액 손실 방지선'이 아니라 '즉시·전액 보장선'으로 이해하는 편이 정확합니다.",
    accent: true,
  },
  {
    k: "보험료는 누가 내나",
    v: "예금보험료는 예금자가 아니라 금융회사가 냅니다. 한도 상향에 따른 새 요율은 2028년 납입분부터 적용될 예정이고(외환위기 공적자금 특별기여금은 2027년말까지), 예금자가 따로 부담하거나 신청할 것은 없습니다.",
  },
];

const FAQS = [
  {
    q: "법인 명의 예금도 1억원까지 보호되나요?",
    a: "네, 법인도 예금자로 보호됩니다. 다만 정부·지방자치단체, 한국은행, 금융감독원, 예금보험공사, 부보금융회사가 예치한 예금은 보호 대상에서 제외됩니다. 법인 자금은 개인보다 규모가 커 한도를 넘기기 쉬우므로, 결제성 자금은 거래 은행에 두더라도 여유 자금은 회사별로 나누거나 보호 대상이 아닌 상품인지부터 확인하는 편이 안전합니다.",
  },
  {
    q: "저축은행 여러 곳에 나눠 넣으면 각각 1억원인가요?",
    a: "맞습니다. 저축은행도 예금보험공사 부보 금융회사라 회사가 다르면 각각 1억원까지 보호됩니다. 주의할 점은 같은 저축은행의 여러 지점은 하나로 합산된다는 것, 그리고 후순위채권처럼 같은 저축은행이 팔더라도 보호 대상이 아닌 상품이 있다는 것입니다. 금리가 높은 상품일수록 상품설명서의 예금자보호 표기를 먼저 확인하세요.",
  },
  {
    q: "IRP·연금저축 계좌에 넣은 돈은 전액 보호되나요?",
    a: "계좌라서 보호되는 것이 아니라, 그 안에서 어떤 상품으로 운용 중인지에 따라 갈립니다. 예금 등 원리금보장 상품으로 굴리는 금액은 일반 예금과 별도로 1억원까지 보호되지만, 펀드·ETF·TDF로 운용 중인 금액은 애초에 예금자보호 대상이 아닙니다. 즉 별도 한도는 '원리금보장으로 담아 둔 부분'에 대한 안전판으로 보면 됩니다.",
  },
  {
    q: "새마을금고·신협은 예금보험공사가 보호하는 게 아니라던데 안전한가요?",
    a: "보호 주체가 다를 뿐 한도는 같습니다. 2025년 9월 상향은 예금자보호법만이 아니라 신협법·농협법·수협법·산림조합법·새마을금고법까지 6개 법령을 함께 고쳐 이뤄졌고, 상호금융은 각 중앙회가 운영하는 자체 기금이 1억원까지 보호합니다. 다만 기금의 성격과 규모가 예금보험기금과 다르므로, 예치액이 크다면 업권을 섞어 분산하는 것도 방법입니다. 출자금은 예금이 아니라 보호 대상이 아니라는 점도 함께 기억해 두세요.",
  },
  {
    q: "주택청약종합저축과 우체국 예금은 어떻게 되나요?",
    a: "성격이 정반대입니다. 주택청약종합저축은 예금보험공사 보호 대상이 아니지만 주택도시기금으로 관리되는 정책 상품이고, 우체국 예금은 우체국예금·보험에 관한 법률에 따라 국가가 지급을 보장해 한도 자체가 없습니다. 즉 둘 다 '예금자보호 대상 아님'으로 표기되거나 한도 표기가 없더라도 위험 상품이라는 뜻은 아닙니다. 반대로 예금자보호가 되는 상품이라도 1억원을 넘는 부분은 보호 밖이라는 점이 핵심입니다.",
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

export default function DepositProtectionGuide() {
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
        name: "예금자보호 가이드",
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
              2026년 기준 · 예금·금융
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              예금자보호 —
              <br className="hidden sm:block" /> 어디까지, 얼마까지 지켜지나
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              보호 한도는 <strong>1인당·금융회사당 1억원</strong>(2025년 9월 1일부터)입니다. 그런데
              이 1억원은 원금이 아니라 <strong>원금과 소정의 이자를 합친 금액</strong>이라, 연 3.5%
              정기예금이라면 원금 <strong>9,661만원</strong>이 실제 안전선입니다.
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              한도는 세 가지로 나뉩니다 — <strong>금융회사별 · 명의별 · 계좌 성격별.</strong> 이
              구조만 알면 계좌 수를 늘리지 않고도 보호 범위를 넓힐 수 있어요. 이 페이지에서 보호·비보호
              상품을 한 표로 잡고, 5,000만원부터 5억원까지 금액대별 예치 설계를 직접 계산합니다.
              (금리별 상한선 계산은{" "}
              <Link
                href={SRC_POST}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                예금자보호 1억 글
              </Link>
              에서 이어집니다)
            </p>

            {/* 핵심 요약 박스 (인라인 · 값은 본문에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "한도의 단위",
                  v: "원금 + 이자 = 1억",
                  d: "금융회사별 · 1인당",
                },
                {
                  k: "별도 한도 3종",
                  v: "퇴직연금·연금저축·사고보험금",
                  d: "각각 1억씩 따로",
                },
                {
                  k: "보호 주체",
                  v: "예보 / 중앙회 / 국가",
                  d: "업권마다 기금이 다름",
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
          {/* 1. ★ 보호 대상 vs 비보호 (중심 표) */}
          <section>
            <SectionTitle
              kicker="먼저 상품부터"
              title="같은 은행 창구에서도 갈리는 보호 여부"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              예금자보호는 <strong className="text-slate-800">금융회사</strong>가 아니라{" "}
              <strong className="text-slate-800">상품</strong>을 따라갑니다. 보호되는 은행에서 산
              상품이라도 펀드·CD·RP는 대상이 아니에요. 업권별로 정리하면 이렇습니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">어디</th>
                    <th className="px-4 py-3 font-semibold">보호 대상</th>
                    <th className="px-4 py-3 font-semibold">보호 대상 아님</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PRODUCTS.map((p) => (
                    <tr key={p.where} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {p.where}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          p.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {p.safe}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.unsafe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 주택청약종합저축은 예금보험 대상은 아니지만 주택도시기금으로 관리되는 정책 상품입니다.
              증권사 CMA도 예금자보호 대상이 아닙니다(증권사에 맡긴 투자자예탁금은 1억원까지 보호).
              비상금 통장을 고르는 기준은{" "}
              <Link
                href={SRC_PARKING}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                파킹통장·CMA 비교
              </Link>
              에 정리해 두었습니다.
            </p>
          </section>

          {/* 2. 한도가 나뉘는 세 축 */}
          <section>
            <SectionTitle
              kicker="한도를 세는 방법"
              title="회사별 · 명의별 · 계좌 성격별로 나뉜다"
            />
            <DepthCard
              tone="indigo"
              badge="한도 구조"
              title="지점을 나누면 소용없고, 성격을 나누면 늘어난다"
              sub="같은 금융사에서도 별도 한도 3종은 따로 계산"
              rows={AXES}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              한 은행에 일반 예금 1억원 + IRP 1억원 + 연금저축 1억원을 두면 이론상 한 곳에서 3억원까지
              보호 범위에 들어옵니다. 단, 연금 계좌는 그 안에서 원리금보장 상품으로 운용 중인 금액만
              해당됩니다. 계좌 구조는{" "}
              <Link
                href={SRC_PENSION}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                퇴직연금 DB·DC·IRP 가이드
              </Link>
              에서 확인하세요.
            </p>
          </section>

          {/* 3. 자체 계산 — 금액대별 예치 설계 */}
          <section>
            <SectionTitle
              kicker="직접 계산해 보면"
              title="5,000만원부터 5억원까지, 몇 곳으로 나눠야 하나"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              연 3.5% 1년 만기 정기예금을 가정하고, 만기 원리금이 1억원을 넘지 않는 선(한 곳당{" "}
              <strong className="text-slate-800">9,661만원</strong>)으로 나눠 봤습니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">예치 금액</th>
                    <th className="px-4 py-3 font-semibold">이렇게 나누면</th>
                    <th className="px-4 py-3 font-semibold">메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PLAN_ROWS.map((p) => (
                    <tr key={p.amount} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {p.amount}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          p.accent ? "font-bold text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {p.plan}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 한도가 5,000만원이던 시절 3억원을 안전하게 두려면 6곳이 필요했지만, 지금은 3~4곳이면
              됩니다. 남는 금액은 다음 금융사로 보내거나 별도 한도(퇴직연금·연금저축)로 옮기면 계좌
              수를 줄일 수 있어요. 금리·기간을 바꿔 내 숫자로 계산하려면{" "}
              <Link
                href={SRC_CALC}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                예금·적금 이자 계산기
              </Link>
              를 쓰면 됩니다.
            </p>
          </section>

          {/* 4. 부실이 나면 실제로 어떻게 되나 */}
          <section>
            <SectionTitle
              kicker="사고가 나면"
              title="지급 절차와 한도 초과분의 운명"
            />
            <DepthCard
              tone="slate"
              badge="실제 절차"
              title="공고 → 청구 → 지급, 초과분은 파산 배당"
              sub="예금보험료는 금융회사가 부담"
              rows={WHEN_FAIL}
            />
          </section>

          {/* 5. 체크리스트 */}
          <section>
            <SectionTitle kicker="오늘 점검" title="내 예금 5분 점검 6가지" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">상품 확인</strong> — 내가 든 상품이 예금자보호
                  대상인지 상품설명서에서 봤나 (펀드·CD·RP·증권사 CMA는 대상 아님)
                </li>
                <li>
                  <strong className="text-slate-800">원금+이자</strong> — 만기 원리금 기준으로 한
                  금융사 1억원을 넘지 않게 잡았나
                </li>
                <li>
                  <strong className="text-slate-800">지점 착시</strong> — 같은 은행 다른 지점에 나눠
                  둔 돈이 합산된다는 걸 아나
                </li>
                <li>
                  <strong className="text-slate-800">명의 분산</strong> — 배우자·가족 명의로 나눌 수
                  있는 자금이 한 명에게 몰려 있지 않나
                </li>
                <li>
                  <strong className="text-slate-800">별도 한도</strong> — 퇴직연금·연금저축의 원리금보장
                  금액이 따로 1억원씩 보호된다는 걸 활용하고 있나
                </li>
                <li>
                  <strong className="text-slate-800">업권 분산</strong> — 예치액이 크다면 은행·저축은행·상호금융을
                  섞어 기금 자체를 나눠 두었나
                </li>
              </ul>
            </div>
          </section>

          {/* 6. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 고금리 상품일수록 확인할 것
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                보호되는 이자가 약정이자보다 적을 수 있습니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                보호 금액에 들어가는 이자는 <strong>약정이자와 공사 결정이자 중 적은 금액</strong>입니다.
                공사 결정이자는 시중은행 1년 만기 정기예금 평균금리를 감안해 정하므로, 평균보다 훨씬 높은
                금리를 주는 상품이라면 실제 보호되는 이자는 약정이자보다 적게 계산될 수 있어요. 고금리
                상품에 한도를 빠듯하게 채우기보다 여유를 두고, 상품별 보호 여부와 예상 보호 금액은{" "}
                <a
                  href={SRC_KDIC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  예금보험공사
                </a>
                의 보호 상품 안내·모의계산기에서 확인하세요.
              </p>
            </div>
          </section>

          {/* 7. FAQ — 네이티브 details/summary */}
          <section>
            <SectionTitle
              kicker="애매한 경우"
              title="법인은? 연금 계좌는? — 경계 사례 문답"
            />
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
            <SectionTitle kicker="한도를 잡았다면" title="예금·비상금 설계, 이어서 보기" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_POST}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  예금자보호 1억, 이자까지 지키는 상한 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  이 가이드의 짝 — 금리별 안전 원금과 3억 분산 계산.
                </p>
              </Link>
              <Link
                href={SRC_PARKING}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  파킹통장 vs CMA →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  하루만 맡겨도 이자 — 보호 여부까지 따진 비상금 통장 비교.
                </p>
              </Link>
              <Link
                href={SRC_ISA}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  ISA·IRP·연금저축 비교 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  별도 한도를 만드는 계좌들 — 어디부터 채울지 순서 잡기.
                </p>
              </Link>
              <Link
                href={SRC_CALC}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  예금·적금 이자 계산기 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  만기 원리금과 세후 이자를 먼저 확인하고 한도를 잡으세요.
                </p>
              </Link>
            </div>
          </section>

          {/* 9. 발견 CTA — 제휴 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_KDIC}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">내 예금 보호금액 확인하기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                예금보험공사 · 보호 상품 안내와 보호금액 모의계산기
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                예금·연금·세금·내집마련 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 보호 한도·별도 한도·보호 주체는 예금보험공사와 금융위원회 공시 자료({UPDATED}{" "}
              확인) 기준입니다. 금액대별 계산은 연 3.5% 1년 만기 단리를 가정한 예시이며 실제 상품
              금리와 다를 수 있고, 보호되는 이자는 약정이자와 공사 결정이자 중 적은 금액이 적용되므로
              실제 보호 금액은 계산과 차이가 날 수 있습니다. 상품별 보호 여부는 가입 전 상품설명서와
              예금보험공사에서 확인하시기 바랍니다. 본 내용은 정보 제공을 위한 것이며 투자 자문이
              아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 예금보험공사 — 보호한도·보호대상 금융상품·예금보호금액 모의계산기 (
                <a
                  href={SRC_KDIC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  kdic.or.kr
                </a>
                )
              </li>
              <li>
                · 금융위원회 — 예금보호한도 상향을 위한 6개 법령 개정·시행(2025.9.1) 보도자료
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
