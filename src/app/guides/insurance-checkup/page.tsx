import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 보험 가이드 — 내 보험 점검 완전정복 (실손 세대 × 중복 정리 × 리모델링 순서)
 *
 * ▷ 독립 정적 라우트. posts/*.md·pick-info.json 무접촉. JSX 직접 배치.
 * ▷ house-capital-gains-tax와 동일 토큰(SectionTitle·DepthCard 인라인).
 * ▷ 짝: 실손 1~5세대 글 + 보험 리모델링 글 (2026-07-11).
 * ▷ 내부 링크 전부 trailing slash + canonical (WRITING-GUIDE §4 SEO 규칙).
 *
 * [사실 검증 2026-07-11]
 * - 실손 세대: 1세대 ~2009.9(자기부담 거의 0) / 2세대 2009.10~2017.3(표준화 약 20%) /
 *   3세대 2017.4~2021.6(3대 비급여 특약) / 4세대 2021.7~2026.5(급여20·비급여30, 신규종료) /
 *   5세대 2026.5.6~(중증 비급여 연 500만 초과 보장, 비중증 자기부담 50%·연 1천만,
 *   임신·출산 급여 신규, 4세대比 약 -30%). 초기(2013.3 이전) 가입자 선택형 할인·전환 2026.11~.
 * - 실손·일상생활배상책임 = 비례보상(중복 실익 없음). 내보험찾아줌(금감원, cont.insure.or.kr) 전 계약·숨은 보험금 조회.
 * - 해지 전 대안: 특약해지·감액완납·납입유예. 새 보험 승인 확정 후 해지(보장 공백 방지).
 * 출처: 금융위원회 5세대 실손 보도자료(fsc.go.kr)·금융감독원 내보험찾아줌.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/insurance-checkup/";
const UPDATED = "2026-07-11";

const SRC_SILSON = "/blog/2026-07-11-silson-insurance-generation/";
const SRC_REMODEL = "/blog/2026-07-11-insurance-remodeling/";
const SRC_CAR = "/blog/2026-07-01-car-insurance-saving-guide/";
const SRC_MONEY = "/money/";

const SRC_FIND = "https://cont.insure.or.kr";
const SRC_FSC = "https://www.fsc.go.kr";

const OG_TITLE =
  "내 보험 점검 — 실손 세대·중복 정리·리모델링 순서 한눈에 (2026)";
const OG_DESC =
  "보험료가 부담될 때 해지부터 하면 손해. 내보험찾아줌 조회 → 실손 세대 확인 → 중복 정리 → 대안 검토 → 해지 순서로, 손해 없이 보험을 정리하는 법을 한 표로 정리한 가이드.";

export const metadata: Metadata = {
  title:
    "내 보험 점검 — 실손 세대·중복 정리·리모델링 한눈에 (2026) | 팁픽",
  description: OG_DESC,
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${SITE}${PATH}`,
    title: OG_TITLE,
    description: OG_DESC,
    images: [`${SITE}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [`${SITE}/og-image.png`],
  },
};

/* ─────────────────────────  본문 데이터  ───────────────────────── */

// ★ 핵심 비교표 — 실손 1~5세대
const COMPARE = [
  { axis: "1세대 (~2009.9)", one: "자기부담 거의 0 · 보험료 최고", multi: "원칙 유지 (단종 조건)", accent: true },
  { axis: "2세대 (2009.10~)", one: "표준화 · 자기부담 약 20%", multi: "대체로 유지" },
  { axis: "3세대 (2017.4~)", one: "3대 비급여 특약 분리", multi: "패턴 따라 판단" },
  { axis: "4세대 (2021.7~)", one: "급여 20%·비급여 30%", multi: "신규 종료 (2026.5)" },
  { axis: "5세대 (2026.5~)", one: "중증 강화 · 비중증 축소", multi: "보험료 최저 (-30%)", accent: true },
];

// 점검 순서 (DepthCard)
const STEPS = [
  {
    k: "① 전체 조회",
    v: "금융감독원 '내보험찾아줌'에서 생명·손해보험 전 계약과 찾아가지 않은 숨은 보험금을 한 번에 확인합니다. 잊고 있던 계약이 여기서 다 나옵니다.",
    accent: true,
  },
  {
    k: "② 실손 세대 확인",
    v: "실손은 가입 시기가 곧 보장 조건입니다. 1·2세대는 다시 가입할 수 없는 좋은 조건이라 원칙적으로 유지, 병원을 거의 안 가는데 보험료가 부담이면 5세대 전환을 비교해 봅니다.",
  },
  {
    k: "③ 중복 정리",
    v: "실손의료비와 일상생활배상책임은 실제 낸 비용만큼만 나눠 보상(비례보상)합니다. 두 개 들어도 두 배로 받지 못하니 하나만 남기고 정리하세요.",
    accent: true,
  },
  {
    k: "④ 우선순위 정하기",
    v: "해지 후보가 아니라 '끝까지 지킬 보장'을 먼저 정합니다 — 병력과 직결된 담보, 지금은 못 드는 옛 조건, 보험료 대비 보장이 넓은 담보 순입니다.",
  },
  {
    k: "⑤ 대안 → 해지",
    v: "보험료가 부담이면 특약만 해지·감액완납·납입유예부터 검토합니다. 그래도 해지한다면 반드시 새 보험 가입 승인이 확정된 뒤에 — 순서가 바뀌면 보장 공백이 생깁니다.",
  },
];

