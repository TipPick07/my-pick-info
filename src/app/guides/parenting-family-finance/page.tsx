import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 돈 pillar 2편 — 출산 가구 주택 대출(신생아 특례 디딤돌·버팀목) 에버그린 가이드
 *
 * ▷ keyword-map-parenting §3 큐 ②(육아 금융 / C5 대출). 1편(parenting-family-benefits)과 보완관계:
 *   1편은 현금성 지원(개요), 2편은 '출산 가구 주택 대출' 하위 기둥. 1편 본문엔 대출 본문이 없어 카니발 0.
 * ▷ 독립 정적 라우트입니다. src/content/posts/*.md(블로그)도, public/data/pick-info.json(크롤링)도
 *   건드리지 않으므로 자동발행 파이프라인의 isDuplicate / dedup / 표 게이트와 충돌하지 않습니다.
 * ▷ 본문은 마크다운이 아니라 JSX로 직접 배치합니다(표 깨짐 버그 클래스 원천 차단).
 * ▷ 외부 커스텀 컴포넌트는 Header/Footer만 재사용. 요약박스·비교표·결정·FAQ는 전부 이 파일 안 인라인.
 * ▷ ★데이터 특수성: 이 주제는 복지로 크롤 비대상(금융상품)이라 pick-info에 데이터가 없습니다.
 *   모든 수치는 국토부 마이홈포털 2026년 기준으로 검증해 아래 DATA(SSOT)에 박았습니다. 갱신 시 여기만 수정.
 * ▷ 제휴(은행) 링크 없음 — 순수 정보 가이드. AffiliateBanner·광고 고리 0.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/parenting-family-finance/";
const UPDATED = "2026-06-08"; // 사실 최종 확인일

// 공식 출처 (staleness 완화 — 본문 곳곳에서 최신값 확인 링크로 사용)
const SRC_DIDIMDOL =
  "https://www.myhome.go.kr/hws/portal/cont/selectBabySpecialCaseStepStoneLoneView.do";
const SRC_BEOTIMMOK =
  "https://www.myhome.go.kr/hws/portal/cont/selectBabySpecialCaseCrutchLoneView.do";
const SRC_APPLY = "https://enhuf.molit.go.kr";

// 절대 URL로 지정 → layout의 metadataBase 유무와 무관하게 og:image가 안전하게 해석됨
const OG_IMAGE = `${SITE}/images/og/parenting-family-finance.png`;
const OG_TITLE = "출산 가구 주택 대출 — 신생아 특례 디딤돌·버팀목 한눈에 (2026)";
const OG_DESC =
  "2년 내 출산이면 시중금리 절반대로 집 구입(디딤돌)·전세(버팀목). 소득·순자산·한도·금리·특례기간을 한 표로 비교한 2026 가이드.";

export const metadata: Metadata = {
  title: "출산 가구 주택 대출 — 신생아 특례 디딤돌·버팀목 한눈에 (2026) | 팁픽",
  description:
    "대출 접수일 기준 2년 내 출산한 무주택 가구라면, 집을 살 때는 디딤돌, 전세로 들어갈 때는 버팀목으로 시중금리 절반대 대출을 받습니다. 소득·순자산·한도·금리·특례기간을 2026년 기준으로 한 페이지에 비교했습니다.",
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${SITE}${PATH}`,
    title: OG_TITLE,
    description: OG_DESC,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "출산 가구 주택 대출 신생아 특례 디딤돌·버팀목 한눈에",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESC,
    images: [OG_IMAGE],
  },
};

/* ─────────────────────────  검증된 2026 데이터 (SSOT · 국토부 마이홈포털)  ───────────────────────── */

// ★ 핵심 비교표 — 디딤돌(구입) vs 버팀목(전세)
const COMPARE = [
  { axis: "용도", didim: "주택 구입자금", beotim: "전세 보증금" },
  {
    axis: "출산 요건",
    didim: "대출 접수일 기준 2년 내 출산·입양 (2023.1.1. 이후 출생아)",
    beotim: "동일",
    span: true,
  },
  {
    axis: "소득 (부부합산)",
    didim: "1.3억 이하 (맞벌이는 각 1.3억 이하면 2억까지)",
    beotim: "동일",
    span: true,
  },
  {
    axis: "순자산",
    didim: "5.11억 이하 (가계금융복지조사 4분위)",
    beotim: "3.45억 이하 (3분위)",
    accent: true,
  },
  {
    axis: "한도",
    didim: "최고 4억 (LTV 70% · 생애최초 80%)",
    beotim: "최고 2.4억 (보증금의 80% 이내)",
  },
  { axis: "금리", didim: "1.8 ~ 4.5%", beotim: "1.3 ~ 4.3%", accent: true },
  {
    axis: "특례기간",
    didim: "기본 5년 (최장 15년)",
    beotim: "기본 4년 (최장 12년)",
  },
  {
    axis: "대상주택",
    didim: "평가액 9억 · 전용 85㎡ 이하",
    beotim: "보증금 수도권 5억 · 전용 85㎡ 이하",
  },
];

