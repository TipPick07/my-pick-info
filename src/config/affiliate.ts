/**
 * 제휴 링크 SSOT — 쿠팡 파트너스
 * ───────────────────────────────────────────────────────────────────────────
 * 🔴 fail-closed: url이 빈 문자열이면 그 상품은 렌더되지 않고, 한 슬롯의 상품이
 *    전부 비어 있으면 슬롯 자체가 화면에 나오지 않는다.
 *    → 실제 파트너스 링크를 넣기 전까지 사이트에는 아무 변화가 없다.
 *
 * ▷ 넣는 법: 쿠팡 파트너스에서 만든 링크를 아래 url: "" 안에 붙여넣는다. 그게 전부다.
 *    배포하면 그 순간부터 노출된다. 되돌리려면 다시 "" 로 비우면 된다.
 *
 * ▷ 배치 원칙 (2026-09-01 네이버 실측 기준 — HANDOVER 2026-09-01 항목 참조)
 *   1. 육아 클러스터에만 붙인다. 최근 30일 노출 404로 최대 클러스터이고,
 *      2027학년도 입소 시즌이라 가을이 성수기다(전기요금 362는 8월 피크로 하락 구간).
 *   2. 🔴 의료비·요양 계산기에는 붙이지 않는다 — YMYL 신뢰 훼손.
 *      (longterm-care-copay · medical-cost-cap · insurance)
 *   3. 한 슬롯 최대 2개. 계산 결과 바로 위가 아니라 "다음 행동" 맥락에 놓는다.
 *   4. 상품은 그 페이지 독자가 실제로 사는 것만. 맥락이 안 맞으면 슬롯을 비워 둔다.
 *
 * ▷ 표기 의무: COUPANG_DISCLOSURE는 AffiliateBox가 항상 함께 렌더한다. 분리하지 말 것.
 */

/** 대가성 표기 — 쿠팡 파트너스 필수 문구. 링크와 같은 화면에 반드시 함께 노출한다. */
export const COUPANG_DISCLOSURE =
  "이 페이지는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

export interface AffiliateProduct {
  /** 버튼에 보이는 이름 */
  label: string;
  /** 쿠팡 파트너스 링크. 비어 있으면 렌더되지 않는다. */
  url: string;
  /** 왜 이 맥락에 놓였는지 한 줄 (선택) */
  note?: string;
}

export interface AffiliateSlot {
  heading: string;
  intro: string;
  products: AffiliateProduct[];
}

