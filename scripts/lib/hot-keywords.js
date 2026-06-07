'use strict';
/**
 * 핫키워드 SSOT — §4-15 Phase 3a-2. 발행(generate-blog-post)·보고서(build-topic-report)가 공유.
 *
 * 기준값 = fetch-public-data.js(=옛 build-topic-report.js)의 SEASONAL_KEYWORDS 그대로(각 월 3개).
 *   generate-blog-post.js가 갖고 있던 추가 키워드(야외공연 등)는 채택하지 않는다(드리프트 해소).
 *
 * ⚠️ fetch-public-data.js는 이번 단계에서 미접촉이라 자체 복제본을 유지한다 — 그쪽을 고치면
 *    이 파일도 함께 동기화할 것(동기화 필수: scripts/fetch-public-data.js SEASONAL_KEYWORDS).
 *
 * 병합 산식: DataLab 살아있으면 [...new Set([DataLab TOP2, ...seasonal])], 아니면 seasonal.
 * 반환형 통일: { keywords: string[], source: 'datalab' | 'seasonal'(±진단접미사) }.
 * NAVER 키는 호출 스크립트가 dotenv로 채운 process.env에서 읽는다(이 lib은 dotenv 미로드).
 */

const SEASONAL_KEYWORDS = {
  1: { festival: ['설날행사', '겨울축제', '눈꽃축제'], benefit: ['난방비지원', '에너지바우처', '설맞이지원금'] },
  2: { festival: ['봄맞이축제', '매화축제', '실내전시'], benefit: ['청년취업지원', '복지급여', '근로장려금신청준비'] },
  3: { festival: ['벚꽃축제', '봄꽃축제', '봄나들이'], benefit: ['청년창업지원', '소상공인지원', '취업성공패키지'] },
  4: { festival: ['벚꽃축제', '튤립축제', '봄축제'], benefit: ['근로장려금', '자녀장려금', '청년주거지원'] },
  5: { festival: ['어린이날행사', '장미축제', '연등회'], benefit: ['근로장려금신청', '자녀장려금신청', '가정의달지원금'] },
  6: { festival: ['여름축제', '물축제', '한강축제'], benefit: ['청년지원금', '에너지바우처', '취업지원'] },
  7: { festival: ['여름축제', '물놀이행사', '워터페스티벌'], benefit: ['에너지취약계층지원', '청년주거지원', '여름방학지원'] },
  8: { festival: ['여름축제', '해변축제', '별빛축제'], benefit: ['개학맞이지원', '주거급여', '저소득층지원'] },
  9: { festival: ['추석행사', '가을축제', '단풍축제'], benefit: ['추석명절지원금', '복지급여', '노인복지혜택'] },
  10: { festival: ['단풍축제', '핼러윈행사', '문화행사'], benefit: ['난방비지원신청', '에너지바우처신청', '노후준비지원'] },
  11: { festival: ['빛축제', '크리스마스마켓', '겨울준비행사'], benefit: ['에너지바우처', '난방비지원', '연말정산준비'] },
  12: { festival: ['크리스마스행사', '연말축제', '겨울빛축제'], benefit: ['연말정산', '겨울난방지원', '신년복지혜택'] },
};

function getSeasonalKeywords(type, today = new Date()) {
  const month = today.getMonth() + 1;
  return (SEASONAL_KEYWORDS[month] || SEASONAL_KEYWORDS[5])[type] || [];
}

// DataLab(네이버) 검색 추이 TOP2 + 계절 키워드 병합. 반환 { keywords, source }.
async function getTodayHotKeywords(type, today = new Date()) {
  const seasonal = getSeasonalKeywords(type, today);

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.log(`[DataLab] API 키 없음 → 계절 키워드만 사용 (${type})`);
    return { keywords: seasonal, source: 'seasonal' };
  }

  try {
    const now = today instanceof Date ? today : new Date(today);
    const pad = (n) => String(n).padStart(2, '0');
    const endDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startDate = `${weekAgo.getFullYear()}-${pad(weekAgo.getMonth() + 1)}-${pad(weekAgo.getDate())}`;

    const keywordGroups = type === 'festival'
      ? [{ groupName: '축제', keywords: ['축제'] }, { groupName: '행사', keywords: ['행사'] }, { groupName: '나들이', keywords: ['나들이'] }, { groupName: '공연', keywords: ['공연'] }]
      : [{ groupName: '지원금', keywords: ['지원금'] }, { groupName: '혜택', keywords: ['혜택'] }, { groupName: '복지', keywords: ['복지'] }, { groupName: '보조금', keywords: ['보조금'] }];

    const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
      body: JSON.stringify({ startDate, endDate, timeUnit: 'date', keywordGroups }),
    });
    if (!res.ok) { console.warn(`[DataLab] 오류(${res.status}) → 계절 키워드만 사용 (${type})`); return { keywords: seasonal, source: 'seasonal(api-error)' }; }

    const json = await res.json();
    const scored = json.results.map((g) => {
      const recent = g.data.slice(-3);
      const avg = recent.length ? recent.reduce((s, d) => s + d.ratio, 0) / recent.length : 0;
      return { name: g.title, score: avg };
    }).sort((a, b) => b.score - a.score);

    const hot = scored.slice(0, 2).map((g) => g.name);
    console.log(`[DataLab] 핫 키워드 TOP2 (${type}): ${hot.join(', ')}`);
    return { keywords: [...new Set([...hot, ...seasonal])], source: 'datalab' };
  } catch (err) {
    console.warn(`[DataLab] 호출 실패 → 계절 키워드만 사용 (${type}):`, err.message);
    return { keywords: seasonal, source: 'seasonal(exception)' };
  }
}

module.exports = { SEASONAL_KEYWORDS, getSeasonalKeywords, getTodayHotKeywords };
