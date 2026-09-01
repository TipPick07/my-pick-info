import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateBox from "@/components/AffiliateBox";

/**
 * 거래형 하위 가이드 — 어린이집·유치원 신청(유보통합포털 입소대기·입학) 가이드
 *
 * ▷ keyword-map-parenting §3 큐 #3(C2 거래형 / 입소대기·국공립 신청). 1편(parenting-family-benefits)·
 *   C5(parenting-family-finance)와 보완관계: 1편은 비용(보육료·유아학비·누리과정), 이 글은 '신청 절차'.
 *   비용 문구는 전부 1편으로 내부링크 → 카니발 0.
 * ▷ 독립 정적 라우트입니다. src/content/posts/*.md(블로그)도, public/data/pick-info.json(크롤링)도
 *   건드리지 않으므로 자동발행 파이프라인(isDuplicate / dedup / 표 게이트)과 충돌하지 않습니다.
 * ▷ 본문은 마크다운이 아니라 JSX로 직접 배치합니다(표 깨짐 버그 클래스 원천 차단).
 * ▷ 외부 커스텀 컴포넌트는 Header/Footer만 재사용. 요약박스·비교표·DepthCard·FAQ는 전부 이 파일 안 인라인
 *   (C5와 동일 토큰·시그니처). DepthCard rows의 v는 본문 그대로, k는 구조 라벨(C5 대상/소득 라벨과 동일).
 * ▷ 제휴 링크 없음 — 순수 정보 가이드. 데이터층·situations 무접촉.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/daycare-admission/";
const UPDATED = "2026-06-09"; // 사실 최종 확인일

// 공식 출처 (staleness 완화 — 본문 곳곳에서 최신값 확인 링크로 사용)
const SRC_PORTAL = "https://enter.childinfo.go.kr"; // 유보통합포털(교육부)
const SRC_BENEFITS = "/guides/parenting-family-benefits/"; // 비용(보육료·유아학비·누리과정)

// 절대 URL로 지정 → layout의 metadataBase 유무와 무관하게 og:image가 안전하게 해석됨
const OG_IMAGE = `${SITE}/images/og/daycare-admission.png`;
const OG_TITLE =
  "유보통합포털 자녀등록, 어린이집·유치원 입소 순위 확인";
const OG_DESC =
  "유보통합포털 자녀등록을 마쳐야 신청이 열립니다. 어린이집은 1순위 100점 점수제 대기순번, 유치원은 순위 없이 희망순 무작위 추첨입니다.";

export const metadata: Metadata = {
  title:
    "유보통합포털 자녀등록, 어린이집·유치원 입소 순위 확인 | 팁픽",
  description: OG_DESC,
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
        alt: "어린이집·유치원 신청 가이드 유보통합포털 입소대기·입학",
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

/* ─────────────────────────  본문 데이터 (SSOT · 페이지 본문 그대로)  ───────────────────────── */

// ★ 핵심 비교표 — 어린이집 vs 유치원
const COMPARE = [
  { axis: "대상 연령", daycare: "만 0~5세 (장애아동 만 12세)", kinder: "만 3~5세" },
  { axis: "신청 창구", daycare: "유보통합포털", kinder: "유보통합포털" },
  {
    axis: "신청 시기",
    daycare: "연중 수시 (상시 대기)",
    kinder: "연 1회 (통상 11월)",
    accent: true,
  },
  {
    axis: "선발 방식",
    daycare: "입소 우선순위 점수제 + 대기순번",
    kinder: "무작위 추첨 (희망순)",
    accent: true,
  },
  {
    axis: "결정 변수",
    daycare: "1순위·맞벌이 점수 + 신청 순서",
    kinder: "우선모집 자격 + 운(추첨)",
  },
  {
    axis: "결과 확인",
    daycare: "대기순번 실시간 조회",
    kinder: "추첨 결과 발표(11월)",
  },
];

