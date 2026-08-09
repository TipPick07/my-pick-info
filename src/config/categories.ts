/**
 * 카테고리 SSOT (단일 진실 공급원)
 * ───────────────────────────────────────────────────────────────────────────
 * 잡블로그 개편의 정보구조(IA). 헤더·푸터·홈·사이트맵이 이 파일 하나만 참조한다.
 * (프로젝트 유지보수 원칙 §SSOT: 같은 규칙은 한 곳에서만 정의)
 *
 * ▷ APPROVAL_MODE = 애드센스 '승인 모드' 스위치.
 *   true  → 핫이슈·전국 나들이·꿀팁을 메뉴/홈/사이트맵에서 숨김(트로이목마 전략).
 *           경제·지원금·계산기 같은 '무거운 정보 카테고리'만 노출해 심사 통과를 노린다.
 *   false → 전 카테고리 공개(승인 메일 받은 날 이 한 줄만 false로).
 */
export const APPROVAL_MODE = true;

export interface Category {
  key: string;              // 내부 식별자
  label: string;            // 메뉴에 보이는 한글명
  href: string;             // URL (trailingSlash: true 규칙에 맞춰 끝에 / 포함)
  emoji: string;
  accent: string;           // 카드 액센트 색(HEX)
  short: string;            // 한 줄 설명(카드 부제)
  liveInApproval: boolean;  // 승인 모드에서도 공개할지
  postCategories: string[]; // 이 카테고리로 묶이는 글 frontmatter의 category 값들
}

export const CATEGORIES: Category[] = [
  {
    key: 'money',
    label: '돈이 되는 경제',
    href: '/money/',
    emoji: '💰',
    accent: '#059669',
    short: '부동산·세금·재테크 흐름',
    liveInApproval: true,
    postCategories: ['경제', 'money', 'economy'],
  },
  {
    key: 'benefits',
    label: '정부 지원금',
    href: '/benefits/',
    emoji: '🏛️',
    accent: '#007AA3',
    short: '지원금·복지 혜택',
    liveInApproval: true,
    postCategories: ['benefit', 'benefits', '정보'],
  },
  {
    key: 'tools',
    label: '실생활 계산기',
    href: '/tools/',
    emoji: '🧮',
    accent: '#00AADE',
    short: '연봉·대출·세금 계산',
    liveInApproval: true,
    postCategories: [],
  },
  {
    key: 'hot',
    label: '오늘의 핫이슈',
    href: '/hot/',
    emoji: '🔥',
    accent: '#EF4444',
    short: '스포츠·경제·이슈 가이드',
    liveInApproval: false,
    postCategories: ['핫이슈', 'hot', 'issue'],
  },
  {
    // ⚠️ 2026-08-09: /festivals/ 목록과 축제 상세 라우트를 삭제했다(빈 목록·껍데기 정리).
    //    이 항목은 **festival 카테고리 글을 계속 숨기기 위해서만** 남아 있다
    //    (지우면 isPostCategoryLive가 '주인 없는 카테고리 = 노출 허용'으로 뒤집힌다).
    //    🔴 liveInApproval을 true로 바꾸기 전에 반드시 src/app/festivals/page.tsx를 먼저 복구할 것.
    //       지금 그냥 켜면 메뉴·사이트맵이 존재하지 않는 경로를 가리킨다.
    key: 'festivals',
    label: '나들이·핫플',
    href: '/festivals/',
    emoji: '🎪',
    accent: '#10B981',
    short: '축제·핫플·나들이',
    liveInApproval: false,
    postCategories: ['festival', 'festivals'],
  },
  {
    key: 'tips',
    label: '알쓸 꿀팁',
    href: '/tips/',
    emoji: '💡',
    accent: '#F59E0B',
    short: '건강·생활·IT 꿀팁',
    liveInApproval: false,
    postCategories: ['꿀팁', 'tips'],
  },
];

/** 현재 노출 대상 카테고리(승인 모드면 liveInApproval=true만). 메뉴·홈·사이트맵 공용. */
export function visibleCategories(): Category[] {
  return CATEGORIES.filter((c) => !APPROVAL_MODE || c.liveInApproval);
}

/** 특정 카테고리가 지금 공개 상태인지. */
export function isCategoryLive(key: string): boolean {
  const c = CATEGORIES.find((x) => x.key === key);
  return !!c && (!APPROVAL_MODE || c.liveInApproval);
}

/** key로 카테고리 조회. */
export function getCategory(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

/**
 * 글(post)의 category 값이 지금 공개 상태인지.
 * 숨김 카테고리(승인 모드의 festivals/hot/tips)에 속한 글이면 false.
 * 어느 카테고리에도 안 묶이는 값(정보·가이드 등)은 노출 허용(true).
 */
export function isPostCategoryLive(postCategory: string): boolean {
  const owning = CATEGORIES.find((c) => c.postCategories.includes(postCategory));
  if (!owning) return true;
  return !APPROVAL_MODE || owning.liveInApproval;
}