// 5세대 핵심 (DepthCard)
const GEN5 = [
  {
    k: "중증 비급여 강화",
    v: "상급·종합병원에서 중증질환으로 치료받을 때, 연간 본인이 부담한 중증 비급여가 500만 원을 넘으면 초과분을 보장합니다.",
    accent: true,
  },
  {
    k: "비중증 비급여 축소",
    v: "도수치료·비급여 주사 등 비중증 비급여는 자기부담률 50%, 연간 한도 1,000만 원으로 줄었습니다. 이런 진료를 자주 이용한다면 전환이 불리할 수 있어요.",
  },
  {
    k: "새로 생긴 보장",
    v: "기존 실손이 보장하지 않던 임신·출산 급여 의료비가 추가됐습니다.",
  },
  {
    k: "보험료",
    v: "4세대보다 약 30% 낮게 책정됐고, 기본계약 중심으로 구성하면 더 낮출 수 있습니다.",
  },
  {
    k: "초기 가입자 제도",
    v: "2013년 3월 이전 초기 실손 가입자는 2026년 11월부터 선택형 할인 특약·계약전환 할인 제도를 이용할 수 있습니다. 전환 전 보험사 비교안내를 꼭 확인하세요.",
    accent: true,
  },
];

const FAQS = [
  {
    q: "보험료가 부담돼요. 뭐부터 해야 하나요?",
    a: "해지가 아니라 조회부터입니다. 내보험찾아줌에서 전 계약을 확인하고, 중복 담보(실손·배상책임)를 정리한 뒤, 특약 해지·감액완납·납입유예 같은 대안을 검토하세요. 해지는 마지막 카드입니다.",
  },
  {
    q: "1세대 실손인데 갱신 보험료가 너무 올랐어요.",
    a: "1세대는 자기부담이 거의 없는 단종 조건이라 원칙적으로 유지가 유리합니다. 다만 병원 이용이 정말 적고 보험료 부담이 크다면 5세대 전환을 비교해 볼 수 있어요. 전환은 되돌릴 수 없으니 보험사의 전환 전후 비교안내를 반드시 받아 보세요.",
  },
  {
    q: "실손이 두 개인데 둘 다 유지하는 게 좋나요?",
    a: "아닙니다. 실손은 실제 낸 병원비만큼만 나눠 보상(비례보상)하므로 두 개 들어도 두 배로 받지 못합니다. 조건이 좋은 하나만 남기고 정리하는 것이 보험료를 아끼는 길입니다.",
  },
  {
    q: "설계사가 옛 보험을 깨고 새로 들라고 권해요.",
    a: "신중하세요. 기존 계약을 해지시키고 새 계약으로 갈아태우는 승환계약은 설계사 수수료 유인이 있을 수 있습니다. 전후 보장 비교표를 요구해 보장이 줄지 않는지 직접 확인하고, 병력이 있다면 새 보험 심사부터 통과된 뒤 해지하세요.",
  },
  {
    q: "숨은 보험금은 어떻게 찾나요?",
    a: "내보험찾아줌(cont.insure.or.kr)에서 본인 인증만 하면 청구하지 않은 보험금·휴면 보험금까지 조회됩니다. 조회 후 해당 보험사에 청구하면 됩니다.",
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

export default function InsuranceCheckupGuide() {
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
        name: "내 보험 점검 가이드",
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
              2026년 기준 · 보험 점검·정리
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              내 보험 점검,
              <br className="hidden sm:block" /> 해지 전에 이 순서대로 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              보험료가 부담될 때 가장 흔한 실수가 <strong>해지부터 하는 것</strong>입니다.
              중도 해지는 환급금 손해에 더해, 병력이 생겼다면 다시는 같은 보장을 가질 수 없게
              만들어요. 순서는 반대입니다 — <strong>조회 → 실손 세대 확인 → 중복 정리 → 대안
              검토 → 해지.</strong> 2026년 5월 5세대 실손 출시로 판단 기준이 달라진 부분까지,
              내 보험을 손해 없이 정리하는 전체 그림을 담았습니다. (실손 세대별 상세는{" "}
              <Link
                href={SRC_SILSON}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                실손 1~5세대 글
              </Link>
              , 정리 실전은{" "}
              <Link
                href={SRC_REMODEL}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                보험 리모델링 글
              </Link>{" "}
              참고)
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { k: "1단계", v: "내보험찾아줌", d: "전 계약·숨은 보험금 조회" },
                { k: "판단 기준", v: "실손 세대", d: "1·2세대는 원칙 유지" },
                { k: "해지", v: "마지막 카드", d: "대안(감액완납 등) 먼저" },
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
          {/* 1. 실손 세대 비교표 */}
          <section>
            <SectionTitle
              kicker="판단의 출발점"
              title="실손 1~5세대 — 내 세대부터 확인"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">세대 (판매 시기)</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">특징</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">판단</th>
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
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.multi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              공통 원칙: 오래된 세대일수록 보장이 좋고 보험료가 비싸다. 가입 시기를 모르면
              내보험찾아줌에서 확인.
            </p>
          </section>

          {/* 2. 점검 순서 */}
          <section>
            <SectionTitle
              kicker="손해 없는 순서"
              title="보험 점검 5단계 — 해지는 마지막"
            />
            <DepthCard
              tone="indigo"
              badge="점검 순서"
              title="조회 → 세대 확인 → 중복 정리 → 대안 → 해지"
              sub="금융감독원 내보험찾아줌 기준"
              rows={STEPS}
            />
          </section>

          {/* 3. 5세대 핵심 */}
          <section>
            <SectionTitle
              kicker="2026년 달라진 것"
              title="5세대 실손 — 전환 판단 포인트"
            />
            <DepthCard
              tone="slate"
              badge="5세대"
              title="중증은 두텁게, 비중증은 줄이고, 보험료는 -30%"
              sub="2026.5.6 출시 · 금융위원회"
              rows={GEN5}
            />
          </section>

          {/* 4. 체크리스트 */}
          <section>
            <SectionTitle kicker="정리 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">조회</strong> — 내보험찾아줌에서 전 계약과
                  숨은 보험금을 확인했는가
                </li>
                <li>
                  <strong className="text-slate-800">실손 세대</strong> — 내 실손이 몇 세대인지,
                  유지·전환 어느 쪽이 유리한지 비교했는가
                </li>
                <li>
                  <strong className="text-slate-800">중복</strong> — 실손·일상생활배상책임이
                  두 개 이상 아닌가(비례보상 = 하나만)
                </li>
                <li>
                  <strong className="text-slate-800">병력</strong> — 해지하려는 담보가 현재
                  병력과 연결돼 있지 않은가(재가입 불가 위험)
                </li>
                <li>
                  <strong className="text-slate-800">대안</strong> — 특약 해지·감액완납·납입유예를
                  먼저 검토했는가
                </li>
                <li>
                  <strong className="text-slate-800">순서</strong> — 새 보험 승인 확정 후에
                  옛 보험을 해지하는가(보장 공백 방지)
                </li>
              </ul>
            </div>
          </section>

          {/* 5. 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 되돌릴 수 없는 결정
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                옛 실손 해지·전환은 신중하게
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                1·2세대 실손과 병력 관련 보장은 한 번 깨면 같은 조건으로 다시 가입할 수
                없습니다. 5세대 전환도 원칙적으로 되돌릴 수 없어요. 전환·해지 전 보험사에
                <strong> 전후 비교안내</strong>를 요구해 보장 축소 폭을 확인하고, 설계사의
                갈아타기 권유(승환계약)는 수수료 유인이 없는지 따져 보세요. 제도 세부는{" "}
                <a
                  href={SRC_FSC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  금융위원회
                </a>
                 발표 자료에서 확인할 수 있습니다.
              </p>
            </div>
          </section>

          {/* 6. FAQ */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="보험 점검, 가장 많이 묻는 질문" />
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

          {/* 7. 관련 글 */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 글" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_SILSON}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  실손보험 1~5세대 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  세대별 자기부담금·보험료 차이와 유지·전환 판단 기준.
                </p>
              </Link>
              <Link
                href={SRC_REMODEL}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  보험 리모델링 실전 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  중복 정리·우선순위·감액완납 등 해지 전 대안과 순서.
                </p>
              </Link>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              자동차보험 아끼는 법은{" "}
              <Link
                href={SRC_CAR}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                자동차보험료 아끼는 법
              </Link>
              에서 이어집니다.
            </p>
          </section>

          {/* 8. CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_FIND}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">내보험찾아줌에서 전 계약 조회 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                cont.insure.or.kr · 숨은 보험금까지 무료 확인
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                보험·세금·재테크 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지는 2026년 기준({UPDATED} 확인)으로 금융위원회·금융감독원 자료를 정리한
              일반 정보이며 보험 자문이 아닙니다. 세대별 조건·전환 제도·보험료는 상품과 시점에
              따라 다르고, 해지·전환은 되돌리기 어려우므로 결정 전 각 보험사 비교안내와
              내보험찾아줌에서 본인 계약을 확인하시기 바랍니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 금융위원회 — 5세대 실손의료보험 출시 보도자료 (
                <a
                  href={SRC_FSC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  fsc.go.kr
                </a>
                )
              </li>
              <li>· 금융감독원 내보험찾아줌 (cont.insure.or.kr)</li>
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
