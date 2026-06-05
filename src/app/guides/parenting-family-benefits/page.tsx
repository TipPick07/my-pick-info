import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 돈 pillar 1편 — 0세~초등 입학 전 수도권 육아·가족 지원금 에버그린 가이드
 *
 * ▷ 독립 정적 라우트입니다. src/content/posts/*.md(블로그)도, public/data/pick-info.json(크롤링)도
 *   건드리지 않으므로 자동발행 파이프라인의 isDuplicate / dedup / 표 게이트와 충돌하지 않습니다.
 * ▷ 본문은 마크다운이 아니라 JSX로 직접 배치합니다(표 깨짐 버그 클래스 원천 차단).
 * ▷ 외부 커스텀 컴포넌트는 Header/Footer만 재사용. 요약박스·비교표·결정·FAQ는 전부 이 파일 안 인라인.
 * ▷ 모든 수치는 2026년 기준(복지로·정부24·교육부 2026 보육사업안내·서울시). 갱신 시 아래 DATA 한 곳만 수정.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/parenting-family-benefits/";
const UPDATED = "2026-06-05"; // 사실 최종 확인일

// 절대 URL로 지정 → layout의 metadataBase 유무와 무관하게 og:image가 안전하게 해석됨
const OG_IMAGE = `${SITE}/images/og/parenting-family-benefits.png`;
const OG_TITLE = "0세~초등 입학 전, 수도권 육아·가족 지원금 한눈에 (2026)";
const OG_DESC =
  "아동수당·부모급여·보육료·양육수당·유아학비 — 나이 × 돌봄 형태로 한눈에 정리한 2026 육아 지원금 가이드.";

export const metadata: Metadata = {
  title: "0세~초등 입학 전, 수도권 육아·가족 지원금 한눈에 (2026) | 팁픽",
  description:
    "아동수당·부모급여·보육료·양육수당·유아학비까지 — 우리 아이 나이와 돌봄 형태(집·어린이집·유치원)에 따라 무엇을 받는지 2026년 기준으로 한 페이지에 정리했습니다.",
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
        alt: "0세~초등 입학 전 수도권 육아·가족 지원금 한눈에",
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

/* ─────────────────────────  검증된 2026 데이터 (SSOT)  ───────────────────────── */

// 나이 × 돌봄 형태 결정 매트릭스
const STAGES = [
  {
    age: "0~1세",
    months: "0~23개월",
    common: "아동수당 월 10만원 + 부모급여",
    rows: [
      { care: "집에서 양육", get: "부모급여 현금 (0세 100만 · 1세 50만)" },
      {
        care: "어린이집",
        get: "보육료(정부가 어린이집에 직접 지급) + 부모급여 차액 현금",
      },
    ],
    note: "0~1세는 양육수당 대신 부모급여가 지급됩니다.",
  },
  {
    age: "2세",
    months: "24~35개월",
    common: "아동수당 월 10만원",
    rows: [
      { care: "집에서 양육", get: "가정양육수당 월 10만원" },
      { care: "어린이집", get: "보육료 월 42.6만원 (정부 → 어린이집)" },
    ],
    note: "집 ↔ 어린이집은 둘 중 하나만 선택됩니다.",
  },
  {
    age: "3~5세",
    months: "취학 전",
    common: "아동수당 월 10만원",
    rows: [
      { care: "집에서 양육", get: "가정양육수당 월 10만원" },
      { care: "어린이집", get: "보육료(누리) 월 28만원 (정부 → 어린이집)" },
      {
        care: "유치원",
        get: "유아학비 국공립 10만 · 사립 28만 (+ 방과후 5만/7만)",
      },
    ],
    note: "집 · 어린이집 · 유치원 중 하나만 선택됩니다.",
  },
];

// 5종 한눈 비교
const BENEFITS = [
  {
    name: "아동수당",
    target: "0~만 9세 미만",
    amount: "월 10만원 (수도권)",
    form: "현금 — 부모 계좌",
    overlap: "모든 지원과 중복 ✓",
    accent: true,
  },
  {
    name: "부모급여",
    target: "0~23개월",
    amount: "0세 100만 · 1세 50만",
    form: "현금(가정) · 어린이집은 보육료 차감 후 차액",
    overlap: "아동수당과 중복 ✓",
  },
  {
    name: "보육료 (어린이집)",
    target: "0~5세",
    amount: "0세반 58.4만 · 1세반 51.5만 · 2세반 42.6만 · 3~5세 28만",
    form: "어린이집에 직접 지급 (국민행복카드)",
    overlap: "양육수당·유아학비와 택일",
  },
  {
    name: "가정양육수당",
    target: "24~86개월 미만",
    amount: "월 10만원",
    form: "현금 — 부모 계좌",
    overlap: "보육료·유아학비와 택일 · 24개월 미만은 부모급여",
  },
  {
    name: "유아학비 (유치원)",
    target: "만 3~5세",
    amount: "교육비 국공립 10만 · 사립 28만 (+ 방과후 5만/7만)",
    form: "유치원에 바우처 지급 (국민행복카드)",
    overlap: "보육료·양육수당과 택일",
  },
];

