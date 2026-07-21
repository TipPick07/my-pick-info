import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 노후·연금 가이드 — 주택연금(내 집에 살면서 평생 월지급금)
 *
 * ▷ 국민연금 더 받는 법(7/21 글)·3층 연금 가이드와 묶이는 노후·연금 클러스터의 주택연금 허브.
 * ▷ 독립 정적 라우트. src/content/posts/*.md(블로그)도 public/data/pick-info.json(크롤링)도 건드리지 않음.
 * ▷ 본문은 JSX로 직접 배치(표 깨짐 방지). 외부 커스텀 컴포넌트는 Header/Footer만. SectionTitle·DepthCard는 인라인
 *   (three-pillar-pension / house-capital-gains-tax와 동일 토큰·시그니처).
 * ▷ 제휴 링크 없음 — 순수 정보 가이드. 데이터층 무접촉.
 *
 * [사실 검증 2026-07-21]
 * - 가입: 부부 중 1명 만 55세 이상 + 부부 합산 공시가격 12억 원 이하 주택(다주택도 합산 12억 이하면 가능).
 *   대상: 주택·노인복지주택·주거목적 오피스텔(뒤의 둘은 월지급금 낮음).
 * - 월지급금(2026.3.1 기준, 종신지급 정액형, 부부 중 연소자 나이 기준, 일반주택 1억 원당):
 *   60세 21.0만 / 65세 25.2만 / 70세 30.7만 / 75세 38.1만 원. 공사 공식 예시: 70세·3억 원 = 월 92만 3천 원.
 * - 2026.3.1 개편(신규 신청자): 월지급금 평균 +3.13%(72세·4억 기준 월 +4.1만), 초기보증료 주택가격의
 *   1.5% → 1.0%(4억 기준 600만→400만), 초기보증료 환급 가능 기간 3년→5년, 연보증료 대출잔액의 0.75% → 0.95%.
 * - 지급 방식: 종신지급 / 확정기간 / 대출상환방식 / 우대방식.
 * - 구조: 내 집에 계속 살면서 담보로 평생 월지급금. 부부 모두 사망 시 주택 처분 정산 — 남으면 상속인에게
 *   지급, 모자라도 상속인에게 청구하지 않음(비소구). 가입자 사망 시 배우자 승계 가능.
 * 출처: 한국주택금융공사(hf.go.kr), 금융위원회 보도자료(fsc.go.kr/no010101/86211).
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/housing-pension/";
const UPDATED = "2026-07-21"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_NP_BOOST = "/blog/2026-07-21-national-pension-boost-strategies/"; // 국민연금 더 받는 법(1층 짝)
const SRC_PILLAR = "/guides/three-pillar-pension/"; // 3층 연금 전체 구조
const SRC_BASIC = "/blog/2026-06-28-basic-pension-guide/"; // 기초연금(노후의 바닥 보강)
const SRC_MONEY = "/money/";

// 공식 출처 (staleness 완화 — 최신값 확인 링크)
const SRC_HF = "https://www.hf.go.kr"; // 한국주택금융공사 예상연금 조회
const SRC_FSC = "https://www.fsc.go.kr/no010101/86211"; // 금융위 주택연금 개편 보도자료

const OG_TITLE = "주택연금 가입조건·월지급금 — 2026 개편 한눈에";
const OG_DESC =
  "만 55세·공시가 12억 이하면 내 집에 살며 평생 월지급금 — 70세·3억은 월 92만 3천 원. 2026년 3월 개편(초기보증료 1.0%)까지 정리.";

export const metadata: Metadata = {
  title: "주택연금 가입조건·월지급금 — 2026 개편 한눈에 | 팁픽",
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

// ★ 연령별 월지급금 — 1억당 + 시가 5억 환산 (2026.3.1 기준 · 종신지급 정액형 · 일반주택 · 연소자 나이)
const MONTHLY = [
  { age: "60세", per: "21.0만 원", five: "월 105만 원" },
  { age: "65세", per: "25.2만 원", five: "월 126만 원" },
  { age: "70세", per: "30.7만 원", five: "월 153만 5천 원", accent: true },
  { age: "75세", per: "38.1만 원", five: "월 190만 5천 원" },
];

// 가입 문턱 (DepthCard)
const ELIGIBLE = [
  {
    k: "① 나이",
    v: "부부 중 1명이 만 55세 이상이면 신청할 수 있습니다. 단, 월지급금은 부부 중 나이가 적은 쪽(연소자) 기준으로 계산돼요. 남편 70세·아내 62세라면 62세 단가가 적용됩니다.",
    accent: true,
  },
  {
    k: "② 집값",
    v: "부부 합산 공시가격 12억 원 이하 주택이 대상입니다. 다주택자도 보유 주택 공시가격을 모두 합쳐 12억 원 이하면 가입할 수 있어요.",
    accent: true,
  },
  {
    k: "③ 집의 종류",
    v: "일반 주택 외에 노인복지주택, 주거목적 오피스텔도 됩니다. 다만 이 둘은 같은 가격이라도 일반주택보다 월지급금이 낮게 책정돼요.",
  },
  {
    k: "④ 사는 방식",
    v: "집을 파는 게 아닙니다. 소유권을 유지한 채 내 집에 그대로 살면서, 집을 담보로 매달 월지급금을 받는 구조예요.",
  },
  {
    k: "⑤ 나중 정산",
    v: "부부가 모두 사망하면 집을 처분해 그동안 받은 금액을 정산합니다. 처분액이 남으면 상속인에게 돌려주고, 모자라도 상속인에게 청구하지 않아요(비소구).",
  },
];

// 지급 방식 4가지 (DepthCard)
const METHODS = [
  {
    k: "종신지급",
    v: "평생 매달 같은 금액을 받는 기본형입니다. 이 글의 월지급금 수치는 모두 종신지급 정액형 기준이에요.",
    accent: true,
  },
  {
    k: "확정기간",
    v: "받을 기간을 미리 정해 그 기간 동안만 받는 방식입니다. 평생이 아닌 대신 기간 설계가 자유로워요.",
  },
  {
    k: "대출상환방식",
    v: "집에 걸려 있는 기존 주택담보대출을 갚는 데 활용하는 방식입니다. 세부 인출 한도는 공사에서 확인하세요.",
  },
  {
    k: "우대방식",
    v: "일정 요건을 갖춘 가입자에게 월지급금을 우대해 주는 방식입니다. 대상·우대 폭 등 세부 요건은 주택금융공사에서 내 조건으로 확인하는 게 정확합니다.",
  },
];

// 2026.3.1 개편 (DepthCard)
const REFORM = [
  {
    k: "월지급금 ↑",
    v: "신규 신청자의 월지급금이 평균 3.13% 올랐습니다. 72세·4억 원 주택 기준으로 월 4만 1천 원을 더 받는 수준이에요.",
    accent: true,
  },
  {
    k: "초기보증료 ↓",
    v: "가입할 때 내는 초기보증료가 주택가격의 1.5%에서 1.0%로 내렸습니다. 4억 원 주택이면 600만 원 → 400만 원으로 200만 원 절감이에요.",
    accent: true,
  },
  {
    k: "환급 기간 ↑",
    v: "가입 후 일찍 해지할 때 초기보증료를 돌려받을 수 있는 기간이 3년에서 5년으로 늘었습니다.",
  },
  {
    k: "연보증료 ↑",
    v: "매년 대출잔액에 붙는 연보증료는 0.75%에서 0.95%로 올랐습니다. 초기 부담을 낮추는 대신 매년 붙는 비용은 커진 셈이라, 오래 유지할수록 이 항목의 영향이 커져요.",
  },
  {
    k: "누구에게 적용",
    v: "2026년 3월 1일 이후 신규 신청자에게 적용됩니다. 기존 가입자의 조건은 그대로예요.",
  },
];

// 자체 계산 — 70세 부부 · 시가 5억 (1억당 30.7만 기준 단순 환산)
const CALC_ROWS = [
  {
    item: "매달 받는 돈",
    calc: "1억당 30.7만 원 × 5 (시가 5억)",
    result: "월 153만 5천 원",
    accent: true,
  },
  {
    item: "1년 수령액",
    calc: "153.5만 원 × 12개월",
    result: "연 1,842만 원",
  },
  {
    item: "20년(90세까지) 누적",
    calc: "153.5만 원 × 240개월",
    result: "약 3억 6,840만 원",
    accent: true,
  },
];

// 60세 vs 70세 가입 비교 (시가 5억 기준)
const TIMING_ROWS = [
  {
    axis: "1억당 월지급금",
    early: "21.0만 원",
    late: "30.7만 원",
  },
  {
    axis: "시가 5억이면",
    early: "월 105만 원",
    late: "월 153만 5천 원",
    accent: true,
  },
  {
    axis: "차이",
    early: "—",
    late: "월 48만 5천 원 더 (+46.2%)",
    accent: true,
  },
  {
    axis: "대신",
    early: "60~70세 10년간 이미 1억 2,600만 원 수령",
    late: "받기 시작이 10년 늦음",
  },
];

const FAQS = [
  {
    q: "가입 후 집값이 오르면 손해인가요?",
    a: "월지급금은 가입 시점의 주택가격·나이로 확정돼 집값이 올라도 바뀌지 않습니다. 다만 오른 가치가 사라지는 건 아니에요. 부부가 모두 사망한 뒤 집을 처분해 정산할 때, 그동안 받은 금액을 빼고 남는 돈은 전액 상속인에게 돌아갑니다. 반대로 집값이 내려 처분액이 모자라도 부족분을 상속인에게 청구하지 않아요(비소구). 집값 방향과 무관하게 아래쪽 위험은 공사가 지는 구조입니다.",
  },
  {
    q: "이사를 가면 해지해야 하나요?",
    a: "해지가 유일한 길은 아닙니다. 담보주택을 새로 이사한 집으로 바꾸는 방식(담보주택 변경)으로 주택연금을 이어갈 수 있어요. 다만 새 집의 가격에 따라 월지급금이 조정될 수 있고, 승인 절차·세부 요건이 있으므로 이사 계획이 잡히면 먼저 주택금융공사에 변경 가능 여부를 확인하는 순서가 안전합니다.",
  },
  {
    q: "가입자가 먼저 사망하면 배우자는요?",
    a: "배우자가 승계해 계속 받을 수 있습니다. 애초에 월지급금이 부부 중 연소자 나이 기준으로 계산되는 것도, 더 오래 사는 쪽까지 평생 지급을 전제로 설계돼 있기 때문이에요. 승계 절차·요건의 세부는 공사 안내를 따르면 됩니다.",
  },
  {
    q: "중간에 해지하면 어떻게 되나요?",
    a: "그동안 받은 월지급금에 이자·보증료를 더한 대출잔액을 한꺼번에 갚아야 합니다. 2026년 3월 이후 신규 가입자는 5년 안에 해지하면 초기보증료(집값의 1.0%)를 돌려받을 수 있게 됐지만, 해지 후에는 재가입에 제한이 따를 수 있어요. 일시적으로 목돈이 필요한 상황이라면 해지부터 하지 말고 다른 방법과 비교한 뒤 결정하는 게 안전합니다.",
  },
  {
    q: "오피스텔에 살아도 가입되나요?",
    a: "주거목적 오피스텔이면 가능합니다. 노인복지주택도 대상이에요. 다만 두 유형은 같은 가격의 일반주택보다 월지급금이 낮게 책정된다는 점은 감안해야 합니다. 업무용 오피스텔 등 주거 외 용도는 대상이 아니므로, 애매하면 공사 예상연금 조회에서 내 주택 유형으로 확인해 보세요.",
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

export default function HousingPensionGuide() {
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
        name: "주택연금 가이드",
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
              주택연금 — 내 집에 살면서
              <br className="hidden sm:block" /> 평생 받는 월지급금 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              부부 중 1명이 만 55세 이상이고 부부 합산 공시가격 12억 원 이하 주택이 있다면, 그 집에 그대로
              살면서 평생 매달 연금을 받을 수 있습니다. 한국주택금융공사 공식 예시로{" "}
              <strong>70세(부부 중 연소자 기준)·시가 3억 원 주택이면 월 92만 3천 원</strong>이에요. 집을 파는 게
              아니라 담보로 맡기는 구조라 소유권도 거주도 그대로입니다.
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              2026년 3월부터는 신규 신청자의 월지급금이 평균 <strong>3.13%</strong> 오르고, 가입할 때 내는
              초기보증료가 집값의 1.5%에서 <strong>1.0%</strong>로 내렸습니다. 국민연금만으로 생활비가 빠듯한
              은퇴 가구가 &lsquo;집 한 채&rsquo;를 현금흐름으로 바꾸는 사실상의 4층 연금인 셈이에요. (국민연금
              자체를 키우는 방법은{" "}
              <Link
                href={SRC_NP_BOOST}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                국민연금 더 받는 법
              </Link>
              , 연금 전체 뼈대는{" "}
              <Link
                href={SRC_PILLAR}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                3층 연금 가이드
              </Link>{" "}
              참고)
            </p>

            {/* 핵심 요약 박스 (인라인 · 값은 본문에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "가입 문턱",
                  v: "만 55세 + 공시 12억",
                  d: "부부 중 1명 55세↑ · 합산 12억 이하",
                },
                {
                  k: "월지급금",
                  v: "70세·3억 → 92만 3천",
                  d: "종신지급 정액형 · 평생",
                },
                {
                  k: "2026.3 개편",
                  v: "평균 +3.13%",
                  d: "초기보증료 1.5% → 1.0%",
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
          {/* 1. ★ 연령별 월지급금 표 (글의 중심) */}
          <section>
            <SectionTitle
              kicker="숫자부터 확인"
              title="나이가 곧 금액 — 연령별 월지급금"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              2026년 3월 1일 기준, <strong className="text-slate-800">일반주택 · 종신지급 정액형 · 부부 중
              연소자 나이</strong>로 주택가격 1억 원당 받는 금액입니다. 시가 5억 원 주택이면 얼마인지도 함께
              환산했어요(1억당 값 × 5 단순 계산).
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">가입 나이 (연소자)</th>
                    <th className="px-4 py-3 font-semibold">1억 원당 월지급금</th>
                    <th className="px-4 py-3 font-semibold">시가 5억 원이면</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MONTHLY.map((r) => (
                    <tr key={r.age} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.age}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.per}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.five}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 공사 공식 예시인 70세·3억 원 = 월 92만 3천 원은 1억당 30.7만 원을 단순히 3배 한 92만 1천 원과
              2천 원 차이가 나는데, 표의 1억당 값이 반올림돼 있기 때문입니다. 내 나이·내 집값 그대로의 정확한
              금액은 아래 공사 예상연금 조회에서 확인하세요. 노인복지주택·주거목적 오피스텔은 이 표보다
              낮습니다.
            </p>
          </section>

          {/* 2. 가입 문턱 */}
          <section>
            <SectionTitle
              kicker="가입 문턱"
              title="누가 들 수 있나 — 만 55세와 공시 12억"
            />
            <DepthCard
              tone="indigo"
              badge="가입 요건"
              title="부부 중 1명 만 55세 + 합산 공시가격 12억 이하"
              sub="한국주택금융공사 기준"
              rows={ELIGIBLE}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              국민연금이 &lsquo;노후의 바닥&rsquo;이라면 주택연금은 집으로 올리는 위층입니다. 국민연금이 적어
              걱정이라면{" "}
              <Link
                href={SRC_BASIC}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                기초연금
              </Link>
              부터 함께 점검해 보세요.
            </p>
          </section>

          {/* 3. 지급 방식 4가지 */}
          <section>
            <SectionTitle
              kicker="받는 방법 고르기"
              title="종신·확정기간·대출상환·우대 — 지급 방식 4가지"
            />
            <DepthCard
              tone="slate"
              badge="지급 방식"
              title="평생 받을까, 기간을 정할까"
              sub="이 글의 수치는 종신지급 정액형 기준"
              rows={METHODS}
            />
          </section>

          {/* 4. 2026.3 개편 */}
          <section>
            <SectionTitle
              kicker="2026년 3월부터"
              title="더 받고 덜 내는 개편 — 무엇이 달라졌나"
            />
            <DepthCard
              tone="indigo"
              badge="2026.3.1 시행"
              title="월지급금 +3.13% · 초기보증료 1.5% → 1.0%"
              sub="금융위원회·한국주택금융공사 (신규 신청자 적용)"
              rows={REFORM}
            />
          </section>

          {/* 5. 자체 계산 — 70세 부부 · 시가 5억 */}
          <section>
            <SectionTitle
              kicker="직접 계산해 보면"
              title="70세 부부·시가 5억 아파트, 평생 얼마 받나"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-800">
                두 사람 모두 70세인 부부가 시가 5억 원 일반주택으로 종신지급 정액형에 가입한다고 가정
              </strong>
              하고, 위 표의 1억당 30.7만 원으로 계산해 봤습니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">항목</th>
                    <th className="px-4 py-3 font-semibold">계산</th>
                    <th className="px-4 py-3 font-semibold">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CALC_ROWS.map((r) => (
                    <tr key={r.item} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.item}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.calc}</td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-bold text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-8 mb-3 text-sm font-semibold text-slate-700">
              같은 5억 집, 60세에 들면 vs 70세에 들면
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold">60세 가입</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      70세 가입
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TIMING_ROWS.map((r) => (
                    <tr key={r.axis} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.axis}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.early}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.late}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 가입을 늦출수록 1억당 단가가 커져 월지급금이 큽니다(60세 21.0만 → 70세 30.7만 원). 다만 60세
              가입자는 그 10년 동안 이미 1억 2,600만 원(105만 × 120개월)을 받았으므로, &lsquo;언제부터 생활비가
              필요한가&rsquo;가 판단 기준이에요. 반올림된 1억당 값 기준 단순 계산이라 실제 산출액과는 소액 차이가
              날 수 있고, 집값은 가입 시점 가격으로 고정 평가됩니다.
            </p>
          </section>

          {/* 6. 체크리스트 */}
          <section>
            <SectionTitle kicker="신청 전 점검" title="가입 결정 전 따져 볼 6가지" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">연소자 나이</strong> — 월지급금은 부부 중 어린 쪽 나이
                  기준. 배우자 나이까지 넣고 계산했나
                </li>
                <li>
                  <strong className="text-slate-800">공시가격</strong> — 보유 주택 공시가격 합산이 12억 원
                  이하인지 확인(시가 아님)
                </li>
                <li>
                  <strong className="text-slate-800">예상 금액</strong> — 공사 예상연금 조회로 내 조건 그대로의
                  월지급금을 먼저 확인
                </li>
                <li>
                  <strong className="text-slate-800">지급 방식</strong> — 평생 안정(종신) vs 기간 집중(확정기간)
                  중 무엇이 맞나
                </li>
                <li>
                  <strong className="text-slate-800">비용 구조</strong> — 초기보증료(집값의 1.0%)와
                  연보증료(잔액의 0.95%)가 대출잔액에 쌓이는 걸 이해했나
                </li>
                <li>
                  <strong className="text-slate-800">가족 합의</strong> — 사망 후 집 처분 정산(남으면 상속,
                  모자라도 무청구)을 자녀와 공유했나
                </li>
              </ul>
            </div>
          </section>

          {/* 7. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 가입 전 꼭 확인
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                보증료는 &lsquo;눈에 안 보이는 비용&rsquo;입니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                초기보증료(집값의 1.0%)와 연보증료(대출잔액의 0.95%)는 통장에서 빠져나가는 게 아니라 대출잔액에
                가산되는 방식이라 체감이 안 되기 쉽습니다. 중도 해지하면 그동안 받은 월지급금에 이자·보증료를 더한
                잔액을 한 번에 갚아야 하고, 해지 후 재가입에는 제한이 따를 수 있어요. 2026년 3월 개편으로 신규
                가입자는 5년 안에 해지 시 초기보증료를 돌려받을 수 있게 됐지만, 애초에 &lsquo;평생 유지&rsquo;를
                전제로 설계하는 상품입니다. 유불리는 집값·나이·다른 연금 보유에 따라 다르니, 신청 전{" "}
                <a
                  href={SRC_HF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  한국주택금융공사
                </a>
                에서 내 조건 그대로 조회하고 상담을 거치세요.
              </p>
            </div>
          </section>

          {/* 8. FAQ — 네이티브 details/summary */}
          <section>
            <SectionTitle
              kicker="애매한 경우"
              title="집값이 오르면? 이사 가면? — 경계 사례 문답"
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

          {/* 9. 관련 가이드·글 */}
          <section>
            <SectionTitle kicker="노후 현금흐름 넓히기" title="연금 설계, 이어서 보기" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_NP_BOOST}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  국민연금 더 받는 법 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  주택연금의 짝이 되는 1층 — 추납·연기 등으로 국민연금 수령액을 키우는 전략.
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
                  국민·퇴직·개인연금 전체 뼈대 — 주택연금이 어디에 얹히는지 큰 그림.
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
                  만 65세 이상 소득 하위 70% — 주택연금과 함께 챙길 노후의 바닥.
                </p>
              </Link>
            </div>
          </section>

          {/* 10. 발견 CTA — 제휴 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_HF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">내 집으로 예상연금 조회 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                한국주택금융공사 · 나이·집값 넣으면 월지급금 확인
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
              본 페이지의 요건·월지급금·보증료는 2026년 3월 1일 시행 기준({UPDATED} 확인)으로
              한국주택금융공사·금융위원회 공식 자료를 정리한 것입니다. 월지급금은 나이·주택가격·지급 방식에 따라
              달라지고 제도는 바뀔 수 있으므로, 신청 전 반드시 공사에서 내 조건 그대로의 금액과 최신 기준을
              확인하시기 바랍니다. 본 내용은 정보 제공을 위한 것이며 금융·상속 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 한국주택금융공사 — 주택연금 가입 요건·월지급금·예상연금 조회 (
                <a
                  href={SRC_HF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  hf.go.kr
                </a>
                )
              </li>
              <li>
                · 금융위원회 — 주택연금 2026.3.1 개편 보도자료 (
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
