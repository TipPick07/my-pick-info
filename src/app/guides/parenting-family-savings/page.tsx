import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 돈 pillar 3편 — 자녀 미래자금 3축(적금·청약·보험) 에버그린 가이드
 *
 * ▷ keyword-map-parenting §3 큐 ②(육아 금융 / C6 적금·청약·보험). 2편(parenting-family-finance)과
 *   보완관계: 2편은 '부모의 주거 대출', 3편은 '아이 이름의 돈'. 본문 중복(카니발) 0.
 * ▷ 독립 정적 라우트입니다. src/content/posts/*.md(블로그)도, public/data/pick-info.json(크롤링)도
 *   건드리지 않으므로 자동발행 파이프라인의 isDuplicate / dedup / 표 게이트와 충돌하지 않습니다.
 * ▷ 본문은 마크다운이 아니라 JSX로 직접 배치합니다(표 깨짐 버그 클래스 원천 차단).
 * ▷ 외부 커스텀 컴포넌트는 Header/Footer만 재사용. 요약박스·비교표·깊이카드·FAQ는 전부 이 파일 안 인라인.
 * ▷ ★데이터 특수성: 이 주제는 복지로 크롤 비대상(금융·세제)이라 pick-info에 데이터가 없습니다.
 *   모든 수치는 아래 1차 출처로 검증해 DATA(SSOT)에 박았습니다. 갱신 시 여기만 수정.
 *   · 청약: 주택공급에 관한 규칙(2024.9.30 개정 — 월납입 인정 25만원·미성년 60회) + 국토부 보도(2024.9 금리 2.3~3.1%)
 *   · 증여: 상속세 및 증여세법 증여재산공제(미성년 2천만/성년 5천만, 10년 합산) + 혼인·출산 공제 1억(2024.1.1~)
 *   · 디딤씨앗통장: 보건복지부 아동자산형성사업(1:2 매칭·정부 월 최대 10만원) — 본 가이드는 안내·링크만
 * ▷ 보험 절은 '구조 일반론'만 다룹니다 — 특정 상품·보험사·요율 언급 0, 제휴 링크 0.
 * ▷ 제휴(은행·보험) 링크 없음 — 순수 정보 가이드. AffiliateBanner·광고 고리 0.
 */

const SITE = "https://tip-pick.com";
const PATH = "/guides/parenting-family-savings/";
const UPDATED = "2026-06-10"; // 사실 최종 확인일

// 공식 출처 (staleness 완화 — 본문 곳곳에서 최신값 확인 링크로 사용)
const SRC_APPLYHOME = "https://www.applyhome.co.kr"; // 청약홈 (한국부동산원)
const SRC_NTS_GIFT =
    "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6533&cntntsId=7960"; // 국세청 증여세(기본세율 적용 증여)
const SRC_BOKJIRO = "https://www.bokjiro.go.kr"; // 복지로 (디딤씨앗통장 신청)
const SRC_FINE = "https://fine.fss.or.kr"; // 금융감독원 금융소비자정보포털 파인 (보험 비교공시)

// 절대 URL로 지정 → layout의 metadataBase 유무와 무관하게 og:image가 안전하게 해석됨
const OG_IMAGE = `${SITE}/images/og/parenting-family-savings.png`;
const OG_TITLE = "아이 이름의 돈 — 자녀 적금·청약·보험 3축 가이드 (2026)";
const OG_DESC =
    "모으기(적금·증여 비과세 10년 2천만원), 앞당기기(청약통장 만 14세부터 5년 인정), 지키기(어린이보험 보장 위주). 자녀 미래자금을 세 갈래로 나눠 설계하는 2026 가이드.";

