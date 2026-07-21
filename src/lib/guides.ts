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
    slug: "housing-pension",
    title: "주택연금 — 가입조건·월지급금·2026 개편 한눈에",
    description:
      "만 55세 이상·부부 합산 공시가격 12억 이하면 내 집에 살며 평생 월지급금 — 70세·3억 주택이면 월 92만 3천 원. 연령별 월지급금 표와 2026년 3월 개편(월지급금 +3.13%·초기보증료 1.0%)까지 정리한 가이드.",
    category: "노후·연금",
    emoji: "🏡",
  },
  {
    slug: "health-insurance-saving",
    title: "건강보험료 줄이는 법 — 직장·지역·피부양자 한눈에 (2026)",
    description:
      "같은 소득이라도 자격(직장·지역·피부양자)에 따라 0원~수십만 원. 지역 산정 구조(연금 50%·금융 1,000만·재산공제 1억)와 임의계속가입·조정신청까지, 건보료 절감 루트를 한 표로 정리한 가이드.",
    category: "보험",
    emoji: "🏥",
  },
  {
    slug: "insurance-checkup",
    title: "내 보험 점검 — 실손 세대·중복 정리·리모델링 한눈에 (2026)",
    description:
      "해지부터 하면 손해. 내보험찾아줌 조회 → 실손 1~5세대 확인 → 중복 정리 → 감액완납 등 대안 → 해지 순서로, 손해 없이 보험을 정리하는 에버그린 가이드.",
    category: "보험",
    emoji: "🛡️",
  },
  {
    slug: "property-holding-tax",
    title: "부동산 보유세 — 재산세·종부세 한눈에 (2026)",
    description:
      "집 가진 해마다 내는 세금 두 층 — 모두가 내는 재산세(7월·9월, 1주택 특례 43~45%)와 공시 9억(1주택 12억) 초과만 내는 종부세(12월). 계산 구조와 보유세 달력을 한 표로 정리한 가이드.",
    category: "부동산·세금",
    emoji: "🏛️",
  },
  {
    slug: "self-employed-freelancer-tax",
    title: "개인사업자·프리랜서 세금 — 부가세·종소세·3.3% 한눈에 (2026)",
    description:
      "사업자 세금은 달력이 반 — 1월·7월 부가세, 5월 종합소득세, 프리랜서 3.3% 환급까지. 일반·간이·프리랜서 유형별로 언제 무엇을 신고하는지 한 표로 정리한 가이드.",
    category: "사업자·세금",
    emoji: "🧾",
  },
  {
    slug: "first-home-purchase",
    title: "생애최초 주택구입 — 정책대출·취득세·청약 한눈에 (2026)",
    description:
      "처음 집 살 때 챙길 3대 혜택 — 디딤돌·보금자리론 정책대출, 생애최초 LTV 80%, 취득세 최대 200만원 감면과 청약 특별공급까지 순서대로 정리한 가이드.",
    category: "내집마련",
    emoji: "🔑",
  },
  {
    slug: "inheritance-gift-tax",
    title: "상속·증여세 — 10억 공제·10년 증여 플랜 한눈에 (2026)",
    description:
      "배우자·자녀가 있으면 10억까지 상속세 0원. 일괄공제 5억·배우자공제와 10년마다 리셋되는 증여공제(배우자 6억·자녀 5천만)로 미리 설계하는 절세 가이드.",
    category: "상속·증여",
    emoji: "🎁",
  },
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
