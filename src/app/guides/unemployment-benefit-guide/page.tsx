import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 고용/취업 가이드 — 실업급여·고용보험 완전정복
 *
 * ▷ 흩어진 고용 관련 제도(구직급여·국민취업지원제도·국민내일배움카드)를 한 허브로 묶는 첫 '고용·취업' 가이드.
 * ▷ 독립 정적 라우트입니다. src/content/posts/*.md(블로그)도, public/data/pick-info.json(크롤링)도
 *   건드리지 않으므로 자동발행 파이프라인과 충돌하지 않습니다.
 * ▷ 본문은 마크다운이 아니라 JSX로 직접 배치합니다(표 깨짐 방지). 외부 컴포넌트는 Header/Footer만 재사용,
 *   SectionTitle·DepthCard·표·FAQ는 house-capital-gains-tax와 동일 토큰으로 파일 내부 인라인.
 *
 * [사실 검증 2026-07-01]
 * - 수급조건: 이직일 이전 18개월간 피보험단위기간 180일 이상 + 비자발적 이직(또는 정당한 사유의 자발적 이직) + 근로의사·능력 + 적극적 재취업활동.
 * - 1일 구직급여 = 퇴직 전 3개월 평균임금 × 60%. 2026년(이직일 1/1 이후) 1일 상한 68,100원(임금일액 상한 113,500원 × 60%), 하한 66,048원(최저임금 10,320원 × 80% × 8h).
 * - 소정급여일수 120~270일(연령 50세 기준·가입기간별). 수급기간은 이직 다음 날부터 12개월.
 * - 국민취업지원제도 1유형 구직촉진수당 월 60만원(2026 인상)×6개월(최대 1년)+부양가족 1인 10만(최대 4명). 만 15~69세, 1유형 중위소득 60% 이하.
 * - 국민내일배움카드: 5년 300만~500만원 직업훈련비(별도 글로 연결).
 * 출처: 고용노동부·고용보험(ei.go.kr)·고용24(work24.go.kr), 2026 구직급여 상·하한액 조정, 국민취업지원제도 안내.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/unemployment-benefit-guide/";
const UPDATED = "2026-07-01"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_CARD = "/blog/2026-07-01-national-tomorrow-learning-card/"; // 내일배움카드(짝 글)
const SRC_YOUTH = "/guides/youth-support-guide/"; // 국민취업지원 포함 청년 허브
const SRC_LEAVE = "/tools/annual-leave-allowance/"; // 퇴직 시 미사용 연차수당
const SRC_BENEFITS = "/benefits/";

// 공식 출처 (staleness 완화 — 최신값 확인 링크)
const SRC_EI = "https://www.ei.go.kr"; // 고용보험 실업급여
const SRC_WORK24 = "https://www.work24.go.kr"; // 고용24 신청

const OG_TITLE =
  "실업급여·고용보험 완전정복 — 수급조건·금액·지급일수 (2026)";
const OG_DESC =
  "고용보험 180일·비자발 이직이면 평균임금 60%(1일 상한 68,100·하한 66,048원)를 120~270일 받는 실업급여. 국민취업지원제도·내일배움카드까지 한 표로 묶은 가이드.";

export const metadata: Metadata = {
  title:
    "실업급여·고용보험 완전정복 — 수급조건·금액·지급일수 한눈에 (2026) | 팁픽",
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

/* ─────────────────────────  본문 데이터 (SSOT · 페이지 본문 그대로)  ───────────────────────── */

// ★ 핵심 비교표 — 세 제도 한눈에 (허브)
const COMPARE = [
  {
    axis: "성격",
    a: "실직자 소득 보전",
    b: "저소득 구직자 취업지원",
    c: "직업훈련비 지원",
    accent: true,
  },
  {
    axis: "누구에게",
    a: "고용보험 가입 후 비자발 실직",
    b: "미취업 저소득 구직자(15~69세)",
    c: "국민 누구나(일부 제외)",
  },
  {
    axis: "무엇을 주나",
    a: "평균임금 60% (1일 상한 68,100원)",
    b: "구직촉진수당 월 60만원(1유형)",
    c: "5년 300만~500만원 훈련비",
    accent: true,
  },
  {
    axis: "핵심 조건",
    a: "가입 180일 + 비자발 + 재취업활동",
    b: "중위소득 60% 이하 등",
    c: "발급 후 5년 내 사용",
  },
];

