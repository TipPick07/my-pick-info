import fs from 'fs';
import path from 'path';
import { getSortedPostsData, PostData } from './posts';

export interface SituationBenefit {
  id: string;
  region: string;
  title: string;
  target: string;
  deadline: string;
  image?: string;
  details?: string;
  isEmergency?: boolean;
}

export interface Situation {
  key: string;
  emoji: string;
  label: string;      // 카드/제목용 짧은 이름
  tagline: string;    // 한 줄 후킹
  intro: string;      // 허브 상단 안내문
  metaTitle: string;
  metaDescription: string;
  /**
   * 지원금 매칭 — 다중소속(독립 판정). 소속은 '제목(주제)'에서 정한다.
   * belongs = titleStem.test(title) || compound.test(title+target+details)
   * · titleStem: bare stem은 '제목'에만(긴 설명/대상 boilerplate 오매칭 차단).
   * · compound : target/details까지 허용하는 '구체 복합어'(boilerplate·자격나열에 안 걸리는 것만).
   */
  titleStem: RegExp;
  compound: RegExp;
  /** 블로그 매칭 (title + tags + category 대상) */
  postMatch: RegExp;
}

/** 지원금 → situation 소속 판정 (다중소속·우선순위 없음). title 기준 + 복합어는 본문까지. */
export function benefitBelongsTo(
  b: { title: string; target?: string; details?: string },
  sit: Situation,
): boolean {
  const all = `${b.title || ''} ${b.target || ''} ${b.details || ''}`;
  return sit.titleStem.test(b.title || '') || sit.compound.test(all);
}

export const SITUATIONS: Situation[] = [
  {
    key: 'parenting',
    emoji: '👶',
    label: '임신·출산·육아',
    tagline: '임산부부터 7세 아이까지, 놓치기 쉬운 양육 지원금을 한곳에',
    intro: '임신·출산·육아 가정이 받을 수 있는 수도권 지원금과 실전 가이드를 팁픽이 모았습니다. 부모급여·아이돌봄·양육수당부터 지역별 출산장려금까지 한 번에 확인하세요.',
    metaTitle: '임신·출산·육아 지원금 총정리 | 수도권 양육 혜택 한곳에 - 팁픽(Tip-Pick)',
    metaDescription: '임산부·영유아·자녀 양육 가정을 위한 수도권 지원금과 가이드를 한곳에. 부모급여·아이돌봄·출산장려금·양육수당까지 팁픽이 큐레이션했습니다.',
    titleStem: /육아|출산|영유아|아동|부모급여|자녀|어린이|임산부|양육|유아|보육|누리|한부모/,
    compound: /가족돌봄|아이돌봄|돌봄수당|돌봄비|아동수당|양육수당|출산축하금|출산장려금|육아휴직|보육료|유아학비/,
    postMatch: /육아|출산|영유아|아동|돌봄|부모급여|자녀|어린이|임산부|양육|유아|보육|누리/,
  },
  {
    key: 'youth',
    emoji: '🧑‍🎓',
    label: '청년',
    tagline: '취업·주거·자산형성까지, 청년이 챙길 혜택을 빠짐없이',
    intro: '만 19~39세 청년이 받을 수 있는 수도권 지원금과 가이드를 모았습니다. 청년월세·청년기본소득·자산형성(미래·도약계좌)·취업지원까지 한 번에 비교하세요.',
    metaTitle: '청년 지원금 총정리 | 월세·기본소득·자산형성 수도권 혜택 - 팁픽(Tip-Pick)',
    metaDescription: '수도권 청년을 위한 월세·기본소득·자산형성·취업 지원금과 가이드를 한곳에. 서울·경기·인천 청년 혜택을 팁픽이 큐레이션했습니다.',
    titleStem: /청년|대학생|취준|사회초년생|기본소득|미래.?저축|도약계좌|학자금/,
    compound: /청년월세|청년수당|청년내일채움|청년도약/,
    postMatch: /청년|대학생|취준|사회초년생|기본소득|미래.?저축|도약계좌|학자금/,
  },
  {
    key: 'senior',
    emoji: '🧓',
    label: '중장년·은퇴 준비',
    tagline: '제2의 인생, 재취업과 노후 안정 혜택을 미리 챙기세요',
    intro: '40~60대 중장년과 은퇴 준비 세대를 위한 수도권 지원금과 가이드입니다. 재취업·직무교육·국민연금·건강보험·노후 준비 혜택을 한곳에서 확인하세요.',
    metaTitle: '중장년·은퇴 지원금 총정리 | 재취업·노후 준비 수도권 혜택 - 팁픽(Tip-Pick)',
    metaDescription: '40~60대 중장년·은퇴 세대를 위한 재취업·직무교육·연금·건강보험 지원금과 가이드를 한곳에. 팁픽이 큐레이션했습니다.',
    titleStem: /중장년|신중년|어르신|노인|은퇴|퇴직|고령|4060|국민연금|노후|중년/,
    compound: /기초연금|노인일자리/,
    postMatch: /중장년|신중년|어르신|노인|은퇴|퇴직|고령|4060|국민연금|노후|중년/,
  },
  {
    key: 'housing',
    emoji: '🏠',
    label: '주거·전월세',
    tagline: '보증금·월세 부담을 덜어주는 주거 지원을 한눈에',
    intro: '전월세·보증금·이사 비용 부담을 덜어주는 수도권 주거 지원금과 가이드를 모았습니다. 청년월세·전세보증·임대·이사비 지원까지 한 번에 비교하세요.',
    metaTitle: '주거·전월세 지원금 총정리 | 보증금·월세·이사비 수도권 혜택 - 팁픽(Tip-Pick)',
    metaDescription: '수도권 전월세·보증금·이사비 부담을 줄여주는 주거 지원금과 가이드를 한곳에. 청년월세·전세보증·임대 혜택을 팁픽이 큐레이션했습니다.',
    titleStem: /주거|월세|전세|임대|보증금|이사|전월세|주택|LH|SH/,
    compound: /전세자금|전세대출|월세대출|월세지원|임대주택|공공임대|국민임대|영구임대|행복주택|매입임대|전세임대|보증금지원/,
    postMatch: /주거|월세|전세|임대|보증금|이사|전월세|주택|주거안정/,
  },
  {
    key: 'disability',
    emoji: '♿',
    label: '장애인·돌봄 가정',
    tagline: '장애인 당사자와 돌봄 가정을 위한 현금·서비스 지원',
    intro: '장애인 당사자와 돌봄 가정이 받을 수 있는 수도권 지원금과 가이드입니다. 장애인연금·활동지원·출산지원·돌봄 서비스 혜택을 한곳에서 확인하세요.',
    metaTitle: '장애인·돌봄 지원금 총정리 | 연금·활동지원 수도권 혜택 - 팁픽(Tip-Pick)',
    metaDescription: '장애인 당사자와 돌봄 가정을 위한 연금·활동지원·출산지원·돌봄 서비스 지원금과 가이드를 한곳에. 팁픽이 큐레이션했습니다.',
    titleStem: /장애/,
    compound: /장애인연금|활동지원/,
    postMatch: /장애/,
  },
];

