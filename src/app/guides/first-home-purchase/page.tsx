import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 내집마련 가이드 — 생애최초 주택구입 완전정복 (대출·세금·청약 3축)
 *
 * ▷ 독립 정적 라우트. posts/*.md·pick-info.json 무접촉. JSX 직접 배치.
 * ▷ house-capital-gains-tax와 동일 토큰(SectionTitle·DepthCard 인라인).
 * ▷ 짝: 정책대출 비교 글 + LTV·DTI·DSR 글 (2026-07-05).
 *
 * [사실 검증 2026-07-05]
 * - 정책대출: 디딤돌(소득 부부 6천만·생애최초/신혼 8.5천, 주택 5억·신혼2자녀 6억, 한도 생애최초 2억~신혼2자녀 3.2억, 최저금리, 중도상환수수료 2026말 면제)
 *   / 보금자리론(소득 부부 7천만~1억, 주택 6억, 한도 3.6억·생애최초 LTV80% 4.2억, 고정금리).
 * - LTV: 생애최초 규제지역서도 최대 80%(수도권 대출상한 6억). DSR 40%(은행)·스트레스DSR 3단계 전면시행.
 * - 취득세: 생애최초 12억 이하 최대 200만원 감면(초과분만 납부·소득제한 없음), 무주택(본인+배우자 이력無),
 *   3년 실거주 사후요건(위반 추징), 인구감소지역 300만원.
 * - 청약: 생애최초 특별공급(무주택 세대·청약통장·소득요건), 공공·민영 별도.
 * 출처: 주택도시기금(myhome.go.kr)·주택금융공사(hf.go.kr)·금융위·행안부 지방세·청약홈(applyhome.co.kr).
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/first-home-purchase/";
const UPDATED = "2026-07-05";

const SRC_POLICY = "/blog/2026-07-05-policy-mortgage-loan/";
const SRC_DSR = "/blog/2026-07-05-ltv-dti-dsr-guide/";
const SRC_SUBSCRIBE = "/blog/2026-06-28-housing-subscription-account/";
const SRC_HOUSETAX = "/guides/house-capital-gains-tax/";
const SRC_MONEY = "/money/";

const SRC_FUND = "https://enhuf.molit.go.kr";
const SRC_APPLY = "https://www.applyhome.co.kr";

const OG_TITLE =
  "생애최초 주택구입 — 정책대출·취득세·청약 (2026)";
const OG_DESC =
  "처음 집 살 때 3대 혜택 — 디딤돌·보금자리론, 생애최초 LTV 80%, 취득세 최대 200만원 감면·청약 특공까지 순서대로 정리했습니다.";

export const metadata: Metadata = {
  title:
    "생애최초 주택구입 — 정책대출·취득세·청약 (2026) | 팁픽",
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

const COMPARE = [
  {
    axis: "대출",
    one: "디딤돌·보금자리론 (저금리 정책모기지)",
    multi: "생애최초 LTV 최대 80%",
    accent: true,
  },
  {
    axis: "세금",
    one: "취득세 최대 200만원 감면",
    multi: "12억 이하·소득제한 없음",
  },
  {
    axis: "청약",
    one: "생애최초 특별공급",
    multi: "무주택 세대·청약통장 필요",
    accent: true,
  },
  {
    axis: "핵심 조건",
    one: "본인·배우자 주택 소유 이력 없음",
    multi: "취득세 감면은 3년 실거주 필수",
  },
];

const LOAN = [
  {
    k: "디딤돌대출",
    v: "주택도시기금 재원으로 정책상품 중 금리가 가장 낮습니다. 부부합산 소득 6천만 원 이하(생애최초·신혼 8.5천만), 주택 5억 원 이하(신혼·2자녀 6억)가 조건이에요. 2026년 말까지 중도상환수수료가 면제됩니다.",
    accent: true,
  },
  {
    k: "보금자리론",
    v: "주택금융공사의 장기 고정금리 대출로, 소득(부부 7천만~다자녀 1억)과 집값(6억) 기준이 디딤돌보다 넉넉합니다. 금리 상승기에 안정적인 게 장점이에요.",
  },
  {
    k: "생애최초 LTV 80%",
    v: "생애최초 구입자는 규제지역에서도 LTV(집값 대비 대출)가 최대 80%까지 완화됩니다. 다만 수도권은 대출 상한이 6억 원으로 제한돼요.",
    accent: true,
  },
  {
    k: "DSR이 진짜 한도",
    v: "집값으로는 더 빌릴 수 있어도, 신용대출·카드론까지 합산하는 DSR 40%에 걸려 한도가 줄기 쉽습니다. 2026년 스트레스 DSR 3단계로 더 빡빡해졌으니, 다른 빚부터 정리하세요.",
  },
];

const TAX = [
  {
    k: "취득세 200만 감면",
    v: "생애최초로 12억 원 이하 주택을 사면 취득세를 최대 200만 원까지 감면받습니다. 산출세액이 200만 원 이하면 전액 면제, 초과하면 200만 원만 빼 줍니다. 소득 제한은 없어요.",
    accent: true,
  },
  {
    k: "무주택 요건",
    v: "본인과 배우자 모두 과거에 주택을 소유한 적이 없어야 '생애최초'로 인정됩니다. 예전에 집을 샀다 판 이력이 있으면 원칙적으로 해당되지 않아요.",
  },
  {
    k: "3년 실거주",
    v: "감면받은 뒤 3년 동안 실제 거주해야 합니다. 3년을 못 채우고 팔거나 증여·임대로 돌리면 감면받은 세금을 다시 토해내야 해요(추징).",
    accent: true,
  },
  {
    k: "인구감소지역 300만",
    v: "2026년부터 인구감소지역에서 생애최초로 집을 사면 감면 한도가 300만 원으로 늘어납니다.",
  },
];

const FAQS = [
  {
    q: "디딤돌과 보금자리론 중 뭘 받아야 하나요?",
    a: "소득과 집값이 디딤돌 요건(부부 6천만·주택 5억 등)에 들면 금리가 더 낮은 디딤돌이 대체로 유리합니다. 요건을 넘겼거나 집값이 6억까지라면 보금자리론이 대안이에요. 둘 다 무주택 실수요자 대상입니다.",
  },
  {
    q: "집값으로 계산한 한도만큼 다 빌릴 수 있나요?",
    a: "아닙니다. LTV로는 가능해도 DSR(모든 대출 원리금 합산 40%)에 걸리면 한도가 줄어듭니다. 2026년은 스트레스 DSR 3단계로 심사 금리가 높아져 한도가 더 빡빡해요. 신용대출·카드론을 줄이면 주담대 한도가 늘어납니다.",
  },
  {
    q: "취득세 감면은 소득이 많아도 받나요?",
    a: "네. 생애최초 취득세 감면(12억 이하·최대 200만원)은 소득 제한이 없습니다. 단 본인·배우자가 무주택이어야 하고, 감면 후 3년 실거주 요건을 지켜야 합니다. 3년 안에 팔면 추징됩니다.",
  },
  {
    q: "청약 없이 그냥 집을 사도 혜택이 있나요?",
    a: "있습니다. 청약(특별공급)은 새 아파트를 분양받는 경로이고, 기존 주택을 매매로 사도 정책대출과 취득세 감면은 받을 수 있습니다. 청약 특별공급을 노린다면 청약통장과 무주택 기간을 미리 관리하세요.",
  },
  {
    q: "신생아가 있으면 더 유리한가요?",
    a: "네. 2년 이내 출산 가구는 신생아 특례 디딤돌·버팀목으로 소득 기준이 크게 완화되고 금리가 연 1%대까지 내려갑니다. 추가 출산 시 자녀 1명당 0.2%p씩 더 우대돼요.",
  },
];

/* ─────────────────────────  컴포넌트  ───────────────────────── */

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

