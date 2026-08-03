import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 생활금융 가이드 — 숨은 돈 통합 조회 (창구별 동선·준비물·막히는 지점)
 *
 * ▷ 2026-08-03 A형 클러스터: 경제 글 "숨은 내 돈 찾기 — 창구 6곳과 소멸 시효"의 짝 허브.
 *   역할 분리 — 글 = 무엇이 언제 사라지나(시효·금액 계산) / 가이드 = 어디서 어떻게 조회하나(동선).
 * ▷ 독립 정적 라우트. src/content/posts/*.md도 데이터층도 건드리지 않음.
 * ▷ 본문은 JSX로 직접 배치(표 깨짐 방지). 외부 커스텀 컴포넌트는 Header/Footer만.
 *   SectionTitle·DepthCard는 인라인(retirement-pension-arrears / deposit-protection과 동일 토큰).
 *
 * [사실 검증 2026-08-03]
 * - 파인(fine.fss.or.kr): 금융감독원 금융소비자정보포털. '잠자는 내 돈 찾기' + '내 계좌 한눈에'.
 * - 어카운트인포/계좌정보통합관리서비스(payinfo.or.kr): 금융결제원 운영. 은행·보험·상호금융·대출·
 *   카드발급 정보와 자동이체 등록정보 일괄 조회, 소액 비활동성 계좌 즉시 해지·잔고이전.
 *   건보·국민연금·국세·지방세 과오납/환급금 찾기와 휴면예금 찾기 연결 제공.
 * - 휴면예금 찾아줌(서민금융진흥원, kinfa.or.kr): 앱 '서민금융 잇다', 서민금융콜센터 1397.
 *   금융회사에서 이관된 뒤에도 원권리자가 청구 가능.
 * - 내보험찾아줌: 생명·손해보험협회 통합조회. 본인 명의 계약의 가입내역·미청구 보험금 24시간 조회.
 * - 보조금24(정부24 gov.kr/portal/rcvfvrSvc): 로그인 + 최초 1회 이용 동의 후 목록 표시.
 *   '이미 받고 있는 혜택' / '신청하면 받을 수 있는 혜택' / '담당자 확인 필요' 3종으로 구분되어 나옴.
 * - 시효: 국세환급금·경정청구 5년(국세기본법 제54조·제45조의2), 지방세환급금 5년(지방세기본법),
 *   보험금 청구권 3년(상법 제662조), 국민연금 급여 5년·분할연금 3년(수급권 자체는 소멸하지 않음).
 * - 카드포인트 유효기간은 카드사 약관·포인트 종류에 따라 다름(일률적 5년이 아님).
 * 출처: 금융감독원, 금융결제원, 서민금융진흥원, 행정안전부·정부24, 국가법령정보센터.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/hidden-money-checkup/";
const UPDATED = "2026-08-03"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_POST = "/blog/2026-08-03-hidden-money-refund-deadline/"; // 클러스터 짝 글
const SRC_YEAREND = "/blog/2026-06-27-year-end-tax-settlement-guide/"; // 연말정산 구조
const SRC_CARD = "/blog/2026-07-01-card-tax-deduction-strategy/"; // 카드 소득공제
const SRC_INSURE = "/blog/2026-07-11-insurance-remodeling/"; // 보험 리모델링
const SRC_TAXGUIDE = "/guides/comprehensive-income-tax-filing/"; // 종합소득세 신고
const SRC_MEDIAN = "/tools/median-income/"; // 기준 중위소득 계산기
const SRC_MONEY = "/money/";

// 공식 조회처
const SRC_PAYINFO = "https://www.payinfo.or.kr"; // 어카운트인포
const SRC_FINE = "https://fine.fss.or.kr"; // 금감원 파인
const SRC_GOV = "https://www.gov.kr/portal/rcvfvrSvc/main"; // 보조금24

const OG_TITLE = "숨은 돈 통합 조회 — 창구별 동선과 준비물 (2026)";
const OG_DESC =
  "미환급금·휴면예금·숨은 보험금·카드포인트를 30분에 도는 순서 — 창구별 접속 경로, 인증 준비물, 화면에서 막히는 지점을 정리한 가이드.";

export const metadata: Metadata = {
  title: "숨은 돈 통합 조회 가이드 — 창구별 동선과 준비물 | 팁픽",
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

// ★ 창구별 동선 (이 가이드의 중심 표)
const DESKS = [
  {
    order: "1 · 5분",
    where: "어카운트인포",
    what: "잊은 계좌·카드포인트·자동이체",
    ready: "간편인증 또는 공동인증서",
    note: "소액 비활동성 계좌는 그 자리에서 해지·잔고이전",
  },
  {
    order: "2 · 5분",
    where: "내보험찾아줌",
    what: "가입 내역과 미청구 보험금",
    ready: "본인 인증",
    note: "시효 3년으로 가장 짧아 먼저 본다",
    accent: true,
  },
  {
    order: "3 · 5분",
    where: "휴면예금 찾아줌",
    what: "이관된 예금·보험금",
    ready: "본인 인증 / 콜센터 1397",
    note: "이관 후에도 원래 주인이 청구 가능",
  },
  {
    order: "4 · 10분",
    where: "홈택스",
    what: "미수령 환급금 + 경정청구",
    ready: "인증 + 월세·의료비 증빙",
    note: "가장 오래 걸리지만 금액도 가장 크다",
    accent: true,
  },
  {
    order: "5 · 3분",
    where: "위택스",
    what: "지방세 과오납·환급금",
    ready: "본인 인증",
    note: "자동차세·재산세 과오납이 주로 잡힘",
  },
  {
    order: "6 · 5분",
    where: "정부24 보조금24",
    what: "아직 신청 안 한 혜택",
    ready: "정부24 로그인 + 최초 1회 이용 동의",
    note: "'이미 받은 돈'이 아니라 '앞으로 받을 돈'",
    accent: true,
  },
];

// 시작 전 준비 (DepthCard)
const PREP = [
  {
    k: "인증 수단 하나",
    v: "여섯 창구 모두 본인 인증이 필요합니다. 간편인증(카카오·네이버·통신사 PASS 등)이나 공동인증서 중 하나를 미리 준비해 두면 실제 걸리는 시간이 절반으로 줄어듭니다. 인증서를 새로 발급받는 데서 대부분의 시간이 사라집니다.",
    accent: true,
  },
  {
    k: "휴대폰과 PC 병행",
    v: "조회는 모바일이 빠르고, 홈택스 경정청구처럼 서류를 올려야 하는 작업은 PC가 편합니다. 1~3번은 앱으로, 4~6번은 PC로 나눠 하면 전체가 매끄럽습니다.",
  },
  {
    k: "증빙 미리 찾기",
    v: "경정청구까지 갈 생각이라면 임대차계약서, 월세 이체 내역, 의료비 지출 증빙을 먼저 모아 두세요. 조회만 하고 청구를 다음으로 미루면 대개 다시 안 하게 됩니다.",
    accent: true,
  },
  {
    k: "가족 것도 함께",
    v: "부모님 명의 계좌·보험은 본인 인증으로는 조회되지 않습니다. 다만 함께 계실 때 같은 순서로 한 번 돌아 드리면 대개 여기서 가장 큰 금액이 나옵니다. 돌아가신 가족의 재산은 안심상속 원스톱서비스라는 별도 창구를 씁니다.",
  },
];

// 화면에서 막히는 지점 (DepthCard)
const STUCK = [
  {
    k: "보조금24 목록이 비어 있다",
    v: "로그인만 하고 이용 동의를 안 했을 때 자주 생깁니다. 최초 1회 서비스 이용 동의를 체크해야 행정정보를 조회해 목록을 만들어 줍니다. 동의 후에도 반영에 시간이 걸릴 수 있어요.",
    accent: true,
  },
  {
    k: "조회 결과가 0건이다",
    v: "정말 없을 수도 있지만 조회 범위 밖일 수도 있습니다. 어카운트인포는 참여 금융회사 기준이고, 내보험찾아줌은 본인 명의 계약만 봅니다. 예전에 쓰던 다른 명의나 해외 계좌는 잡히지 않습니다.",
  },
  {
    k: "포인트가 조회는 되는데 출금이 안 된다",
    v: "카드사별로 최소 전환 단위(예: 1,000포인트 이상)를 두는 경우가 있습니다. 단위에 못 미치면 계좌 입금 대신 카드 결제대금 차감으로 쓰는 편이 낫습니다.",
  },
  {
    k: "경정청구 화면을 못 찾겠다",
    v: "홈택스에서 '경정청구'는 신고 메뉴 안쪽에 있습니다. 근로소득만 있는 경우와 종합소득 확정신고 대상인 경우 경로가 달라, 헤매는 시간이 아깝다면 관할 세무서나 국세상담센터(126)에 화면 경로를 물어보는 편이 빠릅니다.",
    accent: true,
  },
];

const FAQS = [
  {
    q: "이런 통합조회 서비스는 수수료가 있나요?",
    a: "본문에서 안내한 창구는 모두 공공·협회가 운영하는 무료 서비스입니다. 어카운트인포는 금융결제원, 파인은 금융감독원, 휴면예금 찾아줌은 서민금융진흥원, 보조금24는 행정안전부·정부24가 운영합니다. 반대로 '숨은 돈 찾아 드립니다' 하며 수수료를 요구하거나 개인정보를 먼저 요구하는 곳은 이 창구들과 무관합니다. 조회 자체가 무료이고 몇 분이면 끝나므로 대행을 맡길 이유가 없습니다.",
  },
  {
    q: "조회만 해도 신용점수나 세무에 영향이 있나요?",
    a: "없습니다. 계좌·보험·포인트 조회는 본인 정보를 확인하는 절차일 뿐이라 신용평가에 반영되지 않습니다. 대출 관련 조회와 혼동하기 쉬운데, 어카운트인포에서 보는 것은 이미 있는 내 계약 목록입니다. 경정청구도 정당한 권리 행사이고 가산세가 붙지 않습니다. 다만 청구 내용은 사실 확인 대상이 되므로 증빙 없는 항목은 넣지 마세요.",
  },
  {
    q: "휴면예금은 이자가 계속 붙나요?",
    a: "휴면예금으로 넘어가면 원래 약정 이자가 계속 붙는다고 보기 어렵습니다. 그래서 '나중에 찾아도 그대로 있으니 급할 것 없다'는 생각은 절반만 맞습니다. 원금을 잃지는 않지만 그동안 굴렸을 기회는 사라집니다. 조회에 5분이면 되니 미룰 이유가 없고, 찾은 뒤 어디에 둘지는 파킹통장·CMA 비교로 이어서 정하면 됩니다.",
  },
  {
    q: "회사를 여러 번 옮겼는데 그때마다 놓친 게 있을까요?",
    a: "가능성이 높은 쪽은 세 가지입니다. 첫째 퇴직연금 계좌가 이전 회사 금융사에 남아 있는 경우, 둘째 중도 입·퇴사한 해의 연말정산이 정산되지 않아 환급이 남은 경우, 셋째 급여 계좌로 쓰던 은행 계좌가 방치돼 휴면으로 넘어간 경우입니다. 어카운트인포에서 계좌를, 홈택스에서 미수령 환급금을 보면 대부분 드러납니다. 퇴직연금은 별도로 가입 금융사에서 확인하세요.",
  },
  {
    q: "미성년 자녀 명의로도 조회할 수 있나요?",
    a: "법정대리인 자격으로 조회할 수 있는 서비스가 있고, 자녀 본인 인증이 필요한 서비스가 있어 창구마다 다릅니다. 실무적으로는 자녀 명의 계좌·보험이 있다면 어카운트인포와 내보험찾아줌에서 법정대리인 절차를 먼저 확인하는 것이 빠릅니다. 세뱃돈 계좌처럼 오래 방치된 계좌가 휴면으로 넘어간 사례가 흔합니다.",
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

export default function HiddenMoneyCheckupGuide() {
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
        name: "숨은 돈 통합 조회 가이드",
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
              2026년 기준 · 생활금융
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              숨은 돈 통합 조회 —
              <br className="hidden sm:block" /> 30분에 여섯 곳 도는 법
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              미환급금·휴면예금·숨은 보험금·카드포인트는 <strong>한 사이트에서 다 되지 않습니다.</strong>
              성격이 다른 돈은 관리 주체가 달라서예요. 여섯 창구를 어떤 순서로, 무엇을 준비해서
              도는지 정리했습니다.
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              순서를 정하는 기준은 금액이 아니라 <strong>시효</strong>입니다. 보험금은 3년, 세금은
              5년, 휴면예금은 사실상 시효가 없어요. 무엇이 언제 사라지는지와 실제 회수 금액은{" "}
              <Link
                href={SRC_POST}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                창구별 시효 정리 글
              </Link>
              에서 계산했습니다.
            </p>

            {/* 핵심 요약 박스 */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "먼저 볼 것",
                  v: "보험금 (3년)",
                  d: "시효가 가장 짧다",
                },
                {
                  k: "금액이 큰 것",
                  v: "세금 (5년)",
                  d: "경정청구로 5개 연도",
                },
                {
                  k: "필요한 준비",
                  v: "인증 수단 하나",
                  d: "여섯 곳 모두 본인 인증",
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
          {/* 1. ★ 창구별 동선 (중심 표) */}
          <section>
            <SectionTitle
              kicker="전체 동선"
              title="여섯 창구, 이 순서가 가장 빠릅니다"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              시효가 짧은 것과 확인이 빠른 것을 섞어 배치했습니다. 1~3번은 조회만으로 끝나고,
              4번부터가 실제로 <strong className="text-slate-800">청구 작업</strong>입니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">순서</th>
                    <th className="px-4 py-3 font-semibold">어디서</th>
                    <th className="px-4 py-3 font-semibold">무엇을</th>
                    <th className="px-4 py-3 font-semibold">준비물</th>
                    <th className="px-4 py-3 font-semibold">메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DESKS.map((d) => (
                    <tr key={d.where} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {d.order}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          d.accent ? "text-indigo-700" : "text-slate-700"
                        }`}
                      >
                        {d.where}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{d.what}</td>
                      <td className="px-4 py-3 text-slate-500">{d.ready}</td>
                      <td className="px-4 py-3 text-slate-500">{d.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 1·3번은{" "}
              <a
                href={SRC_PAYINFO}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                어카운트인포
              </a>
              에서, 2·3번은{" "}
              <a
                href={SRC_FINE}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                금융감독원 파인
              </a>
              의 &lsquo;잠자는 내 돈 찾기&rsquo;에서도 연결됩니다. 어느 쪽으로 들어가도 같은 자료를
              봅니다.
            </p>
          </section>

          {/* 2. 시작 전 준비 */}
          <section>
            <SectionTitle
              kicker="시작 전 5분"
              title="이것만 챙기면 시간이 절반으로 준다"
            />
            <DepthCard
              tone="indigo"
              badge="준비물"
              title="대부분의 시간은 인증에서 사라진다"
              sub="조회 자체는 창구당 3~5분이면 끝난다"
              rows={PREP}
            />
          </section>

          {/* 3. 화면에서 막히는 지점 */}
          <section>
            <SectionTitle
              kicker="실제로 겪는 것"
              title="목록이 비어 있거나 출금이 안 될 때"
            />
            <DepthCard
              tone="slate"
              badge="막히는 지점"
              title="결과가 0건이라고 없는 건 아니다"
              sub="조회 범위와 전환 단위를 먼저 확인"
              rows={STUCK}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              경정청구까지 갈 계획이라면 무엇을 놓쳤는지부터 짚는 게 순서입니다.{" "}
              <Link
                href={SRC_YEAREND}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                연말정산 환급 구조
              </Link>
              와{" "}
              <Link
                href={SRC_CARD}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                카드 소득공제 전략
              </Link>
              을 함께 보세요. 확정신고 대상이면{" "}
              <Link
                href={SRC_TAXGUIDE}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                종합소득세 신고 가이드
              </Link>
              로 절차가 갈립니다.
            </p>
          </section>

          {/* 4. 체크리스트 */}
          <section>
            <SectionTitle kicker="오늘 30분" title="한 번에 끝내는 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">인증 준비</strong> — 간편인증이나 공동인증서를
                  쓸 수 있는 상태인가
                </li>
                <li>
                  <strong className="text-slate-800">계좌·포인트</strong> — 어카운트인포에서 모르는
                  계좌와 카드포인트를 확인하고 소액 계좌는 정리했나
                </li>
                <li>
                  <strong className="text-slate-800">보험</strong> — 내보험찾아줌에서 미청구 보험금이
                  있는지 봤나 (시효 3년, 가장 급함)
                </li>
                <li>
                  <strong className="text-slate-800">휴면예금</strong> — 이관된 예금·보험금이 있는지
                  조회했나
                </li>
                <li>
                  <strong className="text-slate-800">세금</strong> — 홈택스 미수령 환급금을 보고,
                  놓친 공제가 있으면 경정청구까지 진행했나
                </li>
                <li>
                  <strong className="text-slate-800">지방세·혜택</strong> — 위택스 과오납과 보조금24
                  목록을 확인했나
                </li>
              </ul>
            </div>
          </section>

          {/* 5. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 대행을 맡길 이유가 없습니다
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                여기 소개한 창구는 전부 무료입니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                어카운트인포는 금융결제원, 파인은 금융감독원, 휴면예금 찾아줌은 서민금융진흥원,
                보조금24는 행정안전부·정부24가 운영하는 <strong>공적 서비스</strong>입니다. 조회에
                수수료가 없고, 인증만 되면 몇 분이면 끝납니다. 그래서 &lsquo;숨은 돈을 찾아 주겠다&rsquo;며
                수수료나 개인정보를 먼저 요구하는 곳에 맡길 이유가 없습니다. 주소가 위 기관 도메인이
                맞는지 확인하고 들어가세요.
              </p>
            </div>
          </section>

          {/* 6. FAQ */}
          <section>
            <SectionTitle
              kicker="자주 걸리는 질문"
              title="수수료는? 신용점수는? — 조회 전에 궁금한 것들"
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
            <SectionTitle kicker="찾았다면" title="되찾은 뒤에 볼 것들" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_POST}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  창구별 시효와 회수액 계산 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  이 가이드의 짝 — 무엇이 언제 닫히고 5년 소급이 얼마인지.
                </p>
              </Link>
              <Link
                href={SRC_YEAREND}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  연말정산 환급 구조 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  무엇을 놓쳤는지 알아야 경정청구할 것이 보입니다.
                </p>
              </Link>
              <Link
                href={SRC_INSURE}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  보험 리모델링 점검 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  미청구 보험금을 찾은 김에 계약 전체를 정리해 보세요.
                </p>
              </Link>
              <Link
                href={SRC_MEDIAN}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  기준 중위소득 계산기 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  보조금24 목록에서 소득 기준이 걸릴 때 내 위치 확인.
                </p>
              </Link>
            </div>
          </section>

          {/* 8. 발견 CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_GOV}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">보조금24에서 내 혜택 보기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                정부24 · 로그인 후 최초 1회 이용 동의가 필요합니다
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                세금·연금·예금·내집마련 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 조회 경로·준비물·시효는 각 기관 안내와 관련 법령({UPDATED} 확인) 기준입니다.
              서비스 화면과 메뉴 위치는 기관 사정에 따라 바뀔 수 있고, 조회 범위는 참여 기관에 따라
              달라집니다. 카드포인트 유효기간은 카드사 약관과 포인트 종류에 따라 다르며, 보험금
              청구권의 기산점은 사안별로 판단이 달라질 수 있습니다. 본 내용은 정보 제공을 위한 것이며
              세무·법률 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 금융결제원 계좌정보통합관리서비스(어카운트인포) —{" "}
                <a
                  href={SRC_PAYINFO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  payinfo.or.kr
                </a>
              </li>
              <li>
                · 금융감독원 금융소비자정보포털 파인 — 잠자는 내 돈 찾기 (
                <a
                  href={SRC_FINE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  fine.fss.or.kr
                </a>
                ) · 서민금융진흥원 휴면예금 찾아줌(서민금융콜센터 1397)
              </li>
              <li>
                · 행정안전부·정부24 보조금24 · 국세청 홈택스 · 위택스 · 국가법령정보센터(국세기본법
                제45조의2·제54조, 지방세기본법, 상법 제662조, 국민연금법)
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
