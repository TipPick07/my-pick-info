/**
 * 토픽 허브 매니페스트 (SSOT) — 2026-08-06 신설
 *
 * ▷ 목적: 실측 검색 키워드 자체를 URL(/topics/<slug>/)로 만들어,
 *   흩어져 있던 같은 주제의 글·가이드·계산기를 한 페이지로 묶는다.
 * ▷ 선정 기준(WRITING-GUIDE §1-8 실측 대장):
 *   ① 헤드 키워드가 실측으로 살아 있고 ② 묶을 콘텐츠가 3개 이상인 주제만 만든다.
 *   목록만 있는 얇은 페이지를 늘리면 오히려 역효과이므로, intro 는 반드시 직접 쓴다.
 *
 * ⚠️ 슬러그·글 슬러그를 바꿀 때 이 파일도 함께 고칠 것(빌드 시 존재 검증함).
 */

export interface Topic {
  slug: string;        // URL (/topics/<slug>/)
  keyword: string;     // 실측 검색 키워드 — 제목 앞부분에 그대로 쓴다
  title: string;       // 페이지 H1
  description: string; // meta description
  intro: string;       // 페이지 도입 — 목록만 있는 페이지가 되지 않도록 직접 작성
  posts: string[];     // src/content/posts/<slug>.md
  guides?: string[];   // src/app/guides/<slug>/
  tools?: { slug: string; label: string }[]; // src/app/tools/<slug>/ + 버튼에 띄울 이름
}

