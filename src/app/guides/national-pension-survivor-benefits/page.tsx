import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 노후·연금 가이드 — 국민연금 유족급여 (유족연금·반환일시금·사망일시금 세 갈래)
 *
 * ▷ 2026-08-06 A형 클러스터: 경제 글 "미청구 국민연금 — 시효가 5년인 것과 10년인 것"의 짝 허브.
 *   역할 분리 — 글 = 본인이 못 받고 지나가는 돈(시효·일시금 vs 연금) / 가이드 = 사망했을 때 유족이 받는 갈래.
 * ▷ 독립 정적 라우트. 데이터층 무접촉.
 * ▷ 본문은 JSX로 직접 배치. 외부 커스텀 컴포넌트는 Header/Footer만.
 *
 * [사실 검증 2026-08-06 — 국민연금공단·보건복지부]
 * - 유족연금 지급 요건(사망자 기준): 노령연금수급권자 / 가입기간 10년 이상 가입자 /
 *   장애등급 2급 이상 장애연금 수급자 / 2016.11.30 이후 사망자는 연금보험료를 낸 기간이
 *   가입대상기간의 1/3 이상인 가입자 또는 사망일 5년 전부터 3년 이상 보험료를 낸 자.
 * - 유족 범위·순위: 배우자(사실혼 포함) > 자녀(25세 미만 또는 장애 2급 이상) >
 *   부모(60세 이상 또는 장애 2급 이상) > 손자녀 > 조부모. 최우선 순위자에게 지급.
 * - 지급률: 가입기간 10년 미만 40% / 10년 이상 20년 미만 50% / 20년 이상 60%.
 *   부양가족연금액 배우자 월 25,550원, 자녀·부모 월 17,030원.
 * - 중복급여 조정: 동일 사유로 근로기준법·산재보험법 등 유족보상을 받으면 유족연금의 1/2 지급.
 * - 반환일시금: 유족연금 요건이 안 되는 사망 시. 낸 보험료 + 이자(2026년 3년만기 정기예금 2.2%).
 * - 사망일시금: 유족연금·반환일시금을 받을 유족이 없을 때 더 넓은 범위(배우자·자녀·부모·손자녀·
 *   조부모·형제자매 또는 생계를 유지하던 4촌 이내 방계혈족) 최우선순위자에게.
 *   금액은 반환일시금 상당액이되 최종기준소득월액 또는 가입 중 기준소득월액 평균액 중
 *   많은 금액의 4배를 초과할 수 없음. ※ 지급 대상 범위는 개정 논의가 있어 청구 전 공단 확인 필요.
 * - 청구권 소멸시효 5년(반환일시금 중 지급연령 도달 사유만 10년, 2018.1.25 이후).
 * 출처: 국민연금공단(nps.or.kr), 보건복지부.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/national-pension-survivor-benefits/";
const UPDATED = "2026-08-06"; // 사실 최종 확인일

// 내부 루프 링크
const SRC_POST = "/blog/2026-08-06-unclaimed-national-pension/"; // 클러스터 짝 글
const SRC_BOOST = "/blog/2026-07-21-national-pension-boost-strategies/"; // 국민연금 더 받는 법
const SRC_PILLAR = "/guides/three-pillar-pension/"; // 노후 3층 연금
const SRC_HIDDEN = "/blog/2026-08-03-hidden-money-refund-deadline/"; // 숨은 내 돈 찾기
const SRC_BASIC = "/blog/2026-06-28-basic-pension-guide/"; // 기초연금
const SRC_MONEY = "/money/";

// 공식 출처
const SRC_NPS = "https://www.nps.or.kr"; // 국민연금공단

const OG_TITLE = "국민연금 유족급여 — 세 갈래 중 무엇을 받나 (2026)";
const OG_DESC =
  "가입자가 사망하면 유족연금·반환일시금·사망일시금 중 하나로 갈립니다. 요건과 순위, 가입기간별 지급률 40~60%, 중복급여 조정까지 정리한 가이드.";