// 디딤돌(구입자금) 깊이
const DIDIMDOL = [
  { k: "대상", v: "2년 내 출산한 무주택 세대주 (혼인신고 안 해도 가능 · 미혼모·부 포함)" },
  { k: "소득", v: "부부합산 1.3억 이하 (맞벌이는 둘 다 소득이 있고 각 1.3억 이하면 2억까지)" },
  { k: "순자산", v: "5.11억 이하 — 가계금융복지조사 4분위 기준, 매년 갱신" },
  { k: "대상주택", v: "평가액 9억 이하 · 전용 85㎡ 이하 (읍·면 지역은 100㎡)" },
  {
    k: "한도",
    v: "최고 4억. LTV 70% · DTI 60%, 생애최초는 LTV 80%(수도권·규제지역은 70%)",
  },
  {
    k: "금리",
    v: "1.8 ~ 4.5% — 소득×기간 차등 고정금리(2026.1.1. 국토부 고시). 수도권 외 지방은 0.2%p 인하. 구간별 정확한 금리는 기금e든든에서 확인",
  },
  { k: "특례기간", v: "기본 5년 · 추가 출산 1명당 5년 연장 (최장 15년)" },
  {
    k: "우대금리 (중복 적용 · 최종 하한 1.2%)",
    v: "청약저축 0.3~0.5%p · 전자계약 0.1%p(~2026.12.31) · 추가출산 0.2%p/명 · 만 2세 초과 미성년 0.1%p/명 · 소액(심사액 30% 이하) 0.1%p · 중도상환 40% 이상 0.2%p",
  },
  {
    k: "의무·수수료",
    v: "1개월 내 전입 · 2년 실거주 · 1주택 유지. 중도상환수수료 면제(2024.8.12. ~ 2026.12.31.)",
  },
];

// 버팀목(전세자금) 깊이
const BEOTIMMOK = [
  { k: "대상", v: "2년 내 출산한 무주택 세대주 (디딤돌과 동일 · 혼인신고 무관)" },
  { k: "소득", v: "부부합산 1.3억 이하 (맞벌이 2억) — 디딤돌과 동일" },
  {
    k: "순자산",
    v: "3.45억 이하 — 가계금융복지조사 3분위 기준, 매년 갱신 (디딤돌보다 낮음)",
    accent: true,
  },
  {
    k: "대상주택",
    v: "전용 85㎡ 이하 (오피스텔 포함) · 임차보증금 수도권 5억 · 수도권 외 4억",
  },
  { k: "한도", v: "최고 2.4억 — 임차보증금의 80% 이내" },
  {
    k: "금리",
    v: "1.3 ~ 4.3% — 소득×보증금 차등. 구간별 정확한 금리는 기금e든든에서 확인",
  },
  { k: "특례기간", v: "기본 4년 (최장 12년)" },
  {
    k: "신청 시기",
    v: "잔금 지급일·전입일 중 빠른 날부터 3개월 이내 (갱신은 갱신일부터 3개월 이내)",
  },
];