// 구직급여 수급조건 (DepthCard)
const ELIG = [
  {
    k: "① 고용보험 180일",
    v: "이직일 이전 18개월(기준기간) 동안 보수를 받은 날이 통산 180일 이상이어야 합니다. 무급 휴일은 빠지므로 실제로는 약 7~8개월 이상 일해야 채워지는 경우가 많습니다.",
  },
  {
    k: "② 비자발적 이직",
    v: "폐업·해고·계약만료·권고사직처럼 내 뜻과 무관하게 그만둔 경우가 원칙입니다. 스스로 그만두면 원칙적으로 안 되지만, 임금체불·직장 내 괴롭힘·질병·왕복 3시간 이상 통근 곤란 등 '정당한 사유'는 예외로 인정됩니다.",
    accent: true,
  },
  {
    k: "③ 근로 의사·능력",
    v: "일할 수 있고 일할 의사가 있는데 아직 취업하지 못한 상태여야 합니다. 창업 준비나 학업에만 전념하는 경우는 해당하지 않습니다.",
  },
  {
    k: "④ 적극적 재취업활동",
    v: "실업인정일마다 입사지원·면접·직업훈련 같은 재취업 노력을 증빙해야 다음 급여가 나옵니다. 활동 없이 자동으로 계속 지급되지 않습니다.",
  },
];

// 지급액·기간 (DepthCard)
const AMOUNT = [
  {
    k: "1일 지급액",
    v: "퇴직 전 3개월간 1일 평균임금의 60%입니다.",
  },
  {
    k: "1일 상한액",
    v: "68,100원(2026년 1월 1일 이후 이직 기준). 임금이 아무리 높아도 이 금액을 넘지 않습니다.",
    accent: true,
  },
  {
    k: "1일 하한액",
    v: "66,048원(2026년 최저임금 10,320원의 80% × 8시간). 임금이 낮아도 이 밑으로는 내려가지 않습니다.",
    accent: true,
  },
  {
    k: "소정급여일수",
    v: "나이와 고용보험 가입기간에 따라 120~270일입니다(아래 표 참고).",
  },
  {
    k: "받을 수 있는 기간",
    v: "이직한 다음 날부터 12개월 안에서만 지급됩니다. 늦게 신청하면 소정급여일수가 남아 있어도 그만큼 못 받으니, 퇴사 후 바로 신청하세요.",
    accent: true,
  },
];

// 소정급여일수 표 (연령·가입기간별)
const DAYS = [
  { join: "1년 미만", under: "120일", over: "120일" },
  { join: "1년 ~ 3년 미만", under: "150일", over: "180일" },
  { join: "3년 ~ 5년 미만", under: "180일", over: "210일" },
  { join: "5년 ~ 10년 미만", under: "210일", over: "240일" },
  { join: "10년 이상", under: "240일", over: "270일" },
];

