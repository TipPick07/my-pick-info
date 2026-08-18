import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 청년·학자금 가이드 — 국가장학금 신청 동선 (통합신청 4종·가구원 동의·서류·구간)
 *
 * 2026-08-07 자동 발행: 지원금 글 "국가장학금 1~3구간 600만 원, 2차 신청 조건"의 짝 허브.
 *   역할 분리 — 글 = 구간별 금액과 한 칸 밀릴 때의 손실 계산 / 가이드 = 신청 동선과 걸리는 지점.
 * 독립 정적 라우트. 데이터층 무접촉. 외부 커스텀 컴포넌트는 Header/Footer만.
 *
 * [사실 검증 2026-08-07]
 * - 정부24 「국가장학금 I유형(학생직접지원형)」: 대한민국 국적 + 국내대학 재학, 학자금 지원 9구간 이하.
 *   연간 지원금액 기초·차상위 등록금 전액 / 1~3구간 600만 / 4~6구간 440만 / 7~8구간 360만 / 9구간 100만 원.
 *   성적 직전 학기 12학점 이상 + 100점 만점 80점(B) 이상, 기초·차상위는 70점(C) 이상,
 *   1~3구간은 C학점 경고제 2회, 신·편입생 첫 학기 성적·이수학점 미적용, 장애 대학생 미적용,
 *   자립준비청년 성적기준 미적용. 2026년 2학기 (1차) 5.22~6.22 / (2차) 8.12~9.9. 상담 1599-2000.
 * - 정부24 「다자녀(세 자녀 이상) 국가장학금」: 9구간 이하 자녀 3명 이상 가정.
 *   기초·차상위 등록금 전액 / 1~3구간 첫째·둘째 610만·셋째이상 전액 / 4~6구간 505만·전액 /
 *   7~8구간 465만·전액 / 9구간 135만·셋째이상 200만 원. 소관 교육부.
 * - 정부24 「국가근로장학금」: 성적 C0(70점) 이상 + 9구간 이하. 2026년 교내 시급 10,320원,
 *   교외 12,790원. 1일 8시간·월 80시간(방학 중 주 40시간)·학기당 640시간 범위. 상담 1599-2290.
 * - 대한민국 정책브리핑(korea.kr): 1차 5.22(금) 9시~6.22(월) 18시, 재학생은 원칙적으로 1차 신청,
 *   재학 중 2회에 한해 구제 신청 후 심사 지원. 소득연계형은 I유형·II유형·다자녀·지역인재장학금
 *   통합신청. 가구원 동의가 없거나 필수 서류를 내지 않으면 지원받을 수 없음.
 *   학기당 지원액 1~3구간 300만 / 4~6구간 220만 / 7~8구간 180만 / 9구간 50만 원.
 * ※ II유형·지역인재장학금은 대학별 기준이 달라 금액을 단정하지 않는다(통합 심사 사실만 기술).
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/national-scholarship/";
const UPDATED = "2026-08-07"; // 사실 최종 확인일

// 내부 루프 링크
const SRC_POST = "/blog/2026-08-07-national-scholarship-second-round/"; // 짝 글
const SRC_YOUTH = "/guides/youth-support-guide/"; // 청년 지원 총정리
const SRC_SAVING = "/blog/2026-07-20-youth-tomorrow-savings-account-guide/"; // 청년내일저축계좌
const SRC_MIRAE = "/blog/2026-05-29-youth-savings-mirae-vs-doyak-guide/"; // 청년미래적금
const SRC_MEDIAN = "/tools/median-income/"; // 기준 중위소득 계산기
const SRC_BENEFITS = "/benefits/";

// 공식 출처
const SRC_KOSAF = "https://www.kosaf.go.kr"; // 한국장학재단
const SRC_GOV = "https://www.gov.kr/portal/service/serviceInfo/SD0000004508"; // 정부24 I유형

const OG_TITLE = "국가장학금 신청 4단계, 가구원 동의·서류 확인";
const OG_DESC =
  "한 번 신청하면 I유형·II유형·다자녀·지역인재가 함께 심사됩니다. 신청 4단계 동선과 가구원 동의, 서류 제출, 구간·성적 기준에서 실제로 걸리는 지점을 정리한 가이드.";

