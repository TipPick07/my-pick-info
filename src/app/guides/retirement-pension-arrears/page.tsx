import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 노동·연금 가이드 — 퇴직연금 미납 대응 (확인 경로와 조치 순서)
 *
 * ▷ 2026-07-30 A형 클러스터: 경제 글 "퇴직연금 미납 지연이자 연 10%·20% 계산"의 짝 허브.
 *   역할 분리 — 글 = 얼마인가(금액·지연이자 계산) / 가이드 = 어떻게 움직이나(확인·기록·절차).
 * ▷ 독립 정적 라우트. src/content/posts/*.md도 데이터층도 건드리지 않음.
 * ▷ 본문은 JSX로 직접 배치(표 깨짐 방지). 외부 커스텀 컴포넌트는 Header/Footer만.
 *   SectionTitle·DepthCard는 인라인(deposit-protection / retirement-pension과 동일 토큰·시그니처).
 *
 * [사실 검증 2026-07-30 — 국가법령정보센터·찾기쉬운 생활법령정보]
 * - 근퇴법 제20조 제1항: DC형 사용자는 가입자 연간 임금총액의 12분의 1 이상을 현금으로 계정에 납입.
 * - 근퇴법 제20조 제3항 + 시행령 제11조: 납입 예정일 다음 날 ~ 급여 지급 사유 발생일부터 14일까지 연 10%,
 *   그 다음 날 ~ 납입일까지 연 20%. 미납 부담금과 지연이자는 가입자 계정에 납입(근로자 통장이 아님).
 * - 근퇴법 제44조: 위반 시 3년 이하 징역 또는 3천만원 이하 벌금.
 * - 근퇴법 제10조: 퇴직급여등을 받을 권리는 3년간 행사하지 않으면 시효 소멸.
 * - 시행규칙(운용현황 통지): 퇴직연금사업자(DB형 제외)는 부담금이 납입 예정일부터 1개월 이상 미납되면
 *   그 사유가 발생한 날부터 10일 이내에 가입자에게 알려야 함.
 * - 진정 ≠ 고소: 진정은 밀린 금액 지급 요구, 고소는 처벌 요구. 사업장 소재지 관할 지방고용노동관서 접수.
 * - 근로감독관 조사로 체불 확인 시 '체불 임금등·사업주 확인서' 발급 → 대지급금·법률구조 신청 근거.
 * - 대지급금의 퇴직급여 항목은 '퇴직'이 전제 → 재직 중 실효 수단은 진정에 따른 시정지시.
 * - 퇴직연금 적립금은 금융회사에 사외적립 → 이미 납입된 금액은 회사 도산과 분리.
 * 출처: 국가법령정보센터(law.go.kr), 찾기쉬운 생활법령정보(easylaw.go.kr), 고용노동부, 근로복지공단.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/retirement-pension-arrears/";
const UPDATED = "2026-07-30"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_POST = "/blog/2026-07-30-retirement-pension-unpaid-contribution/"; // 클러스터 짝 글
const SRC_PENSION = "/guides/retirement-pension/"; // 퇴직연금 DB·DC·IRP 가이드
const SRC_DEFAULT = "/blog/2026-07-23-retirement-pension-default-option/"; // 디폴트옵션
const SRC_LUMP = "/blog/2026-06-29-retirement-pay-lump-vs-pension/"; // 일시금 vs 연금
const SRC_CALC = "/tools/retirement-pay/"; // 퇴직금 계산기
const SRC_MONEY = "/money/";

// 공식 출처
const SRC_LABOR = "https://labor.moel.go.kr"; // 고용노동부 노동포털(민원·진정 접수)
const SRC_FSS = "https://100lifeplan.fss.or.kr"; // 금융감독원 통합연금포털

const OG_TITLE = "퇴직연금이 안 들어왔을 때 — 확인부터 조치까지 (2026)";
const OG_DESC =
  "DC형 부담금 미납, 무엇을 어디서 확인하고 어떤 순서로 움직이나 — 계정 조회·기록 만들기·진정·시효까지 절차별로 정리한 가이드.";

export const metadata: Metadata = {
  title: "퇴직연금 미납 대응 가이드 — 확인부터 조치까지 | 팁픽",
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
    card: "summary",
    title: OG_TITLE,
    description: OG_DESC,
    images: [`${SITE}/og-image-v2.png`],
  },
};

/* ─────────────────────────  본문 데이터 (SSOT · 페이지 본문 그대로)  ───────────────────────── */

