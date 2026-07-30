import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 세금 가이드 — 프리랜서·N잡러 종합소득세 신고 (5월)
 *
 * ▷ 기존 경제 글(연봉 실수령액·종소세 신고·ISA/IRP)과 종합소득세 계산기를 묶는 세금 허브.
 * ▷ 독립 정적 라우트. src/content/posts/*.md(블로그)도 public/data(크롤링)도 건드리지 않음.
 * ▷ 본문은 JSX로 직접 배치(표 깨짐 차단). 외부 컴포넌트는 Header/Footer만, 나머지 인라인
 *   (house-capital-gains-tax와 동일 토큰·시그니처).
 * ▷ 기본세율(6~45%)·누진공제액은 종합소득세 계산기(IncomeTaxCalculator)와 동일값.
 *
 * [사실 검증 2026-06-29]
 * - 신고기간: 매년 5월 1~31일(공휴일이면 익영업일 연장), 성실신고확인대상은 6월 30일까지.
 * - 대상: 3.3% 원천징수 프리랜서(인적용역), N잡·부업 사업/기타소득, 개인사업자,
 *   이자+배당 2,000만원 초과 등. 근로소득만 있고 연말정산 마친 경우는 보통 제외.
 * - 경비: 추계(단순경비율=영세·신규, 큰 비율 자동 인정·모두채움 / 기준경비율=규모 큰 사업자,
 *   기타경비만 추정+증빙) vs 장부(간편장부 / 복식부기 의무·미이행 시 무기장가산세).
 * - 세율: 종합소득 과세표준 6~45% 누진(누진공제) + 지방소득세 10% 별도.
 * - 가산세: 무신고 20%(부정 40%), 납부지연 일 0.022%(연 약 8%), 기한후 자진신고 감면
 *   (1개월내 50%·3개월내 30%·6개월내 20%).
 * - 환급: 3.3% 등 기납부세액이 산출세액보다 많으면 환급(보통 6월말~7월초).
 * 출처: 국세청 종합소득세 신고·납부 안내, 기장의무·경비율 판단기준, 모두채움 신고 안내, 홈택스.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/comprehensive-income-tax-filing/";
const UPDATED = "2026-06-29"; // 사실 최종 확인일

// 내부 루프 링크 (체류시간)
const SRC_INCOMETAX = "/tools/income-tax/"; // 종합소득세 계산기(기본세율 동일)
const SRC_JONGSO = "/blog/2026-05-21-jongso-tax-filing-guide/"; // 5월 종소세 신고 글
const SRC_ISA = "/blog/2026-06-25-isa-irp-pension-savings-comparison/"; // 연금계좌 세액공제 절세
const SRC_MONEY = "/money/";

// 공식 출처 (staleness 완화)
const SRC_NTS = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7664&mi=2224"; // 국세청 종소세 신고·납부
const SRC_NTS_RATE = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2230&cntntsId=7669"; // 기장의무·경비율 판단
const SRC_HOMETAX = "https://hometax.go.kr"; // 홈택스 신고

const OG_TITLE =
  "프리랜서·N잡러 종합소득세 신고 — 경비·환급 (2026)";
const OG_DESC =
  "3.3% 떼인 프리랜서·N잡러의 5월 종합소득세 — 신고 대상·경비율·세율·환급·가산세를 한 표로 정리했습니다.";

export const metadata: Metadata = {
  title:
    "프리랜서·N잡러 종합소득세 신고 — 경비·환급 (2026) | 팁픽",
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

// ★ 핵심 비교표 — 단순경비율 vs 기준경비율 (장부 없이 신고할 때의 갈림길)
const COMPARE = [
  {
    axis: "주로 적용",
    one: "영세·신규 사업자 (수입 적음)",
    multi: "수입이 큰 사업자",
    accent: true,
  },
  {
    axis: "경비 인정",
    one: "업종별 비율로 큰 폭 자동 인정",
    multi: "기타경비만 낮은 율로 추정",
    accent: true,
  },
  {
    axis: "증빙·장부",
    one: "증빙 없어도 신고 가능",
    multi: "인건비·임차료·매입은 증빙으로 직접 공제",
  },
  {
    axis: "모두채움",
    one: "국세청이 미리 채워 보내줌",
    multi: "해당 없음 (직접 작성)",
  },
  {
    axis: "유불리",
    one: "증빙 적은 프리랜서에 유리",
    multi: "경비 많으면 장부가 더 유리",
  },
];

// 신고 대상 (DepthCard · v=본문 그대로, k=구조 라벨)
const TARGET = [
  {
    k: "프리랜서 (3.3%)",
    v: "강사·디자이너·작가·배달·크리에이터처럼 3.3%가 떼인 인적용역 사업소득자. 이 3.3%는 미리 낸 세금이라 5월에 1년치를 정산해 더 내거나 돌려받습니다.",
    accent: true,
  },
  {
    k: "N잡러·부업",
    v: "직장에 다니면서 스마트스토어·블로그 애드·강의·배달 등으로 사업·기타소득이 생긴 경우. 회사 연말정산과는 별개로, 근로소득과 합산해 5월에 신고합니다.",
  },
  {
    k: "개인사업자",
    v: "자영업·온라인 판매 등 사업소득이 있는 모든 개인. 적자가 났더라도 신고하는 것이 원칙입니다(결손금 이월 등 혜택).",
  },
  {
    k: "금융·연금·기타",
    v: "이자와 배당을 합친 금융소득이 한 해 2,000만원을 넘거나, 사적연금·기타소득이 일정 기준을 넘으면 합산 신고 대상이 됩니다.",
  },
  {
    k: "신고 안 해도 되는 경우",
    v: "근로소득만 있고 연말정산을 마쳤거나, 분리과세로 끝나는 소득만 있다면 보통 따로 신고할 것이 없습니다.",
  },
];

// 경비·장부 (DepthCard · v=본문 그대로, k=구조 라벨)
const EXPENSE = [
  {
    k: "추계 — 단순경비율",
    v: "장부 없이 국세청이 정한 업종별 경비율로 경비를 추정합니다. 영세·신규는 대개 단순경비율 대상이라 증빙이 적어도 큰 비율을 경비로 인정받고, 국세청이 미리 채운 모두채움 신고서로 몇 분이면 끝납니다.",
    accent: true,
  },
  {
    k: "추계 — 기준경비율",
    v: "규모가 커지면 기준경비율로 바뀝니다. 기타경비만 낮은 율로 추정하고 인건비·임차료·매입은 증빙으로 직접 공제해야 하므로, 사실상 장부를 쓰는 편이 유리합니다.",
  },
  {
    k: "간편장부",
    v: "소규모 사업자가 수입·비용·거래처를 날짜순으로 적는 쉬운 장부입니다. 실제 경비가 경비율보다 크면 장부신고가 세금을 더 줄여 줍니다.",
  },
  {
    k: "복식부기",
    v: "수입이 일정 기준을 넘으면 복식부기가 의무입니다. 이행하지 않으면 무기장가산세가 붙으니, 규모가 커졌다면 세무대리를 함께 고려하세요.",
    accent: true,
  },
];

// 기본세율 누진표 (종합소득세 계산기와 동일값)
const BRACKETS = [
  { base: "1,400만원 이하", rate: "6%", deduct: "—" },
  { base: "5,000만원 이하", rate: "15%", deduct: "126만원" },
  { base: "8,800만원 이하", rate: "24%", deduct: "576만원" },
  { base: "1.5억원 이하", rate: "35%", deduct: "1,544만원" },
  { base: "3억원 이하", rate: "38%", deduct: "1,994만원" },
  { base: "5억원 이하", rate: "40%", deduct: "2,594만원" },
  { base: "10억원 이하", rate: "42%", deduct: "3,594만원" },
  { base: "10억원 초과", rate: "45%", deduct: "6,594만원" },
];

const FAQS = [
  {
    q: "3.3% 떼였는데 왜 또 신고해요?",
    a: "3.3%는 세금을 미리 떼어 둔 것일 뿐입니다. 5월에 1년치 수입과 경비·공제를 합산해 진짜 세금을 정산하는데, 수입이 크지 않은 프리랜서는 경비·공제를 반영하면 오히려 미리 낸 3.3%를 돌려받는 경우가 많습니다.",
  },
  {
    q: "부업(N잡)은 얼마부터 신고하나요?",
    a: "사업소득은 금액과 무관하게 합산 신고가 원칙입니다. 다만 일시적인 기타소득은 연 300만원 이하면 분리과세를 선택할 수 있는 등 예외가 있어요. 헷갈리면 홈택스에서 내 소득자료부터 조회해 보세요.",
  },
  {
    q: "장부를 꼭 써야 하나요?",
    a: "영세·신규라서 단순경비율 대상이면 장부 없이 모두채움으로 신고할 수 있습니다. 다만 실제 경비가 경비율보다 크거나 규모가 커졌다면 장부신고가 유리하고, 수입이 일정 기준을 넘으면 복식부기가 의무가 됩니다.",
  },
  {
    q: "깜빡하고 신고를 놓쳤어요.",
    a: "기한이 지나도 기한후신고가 가능합니다. 기한 경과 1개월 이내에 자진신고하면 무신고가산세의 50%, 3개월 이내 30%, 6개월 이내 20%가 감면돼요. 빨리 할수록 덜 냅니다.",
  },
  {
    q: "세금을 줄이는 방법은?",
    a: "사업 관련 경비 증빙(세금계산서·카드내역·영수증)을 꼼꼼히 모으고, 노란우산공제나 연금계좌(IRP·연금저축) 세액공제 같은 합법적 공제를 빠짐없이 챙기는 것이 핵심입니다.",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트(파일 내부)  ───────────────────────── */

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