// 유보통합포털 자녀등록 — 모든 신청의 첫 관문 (DepthCard)
const REGISTER = [
  {
    k: "1. 회원가입",
    v: "유보통합포털(enter.childinfo.go.kr)에 가입합니다. 기존 아이사랑포털 회원이라면 추가 가입 없이 쓰던 아이디·비밀번호로 그대로 로그인됩니다.",
  },
  {
    k: "2. 자녀등록",
    v: "포털에 아이를 등록합니다. 이 단계를 마친 뒤에야 입소대기 신청 화면이 열리므로, 자녀등록은 준비 단계가 아니라 신청의 첫 관문입니다.",
    accent: true,
  },
  {
    k: "3. 어린이집 검색·선택",
    v: "지역·유형으로 어린이집을 찾아 고릅니다. 동시에 대기를 걸 수 있는 곳은 미재원 아동 3개소, 재원 아동 2개소입니다.",
  },
  {
    k: "4. 입소대기 신청",
    v: "선택한 어린이집에 입소대기를 신청하면 대기순번이 잡힙니다. 순번은 마이페이지에서 수시로 확인할 수 있고, 앞 순번이 취소되면 올라갑니다.",
  },
  {
    k: "유치원도 같은 계정",
    v: "유치원 입학은 같은 계정으로 이용하되 별도 동의가 필요합니다. 어린이집 대기와 유치원 입학을 함께 신청해도 됩니다.",
  },
];

// 입소 순위가 있는 쪽과 없는 쪽 — 검색에서 가장 많이 헷갈리는 지점
const RANK_COMPARE = [
  {
    axis: "순위가 있나",
    daycare: "있다 — 입소 우선순위 점수제",
    kinder: "없다 — 무작위 추첨",
    accent: true,
  },
  {
    axis: "무엇으로 갈리나",
    daycare: "1순위 항목당 100점(다자녀·맞벌이 각 200점, 둘 다면 300점) / 2순위 항목당 50점",
    kinder: "희망순(1·2·3지망) 무작위 추첨 + 우선모집 자격",
  },
  {
    axis: "같으면 어떻게",
    daycare: "동순위 경합은 입소대기 신청 순서로 결정",
    kinder: "동점 개념 없음 — 추첨으로 한 번에 결정",
  },
  {
    axis: "일찍 넣으면",
    daycare: "유리하다 — 동순위에서 앞선다",
    kinder: "무관하다 — 선착순이 아니다",
    accent: true,
  },
  {
    axis: "순번 확인",
    daycare: "마이페이지에서 대기순번 실시간 조회",
    kinder: "순번 없음 — 추첨 결과 발표(통상 11월)",
  },
];

// 어린이집 — 점수제·연중 대기 (DepthCard · v=본문 그대로, k=구조 라벨)
const DAYCARE = [
  {
    k: "신청 흐름",
    v: "유보통합포털 회원가입·자녀등록 → 어린이집 검색·선택 → 입소대기 신청 → 어린이집이 입소 우선순위에 따라 대기순서를 확인해 대상자 확정 순입니다.",
  },
  {
    k: "동시 대기·시기",
    v: "동시에 대기 신청할 수 있는 어린이집은 미재원 아동 3개소, 재원 아동 2개소이고, 신청은 연중 수시로 가능합니다.",
  },
  {
    k: "순번 = 점수",
    v: "순번은 점수로 정해집니다. 1순위 항목당 100점(3자녀 이상 가구 자녀 및 맞벌이는 각 200점, 맞벌이이면서 3자녀 이상이면 300점), 2순위 항목당 50점입니다. 2순위 항목만 있으면 점수 합계가 같거나 높아도 1순위보다 앞설 수 없고, 1순위 점수가 동일한 경우에만 2순위를 추가로 합산합니다.",
  },
  {
    k: "동순위 = 신청 순서",
    v: "가장 실전적인 규칙은 같은 순위 안에서 경합이면 입소대기 신청 순서로 순위가 갈린다는 점입니다 — 해당 어린이집을 일찍 등록해 둘수록 유리합니다.",
    accent: true,
  },
  {
    k: "1순위 대상",
    v: "1순위에는 기초생활수급자·차상위계층·한부모·장애부모·국가유공자(전몰·순직·상이 1~3급) 자녀 등이 포함되고 다자녀·맞벌이·재원 형제자매 등도 해당됩니다(상세 항목은 매년 보육사업안내 기준).",
  },
  {
    k: "실전 팁",
    v: "맞벌이는 200점으로 크게 유리하니 재직증명 준비 / 인기 원은 동일순위 경합이 많아 빨리 등록 / 대기순번은 마이페이지에서 수시 확인(앞 순번 취소 시 올라감).",
  },
];