export const metadata: Metadata = {
  title: "국가장학금 신청 4단계, 가구원 동의·서류 확인 | 팁픽",
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

/* 본문 데이터 (SSOT) */

// 통합신청으로 함께 심사되는 장학금 4종
const KINDS = [
  {
    name: "I유형 (학생 직접지원형)",
    who: "학자금 지원 9구간 이하 재학생",
    amount: "연 100만~600만 원 (기초·차상위는 등록금 전액)",
    note: "가장 기본이 되는 축. 구간이 금액을 정한다",
    accent: true,
  },
  {
    name: "II유형 (대학 연계지원형)",
    who: "대학이 정한 기준을 충족한 재학생",
    amount: "대학마다 다름",
    note: "학교 자체 노력과 연계되는 유형 — 학교 공고를 봐야 한다",
  },
  {
    name: "다자녀 국가장학금",
    who: "9구간 이하 + 자녀 3명 이상 가정",
    amount: "첫째·둘째 135만~610만 원 / 셋째 이상은 대체로 등록금 전액",
    note: "따로 신청하지 않아도 자격이 되면 함께 심사된다",
    accent: true,
  },
  {
    name: "지역인재장학금",
    who: "대학·지역별 기준 충족자",
    amount: "사업 공고에 따름",
    note: "통합신청에 포함되지만 선발 기준은 별도 공고",
  },
];

// 신청 4단계 동선
const STEPS = [
  {
    k: "1. 온라인 신청",
    v: "한국장학재단 누리집(kosaf.go.kr) 또는 모바일 앱에서 신청합니다. 이때 I유형·II유형·다자녀·지역인재장학금이 한 번에 접수되므로, 어떤 장학금을 받을지 고르는 화면은 따로 없습니다. 본인 명의 공동인증서·간편인증과 본인 명의 계좌가 필요합니다.",
    accent: true,
  },
  {
    k: "2. 가구원 정보제공 동의",
    v: "학자금 지원구간은 가구 단위 소득·재산으로 산정되므로, 부모(또는 배우자)가 정보제공에 동의해야 심사가 시작됩니다. 부모님이 온라인 인증이 어려우면 서면 동의서와 신분증 사본을 제출하는 경로도 있습니다. 이 단계가 신청 기간 안에 끝나야 한다는 점이 가장 큰 함정입니다.",
    accent: true,
  },
  {
    k: "3. 서류 제출",
    v: "가족관계가 전산으로 확인되지 않거나, 기초·차상위·다자녀 등 추가 확인이 필요한 경우 서류 제출 대상이 됩니다. 대상 여부는 신청 후 재단 마이페이지에 뜨므로, 신청만 하고 화면을 닫아 두면 모르고 지나갑니다.",
  },
  {
    k: "4. 구간 산정·결과 확인",
    v: "재단이 소득·재산 자료를 모아 학자금 지원구간을 산정하고 결과를 통보합니다. 산정 결과에 사실과 다른 부분이 있으면 이의신청을 할 수 있습니다. 등록 기간과 심사 완료 시점이 어긋나면 등록금을 먼저 내고 나중에 차액을 환급받는 순서가 됩니다.",
  },
];

// 어디서 걸리나 (구간·성적)
const GATES = [
  {
    k: "구간 — 9구간이 경계",
    v: "학자금 지원구간 9구간 이하만 I유형 대상입니다. 10구간은 지원이 없습니다. 구간은 본인 소득이 아니라 가구의 소득인정액(소득 + 재산을 소득으로 환산한 값)으로 정해지므로, 학생이 아무 소득이 없어도 구간이 높게 나올 수 있습니다.",
    accent: true,
  },
  {
    k: "성적 — 12학점과 80점",
    v: "직전 학기 12학점 이상을 이수하고 100점 만점에 80점(B) 이상이어야 합니다. 기초생활수급자·차상위계층은 70점(C) 이상이면 되고, 1~3구간은 70점 이상 80점 미만이어도 C학점 경고제로 2회까지 받을 수 있습니다.",
    accent: true,
  },
  {
    k: "성적 기준이 없는 경우",
    v: "신입생·편입생은 첫 학기에 한해 성적·이수학점 기준이 적용되지 않습니다. 장애 대학생은 성적·이수학점 기준이 적용되지 않고, 자립준비청년은 성적 기준이 적용되지 않습니다. 해당된다면 성적 때문에 미리 포기할 이유가 없습니다.",
  },
  {
    k: "재학생의 2차 신청 횟수",
    v: "재학생은 1차 신청이 원칙이고, 2차 신청으로 지원받을 수 있는 기회는 재학 중 2회로 제한됩니다. 신입·편입·재입학·복학생에게는 2차가 정상 경로라 이 제한과 무관합니다.",
    accent: true,
  },
];

const FAQS = [
  {
    q: "부모님이 이혼·별거 중이면 두 분 다 동의해야 하나요?",
    a: "가구원 범위는 학생의 가족관계와 실제 부양 관계에 따라 정해집니다. 이혼한 경우에는 학생을 부양하는 쪽 한 분만 가구원이 되는 것이 일반적이지만, 가족관계증명서상 관계가 그대로 남아 있으면 두 분 모두 동의 요청이 뜨기도 합니다. 이때는 재단에 가족관계 변동 서류를 제출해 가구원을 정정하는 절차가 따로 있습니다. 동의가 안 된 채 마감이 지나면 산정 자체가 되지 않으므로, 관계가 복잡할수록 마감 직전이 아니라 신청 첫날에 시작하는 것이 안전합니다.",
  },
  {
    q: "신청은 했는데 서류 제출 대상인지 어떻게 아나요?",
    a: "신청 후 한국장학재단 마이페이지의 신청 현황에 서류 제출 대상 여부와 필요한 서류 목록이 표시됩니다. 문자·메일 안내가 스팸함으로 들어가는 경우가 있어, 신청 다음 날과 마감 일주일 전 두 번은 직접 로그인해 확인하는 편이 안전합니다. 필수 서류를 내지 않으면 신청서가 살아 있어도 지원을 받을 수 없습니다.",
  },
  {
    q: "구간이 예상보다 높게 나왔는데 바꿀 수 있나요?",
    a: "산정 결과에 이의가 있으면 이의신청을 할 수 있습니다. 실무에서 자주 인정되는 사유는 부모의 퇴직·폐업·질병처럼 소득이 실제로 끊긴 경우, 그리고 재산 자료가 처분 전 시점으로 반영된 경우입니다. 반대로 '체감상 형편이 어렵다'는 사정만으로는 구간이 바뀌지 않습니다. 구간은 매 학기 다시 산정되므로, 이번 학기에 이의신청이 받아들여지지 않아도 다음 학기에는 달라질 수 있습니다.",
  },
  {
    q: "국가장학금과 국가근로장학금을 같이 받을 수 있나요?",
    a: "가능합니다. 근로장학금은 등록금 지원이 아니라 교내외에서 일한 대가를 받는 제도라 성격이 다릅니다. 2026년 기준 시급은 교내 10,320원, 교외 12,790원이고 근로시간은 1일 8시간, 월 80시간(방학 중 주 40시간), 학기당 640시간 범위입니다. 다만 근로장학금도 학자금 지원 9구간 이하와 성적 C0(70점) 이상을 요구하고, 선발은 학교별 공고 일정에 따릅니다.",
  },
  {
    q: "학점을 다 채웠는데 조기졸업이나 초과학기면 어떻게 되나요?",
    a: "국가장학금은 학기 단위로 재학 중인 학생에게 지원되며, 졸업 유예나 초과학기에는 지원이 제한되거나 아예 되지 않는 경우가 있습니다. 여기서 자주 생기는 사고가 마지막 학기에 남은 학점이 12학점에 못 미쳐 이수학점 기준에서 걸리는 경우입니다. 졸업 학기 수강신청을 짤 때 남은 학점과 장학금을 함께 놓고 계산하고, 본인 학교의 학사 규정과 재단 지원 여부를 미리 확인하세요.",
  },
];

/* 작은 표현용 컴포넌트 */

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

/* 페이지 */

export default function NationalScholarshipGuide() {
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
        name: "국가장학금 신청 가이드",
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
              2026년 기준 · 청년·학자금
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              국가장학금 신청 —
              <br className="hidden sm:block" /> 구간·성적·서류 한눈에
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              한 번 신청하면 <strong>I유형·II유형·다자녀·지역인재장학금</strong>이 함께 심사됩니다.
              그래서 어려운 건 &lsquo;무엇을 신청할까&rsquo;가 아니라 <strong>신청 뒤에 남는
              두 단계</strong>예요. 가구원 정보제공 동의와 서류 제출이 그것입니다.
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              둘 중 하나라도 기간 안에 끝나지 않으면 성적이 아무리 좋아도 지원이 0이 됩니다.
              구간별 금액과 한 칸 밀렸을 때의 손실 계산은{" "}
              <Link
                href={SRC_POST}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                국가장학금 구간별 지원금액 글
              </Link>
              에 따로 정리했습니다.
            </p>

            {/* 핵심 요약 박스 */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { k: "2차 신청", v: "8.12~9.9", d: "9월 9일 18시 마감" },
                { k: "대상 구간", v: "9구간 이하", d: "10구간은 I유형 없음" },
                { k: "성적 기준", v: "12학점·80점", d: "신·편입생 첫 학기 면제" },
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
          {/* 1. 통합신청 4종 */}
          <section>
            <SectionTitle
              kicker="한 번에 네 가지"
              title="신청서는 하나, 심사는 넷입니다"
            />
            <p className="mb-5 text-sm leading-relaxed text-slate-600">
              소득연계형 국가장학금은{" "}
              <strong className="text-slate-800">통합신청</strong>이라, 학생이 종류를 고르지 않습니다.
              자격이 되는 쪽으로 재단이 심사합니다.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">종류</th>
                    <th className="px-4 py-3 font-semibold">누가</th>
                    <th className="px-4 py-3 font-semibold">금액</th>
                    <th className="px-4 py-3 font-semibold">알아둘 점</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {KINDS.map((k) => (
                    <tr key={k.name} className="align-top">
                      <td
                        className={`px-4 py-3 font-semibold ${
                          k.accent ? "text-indigo-700" : "text-slate-700"
                        }`}
                      >
                        {k.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{k.who}</td>
                      <td className="px-4 py-3 text-slate-600">{k.amount}</td>
                      <td className="px-4 py-3 text-slate-500">{k.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              II유형과 지역인재장학금은 대학·사업 공고가 기준을 정하므로 금액이 일정하지 않습니다.
              학교 장학팀 공고를 함께 확인하세요.
            </p>
          </section>

          {/* 2. 신청 4단계 */}
          <section>
            <SectionTitle
              kicker="순서대로"
              title="신청 버튼은 시작일 뿐입니다"
            />
            <DepthCard
              tone="indigo"
              badge="신청 동선"
              title="네 단계가 모두 기간 안에 끝나야 한다"
              sub="신청 → 가구원 동의 → 서류 → 구간 산정"
              rows={STEPS}
            />
          </section>

          {/* 3. 어디서 걸리나 */}
          <section>
            <SectionTitle
              kicker="탈락은 여기서 난다"
              title="구간 9, 학점 12, 점수 80"
            />
            <DepthCard
              tone="slate"
              badge="자격 기준"
              title="숫자 셋만 외우면 대부분 걸러진다"
              sub="나머지는 예외 규정이 촘촘하다"
              rows={GATES}
            />
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              우리 집 소득이 기준 중위소득 대비 어디쯤인지 감을 잡고 싶다면{" "}
              <Link
                href={SRC_MEDIAN}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                기준 중위소득 계산기
              </Link>
              로 먼저 확인해 보세요. 실제 구간은 재산 환산까지 반영해 재단이 산정합니다.
            </p>
          </section>

          {/* 4. 체크리스트 */}
          <section>
            <SectionTitle kicker="마감 전에" title="닫히기 전에 확인할 6가지" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">신청 완료 상태</strong> — 임시저장이 아니라
                  &lsquo;신청 완료&rsquo;로 떠 있나
                </li>
                <li>
                  <strong className="text-slate-800">가구원 동의</strong> — 부모(또는 배우자) 동의가
                  &lsquo;완료&rsquo;로 바뀌었나
                </li>
                <li>
                  <strong className="text-slate-800">서류 대상 여부</strong> — 마이페이지에 요구 서류가
                  떠 있지 않나
                </li>
                <li>
                  <strong className="text-slate-800">이수학점</strong> — 직전 학기 12학점 이상을
                  성적표로 확인했나
                </li>
                <li>
                  <strong className="text-slate-800">계좌</strong> — 본인 명의 계좌가 등록돼 있나
                </li>
                <li>
                  <strong className="text-slate-800">남은 2차 기회</strong> — 재학생이라면 2회 중
                  몇 번을 썼는지 확인했나
                </li>
              </ul>
            </div>
          </section>

          {/* 5. 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                가장 아까운 탈락
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                신청은 했는데 동의가 없어서 0원
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                가구원 동의가 이뤄지지 않거나 필수 서류를 제출하지 않으면{" "}
                <strong>신청서가 살아 있어도 지원을 받을 수 없습니다.</strong> 부모님이 공동인증서를
                쓰지 않는 집일수록 서면 동의 경로를 알아보는 데 며칠이 걸립니다. 2026학년도 2학기
                2차 신청은 <strong>8월 12일 9시에 열려 9월 9일 18시에 닫히므로</strong>, 동의는
                마감이 아니라 신청 첫 주에 끝내 두는 것이 안전합니다.
              </p>
            </div>
          </section>

          {/* 6. FAQ */}
          <section>
            <SectionTitle
              kicker="실제로 갈리는 경우"
              title="이혼 가구, 초과학기, 이의신청은 어떻게 되나"
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
            <SectionTitle kicker="이어서 보기" title="등록금 다음에 챙길 것들" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_POST}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  국가장학금 구간별 지원금액 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  이 가이드의 짝 — 한 칸 밀리면 4년에 1,040만 원이 갈리는 계산.
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
                  자산·주거·취업까지 청년이 쓸 수 있는 제도 한 장 정리.
                </p>
              </Link>
              <Link
                href={SRC_MIRAE}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  청년미래적금 vs 청년도약계좌 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  등록금 다음 학기를 저축으로 준비할 때 먼저 보는 비교.
                </p>
              </Link>
              <Link
                href={SRC_SAVING}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  청년내일저축계좌 계산 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  일하는 청년이면 3년 만기 1,440만 원 구조부터 확인.
                </p>
              </Link>
            </div>
          </section>

          {/* 8. CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_KOSAF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">한국장학재단에서 신청하기 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                누리집·모바일 앱 신청 · 상담 1599-2000 (근로장학금 1599-2290)
              </span>
            </a>
            <Link
              href={SRC_BENEFITS}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">지원금·복지 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                청년·주거·육아·의료 지원 제도 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 지원 대상·금액·신청 기간·성적 기준은 정부24 민원 안내와 대한민국
              정책브리핑({UPDATED} 확인) 기준입니다. II유형·지역인재장학금은 대학과 사업 공고가
              기준을 정하므로 금액을 특정하지 않았습니다. 가구원 범위, 서류 요구사항, 초과학기·조기졸업
              처리는 개별 사정과 학교 학사 규정에 따라 달라집니다. 신청 전 한국장학재단 누리집에서
              최신 공고를 확인하시기 바랍니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 정부24 — 국가장학금 I유형·다자녀 국가장학금·국가근로장학금 민원 안내 (
                <a
                  href={SRC_GOV}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  gov.kr
                </a>
                )
              </li>
              <li>· 대한민국 정책브리핑 — 2학기 국가장학금·근로장학금 신청 안내</li>
              <li>
                · 한국장학재단 (
                <a
                  href={SRC_KOSAF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  kosaf.go.kr
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