const SLOTS: Record<string, AffiliateSlot> = {
  // 가이드 /guides/daycare-admission/ — 네이버 노출 최대 클러스터(유보통합·유치원 404)
  "daycare-admission": {
    heading: "입소가 정해지면 준비할 것",
    intro:
      "어린이집 입소가 확정되면 원에서 준비물 목록을 받습니다. 원마다 다르니 목록을 먼저 확인한 뒤 필요한 것만 준비하세요.",
    products: [
      {
        label: "어린이집 낮잠이불 보러가기",
        url: "https://link.coupang.com/a/gGQz2gMrLw",
        note: "원마다 규격이 달라, 받은 목록을 보고 크기부터 맞추세요",
      },
      {
        label: "방수 네임스티커 보러가기",
        url: "https://link.coupang.com/a/gGQz2ju3Wu",
        note: "옷·물병에 붙이면 세탁을 자주 하게 되니 방수 여부를 봅니다",
      },
    ],
  },

  // 계산기 /tools/childcare-service/ — 아이돌봄서비스
  // ⚠️ 2026-09-01 판단: 링크를 넣지 않고 비워 둔다.
  //    아이돌봄은 "돌보미가 집으로 오는" 서비스라 독자가 그 시점에 사는 물건이 뚜렷하지 않다.
  //    규칙 4(맥락이 안 맞으면 슬롯을 비워 둔다)를 여기에 적용한 것이다.
  //    슬롯 자체는 심어 뒀으니, 맞는 상품이 생기면 url만 채우면 즉시 켜진다.
  "childcare-service": {
    heading: "돌봄과 함께 챙기면 좋은 것",
    intro:
      "돌봄 선생님과 함께 쓰는 물건은 이름 표시와 보관이 편한 쪽이 낫습니다.",
    products: [],
  },

  // 가이드 /guides/parenting-family-benefits/ — 육아 지원금 1편(허브)
  //   이 파일 472행에 운영자가 남긴 TODO(제휴) 자리를 이 슬롯으로 채운다.
  "parenting-family-benefits": {
    heading: "지원금과 별개로, 매달 나가는 것",
    intro:
      "지원금은 신청해서 받는 돈이고 아래는 매달 쓰는 소모품입니다. 지원금 계산과 함께 실제 지출도 같이 보시라고 놓았습니다.",
    products: [
      {
        label: "기저귀 보러가기",
        url: "https://link.coupang.com/a/gGQVV5PWLI",
        note: "월령이 바뀌면 사이즈도 바뀝니다 — 대량 구매 전 확인",
      },
      {
        label: "아기 물티슈 보러가기",
        url: "https://link.coupang.com/a/gGQVV8K0pp",
      },
    ],
  },

  // 계산기 /tools/parental-leave-pay/ — 육아휴직급여
  "parental-leave-pay": {
    heading: "휴직 기간에 매달 나가는 것",
    intro:
      "급여가 줄어드는 기간이라 고정 지출을 미리 가늠해 두면 좋습니다. 아래는 월령과 무관하게 계속 쓰는 품목입니다.",
    products: [
      {
        label: "기저귀 보러가기",
        url: "https://link.coupang.com/a/gGQVV5PWLI",
      },
      {
        label: "아기 물티슈 보러가기",
        url: "https://link.coupang.com/a/gGQVV8K0pp",
      },
    ],
  },
};

/**
 * 제휴 노출 스위치 — 🔴 광고 네트워크 스위치와 일부러 분리했다.
 *
 * NEXT_PUBLIC_ADS_ENABLED 를 같이 쓰면 안 되는 이유:
 *   그 플래그는 AdFit(카카오)도 켠다. AdFit은 Footer에 있어 전 페이지에 깔리는데,
 *   단위 코드가 아직 플레이스홀더이고 MONETIZATION-ROADMAP §4는
 *   "애드핏은 지금 당장 붙이지 않는다"로 결론이 나 있다.
 *   제휴를 켜자고 승인도 안 받은 광고 네트워크를 같이 켤 수는 없다.
 *
 * 기본값이 on 인 이유:
 *   배포 빌드는 GitHub Actions에서 돈다(.github/workflows/deploy.yml).
 *   거기엔 .env.local 이 없으므로, 기본값이 off 면 어떤 설정을 하지 않는 한
 *   프로덕션에서 영영 안 나온다. 쿠팡 파트너스 계정과 실제 링크가 이미 있으므로
 *   기본 on 으로 두고, 끌 때만 명시한다.
 *
 * 끄는 법: 환경변수 NEXT_PUBLIC_AFFILIATE_ENABLED=false (또는 이 줄을 false 로).
 */
export const AFFILIATE_ENABLED =
  process.env.NEXT_PUBLIC_AFFILIATE_ENABLED !== "false";

/**
 * 링크가 실제로 들어간 상품만 남긴다.
 * 하나도 없으면 null → AffiliateBox가 아무것도 그리지 않는다(fail-closed).
 * 제휴 스위치가 꺼져 있으면 링크가 있어도 null.
 */
export function getAffiliateSlot(key: string): AffiliateSlot | null {
  if (!AFFILIATE_ENABLED) return null;
  const slot = SLOTS[key];
  if (!slot) return null;
  const live = slot.products.filter((p) => p.url.trim().length > 0);
  return live.length > 0 ? { ...slot, products: live } : null;
}
