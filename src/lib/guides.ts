/**
 * 플래그십 가이드 매니페스트 (SSOT)
 *
 * ▷ 각 가이드는 src/app/guides/<slug>/page.tsx 독립 정적 라우트입니다.
 *   posts/*.md(블로그)도 public/data/pick-info.json(크롤링)도 거치지 않습니다.
 * ▷ /guides 허브(목록)와 sitemap이 이 배열 하나를 공유합니다(중복 정의 방지).
 *
 * ⚠️ 새 가이드 추가 시 — 수동 동기화 필수:
 *    ① src/app/guides/<slug>/page.tsx 신설
 *    ② 아래 GUIDES 배열에 한 줄 추가 (slug 는 폴더명과 동일하게)
 */

export interface Guide {
  slug: string;        // 폴더명 = URL 경로 (/guides/<slug>/)
  title: string;       // 허브 카드 제목
  description: string; // 허브 카드 설명
  category: string;    // 생애주기·상황 분류
  emoji: string;       // 카드 아이콘
  image?: string;      // 카드 썸네일(해당 가이드 자체 이미지). 없으면 생략
}

export const GUIDES: Guide[] = [
  {
    slug: "parenting-family-benefits",
    title: "0세~초등 입학 전, 육아·가족 지원금 한눈에 (2026)",
    description:
      "아동수당·부모급여·보육료·양육수당·유아학비를 나이 × 돌봄 형태로 정리한 에버그린 가이드.",
    category: "임신·출산·육아",
    emoji: "👶",
    image: "/images/og/parenting-family-benefits.png",
  },
  {
    slug: "parenting-family-finance",
    title: "출산 가구 주택 대출 — 신생아 특례 디딤돌·버팀목 한눈에 (2026)",
    description:
      "2년 내 출산이면 시중금리 절반대로 집 구입(디딤돌)·전세(버팀목). 소득·순자산·한도·금리·특례기간을 한 표로 비교한 에버그린 가이드.",
    category: "임신·출산·육아",
    emoji: "🏦",
    image: "/images/og/parenting-family-finance.png",
  },
  {
    slug: "daycare-admission",
    title: "어린이집·유치원 신청 — 유보통합포털 입소대기·입학 (2027학년도)",
    description:
      "어린이집은 점수제·연중 대기, 유치원은 11월 추첨. 통합된 유보통합포털 한 곳에서 입소대기·입학을 어떻게 신청하는지 한 표로 정리한 가이드.",
    category: "임신·출산·육아",
    emoji: "🧸",
    image: "/images/og/daycare-admission.png",
  },
  {
    slug: "parenting-family-savings",
    title: "아이 이름의 돈 — 자녀 적금·청약·보험 3축 가이드 (2026)",
    description:
      "모으기(적금·증여 비과세 10년 2천만원), 앞당기기(청약 만 14세부터 5년 인정), 지키기(보장형 보험). 자녀 미래자금을 세 갈래로 설계한 에버그린 가이드.",
    category: "임신·출산·육아",
    emoji: "🌱",
    image: "/images/og/parenting-family-savings.png",
  },
];
