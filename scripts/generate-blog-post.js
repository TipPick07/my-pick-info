const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fallbacks = require('../src/lib/image-fallbacks.json');

// ─── 방법3: 월별 계절 키워드 자동 주입 ────────────────────────────────────
const SEASONAL_KEYWORDS = {
  1: {
    festival: ['설날행사', '겨울축제', '눈꽃축제', '얼음축제', '신년행사'],
    benefit: ['난방비지원', '에너지바우처', '설맞이지원금', '취업지원금', '청년수당']
  },
  2: {
    festival: ['봄맞이축제', '매화축제', '겨울끝자락', '실내전시'],
    benefit: ['청년취업지원', '설연휴혜택', '복지급여', '근로장려금신청준비']
  },
  3: {
    festival: ['벚꽃축제', '봄꽃축제', '개나리축제', '봄나들이'],
    benefit: ['청년창업지원', '소상공인지원', '봄학기장학금', '취업성공패키지']
  },
  4: {
    festival: ['벚꽃축제', '봄축제', '튤립축제', '어린이날준비행사'],
    benefit: ['근로장려금', '자녀장려금', '봄맞이지원금', '청년주거지원']
  },
  5: {
    festival: ['어린이날행사', '장미축제', '가정의달축제', '봄꽃축제', '연등회'],
    benefit: ['근로장려금신청', '자녀장려금신청', '어린이날혜택', '가정의달지원금']
  },
  6: {
    festival: ['여름축제', '물축제', '한강축제', '야외공연'],
    benefit: ['청년지원금', '에너지바우처', '여름방학프로그램', '취업지원']
  },
  7: {
    festival: ['여름축제', '물놀이행사', '워터페스티벌', '야외영화제'],
    benefit: ['에너지취약계층지원', '여름방학지원', '청년주거지원', '소상공인여름지원']
  },
  8: {
    festival: ['여름축제', '해변축제', '피서지행사', '별빛축제'],
    benefit: ['개학맞이지원', '청년지원금', '주거급여', '저소득층지원']
  },
  9: {
    festival: ['추석행사', '가을축제', '단풍축제', '한가위문화행사'],
    benefit: ['추석명절지원금', '복지급여', '가을학기장학금', '노인복지혜택']
  },
  10: {
    festival: ['단풍축제', '핼러윈행사', '가을꽃축제', '문화행사'],
    benefit: ['난방비지원신청', '에너지바우처신청', '복지급여', '노후준비지원']
  },
  11: {
    festival: ['겨울준비행사', '김장축제', '빛축제', '크리스마스마켓'],
    benefit: ['에너지바우처', '난방비지원', '연말정산준비', '겨울복지지원']
  },
  12: {
    festival: ['크리스마스행사', '연말축제', '겨울빛축제', '새해맞이행사'],
    benefit: ['연말정산', '연말지원금', '겨울난방지원', '신년복지혜택']
  }
};

function getSeasonalKeywords(postType) {
  const month = new Date().getMonth() + 1;
  const keywords = SEASONAL_KEYWORDS[month] || SEASONAL_KEYWORDS[5];
  return postType === 'festival' ? keywords.festival : keywords.benefit;
}
// ──────────────────────────────────────────────────────────────────────────────

// ─── 방법1: 네이버 DataLab 연동 ──────────────────────────────────────────────
async function getNaverDataLabKeywords(postType) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log('[DataLab] 네이버 API 키 없음 → 계절 키워드만 사용');
    return [];
  }

  try {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const endDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startDate = `${weekAgo.getFullYear()}-${pad(weekAgo.getMonth() + 1)}-${pad(weekAgo.getDate())}`;

    const keywordGroups = postType === 'festival'
      ? [
        { groupName: '축제', keywords: ['축제'] },
        { groupName: '행사', keywords: ['행사'] },
        { groupName: '나들이', keywords: ['나들이'] },
        { groupName: '공연', keywords: ['공연'] }
      ]
      : [
        { groupName: '지원금', keywords: ['지원금'] },
        { groupName: '혜택', keywords: ['혜택'] },
        { groupName: '복지', keywords: ['복지'] },
        { groupName: '보조금', keywords: ['보조금'] }
      ];

    const body = {
      startDate,
      endDate,
      timeUnit: 'date',
      keywordGroups: keywordGroups
    };

    const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.warn(`[DataLab] API 응답 오류 (${response.status}) → 계절 키워드만 사용`);
      return [];
    }

    const result = await response.json();

    const scored = result.results.map(group => {
      const recent = group.data.slice(-3);
      const avg = recent.reduce((sum, d) => sum + d.ratio, 0) / recent.length;
      return { name: group.title, score: avg };
    });

    scored.sort((a, b) => b.score - a.score);
    const hotKeywords = scored.slice(0, 2).map(g => g.name);
    console.log(`[DataLab] 핫 키워드 TOP2: ${hotKeywords.join(', ')}`);
    return hotKeywords;

  } catch (err) {
    console.warn('[DataLab] 호출 실패 → 계절 키워드만 사용:', err.message);
    return [];
  }
}

async function getTodayHotKeywords(postType) {
  const seasonal = getSeasonalKeywords(postType);
  const datalab = await getNaverDataLabKeywords(postType);

  const merged = [...new Set([...datalab, ...seasonal])];
  console.log(`[핫 키워드] 오늘의 키워드 (${postType}): ${merged.slice(0, 5).join(', ')}`);
  return merged;
}
// ──────────────────────────────────────────────────────────────────────────────