// ★ 4단계 대응 순서 (이 가이드의 중심 표)
const STEPS = [
  {
    step: "1단계 · 확인",
    what: "연도별 입금 내역을 뽑아 밀린 원금을 확정한다",
    where: "퇴직연금 금융회사 앱·고객센터, 통합연금포털",
    left: "미납 내역(제3자 기록)",
  },
  {
    step: "2단계 · 기록",
    what: "회사에 납입 계획을 묻고 답변을 문서로 남긴다",
    where: "사내 메일·메신저 (구두 답변은 요약해 회신 요청)",
    left: "회사의 미납 인정 기록",
    accent: true,
  },
  {
    step: "3단계 · 상담",
    what: "내 사례로 절차와 가능성을 먼저 확인한다",
    where: "고용노동부 상담 1350 (무료·익명 가능)",
    left: "다음 단계 판단 근거",
  },
  {
    step: "4단계 · 진정",
    what: "근로감독관 조사로 미납을 확정하고 시정지시를 받는다",
    where: "사업장 소재지 관할 지방고용노동관서, 노동포털",
    left: "시정지시 · 체불 확인서",
    accent: true,
  },
];

// 확인 경로 3가지 (DepthCard)
const CHECK = [
  {
    k: "① 금융회사 계정",
    v: "가장 빠르고 정확합니다. 회사가 가입한 퇴직연금사업자(은행·증권사·보험사)의 앱이나 고객센터에서 내 DC 계정의 연도별 입금 내역을 조회하세요. 어느 금융사인지 모르면 급여담당자에게 묻거나 통합연금포털에서 확인할 수 있습니다.",
    accent: true,
  },
  {
    k: "② 미납 통지 이력",
    v: "퇴직연금사업자는 DB형을 제외하고 부담금이 납입 예정일부터 1개월 이상 미납되면 그 사유가 생긴 날부터 10일 이내에 가입자에게 알려야 합니다(시행규칙 운용현황 통지). 안내를 받은 기억이 없다면 '미납 내역과 통지 이력을 확인해 달라'고 요청해 보세요.",
    accent: true,
  },
  {
    k: "③ 통합연금포털",
    v: "금융감독원 통합연금포털에서 내 이름으로 가입된 연금(퇴직연금·연금저축)의 적립 현황을 한 번에 볼 수 있습니다. 조회 신청 후 실제 데이터가 쌓이기까지 시간이 걸리므로, 급한 확인은 ①로 하고 전체 그림을 볼 때 쓰는 편이 좋습니다.",
  },
  {
    k: "⚠️ 내 제도부터",
    v: "DB형이라면 개인 계정 자체가 없어 '내 몫이 안 들어왔다'가 보이지 않습니다. 이때는 회사 단위의 적립 수준이 신호가 됩니다. 내 제도가 DB인지 DC인지는 퇴직연금규약이나 급여담당자, 금융사 계정 유무로 확인하세요.",
  },
];

// 기록 만들기 (DepthCard)
const RECORD = [
  {
    k: "구두 답변을 글로",
    v: "말로 들은 답변은 나중에 부인당하면 그만입니다. 다투는 톤이 아니라 확인 요청 형식으로 남기세요. 예: '말씀 주신 내용 확인차 정리드립니다. 현재 자금 사정으로 ○개 연도분 부담금 납입 시기가 미정이라고 이해했습니다. 계획이 정해지면 알려주시면 감사하겠습니다.' 반박이 없으면 그 자체가 기록이 됩니다.",
    accent: true,
  },
  {
    k: "금액을 특정해서",
    v: "'퇴직연금이 안 들어왔다'보다 '2024년분 400만원, 2025년분 400만원, 합계 800만원'이 훨씬 강합니다. 법정 최소 부담금은 연간 임금총액의 12분의 1이므로 직접 계산할 수 있습니다. 지연이자까지 얹은 총액 계산은 짝 글에 표로 정리해 두었습니다.",
  },
  {
    k: "지연이자도 함께",
    v: "회사가 넣어야 하는 것은 원금만이 아닙니다. 미납 부담금과 지연이자를 함께 계정에 납입해야 하고(근퇴법 제20조 제3항), 이를 어기면 3년 이하 징역 또는 3천만원 이하 벌금에 처해질 수 있습니다(제44조). 원금만 입금됐다면 그것으로 끝난 게 아닙니다.",
    accent: true,
  },
  {
    k: "다른 항목도 점검",
    v: "국민연금·건강보험료는 매달 원천징수되지만 DC형 부담금은 연 1회 이상 목돈으로 넣는 구조라 자금난이 오면 가장 먼저 밀립니다. 반대로 국민연금까지 밀리기 시작했다면 회사 상황이 더 나빠졌다는 신호이니, 국민연금 가입내역도 함께 확인해 두세요.",
  },
];

