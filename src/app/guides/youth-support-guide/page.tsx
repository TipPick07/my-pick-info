import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 청년 지원 총정리 가이드 — 흩어진 청년 정책을 목적별(자산·주거·취업)로 묶은 에버그린 가이드.
 *
 * ▷ 독립 정적 라우트. posts/*.md·public/data/pick-info.json 미경유 → 자동발행 파이프라인 무관.
 * ▷ 본문은 JSX 직접 배치(표 깨짐 방지). 외부 컴포넌트는 Header/Footer만 재사용.
 * ▷ SectionTitle·DepthCard·표·FAQ는 daycare-admission·house-capital-gains-tax와 동일 토큰.
 *
 * [사실 검증 2026-06-28]
 * - 청년 월세 한시 특별지원: 월 최대 20만 × 24개월(최대 480만), 만 19~34세 무주택 독립청년,
 *   2026년 상시 사업 전환(청약통장 요건 폐지), 복지로 신청.
 * - 국민취업지원제도: 구직촉진수당 월 60만(2026 인상) × 6개월(최대 1년), 청년특례(만 18~34·재산 5억·취업경험 무관), work24.
 * - 청년미래적금: 2026.6 출시, 3년, 정부기여금 6~12%(청년도약계좌 후속).
 * 출처: 복지로·국토부, 고용노동부 work24, 온통청년(youth.go.kr).
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/youth-support-guide/";
const UPDATED = "2026-06-28";

// 내부 루프 링크
const SRC_SAVINGS = "/blog/2026-05-29-youth-savings-mirae-vs-doyak-guide/"; // 청년미래적금 vs 도약계좌 비교
const SRC_RENT = "/blog/2026-04-30-youth-rent-support/"; // 청년 월세
const SRC_COMPARE = "/blog/2026-05-29-youth-savings-mirae-vs-doyak-guide/"; // 도약 vs 미래
const SRC_BENEFITS = "/benefits/";

// 공식 출처
const SRC_YOUTH = "https://www.youth.go.kr"; // 온통청년
const SRC_WORK = "https://www.work24.go.kr"; // 국민취업지원
const SRC_BOKJIRO = "https://www.bokjiro.go.kr"; // 청년 월세 신청

const OG_TITLE = "청년 지원 총정리 — 자산·주거·취업 한눈에 (2026)";
const OG_DESC =
  "청년미래적금·청년 월세 지원·국민취업지원까지, 흩어진 청년 정책을 목돈·주거·취업 세 갈래로 묶어 정리한 에버그린 가이드.";

export const metadata: Metadata = {
  title: "청년 지원 총정리 — 자산·주거·취업 한눈에 (2026) | 팁픽",
  description: OG_DESC,
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: { type: "article", url: `${SITE}${PATH}`, title: OG_TITLE, description: OG_DESC, images: [`${SITE}/og-image.png`] },
  twitter: { card: "summary_large_image", title: OG_TITLE, description: OG_DESC, images: [`${SITE}/og-image.png`] },
};

/* ─────────────────────────  본문 데이터  ───────────────────────── */

// ★ 핵심 비교표 — 목적별 대표 청년 지원
const COMPARE = [
  { axis: "목돈 모으기", program: "청년미래적금 · 청년주택드림 청약", point: "정부기여금 6~12% · 청약 우대금리", accent: true },
  { axis: "주거", program: "청년 월세 지원 · 청년 전세대출", point: "월 20만 × 24개월(최대 480만) · 저금리 전세", accent: true },
  { axis: "취업·생활", program: "국민취업지원제도", point: "구직촉진수당 월 60만 (6개월)" },
];

