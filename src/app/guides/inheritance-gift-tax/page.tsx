import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 세금 가이드 — 상속·증여세 큰그림 (공제 구조 + 10년 증여 플랜)
 *
 * ▷ 독립 정적 라우트. posts/*.md(블로그)도 pick-info.json도 무접촉.
 * ▷ 본문은 JSX 직접 배치. 외부 컴포넌트는 Header/Footer만, SectionTitle·DepthCard 인라인
 *   (house-capital-gains-tax와 동일 토큰·시그니처).
 * ▷ 짝: 증여세 면제한도 글 + 자녀 주식계좌 증여 글 (2026-07-03).
 *
 * [사실 검증 2026-07-03]
 * - 상속세(현행 유산세 방식): 일괄공제 5억(기초 2억+인적공제 합계와 비교해 큰 쪽),
 *   배우자상속공제 최소 5억~최대 30억(실제 상속분) → 배우자+자녀면 10억까지 상속세 0.
 * - 신고: 상속개시일이 속한 달의 말일부터 6개월(증여는 3개월). 기한 내 신고 시 3% 신고세액공제.
 * - 사전증여 합산: 상속인에게 10년 이내(상속인 아닌 자 5년) 증여분은 상속재산에 합산.
 * - 증여재산공제(10년): 배우자 6억 / 성인 자녀 5천만 / 미성년 2천만 / 기타친족 1천만
 *   + 혼인·출산 증여공제 통합 1억(혼인신고 전후 2년·출생 후 2년, 직계존속).
 * - 세율(상속·증여 공통): 1억 10% / 5억 20%(누진공제 1천만) / 10억 30%(6천만) /
 *   30억 40%(1.6억) / 30억 초과 50%(4.6억).
 * - 유산취득세 전환: 2025.3 입법예고, 2028 시행 목표 — 미확정이라 단정하지 않음.
 * 출처: 국세청(nts.go.kr) 상속세·증여세 항목별 설명, 찾기쉬운 생활법령정보(easylaw.go.kr).
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/inheritance-gift-tax/";
const UPDATED = "2026-07-03";

const SRC_GIFT = "/blog/2026-07-03-gift-tax-exemption-strategy/";
const SRC_CHILD = "/blog/2026-07-03-child-stock-account-gift/";
const SRC_HOUSE = "/guides/house-capital-gains-tax/";
const SRC_MONEY = "/money/";

const SRC_NTS = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6528&cntntsId=7956";
const SRC_HOMETAX = "https://hometax.go.kr";

const OG_TITLE =
  "상속·증여세 — 10억 공제·10년 증여 플랜 (2026)";
const OG_DESC =
  "배우자와 자녀가 있으면 10억까지 상속세 0원. 일괄공제 5억·배우자공제, 10년마다 리셋되는 증여공제로 미리 나눠 주는 절세 설계까지 한 표로 정리한 가이드.";

export const metadata: Metadata = {
  title:
    "상속·증여세 — 10억 공제·10년 증여 플랜 (2026) | 팁픽",
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

// ★ 핵심 비교표 — 상속 vs 증여
const COMPARE = [
  {
    axis: "언제",
    one: "사망으로 재산이 넘어갈 때",
    multi: "살아 있을 때 미리 주는 것",
  },
  {
    axis: "대표 공제",
    one: "일괄공제 5억 + 배우자공제 5억~30억",
    multi: "10년마다 배우자 6억·자녀 5천만·미성년 2천만",
    accent: true,
  },
  {
    axis: "세율",
    one: "10~50% (동일 누진세율)",
    multi: "10~50% (동일 누진세율)",
  },
  {
    axis: "신고 기한",
    one: "상속개시일이 속한 달 말일부터 6개월",
    multi: "증여받은 달 말일부터 3개월",
  },
  {
    axis: "절세 포인트",
    one: "공제 구조를 알고 재산 규모 파악",
    multi: "10년 주기 분산 — 빨리 시작할수록 유리",
    accent: true,
  },
];

// 상속세 공제 (DepthCard)
const INHERIT = [
  {
    k: "일괄공제 5억",
    v: "기초공제 2억 원과 자녀·연로자·장애인 등 인적공제를 항목별로 더한 금액 대신, 일괄로 5억 원을 공제받을 수 있습니다. 둘 중 큰 쪽을 선택하며, 대부분의 가정은 일괄공제 5억이 유리합니다.",
  },
  {
    k: "배우자상속공제",
    v: "배우자가 생존해 있으면 실제 상속받은 금액만큼, 최소 5억 원에서 최대 30억 원까지 공제됩니다. 배우자가 한 푼도 받지 않아도 최소 5억 원은 공제돼요.",
    accent: true,
  },
  {
    k: "'10억까지 0원'의 구조",
    v: "배우자와 자녀가 함께 상속받는 흔한 경우, 일괄공제 5억 + 배우자공제 최소 5억 = 10억 원까지는 상속세가 나오지 않습니다. 배우자 없이 자녀만 있다면 5억 원이 기준선이 됩니다.",
    accent: true,
  },
  {
    k: "신고 6개월",
    v: "상속개시일(사망일)이 속한 달의 말일부터 6개월 안에 신고·납부합니다. 기한 내 신고하면 3% 신고세액공제를 받고, 놓치면 가산세가 붙습니다.",
  },
  {
    k: "사전증여 합산 10년",
    v: "돌아가시기 전 10년 이내에 상속인(배우자·자녀)에게 증여한 재산은 상속재산에 다시 합산됩니다. 그래서 증여 플랜은 일찍 시작할수록 확실해집니다.",
  },
];

// 증여 10년 플랜 (DepthCard)
const GIFTPLAN = [
  {
    k: "10년마다 리셋",
    v: "증여재산공제는 10년 단위로 새로 생깁니다. 배우자 6억, 성인 자녀 5천만, 미성년 자녀 2천만 원씩 — 시간을 내 편으로 만들면 세금 없이 상당한 재산을 옮길 수 있습니다.",
    accent: true,
  },
  {
    k: "관계별 그룹 합산",
    v: "아버지·어머니·조부모는 모두 '직계존속' 한 그룹으로 합산됩니다. 아버지 3천만 + 어머니 3천만이면 합산 6천만으로 성인 공제(5천만)를 초과해요. 그룹 기준을 꼭 확인하세요.",
  },
  {
    k: "혼인·출산 +1억",
    v: "혼인신고 전후 2년 또는 자녀 출생 후 2년 이내에 직계존속에게 받는 증여는 기본 공제와 별도로 통합 1억 원까지 추가 공제됩니다. 결혼 전후가 가장 큰 절세 타이밍입니다.",
    accent: true,
  },
  {
    k: "미리 주면 값도 지금 값",
    v: "증여 후 그 재산이 불어난 가치 상승분은 온전히 받은 사람 몫입니다. 오를 자산일수록 미리 주는 것이 유리한 이유예요. 단, 상속 10년 합산 규정이 있으니 더더욱 빨리 시작해야 합니다.",
  },
  {
    k: "0원이어도 신고",
    v: "공제 한도 안이라 세금이 없어도 신고해 두면 자금출처 근거가 남습니다. 특히 자녀 계좌로 옮긴 돈이 불어났을 때, 신고 기록이 그 수익을 자녀 몫으로 지켜 줍니다.",
  },
];

// 세율 표 (상속·증여 공통)
const BRACKETS = [
  { base: "1억 원 이하", rate: "10%", deduct: "—" },
  { base: "5억 원 이하", rate: "20%", deduct: "1,000만 원" },
  { base: "10억 원 이하", rate: "30%", deduct: "6,000만 원" },
  { base: "30억 원 이하", rate: "40%", deduct: "1억 6,000만 원" },
  { base: "30억 원 초과", rate: "50%", deduct: "4억 6,000만 원" },
];

const FAQS = [
  {
    q: "상속재산이 10억이 안 되면 정말 세금이 없나요?",
    a: "배우자와 자녀가 함께 상속받는 일반적인 경우, 일괄공제 5억 원 + 배우자상속공제 최소 5억 원으로 10억 원까지는 상속세가 나오지 않습니다. 배우자가 없다면 일괄공제 5억 원이 기준입니다. 다만 사망 전 10년 내 사전증여가 있으면 합산되어 결과가 달라질 수 있어요.",
  },
  {
    q: "상속과 증여, 뭐가 더 유리한가요?",
    a: "재산 규모에 따라 다릅니다. 공제 범위(예: 10억) 안이라면 상속으로 받아도 세금이 없어 서두를 필요가 없습니다. 재산이 공제를 크게 넘는다면, 10년 주기 증여로 미리 나눠 세율 구간을 낮추는 쪽이 유리한 경우가 많아요. 다만 사망 전 10년 내 증여는 상속에 합산되니 일찍 시작해야 효과가 있습니다.",
  },
  {
    q: "부모님 집을 물려받으면 세금이 얼마나 나오나요?",
    a: "집도 상속재산으로 합산되며, 시가(유사 매매사례가액 등)로 평가합니다. 전체 상속재산에서 일괄공제·배우자공제 등을 뺀 과세표준에 10~50% 세율이 적용돼요. 동거 주택 상속공제(요건 충족 시 최대 6억) 같은 추가 공제도 있으니 개별 확인이 필요합니다.",
  },
  {
    q: "유산취득세로 바뀐다던데 지금 준비해야 하나요?",
    a: "정부가 상속세를 '전체 유산' 기준에서 '각자 받은 몫' 기준(유산취득세)으로 바꾸는 개편을 추진 중이지만, 2026년 현재 시행되지 않았고 확정도 아닙니다. 현행 제도(일괄공제 5억 등) 기준으로 준비하되, 개편이 확정되면 공제 구조가 달라질 수 있으니 큰 결정 전 최신 법령을 확인하세요.",
  },
  {
    q: "증여세 신고를 안 하고 지나가면요?",
    a: "공제 한도 안이면 당장 세금은 없지만 기록이 남지 않아 자금출처를 다툴 때 불리합니다. 한도를 넘긴 증여를 무신고하면 가산세(무신고 20%)에 납부지연 가산세까지 붙고, 상속 조사 때 과거 계좌이체까지 추적되는 경우가 많아요. 0원이어도 신고가 안전합니다.",
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

export default function InheritanceGiftTaxGuide() {
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
        name: "상속·증여세 가이드",
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
              2026년 기준 · 상속·증여 절세 설계
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              상속·증여세,
              <br className="hidden sm:block" /> 10억까지 0원 — 미리 설계하면 달라진다 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              상속세는 부자만의 세금이 아니게 됐습니다. 집 한 채 값이 오르면서 평범한 가정도
              공제선을 넘나들어요. 다행히 구조는 단순합니다 — <strong>배우자와 자녀가 있으면
              10억 원까지 상속세가 없고</strong>, 증여는 <strong>10년마다 공제가 새로
              생깁니다.</strong> 이 두 가지를 알고 시간을 내 편으로 만들면 세금이 크게
              달라져요. 이 글은 상속 공제 구조 → 증여 10년 플랜 → 세율 순서로 큰 그림을
              잡아 드립니다. (관계별 증여 한도는{" "}
              <Link
                href={SRC_GIFT}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                증여세 면제한도 글
              </Link>
              , 아이 계좌 실전은{" "}
              <Link
                href={SRC_CHILD}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                자녀 주식계좌 증여 글
              </Link>{" "}
              참고)
            </p>

            {/* 핵심 요약 박스 */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "상속 공제",
                  v: "10억까지 0원",
                  d: "일괄 5억 + 배우자 최소 5억",
                },
                {
                  k: "증여 공제",
                  v: "10년마다 리셋",
                  d: "배우자 6억 · 자녀 5천만 · 미성년 2천만",
                },
                {
                  k: "세율 (공통)",
                  v: "10~50%",
                  d: "과세표준 5단계 누진",
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
          {/* 1. ★ 핵심 비교표 — 상속 vs 증여 */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="상속 vs 증여 — 무엇이 다른가"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      상속 (사후)
                    </th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      증여 (생전)
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

          {/* 2. 상속세 공제 깊이 */}
          <section>
            <SectionTitle
              kicker="먼저 내 기준선부터"
              title="상속세 — 공제 구조가 전부다"
            />
            <DepthCard
              tone="indigo"
              badge="상속 공제"
              title="일괄공제 5억 + 배우자공제 = 10억의 벽"
              sub="국세청 상속세 기준 (현행 유산세 방식)"
              rows={INHERIT}
            />
          </section>

          {/* 3. 증여 10년 플랜 깊이 */}
          <section>
            <SectionTitle
              kicker="시간을 내 편으로"
              title="증여 — 10년 주기 분산 플랜"
            />
            <DepthCard
              tone="slate"
              badge="증여 플랜"
              title="10년마다 리셋되는 공제 × 빠른 시작"
              sub="증여재산공제 (10년 합산 기준)"
              rows={GIFTPLAN}
            />
          </section>

          {/* 4. 세율 표 + 계산 흐름 */}
          <section>
            <SectionTitle
              kicker="얼마를 떼나"
              title="세율 — 상속·증여 공통 10~50%"
            />
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
              산출세액 = 과세표준 × 세율 − 누진공제. 기한 내 신고하면 3% 신고세액공제를
              받습니다(상속 6개월·증여 3개월).
            </p>

            {/* 계산 흐름 */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                세금이 정해지는 순서 (상속 기준)
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                <strong>총 상속재산</strong>(부동산·예금·주식 + 사망 전 10년 내 사전증여
                합산) → <strong>− 공제</strong>(일괄 5억·배우자 5~30억 등) = 과세표준 →{" "}
                <strong>× 세율 − 누진공제</strong> = 산출세액 → <strong>− 신고세액공제
                3%</strong> = 낼 세금. 재산 평가는 시가 기준이라 아파트는 유사 매매사례가액이
                흔히 쓰입니다.
              </p>
            </div>
          </section>

          {/* 5. 한 장 체크리스트 */}
          <section>
            <SectionTitle kicker="설계 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">재산 파악</strong> — 부동산·예금·주식·보험을
                  시가로 합산해 공제선(5억/10억)과 비교했는가
                </li>
                <li>
                  <strong className="text-slate-800">공제 구조</strong> — 배우자 유무에 따라
                  기준선이 5억 vs 10억으로 달라진다
                </li>
                <li>
                  <strong className="text-slate-800">증여 시작</strong> — 공제를 크게 넘는다면
                  10년 주기 증여를 일찍 시작했는가(사망 전 10년 내 증여는 합산)
                </li>
                <li>
                  <strong className="text-slate-800">타이밍</strong> — 자녀 결혼·출산 전후
                  2년의 +1억 공제 기회를 챙겼는가
                </li>
                <li>
                  <strong className="text-slate-800">신고</strong> — 증여 3개월·상속 6개월,
                  세금 0원이어도 증여 신고로 기록을 남겼는가
                </li>
                <li>
                  <strong className="text-slate-800">증빙</strong> — 계좌이체 내역·평가 자료를
                  보관했는가(상속 조사 때 과거 이체까지 확인됨)
                </li>
              </ul>
            </div>
          </section>

          {/* 6. ⚠️ 시점 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 제도가 바뀌는 중
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                유산취득세 개편 논의 — 큰 결정 전 최신 기준 확인
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                정부가 상속세를 &lsquo;전체 유산&rsquo; 기준에서 &lsquo;상속인 각자 받은 몫&rsquo;
                기준(유산취득세)으로 바꾸는 개편을 추진하고 있습니다. 2026년 현재 시행되지
                않았고 국회 논의에 따라 내용·시기가 달라질 수 있어요. 공제 금액 상향 논의도
                진행 중입니다. 이 글은 현행 제도 기준이니, 금액이 큰 증여·상속 결정 전에는
                반드시{" "}
                <a
                  href={SRC_HOMETAX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  국세청 홈택스
                </a>
                에서 최신 법령을 확인하고 세무 전문가와 상담하시길 권합니다.
              </p>
            </div>
          </section>

          {/* 6.5 계산 예시 — 상속재산 15억 */}
          <section>
            <SectionTitle
              kicker="숫자로 확인"
              title="계산 예시 — 상속재산 15억, 배우자+자녀"
            />
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                가정: 총 상속재산 15억 · 배우자와 자녀가 함께 상속 · 사전증여 없음 · 기한 내
                신고
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">① 공제 차감</strong> — 일괄공제 5억 +
                  배우자상속공제 최소 5억 = 10억 공제 → 과세표준 15억 − 10억 ={" "}
                  <strong>5억 원</strong>
                </li>
                <li>
                  <strong className="text-slate-800">② 세율 적용</strong> — 과세표준 5억 이하
                  구간: 5억 × 20% − 누진공제 1,000만 = 산출세액 <strong>9,000만 원</strong>
                </li>
                <li>
                  <strong className="text-slate-800">③ 신고세액공제 3%</strong> — 6개월 기한 내
                  신고 시 9,000만 × 3% = 270만 원 차감 → 낼 세금 <strong>8,730만 원</strong>
                </li>
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                배우자가 실제로 5억 원 넘게 상속받으면 배우자상속공제가 그만큼 커져(최대
                30억) 세금이 더 줄어들 수 있습니다. 위 수치는 최소 공제만 적용한 가정의
                예시이며, 사망 전 10년 내 사전증여가 있으면 합산되어 결과가 달라집니다.
              </p>
            </div>
          </section>

          {/* 7. FAQ */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="상속·증여, 가장 많이 묻는 질문" />
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

          {/* 8. 관련 글 */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 가이드·글" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_GIFT}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  증여세 면제한도 활용법 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  배우자 6억·자녀 5천만·혼인 1억 — 관계별 한도와 10년 합산 규정을 표로 정리.
                </p>
              </Link>
              <Link
                href={SRC_CHILD}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  자녀 주식계좌 증여 실전 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  계좌 개설 → 이체 → 홈택스 신고까지. 미성년 2천만 비과세를 쓰는 실전 순서.
                </p>
              </Link>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              부동산을 물려받은 뒤 &lsquo;팔 때&rsquo;의 세금은{" "}
              <Link
                href={SRC_HOUSE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                집 팔 때 양도소득세 가이드
              </Link>
              에서 이어집니다.
            </p>
          </section>

          {/* 9. CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_HOMETAX}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">홈택스에서 증여세 신고·모의계산 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                hometax.go.kr · 세금신고 &gt; 증여세
              </span>
            </a>
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
              본 페이지의 공제·세율·신고 절차는 2026년 기준({UPDATED} 확인)으로 국세청 등
              공식 자료를 정리한 것입니다. 상속·증여세는 재산 평가(시가·유사 매매사례가액),
              사전증여 합산, 가족 구성 등 개별 사안에 따라 결과가 크게 달라지고, 유산취득세
              전환 등 제도 개편이 논의 중입니다. 금액이 큰 결정 전 반드시 국세청 홈택스에서
              최신 기준을 확인하고 세무 전문가와 상담하시기 바랍니다. 본 내용은 정보 제공을
              위한 것이며 세무 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국세청 상속세·증여세 항목별 설명 (
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
              <li>· 찾기쉬운 생활법령정보 — 상속세 계산 및 납부 (easylaw.go.kr)</li>
              <li>· 국세청 홈택스 증여세 신고 (hometax.go.kr)</li>
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