// 진정 · 고소 · 민사 비교 (자체 조합 비교표)
const ROUTES = [
  {
    route: "진정",
    goal: "밀린 금액을 넣게 해 달라",
    where: "관할 지방고용노동관서 · 노동포털",
    result: "근로감독관 조사 → 시정지시, 체불 확인서",
    note: "비용 없음. 재직 중에 쓸 수 있는 사실상 유일한 실효 수단",
    accent: true,
  },
  {
    route: "고소",
    goal: "사용자를 처벌해 달라",
    where: "관할 지방고용노동관서 · 수사기관",
    result: "형사 절차(벌금·징역)",
    note: "관계가 완전히 끊어지는 선택. 미납액 회수와는 별개",
  },
  {
    route: "민사 소송",
    goal: "판결로 강제집행 근거를 만든다",
    where: "법원 (지급명령 포함)",
    result: "집행권원 확보",
    note: "체불 확인서가 있으면 법률구조공단 무료 지원 대상이 될 수 있음",
  },
  {
    route: "대지급금",
    goal: "국가가 먼저 지급하고 회사에 구상",
    where: "근로복지공단",
    result: "한도 내 지급",
    note: "퇴직급여 항목은 퇴직이 전제 — 재직 중에는 쓸 수 없는 안전판",
    accent: true,
  },
];

