import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 노후·연금 가이드 — 퇴직연금 DB·DC·IRP (내 유형 확인과 갈아타기 판단)
 *
 * ▷ 국민연금 더 받는 법(7/21 글)·주택연금 가이드·디폴트옵션 글(7/23)과 묶이는 노후·연금 클러스터의 2층(퇴직연금) 허브.
 * ▷ 독립 정적 라우트. src/content/posts/*.md(블로그)도 public/data/pick-info.json(크롤링)도 건드리지 않음.
 * ▷ 본문은 JSX로 직접 배치(표 깨짐 방지). 외부 커스텀 컴포넌트는 Header/Footer만. SectionTitle·DepthCard는 인라인
 *   (housing-pension / three-pillar-pension과 동일 토큰·시그니처).
 * ▷ 제휴 링크 없음 — 순수 정보 가이드. 데이터층 무접촉.
 *
 * [사실 검증 2026-07-23]
 * - 적립금(금감원, 2025년 말): 총 501조 4천억(+16.1%), DB 228조 9천억(45.7%) · DC 141조 6천억(28.2%) · IRP 나머지.
 * - 2025년 연간 수익률: 전체 6.47%(제도 도입 후 최고), DB 3.53% · DC 8.47% · IRP 9.44%,
 *   원리금보장형 3.09% · 실적배당형 16.8%.
 * - IRP 세액공제: 연금저축 합산 한도 연 900만 원, 총급여 5,500만 이하 16.5%(최대 148만 5천 원) ·
 *   초과 13.2%(최대 118만 8천 원). 55세 이후 연금 수령 시 퇴직소득세 30%(11년차부터 40%) 감면.
 * - 실물이전 제도 2024.10.31 시행(상품 팔지 않고 계좌째 금융사 이동).
 * - DB vs DC 손익분기 = 임금상승률(자체 계산: 초임 월 300만·상승 3%·20년 → DB 1억 521만,
 *   DC 수익률 3%일 때 정확히 동일·6%면 +3,489만·2%면 -916만. python 검산).
 * - 퇴직급여 사외적립 의무화: 2026.2 노사정 TF 합의·법 개정 추진 단계(시행 시기 미확정 — 단정 서술 금지).
 * 출처: 금융감독원 통합연금포털·보도자료, 고용노동부.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/retirement-pension/";
const UPDATED = "2026-07-23"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_DEFAULT_OPT = "/blog/2026-07-23-retirement-pension-default-option/"; // 디폴트옵션 글(클러스터 짝)
const SRC_PILLAR = "/guides/three-pillar-pension/"; // 3층 연금 전체 구조
const SRC_LUMP = "/blog/2026-06-29-retirement-pay-lump-vs-pension/"; // 일시금 vs 연금
const SRC_ISA = "/blog/2026-06-25-isa-irp-pension-savings-comparison/"; // ISA·IRP·연금저축
const SRC_ARREARS = "/guides/retirement-pension-arrears/"; // 부담금 미납 대응 가이드
const SRC_CALC = "/tools/retirement-pay/"; // 퇴직금 계산기
const SRC_MONEY = "/money/";

// 공식 출처
const SRC_FSS = "https://100lifeplan.fss.or.kr"; // 금감원 통합연금포털(내 연금 조회)

const OG_TITLE = "퇴직연금 DB·DC·IRP 차이 — 내 유형 확인법 (2026)";
const OG_DESC =
  "DB는 회사 책임, DC·IRP는 내 운용 — 수익률 DB 3.53%·DC 8.47%·IRP 9.44%(2025). 갈아타기 손익분기까지 직접 계산한 가이드.";

export const metadata: Metadata = {
  title: "퇴직연금 DB·DC·IRP 차이 — 내 유형 확인법 (2026) | 팁픽",
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

// ★ 세 유형 한 줄 비교 (글의 중심 표)
const TYPES = [
  {
    axis: "받는 돈이 정해지는 방식",
    db: "확정 — 퇴직 직전 30일분 평균임금 × 근속연수",
    dc: "내 운용 결과 — 회사가 매년 연봉의 1/12 입금, 불리는 건 내 몫",
    irp: "내 운용 결과 — 내가 넣은 돈 + 이직 때 받은 퇴직급여",
  },
  {
    axis: "굴리는 사람",
    db: "회사(운용 손익도 회사 몫)",
    dc: "나",
    irp: "나",
    accent: true,
  },
  {
    axis: "2025년 평균 수익률",
    db: "3.53%",
    dc: "8.47%",
    irp: "9.44%",
    accent: true,
  },
  {
    axis: "유리한 사람",
    db: "임금이 꾸준히 오르는 장기 근속자",
    dc: "임금상승이 완만하거나 운용에 자신 있는 사람",
    irp: "이직이 잦은 사람·세액공제가 필요한 모든 직장인",
  },
];

// DB vs DC 갈림길 (DepthCard)
const CHOICE = [
  {
    k: "판단축은 하나",
    v: "DB의 수익률은 사실상 '내 임금상승률'이고, DC의 수익률은 '내 운용수익률'입니다. 앞으로 임금이 오르는 속도와 내가 굴려서 낼 수익 중 어느 쪽이 빠를지가 갈림길의 전부예요.",
    accent: true,
  },
  {
    k: "DB가 유리한 경우",
    v: "호봉제·연공서열로 임금이 매년 또박또박 오르는 회사, 승진·정년까지 장기 근속이 예상되는 경우. 운용 스트레스 없이 마지막 월급 기준으로 받는 게 강점입니다.",
  },
  {
    k: "DC가 유리한 경우",
    v: "임금피크제를 앞뒀거나(마지막 임금이 깎이면 DB는 직격), 연봉제라 상승률이 완만하거나, 이직 계획이 있는 경우. 임금피크제 진입 직전 DB→DC 전환은 실무에서 가장 흔한 갈아타기예요.",
    accent: true,
  },
  {
    k: "전환은 사실상 편도",
    v: "회사 규약에 따라 DB→DC 전환은 열려 있는 곳이 많지만, DC→DB로 되돌리는 건 원칙적으로 안 됩니다. 갈아타기 전에 아래 계산을 내 숫자로 꼭 해 보세요.",
  },
];

// 자체 계산 — 초임 월 300만·임금상승 3%·20년 근속 (python 검산)
const CALC_ROWS = [
  {
    item: "DB로 받는 돈",
    calc: "최종 월급 526만 1천 원 × 20년",
    result: "약 1억 521만 원",
    accent: true,
  },
  {
    item: "DC — 운용 연 2%",
    calc: "매년 월급 1개월분 납입 + 2% 복리",
    result: "약 9,605만 원 (DB보다 916만 적음)",
  },
  {
    item: "DC — 운용 연 3%",
    calc: "수익률 = 임금상승률",
    result: "약 1억 521만 원 (DB와 동일)",
    accent: true,
  },
  {
    item: "DC — 운용 연 6%",
    calc: "매년 월급 1개월분 납입 + 6% 복리",
    result: "약 1억 4,010만 원 (DB보다 3,489만 많음)",
    accent: true,
  },
];

// IRP의 세 가지 얼굴 (DepthCard)
const IRP_ROLES = [
  {
    k: "① 퇴직금 받는 그릇",
    v: "이직·퇴직하면 퇴직급여는 원칙적으로 IRP 계좌로 지급됩니다. 55세 이후 수령 등 예외를 빼면, 직장인이라면 언젠가 반드시 만나는 계좌예요.",
  },
  {
    k: "② 세액공제 계좌",
    v: "내 돈을 추가로 넣으면 연금저축과 합산 연 900만 원까지 세액공제 대상입니다. 총급여 5,500만 원 이하는 16.5%로 최대 148만 5천 원, 초과는 13.2%로 최대 118만 8천 원을 연말정산에서 돌려받아요.",
    accent: true,
  },
  {
    k: "③ 세금 미루는 통로",
    v: "퇴직금을 IRP로 받아 55세 이후 연금으로 나눠 받으면 퇴직소득세의 30%(수령 11년차부터는 40%)를 깎아 줍니다. 일시금으로 깨는 순간 이 감면은 사라져요.",
    accent: true,
  },
  {
    k: "⚠️ 중도해지 비용",
    v: "세액공제 받은 납입금과 운용수익은 중도해지 시 기타소득세 16.5%로 돌려받은 것보다 더 토해낼 수 있습니다. IRP 추가납입은 55세까지 묶어도 되는 돈으로만 하세요.",
  },
];

// 2026 흐름 (DepthCard)
const TRENDS = [
  {
    k: "수익률 격차 공개",
    v: "2025년 퇴직연금 전체 수익률은 6.47%로 제도 도입 후 최고였지만, 원리금보장형(3.09%)과 실적배당형(16.8%)의 격차가 그대로 드러났습니다. 적립금 501조 원 시대에 '어디에 두느냐'가 본격적으로 성적을 가르기 시작했어요.",
    accent: true,
  },
  {
    k: "실물이전 제도",
    v: "2024년 10월부터 보유 상품을 팔지 않고 계좌째 다른 금융사로 옮길 수 있습니다(실물이전). 수수료·상품 라인업이 불만이면 해지 없이 이사할 수 있게 된 거예요.",
  },
  {
    k: "디폴트옵션 점검",
    v: "DC·IRP에서 운용지시 없이 방치된 돈은 미리 지정한 디폴트옵션 상품으로 자동 운용됩니다. 적립금의 85.4%가 초저위험(2025년 수익률 2.6%)에 쏠려 있어, 지정 상품 확인이 사실상 수익률 관리의 첫 단추입니다.",
    accent: true,
  },
  {
    k: "사외적립 의무화 논의",
    v: "퇴직급여를 회사 밖(금융기관)에 의무 적립하는 법 개정이 2026년 2월 노사정 합의를 거쳐 추진되고 있습니다. 시행 시기·단계는 확정 전이므로, 도입되면 소규모 사업장 근로자의 수급 안전판이 넓어지는 방향으로 이해하면 됩니다.",
  },
];

const FAQS = [
  {
    q: "내가 DB인지 DC인지 어떻게 확인하나요?",
    a: "세 갈래가 있습니다. ① 회사 인사·총무팀에 퇴직연금 규약을 물어보는 것이 가장 빠르고, ② 급여명세나 사내 복지 포털의 퇴직연금 항목에서도 보입니다. ③ 회사를 통하지 않으려면 금융감독원 통합연금포털의 '내 연금 조회'에서 내 이름으로 가입된 퇴직연금 계좌와 유형이 한 번에 나옵니다. 회사가 DB·DC를 모두 운영하며 선택권을 주는 곳도 있으니, 규약상 전환 가능 여부까지 함께 확인해 두세요.",
  },
  {
    q: "DB에서 DC로 갈아탔는데 후회되면 되돌릴 수 있나요?",
    a: "원칙적으로 안 됩니다. 대부분 회사 규약이 DB→DC 한 방향만 열어 두고 있어, DC로 옮긴 뒤 임금이 예상보다 가파르게 오르더라도 되돌릴 수 없습니다. 그래서 전환 판단은 '남은 근속기간의 임금상승률 vs 내 운용수익률' 비교를 내 숫자로 해 본 다음이어야 합니다. 이 페이지의 20년 계산처럼 수익률이 임금상승률과 같으면 두 제도의 결과는 같습니다.",
  },
  {
    q: "회사가 어려워지면 내 퇴직연금은 어떻게 되나요?",
    a: "DC와 IRP는 애초에 내 명의 계좌에 들어와 있는 돈이라 회사 사정과 분리됩니다. DB는 회사가 적립금을 사외(금융기관)에 일정 비율 이상 쌓도록 의무화되어 있어 전액 사내에 두던 과거보다는 안전하지만, 적립비율이 낮은 회사라면 미적립분은 회사 지급 능력에 기대게 됩니다. 회사 재무가 불안하다면 DB 적립비율을 확인해 보고, 규약상 가능하다면 DC 전환도 선택지가 됩니다.",
  },
  {
    q: "이직하면 퇴직연금은 어떻게 옮기나요?",
    a: "퇴직급여는 원칙적으로 본인 명의 IRP 계좌로 지급받습니다(55세 이후 퇴직 등 예외 제외). 받은 뒤 갈림길은 둘이에요 — 그대로 IRP에서 굴리며 55세 이후 연금으로 받으면 퇴직소득세 30~40% 감면을 챙길 수 있고, 해지해 현금화하면 감면 없이 세금을 다 내게 됩니다. 새 회사에 DC가 있다면 거기로 이어 굴리는 방법도 있습니다.",
  },
  {
    q: "급하게 돈이 필요한데 중도인출이 되나요?",
    a: "DB는 중도인출이 아예 안 되고, DC·IRP도 법이 정한 사유일 때만 됩니다 — 무주택자의 주택 구입·전세보증금, 본인·가족의 6개월 이상 요양(연간 임금총액의 12.5% 초과 의료비), 파산·개인회생, 대규모 재난 피해 등입니다. 사유에 해당해도 세액공제 받았던 돈과 운용수익에는 기타소득세 16.5%가 붙을 수 있으니, 담보대출 등 계좌를 깨지 않는 방법과 먼저 비교해 보세요.",
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

export default function RetirementPensionGuide() {
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
        name: "퇴직연금 가이드",
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
              퇴직연금 DB·DC·IRP —
              <br className="hidden sm:block" /> 내 유형부터 갈아타기 판단까지
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              같은 퇴직연금인데 2025년 성적은 <strong>DB 3.53% · DC 8.47% · IRP 9.44%</strong>로
              갈렸습니다(금융감독원, 적립금 501조 원). 수익률 차이처럼 보이지만 실은 구조 차이예요 —
              DB는 회사가 굴려 정해진 금액을 주고, DC·IRP는 내가 굴린 결과를 받습니다.
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              그래서 &lsquo;어느 유형이 좋은가&rsquo;의 답은 하나로 모입니다 —{" "}
              <strong>내 임금상승률과 내 운용수익률 중 어느 쪽이 빠른가.</strong> 이 페이지에서 세 유형
              차이를 표 하나로 잡고, 20년 근속 시나리오로 갈림길을 직접 계산합니다. (연금 전체 뼈대가
              먼저라면{" "}
              <Link
                href={SRC_PILLAR}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                3층 연금 가이드
              </Link>
              부터 보세요)
            </p>

            {/* 핵심 요약 박스 (인라인 · 값은 본문에서) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "구조 한 줄",
                  v: "DB 회사 / DC·IRP 나",
                  d: "굴리는 사람 = 손익 책임자",
                },
                {
                  k: "2025 수익률",
                  v: "DC 8.47 · IRP 9.44%",
                  d: "DB 3.53% · 전체 6.47%",
                },
                {
                  k: "갈아타기 기준",
                  v: "임금상승률이 분기점",
                  d: "수익률이 이기면 DC 유리",
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
          {/* 1. ★ 세 유형 비교표 (글의 중심) */}
          <section>
            <SectionTitle
              kicker="구조부터 잡기"
              title="DB·DC·IRP, 무엇이 어떻게 다른가"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              용어부터 풀면 — <strong className="text-slate-800">DB(확정급여형)</strong>는 받을 금액이
              확정, <strong className="text-slate-800">DC(확정기여형)</strong>는 회사가 넣는 금액이
              확정, <strong className="text-slate-800">IRP(개인형)</strong>는 회사와 무관한 내 개인
              계좌입니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold">DB (확정급여)</th>
                    <th className="px-4 py-3 font-semibold">DC (확정기여)</th>
                    <th className="px-4 py-3 font-semibold">IRP (개인형)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TYPES.map((r) => (
                    <tr key={r.axis} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {r.axis}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.db}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.dc}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent ? "font-medium text-indigo-700" : "text-slate-600"
                        }`}
                      >
                        {r.irp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 수익률은 금융감독원 2025년 연간 공시 기준 평균값입니다. DB의 3.53%는 회사가 운용한
              결과라 근로자가 받는 돈과는 무관하고(받을 금액은 임금으로 확정), DC·IRP는 그대로 내
              계좌의 성적입니다.
            </p>
          </section>

          {/* 2. DB vs DC 갈림길 */}
          <section>
            <SectionTitle
              kicker="갈아탈까 그대로 둘까"
              title="DB vs DC — 판단축은 임금상승률 하나"
            />
            <DepthCard
              tone="indigo"
              badge="선택 기준"
              title="임금이 빨리 오르면 DB, 운용이 이기면 DC"
              sub="임금피크제 앞이라면 전환 검토 1순위"
              rows={CHOICE}
            />
          </section>

          {/* 3. 자체 계산 — 20년 근속 시나리오 */}
          <section>
            <SectionTitle
              kicker="직접 계산해 보면"
              title="초임 300만·20년 근속, 갈림길은 정확히 3%"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-800">
                초임 월 300만 원, 임금상승률 연 3%, 20년 근속
              </strong>
              을 가정하고 DB와 DC(운용수익률 2%·3%·6%)를 비교했습니다. 매년 월급 1개월분이
              적립되는 단순 모델의 계산입니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">선택</th>
                    <th className="px-4 py-3 font-semibold">계산</th>
                    <th className="px-4 py-3 font-semibold">20년 뒤</th>
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
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 운용수익률이 임금상승률(3%)과 같으면 DB와 DC의 결과가 정확히 일치합니다 — 이게 이
              선택의 수학적 분기점입니다. 실제로는 승진·임금피크제로 상승률이 일정하지 않고 퇴직 직전
              3개월 평균임금 기준 등 세부 규정이 있으므로, 방향을 잡는 용도로 보고 내 숫자는 회사
              규약·급여로 다시 계산해 보세요. 지시 없이 방치한 DC 자금이 어디로 가는지는{" "}
              <Link
                href={SRC_DEFAULT_OPT}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                디폴트옵션 등급별 수익률 글
              </Link>
              에서 이어집니다.
            </p>
          </section>

          {/* 4. IRP의 세 가지 얼굴 */}
          <section>
            <SectionTitle
              kicker="셋 중 유일하게 내가 여는 계좌"
              title="IRP — 퇴직금 그릇이자 연 148만 원 환급 카드"
            />
            <DepthCard
              tone="slate"
              badge="IRP 활용"
              title="받는 그릇 · 세액공제 · 세금 미루기"
              sub="연금저축 합산 한도 연 900만 원"
              rows={IRP_ROLES}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              세액공제 계좌를 IRP·연금저축·ISA 중 어디부터 채울지는{" "}
              <Link
                href={SRC_ISA}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                ISA·IRP·연금저축 비교
              </Link>
              에서 자세히 다룹니다.
            </p>
          </section>

          {/* 5. 2026 흐름 */}
          <section>
            <SectionTitle
              kicker="지금 알아둘 변화"
              title="501조 시대의 퇴직연금 — 2026년 체크포인트"
            />
            <DepthCard
              tone="indigo"
              badge="2025~2026"
              title="수익률 공개 경쟁 · 실물이전 · 디폴트옵션"
              sub="금융감독원·고용노동부"
              rows={TRENDS}
            />
          </section>

          {/* 6. 체크리스트 */}
          <section>
            <SectionTitle kicker="오늘 점검" title="퇴직연금 5분 점검 6가지" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">내 유형</strong> — DB인지 DC인지, 회사 규약상
                  전환이 가능한지 확인했나
                </li>
                <li>
                  <strong className="text-slate-800">갈림길 계산</strong> — 내 임금상승률과
                  운용수익률을 넣어 20년 계산을 내 숫자로 해 봤나
                </li>
                <li>
                  <strong className="text-slate-800">디폴트옵션</strong> — DC·IRP의 사전지정 상품이
                  내 은퇴까지 남은 기간과 맞는 등급인가
                </li>
                <li>
                  <strong className="text-slate-800">세액공제</strong> — 연금저축과 합쳐 연 900만 원
                  한도를 얼마나 쓰고 있나
                </li>
                <li>
                  <strong className="text-slate-800">수수료·라인업</strong> — 불만이면 실물이전으로
                  금융사를 옮길 수 있다는 걸 아나
                </li>
                <li>
                  <strong className="text-slate-800">수령 계획</strong> — 55세 이후 연금 수령(퇴직소득세
                  30~40% 감면)까지 그림을 그려 뒀나
                </li>
              </ul>
            </div>
          </section>

          {/* 7. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 갈아타기 전 꼭 확인
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                DC 전환은 되돌아오는 문이 없습니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                DB→DC 전환은 대부분 규약에서 허용하지만 반대 방향은 원칙적으로 막혀 있습니다. 전환하는
                순간 그때까지 쌓인 DB 급여가 정산되어 DC 계좌로 넘어오고, 이후 임금이 가파르게 올라도
                소급되지 않아요. 중도인출도 법정 사유가 아니면 불가능해 &lsquo;급하면 빼 쓰지&rsquo;라는
                계산은 통하지 않습니다. 전환·인출 모두 결정 전에{" "}
                <a
                  href={SRC_FSS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  통합연금포털
                </a>
                에서 내 계좌 현황부터 조회하고, 회사 규약과 세금까지 따져 본 뒤 움직이세요.
              </p>
            </div>
          </section>

          {/* 8. FAQ — 네이티브 details/summary */}
          <section>
            <SectionTitle
              kicker="애매한 경우"
              title="회사가 어려우면? 이직하면? — 경계 사례 문답"
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
            <SectionTitle kicker="2층을 채웠다면" title="연금·퇴직금 설계, 이어서 보기" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_DEFAULT_OPT}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  디폴트옵션 등급별 수익률 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  이 가이드의 짝 — 방치된 DC·IRP 자금의 자동 운용 등급이 30년 뒤 2억을 가르는 계산.
                </p>
              </Link>
              <Link
                href={SRC_LUMP}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  퇴직금, 일시금 vs 연금 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  받을 때의 갈림길 — 퇴직소득세 감면까지 넣은 실수령 비교.
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
                  국민·퇴직·개인연금 전체 뼈대 — 퇴직연금이 어디에 놓이는지 큰 그림.
                </p>
              </Link>
              <Link
                href={SRC_CALC}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  퇴직금 계산기 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  평균임금 기준 내 퇴직금이 얼마인지부터 확인.
                </p>
              </Link>
              <Link
                href={SRC_ARREARS}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  부담금이 안 들어왔다면 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  DC 계정이 비어 있을 때 — 확인 경로와 조치 순서, 지연이자 연 10%·20%.
                </p>
              </Link>
            </div>
          </section>

          {/* 10. 발견 CTA — 제휴 링크 없음 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_FSS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">내 연금 계좌 한 번에 조회 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                금융감독원 통합연금포털 · 퇴직연금 유형·적립금 확인
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
              본 페이지의 수익률·적립금은 금융감독원 2025년 말 공시({UPDATED} 확인) 기준이며, 과거
              수익률은 미래 수익을 보장하지 않습니다. 20년 계산은 단순화 모델로 실제 퇴직급여 산정
              (퇴직 직전 3개월 평균임금 등)과 다를 수 있고, 제도 전환·세금은 회사 규약과 개인 상황에
              따라 달라지므로 결정 전 회사·금융사·통합연금포털에서 본인 수치를 확인하시기 바랍니다.
              본 내용은 정보 제공을 위한 것이며 투자·세무 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 금융감독원 통합연금포털 — 퇴직연금 수익률 공시·내 연금 조회 (
                <a
                  href={SRC_FSS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  100lifeplan.fss.or.kr
                </a>
                )
              </li>
              <li>· 고용노동부 — 퇴직급여제도(DB·DC·IRP)·중도인출 사유·디폴트옵션 안내</li>
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