export const metadata: Metadata = {
    title: "아이 이름의 돈 — 자녀 적금·청약·보험 3축 가이드 (2026) | 팁픽",
    description:
        "아이 앞으로 돈을 준비하는 길은 세 갈래입니다. 적금·증여로 모으고(10년 2천만원 비과세), 청약통장으로 앞당기고(만 14세부터 최대 5년 인정), 보험으로 지키는(보장 위주·과보장 주의) 설계를 2026년 기준으로 한 페이지에 정리했습니다.",
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
                alt: "자녀 적금 청약 보험 3축 가이드",
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

/* ─────────────────  검증된 2026 데이터 (SSOT · 국세청 / 주택공급규칙 / 복지부)  ───────────────── */

// ★ 핵심 비교표 — 모으기 vs 앞당기기 vs 지키기
const COMPARE = [
    {
        axis: "역할",
        save: "목돈 모으기 (학자금·독립자금)",
        chung: "내 집 마련 출발선 앞당기기",
        insure: "큰 위험에서 가계 지키기",
    },
    {
        axis: "도구",
        save: "자녀 명의 예·적금 + 증여",
        chung: "주택청약종합저축 (자녀 명의)",
        insure: "어린이보험 (보장형)",
    },
    {
        axis: "핵심 숫자",
        save: "증여 비과세 10년당 2,000만원 (미성년)",
        chung: "만 19세 이전 납입 최대 60회(5년) 인정",
        insure: "숫자보다 '보장 범위'가 핵심",
        accent: true,
    },
    {
        axis: "최적 시작",
        save: "빠를수록 (10년 단위 한도 리셋)",
        chung: "만 14세 생일 (인정 5년을 꽉 채우는 시점)",
        insure: "출생 전후 (태아 시기 가입 가능)",
    },
    {
        axis: "주의",
        save: "한도 내라도 증여 신고 권장",
        chung: "일찍 만들어도 인정은 5년뿐",
        insure: "저축성·과보장 경계",
    },
];

// 모으기(적금·증여) 깊이
const SAVING = [
    {
        k: "증여 비과세 한도",
        v: "미성년 자녀 10년당 2,000만원 · 성년 자녀 10년당 5,000만원 (직계존속 합산 — 부모·조부모를 더해 한 한도)",
        accent: true,
    },
    {
        k: "10년 리셋 활용",
        v: "0세 2,000만 → 10세 2,000만 → 20세 5,000만원, 성인까지 최대 9,000만원을 증여세 없이 이전 가능",
    },
    {
        k: "신고",
        v: "한도 내 비과세라도 홈택스 증여 신고를 해두면 좋습니다 — 이후 그 돈의 운용 수익이 '자녀 자산'으로 인정되는 근거가 되고, 성인 후 자금출처 입증이 깔끔해집니다",
    },
    {
        k: "출산 증여공제 (부모 본인용)",
        v: "아이 출생일 전후 2년 내에 부모가 '본인의' 직계존속(조부모 등)에게 받는 증여는 기본공제와 별도로 1억원 추가 공제(2024.1.1. 이후 증여분) — 아이가 아니라 출산한 부모가 받는 공제입니다",
    },
    {
        k: "상품 선택",
        v: "은행별 자녀·주니어 적금은 금리·우대조건이 수시로 바뀝니다. 특정 상품 추천 대신, 가입 전 은행연합회·금융감독원 파인의 공시 금리를 비교하세요",
    },
];

// 앞당기기(청약) 깊이
const CHUNGYAK = [
    {
        k: "가입",
        v: "나이 제한 없음 — 보호자 동의로 미성년자도 가입 가능 (1인 1계좌, 미성년 개설은 은행 방문 필요한 경우가 많음)",
    },
    {
        k: "납입",
        v: "매월 2만 ~ 50만원 자유 납입",
    },
    {
        k: "미성년 인정 한도",
        v: "만 19세 이전 납입은 기간 최대 5년 · 횟수 최대 60회까지만 인정 (2024.1.1.부터 기존 2년 → 5년 확대)",
        accent: true,
    },
    {
        k: "회차당 인정액",
        v: "공공분양 저축총액 산정 시 월 25만원까지 인정 (2024.11. 10만원 → 25만원 상향)",
    },
    {
        k: "만 14세가 분기점",
        v: "인정이 5년뿐이므로 만 14세 생일에 시작하면 인정 구간을 꽉 채웁니다. 14세 가입 시 29세에 가점제 '가입기간' 만점(17점) 도달 — 19세 가입보다 5점 앞섭니다",
    },
    {
        k: "금리",
        v: "연 2.3 ~ 3.1% (기간별 차등 · 변동금리, 정부 고시로 수시 변경) — 가입 시점 금리는 청약홈·은행에서 확인",
    },
    {
        k: "소득공제와의 관계",
        v: "청약저축 소득공제(연 300만원 한도)는 무주택 세대주 본인 납입분 기준이라, 자녀 명의 통장 납입과는 별개입니다",
    },
    {
        k: "증여와의 연결",
        v: "부모가 자녀 통장에 넣어주는 납입금도 증여입니다 — 위 모으기 절의 10년 2,000만원 한도 안에서 함께 계산하세요",
    },
];

// 지키기(보험) 깊이 — 구조 일반론만, 상품·요율 0
const INSURANCE = [
    {
        k: "역할 구분이 먼저",
        v: "보험의 일은 '큰 병·사고가 났을 때 가계가 무너지지 않게' 하는 것입니다. 목돈 만들기는 예·적금의 일 — 두 역할을 한 상품에 섞지 않는 것이 기본입니다",
        accent: true,
    },
    {
        k: "보장형 vs 저축성",
        v: "저축성(교육보험류)은 사업비를 떼고 적립돼 중도 해지 시 원금 손실이 날 수 있습니다. 자녀 보험은 보장형 위주로, 저축은 따로 가져가는 쪽이 단순하고 비교도 쉽습니다",
    },
    {
        k: "태아보험이란",
        v: "별도 상품이 아니라 어린이보험을 출생 전(임신 중)에 가입하는 형태입니다 — 선천·출생 관련 담보를 붙일 수 있는 시기가 한정돼 있어 가입 시점이 곧 선택지입니다",
    },
    {
        k: "갱신 vs 비갱신",
        v: "갱신형은 처음엔 싸지만 갱신 때마다 보험료가 오를 수 있고, 비갱신형은 처음부터 균등합니다. 보장 기간(20·30세 만기 vs 80·100세)과 함께 총 납입액 기준으로 비교하세요",
    },
    {
        k: "과보장 경계",
        v: "담보를 늘릴수록 보험료는 확실히 늘고 혜택은 확률적입니다. 발생 시 가계가 감당 못 할 큰 위험(중대 질병·수술·배상책임) 중심으로 추리고, 소액 담보 나열은 경계하세요",
    },
    {
        k: "비교는 공시로",
        v: "특정 설계사·플랫폼의 추천 전에, 금융감독원 파인의 보험 비교공시에서 같은 담보 기준 보험료를 직접 비교할 수 있습니다",
    },
];

const FAQS = [
    {
        q: "아이 통장에 돈을 넣으면 무조건 증여세를 신고해야 하나요?",
        a: "미성년 자녀는 10년간 2,000만원까지 증여재산공제가 적용되어 한도 내라면 낼 세금은 없습니다. 다만 한도 내라도 홈택스로 증여 신고를 해두는 것이 좋습니다 — 신고해 둔 원금에서 불어난 운용 수익은 자녀 자산으로 인정받기 유리하고, 성인이 된 뒤 전세금·주택자금 등의 자금출처를 입증할 때 근거가 됩니다. 한도는 부모·조부모 등 직계존속을 합산해 계산한다는 점도 유의하세요. (2026년 기준)",
    },
    {
        q: "청약통장은 아이가 몇 살일 때 만들어주는 게 좋나요?",
        a: "일찍 만들어도 만 19세 이전 납입은 기간 최대 5년·횟수 최대 60회까지만 인정됩니다(2024년 1월 1일부터 2년에서 5년으로 확대). 그래서 인정 구간을 꽉 채우는 만 14세 생일이 효율의 분기점입니다. 만 14세에 가입하면 29세에 민영주택 가점제의 '가입기간' 항목 만점(17점)에 도달해, 19세에 가입한 사람보다 5점 앞서게 됩니다. 더 일찍 만드는 것이 손해는 아니지만, 인정 측면의 이득은 14세 이후 납입분부터입니다.",
    },
    {
        q: "미성년 때 넣은 돈은 전부 청약 실적으로 인정되나요?",
        a: "아니요, 두 가지 상한이 있습니다. 횟수는 만 19세 이전 납입분 중 최대 60회(5년치)까지만 인정되고, 공공분양 저축총액 산정 시 회차당 인정액은 월 25만원까지입니다(2024년 11월 10만원에서 상향). 그 이상 납입한 돈이 사라지는 것은 아니지만 청약 실적으로는 반영되지 않습니다. 본인의 정확한 인정 회차·금액은 청약홈에서 확인하세요. (2026년 기준)",
    },
    {
        q: "디딤씨앗통장은 아무나 가입할 수 있나요?",
        a: "아니요. 디딤씨앗통장(아동발달지원계좌)은 보호대상 아동(시설·가정위탁 등)과 기초생활수급 가구 등 취약계층 아동을 위한 국가 자산형성 사업입니다. 아동이 저축하면 정부가 1:2로 매칭해 월 최대 10만원까지 지원하는 구조라, 대상에 해당한다면 어떤 일반 적금보다 우선해야 합니다. 대상 여부와 신청은 복지로 또는 주소지 행정복지센터에서 확인하세요.",
    },
    {
        q: "교육보험(저축성 보험)으로 학자금을 모으는 건 어떤가요?",
        a: "저축성 보험은 납입액에서 사업비를 떼고 적립되는 구조라, 중도 해지하면 원금보다 적게 돌려받을 수 있습니다. 학자금처럼 시기가 정해진 목돈은 예·적금과 증여 설계로 모으고, 보험은 보장형으로 위험 대비에 집중하는 '역할 분리'가 비교도 쉽고 실패 확률도 낮습니다. 구체적인 환급률·보장 내용은 상품마다 다르니, 가입 전 금융감독원 파인의 비교공시를 확인하세요.",
    },
];

/* ─────────────────  작은 표현용 컴포넌트(파일 내부 · 1·2편과 동일)  ───────────────── */

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
    tone: "indigo" | "slate" | "emerald";
    badge: string;
    title: string;
    sub: string;
    rows: { k: string; v: string; accent?: boolean }[];
}) {
    const head =
        tone === "indigo"
            ? "bg-indigo-600"
            : tone === "emerald"
                ? "bg-emerald-700"
                : "bg-slate-900";
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
                            className={`text-sm leading-relaxed ${r.accent ? "font-medium text-indigo-700" : "text-slate-600"
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

/* ─────────────────  페이지  ───────────────── */

export default function ParentingFamilySavingsGuide() {
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
                name: "자녀 적금·청약·보험 가이드",
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
                            2026년 기준 · 자녀 미래자금
                        </div>
                        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                            아이 이름의 돈,
                            <br className="hidden sm:block" /> 세 갈래로 나눠 키우기
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                            아이 앞으로 돈을 준비하는 길은 사실 세 가지뿐입니다 —{" "}
                            <strong className="text-slate-800">모으고(적금·증여)</strong>,{" "}
                            <strong className="text-slate-800">앞당기고(청약)</strong>,{" "}
                            <strong className="text-slate-800">지키는(보험)</strong> 것.
                            세 역할을 한 상품에 섞지 않고 갈래별로 가져가는 게 이 가이드의 전부입니다.
                        </p>

                        {/* 핵심 요약 박스 (인라인 · 1·2편과 동일 패턴) */}
                        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                {
                                    k: "모으기",
                                    v: "적금 + 증여",
                                    d: "비과세 10년당 2,000만원",
                                },
                                {
                                    k: "앞당기기",
                                    v: "청약통장",
                                    d: "만 14세부터 5년 인정",
                                },
                                {
                                    k: "지키기",
                                    v: "어린이보험",
                                    d: "보장형 위주 · 과보장 주의",
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
                    {/* 1. ★ 핵심 비교표 — 3축 (글의 중심) */}
                    <section>
                        <SectionTitle
                            kicker="한 표로 정리"
                            title="모으기 · 앞당기기 · 지키기 (2026)"
                        />
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600">
                                        <th className="px-4 py-3 font-semibold">구분</th>
                                        <th className="px-4 py-3 font-semibold text-indigo-700">
                                            모으기 · 적금
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-slate-800">
                                            앞당기기 · 청약
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-emerald-700">
                                            지키기 · 보험
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
                                                className={`px-4 py-3 ${r.accent
                                                        ? "font-medium text-indigo-700"
                                                        : "text-slate-600"
                                                    }`}
                                            >
                                                {r.save}
                                            </td>
                                            <td
                                                className={`px-4 py-3 ${r.accent
                                                        ? "font-medium text-indigo-700"
                                                        : "text-slate-600"
                                                    }`}
                                            >
                                                {r.chung}
                                            </td>
                                            <td
                                                className={`px-4 py-3 ${r.accent
                                                        ? "font-medium text-emerald-700"
                                                        : "text-slate-600"
                                                    }`}
                                            >
                                                {r.insure}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-slate-400">
                            ※ 모든 수치는 2026년 기준입니다. 세법·청약 규칙·금리는 바뀔 수 있으니 실행 전{" "}
                            <a
                                href={SRC_NTS_GIFT}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 underline-offset-2 hover:underline"
                            >
                                국세청
                            </a>
                            ·
                            <a
                                href={SRC_APPLYHOME}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 underline-offset-2 hover:underline"
                            >
                                청약홈
                            </a>
                            에서 확인하세요.
                        </p>
                    </section>

                    {/* 2. 모으기 깊이 — 적금 + 증여 */}
                    <section>
                        <SectionTitle kicker="첫 번째 갈래" title="모으기 — 적금과 증여 설계" />
                        <p className="mb-5 text-sm leading-relaxed text-slate-600">
                            자녀 명의 적금의 핵심은 상품 고르기가 아니라{" "}
                            <strong className="text-slate-800">증여 설계</strong>입니다. 어떤 적금에
                            넣든, 부모가 자녀 계좌에 넣는 돈은 증여이고 비과세 한도는 10년 단위로
                            돌아오기 때문입니다.
                        </p>
                        <DepthCard
                            tone="indigo"
                            badge="적금 + 증여"
                            title="비과세 10년당 2,000만원 (미성년)"
                            sub="2026년 기준 · 상속세 및 증여세법 증여재산공제"
                            rows={SAVING}
                        />
                        {/* 디딤씨앗통장 — 안내·링크만 (대상 한정 제도) */}
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                            <p className="text-sm font-bold text-slate-900">
                                해당된다면 무엇보다 먼저 — 디딤씨앗통장
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                보호대상·기초생활수급 가구 등 취약계층 아동이라면, 아동이 저축한 금액에
                                정부가 <strong className="text-slate-800">1:2로 매칭(월 최대 10만원 지원)</strong>
                                하는 디딤씨앗통장이 어떤 일반 적금보다 우선입니다. 대상 여부·신청은{" "}
                                <a
                                    href={SRC_BOKJIRO}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-500 underline-offset-2 hover:underline"
                                >
                                    복지로
                                </a>
                                나 주소지 행정복지센터에서 확인하세요.
                            </p>
                        </div>
                    </section>

                    {/* 3. 앞당기기 깊이 — 청약 */}
                    <section>
                        <SectionTitle
                            kicker="두 번째 갈래"
                            title="앞당기기 — 자녀 청약통장과 만 14세의 의미"
                        />
                        <DepthCard
                            tone="slate"
                            badge="주택청약종합저축"
                            title="만 19세 이전 납입, 최대 5년 · 60회 인정"
                            sub="2026년 기준 · 주택공급에 관한 규칙(2024.9.30 개정 반영)"
                            rows={CHUNGYAK}
                        />
                        <p className="mt-3 text-xs text-slate-400">
                            인정 회차·가점 등 본인 기준 확인:{" "}
                            <a
                                href={SRC_APPLYHOME}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 underline-offset-2 hover:underline"
                            >
                                청약홈
                            </a>
                        </p>
                    </section>

                    {/* 4. 지키기 깊이 — 보험 (구조 일반론) */}
                    <section>
                        <SectionTitle
                            kicker="세 번째 갈래"
                            title="지키기 — 어린이보험, 구조만 알면 절반"
                        />
                        <p className="mb-5 text-sm leading-relaxed text-slate-600">
                            이 절에는 의도적으로 상품명도, 보험료 숫자도 없습니다. 보험은 상품·담보
                            조합마다 값이 달라{" "}
                            <strong className="text-slate-800">구조를 이해하고 공시로 비교</strong>하는
                            것이 유일하게 일반화되는 방법이기 때문입니다.
                        </p>
                        <DepthCard
                            tone="emerald"
                            badge="어린이·태아보험"
                            title="보장은 보험에게, 저축은 적금에게"
                            sub="구조 일반론 · 특정 상품 추천 아님"
                            rows={INSURANCE}
                        />
                        <p className="mt-3 text-xs text-slate-400">
                            같은 담보 기준 보험료 비교:{" "}
                            <a
                                href={SRC_FINE}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 underline-offset-2 hover:underline"
                            >
                                금융감독원 파인(FINE)
                            </a>
                        </p>
                    </section>

                    {/* 5. ⚠️ 시점 주의 박스 */}
                    <section>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                                ⚠️ 실행 전 꼭 확인
                            </p>
                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                세 갈래 모두 '기준 시점'이 있습니다
                            </h2>
                            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                                <li>
                                    <strong className="text-slate-800">증여 한도는 세법</strong> — 10년당
                                    2,000만원(미성년) 공제는 상속세 및 증여세법 기준으로, 세법 개정 시 바뀔
                                    수 있습니다. 큰 금액을 옮기기 전 국세청 기준을 확인하세요.
                                </li>
                                <li>
                                    <strong className="text-slate-800">청약 금리는 변동</strong> — 연
                                    2.3~3.1%는 정부 고시로 수시 조정됩니다. 인정 회차(60회)·인정액(월
                                    25만원)도 규칙 개정 대상입니다.
                                </li>
                                <li>
                                    <strong className="text-slate-800">보험은 상품마다 다름</strong> — 이
                                    가이드의 보험 절은 구조 일반론이며, 실제 보장·보험료는 상품·담보
                                    조합에 따라 다릅니다. 가입 전 약관과 비교공시를 직접 확인하세요.
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 6. FAQ — 네이티브 details/summary (1·2편과 동일) */}
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

                    {/* 7. 관련 가이드 (짧게 · 풀섹션 아님) */}
                    <section>
                        <SectionTitle kicker="함께 보면 좋은" title="관련 가이드" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Link
                                href="/guides/parenting-family-benefits/"
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                            >
                                <p className="text-sm font-bold text-slate-900">
                                    현금성 지원 가이드 (1편) →
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                    아동수당·부모급여·보육료·양육수당·유아학비 — 나라에서 들어오는 돈을
                                    먼저 챙기면, 이 가이드의 '모으기' 재원이 됩니다.
                                </p>
                            </Link>
                            <Link
                                href="/guides/parenting-family-finance/"
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                            >
                                <p className="text-sm font-bold text-slate-900">
                                    출산 가구 주택 대출 가이드 (2편) →
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                    아이 돈이 3편이라면 부모의 집은 2편 — 신생아 특례 디딤돌·버팀목을 한
                                    표로 비교했습니다.
                                </p>
                            </Link>
                        </div>
                    </section>

                    {/* 8. 발견 CTA — 1·2편 CTA 패턴 동일 · 제휴/은행·보험 링크 없음 */}
                    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Link
                            href="/benefits/"
                            className="flex flex-col rounded-2xl bg-indigo-600 px-5 py-5 text-white transition-colors hover:bg-indigo-700"
                        >
                            <span className="text-sm font-bold">
                                수도권 육아·가족 지원금 보기 →
                            </span>
                            <span className="mt-1 text-xs text-indigo-100">
                                마감 있는 현금성 지원 사업을 한눈에
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
                            본 페이지의 금액·기준은 2026년 기준({UPDATED} 확인)으로 국세청(증여재산공제)·
                            주택공급에 관한 규칙 및 청약홈(청약통장)·보건복지부(디딤씨앗통장) 자료를 정리한
                            것입니다. 세법·청약 제도·금리는 수시로 바뀔 수 있으니 실행 전 국세청 홈택스와
                            청약홈에서 최신 기준을 반드시 확인하시기 바랍니다. 보험 관련 내용은 구조에 대한
                            일반 정보이며 특정 상품의 가입 권유가 아닙니다. 본 내용은 정보 제공을 위한 것이며
                            세무·금융 상담을 대신하지 않습니다.
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