// 자산 형성
const ASSET = [
  {
    k: "청년미래적금",
    v: "청년도약계좌(2025년 신규 종료)의 후속으로 2026년 6월 출시됐습니다. 만 19~34세, 3년 만기, 정부 기여금 6~12% + 비과세로 시중 적금보다 훨씬 유리합니다. 연 2회(6·12월)만 모집하니 가입 시기를 놓치지 마세요.",
    accent: true,
  },
  {
    k: "청년주택드림 청약통장",
    v: "연 최대 4.5%·비과세의 청약통장으로, 가입해 두면 나중에 분양받을 때 낮은 금리의 '청년주택드림 대출'로 연결됩니다. 내 집 마련을 염두에 둔 청년이라면 일반 청약통장보다 유리합니다.",
  },
  {
    k: "두 개를 함께",
    v: "당장 쓸 목돈은 청년미래적금으로 모으고, 청약은 청년주택드림 통장으로 미리 준비하면 '모으기 + 내 집 마련'을 동시에 설계할 수 있습니다.",
  },
];

// 주거
const HOUSING = [
  {
    k: "청년 월세 한시 특별지원",
    v: "만 19~34세 무주택 독립 청년에게 월 최대 20만 원을 24개월(최대 480만 원) 지원합니다. 2026년부터 상시 사업으로 바뀌면서 예전의 청약통장 가입 요건이 없어졌습니다. 복지로나 주민센터에서 신청합니다.",
    accent: true,
  },
  {
    k: "청년 전세대출",
    v: "버팀목 전세자금대출의 청년 전용 상품으로 시중보다 낮은 금리로 전세보증금을 빌릴 수 있습니다. 중소기업 취업 청년 대상 전세대출 등 조건이 더 좋은 상품도 있으니 자격을 함께 확인하세요.",
  },
  {
    k: "공공임대(행복주택 등)",
    v: "시세보다 저렴한 행복주택·매입임대 등 청년 공공임대도 꾸준히 공급됩니다. LH·SH 청약 일정을 확인하세요.",
  },
];

// 취업·생활
const JOB = [
  {
    k: "국민취업지원제도",
    v: "구직 중인 청년에게 구직촉진수당 월 60만 원(2026년 인상)을 6개월간, 최대 1년까지 지원하고 취업 프로그램도 연계합니다. 특히 만 18~34세는 '청년 특례'로 취업 경험이 없어도(재산 5억 이하) 1유형에 참여할 수 있습니다.",
    accent: true,
  },
  {
    k: "추가로 받는 수당",
    v: "부양가족이 있으면 추가 수당(월 최대 40만 원), 취업에 성공하면 취업성공수당(최대 150만 원)까지 받을 수 있습니다. work24(고용24)에서 신청합니다.",
  },
  {
    k: "교통·생활비",
    v: "대중교통 환급(K-패스)은 청년 적립률이 더 높습니다. 지자체별 청년수당·면접비 지원도 함께 챙기세요.",
  },
];

const FAQS = [
  {
    q: "청년은 몇 살까지인가요?",
    a: "대체로 만 19~34세를 기준으로 하지만 제도마다 다릅니다. 국민취업지원 청년특례는 만 18세부터이고, 병역 의무를 이행했다면 그 기간만큼(최대 약 3년) 나이 상한이 늘어납니다. 신청 전 각 제도의 정확한 기준을 확인하세요.",
  },
  {
    q: "소득이 없어도 받을 수 있나요?",
    a: "제도에 따라 다릅니다. 국민취업지원제도는 소득이 없거나 적은 청년을 위한 제도이고(청년특례), 청년 월세 지원도 소득 기준이 있긴 하지만 무소득 청년도 대상이 될 수 있습니다. 반대로 청년미래적금은 소득이 있어야 가입할 수 있습니다.",
  },
  {
    q: "여러 개를 동시에 받아도 되나요?",
    a: "성격이 다른 지원(예: 월세 + 적금 + 취업수당)은 대체로 함께 받을 수 있습니다. 다만 비슷한 목적의 자산형성 상품(청년도약계좌·청년내일저축계좌 등)은 중복 가입이 제한될 수 있으니 확인이 필요합니다.",
  },
  {
    q: "내게 맞는 청년 지원을 한 번에 찾으려면?",
    a: "정부 청년정책 포털 '온통청년(youth.go.kr)'에서 나이·지역·관심 분야로 맞춤 검색을 할 수 있습니다. 중앙정부 제도와 별개로 사는 지역(시·도, 시·군·구)의 청년 정책도 꼭 함께 확인하세요.",
  },
];

