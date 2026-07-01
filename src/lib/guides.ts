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
    slug: "overseas-stock-capital-gains-tax",
    title: "해외주식 양도소득세 — 250만 공제·22%·5월 신고 (2026)",
    description:
      "미국·중국 등 해외주식은 소액이라도 이익 250만원 넘으면 다음 해 5월 직접 신고. 22% 세율·손익통산 절세·계산기까지 묶은 에버그린 가이드.",
    category: "투자·세금",
    emoji: "📈",
  },
  {
    slug: "unemployment-benefit-guide",
    title: "실업급여·고용보험 완전정복 — 수급조건·금액·일수 (2026)",
    description:
      "고용보험 180일·비자발 이직이면 평균임금 60%(1일 상한 68,100·하한 66,048원)를 120~270일 받는 실업급여. 국민취업지원제도·내일배움카드까지 한 표로 묶은 가이드.",
    category: "고용·취업",
    emoji: "💼",
  },
  {
    slug: "three-pillar-pension",
    title: "노후 3층 연금 — 국민·퇴직·개인연금 한눈에 (2026)",
    description:
      "국민연금(1층)·퇴직연금(2층)·개인연금(3층)을 한 표로. 국민연금 수급연령·더 받는 법, 퇴직연금 연금수령 세금 감면, 연금저축·IRP 세액공제 900만원까지 정리한 에버그린 가이드.",
    category: "노후·연금",
    emoji: "🌳",
  },
  {
    slug: "comprehensive-income-tax-filing",
    title: "프리랜서·N잡러 종합소득세 신고 — 5월 신고·환급 한눈에 (2026)",
    description:
      "3.3% 떼인 프리랜서·부수입 직장인은 5월 종합소득세 대상. 신고 대상·경비(단순/기준경비율)·세율·환급·가산세를 한 표로 정리한 에버그린 가이드.",
    category: "세금·절세",
    emoji: "🧾",
  },
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
  {
    slug: "house-capital-gains-tax",
    title: "집 팔 때 양도소득세 — 1주택 비과세·세율 한눈에 (2026)",
    description:
      "1세대 1주택은 2년 보유(조정지역 취득은 2년 거주)·양도가액 12억까지 비과세. 장기보유특별공제 최대 80%, 다주택 중과 부활(2026.5)까지 한 표로 정리한 가이드.",
    category: "부동산·세금",
    emoji: "🏠",
  },
  {
    slug: "youth-support-guide",
    title: "청년 지원 총정리 — 자산·주거·취업 한눈에 (2026)",
    description:
      "청년미래적금·청년 월세 지원·국민취업지원까지, 흩어진 청년 정책을 목돈·주거·취업 세 갈래로 묶은 에버그린 가이드.",
    category: "청년",
    emoji: "🧑‍🎓",
  },
];