export function getSituation(key: string): Situation | undefined {
  return SITUATIONS.find((s) => s.key === key);
}

function loadBenefits(): SituationBenefit[] {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return (data.benefits || []) as SituationBenefit[];
}

export function getBenefitsForSituation(sit: Situation): SituationBenefit[] {
  // 각 situation 독립 판정 → 한 지원금이 여러 situation에 동시 소속(다중소속).
  return loadBenefits().filter((b) => benefitBelongsTo(b, sit));
}

export function getPostsForSituation(sit: Situation): PostData[] {
  return getSortedPostsData().filter((p) =>
    sit.postMatch.test(`${p.title} ${(p.tags || []).join(' ')} ${p.category}`)
  );
}

/** 인덱스/카드용 요약 카운트 */
export function getSituationCounts(sit: Situation): { benefits: number; posts: number } {
  return {
    benefits: getBenefitsForSituation(sit).length,
    posts: getPostsForSituation(sit).length,
  };
}

/** 인덱스 카드용 대표 지원금 미리보기 (상위 N개 제목) */
export function getSituationPreview(sit: Situation, limit = 3): string[] {
  return getBenefitsForSituation(sit).slice(0, limit).map((b) => b.title.replace(/^\[[^\]]+\]\s*/, '').trim());
}

/** 지원금 → 소속 상황 역방향 조회 (상세페이지 관련 지원금/허브 링크용) */
export function getSituationForBenefit(b: { title: string; target?: string; details?: string }): Situation | undefined {
  // 상세페이지 '관련 지원금/허브 링크'용 대표 situation 1개(다중소속 중 배열 순서 첫째).
  return SITUATIONS.find((s) => benefitBelongsTo(b, s));
}

/** 같은 상황의 형제 지원금 (자기 자신 제외) + 소속 상황 */
export function getRelatedBenefits(
  b: { id: string; title: string; target?: string; details?: string },
  limit = 4,
): { sit: Situation; items: SituationBenefit[] } | null {
  const sit = getSituationForBenefit(b);
  if (!sit) return null;
  const items = getBenefitsForSituation(sit).filter((x) => x.id !== b.id).slice(0, limit);
  if (items.length === 0) return null;
  return { sit, items };
}