const FAQS = [
  {
    q: "재직 중에 진정을 넣으면 회사에서 불이익을 받지 않을까요?",
    a: "우려는 현실적입니다. 다만 순서를 나눠 생각하면 위험 없이 할 수 있는 일이 먼저 있습니다. 금융회사에서 미납 내역을 뽑는 것과 회사에 납입 계획을 묻고 답변을 메일로 남기는 것은 회사와 각을 세우지 않고도 가능하고, 어느 길로 가든 반드시 필요한 재료입니다. 진정은 그다음 판단이고, 같은 처지의 동료가 있다면 함께 접수하는 방법도 있습니다. 참고로 진정은 처벌 요구가 아니라 밀린 금액을 넣게 해 달라는 요구이며, 회사가 자금난이면 분할 납입 계획을 제출하는 선에서 정리되는 경우도 많습니다.",
  },
  {
    q: "회사가 '돈이 없다'고만 하고 시기를 말하지 않으면 기다려야 하나요?",
    a: "기다림에는 두 가지 비용이 붙습니다. 하나는 시효입니다. 퇴직급여를 받을 권리는 3년간 행사하지 않으면 소멸합니다(근퇴법 제10조). 재직 중 미납분의 기산점은 사안에 따라 다르게 볼 수 있어 단정하기 어렵지만, 가장 오래된 미납 연도가 3년에 가까워지고 있다면 기록부터 남겨 두는 편이 안전합니다. 다른 하나는 회사 상태입니다. 자금 사정이 나빠질수록 회수 가능성은 떨어집니다. 반대로 회사가 미납 사실을 인정하는 내용을 문서로 남겨 두면 나중에 다툴 여지가 줄어듭니다.",
  },
  {
    q: "이미 들어와 있는 퇴직연금은 회사가 망하면 어떻게 되나요?",
    a: "퇴직연금 적립금은 회사 계좌가 아니라 금융회사에 사외적립되어 있어 회사의 도산과 분리됩니다. 즉 이미 내 계정에 들어온 금액은 그대로 남습니다. 위험한 것은 아직 들어오지 않은 미납분뿐이고, 그래서 '밀린 것부터 넣게 하는 일'이 다른 무엇보다 우선입니다. 참고로 DC·IRP 계정에서 원리금보장 상품으로 운용 중인 금액은 일반 예금과 별도로 1억원까지 예금자보호도 받습니다.",
  },
  {
    q: "DB형에서 DC형으로, 또는 그 반대로 개인이 바꿀 수 있나요?",
    a: "개인이 임의로 바꿀 수는 없습니다. 제도를 바꾸려면 퇴직연금규약을 변경해야 하고 여기에는 근로자 과반수(과반수 노조가 있으면 그 노조)의 동의가 필요합니다. 회사가 두 제도를 함께 운영하고 개인 선택을 허용하는 규약을 두고 있다면 그 범위 안에서만 가능합니다. 또한 DB에서 DC로 바꾸면 그 이후 운용 손익은 근로자 몫이 되므로 되돌리기 어려운 선택이라는 점도 함께 봐야 합니다.",
  },
  {
    q: "퇴사할 때 한꺼번에 정산받으면 되지 않나요?",
    a: "그렇게 정리되면 다행이지만 두 가지가 달라집니다. 첫째, 퇴직 사유가 생긴 날부터 14일이 지나면 지연이자율이 연 10%에서 연 20%로 올라갑니다. 둘째, 이미 회사를 떠난 뒤라 요구할 수 있는 수단이 줄어듭니다. 재직 중에 밀린 금액을 확정해 두는 것과 퇴직 후에 다투는 것은 난이도가 다르므로, 금액을 특정하고 기록을 만드는 일은 재직 중에 해 두는 편이 낫습니다.",
  },
  {
    q: "대지급금은 회사가 망해야만 받을 수 있나요?",
    a: "도산이 확인된 경우(도산대지급금)와 법원 판결 등으로 체불이 확정된 경우(간이대지급금) 모두 대상이 됩니다. 다만 퇴직급여 항목은 '퇴직'을 전제로 하므로 재직 중에는 활용할 수 없습니다. 재직 중이라면 진정에 따른 시정지시가 실효적인 수단이고, 근로감독관 조사로 발급되는 '체불 임금등·사업주 확인서'가 뒤이은 절차(대지급금 신청, 법률구조공단의 무료 소송 지원)의 열쇠가 됩니다. 신청 요건과 한도는 근로복지공단에서 확인하세요.",
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

export default function RetirementPensionArrearsGuide() {
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
        name: "퇴직연금 미납 대응 가이드",
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
              2026년 기준 · 퇴직연금·노동
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              퇴직연금이 안 들어왔다 —
              <br className="hidden sm:block" /> 확인부터 조치까지
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              확정기여형(DC)은 회사가 <strong>연간 임금총액의 12분의 1 이상</strong>을 내 계정에
              넣어야 합니다. 한 해 건너뛰면 밀린 다음 날부터 <strong>연 10%</strong>, 퇴직 후
              14일이 지나면 <strong>연 20%</strong>의 지연이자가 붙습니다.
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              그런데 검색해 보면 법조문만 나오고 <strong>재직 중에 무엇을 어디서 확인하고 어떤
              순서로 움직이는지</strong>는 잘 정리되어 있지 않습니다. 이 페이지는 확인 경로 →
              기록 만들기 → 요구 → 진정까지 순서대로 담았습니다. 밀린 금액과 이자를 원 단위로
              계산하는 방법은{" "}
              <Link
                href={SRC_POST}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                지연이자 계산 글
              </Link>
              에서 이어집니다.
            </p>

            {/* 핵심 요약 박스 */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "가장 빠른 확인처",
                  v: "퇴직연금 금융회사",
                  d: "회사가 아니라 계정 내역부터",
                },
                {
                  k: "법정 지연이자",
                  v: "연 10% → 20%",
                  d: "퇴직 14일 후 두 배로",
                },
                {
                  k: "권리 시효",
                  v: "3년",
                  d: "기다림에 붙는 비용",
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
          {/* 1. ★ 4단계 대응 순서 (중심 표) */}
          <section>
            <SectionTitle
              kicker="전체 지도"
              title="위험이 없는 것부터 순서대로"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              1·2단계는 회사와 각을 세우지 않고도 할 수 있고, 어느 길로 가든 반드시 필요한
              재료입니다. <strong className="text-slate-800">먼저 재료를 만들고 나서 판단</strong>하는
              것이 순서입니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">단계</th>
                    <th className="px-4 py-3 font-semibold">무엇을</th>
                    <th className="px-4 py-3 font-semibold">어디서</th>
                    <th className="px-4 py-3 font-semibold">남는 것</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {STEPS.map((s) => (
                    <tr key={s.step} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {s.step}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          s.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {s.what}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{s.where}</td>
                      <td className="px-4 py-3 text-slate-500">{s.left}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 3단계 상담(국번없이 1350)은 익명으로도 가능합니다. 진정을 넣을지 결정하기 전에
              내 사례로 절차와 예상 흐름을 물어보는 용도로 쓰면 됩니다.
            </p>
          </section>

          {/* 2. 확인 경로 */}
          <section>
            <SectionTitle
              kicker="1단계"
              title="회사에 묻기 전에 계정부터 열어 본다"
            />
            <DepthCard
              tone="indigo"
              badge="확인 경로"
              title="금융회사가 남긴 기록이 가장 세다"
              sub="회사 말은 부인당할 수 있지만 계정 내역은 제3자 기록"
              rows={CHECK}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              내 제도가 DB인지 DC인지, 계정 구조가 어떻게 다른지는{" "}
              <Link
                href={SRC_PENSION}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                퇴직연금 DB·DC·IRP 가이드
              </Link>
              에, 들어온 돈이 어떻게 굴러가는지는{" "}
              <Link
                href={SRC_DEFAULT}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                디폴트옵션 등급별 수익률
              </Link>
              에 정리해 두었습니다.
            </p>
          </section>

          {/* 3. 기록 만들기 */}
          <section>
            <SectionTitle
              kicker="2단계"
              title="말로 들은 답을 글로 바꿔 두기"
            />
            <DepthCard
              tone="slate"
              badge="기록 만들기"
              title="다투지 않고도 남길 수 있는 것들"
              sub="확인 요청 형식이면 관계를 상하지 않는다"
              rows={RECORD}
            />
          </section>

          {/* 4. 네 갈래 비교 */}
          <section>
            <SectionTitle
              kicker="3~4단계"
              title="진정·고소·민사·대지급금, 목적이 다르다"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              흔히 하나로 뭉뚱그려 생각하지만 각각 <strong className="text-slate-800">요구하는
              내용과 결과물이 다릅니다.</strong> 재직 중에 밀린 돈을 넣게 하는 것이 목적이라면
              첫 줄이 답입니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">갈래</th>
                    <th className="px-4 py-3 font-semibold">요구하는 것</th>
                    <th className="px-4 py-3 font-semibold">어디에</th>
                    <th className="px-4 py-3 font-semibold">결과물</th>
                    <th className="px-4 py-3 font-semibold">메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ROUTES.map((r) => (
                    <tr key={r.route} className="align-top">
                      <td
                        className={`px-4 py-3 font-semibold ${
                          r.accent ? "text-indigo-700" : "text-slate-700"
                        }`}
                      >
                        {r.route}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.goal}</td>
                      <td className="px-4 py-3 text-slate-500">{r.where}</td>
                      <td className="px-4 py-3 text-slate-600">{r.result}</td>
                      <td className="px-4 py-3 text-slate-500">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 근로감독관 조사로 체불이 확인되면 발급되는 <strong>체불 임금등·사업주 확인서</strong>가
              이후 절차의 열쇠입니다. 대지급금 신청과 대한법률구조공단의 무료 소송 지원 모두 이
              서류를 근거로 삼습니다.
            </p>
          </section>

          {/* 5. 체크리스트 */}
          <section>
            <SectionTitle kicker="오늘 할 일" title="한 시간이면 끝나는 6가지" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">제도 확인</strong> — 내 퇴직연금이 DC인지 DB인지
                  확인했나 (DC라야 개인 계정 조회가 의미 있음)
                </li>
                <li>
                  <strong className="text-slate-800">계정 조회</strong> — 금융회사 앱에서 연도별
                  입금 내역을 뽑아 어느 해가 비었는지 특정했나
                </li>
                <li>
                  <strong className="text-slate-800">통지 이력</strong> — 1개월 이상 미납 시 통지
                  의무가 있다는 점을 근거로 금융사에 이력을 요청했나
                </li>
                <li>
                  <strong className="text-slate-800">금액 계산</strong> — 밀린 원금과 지연이자를
                  더해 요구할 총액을 숫자로 만들었나
                </li>
                <li>
                  <strong className="text-slate-800">문서 남기기</strong> — 회사의 답변을 확인 요청
                  형식의 메일로 정리해 보냈나
                </li>
                <li>
                  <strong className="text-slate-800">기한 점검</strong> — 가장 오래된 미납 연도가
                  3년에 가까워지고 있지 않나
                </li>
              </ul>
            </div>
          </section>

          {/* 6. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 기다림에 붙는 비용
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                시효는 흐르고, 회사 사정은 나빠집니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                퇴직급여를 받을 권리는 <strong>3년간 행사하지 않으면 시효로 소멸</strong>합니다(근퇴법
                제10조). 재직 중 미납분의 기산점은 개별 사정에 따라 달리 볼 수 있어 단정하기
                어렵지만, 가장 오래된 미납 연도가 3년에 가까워지고 있다면 기록을 남겨 두는 편이
                안전합니다. 여기에 회사의 자금 사정이 나빠질수록 회수 가능성이 떨어진다는 점이
                더해집니다. 절차와 요건은 고용노동부 상담(국번없이 1350)이나{" "}
                <a
                  href={SRC_LABOR}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  노동포털
                </a>
                에서 확인하세요.
              </p>
            </div>
          </section>

          {/* 7. FAQ */}
          <section>
            <SectionTitle
              kicker="망설여지는 지점"
              title="불이익은? 기다려야 하나? — 실제로 묻는 것들"
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
            <SectionTitle kicker="이어서 보기" title="퇴직연금, 나머지 궁금한 것들" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_POST}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  미납 지연이자 원 단위 계산 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  이 가이드의 짝 — 연봉별 미납액과 이자를 표로 계산했습니다.
                </p>
              </Link>
              <Link
                href={SRC_PENSION}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  퇴직연금 DB·DC·IRP 가이드 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  제도별 차이와 계정 구조 — 내 것이 어느 쪽인지부터.
                </p>
              </Link>
              <Link
                href={SRC_DEFAULT}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  디폴트옵션 등급별 수익률 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  들어온 돈이 방치되지 않게 — 운용 방식 고르기.
                </p>
              </Link>
              <Link
                href={SRC_LUMP}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  퇴직금 일시금 vs 연금 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  받을 때 세금이 갈리는 지점을 계산으로 비교했습니다.
                </p>
              </Link>
            </div>
          </section>

          {/* 9. 발견 CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_LABOR}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">고용노동부 노동포털 바로가기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                민원·진정 접수와 상담 안내 · 전화 상담은 국번없이 1350
              </span>
            </a>
            <Link
              href={SRC_CALC}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">내 퇴직금 먼저 계산하기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                평균임금·근속기간으로 예상 금액 확인
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 법령 내용은 근로자퇴직급여 보장법과 같은 법 시행령·시행규칙({UPDATED} 확인)
              기준입니다. 부담금 산정과 지연이자 기산일은 회사의 퇴직연금규약과 임금총액 산정 방식에
              따라 달라질 수 있고, 시효 기산점·진정 처리 결과는 개별 사정에 따라 판단이 달라집니다.
              본 내용은 정보 제공을 위한 것이며 법률 자문이 아닙니다. 구체적인 사안은 고용노동부
              상담(국번없이 1350)이나 노동 관계 전문가에게 확인하시기 바랍니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국가법령정보센터 — 근로자퇴직급여 보장법 제10조·제20조·제44조, 같은 법 시행령
                제11조, 시행규칙 운용현황 통지 규정 (law.go.kr)
              </li>
              <li>
                · 찾기쉬운 생활법령정보 — 퇴직급여 미지급 시 구제방법·지연이자 (easylaw.go.kr)
              </li>
              <li>
                · 고용노동부 노동포털 (
                <a
                  href={SRC_LABOR}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  labor.moel.go.kr
                </a>
                ) · 금융감독원 통합연금포털 (
                <a
                  href={SRC_FSS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  100lifeplan.fss.or.kr
                </a>
                ) · 근로복지공단 대지급금 안내
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              더 많은 금융·노후 정보는{" "}
              <Link href={SRC_MONEY} className="underline underline-offset-2">
                돈이 되는 경제
              </Link>
              에서 볼 수 있습니다.
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