export default function FirstHomePurchaseGuide() {
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
        name: "생애최초 주택구입 가이드",
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
              2026년 기준 · 생애최초 내집마련
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              처음 집 살 때,
              <br className="hidden sm:block" /> 챙기면 수백만 원 아끼는 3가지 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              생애최초로 집을 사는 무주택자에게는 나라가 <strong>세 가지 혜택</strong>을 줍니다 —
              저금리 <strong>정책대출</strong>, 완화된 <strong>대출 한도(LTV 80%)</strong>, 그리고{" "}
              <strong>취득세 감면(최대 200만원)</strong>이에요. 여기에 청약 특별공급까지 더하면
              내집마련 문턱이 크게 낮아집니다. 이 글은 대출 → 세금 → 청약 순서로, 처음 집 사는
              사람이 놓치기 쉬운 혜택을 정리했습니다. (대출 상품 비교는{" "}
              <Link
                href={SRC_POLICY}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                정책대출 비교
              </Link>
              , 한도 계산은{" "}
              <Link
                href={SRC_DSR}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                LTV·DTI·DSR
              </Link>{" "}
              참고)
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { k: "정책대출", v: "디딤돌·보금자리", d: "시중보다 낮은 금리" },
                { k: "대출한도", v: "LTV 최대 80%", d: "생애최초 완화 (수도권 6억)" },
                { k: "취득세", v: "최대 200만 감면", d: "12억 이하·소득제한 없음" },
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
          {/* 1. 핵심 비교표 */}
          <section>
            <SectionTitle
              kicker="한 표로 정리"
              title="생애최초 3대 혜택 — 대출·세금·청약"
            />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">구분</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">
                      혜택
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-800">
                      조건·한도
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
                      <td className="px-4 py-3 text-slate-600">{r.multi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. 대출 */}
          <section>
            <SectionTitle
              kicker="먼저 대출부터"
              title="정책대출 + 완화된 한도"
            />
            <DepthCard
              tone="indigo"
              badge="대출"
              title="디딤돌·보금자리론 + LTV 80%"
              sub="주택도시기금·주택금융공사"
              rows={LOAN}
            />
          </section>

          {/* 3. 세금 */}
          <section>
            <SectionTitle kicker="놓치면 손해" title="취득세 감면 — 최대 200만 원" />
            <DepthCard
              tone="slate"
              badge="세금"
              title="생애최초 12억 이하 최대 200만 감면"
              sub="소득제한 없음 · 3년 실거주"
              rows={TAX}
            />
          </section>

          {/* 4. 청약 + 순서 */}
          <section>
            <SectionTitle kicker="새 아파트를 노린다면" title="청약 특별공급과 순서" />
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-sm leading-relaxed text-slate-700">
                기존 주택을 <strong>매매</strong>로 사도 정책대출·취득세 감면은 받습니다. 새
                아파트를 <strong>분양</strong>받고 싶다면 <strong>생애최초 특별공급</strong>을
                노리세요. 무주택 세대주여야 하고, 청약통장과 소득요건이 필요합니다. 청약통장은
                미리 만들어 두는 게 유리해요(
                <Link
                  href={SRC_SUBSCRIBE}
                  className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  청약통장 정리
                </Link>
                ). 순서로 보면 <strong>① 청약통장·무주택 관리 → ② 예산·대출 한도 확인(정책대출
                우선) → ③ 청약 또는 매매 → ④ 취득세 감면 신청</strong>입니다.
              </p>
            </div>
          </section>

          {/* 4.5 자체 계산 예시 — 수도권 4억 주택 */}
          <section>
            <SectionTitle
              kicker="숫자로 따라가 보기"
              title="수도권 4억 주택 생애최초 — 감면·한도 계산 예시"
            />
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <p className="text-sm leading-relaxed text-slate-700">
                무주택 부부가 <strong>수도권 4억 원 주택</strong>을 생애최초로
                산다고 하고, 이 글의 기준을 그대로 대입해 봅니다.
              </p>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
                <li>
                  ① <strong>대출 상한(LTV 80%)</strong> — 4억 × 80% ={" "}
                  <strong>3.2억 원</strong> (수도권 대출 상한 6억 이내)
                </li>
                <li>
                  ② <strong>정책대출</strong> — 주택 5억 이하라 디딤돌 대상(생애최초
                  한도 2억 원). 부족분은 보금자리론(주택 6억 이하·한도 3.6억) 등으로
                  LTV 상한 3.2억까지 검토
                </li>
                <li>
                  ③ <strong>취득세</strong> — 세율을 1%로 가정하면 산출세액 400만 원
                  → 200만 원 초과이므로 <strong>감면 200만 원</strong>, 납부는 약
                  200만 원
                </li>
                <li>
                  ④ <strong>최소 자기자금</strong> — 4억 − 3.2억 ={" "}
                  <strong>8,000만 원</strong> + 취득세·부대비용
                </li>
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                단, 실제 한도는 소득 기준의 <strong>DSR 40%</strong> 심사에서 더
                깎일 수 있고, 취득세율은 주택 가격·면적에 따라 달라지므로 계약 전
                관할 시군구와{" "}
                <Link
                  href={SRC_DSR}
                  className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  LTV·DTI·DSR 정리 글
                </Link>
                로 내 소득 기준 한도를 먼저 확인하세요.
              </p>
            </div>
          </section>

          {/* 5. 체크리스트 */}
          <section>
            <SectionTitle kicker="사기 전 점검" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <strong className="text-slate-800">무주택</strong> — 본인·배우자 모두 주택
                  소유 이력이 없는가(생애최초·취득세 감면 공통 요건)
                </li>
                <li>
                  <strong className="text-slate-800">정책대출</strong> — 디딤돌 → 보금자리론
                  순으로 소득·집값 요건을 확인했는가
                </li>
                <li>
                  <strong className="text-slate-800">DSR</strong> — 신용대출·카드론을 정리해
                  대출 한도(DSR 40%) 여유를 확보했는가
                </li>
                <li>
                  <strong className="text-slate-800">취득세</strong> — 12억 이하·최대 200만원
                  감면 대상인가(3년 실거주 요건 확인)
                </li>
                <li>
                  <strong className="text-slate-800">청약</strong> — 특별공급을 노린다면
                  청약통장·무주택 기간을 관리했는가
                </li>
              </ul>
            </div>
          </section>

          {/* 6. 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                ⚠️ 큰 계약 전 확인
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                조건은 자주 바뀌고, 사후 요건이 있습니다
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                정책대출 소득·한도·금리와 LTV·DSR 비율은 시점마다 바뀌고, 2026년 스트레스 DSR
                3단계로 한도가 줄었습니다. 취득세 감면은 <strong>3년 실거주</strong> 사후요건이
                있어, 어기면 추징됩니다. 계약 전 반드시{" "}
                <a
                  href={SRC_FUND}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 underline underline-offset-2"
                >
                  기금e든든
                </a>
                과 주택금융공사·관할 시군구에서 최신 기준을 확인하세요.
              </p>
            </div>
          </section>

          {/* 7. FAQ */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="처음 집 살 때 많이 묻는 질문" />
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

          {/* 8. 관련 */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 가이드·글" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={SRC_POLICY}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  내집마련 정책대출 비교 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  디딤돌·보금자리론·시중대출을 소득·집값·한도·금리로 비교.
                </p>
              </Link>
              <Link
                href={SRC_DSR}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <p className="text-sm font-bold text-slate-900">
                  LTV·DTI·DSR 한눈에 →
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  내 대출 한도를 정하는 세 지표와 2026년 스트레스 DSR.
                </p>
              </Link>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              나중에 집을 &lsquo;팔 때&rsquo;의 세금은{" "}
              <Link
                href={SRC_HOUSETAX}
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                집 팔 때 양도소득세 가이드
              </Link>
              에서 이어집니다.
            </p>
          </section>

          {/* 9. CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={SRC_APPLY}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">청약홈에서 청약·자격 확인 →</span>
              <span className="mt-1 text-xs text-indigo-100">
                applyhome.co.kr · 특별공급·청약통장
              </span>
            </a>
            <Link
              href={SRC_MONEY}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">돈이 되는 경제 더 보기 →</span>
              <span className="mt-1 text-xs text-slate-500">
                대출·세금·내집마련 이야기 모음
              </span>
            </Link>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 대출·세금·청약 기준은 2026년 기준({UPDATED} 확인)으로 주택도시기금·
              주택금융공사·행정안전부 등 공식 자료를 정리한 것입니다. 소득·주택가격·한도·금리·
              LTV·DSR·취득세 요건은 시점과 개별 사안에 따라 자주 바뀌고, 취득세 감면은 3년
              실거주 등 사후요건이 있습니다. 계약·신청 전 기금e든든·주택금융공사·관할 시군구·
              청약홈에서 최신 기준을 확인하고, 큰 거래는 전문가와 상담하시기 바랍니다. 본 내용은
              정보 제공을 위한 것이며 금융·세무 자문이 아닙니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>
                · 주택도시기금 내집마련 디딤돌·신생아 특례 (
                <a
                  href={SRC_FUND}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  enhuf.molit.go.kr
                </a>
                )
              </li>
              <li>· 한국주택금융공사 보금자리론 (hf.go.kr) · 금융위 DSR·스트레스DSR</li>
              <li>· 행정안전부 지방세 생애최초 취득세 감면 · 청약홈 (applyhome.co.kr)</li>
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