export const TOPICS: Topic[] = [
  {
    slug: "youth-asset",
    keyword: "청년 자산형성",
    title: "청년 자산형성 — 적금·통장 어느 것부터 채우나",
    description:
      "청년미래적금·청년내일저축계좌·청약통장·절세계좌를 만기 수령액으로 비교한 글을 모았습니다. 소득 조건이 겹치는 구간과 갈아타기 규정까지.",
    intro:
      "청년 대상 목돈 상품은 이름이 비슷한데 조건이 전혀 다릅니다. 정부가 얹어 주는 매칭이 있는 것(청년내일저축계좌), 우대금리로 굴리는 것(청년미래적금·청년도약계좌), 세금을 깎아 주는 것(청약통장·절세계좌)이 섞여 있어서 순서를 잘못 잡으면 한 해를 통째로 손해 봅니다. 아래 글들은 모두 만기 수령액을 직접 계산해 비교한 것입니다.",
    posts: ["2026-05-29-youth-savings-mirae-vs-doyak-guide", "2026-07-20-youth-tomorrow-savings-account-guide", "2026-06-28-housing-subscription-account", "2026-06-25-isa-irp-pension-savings-comparison"],
    guides: ["youth-support-guide"],
    tools: [{ slug: "youth-savings-account", label: "청년내일저축계좌 계산기" }],
  },
  {
    slug: "transit-fare",
    keyword: "기후동행카드",
    title: "기후동행카드·K-패스 — 교통비 어느 쪽이 싼가",
    description:
      "기후동행카드 정기권과 K-패스 환급을 월 탑승 횟수로 비교했습니다. 손익분기 40회·50회 기준과 거주지별 조합까지.",
    intro:
      "교통비 지원은 '정액 무제한'과 '쓴 만큼 환급' 두 갈래입니다. 어느 쪽이 유리한지는 오직 한 달에 몇 번 타느냐로 갈리는데, 그 분기점이 40회와 50회 사이에 있습니다. 아래 글들은 지하철 1,550원 기준으로 횟수별 실부담을 직접 계산한 것입니다.",
    posts: ["2026-04-07-climatecompanioncard", "2026-05-08-k-pass-transit-daytrip-guide", "2026-07-12-k-pass-benefit-guide"],
    tools: [{ slug: "k-pass-refund", label: "K-패스 환급 계산기" }],
  },
  {
    slug: "energy-bill",
    keyword: "에너지바우처",
    title: "에너지바우처·전기요금 — 냉난방비 줄이는 제도",
    description:
      "에너지바우처, 전기요금 복지할인, 에너지캐시백, 무더위쉼터까지. 중복해서 받을 수 있는 조합과 실제 차감액을 계산했습니다.",
    intro:
      "전기요금을 낮추는 제도는 세 종류가 따로 굴러갑니다. 요금에서 미리 빼 주는 것(복지할인), 바우처로 차감하는 것(에너지바우처), 아낀 만큼 돌려주는 것(에너지캐시백)입니다. 서로 배타적이지 않아서 같이 신청할 수 있는데, 신청 창구가 달라 하나만 하고 끝내는 경우가 많습니다.",
    posts: ["2026-05-29-energy-voucher-cooling-support", "2026-07-08-electricity-welfare-discount", "2026-07-08-energy-cashback-guide", "2026-06-01-summer-family-benefit-roadmap", "2026-05-19-heat-shelter-guide"],
    tools: [{ slug: "electricity-bill", label: "전기요금 계산기" }],
  },
  {
    slug: "basic-livelihood",
    keyword: "기초생활수급자",
    title: "기초생활수급자 — 생계·주거·의료급여 기준",
    description:
      "생계급여·주거급여·의료급여의 소득인정액 기준과 급여별 지급액을 계산했습니다. 긴급복지지원과 문화누리카드까지 이어지는 동선도.",
    intro:
      "기초생활보장은 하나의 제도가 아니라 급여별로 문턱이 다릅니다. 같은 소득인정액이라도 생계급여는 중위 32%, 주거급여는 48%가 기준선이라 생계급여에서 떨어져도 주거급여는 되는 구간이 있습니다. 아래 글들은 그 경계선을 소득인정액 계산으로 하나씩 짚은 것입니다.",
    posts: ["2026-08-18-lifelong-education-voucher", "2026-08-13-food-voucher-2026", "2026-07-04-livelihood-benefit-guide", "2026-07-04-housing-benefit-guide", "2026-06-28-emergency-welfare-support", "2026-05-31-medical-health-insurance-support", "2026-05-17-culture-voucher-nuri-card-guide", "2026-05-13-seoul-ansimsodeuk-guide"],
    tools: [{ slug: "median-income", label: "기준 중위소득 계산기" }],
  },
  {
    slug: "youth-housing",
    keyword: "청년월세 지원",
    title: "청년월세 지원·행복주택 — 주거비 낮추는 순서",
    description:
      "청년월세 지원 월 20만 원, 주거안정 월세대출, 행복주택·청년전세임대를 자격과 실부담으로 비교했습니다.",
    intro:
      "청년 주거 지원은 '현금을 주는 것', '싸게 빌려주는 것', '집을 배정하는 것' 세 갈래입니다. 셋은 자격 기준이 다르고 동시에 쓸 수 있는 조합도 정해져 있어서, 지원금부터 알아보다 정작 문턱이 낮은 대출을 놓치는 일이 잦습니다.",
    posts: ["2026-04-30-youth-rent-support", "2026-05-18-youth-housing-support-guide", "2026-04-10-monthly-rent-guarantee", "2026-06-26-jeonse-wolse-buy-comparison"],
    tools: [{ slug: "rent-conversion", label: "전월세 전환 계산기" }],
  },
  {
    slug: "mortgage-limit",
    keyword: "디딤돌대출",
    title: "디딤돌대출·주택담보대출 — 한도와 금리 정하는 기준",
    description:
      "디딤돌·보금자리론과 시중 주담대를 3억·30년 시나리오로 비교하고, LTV·DTI·DSR과 스트레스 DSR이 한도를 어떻게 깎는지 계산했습니다.",
    intro:
      "집을 살 때 실제로 빌릴 수 있는 금액은 집값(LTV)·소득(DTI)·전체 빚(DSR) 셋 중 가장 낮은 값으로 정해집니다. 여기에 스트레스 금리가 얹히면 같은 소득이라도 한도가 또 줄어듭니다. 아래 글들은 그 계산을 연소득 5,000만 원 기준으로 끝까지 풀어 본 것입니다.",
    posts: ["2026-07-05-policy-mortgage-loan", "2026-07-05-ltv-dti-dsr-guide", "2026-06-28-stress-dsr-loan-limit-2026", "2026-06-28-fixed-vs-variable-mortgage-rate", "2026-06-30-mortgage-refinance-switch"],
    guides: ["first-home-purchase"],
    tools: [{ slug: "loan", label: "대출 이자 계산기" }],
  },
  {
    slug: "national-pension",
    keyword: "국민연금",
    title: "국민연금 — 더 받는 법과 청구 시효",
    description:
      "추납·연기연금·임의가입으로 수령액을 늘리는 법, 반환일시금·유족급여의 청구 시효, 보험료 지원까지 정리했습니다.",
    intro:
      "국민연금은 '얼마나 오래 넣었나'로 거의 다 결정되기 때문에, 비어 있는 기간을 메우는 방법(추납·임의가입)과 받는 시점을 늦추는 방법(연기연금)이 수령액을 크게 바꿉니다. 반대로 청구하지 않으면 시효로 사라지는 급여도 있습니다.",
    posts: ["2026-07-21-national-pension-boost-strategies", "2026-08-06-unclaimed-national-pension", "2026-06-28-basic-pension-guide", "2026-04-22-low-income-local-pension-guide"],
    guides: ["national-pension-survivor-benefits", "three-pillar-pension"],
  },
  {
    slug: "retirement-pension",
    keyword: "퇴직연금",
    title: "퇴직연금 — DB·DC·IRP와 미납 대응",
    description:
      "디폴트옵션 등급별 수익률, 일시금과 연금의 세금 차이, 회사가 부담금을 밀렸을 때 붙는 지연이자까지 계산했습니다.",
    intro:
      "퇴직연금은 회사가 책임지는 구간(DB)과 내가 운용하는 구간(DC·IRP)이 나뉘고, 받는 방법에 따라 세금이 달라집니다. 여기에 회사가 부담금을 제때 넣지 않으면 연 10~20%의 지연이자가 붙는데, 이건 웬만한 운용수익률보다 높습니다.",
    posts: ["2026-07-23-retirement-pension-default-option", "2026-07-30-retirement-pension-unpaid-contribution", "2026-06-29-retirement-pay-lump-vs-pension"],
    guides: ["retirement-pension", "retirement-pension-arrears"],
    tools: [{ slug: "retirement-pay", label: "퇴직금 계산기" }],
  },
  {
    slug: "health-insurance",
    keyword: "건강보험료",
    title: "건강보험료 — 지역가입자 산정과 줄이는 법",
    description:
      "지역가입자 소득 7.19%·재산 점수제 구조, 피부양자 자격 요건, 퇴직 후 임의계속가입까지 정리했습니다.",
    intro:
      "건강보험료가 갑자기 뛰는 순간은 대부분 하나입니다 — 직장가입자에서 지역가입자로 넘어갈 때. 이때 소득뿐 아니라 재산에도 보험료가 붙기 때문에 소득이 없어도 고지서가 나옵니다. 임의계속가입과 피부양자 등재가 이 구간을 막아 주는 두 장치입니다.",
    posts: ["2026-07-13-regional-health-insurance-premium", "2026-07-13-health-insurance-dependent", "2026-05-08-retirement-health-insurance-benefits-guide", "2026-05-09-retirement-welfare-guide"],
    guides: ["health-insurance-saving"],
    tools: [{ slug: "insurance", label: "4대보험 계산기" }],
  },
  {
    slug: "work-child-tax-credit",
    keyword: "근로장려금",
    title: "근로장려금·자녀장려금 — 자격과 지급일",
    description:
      "근로장려금 최대 330만 원, 자녀장려금 1명당 100만 원. 가구 유형별 산식과 기한 후 신청 감액까지 계산했습니다.",
    intro:
      "두 장려금은 같은 날 같은 창구에서 신청하지만 자격이 따로 판정됩니다. 그래서 하나만 받는 경우가 흔하고, 기한을 넘겨 신청하면 5%가 깎입니다. 아래 글들은 단독·홑벌이·맞벌이 가구별로 산식을 그대로 대입해 본 것입니다.",
    posts: ["2026-05-07-national-earned-income-tax-credit-application", "2026-05-05-national-child-benefit-application", "2026-05-10-earned-income-child-tax-credit-guide", "2026-05-09-may-deadline-benefits-guide"],
  },
  {
    slug: "childcare",
    keyword: "아이돌봄",
    title: "아이돌봄·육아 지원 — 돌봄 공백 메우는 제도",
    description:
      "아이돌봄서비스 시간당 부담, 육아기 근로시간 단축 급여, 부모급여·유아학비까지 유형별로 계산했습니다.",
    intro:
      "맞벌이 가구의 돌봄 공백은 한 제도로 메워지지 않습니다. 시간을 사는 것(아이돌봄서비스), 일하는 시간을 줄이는 것(육아기 단축), 현금을 받는 것(부모급여)을 겹쳐 써야 하는데 소득 유형 판정이 제도마다 다릅니다.",
    posts: ["2026-08-10-short-term-parental-leave", "2026-07-22-childcare-service-support", "2026-04-28-seoul-childcare-support", "2026-07-24-reduced-work-hours-childcare-pay", "2026-07-06-parental-allowance-guide", "2026-04-08-childcare-tuition-support"],
    guides: ["parenting-family-benefits"],
    tools: [{ slug: "childcare-service", label: "아이돌봄서비스 계산기" }, { slug: "parental-leave-pay", label: "육아휴직급여 계산기" }],
  },
  {
    slug: "birth-support",
    keyword: "출산지원금",
    title: "출산지원금 — 첫만남이용권부터 지역 지원까지",
    description:
      "첫만남이용권 첫째 200만·둘째 300만 원, 지역별 3층 구조, 자영업자 배우자 출산급여까지 총액을 계산했습니다.",
    intro:
      "출산 지원은 국가가 전국 공통으로 주는 1층 위에 광역시도(2층)와 시군구(3층)가 얹히는 구조입니다. 1층만 챙기고 3층을 모르는 경우가 많은데, 차이가 가장 큰 곳이 바로 3층입니다.",
    posts: ["2026-07-06-birth-support-benefits", "2026-06-01-parenting-benefit-region-compare", "2026-04-29-seoul-selfemployed-paternity-leave-support", "2026-06-01-yongsan-disabled-family-birth-support"],
    guides: ["parenting-family-finance"],
  },
  {
    slug: "employment-support",
    keyword: "국민취업지원제도",
    title: "국민취업지원제도·실업급여 — 구직 기간 지원",
    description:
      "국민취업지원제도 월 60만 원, 조기재취업수당, 국민내일배움카드까지 요건과 금액을 정리했습니다.",
    intro:
      "일을 쉬는 동안 받을 수 있는 돈은 고용보험 가입 이력이 있느냐로 먼저 갈립니다. 있으면 실업급여, 없으면 국민취업지원제도입니다. 그리고 빨리 재취업하면 남은 급여의 절반을 주는 장치(조기재취업수당)가 따로 있습니다.",
    posts: ["2026-07-10-national-employment-support-program", "2026-07-10-early-reemployment-allowance", "2026-07-01-national-tomorrow-learning-card", "2026-05-08-metropolitan-4060-welfare-comparison"],
    guides: ["unemployment-benefit-guide"],
    tools: [{ slug: "unemployment-benefit", label: "실업급여 계산기" }],
  },
  {
    slug: "year-end-tax",
    keyword: "연말정산",
    title: "연말정산·소득공제 — 환급 늘리는 순서",
    description:
      "총급여 4,800만 원 기준 전략 전후 세액 비교, 신용·체크카드 황금비율, 종합소득세 신고까지 계산했습니다.",
    intro:
      "연말정산 환급은 1월에 서류를 잘 내서 늘어나는 게 아니라, 1년 동안 어디에 어떻게 썼는지로 이미 정해집니다. 특히 카드 사용액은 총급여 25%를 넘긴 뒤부터만 공제되기 때문에 결제수단 비율이 환급을 가릅니다.",
    posts: ["2026-06-27-year-end-tax-settlement-guide", "2026-07-01-card-tax-deduction-strategy", "2026-06-27-net-salary-2026-guide", "2026-05-21-jongso-tax-filing-guide"],
    guides: ["comprehensive-income-tax-filing"],
    tools: [{ slug: "income-tax", label: "종합소득세 계산기" }, { slug: "salary", label: "연봉 실수령액 계산기" }],
  },
  {
    slug: "property-tax",
    keyword: "재산세",
    title: "재산세·종합부동산세 — 7월·9월 보유세",
    description:
      "재산세 7월·9월 절반씩, 종부세 9억·1주택 12억 기준. 6월 1일 소유자 기준과 공동명의 선택까지 정리했습니다.",
    intro:
      "보유세는 6월 1일 하루의 소유자가 1년 치를 냅니다. 잔금일을 하루 앞뒤로 옮기는 것만으로 부담자가 바뀌는 구조라, 매매 시기를 잡을 때 가장 먼저 확인해야 하는 날짜입니다.",
    posts: ["2026-07-09-property-tax-payment-guide", "2026-07-09-comprehensive-real-estate-tax"],
    guides: ["property-holding-tax", "house-capital-gains-tax"],
  },
  {
    slug: "hidden-money",
    keyword: "미환급금",
    title: "미환급금·숨은 돈 — 시효 지나기 전 조회",
    description:
      "휴면예금 5년·보험금 3년·경정청구 5년. 창구 여섯 곳을 도는 순서와 5년 소급 환급액을 계산했습니다.",
    intro:
      "찾아가지 않은 내 돈은 한 곳에 모여 있지 않습니다. 은행·보험·카드·세금이 각각 다른 창구에 흩어져 있고 시효도 3년에서 10년까지 제각각이라, 짧은 것부터 도는 순서가 중요합니다.",
    posts: ["2026-08-03-hidden-money-refund-deadline", "2026-08-05-dormant-deposit-hidden-insurance"],
    guides: ["hidden-money-checkup"],
    tools: [{ slug: "tax-refund-claim", label: "경정청구 환급액 계산기" }],
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}