const FAQS = [
  {
    q: "구입(디딤돌)과 전세(버팀목)를 동시에 받을 수 있나요?",
    a: "두 대출은 용도가 다릅니다 — 집을 살 때는 디딤돌(구입자금), 전세로 들어갈 때는 버팀목(전세자금)입니다. 따라서 한 가구가 같은 시점에 둘을 함께 쓰는 구조가 아니라, 주거 방식(구입/전세)에 따라 하나를 선택하게 됩니다.",
  },
  {
    q: "이미 받은 주택담보·전세대출을 신생아 특례로 갈아탈(대환) 수 있나요?",
    a: "네, 둘 다 대환(갈아타기)됩니다. 기존 주택담보대출이 있으면 신생아 특례 디딤돌로 갈아탈 수 있어요. 단, 부부합산 소득 1.3억원 초과 시 대환은 불가합니다(신규 구입의 맞벌이 2억원 완화는 대환에는 적용되지 않습니다). 대환 금액은 기존 대출 잔액을 넘을 수 없고, 소유권 이전등기 접수일로부터 3개월 이내에 신청하면 신규 대출로 취급됩니다. 전세도 기존 전세자금대출에서 신생아 특례 버팀목으로 대환할 수 있습니다. 본인의 한도·자격은 신청 전 기금e든든과 수탁은행에서 확인하세요. (2026년 기준)",
  },
  {
    q: "혼인신고를 하지 않았는데도 신청할 수 있나요?",
    a: "네. 신생아 특례는 혼인신고 여부와 무관하게, 대출 접수일 기준 2년 내에 출산·입양한 무주택 세대주이면 신청할 수 있습니다(미혼모·미혼부 포함).",
  },
  {
    q: "순자산 기준이 디딤돌과 버팀목이 다른 이유는 무엇인가요?",
    a: "두 대출의 순자산 상한이 다릅니다 — 구입자금인 디딤돌은 5.11억 이하(가계금융복지조사 4분위), 전세자금인 버팀목은 3.45억 이하(3분위)입니다. 두 기준 모두 매년 조사 결과에 따라 갱신되므로, 신청 시점의 최신 값을 마이홈포털에서 확인하세요.",
  },
  {
    q: "특례기간(디딤돌 5년·버팀목 4년)이 끝나면 금리는 어떻게 되나요?",
    a: "특례금리는 디딤돌 기본 5년·버팀목 기본 4년 적용되며(추가 출산 시 연장), 이 기간이 끝나면 일반 금리로 전환됩니다. 다만 시중금리를 그대로 적용받는 것이 아니라, 소득 구간에 따라 가산하되 하한이 있는 구조입니다. 디딤돌은 부부합산 8.5천만원, 버팀목은 7.5천만원을 경계로, 그 이하는 신혼부부 전용 디딤돌·버팀목 금리 수준으로 가산되고, 초과는 한국은행·은행연합회가 고시하는 시중은행 최저금리 중 낮은 값이 적용됩니다. 정확한 전환 금리는 종료 시점과 소득에 따라 수탁은행이 산정하니 기금e든든과 수탁은행에서 확인하세요. (2026년 기준)",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트(파일 내부 · 1편과 동일)  ───────────────────────── */

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
  const head =
    tone === "indigo" ? "bg-indigo-600" : "bg-slate-900";
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

export default function ParentingFamilyFinanceGuide() {
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
        name: "출산 가구 주택 대출 가이드",
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
              2026년 기준 · 출산 가구용
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              출산했다면, 시중금리 절반으로
              <br className="hidden sm:block" /> 집을 마련하는 두 갈래
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              대출 접수일 기준 <strong className="text-slate-800">2년 내에 출산·입양</strong>한
              무주택 가구라면, 신생아 특례로 시중금리보다 크게 낮은 기금 대출을
              받습니다. 갈림길은 하나입니다 —{" "}
              <strong className="text-slate-800">집을 사는지(디딤돌)</strong>,{" "}
              <strong className="text-slate-800">전세로 들어가는지(버팀목)</strong>.
            </p>

            {/* 핵심 요약 박스 (인라인 · 1편과 동일 패턴) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "집을 산다면",
                  v: "디딤돌",
                  d: "최고 4억 · 1.8~4.5%",
                },
                {
                  k: "전세로 간다면",
                  v: "버팀목",
                  d: "최고 2.4억 · 1.3~4.3%",
                },
                {
                  k: "공통 자격",
                  v: "2년 내 출산 · 무주택",
                  d: "부부합산 1.3억(맞벌이 2억)",
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
          {/* 1. 공통 자격 레이어 */}
          <section>
            <SectionTitle
              kicker="먼저 깔리는 공통 자격"
              title="누가 받나 — 출산 2년 내 · 무주택"
            />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <p className="text-sm leading-relaxed text-slate-700">
                디딤돌·버팀목 모두 <strong>대출 접수일 기준 2년 내에 출산·입양</strong>한
                무주택 세대주가 대상입니다. 2023년 1월 1일 이후 출생한 아이가 기준이며,
                혼인신고를 하지 않은 미혼모·미혼부도 신청할 수 있습니다.
              </p>
              <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-xs leading-relaxed text-slate-500">
                소득은 부부합산 1.3억 이하(맞벌이는 둘 다 소득이 있고 각 1.3억 이하일 때
                2억까지)입니다. 임신 중 태아는 출산 요건에 포함되지 않고, 입양아는 만 2세
                미만이어야 합니다. 취급은 기금 수탁은행(우리·신한·국민·농협·하나)이며, 상담은
                HUG 1566-9009 / 자산심사 1551-3119입니다.
              </p>
            </div>
          </section>

          {/* 2. ★ 핵심 비교표 — 디딤돌 vs 버팀목 (글의 중심) */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="디딤돌(구입) vs 버팀목(전세) (2026)"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      디딤돌 · 구입
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      버팀목 · 전세
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
                        {r.didim}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.span
                            ? "text-slate-400"
                            : r.accent
                              ? "font-medium text-indigo-700"
                              : "text-slate-600"
                        }`}
                      >
                        {r.span ? "← 동일" : r.beotim}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              ※ 모든 수치는 2026년 기준입니다. 소득구간별 정확한 금리·우대 조건은 신청 전{" "}
              <a
                href={SRC_APPLY}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 underline-offset-2 hover:underline"
              >
                기금e든든
              </a>
              과 마이홈포털에서 확인하세요.
            </p>
          </section>

          {/* 3. 디딤돌 깊이 */}
          <section>
            <SectionTitle kicker="집을 살 때" title="신생아 특례 디딤돌 (구입자금)" />
            <DepthCard
              tone="indigo"
              badge="구입자금"
              title="최고 4억 · 금리 1.8~4.5%"
              sub="2026년 기준 · 국토부 마이홈포털"
              rows={DIDIMDOL}
            />
            <p className="mt-3 text-xs text-slate-400">
              자세한 조건·금리표:{" "}
              <a
                href={SRC_DIDIMDOL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 underline-offset-2 hover:underline"
              >
                마이홈포털 신생아 특례 디딤돌
              </a>
            </p>
          </section>

          {/* 4. 버팀목 깊이 */}
          <section>
            <SectionTitle kicker="전세로 갈 때" title="신생아 특례 버팀목 (전세자금)" />
            <DepthCard
              tone="slate"
              badge="전세자금"
              title="최고 2.4억 · 금리 1.3~4.3%"
              sub="2026년 기준 · 국토부 마이홈포털"
              rows={BEOTIMMOK}
            />
            <p className="mt-3 text-xs text-slate-400">
              자세한 조건·금리표:{" "}
              <a
                href={SRC_BEOTIMMOK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 underline-offset-2 hover:underline"
              >
                마이홈포털 신생아 특례 버팀목
              </a>
            </p>
          </section>

          {/* 5. ⚠️ 시점 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 신청 전 꼭 확인
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                시점에 따라 한도가 갈립니다
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">계약일 기준 한도 차이</strong> — 2025년
                  6월 27일 <em>이전</em>에 계약한 경우 디딤돌 한도가 5억, 버팀목이 3억입니다.
                  그 이후 계약은 각각 4억 · 2.4억으로 적용됩니다.
                </li>
                <li>
                  <strong className="text-slate-800">한시 우대의 일몰</strong> — 전자계약
                  우대금리(0.1%p)와 중도상환수수료 면제는 2026년 12월 31일까지입니다.
                </li>
                <li>
                  날짜·금액·금리는 정책에 따라 바뀝니다. 신청 직전{" "}
                  <a
                    href={SRC_APPLY}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-amber-700 underline-offset-2 hover:underline"
                  >
                    기금e든든
                  </a>
                  ·마이홈포털에서 최신 값을 반드시 확인하세요.
                </li>
              </ul>
            </div>
          </section>

          {/* 6. FAQ — 네이티브 details/summary (1편과 동일) */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="부모들이 가장 많이 묻는 질문" />
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

          {/* 7. 관련 제도 (짧게 · 풀섹션 아님) */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 제도" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-900">다자녀 특별공급(청약)</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  출산·다자녀 가구는 공공·민영 분양에서 특별공급 자격이 생깁니다. 특례 대출로
                  잔금을 마련하는 동선과 함께 보면 좋습니다. (구체 요건은 청약홈에서 확인)
                </p>
              </div>
              <Link
                href="/guides/parenting-family-benefits/"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  현금성 지원 가이드 (1편) →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  아동수당·부모급여·보육료·양육수당·유아학비를 나이 × 돌봄 형태로 정리한
                  에버그린 가이드.
                </p>
              </Link>
            </div>
          </section>

          {/* 8. 발견 CTA — 1편 CTA 패턴 동일 · 제휴/은행 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_APPLY}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">기금e든든에서 신청하기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                enhuf.molit.go.kr · 디딤돌·버팀목 대출 신청
              </span>
            </a>
            <Link
              href="/benefits/"
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">
                정부 지원금 전체 보기 →
              </span>
              <span className="mt-1 text-xs text-slate-500">
                부모를 위한 지원금 모음
              </span>
            </Link>
          </section>

          {/* 면책 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 금액·기준·금리는 2026년 기준({UPDATED} 확인)으로 국토교통부 마이홈포털
              자료를 정리한 것입니다. 정책과 대출 조건·금리는 수시로 바뀌며 소득구간·계약일에 따라
              달라질 수 있으니, 신청 전 기금e든든(enhuf.molit.go.kr)과 마이홈포털에서 최신 기준을
              반드시 확인하시기 바랍니다. 본 내용은 정보 제공을 위한 것이며 특정 금융상품 가입을
              권유하지 않습니다. 출처: 국토교통부 마이홈포털 · 주택도시기금.
            </p>
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