export const metadata: Metadata = {
  title: "국민연금 유족급여 가이드 — 세 갈래 중 무엇을 받나 | 팁픽",
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

// ★ 세 갈래 비교 (이 가이드의 중심 표)
const BRANCHES = [
  {
    name: "유족연금",
    when: "유족연금 요건을 갖춘 유족이 있을 때",
    who: "배우자 → 자녀 → 부모 → 손자녀 → 조부모 중 최우선 순위자",
    amount: "기본연금액의 40~60% + 부양가족연금액",
    form: "매월 평생(수급 요건 유지 시)",
    accent: true,
  },
  {
    name: "반환일시금",
    when: "유족연금 요건은 안 되지만 유족이 있을 때",
    who: "배우자·자녀·부모·손자녀·조부모 순",
    amount: "낸 보험료 + 이자(2026년 연 2.2%)",
    form: "한 번에 일시금",
  },
  {
    name: "사망일시금",
    when: "위 둘을 받을 유족이 아무도 없을 때",
    who: "형제자매·생계를 유지하던 4촌 이내 방계혈족까지 확대",
    amount: "반환일시금 상당액 (기준소득월액 4배 한도)",
    form: "한 번에 일시금",
    accent: true,
  },
];

// 유족연금 지급 요건 (DepthCard)
const ELIGIBILITY = [
  {
    k: "사망자가 누구였나",
    v: "노령연금 수급권자, 가입기간 10년 이상인 가입자, 장애등급 2급 이상의 장애연금 수급자 중 하나에 해당해야 합니다. 즉 유족연금은 '얼마나 오래 냈는가'가 먼저 걸리는 급여입니다.",
    accent: true,
  },
  {
    k: "10년이 안 돼도 되는 길",
    v: "2016년 11월 30일 이후 사망자라면, 연금보험료를 낸 기간이 가입대상기간의 3분의 1 이상이거나, 사망일 5년 전부터 3년 이상 보험료를 낸 경우에도 요건을 갖춥니다. 가입기간이 짧아 포기하기 전에 이 두 경로를 먼저 확인하세요.",
    accent: true,
  },
  {
    k: "유족의 요건",
    v: "배우자는 사실혼 포함, 자녀는 25세 미만이거나 장애등급 2급 이상, 부모는 60세 이상이거나 장애등급 2급 이상이어야 합니다. 손자녀·조부모도 각각 연령·장애 요건이 있습니다. 요건을 갖춘 사람 중 최우선 순위자 한 명에게 지급됩니다.",
  },
  {
    k: "생계 유지 관계",
    v: "유족연금은 사망자에 의해 생계를 유지하고 있던 유족에게 지급하는 급여입니다. 따로 살고 있었다면 생계 유지 관계를 어떻게 볼지가 쟁점이 될 수 있으니, 사실관계를 정리해 공단에 문의하는 편이 빠릅니다.",
  },
];

// 금액이 정해지는 방식 (DepthCard)
const AMOUNT = [
  {
    k: "가입기간이 비율을 정한다",
    v: "사망자의 가입기간이 10년 미만이면 기본연금액의 40%, 10년 이상 20년 미만이면 50%, 20년 이상이면 60%입니다. 본인의 노령연금뿐 아니라 남은 가족이 받을 비율까지 가입기간이 결정합니다.",
    accent: true,
  },
  {
    k: "부양가족연금액이 더해진다",
    v: "유족연금에는 부양가족연금액이 함께 붙습니다. 배우자 월 25,550원, 자녀·부모 월 17,030원 수준입니다. 금액 자체는 크지 않지만 정액이라 연금이 적을수록 체감 비중이 커집니다.",
  },
  {
    k: "중복되면 절반으로",
    v: "같은 사유로 근로기준법이나 산업재해보상보험법 등에 따른 유족보상을 받는 경우 유족연금은 절반만 지급됩니다. 산재로 사망한 경우가 대표적이니, 두 제도를 함께 신청할 때 미리 알고 계셔야 합니다.",
    accent: true,
  },
  {
    k: "본인 연금과 겹칠 때",
    v: "유족연금 수급자가 본인의 노령연금도 받게 되면 둘 다 온전히 받지는 못합니다. 하나를 선택하거나 일부만 더해지는 방식으로 조정되므로, 어느 쪽이 유리한지는 금액을 비교해 결정해야 합니다. 공단에서 두 경우의 금액을 모두 산출해 줍니다.",
  },
];

const FAQS = [
  {
    q: "재혼하면 유족연금이 끊기나요?",
    a: "배우자가 재혼하면 유족연금 수급권이 소멸합니다. 이때 다음 순위자에게 자동으로 넘어가는 것은 아니고, 자녀 등 다른 유족이 있다면 별도의 요건과 절차를 따집니다. 반대로 사실혼 관계는 혼인신고를 하지 않았더라도 유족 범위에 포함되므로, 사실혼을 입증할 자료를 준비해 청구할 수 있습니다. 재혼·이혼 등 신분 변동이 생기면 공단에 신고해야 하며, 신고하지 않고 받은 금액은 나중에 환수될 수 있습니다.",
  },
  {
    q: "자녀가 25세가 되면 어떻게 되나요?",
    a: "자녀 수급권은 25세에 도달하면 소멸합니다(장애등급 2급 이상이면 계속). 배우자가 받고 있는 경우에도 부양가족연금액 대상에서 빠지므로 그만큼 금액이 줄어듭니다. 미리 시점을 알아 두면 가계 계획을 세울 때 도움이 됩니다. 손자녀·조부모도 각각 연령 요건이 있어 같은 구조로 소멸합니다.",
  },
  {
    q: "이혼한 배우자도 받을 수 있나요?",
    a: "유족연금은 사망 당시의 배우자에게 지급되므로 이미 이혼한 전 배우자는 대상이 아닙니다. 다만 혼인 기간이 5년 이상이었다면 본인 몫의 분할연금을 청구할 수 있는데, 이는 유족연금과 별개의 제도이고 청구 시효도 3년으로 더 짧습니다. 이혼 후 연금 문제는 사망과 무관하게 별도로 챙기셔야 합니다.",
  },
  {
    q: "사망일시금은 형제자매도 받나요?",
    a: "사망일시금은 유족연금이나 반환일시금을 받을 유족이 아무도 없을 때 지급하는 장제부조 성격의 급여로, 배우자·자녀·부모·손자녀·조부모에 더해 형제자매, 그리고 사망자에 의해 생계를 유지하던 4촌 이내 방계혈족까지 범위가 넓습니다. 다만 이 지급 대상 범위는 제도 개정 논의가 있으므로, 실제 청구 전에 국민연금공단에서 현재 기준을 확인하시기 바랍니다. 금액은 반환일시금에 상당하는 금액이되 기준소득월액의 4배를 넘지 못합니다.",
  },
  {
    q: "언제까지 청구해야 하나요?",
    a: "유족연금·반환일시금·사망일시금 모두 원칙적으로 수급권이 발생한 때부터 5년입니다. 장례를 치르고 정신이 없는 사이 몇 년이 지나가는 경우가 실제로 있습니다. 유족연금은 청구한 달 이전 몫도 소급해 받을 수 있지만 5년을 넘는 부분은 받지 못하므로, 늦어질수록 손해가 누적됩니다. 예외적으로 반환일시금 중 지급연령 도달 사유만 10년이 적용됩니다.",
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

export default function NationalPensionSurvivorBenefitsGuide() {
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
        name: "국민연금 유족급여 가이드",
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
              2026년 기준 · 노후·연금
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              국민연금 유족급여 —
              <br className="hidden sm:block" /> 세 갈래 중 무엇을 받나
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              가입자가 사망하면 <strong>유족연금·반환일시금·사망일시금</strong> 중 하나로 갈립니다.
              셋을 함께 받는 게 아니라 <strong>요건을 따라 하나만</strong> 정해지는 구조예요. 어느
              갈래인지에 따라 매월 평생 받을 수도, 한 번에 끝날 수도 있습니다.
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              갈림길을 만드는 건 대부분 <strong>사망자의 가입기간</strong>입니다. 본인이 살아 있을
              때 못 받고 지나가는 돈과 청구 시효는{" "}
              <Link
                href={SRC_POST}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                미청구 국민연금 글
              </Link>
              에 따로 정리했습니다.
            </p>

            {/* 핵심 요약 박스 */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { k: "갈림길 기준", v: "가입기간", d: "10년이 경계" },
                { k: "유족연금 지급률", v: "40~60%", d: "가입기간에 따라" },
                { k: "청구 기한", v: "5년", d: "장례 뒤 잊기 쉬움" },
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
          {/* 1. ★ 세 갈래 비교 (중심 표) */}
          <section>
            <SectionTitle
              kicker="먼저 갈래부터"
              title="셋 중 하나로 정해집니다"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              위에서부터 요건을 따져 내려가 <strong className="text-slate-800">먼저 걸리는 것 하나</strong>로
              정해집니다. 유족연금이 되면 그 아래는 보지 않습니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">갈래</th>
                    <th className="px-4 py-3 font-semibold">언제</th>
                    <th className="px-4 py-3 font-semibold">누가</th>
                    <th className="px-4 py-3 font-semibold">금액</th>
                    <th className="px-4 py-3 font-semibold">형태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BRANCHES.map((b) => (
                    <tr key={b.name} className="align-top">
                      <td
                        className={`px-4 py-3 font-semibold ${
                          b.accent ? "text-indigo-700" : "text-slate-700"
                        }`}
                      >
                        {b.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.when}</td>
                      <td className="px-4 py-3 text-slate-500">{b.who}</td>
                      <td className="px-4 py-3 text-slate-600">{b.amount}</td>
                      <td className="px-4 py-3 text-slate-500">{b.form}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. 유족연금 요건 */}
          <section>
            <SectionTitle
              kicker="첫 번째 관문"
              title="유족연금이 되느냐부터 갈립니다"
            />
            <DepthCard
              tone="indigo"
              badge="지급 요건"
              title="가입기간 10년이 기본, 그런데 우회로가 있다"
              sub="10년이 안 돼도 두 가지 경로로 요건을 갖출 수 있다"
              rows={ELIGIBILITY}
            />
          </section>

          {/* 3. 금액 결정 방식 */}
          <section>
            <SectionTitle
              kicker="얼마를 받나"
              title="비율·부양가족·중복 조정 세 가지가 금액을 만든다"
            />
            <DepthCard
              tone="slate"
              badge="금액 산정"
              title="가입기간이 40%와 60%를 가른다"
              sub="기본연금액 100만 원이면 월 40만 vs 60만 원"
              rows={AMOUNT}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              가입기간을 늘리는 방법(추납·크레딧·임의계속가입)은{" "}
              <Link
                href={SRC_BOOST}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                국민연금 더 받는 법
              </Link>
              에 정리해 두었습니다. 본인 연금뿐 아니라 남은 가족의 유족연금 비율까지 함께
              올라갑니다.
            </p>
          </section>

          {/* 4. 청구 체크리스트 */}
          <section>
            <SectionTitle kicker="사망 후 할 일" title="유족이 챙겨야 할 6가지" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">가입 이력 확인</strong> — 사망자의 가입기간이
                  몇 개월인지 공단에서 확인했나 (10년 경계가 지급률을 가릅니다)
                </li>
                <li>
                  <strong className="text-slate-800">갈래 판정</strong> — 유족연금·반환일시금·사망일시금
                  중 어디에 해당하는지 확인했나
                </li>
                <li>
                  <strong className="text-slate-800">순위 확인</strong> — 유족 중 최우선 순위자가
                  누구인지, 요건(연령·장애)을 갖췄는지 정리했나
                </li>
                <li>
                  <strong className="text-slate-800">중복 여부</strong> — 산재보험 등 다른 유족보상을
                  받는지 확인했나 (받으면 유족연금은 절반)
                </li>
                <li>
                  <strong className="text-slate-800">본인 연금과 비교</strong> — 이미 노령연금을 받고
                  있다면 어느 쪽이 유리한지 공단에서 두 금액을 받아 봤나
                </li>
                <li>
                  <strong className="text-slate-800">기한</strong> — 사망일로부터 5년이 지나가고 있지
                  않나
                </li>
              </ul>
            </div>
          </section>

          {/* 5. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 장례 뒤 가장 놓치기 쉬운 것
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                청구하지 않으면 5년 뒤 사라집니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                유족급여는 <strong>공단이 알아서 넣어 주는 돈이 아니라 청구해야 나오는 돈</strong>입니다.
                장례와 상속 정리를 하는 사이 몇 년이 지나가는 경우가 실제로 있습니다. 유족연금은 청구
                전 기간도 소급해 받을 수 있지만 5년을 넘는 부분은 받지 못하므로, 늦어질수록 손해가
                쌓입니다. 사망 신고를 마쳤다면 국민연금공단(국번없이 1355)에 유족급여 대상인지부터
                물어보세요. 다른 기관에 흩어진 돈은{" "}
                <Link
                  href={SRC_HIDDEN}
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  숨은 내 돈 찾기
                </Link>
                에 창구별로 정리해 두었습니다.
              </p>
            </div>
          </section>

          {/* 6. FAQ */}
          <section>
            <SectionTitle
              kicker="가족 상황별"
              title="재혼하면? 자녀가 크면? — 실제로 갈리는 경우"
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

          {/* 7. 관련 가이드·글 */}
          <section>
            <SectionTitle kicker="이어서 보기" title="연금, 나머지 궁금한 것들" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_POST}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  미청구 국민연금, 시효 5년과 10년 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  이 가이드의 짝 — 반환일시금 이자와 일시금·연금 갈림길 계산.
                </p>
              </Link>
              <Link
                href={SRC_BOOST}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  국민연금 더 받는 법 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  추납·크레딧·임의계속가입으로 가입기간 늘리기.
                </p>
              </Link>
              <Link
                href={SRC_PILLAR}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  노후 3층 연금 한눈에 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  국민·퇴직·개인연금 전체 뼈대 잡기.
                </p>
              </Link>
              <Link
                href={SRC_BASIC}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  기초연금 받는 법 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  국민연금이 적을 때 함께 보는 제도.
                </p>
              </Link>
            </div>
          </section>

          {/* 8. 발견 CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_NPS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">국민연금공단에서 확인하기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                가입내역·예상연금 조회 · 전화 상담은 국번없이 1355
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                연금·세금·예금·내집마련 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 지급 요건·지급률·유족 범위는 국민연금공단 안내와 국민연금법({UPDATED} 확인)
              기준입니다. 부양가족연금액은 매년 조정되고, 생계 유지 관계나 사실혼 인정 여부는 개별
              사정에 따라 판단이 달라집니다. 사망일시금의 지급 대상 범위는 제도 개정 논의가 있으므로
              청구 전 확인이 필요합니다. 본 내용은 정보 제공을 위한 것이며, 구체적인 수급 자격과
              금액은 국민연금공단(국번없이 1355)에서 본인 자료로 확인하시기 바랍니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국민연금공단 — 유족연금·반환일시금·사망일시금 안내 (
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
              <li>· 보건복지부 — 국민연금 급여 정책 안내</li>
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