const FAQS = [
  {
    q: "자발적으로 퇴사해도 실업급여를 받을 수 있나요?",
    a: "원칙적으로는 받을 수 없습니다. 다만 임금체불, 직장 내 괴롭힘, 질병으로 일을 계속하기 어려운 경우, 왕복 3시간 이상으로 통근이 곤란해진 경우, 가족 간병 등 '정당한 사유'가 인정되면 예외적으로 받을 수 있습니다. 이 경우 사유를 뒷받침할 증빙(진단서·통근경로·회사 자료 등)이 중요합니다.",
  },
  {
    q: "계약직인데 계약이 끝났어요. 받을 수 있나요?",
    a: "계약기간 만료는 본인 의사와 무관한 이직으로 보아 수급이 가능한 경우가 많습니다. 다만 회사가 재계약을 제안했는데 근로자가 거부한 정황 등이 있으면 달리 판단될 수 있으니, 고용센터에서 이직사유를 확인받으세요.",
  },
  {
    q: "아르바이트·단기 근무도 고용보험이 되나요?",
    a: "주 15시간 미만 초단시간이라도 일정 요건을 갖추면 고용보험에 가입됩니다. 여러 직장의 가입기간을 합산해 피보험단위기간 180일을 채우면 수급 대상이 될 수 있습니다. 내 가입 이력은 고용보험 홈페이지에서 확인할 수 있습니다.",
  },
  {
    q: "실업급여를 받으면서 직업훈련을 들어도 되나요?",
    a: "됩니다. 오히려 국민내일배움카드로 듣는 직업훈련은 재취업활동으로 인정되어, 실업인정에도 도움이 됩니다. 배우면서 소득 공백을 줄이는 조합이라 함께 활용하는 경우가 많습니다.",
  },
  {
    q: "고용보험 가입 이력이 없어요. 방법이 없나요?",
    a: "고용보험 밖에 있는 구직자를 위한 제도가 국민취업지원제도입니다. 1유형에 해당하면 구직촉진수당을 월 60만원씩(부양가족이 있으면 최대 월 100만원) 받으면서 취업지원 서비스를 받을 수 있습니다. 소득·재산 요건이 있으니 고용24에서 확인하세요.",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트(파일 내부 · house와 동일)  ───────────────────────── */

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

export default function UnemploymentBenefitGuide() {
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
        name: "실업급여·고용보험 완전정복",
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
              2026년 기준 · 구직급여 + 취업지원
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              실업급여, 얼마를 며칠 받고
              <br className="hidden sm:block" /> 어떻게 신청할까 — 한눈에 정리 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              실업급여는 &lsquo;위로금&rsquo;이 아니라 <strong>다시 일자리를 찾는 동안의 소득을 메워 주는 제도</strong>입니다.
              그래서 <strong>고용보험 가입 180일</strong>과 <strong>비자발적 이직</strong>, 그리고 <strong>재취업 노력</strong>이라는
              조건이 붙습니다. 이 글은 수급조건 → 얼마·며칠 → 신청 순서로 짚고, 고용보험 밖 구직자를 위한
              국민취업지원제도와 배우면서 준비하는 국민내일배움카드까지 한 번에 묶었습니다. (퇴직할 때 함께 챙길
              미사용 연차수당은{" "}
              <Link
                href={SRC_LEAVE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                연차수당 계산기
              </Link>
              로 계산해 볼 수 있어요.)
            </p>

            {/* 핵심 요약 박스 */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "수급조건",
                  v: "고용보험 180일",
                  d: "+ 비자발 이직 + 재취업활동",
                },
                {
                  k: "1일 지급액",
                  v: "평균임금 60%",
                  d: "상한 68,100 · 하한 66,048원",
                },
                {
                  k: "지급일수",
                  v: "120~270일",
                  d: "나이 · 가입기간에 따라",
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
          {/* 1. ★ 핵심 비교표 — 세 제도 */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="실업급여 · 국민취업지원 · 내일배움카드"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      실업급여(구직급여)
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      국민취업지원제도
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      국민내일배움카드
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
                        {r.a}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.b}</td>
                      <td className="px-4 py-3 text-slate-600">{r.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              고용보험에 가입돼 있었다면 <strong>실업급여</strong>, 가입 이력이 없거나 저소득 구직자라면{" "}
              <strong>국민취업지원제도</strong>가 출발점입니다. 어느 쪽이든{" "}
              <Link
                href={SRC_CARD}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                국민내일배움카드
              </Link>
              로 훈련을 병행할 수 있습니다.
            </p>
          </section>

          {/* 2. 수급조건 */}
          <section>
            <SectionTitle
              kicker="이 네 가지를 모두"
              title="실업급여 수급조건 — 180일 · 비자발 · 재취업활동"
            />
            <DepthCard
              tone="indigo"
              badge="수급조건"
              title="고용보험 180일 + 비자발적 이직 + 재취업 노력"
              sub="고용노동부 구직급여 기준"
              rows={ELIG}
            />
          </section>

          {/* 3. 지급액·기간 */}
          <section>
            <SectionTitle
              kicker="얼마를 며칠"
              title="지급액과 기간 — 평균임금 60%, 120~270일"
            />
            <DepthCard
              tone="slate"
              badge="지급액"
              title="1일 평균임금 60% (상한 68,100 · 하한 66,048원)"
              sub="2026년 이직 기준"
              rows={AMOUNT}
            />

            {/* 소정급여일수 표 */}
            <p className="mt-8 mb-3 text-sm font-semibold text-slate-700">
              소정급여일수 (퇴직 당시 나이 · 고용보험 가입기간 기준)
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">가입기간</th>
                    <th className="px-4 py-3 font-semibold">50세 미만</th>
                    <th className="px-4 py-3 font-semibold">50세 이상 · 장애인</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DAYS.map((d) => (
                    <tr key={d.join}>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {d.join}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{d.under}</td>
                      <td className="px-4 py-3 text-slate-600">{d.over}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 신청 흐름 */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                신청은 이 순서로
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                <strong>워크넷(고용24) 구직등록</strong> →{" "}
                <strong>수급자격 신청자 온라인 교육</strong> 이수 →{" "}
                <strong>거주지 고용센터 방문</strong>해 수급자격 인정신청 →{" "}
                <strong>실업인정</strong>(1~4주 단위로 재취업활동 증빙) → 지급. 회사가
                &lsquo;이직확인서&rsquo;와 고용보험 자격상실 신고를 처리해야 신청이 진행되니,
                퇴사할 때 함께 요청해 두면 빠릅니다.
              </p>
            </div>
          </section>

          {/* 4. 체크리스트 */}
          <section>
            <SectionTitle kicker="신청 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">가입기간</strong> — 피보험단위기간
                  180일을 채웠는가(여러 직장 합산 가능)
                </li>
                <li>
                  <strong className="text-slate-800">이직사유</strong> — 비자발적 이직 또는
                  정당한 사유의 자발적 이직인가
                </li>
                <li>
                  <strong className="text-slate-800">서류</strong> — 회사가 이직확인서 ·
                  자격상실 신고를 제출했는가
                </li>
                <li>
                  <strong className="text-slate-800">등록·교육</strong> — 워크넷 구직등록 +
                  수급자격 온라인 교육 이수
                </li>
                <li>
                  <strong className="text-slate-800">실업인정</strong> — 실업인정일마다
                  재취업활동을 증빙하는가
                </li>
                <li>
                  <strong className="text-slate-800">정직한 신고</strong> — 아르바이트 ·
                  취업 · 사업소득은 반드시 신고(부정수급 시 전액 반환 + 추가징수)
                </li>
              </ul>
            </div>
          </section>

          {/* 5. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 특히 조심할 것
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                자발적 퇴사 · 부정수급은 특히 조심하세요
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                스스로 사표를 낸 경우는 원칙적으로 실업급여를 받을 수 없습니다. 임금체불 ·
                괴롭힘 · 질병 등 정당한 사유가 있다면 증빙을 갖춰 고용센터에서 먼저
                확인받으세요. 또 실업급여를 받는 동안 아르바이트 · 취업 · 사업소득이 생기면
                반드시 신고해야 합니다. 숨기면 부정수급으로 받은 돈 전액 반환은 물론
                추가징수 · 형사처벌까지 받을 수 있습니다. 2026년 기준 상 · 하한액과
                소정급여일수는 &lsquo;이직일&rsquo;을 기준으로 적용됩니다.
              </p>
            </div>
          </section>

          {/* 6. FAQ */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="실업급여, 가장 많이 묻는 질문" />
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
            <SectionTitle kicker="함께 보면 좋은" title="관련 가이드·글" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_CARD}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  국민내일배움카드 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  재취업을 준비하며 배우기 — 5년 300만~500만원 직업훈련비를 국비로 지원받는 법.
                </p>
              </Link>
              <Link
                href={SRC_YOUTH}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  청년 지원 총정리 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  국민취업지원제도를 포함해 청년 자산 · 주거 · 취업 지원을 세 갈래로 묶은 가이드.
                </p>
              </Link>
            </div>
          </section>

          {/* 8. 발견 CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_WORK24}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">고용24에서 실업급여 신청 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                work24.go.kr · 구직등록 · 수급자격 신청
              </span>
            </a>
            <Link
              href={SRC_BENEFITS}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">정부 지원금 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                놓치기 쉬운 현금성 지원 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 수급조건 · 금액 · 일수는 2026년 기준({UPDATED} 확인)으로 고용노동부 등
              공식 자료를 정리한 것입니다. 상 · 하한액과 소정급여일수는 이직일 기준으로 적용되고,
              개별 사안(가입기간 · 이직사유 · 소득 등)에 따라 결과가 달라집니다. 신청 · 수급 전
              고용보험(ei.go.kr) · 고용24(work24.go.kr)와 거주지 고용센터(국번 없이 1350)에서
              최신 기준을 확인하시기 바랍니다. 본 내용은 정보 제공을 위한 것이며 법률 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 고용노동부 · 고용보험 실업급여(구직급여) 안내 (
                <a
                  href={SRC_EI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  ei.go.kr
                </a>
                )
              </li>
              <li>
                · 2026년 구직급여 1일 상한액 68,100원 · 하한액 66,048원(임금일액 상한 113,500원) 조정
              </li>
              <li>
                · 국민취업지원제도 · 국민내일배움카드 안내 (
                <a
                  href={SRC_WORK24}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  work24.go.kr
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