// 유치원 — 추첨·연 1회 (DepthCard · v=본문 그대로, k=구조 라벨)
const KINDER = [
  {
    k: "진행 순서",
    v: "보통 10~12월(통상 11월)에 원서를 접수하면 자동 추첨으로 입학이 결정되고, 우선모집 → 일반모집(사전접수+본접수) → 결원 시 추가모집 순서로 진행됩니다.",
  },
  {
    k: "우선모집 대상",
    v: "우선모집 대상은 법정저소득층·국가보훈대상자·북한이탈주민 가정(그 밖의 우선모집 대상은 유치원별 모집요강에서 확인)입니다.",
  },
  {
    k: "추첨 방식",
    v: "추첨은 접수 선착순이 아니라 희망순(1·2·3지망) 무작위 추첨이며 일반모집은 중복선발이 제한됩니다. 1지망에 뽑히면 2·3지망 추첨에서 제외됩니다.",
    accent: true,
  },
  {
    k: "등록 마감",
    v: "추첨 후 등록 마감일을 넘기면 당첨이 자동 취소되니 발표 직후 바로 등록해야 합니다.",
  },
  {
    k: "실전 팁",
    v: "우선모집 자격이 되면 반드시 우선모집 기간에 신청(놓치면 일반모집으로) / 일반모집은 중복선발 제한이라 1지망을 신중하게 / 10월 말 공개되는 모집요강으로 통학·방과후·특수학급 비교 / 선착순이 아니므로 기간 내 신청만 하면 됨, 마감 직전 몰림만 피하기.",
  },
];