const FAQS = [
  {
    q: "부모급여랑 아동수당, 같이 받을 수 있나요?",
    a: "네. 둘은 별개 제도라 중복 수령됩니다. 예를 들어 0세 아이라면 부모급여 100만원 + 아동수당 10만원으로 매달 110만원을 받습니다.",
  },
  {
    q: "어린이집에 다니는데 양육수당도 받을 수 있나요?",
    a: "아니요. 가정양육수당은 '집에서 키울 때'만 나옵니다. 어린이집에 보내면 보육료(정부가 어린이집에 직접 지급)로 바뀌고, 둘은 동시에 받을 수 없습니다.",
  },
  {
    q: "보육료가 제 통장에 안 들어와요. 잘못된 건가요?",
    a: "정상입니다. 보육료와 유아학비는 현금이 아니라 어린이집·유치원에 직접 지급되는 바우처(국민행복카드)입니다. 부모 계좌로 들어오는 현금은 아동수당, 부모급여(가정양육 시), 가정양육수당입니다.",
  },
  {
    q: "유치원과 어린이집 지원, 뭐가 다른가요?",
    a: "3~5세 누리과정은 둘 다 동일하게 월 28만원 기준입니다. 유치원은 '유아학비'(국공립·사립 차등 + 방과후과정비), 어린이집은 '보육료'로 불립니다. 사립유치원은 지원금(28만원)을 넘는 특성화 활동비·차량비 등을 부모가 추가로 부담할 수 있습니다.",
  },
  {
    q: "2026년에 달라진 점은 무엇인가요?",
    a: "아동수당 대상 연령이 2026년 4월부터 만 8세 미만에서 9세 미만으로 확대됐고(2030년까지 매년 1세씩 13세 미만까지), 어린이집 보육료 단가도 인상됐습니다(0세반 58.4만원 등). 인기 글 다수가 아직 2025년 단가를 쓰고 있으니 금액은 꼭 최신 기준으로 확인하세요.",
  },
];

/* ─────────────────────────  작은 표현용 컴포넌트(파일 내부)  ───────────────────────── */