// ─── 쿠팡 파트너스 연동 ──────────────────────────────────────────────────────
function extractCoupangKeyword(title) {
  return (title || '')
    .replace(/\d{4}/g, '')
    .replace(/서울특별시|서울시|서울|인천광역시|인천시|인천|경기도|경기|수도권/g, '')
    .replace(/가이드|총정리|완벽|정보|안내|꿀팁|추천|비교|일정|방법|신청/g, '')
    .trim()
    .split(/[\s·\-\/—]/)
    .filter(w => w.length >= 2)
    .slice(0, 2)
    .join(' ')
    .trim();
}

async function getCoupangProduct(keyword) {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;

  if (!accessKey || !secretKey) {
    console.log('[쿠팡] API 키 없음 → 제휴 링크 생략');
    return null;
  }

  const searchKeyword = keyword || '베스트셀러';

  try {
    const method = 'GET';
    const domain = 'https://api-gateway.coupang.com';
    const apiPath = '/v2/providers/affiliate_open_api/apis/openapi/v1/products/search';
    const queryString = `keyword=${encodeURIComponent(searchKeyword)}&limit=1`;

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const yy = String(now.getUTCFullYear()).slice(2);
    const mm = pad(now.getUTCMonth() + 1);
    const dd = pad(now.getUTCDate());
    const hh = pad(now.getUTCHours());
    const mi = pad(now.getUTCMinutes());
    const ss = pad(now.getUTCSeconds());
    const datetime = `${yy}${mm}${dd}T${hh}${mi}${ss}Z`;
    const message = datetime + method + apiPath + queryString;
    const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
    const authorization = `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;

    const response = await fetch(`${domain}${apiPath}?${queryString}`, {
      method,
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

    if (!response.ok) {
      console.warn(`[쿠팡] API 응답 오류 (${response.status}) → 제휴 링크 생략`);
      return null;
    }

    const result = await response.json();

    if (result.rCode !== '0' || !result.data?.productData?.length) {
      console.log(`[쿠팡] "${searchKeyword}" 검색 결과 없음 → 제휴 링크 생략`);
      return null;
    }

    const product = result.data.productData[0];
    console.log(`[쿠팡] 연결 상품 발견: "${product.productName}"`);
    return {
      name: product.productName,
      url: product.productUrl,
      price: product.productPrice
    };

  } catch (err) {
    console.warn('[쿠팡] 호출 실패 → 제휴 링크 생략:', err.message);
    return null;
  }
}
// ──────────────────────────────────────────────────────────────────────────────

function calcScore(item, postType, hotKeywords = []) {
  let score = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const text = [item.title, item.details, item.description, item.target, item.summary, item.deadline, item.date].join(' ');

  hotKeywords.forEach((kw, idx) => {
    const weight = idx < 2 ? 30 : 15;
    if (item.title?.includes(kw)) score += weight;
    if (text.includes(kw)) score += Math.floor(weight / 2);
  });

  if (postType === 'festival') {
    const dateMatches = [...String(item.date || '').matchAll(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/g)];
    if (dateMatches.length > 0) {
      const first = dateMatches[0];
      const startDate = new Date(parseInt(first[1]), parseInt(first[2]) - 1, parseInt(first[3]));
      const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) score += 60;
      else if (diffDays >= 0 && diffDays <= 7) score += 50;
      else if (diffDays < 0 && diffDays >= -14) score += 40;
      else if (diffDays > 7 && diffDays <= 14) score += 20;

      const tempDate = new Date(startDate);
      for (let i = 0; i < 7; i++) {
        const day = tempDate.getDay();
        if (day === 0 || day === 6) { score += 20; break; }
        tempDate.setDate(tempDate.getDate() + 1);
      }
    } else {
      score += 5;
    }

    if (text.includes('무료')) score += 15;
    if (text.includes('서울')) score += 10;
    if (text.includes('인천') || text.includes('경기')) score += 5;

  } else {
    const deadlineMatches = [...String(item.deadline || item.date || '').matchAll(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/g)];
    if (deadlineMatches.length > 0) {
      const last = deadlineMatches[deadlineMatches.length - 1];
      const deadlineDate = new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
      const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) score += 60;
      else if (diffDays >= 0 && diffDays <= 30) score += 30;
      else if (diffDays > 30) score += 10;
    } else {
      score += 5;
    }

    if (text.includes('서울')) score += 10;
    if (text.includes('인천') || text.includes('경기')) score += 5;
    if (item.isEmergency) score += 20;
  }

  return score;
}

// ─── 중복 방지 유틸 (Jaccard 유사도 기반 강화) ────────────────────────────────
const DEDUP_STOP_WORDS = new Set([
  '총정리', '완벽', '가이드', '비교', '안내', '방법', '신청', '지원', '혜택', '정보',
  '2026', '2025', '2024', '서울', '인천', '경기', '수도권', '전국',
  '이것', '무엇', '어떻게', '공식', '행사', '이번', 'best', 'top',
  '및', '등', '또는', '그리고', '위한', '위해', '부터', '까지',
]);

function extractKeywords(title) {
  return (title || '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^가-힣a-z0-9\s]/gi, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length >= 2 && !DEDUP_STOP_WORDS.has(w));
}

function jaccardSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  const intersection = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

// 제목에서 고유 제도·행사명(프로그램명)을 추출한다.
// 같은 제도를 다룬 글은 제목 표현이 달라도 이 토큰이 겹친다.
// 예: '근로장려금', '에너지바우처', '청년기본소득', '장미축제'.
// 제도성 접미사가 붙은 고유 복합명사만 잡아 일반 단어 오탐을 줄인다.
function extractProgramNames(title) {
  const t = (title || '').replace(/\[.*?\]/g, ' ');
  const set = new Set();
  const re = /([가-힣A-Za-z0-9]{2,}(?:장려금|바우처|기본소득|수당|지원금|보조금|장학금|급여|연금|공제|환급금|축제|페스티벌|박람회|엑스포))/g;
  for (const m of t.matchAll(re)) {
    const token = m[1].replace(/^\d+/, ''); // 앞에 붙은 연도/숫자 제거 (예: 2026근로장려금 → 근로장려금)
    if (token.length >= 3) set.add(token);
  }
  return set;
}

function normTitle(title) {
  return (title || '')
    .replace(/\[.*?\]/g, '')
    .replace(/2026|2025/g, '')
    .replace(/서울특별시|서울시|서울|인천광역시|인천시|인천|경기도|경기|수도권/g, '')
    .replace(/[^가-힣a-z0-9]/gi, '')
    .toLowerCase()
    .trim();
}

// existingPosts: readPostTitlesFromDir() 반환 배열 (norm + keywords + programs 포함)
function isDuplicate(newNorm, newKeywords, newPrograms, existingPosts) {
  if (!newNorm || newNorm.length < 4) return false;
  for (const existing of existingPosts) {
    const existNorm = existing.norm;
    if (!existNorm || existNorm.length < 4) continue;
    // 1. 정규화 제목 완전 일치
    if (newNorm === existNorm) return true;
    // 2. 포함 관계
    if (newNorm.includes(existNorm) || existNorm.includes(newNorm)) return true;
    // 3. 앞 10자 일치
    const minLen = Math.min(10, newNorm.length, existNorm.length);
    if (minLen >= 4 && newNorm.slice(0, minLen) === existNorm.slice(0, minLen)) return true;
    // 4. Jaccard 유사도 ≥ 0.5 (키워드 집합 기준)
    if (newKeywords.size >= 3 && existing.keywords.size >= 3) {
      if (jaccardSimilarity(newKeywords, existing.keywords) >= 0.5) return true;
    }
    // 5. 동일 프로그램명(고유 제도·행사명) 공유 시 중복 — 제목 표현이 달라도 같은 제도면 차단
    //    (예: '근로장려금 최대 환급액' vs '근로장려금 최대 330만원' → 둘 다 '근로장려금' 보유)
    if (newPrograms && newPrograms.size && existing.programs && existing.programs.size) {
      for (const p of newPrograms) {
        if (existing.programs.has(p)) return true;
      }
    }
  }
  return false;
}

// ─── 폴더에서 포스트 메타 목록 읽기 (norm + keywords 포함) ──────────────────
function readPostTitlesFromDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .flatMap(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const originalTitleMatch = content.match(/originalTitle:\s*["']?(.+?)["']?\s*$/m);
      const originalTitle = originalTitleMatch ? originalTitleMatch[1].trim() : null;
      const titleMatch = content.match(/title:\s*"(.*)"/) || content.match(/title:\s*(.*)\r?\n/);
      const title = titleMatch ? titleMatch[1].replace(/"/g, '').trim() : null;

      const makeEntry = t => ({
        title: t,
        norm: normTitle(t),
        keywords: new Set(extractKeywords(t)),
        programs: extractProgramNames(t),
        filename: file.replace('.md', ''),
      });

      const entries = [];
      if (title) entries.push(makeEntry(title));
      if (originalTitle && originalTitle !== title) entries.push(makeEntry(originalTitle));
      return entries;
    });
}
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  const DRY_RUN = process.env.DRY_RUN === 'true';
  if (DRY_RUN) {
    console.log('[DRY RUN] 테스트 모드 — 글 생성 없이 키워드/스코어만 확인합니다.');
  }
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    // 1. 최신 데이터 확인
    const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('pick-info.json 파일이 존재하지 않습니다.');
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const postType = process.env.POST_TYPE || 'benefit';
    const allItems = (postType === 'festival'
      ? (data.festivals || [])
      : (data.benefits || [])
    ).reverse();
    console.log(`[블로그] 발행 타입: ${postType} (총 ${allItems.length}건)`);

    if (allItems.length === 0) {
      console.log('가져올 데이터가 없습니다.');
      return;
    }

    // ─── 오늘의 핫 키워드 수집 (방법1 + 방법3) ───────────────────────────
    const hotKeywords = await getTodayHotKeywords(postType);
    // ──────────────────────────────────────────────────────────────────────

    // ─── 3개 폴더 중복 스캔: posts / drafts / review ──────────────────────
    const postsDir = path.join(process.cwd(), 'src/content/posts');
    const draftsDir = path.join(process.cwd(), 'src/content/drafts');
    const reviewDir = path.join(process.cwd(), 'src/content/review');

    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }
    if (!fs.existsSync(reviewDir)) {
      fs.mkdirSync(reviewDir, { recursive: true });
    }

    // 3개 폴더 전체에서 제목 수집 → 중복 판단용
    const allExistingPosts = [
      ...readPostTitlesFromDir(postsDir),
      ...readPostTitlesFromDir(draftsDir),
      ...readPostTitlesFromDir(reviewDir),
    ];
    const countMd = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith('.md')).length : 0;
    console.log(
      `[중복 스캔] posts:${countMd(postsDir)}파일 ` +
      `drafts:${countMd(draftsDir)}파일 ` +
      `review:${countMd(reviewDir)}파일 (총 인덱스 ${allExistingPosts.length}건, Jaccard 유사도 적용)`
    );

    // ──────────────────────────────────────────────────────────────────────

    const unpostedItems = allItems.filter(item => {
      const normItem = normTitle(item.title);
      const itemKeywords = new Set(extractKeywords(item.title));
      const itemPrograms = extractProgramNames(item.title);
      if (isDuplicate(normItem, itemKeywords, itemPrograms, allExistingPosts)) {
        console.log(`  [중복 스킵] ${item.title}`);
        return false;
      }
      if (postType === 'festival') {
        const dateMatches = [...String(item.date || '').matchAll(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/g)];
        if (dateMatches.length > 0) {
          const last = dateMatches[dateMatches.length - 1];
          const endDate = new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
          const todayKST = new Date();
          todayKST.setHours(0, 0, 0, 0);
          if (endDate < todayKST) return false;
        }
      }
      return true;
    });

    if (unpostedItems.length === 0) {
      console.log('모든 데이터가 이미 블로그에 작성되었습니다.');
      return;
    }

    // ─── Step 3: 3분할 카테고리 분기 (축제/행사 · 주거/임대 지원 · 일반 지원금) ──
    const PUBLISH_THRESHOLD = 3;
    let categoryFilteredItems = unpostedItems;
    let publishCategory = postType === 'festival' ? '축제/행사' : '일반 지원금';

    // 축제: 미발행 후보가 임계치 미만이면 품질 유지를 위해 발행 건너뜀 (benefit 2분할 게이트와 동일 기준)
    if (postType === 'festival' && unpostedItems.length < PUBLISH_THRESHOLD) {
      console.log(`[축제] 미발행 후보 ${unpostedItems.length}건 < ${PUBLISH_THRESHOLD}건 → 발행 건너뜀`);
      return;
    }

    if (postType === 'benefit') {
      // 지원금 탭 "주거/임대 지원" 필터(BenefitsClient)와 동일 기준으로 선별
      const housingKws = ['주거', '청년안심', 'LH', 'SH', 'GH', '전세', '월세', '임대', '행복주택', '국민임대'];
      const housingItems = unpostedItems.filter(item =>
        item._source === '마이홈포털' ||
        housingKws.some(kw =>
          (item.title || '').includes(kw) || (item.target || '').includes(kw)
        )
      );
      const generalItems = unpostedItems.filter(item => !housingItems.includes(item));

      console.log(`[3분할] 주거/임대 지원: ${housingItems.length}건, 일반 지원금: ${generalItems.length}건 (임계치: ${PUBLISH_THRESHOLD}건)`);

      const housingReady = housingItems.length >= PUBLISH_THRESHOLD;
      const generalReady = generalItems.length >= PUBLISH_THRESHOLD;

      if (!housingReady && !generalReady) {
        console.log(`[3분할] 두 카테고리 모두 ${PUBLISH_THRESHOLD}건 미달 → 발행 건너뜀`);
        return;
      }

      if (housingReady && generalReady) {
        if (housingItems.length >= generalItems.length) {
          categoryFilteredItems = housingItems;
          publishCategory = '주거/임대 지원';
        } else {
          categoryFilteredItems = generalItems;
          publishCategory = '일반 지원금';
        }
      } else if (housingReady) {
        categoryFilteredItems = housingItems;
        publishCategory = '주거/임대 지원';
      } else {
        categoryFilteredItems = generalItems;
        publishCategory = '일반 지원금';
      }

      console.log(`[3분할] 발행 선택: ${publishCategory} (${categoryFilteredItems.length}건)`);
    }
    // ───────────────────────────────────────────────────────────────────────

    // ─── 핫 키워드 반영 스코어링 및 테마별 묶음 추출 ──────────────────────
    const scoredItems = categoryFilteredItems.map(item => ({ item, score: calcScore(item, postType, hotKeywords) }));

    // 그룹핑: targetPersona(페르소나) 기준으로 묶기 (없으면 tag 기준)
    const grouped = {};
    for (const { item, score } of scoredItems) {
      const themeKey = item.targetPersona || item.tag || '공통 혜택';
      if (!grouped[themeKey]) grouped[themeKey] = { score: 0, items: [] };
      grouped[themeKey].items.push(item);
      grouped[themeKey].score += score; // 그룹 전체 핫 키워드 점수 합산
    }

    // 최우수 테마 선정 (점수 가장 높은 그룹)
    const sortedGroups = Object.entries(grouped).sort((a, b) => b[1].score - a[1].score);
    const topThemeName = sortedGroups[0][0];
    const topThemeGroup = sortedGroups[0][1];

    // 해당 테마 내에서 개별 점수가 높은 순으로 정렬 후 3~4개 추출
    topThemeGroup.items.sort((a, b) => calcScore(b, postType, hotKeywords) - calcScore(a, postType, hotKeywords));
    const targetItems = topThemeGroup.items.slice(0, 4);

    console.log(`[블로그] 큐레이션 최우수 테마: "${topThemeName}" (그룹 총점: ${topThemeGroup.score}점)`);
    console.log(`[블로그] 선정된 데이터 세트 (총 ${targetItems.length}건):`);
    targetItems.forEach((t, i) => console.log(`  ${i + 1}. ${t.title}`));
    // ──────────────────────────────────────────────────────────────────────

    // 이미지 보정 (각 아이템별 처리)
    for (const tItem of targetItems) {
      if (!tItem.image || tItem.image.includes('default.png')) {
        const guideFallbacks = fallbacks.GUIDE;
        tItem.image = guideFallbacks[Math.floor(Math.random() * guideFallbacks.length)];
        console.log(`[보정] 이미지 누락 데이터에 스톡 이미지를 할당했습니다: ${tItem.image}`);
      }
    }

    // ─── 쿠팡 파트너스 제휴 상품 검색 (메인 아이템 기준) ───────────────────
    const mainTitleForCoupang = targetItems[0].title;
    const coupangKeyword = extractCoupangKeyword(mainTitleForCoupang);
    const coupangProduct = await getCoupangProduct(coupangKeyword);

    // 쿠팡 상품이 있을 때만 프롬프트에 주입할 섹션 구성
    const coupangPromptSection = coupangProduct ? `
[쿠팡 파트너스 제휴 상품 링크 - 반드시 포함]
아래 버튼 링크를 본문에서 가장 자연스러운 위치(준비물·추천 상품·쇼핑 안내 이후 등)에 한 번만 삽입하세요:
[👉 ${coupangProduct.name} — 쿠팡에서 확인하기](${coupangProduct.url})

` : '';

    const coupangDisclosureSection = coupangProduct ? `
[공정위 고시 문구 - 반드시 포함]
브랜드 문구("매일 아침...") 바로 다음 줄에 이탤릭체로 추가하세요:
*이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.*

` : '';
    // ──────────────────────────────────────────────────────────────────────

    // 2. Gemini AI로 블로그 글 생성
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
    const prompt = {
      contents: [{
        parts: [{
          text: `절대로 내부 사고 과정, 계획, 분석 내용을 출력하지 마세요.
오직 완성된 마크다운 블로그 글만 출력하세요.

이 글은 ${publishCategory} 테마별 비교·분석 큐레이션 블로그 포스트입니다.
당신은 수도권 생활 정보 큐레이션 서비스 '수도권 팁픽(Tip-Pick)'의 전문 에디터이자 SEO 전문가입니다.
아래 제공된 3~4개의 공공서비스 데이터 세트를 바탕으로, 구글/네이버 검색 상위 노출이 가능한 프리미엄 비교/분석 큐레이션 블로그 글을 작성해줘.

선정된 테마(페르소나): ${topThemeName}
정보 데이터 세트(배열): ${JSON.stringify(targetItems, null, 2)}

오늘의 핫 키워드: ${hotKeywords.slice(0, 5).join(', ')}

[타겟 및 톤앤매너]
${publishCategory === '축제/행사'
              ? '- 타겟: 전 연령층\n- 말투: 밝고 경쾌하게\n- 주제: 나들이, 즐거움'
              : publishCategory === '주거/임대 지원'
              ? '- 타겟: 무주택 청년·신혼부부·서민 가구\n- 말투: 신뢰감 있고 전문적으로\n- 주제: 주거 안정, 임대료 절감, 청약 전략'
              : '- 타겟: 40~60대 중장년층\n- 말투: 신뢰감 있고 따뜻하게\n- 주제: 경제적 이득, 생활 안정'}

[작성 가이드라인 - 본문 구조 강제]
1. 서론 (Intro): 
   - 테마 선정 이유와 독자(페르소나)의 현재 고민/상황에 대한 강력한 공감으로 시작하세요.
   - 예: "최근 물가 상승으로 영유아 부모님들의 고민이 큽니다. 그래서 오늘 가성비 주말 나들이 테마로 가장 혜택이 좋은 3가지를 엄선했습니다."
2. 1분 자격 진단 퀴즈 (Interactive): 
   - 서론 직후에 독자가 본인의 대상 여부를 확인할 수 있도록 마크다운 체크박스('- [ ]')를 사용한 O/X 퀴즈 영역을 반드시 만드세요.
   - 제공된 데이터의 'eligibilityQuiz' 배열 항목들을 활용해 인터랙티브하게 구성하세요.
3. 본론 (Body - 비교 및 분석 큐레이션):
   - 3~4개의 데이터를 단순 나열하지 마세요. 각 항목이 어떤 점이 좋고, 누가 신청/방문하면 좋을지 서로 **비교·분석**하는 형태로 서술하세요.
   - 각 데이터의 'targetPersona', 'coreValue'를 활용하여 명확한 타겟팅을 제시하세요.
   - 데이터에 'simulation' 내용이 있다면 (예: 연간 120만원 절약) 이를 시각적으로 눈에 띄게 배치하여 기대 효용을 극대화하세요.
   - 데이터에 'practicalTip' 내용이 있다면 (예: 서류 발급 꿀팁, 주차 꿀팁) 실무적인 팁으로 강조해서 서술하세요.
   - 반드시 아래 3개의 H2(##) 섹션을 본론 내 순서대로 포함할 것:
     ## 이 제도/행사는 왜 생겼나 — 배경 및 개요
     ## 핵심 지원 내용 / 주요 프로그램 — 금액, 대상, 신청 방법
     ## 신청 전 꼭 알아야 할 주의사항 — 자주 하는 실수, 체크리스트
4. 결론 (Outro):
   - 큐레이션 내용을 3줄로 요약하고 독자의 행동(신청/방문)을 촉구하세요.

[SEO 및 품질 핵심 원칙 - 반드시 지킬 것]
1. 핵심 키워드는 제목 1회, 본문 첫 문단 1회, 소제목 1회 이내로만 사용. 3회 이상 반복 금지.
2. LSI 키워드(연관 키워드) 전략: 핵심 키워드 대신 '혜택', '보조금', '신청' 등 다양한 표현 사용.
3. 메타 디스크립션(summary)은 150자 이내, 클릭 유도형 문장 사용 (수치/날짜 필수).
4. 표(Table) 1개 이상 필수 포함 (3~4개 데이터의 핵심 정보 비교표 권장).
5. E-E-A-T 충족을 위해 경험적 묘사와 전문적 해석, 함정/주의사항을 반드시 포함할 것.
6. 분량 강제: **공백 제외 반드시 1,500자 이상** 작성. 짧은 단답을 피하고 상세한 스토리텔링과 실용적 팁을 담을 것.
7. officialDetails: 데이터의 사실을 바탕으로 ①지원 대상 ②지원 내용 ③신청 방법 핵심만 담은 2~3문장(120~200자)의 간결한 요약으로 작성. 본문처럼 길게 늘이지 말 것(상세 설명은 본문에서 다룸). 마케팅·감성 표현 금지.
8. officialTip: 신청 실전 팁을 1~2문장의 간결한 평문으로 작성. 번호 매기기·별표(**)·마크다운 사용 금지(페이지가 평문으로 표시함). 감상문·홍보 문구 금지.
9. officialCurationNote: "이런 분께 강력 추천합니다: [대상]" 형식으로 구체적 수치(금액·기한) 포함 1~2문장으로 작성.

${coupangPromptSection}${coupangDisclosureSection}아래 형식으로만 출력. YAML Frontmatter 포함. 다른 설명 제외.
**응답 첫 번째 줄에 반드시** 아래 형식으로 파일명을 출력할 것 (이 줄이 없으면 응답 전체가 무효 처리됨):
FILENAME: YYYY-MM-DD-영문-키워드-슬러그 (예: FILENAME: 2026-06-01-seoul-yongsan-disabled-birth-support)
---
title: (반드시 "[지역명] 핵심키워드 (타겟독자)" 형식 준수. 예①축제: [인천 서구] 정서진 노을 종 축제 (유아·초등 자녀 동반 추천) / 예②지원금: [서울 용산] 장애인가정 출산지원금 (등록 장애인 부모 필독) / 예③주거: [경기 이천] 이천사랑 지역화폐 캐시백 (이천시 거주 3040 가족 필독). ⚠️ 제목에 "총정리/완벽 가이드/완벽 분석/A-Z/한방에" 같은 상투적 표현 사용 금지)
originalTitle: ${targetItems[0].title} 외 ${targetItems.length - 1}건
link: ${targetItems[0].link || ''}
officialTarget: ${targetItems[0].target || targetItems[0].targetPersona || '정보 없음'}
officialDetails: (위 데이터를 바탕으로 ①대상 ②내용 ③신청방법 핵심만 2~3문장(120~200자)으로 간결히 요약. 장황하게 늘이지 말 것(상세 설명은 본문에서 다룸). 마케팅·감성 표현 금지.)
officialDeadline: ${targetItems[0].deadline || targetItems[0].date || '상시'}
date: ${today}
summary: (구글 검색 결과에 그대로 노출되는 설명. 구체적 날짜나 금액 수치 반드시 포함. 형식: 언제/어디서 + 무엇을 + 얼마나 + 지금 확인하세요 순서. 반드시 ~하세요 또는 ~챙기세요로 끝낼 것. 100자 이내.)
description: (summary와 동일한 내용으로 작성)
category: ${postType === 'festival' ? 'festival' : 'benefit'}
image: ${targetItems[0].image || ''}
ogImage: ""
tags: [연관키워드1, 연관키워드2, 연관키워드3, 연관키워드4, 연관키워드5]
officialCurationNote: (이런 분께 강력 추천합니다: [구체적 대상]. 반드시 금액·기한 등 수치 1개 이상 포함. 2문장 이내.)
officialRequirements: ${JSON.stringify(targetItems[0].requirements || [])}
officialHowToApply: ${JSON.stringify(targetItems[0].howToApply || [])}
officialEligibilityQuiz: ${JSON.stringify(targetItems[0].eligibilityQuiz || [])}
officialTip: (1~2문장의 간결한 평문으로 작성. 번호 매기기·별표(**)·마크다운 금지. 서류 준비·기한 확인·온오프라인 선택·자주 하는 실수 중 가장 중요한 것 위주로 실전 정보. 홍보 문구 금지.)
---

(본문 시작 — 도입부는 매번 다른 방식으로. E-E-A-T 기준 충족. 1,500자 이상.)`
        }]
      }],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192
      }
    };

    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
    let result;
    let geminiBackoff = 30000;
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });

      if (response.status === 503 || response.status === 429) {
        console.warn(`Gemini 과부하 (${response.status}) — ${geminiBackoff / 1000}초 후 재시도 (${attempt + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, geminiBackoff));
        geminiBackoff *= 2;
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API 호출 실패 (상태 코드: ${response.status}) [모델: ${geminiModel}]: ${errorBody}`);
      }

      result = await response.json();
      break;
    }

    if (!result) {
      throw new Error('Gemini API 최대 재시도 횟수 초과');
    }
    let fullText = result.candidates[0].content.parts[0].text;

    const filenameMatch = fullText.match(/FILENAME:\s*([^\s\n]+)/i);
    let filename;
    if (!filenameMatch) {
      const titleMatch = fullText.match(/^title:\s*(.+)$/m);
      let fallbackSlug;
      if (titleMatch) {
        fallbackSlug = titleMatch[1]
          .replace(/[()（）[\]【】<>《》『』「」"'""'']/g, '')
          .replace(/[,，。·\-–—]/g, ' ')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-{2,}/g, '-')
          .substring(0, 50)
          .replace(/-+$/, '');
      } else {
        fallbackSlug = `${postType}-${Date.now()}`;
      }
      filename = `${today}-${fallbackSlug}.md`;
      console.warn(`[경고] Gemini가 FILENAME을 누락 — 폴백 파일명 사용: ${filename}`);
    } else {
      const rawFilename = filenameMatch[1].trim().replace(/\.md$/i, '').replace(/\.+$/, '');
      const keyword = rawFilename.replace(/^\d{4}-\d{2}-\d{2}-?/, '');
      filename = `${today}-${keyword}.md`;
    }

    let mdContent = fullText.replace(/FILENAME:.*$/im, '').trim();
    mdContent = mdContent.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();
    mdContent = mdContent.replace(/^date:.*$/m, `date: ${today}`);

    // Gemini 내부 reasoning 텍스트 제거 (멀티라인 포함)
    mdContent = mdContent.replace(/The user wants[\s\S]*?(?=따뜻한|새로운|봄|이번|서울|경기|인천)/g, '');
    mdContent = mdContent.replace(/Let me break down[\s\S]*?(?=따뜻한|새로운|봄|이번|서울|경기|인천)/g, '');
    mdContent = mdContent.replace(/\*\*1\. YAML[\s\S]*?(?=따뜻한|새로운|봄|이번|서울|경기|인천)/g, '');

    // 표 구분선 대시 폭주 정리: Gemini가 수십~수만 개 대시를 토하는 사고 방지 (연속 대시 40개 이상 → 표준 '---')
    mdContent = mdContent.replace(/-{40,}/g, '---');
    // 표 행에서 셀 내용이 500자 이상인 행 전체 제거
    mdContent = mdContent.replace(/^\|[^\n]{500,}\|$/gm, '');
    // 닫는 파이프 없이 비정상적으로 길어진(런어웨이) 표 행 제거 (셀 내부 파이프 없는 200자+ 단일 셀)
    mdContent = mdContent.replace(/^\|[^\n|]{200,}$/gm, '');

    // 프롬프트 에코 감지: Gemini가 프롬프트 내용을 출력에 포함시킨 경우 제거
    // 프론트매터 이후 본문에서만 적용
    const fmEnd = mdContent.indexOf('\n---\n', mdContent.indexOf('---'));
    if (fmEnd !== -1) {
      const frontmatter = mdContent.substring(0, fmEnd + 5);
      let body = mdContent.substring(fmEnd + 5);
      const PROMPT_ECHO_SIGS = [
        'This is a general support curation blog post.',
        'You are a professional editor and SEO expert',
        'Selected Theme (Persona):',
        'Information Dataset (Array):',
        '이 글은 일반 지원금 테마별 큐레이션',
        '이 글은 주거/임대 지원 테마별 큐레이션',
        '이 글은 축제/행사 테마별 큐레이션',
        '당신은 수도권 생활 정보 큐레이션 서비스',
        '정보 데이터 세트(배열):',
        '[타겟 및 톤앤매너]',
        '[작성 가이드라인 - 본문 구조 강제]',
      ];
      for (const sig of PROMPT_ECHO_SIGS) {
        const idx = body.indexOf(sig);
        if (idx !== -1) {
          // 오염 시작점 직전 | 또는 줄 시작으로 이동
          const lineStart = body.lastIndexOf('\n', idx);
          body = body.substring(0, lineStart > 0 ? lineStart : idx);
          console.warn(`[경고] 프롬프트 에코 감지 ("${sig.substring(0, 30)}...") — 오염 구간 제거`);
          break;
        }
      }
      mdContent = frontmatter + body;
    }

    // 연속된 빈 줄 정리 (3줄 이상 → 2줄로)
    mdContent = mdContent.replace(/\n{3,}/g, '\n\n');

    // Frontmatter 내 멀티라인 값을 단일 라인으로 압축 (YAML 파싱 에러 방지)
    mdContent = mdContent.replace(
      /^---\r?\n([\s\S]*?)\n---/m,
      (match, body) => {
        const lines = body.split('\n');
        const collapsed = [];
        for (const line of lines) {
          if (/^[a-zA-Z][a-zA-Z0-9_]*:/.test(line)) {
            collapsed.push(line);
          } else if (collapsed.length > 0 && line.trim() !== '') {
            collapsed[collapsed.length - 1] += ' ' + line.trim();
          }
        }
        return '---\n' + collapsed.join('\n') + '\n---';
      }
    );

    // officialTip 정규화: 블로그 페이지가 officialTip을 마크다운이 아닌 plain text(<p>)로 렌더한다.
    // 따라서 '**'(별표)나 "1. … 2. …" 번호 리스트가 들어오면 그대로 노출되거나 한 줄로 뭉쳐 깨진다.
    // 6/1 글처럼 간결한 평문이 되도록 별표·대시불릿·번호 마커를 제거한다.
    mdContent = mdContent.replace(
      /^(officialTip):[ \t]*(.+)$/gm,
      (_, key, value) => {
        const v = value
          .replace(/\*\*/g, '')                  // 볼드 마커 제거 (그대로 노출되어 깨짐)
          .replace(/(^|\s)-\s+(?=\d+\.)/g, '$1')  // 번호 앞 '- ' 불릿 제거 (YAML 시퀀스 오인 방지)
          .replace(/(^|\s)\d+\.\s+/g, '$1')       // "1. " "2. " 등 번호 마커 제거 → 평문화
          .replace(/\s{2,}/g, ' ')                // 중복 공백 정리
          .trim();
        return `${key}: ${v}`;
      }
    );

    mdContent = mdContent.replace(
      /^(---\r?\n)([\s\S]*?)(---)/,
      (_, open, frontmatter, close) => {
        const fixed = frontmatter.replace(
          /^([a-zA-Z][a-zA-Z0-9_]*):\s+(.+)$/gm,
          (line, key, value) => {
            const trimmed = value.trim();
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
              (trimmed.startsWith("'") && trimmed.endsWith("'"))) return line;
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
              (trimmed.startsWith('{') && trimmed.endsWith('}'))) return line;
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              return `${key}: "${trimmed.replace(/"/g, '\\"')}"`;
            }
            // 따옴표/YAML 지시자 문자로 시작하지만 올바르게 감싸이지 않은 평문 스칼라는
            // 따옴표로 감싸 파싱 에러를 원천 차단한다.
            //  - officialDetails 가 '…!'는 … 형태(작은따옴표로 시작·중간에 닫힘)
            //  - officialTip 이 '- '로 시작하는 경우 등 Gemini 출력 변동 대응
            if (/^['"\-?:,&*!|>@%`#[\]{}]/.test(trimmed)) {
              return `${key}: "${trimmed.replace(/"/g, '\\"')}"`;
            }
            if (trimmed.includes(': ')) {
              return `${key}: "${trimmed.replace(/"/g, '\\"')}"`;
            }
            return line;
          }
        );
        return open + fixed + close;
      }
    );

    if (/^image:\s*$/m.test(mdContent)) {
      const localFallbacks = [
        '/images/blogs/korea-welfare-benefit-210.png',
        '/images/blogs/korea-welfare-benefit-212.png',
        '/images/blogs/korea-welfare-benefit-279.png',
        '/images/blogs/korea-welfare-benefit-533.png',
        '/images/blogs/korea-welfare-benefit-843.png',
      ];
      const fallbackImage = localFallbacks[Math.floor(Math.random() * localFallbacks.length)];
      mdContent = mdContent.replace(/^(image:)\s*$/m, `$1 ${fallbackImage}`);
      console.log(`[보정] Gemini가 이미지를 비워 로컬 폴백 이미지를 주입했습니다: ${fallbackImage}`);
    }

    // ogImage 자동 주입: thumbnail → image 우선순위로 절대 URL 구성
    const imageLineMatch = mdContent.match(/^image:\s*(.+)$/m);
    const imageVal = imageLineMatch ? imageLineMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
    const thumbnailLineMatch = mdContent.match(/^thumbnail:\s*(.+)$/m);
    const thumbnailVal = thumbnailLineMatch ? thumbnailLineMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
    const isValidImgVal = v => v && (v.startsWith('http') || v.startsWith('/'));
    const ogSource = isValidImgVal(thumbnailVal) ? thumbnailVal : imageVal;
    const computedOgImage = ogSource.startsWith('http')
      ? ogSource
      : ogSource ? `https://tip-pick.com${ogSource}` : 'https://tip-pick.com/images/og-default.png';
    if (/^ogImage:\s*$/m.test(mdContent)) {
      mdContent = mdContent.replace(/^(ogImage:)\s*$/m, `$1 "${computedOgImage}"`);
    } else if (!/^ogImage:/m.test(mdContent)) {
      mdContent = mdContent.replace(/^(image:.+)$/m, `$1\nogImage: "${computedOgImage}"`);
    }

    // ─── ★ 생성 후 최종 제목 중복 재검사 ──────────────────────────────────────
    // 1차 게이트(unpostedItems 필터)는 '크롤링 원본 제목(item.title)' 기준으로만 돈다.
    // 소스 레코드가 서로 달라 1차를 통과했더라도, Gemini가 둘을 '동일 제도'로 재작성하면
    // 최종 제목이 기존 글과 충돌한다(2026-06-04 용산 자립준비청년 생활보조수당 재탕 사고).
    // → 여기서 '최종 title'을 기존 전체(posts/drafts/review)와 다시 대조해 차단한다.
    const finalTitleMatch = mdContent.match(/^title:\s*(.+)$/m);
    if (finalTitleMatch) {
      const finalTitle = finalTitleMatch[1].replace(/^["']|["']$/g, '').trim();
      const finalNorm = normTitle(finalTitle);
      const finalKeywords = new Set(extractKeywords(finalTitle));
      const finalPrograms = extractProgramNames(finalTitle);
      if (isDuplicate(finalNorm, finalKeywords, finalPrograms, allExistingPosts)) {
        console.warn(`[중복 차단·생성후] 최종 제목이 기존 글과 중복 → 발행 취소: "${finalTitle}"`);
        return;
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    const finalPath = path.join(postsDir, filename);
    if (DRY_RUN) {
      console.log(`[DRY RUN] 파일 저장 건너뜀: ${filename}`);
      return;
    }
    fs.writeFileSync(finalPath, mdContent, 'utf8');
    console.log(`생성 완료: ${filename}`);

  } catch (error) {
    console.warn('[블로그 자동 생성 실패, 배포는 계속 진행됩니다:', error.message);
    process.exit(0);
  }
}

main();