const FAQS = [
  {
    q: "어린이집과 유치원을 둘 다 신청해도 되나요?",
    a: "됩니다. 유보통합포털 한 계정으로 어린이집 입소대기와 유치원 입학시스템을 함께 이용할 수 있습니다(유치원 입학은 별도 동의 필요).",
  },
  {
    q: "맞벌이가 아니면 어린이집 입소가 어렵나요?",
    a: "맞벌이가 200점으로 유리한 건 맞지만 유일한 조건은 아닙니다. 같은 순위면 신청 순서로 갈리므로 일찍 등록이 핵심입니다.",
  },
  {
    q: "유치원은 일찍 신청하면 유리한가요?",
    a: "아니요. 선착순이 아니라 무작위 추첨이라 기간 내 신청이면 됩니다. 단 우선모집 자격자는 우선모집을 꼭 챙기세요.",
  },
  {
    q: "예전처럼 아이사랑·처음학교로로 따로 신청하나요?",
    a: "아니요. 2024년 11월부터 유보통합포털 한 곳입니다. 기존 아이사랑포털 회원은 추가 가입 없이 같은 아이디·비밀번호로 로그인됩니다.",
  },
  {
    q: "지금 신청하나요, 따로 시기가 있나요?",
    a: "어린이집은 연중 상시 대기 신청이 가능하고, 유치원은 연 1회(통상 11월)입니다. 2027학년도 유치원 일정은 2026년 10~11월 공고를 확인하세요.",
  },
  {
    q: "유보통합포털 자녀등록을 안 하면 신청이 안 되나요?",
    a: "네. 자녀등록을 마친 뒤에야 입소대기 신청 화면이 열립니다. 회원가입만 해 둔 상태에서는 어린이집을 골라도 신청이 진행되지 않으니, 가입 직후 자녀등록까지 끝내 두세요.",
  },
  {
    q: "유치원도 어린이집처럼 입소 순위나 대기순번이 있나요?",
    a: "아니요. 순위와 대기순번은 어린이집에만 있습니다. 유치원은 희망순 무작위 추첨이라 순번이라는 개념 자체가 없고, 우선모집 자격이 있는지만 갈립니다. 유치원 입소 순위를 찾고 계셨다면 확인할 것은 순번이 아니라 우선모집 대상 여부와 모집요강 일정입니다.",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트(파일 내부 · C5와 동일)  ───────────────────────── */

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

export default function DaycareAdmissionGuide() {
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
        name: "어린이집·유치원 신청 가이드",
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
              2027학년도 기준 · 유보통합포털
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              유보통합포털 자녀등록, 어린이집·유치원
              <br className="hidden sm:block" /> 입소 순위 확인 (2027학년도 기준)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              부모가 가장 헷갈리는 지점은 이것입니다 — 어린이집과 유치원은 이제 같은 포털에서
              신청하지만, 선발 방식이 완전히 다릅니다. 2024년 11월 1일 교육부가{" "}
              <a
                href={SRC_PORTAL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                유보통합포털(enter.childinfo.go.kr)
              </a>
              을 열어, 전에는 아이사랑(어린이집)·처음학교로(유치원)에서 따로 하던 신청을 한
              곳으로 통합했습니다. 창구는 하나가 됐지만 어린이집은 상시·점수제·대기순번으로,
              유치원은 연 1회·추첨으로 굴러갑니다. 이 차이만 알면 신청이 훨씬 쉬워집니다.
              (보육료·유아학비 등 비용 지원은{" "}
              <Link
                href={SRC_BENEFITS}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                육아·가족 지원금 가이드
              </Link>{" "}
              참고)
            </p>

            {/* 핵심 요약 박스 (인라인 · C5와 동일 패턴 · 값은 비교표에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "어린이집",
                  v: "연중 수시 · 점수제",
                  d: "입소 우선순위 + 대기순번",
                },
                {
                  k: "유치원",
                  v: "연 1회 · 11월 추첨",
                  d: "무작위 추첨(희망순)",
                },
                {
                  k: "공통 창구",
                  v: "유보통합포털",
                  d: "2024.11 통합 · enter.childinfo.go.kr",
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
          {/* 1. ★ 핵심 비교표 — 어린이집 vs 유치원 (글의 중심) */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="어린이집 vs 유치원 — 무엇이 다른가"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      어린이집
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      유치원
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
                        {r.daycare}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.kinder}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 1-b. 유보통합포털 자녀등록 — 모든 신청의 첫 관문 (질문형 H2 · §1-8-3) */}
          <section>
            <SectionTitle
              kicker="신청 전 첫 단계"
              title="유보통합포털 자녀등록은 어떻게 하나요?"
            />
            <DepthCard
              tone="indigo"
              badge="가입 → 자녀등록 → 신청"
              title="자녀등록을 마쳐야 신청 화면이 열린다"
              sub="유보통합포털 enter.childinfo.go.kr · 2024.11 통합"
              rows={REGISTER}
            />
          </section>

          {/* 2. 어린이집 깊이 */}
          <section>
            <SectionTitle
              kicker="점수제·연중 대기"
              title="어린이집 — 일찍 등록할수록 유리"
            />
            <DepthCard
              tone="indigo"
              badge="입소대기"
              title="점수제 + 대기순번 · 연중 수시"
              sub="유보통합포털 · 보육사업안내 기준"
              rows={DAYCARE}
            />
          </section>

          {/* 3. 유치원 깊이 */}
          <section>
            <SectionTitle
              kicker="추첨·연 1회"
              title="유치원 — 기간 내 신청 + 추첨"
            />
            <DepthCard
              tone="slate"
              badge="입학(추첨)"
              title="무작위 추첨(희망순) · 통상 11월"
              sub="유보통합포털 · 처음학교로 모집요강"
              rows={KINDER}
            />
          </section>

          {/* 3-b. 입소 순위 — 어린이집엔 있고 유치원엔 없다 (질문형 H2 · §1-8-3) */}
          <section>
            <SectionTitle
              kicker="가장 많이 헷갈리는 것"
              title="유치원 입소 순위는 어떻게 정해지나요?"
            />
            <p className="mb-6 text-base leading-relaxed text-slate-600">
              결론부터 말하면{" "}
              <strong className="font-semibold text-slate-900">
                유치원에는 입소 순위가 없습니다.
              </strong>{" "}
              순위와 대기순번은 어린이집에만 있는 제도이고, 유치원은 희망순 무작위 추첨으로
              한 번에 결정됩니다. 그래서 유치원은 일찍 넣어도 유리해지지 않고, 어린이집은
              같은 순위끼리 경합할 때 신청 순서로 갈립니다. 두 제도를 같은 기준으로 준비하면
              한쪽은 반드시 헛수고가 됩니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      어린이집 (순위 있음)
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      유치원 (순위 없음)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RANK_COMPARE.map((r) => (
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
                        {r.daycare}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
                        }`}
                      >
                        {r.kinder}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3.5 자체 계산 예시 — 입소 점수 비교 */}
          <section>
            <SectionTitle
              kicker="점수로 직접 비교"
              title="맞벌이 2자녀 vs 외벌이 — 점수는 이렇게 갈린다"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">가구</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      해당 항목(배점)
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      합계·순위
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      A — 맞벌이 · 2자녀 (첫째가 해당 원 재원 중)
                    </td>
                    <td className="px-4 py-3 font-medium text-indigo-700">
                      맞벌이 200점 + 재원 형제자매 100점 (모두 1순위 항목)
                    </td>
                    <td className="px-4 py-3 text-slate-600">300점 · 1순위</td>
                  </tr>
                  <tr className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      B — 외벌이 · 1순위 항목 없음
                    </td>
                    <td className="px-4 py-3 text-slate-600">2순위 항목 1개 × 50점</td>
                    <td className="px-4 py-3 text-slate-600">50점 · 2순위</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              위의 배점 규칙을 그대로 대입한 예시입니다. 2자녀는 &lsquo;3자녀
              이상(200점)&rsquo;에 해당하지 않으므로 A가구는 맞벌이 200점에 재원
              형제자매 100점을 더해 300점이 됩니다. B가구는 2순위 항목만 있어 점수
              합계와 무관하게 1순위인 A보다 앞설 수 없고, 같은 300점끼리 경합하면
              입소대기 신청 순서로 갈립니다. 참고로 맞벌이이면서 3자녀 이상이면 그
              항목 하나만으로 300점입니다.
            </p>
          </section>

          {/* 4. 한 장 체크리스트 */}
          <section>
            <SectionTitle kicker="놓치면 안 되는" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">공통</strong> — 유보통합포털
                  회원가입·자녀등록·인증서 등록(상시, 미리 해두기)
                </li>
                <li>
                  <strong className="text-slate-800">어린이집</strong> — 희망 원
                  입소대기 등록(가능한 일찍) → 우선순위 점수 해당사항 확인 → 대기순번 주기 확인
                </li>
                <li>
                  <strong className="text-slate-800">유치원</strong> — 우선모집 자격
                  확인 → 10월 말 모집요강 비교 → 11월 일정 체크 → 1·2·3지망 결정 → 당첨 시
                  등록기간 엄수
                </li>
                <li>
                  <strong className="text-slate-800">비용(보육료·유아학비·누리과정)</strong>{" "}
                  —{" "}
                  <Link
                    href={SRC_BENEFITS}
                    className="font-medium text-indigo-700 underline-offset-2 hover:underline"
                  >
                    육아·가족 지원금 가이드
                  </Link>
                  에서 확인
                </li>
              </ul>
            </div>
          </section>

          {/* 5. ⚠️ 시점 주의 박스 (C5와 동일 토큰) */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 신청 전 꼭 확인
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                학년도별로 일정·기준이 갱신됩니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                학년도별 모집요강·일정·우선순위 항목은 매년 갱신됩니다. 이 글은 2026년 6월
                기준이며, 2027학년도(2026년 11월 신청) 유치원 세부 일정과 어린이집 우선순위
                항목은 2026년 10~11월 공고 및 해당 연도 보육사업안내로 최종 확인하세요.
              </p>
            </div>
          </section>

          {/* 6. FAQ — 네이티브 details/summary (C5와 동일) */}
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

          {/* 6-b. 제휴 슬롯 — 링크 미설정 시 아무것도 렌더되지 않는다(fail-closed) */}
          <AffiliateBox slot="daycare-admission" />

          {/* 7. 관련 가이드 (짧게 · 풀섹션 아님) */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 가이드" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_BENEFITS}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  육아·가족 지원금 가이드 (1편) →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  보육료·유아학비·누리과정 등 비용 지원을 아동수당·부모급여와 함께 나이 × 돌봄
                  형태로 정리한 에버그린 가이드.
                </p>
              </Link>
              <Link
                href="/guides/parenting-family-finance/"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  출산 가구 주택 대출 가이드 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  신생아 특례 디딤돌·버팀목 — 소득·순자산·한도·금리·특례기간을 한 표로 비교한
                  에버그린 가이드.
                </p>
              </Link>
            </div>
          </section>

          {/* 8. 발견 CTA — C5 CTA 패턴 동일 · 제휴 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_PORTAL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">유보통합포털에서 신청하기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                enter.childinfo.go.kr · 어린이집 입소대기 · 유치원 입학
              </span>
            </a>
            <Link
              href="/benefits/"
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">정부 지원금 전체 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                부모를 위한 지원금 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 신청 절차·기준·일정은 2026년 6월 기준({UPDATED} 확인)으로 교육부
              유보통합포털 등 공식 자료를 정리한 것입니다. 학년도별 모집요강·일정·우선순위
              항목은 매년 바뀌므로, 신청 전 유보통합포털(enter.childinfo.go.kr)과 해당 연도
              보육사업안내·유치원 모집요강에서 최신 기준을 반드시 확인하시기 바랍니다. 본 내용은
              정보 제공을 위한 것입니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>· 유보통합포털 enter.childinfo.go.kr (교육부) / 한국일보·대경일보 개통 보도</li>
              <li>· 임신육아종합포털 아이사랑 입소대기·우선순위 안내 (childcare.go.kr)</li>
              <li>· 찾기쉬운 생활법령정보(법제처) — 보육 우선제공 (2026년도 보육사업안내 68~72쪽)</li>
              <li>· 처음학교로 유치원입학관리시스템 안내 (모집·추첨)</li>
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