export default function ComprehensiveIncomeTaxFilingGuide() {
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
        name: "프리랜서·N잡러 종합소득세 신고 가이드",
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
              2026년 기준 · 5월 종합소득세
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              프리랜서·N잡러 종합소득세 신고,
              <br className="hidden sm:block" /> 5월에 뭘 해야 하나 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              매년 5월은 종합소득세 신고의 달입니다. 회사에서 월급만 받는 분은 연말정산으로
              끝나지만, <strong>3.3%를 떼고 받는 프리랜서</strong>나{" "}
              <strong>부업·N잡으로 따로 소득이 생긴 분</strong>은 5월에 1년치 소득을 직접
              신고해야 해요. 깜빡하면 가산세가 붙고, 반대로 잘 챙기면 미리 낸 3.3%를
              돌려받기도 합니다. 이 글은 <em>내가 신고 대상인지</em> →{" "}
              <em>경비를 어떻게 인정받는지</em> → <em>세율과 환급</em> 순서로 짚어 드립니다.
              (세액 감을 잡고 싶다면{" "}
              <Link
                href={SRC_INCOMETAX}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                종합소득세 계산기
              </Link>
              , 신고 절차만 짧게 보려면{" "}
              <Link
                href={SRC_JONGSO}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                5월 종합소득세 신고
              </Link>{" "}
              글을 참고하세요.)
            </p>

            {/* 핵심 요약 박스 */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "신고 기간",
                  v: "매년 5월 1~31일",
                  d: "성실신고 대상은 6월 30일",
                },
                {
                  k: "세율",
                  v: "6~45% 누진",
                  d: "+ 지방소득세 10% 별도",
                },
                {
                  k: "안 하면 / 잘하면",
                  v: "가산세 20%+",
                  d: "잘 챙기면 3.3% 환급",
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
          {/* 1. ★ 핵심 비교표 — 단순경비율 vs 기준경비율 */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="단순경비율 vs 기준경비율 — 장부 없이 신고할 때"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      단순경비율
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      기준경비율
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
                        {r.one}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          r.accent
                            ? "font-medium text-indigo-700"
                            : "text-slate-600"
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
              단순/기준 중 무엇이 적용되는지는 업종과 직전연도 수입금액으로 정해집니다. 내
              경비율은 홈택스 신고 화면이나 국세청 안내에서 확인할 수 있어요.
            </p>
          </section>

          {/* 2. 신고 대상 */}
          <section>
            <SectionTitle
              kicker="나도 해당될까"
              title="누가 5월에 신고해야 하나"
            />
            <DepthCard
              tone="indigo"
              badge="신고 대상"
              title="3.3% 프리랜서 · N잡 · 사업소득이 있으면 대상"
              sub="국세청 종합소득세 신고 안내"
              rows={TARGET}
            />
          </section>

          {/* 3. 경비·장부 */}
          <section>
            <SectionTitle
              kicker="세금을 가르는 핵심"
              title="경비를 어떻게 인정받나 — 추계 vs 장부"
            />
            <DepthCard
              tone="slate"
              badge="경비·장부"
              title="경비율(단순·기준) 추계 vs 간편·복식 장부"
              sub="경비를 많이 인정받을수록 세금이 줄어든다"
              rows={EXPENSE}
            />
          </section>

          {/* 4. 세율 누진표 + 계산 흐름 */}
          <section>
            <SectionTitle kicker="얼마를 떼나" title="종합소득세율 — 6~45% 누진" />

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">과세표준</th>
                    <th className="px-4 py-3 font-semibold">세율</th>
                    <th className="px-4 py-3 font-semibold">누진공제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BRACKETS.map((b) => (
                    <tr key={b.base}>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {b.base}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.rate}</td>
                      <td className="px-4 py-3 text-slate-500">{b.deduct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              산출세액 = 과세표준 × 세율 − 누진공제. 여기에 종합소득세의 10%가{" "}
              <strong>지방소득세</strong>로 더 붙습니다. 과세표준만 넣어 세액 감을 잡으려면{" "}
              <Link
                href={SRC_INCOMETAX}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                종합소득세 계산기
              </Link>
              를 써 보세요.
            </p>

            {/* 계산 흐름 */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                세금이 정해지는 순서
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                <strong>종합소득금액</strong>(수입 − 필요경비) →{" "}
                <strong>− 소득공제</strong>(인적공제·국민연금 등) = 과세표준 →{" "}
                <strong>× 세율 − 누진공제</strong> = 산출세액 →{" "}
                <strong>− 세액공제 − 기납부세액</strong>(3.3% 원천징수 등) = 낼 세금 또는
                환급. 미리 낸 세금이 산출세액보다 많으면 그 차액을 돌려받습니다(보통
                6월말~7월초 입금).
              </p>
            </div>
          </section>

          {/* 4.5 자체 계산 예시 — 수입 3,000만 프리랜서 */}
          <section>
            <SectionTitle
              kicker="숫자로 따라가 보기"
              title="수입 3,000만 프리랜서 — 환급 계산 예시"
            />
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-sm leading-relaxed text-slate-700">
                한 해 수입이 <strong>3,000만 원</strong>인 3.3% 프리랜서를 위 세율표
                그대로 계산해 봅니다. 단순경비율은 업종마다 다르므로{" "}
                <strong>60%로 가정</strong>하고, 흐름을 단순하게 보기 위해
                소득공제·세액공제는 반영하지 않았습니다.
              </p>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
                <li>
                  ① <strong>소득금액</strong> — 3,000만 − 경비 1,800만(3,000만 × 60%) ={" "}
                  <strong>1,200만 원</strong>
                </li>
                <li>
                  ② <strong>산출세액</strong> — 과세표준 1,200만 원은 1,400만 이하
                  구간이라 1,200만 × 6% = <strong>72만 원</strong>
                </li>
                <li>
                  ③ <strong>기납부세액</strong> — 원천징수 3.3% 중 소득세분 3%인
                  3,000만 × 3% = <strong>90만 원</strong>
                </li>
                <li>
                  ④ <strong>정산</strong> — 72만 − 90만 = −18만 →{" "}
                  <strong>소득세 18만 원 환급</strong>
                </li>
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                지방소득세도 같은 구조입니다. 산출세액의 10%인 7.2만 원보다 미리 낸
                0.3%분 9만 원이 많아 <strong>1.8만 원</strong>이 더 돌아오고, 합계 약{" "}
                <strong>19.8만 원</strong>을 돌려받는 그림이 됩니다. 실제로는 인적공제
                같은 소득공제가 과세표준을 더 낮춰 환급이 커지는 경우가 많습니다. 내
                경비율을 홈택스에서 확인한 뒤{" "}
                <Link
                  href={SRC_INCOMETAX}
                  className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  종합소득세 계산기
                </Link>
                에 과세표준을 넣어 직접 검산해 보세요.
              </p>
            </div>
          </section>

          {/* 5. 한 장 체크리스트 */}
          <section>
            <SectionTitle kicker="신고 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">대상 확인</strong> — 작년에 3.3%
                  소득·부업·사업소득, 또는 2천만원 초과 금융소득이 있었는가
                </li>
                <li>
                  <strong className="text-slate-800">소득자료</strong> — 홈택스에서
                  지급명세서·원천징수 내역 조회(상당 부분 미리 채워져 있음)
                </li>
                <li>
                  <strong className="text-slate-800">경비 증빙</strong> — 세금계산서·카드
                  내역·영수증 등 사업 관련 지출 모으기
                </li>
                <li>
                  <strong className="text-slate-800">경비율 확인</strong> — 내가
                  단순경비율인지 기준경비율인지(업종·직전 수입)
                </li>
                <li>
                  <strong className="text-slate-800">공제</strong> — 인적공제·국민연금·노란
                  우산공제·연금계좌 세액공제를 빠짐없이
                </li>
                <li>
                  <strong className="text-slate-800">기납부·기한</strong> — 3.3% 등 미리 낸
                  세금 반영, 5월 31일까지 신고(지방소득세 10% 함께)
                </li>
              </ul>
            </div>
          </section>

          {/* 6. ⚠️ 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 놓치면 손해
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                안 하면 가산세, 잘 모르면 모두채움·세무대리
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                신고를 건너뛰면 무신고가산세(낼 세금의 20%, 부정은 40%)와 납부지연가산세(연
                약 8%)가 붙고, 받을 수 있던 환급도 놓칩니다. 업종별 경비율·기장의무 기준은
                매년·업종마다 달라 내 경우를 확인하는 것이 중요해요. 단순경비율 대상이면
                홈택스 모두채움으로 몇 분이면 끝나고, 경비·공제가 복잡하면 세무대리가 오히려
                이득일 수 있습니다. 신고 전 반드시{" "}
                <a
                  href={SRC_HOMETAX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  홈택스
                </a>
                에서 내 소득자료와 경비율부터 확인하세요.
              </p>
            </div>
          </section>

          {/* 7. FAQ */}
          <section>
            <SectionTitle kicker="자주 묻는 질문" title="프리랜서·N잡러가 가장 많이 묻는 것" />
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
            <SectionTitle kicker="함께 보면 좋은" title="관련 글·계산기" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_INCOMETAX}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  종합소득세 계산기 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  과세표준만 넣으면 누진세율로 산출세액·실효세율을 바로 계산해 줍니다.
                </p>
              </Link>
              <Link
                href={SRC_ISA}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  ISA·연금저축·IRP 비교 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  연금계좌 세액공제로 종합소득세를 줄이는 절세계좌 3종을 한눈에 정리.
                </p>
              </Link>
            </div>
          </section>

          {/* 9. 발견 CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_HOMETAX}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">홈택스에서 종합소득세 신고 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                hometax.go.kr · 모두채움·소득자료 조회
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                세금·절세·재테크 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 신고 대상·경비율·세율·가산세는 2026년 6월 기준({UPDATED} 확인)으로
              국세청 등 공식 자료를 정리한 것입니다. 업종별 경비율과 기장의무 기준, 공제
              항목은 매년·개인 상황에 따라 달라지고, 신고 내용은 사안별로 결과가 크게
              달라집니다. 신고·납부 전 국세청 홈택스에서 내 소득자료와 적용 경비율을
              확인하고, 경비·공제가 복잡하면 세무 전문가와 상담하시기 바랍니다. 본 내용은
              정보 제공을 위한 것이며 세무 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 국세청 종합소득세 신고·납부 안내 (
                <a
                  href={SRC_NTS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  nts.go.kr
                </a>
                )
              </li>
              <li>
                · 국세청 기장의무·기준/단순경비율 판단기준 (
                <a
                  href={SRC_NTS_RATE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  nts.go.kr
                </a>
                )
              </li>
              <li>· 국세청 모두채움 신고 안내 · 홈택스 종합소득세 신고 (hometax.go.kr)</li>
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