function SectionTitle({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
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

/* ─────────────────────────  페이지  ───────────────────────── */

export default function ParentingFamilyBenefitsGuide() {
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
        name: "육아·가족 지원금 가이드",
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
              2026년 기준 · 수도권 부모용
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              0세부터 초등 입학 전까지,
              <br className="hidden sm:block" /> 우리 아이 지원금 한눈에
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              아동수당·부모급여·보육료·양육수당·유아학비 — 이름은 많지만 핵심은
              두 가지입니다. <strong className="text-slate-800">아이 나이</strong>와{" "}
              <strong className="text-slate-800">어디서 키우는지</strong>(집·어린이집·유치원).
              이 둘만 정하면 받을 수 있는 돈이 정해집니다.
            </p>

            {/* 핵심 요약 박스 (인라인) */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  k: "누구나 받는 것",
                  v: "아동수당",
                  d: "만 9세 미만 · 월 10만원",
                },
                {
                  k: "0~1세라면",
                  v: "부모급여",
                  d: "0세 100만 · 1세 50만",
                },
                {
                  k: "돌봄에 따라",
                  v: "보육료 · 양육수당 · 유아학비",
                  d: "셋 중 하나",
                },
              ].map((c) => (
                <div
                  key={c.k}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold text-indigo-600">{c.k}</p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {c.v}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-16 px-5 py-14">
          {/* 1. 보편 레이어: 아동수당 */}
          <section>
            <SectionTitle kicker="모두에게 깔리는 한 층" title="아동수당 — 나이만 맞으면 누구나" />
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-3xl font-extrabold text-indigo-700">
                  월 10만원
                </span>
                <span className="text-sm font-medium text-slate-500">
                  수도권 기준 · 부모 계좌로 현금 지급
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                만 9세 미만 아동이면 소득·재산과 상관없이 받는 보편 수당입니다.
                아래에 나오는 부모급여·보육료·양육수당·유아학비와 모두{" "}
                <strong>중복</strong>됩니다 — 즉 어떤 경우든 아동수당은 기본으로
                깔립니다.
              </p>
              <p className="mt-3 rounded-xl bg-white/70 px-4 py-3 text-xs leading-relaxed text-slate-500">
                2026년 4월부터 대상이 만 8세 → 9세 미만으로 확대됐고, 2030년까지
                매년 1세씩 만 13세 미만까지 넓어집니다. (비수도권·인구감소지역은
                10만원보다 더 받습니다.)
              </p>
            </div>
          </section>

          {/* 2. 나이 × 돌봄 결정 */}
          <section>
            <SectionTitle
              kicker="나이 × 돌봄으로 갈린다"
              title="우리 집은 무엇을 받을까"
            />
            <div className="space-y-5">
              {STAGES.map((s) => (
                <div
                  key={s.age}
                  className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="flex items-baseline justify-between gap-3 bg-slate-900 px-5 py-3">
                    <span className="text-lg font-bold text-white">
                      {s.age}
                    </span>
                    <span className="text-xs font-medium text-slate-300">
                      {s.months}
                    </span>
                  </div>
                  <div className="bg-white px-5 py-4">
                    <p className="mb-3 text-sm font-semibold text-indigo-700">
                      공통 · {s.common}
                    </p>
                    <ul className="space-y-2">
                      {s.rows.map((r) => (
                        <li
                          key={r.care}
                          className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {r.care}
                          </span>
                          <span className="text-sm text-slate-600">
                            {r.get}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-slate-400">※ {s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. 한눈 비교표 */}
          <section>
            <SectionTitle kicker="한 표로 정리" title="5가지 지원 한눈 비교 (2026)" />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">제도</th>
                    <th className="px-4 py-3 font-semibold">대상</th>
                    <th className="px-4 py-3 font-semibold">2026 금액</th>
                    <th className="px-4 py-3 font-semibold">지급 형태</th>
                    <th className="px-4 py-3 font-semibold">중복 / 택일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BENEFITS.map((b) => (
                    <tr key={b.name} className="align-top">
                      <td className="px-4 py-3">
                        <span
                          className={
                            b.accent
                              ? "font-bold text-indigo-700"
                              : "font-semibold text-slate-800"
                          }
                        >
                          {b.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.target}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {b.amount}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.form}</td>
                      <td className="px-4 py-3 text-slate-600">{b.overlap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              ※ 보육료는 부모 계좌가 아니라 어린이집·유치원에 직접 지급되는
              바우처입니다. 농어촌·장애아동 가정양육수당은 금액이 다릅니다.
            </p>
          </section>

          {/* 4. 금융 고리 자리 — 이번 편은 자리/문구 틀만 (실제 제휴 링크는 다음 단계) */}
          {/* TODO(제휴): 아래 카드 하단 또는 이 자리 직후에 <AffiliateBanner /> 삽입 예정. 맥락 기반 + 고지 유지. */}
          <section>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                받은 다음 단계
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                매달 들어오는 양육 현금, 그냥 통장에 두실 건가요?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                아동수당·부모급여·가정양육수당은 부모 계좌로 들어오는 현금입니다.
                일부라도 자녀 명의 적금이나 주택청약통장으로 자동이체해두면,
                초등 입학 즈음엔 적지 않은 목돈이 됩니다.
              </p>
              <p className="mt-4 rounded-xl bg-white px-4 py-3 text-xs text-slate-400">
                ※ 위 내용은 정보 제공을 위한 것이며 특정 금융상품 가입을 권유하지
                않습니다.
              </p>
            </div>
          </section>

          {/* 5. FAQ — 네이티브 details/summary (클라이언트 JS 불필요) */}
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

          {/* 6. 신청 */}
          <section>
            <SectionTitle kicker="신청하기" title="어디서 · 언제 신청하나" />
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  신청 창구
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  복지로(웹·앱), 정부24, 또는 읍·면·동 주민센터. 보육료·유아학비는
                  신청 후 국민행복카드를 발급받아야 합니다.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  신청 시점 (중요)
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  매달 15일 이전에 신청하면 그 달부터, 16일 이후면 다음 달부터
                  지원됩니다. 부모급여는 출생 후 60일 이내 신청하면 출생월까지
                  소급됩니다. 집 ↔ 어린이집 ↔ 유치원으로 바꿀 때(자격 변경)도 같은
                  창구에서 신청합니다.
                </p>
              </div>
            </div>
          </section>

          {/* 7. 발견 CTA — 독립 라우트라 블로그 자동 관련글이 안 붙으므로 수동 배치 */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/eligibility/"
              className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-sm font-bold">
                내 상황에 맞는 혜택만, 1분 진단 →
              </span>
              <span className="mt-1 text-xs text-indigo-100">
                나이·지역 입력하면 받을 수 있는 지원 추려드립니다
              </span>
            </Link>
            <Link
              href="/situations/parenting/"
              className="flex flex-col rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="text-sm font-bold">
                임신·출산·육아 지원 전체 보기 →
              </span>
              <span className="mt-1 text-xs text-slate-500">
                수도권 부모를 위한 지원금·나들이 모음
              </span>
            </Link>
          </section>

          {/* 면책 */}
          <footer className="border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-400">
              본 페이지의 금액·기준은 2026년 기준({UPDATED} 확인)으로 정리한
              것입니다. 정책과 지원 단가는 변동될 수 있으니, 신청 전 복지로
              (bokjiro.go.kr) 또는 정부24에서 최신 기준을 확인하시기 바랍니다.
              출처: 복지로 · 정부24 · 교육부 「2026년도 보육사업안내」 · 서울특별시.
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