/* ─────────────────────────  작은 컴포넌트  ───────────────────────── */

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{kicker}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
    </div>
  );
}

function DepthCard({
  tone, badge, title, sub, rows,
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
          <div key={r.k} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:gap-4">
            <dt className="w-full shrink-0 text-sm font-semibold text-slate-700 sm:w-40">{r.k}</dt>
            <dd className={`text-sm leading-relaxed ${r.accent ? "font-medium text-indigo-700" : "text-slate-600"}`}>
              {r.v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ─────────────────────────  페이지  ───────────────────────── */

export default function YouthSupportGuide() {
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
      { "@type": "ListItem", position: 2, name: "청년 지원 총정리 가이드", item: `${SITE}${PATH}` },
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
              2026년 기준 · 청년 정책 한눈에
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              흩어진 청년 지원,
              <br className="hidden sm:block" /> 목돈·주거·취업 세 갈래로 정리 (2026)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              청년 지원은 종류가 많고 부처·지자체에 흩어져 있어 막상 뭘 받을 수 있는지 알기
              어렵습니다. 핵심만 잡으면 됩니다 — 청년 지원은 결국 <strong>① 목돈 모으기,
              ② 주거, ③ 취업·생활</strong> 세 갈래입니다. 이 가이드로 큰 그림을 잡고, 각 제도의
              상세는 연결된 글에서 확인하세요.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { k: "목돈 모으기", v: "청년미래적금", d: "정부기여금 6~12% · 2026.6 출시" },
                { k: "주거", v: "청년 월세 지원", d: "월 20만 × 24개월(최대 480만)" },
                { k: "취업·생활", v: "국민취업지원", d: "구직촉진수당 월 60만" },
              ].map((c) => (
                <div key={c.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
            <SectionTitle kicker="한 표로 정리" title="목적별 대표 청년 지원" />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">목적</th>
                    <th className="px-4 py-3 font-semibold text-indigo-700">대표 지원</th>
                    <th className="px-4 py-3 font-semibold text-slate-800">핵심</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARE.map((r) => (
                    <tr key={r.axis} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-700">{r.axis}</td>
                      <td className={`px-4 py-3 ${r.accent ? "font-medium text-indigo-700" : "text-slate-600"}`}>{r.program}</td>
                      <td className="px-4 py-3 text-slate-600">{r.point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. 자산 형성 */}
          <section>
            <SectionTitle kicker="① 목돈 모으기" title="자산 형성 — 정부가 보태 준다" />
            <DepthCard tone="indigo" badge="자산형성" title="청년미래적금 + 청년주택드림" sub="정부 기여금·비과세·청약 우대" rows={ASSET} />
          </section>

          {/* 3. 주거 */}
          <section>
            <SectionTitle kicker="② 주거" title="주거 — 월세·전세 부담 낮추기" />
            <DepthCard tone="slate" badge="주거" title="청년 월세 지원 + 청년 전세대출" sub="2026년 월세 지원 상시화" rows={HOUSING} />
          </section>

          {/* 4. 취업·생활 */}
          <section>
            <SectionTitle kicker="③ 취업·생활" title="취업 — 구직 기간 버팀목" />
            <DepthCard tone="slate" badge="취업·생활" title="국민취업지원제도 + 생활 지원" sub="구직촉진수당 월 60만 · work24" rows={JOB} />
          </section>

          {/* 5. 체크리스트 */}
          <section>
            <SectionTitle kicker="놓치면 안 되는" title="한 장 체크리스트" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
                <li><strong className="text-slate-800">공통</strong> — 온통청년(youth.go.kr)에서 나이·지역·관심분야로 맞춤 검색</li>
                <li><strong className="text-slate-800">목돈</strong> — 청년미래적금 6월 가입(연 2회만 모집) / 청약은 청년주택드림 통장</li>
                <li><strong className="text-slate-800">주거</strong> — 청년 월세 지원(상시 신청) / 버팀목 청년 전세대출 자격 확인</li>
                <li><strong className="text-slate-800">취업</strong> — 소득 없어도 국민취업지원 청년특례(work24) 신청 가능</li>
                <li><strong className="text-slate-800">지역</strong> — 사는 시·도, 시·군·구의 청년수당·면접비 등 별도 확인</li>
              </ul>
            </div>
          </section>

          {/* 6. 주의 박스 */}
          <section>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">⚠️ 신청 전 꼭 확인</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">청년 정책은 기준·시기가 자주 바뀝니다</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                청년 지원은 나이·소득 기준과 모집 시기가 매년 바뀌고, 같은 이름이라도 중앙정부와
                지자체 조건이 다를 수 있습니다. 이 글은 2026년 6월 기준 큰 틀이며, 신청 전{" "}
                <a href={SRC_YOUTH} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-800 underline underline-offset-2">
                  온통청년(youth.go.kr)
                </a>
                과 각 제도 공식 창구에서 최신 기준을 반드시 확인하세요.
              </p>
            </div>
          </section>

          {/* 7. FAQ */}
          <section>
            <SectionTitle kicker="자주 헷갈리는 것" title="청년들이 가장 많이 묻는 질문" />
            <div className="space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm [&_summary]:list-none">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                    {f.q}
                    <span className="text-indigo-500 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* 8. 관련 글 */}
          <section>
            <SectionTitle kicker="함께 보면 좋은" title="관련 글" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link href={SRC_SAVINGS} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40">
                <p className="text-sm font-bold text-slate-900">청년미래적금 정리 →</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">청년도약계좌 후속 — 정부 기여금·만기 수령액·갈아타기 특례까지.</p>
              </Link>
              <Link href={SRC_RENT} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40">
                <p className="text-sm font-bold text-slate-900">청년 월세 지원 →</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">월 최대 20만 원, 자격·신청 방법을 자세히.</p>
              </Link>
              <Link href={SRC_COMPARE} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40">
                <p className="text-sm font-bold text-slate-900">청년도약계좌 vs 청년미래적금 →</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">어떤 상품이 내게 유리한지 비교.</p>
              </Link>
              <Link href={SRC_BENEFITS} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40">
                <p className="text-sm font-bold text-slate-900">정부 지원금 전체 →</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">청년 외에도 받을 수 있는 지원금 모음.</p>
              </Link>
            </div>
          </section>

          {/* 9. CTA */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href={SRC_YOUTH} target="_blank" rel="noopener noreferrer" className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700">
              <span className="text-sm font-bold">온통청년에서 맞춤 검색 →</span>
              <span className="mt-1 text-xs text-indigo-100">youth.go.kr · 나이·지역·관심분야로</span>
            </a>
            <a href={SRC_WORK} target="_blank" rel="noopener noreferrer" className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40">
              <span className="text-sm font-bold">국민취업지원 신청 →</span>
              <span className="mt-1 text-xs text-slate-500">work24.go.kr · 구직촉진수당</span>
            </a>
          </section>

          {/* 면책 + 출처 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 금액·요건은 2026년 6월 기준({UPDATED} 확인)으로 정리한 것입니다. 청년
              지원은 나이·소득 기준과 모집 시기가 자주 바뀌고 지자체별로 다르므로, 신청 전 온통청년
              (youth.go.kr)·복지로·work24와 거주지 지자체에서 최신 기준을 반드시 확인하시기
              바랍니다. 본 내용은 정보 제공을 위한 것입니다.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-400">
              <li>· 온통청년 청년정책 포털 (youth.go.kr)</li>
              <li>· 청년 월세 한시 특별지원 — 복지로 (bokjiro.go.kr) / 국토교통부</li>
              <li>· 국민취업지원제도 — 고용24 (work24.go.kr) / 고용노동부</li>
              <li>· 청년미래적금 — 서민금융진흥원 등</li>
            </ul>
          </footer>
        </div>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
