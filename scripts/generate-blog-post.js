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

function normTitle(title) {
  return (title || '')
    .replace(/\[.*?\]/g, '')
    .replace(/2026|2025/g, '')
    .replace(/서울특별시|서울시|서울|인천광역시|인천시|인천|경기도|경기|수도권/g, '')
    .replace(/[^가-힣a-z0-9]/gi, '')
    .toLowerCase()
    .trim();
}

function isDuplicate(newNorm, existingNormSet) {
  if (!newNorm || newNorm.length < 4) return false;
  for (const existing of existingNormSet) {
    if (!existing || existing.length < 4) continue;
    if (newNorm === existing) return true;
    if (newNorm.includes(existing) || existing.includes(newNorm)) return true;
    const shorter = newNorm.length < existing.length ? newNorm : existing;
    const minLen = Math.min(10, shorter.length);
    if (minLen >= 4 && newNorm.slice(0, minLen) === existing.slice(0, minLen)) return true;
  }
  return false;
}

// ─── 폴더에서 포스트 제목 목록 읽기 ─────────────────────────────────────────
function readPostTitlesFromDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const originalTitleMatch = content.match(/originalTitle:\s*["']?(.+?)["']?\s*$/m);
      const originalTitle = originalTitleMatch ? originalTitleMatch[1].trim() : null;
      let title = originalTitle;
      if (!title) {
        const titleMatch = content.match(/title:\s*"(.*)"/) || content.match(/title:\s*(.*)\r?\n/);
        title = titleMatch ? titleMatch[1].replace(/"/g, '').trim() : null;
      }
      return { title, originalTitle, filename: file.replace('.md', '') };
    })
    .filter(p => p.title);
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
    const postsDir  = path.join(process.cwd(), 'src/content/posts');
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
    console.log(
      `[중복 스캔] posts:${readPostTitlesFromDir(postsDir).length} ` +
      `drafts:${readPostTitlesFromDir(draftsDir).length} ` +
      `review:${readPostTitlesFromDir(reviewDir).length} (합계 ${allExistingPosts.length}건)`
    );

    const alreadyPostedNorm = new Set();
    allExistingPosts.forEach(p => {
      if (p.title) alreadyPostedNorm.add(normTitle(p.title));
      if (p.originalTitle) alreadyPostedNorm.add(normTitle(p.originalTitle));
    });

    // 내부 링크 후보: 발행된 posts 폴더만 사용
    const publishedPosts = readPostTitlesFromDir(postsDir);
    publishedPosts.sort((a, b) => b.filename.localeCompare(a.filename));
    const recentPostsForLinking = publishedPosts.slice(0, 30)
      .map(p => `- [${p.title}](/blog/${p.filename})`)
      .join('\n');
    // ──────────────────────────────────────────────────────────────────────

    const unpostedItems = allItems.filter(item => {
      const normItem = normTitle(item.title);
      if (isDuplicate(normItem, alreadyPostedNorm)) {
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

    // ─── 핫 키워드 반영 스코어링으로 최종 선정 ────────────────────────────
    const scoredItems = unpostedItems
      .map(item => ({ item, score: calcScore(item, postType, hotKeywords) }))
      .sort((a, b) => b.score - a.score);

    const topCandidates = scoredItems.slice(0, 3);
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const targetItem = selected.item;

    console.log(`[블로그] 핫 키워드 반영 TOP3:`);
    topCandidates.forEach((c, i) => console.log(`  ${i + 1}위 (${c.score}점): ${c.item.title}`));
    console.log(`[블로그] 최종 선정 (${selected.score}점): ${targetItem.title}`);
    // ──────────────────────────────────────────────────────────────────────

    if (!targetItem.image || targetItem.image.includes('default.png')) {
      const guideFallbacks = fallbacks.GUIDE;
      targetItem.image = guideFallbacks[Math.floor(Math.random() * guideFallbacks.length)];
      console.log(`[보정] 이미지 누락 데이터에 스톡 이미지를 할당했습니다: ${targetItem.image}`);
    }

    console.log(`발행 대상 발견: ${targetItem.title}`);

    // ─── 쿠팡 파트너스 제휴 상품 검색 ────────────────────────────────────
    const coupangKeyword = extractCoupangKeyword(targetItem.title);
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

이 글은 ${postType === 'festival' ? '축제/행사 정보' : '지원금/혜택 정보'} 블로그 포스트입니다.
당신은 수도권 생활 정보 큐레이션 서비스 '수도권 팁픽(Tip-Pick)'의 전문 에디터이자 SEO 전문가입니다.
아래 공공서비스 정보를 바탕으로 구글/네이버 검색 상위 노출이 가능한 프리미엄 블로그 글을 작성해줘.

정보: ${JSON.stringify(targetItem)}

오늘의 핫 키워드: ${hotKeywords.slice(0, 5).join(', ')}

[타겟 및 톤앤매너]
${postType === 'festival'
              ? '- 타겟: 전 연령층\n- 말투: 밝고 경쾌하게\n- 주제: 나들이, 즐거움'
              : '- 타겟: 40~60대 중장년층\n- 말투: 신뢰감 있고 따뜻하게\n- 주제: 경제적 이득, 생활 안정'}

[SEO 핵심 원칙 - 반드시 지킬 것]
1. 핵심 키워드는 제목 1회, 본문 첫 문단 1회, 소제목 1회 이내로만 사용. 절대 반복 금지.
2. 같은 키워드를 3회 이상 반복하면 구글 스팸 필터에 걸림. 동의어와 자연스러운 표현으로 대체할 것.
3. 오늘의 핫 키워드는 제목과 본문에 딱 1~2회만 자연스럽게 녹일 것. 억지로 끼워넣지 말 것.
4. LSI 키워드(연관 키워드) 전략: 핵심 키워드 대신 연관된 다양한 표현을 사용할 것.
   - 예: '지원금' 대신 '혜택', '보조금', '신청', '받을 수 있는' 등으로 자연스럽게 분산
5. 메타 디스크립션(summary)은 핵심 키워드 1회 포함, 클릭을 유도하는 문장으로 150자 이내.
6. 제목은 검색자가 실제로 입력할 법한 구체적 표현 사용. (지역명 + 대상 + 핵심혜택 조합)

[수도권 지역 필터 - 반드시 확인]
- 서울, 인천, 경기 중 하나 이상 관련된 내용이어야 함
- 타 지역(부산, 대구, 경남 등) 정보가 주제면 → 수도권 거주자에게 적용 가능한 유사 혜택으로 내용 전환할 것
- 지역 언급이 없으면 → '수도권' 또는 '전국' 기준으로 작성할 것

[핵심 금지 사항 - 반드시 지킬 것]
1. 도입부 고정 인사말 금지. ("안녕하세요, 팁픽 에디터입니다" 등)
2. 마무리 고정 문구 금지. ("팁픽은 앞으로도..." 등)
3. 폴백 텍스트 금지. ("지원금별로 필요한 서류가 다를 수 있습니다" 같은 의미없는 문장)
4. Raw 데이터 그대로 사용 금지. ("직접입력", "해당없음" 등 공공데이터 원본값)
5. 키워드 남발 절대 금지. 같은 단어가 3회 이상 나오면 무조건 다른 표현으로 교체.
6. 외부 채널 홍보 문구 금지. (유튜브, 타 플랫폼 유도 등)
7. 구조 반복 금지. 매번 다른 방식으로 구성할 것. (표→체크리스트→스토리텔링→인포그래픽형 등 순환)

[콘텐츠 품질 기준 - E-E-A-T 충족]
구글의 E-E-A-T(경험·전문성·권위·신뢰) 기준을 충족하는 글을 작성할 것.
1. Experience(경험): 실제 방문하거나 신청해본 것처럼 구체적인 경험 묘사 포함
   - 축제: "현장에서 가장 붐비는 구간은...", "실제로 주차하기 어려운 이유는..."
   - 지원금: "신청 과정에서 많은 분들이 놓치는 부분은...", "실제 수령까지 걸리는 시간은..."
2. Expertise(전문성): 단순 정보 나열이 아닌 분석과 해석 포함
   - "이 지원금이 다른 혜택과 다른 점은...", "올해 달라진 부분은..."
3. Authoritativeness(권위): 공식 출처 명시, 정확한 수치 사용
4. Trustworthiness(신뢰): 주의사항, 함정, 놓치기 쉬운 포인트 명시

[필수 포함 요소]
- 에디터 인사이트: 공식 데이터에 없는 독창적 꿀팁 2~3문장 (재탕 금지)
  ${postType === 'festival'
              ? '축제: 인생샷 스팟, 최적 방문 시간대, 주차 현실, 준비물'
              : '지원금: 이 혜택만의 특이점, 놓치기 쉬운 함정, 실제 수령 팁'}
- 핵심 수치(금액, 날짜, 조건)는 **굵게** 강조
- 표(Table) 1개 이상 필수 포함
- 불렛포인트와 표를 적절히 혼합 (한 가지만 쓰지 말 것)
- 분량: 공백 제외 **1,500자 이상** (기존 800자에서 상향)

${coupangPromptSection}[하단 연결 섹션 - 반드시 포함]
${postType === 'festival'
              ? '### 🚀 이번 주말 또 다른 가볼만한 곳\n이번 주말, 여기 말고도 재밌는 축제가 더 궁금하다면 팁픽의 다른 글도 확인해보세요!'
              : ''}

### 🔗 함께 보시면 도움되는 추천 정보
현재 작성 중인 글과 지역이나 주제가 가장 유사한 기존 포스팅을 아래 목록에서 2개 선별하여 자연스러운 추천 텍스트와 함께 연결할 것.
연결 방식: [포스트 제목](/blog/파일명) 마크다운 링크 유지.
(후보 목록:
${recentPostsForLinking}
)

[마무리 브랜드 문구 - 반드시 포함]
글 맨 마지막 줄:
"매일 아침, 일상을 풍요롭게 만드는 정보를 엄선하여 배달합니다."

${coupangDisclosureSection}아래 형식으로만 출력. YAML Frontmatter 포함. 다른 설명 제외.
반드시 응답 맨 마지막 줄에 'FILENAME: YYYY-MM-DD-영문키워드' 형식으로 파일명 출력.
---
title: (SEO 최적화된 구체적 제목 — 지역명+대상+핵심혜택 조합)
originalTitle: ${targetItem.title}
link: ${targetItem.link || ''}
officialTarget: ${targetItem.target || '정보 없음'}
officialDetails: ${targetItem.details || targetItem.description || '정보 없음'}
officialDeadline: ${targetItem.deadline || targetItem.date || '상시'}
date: ${today}
summary: (구글 검색 결과에 그대로 노출되는 설명. 구체적 날짜나 금액 수치 반드시 포함. 형식: 언제/어디서 + 무엇을 + 얼마나 + 지금 확인하세요 순서. 반드시 ~하세요 또는 ~챙기세요로 끝낼 것. 100자 이내.)
description: (summary와 동일한 내용으로 작성)
category: ${postType === 'festival' ? 'festival' : 'benefit'}
image: ${targetItem.image || ''}
ogImage: ""
tags: [연관키워드1, 연관키워드2, 연관키워드3, 연관키워드4, 연관키워드5]
officialRequirements: ${JSON.stringify(targetItem.requirements || [])}
officialHowToApply: ${JSON.stringify(targetItem.howToApply || [])}
officialEligibilityQuiz: ${JSON.stringify(targetItem.eligibilityQuiz || [])}
officialTip: ${targetItem.tip || ''}
---

(본문 시작 — 도입부는 매번 다른 방식으로. E-E-A-T 기준 충족. 1,500자 이상.)

---
FILENAME: YYYY-MM-DD-영문키워드`
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
      const fallbackId = targetItem.id || `${postType}-${Date.now()}`;
      filename = `${today}-${postType}-${fallbackId}.md`;
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

    // 표 행에서 셀 내용이 500자 이상인 행 전체 제거
    mdContent = mdContent.replace(/^\|[^\n]{500,}\|$/gm, '');

    // 연속된 빈 줄 정리 (3줄 이상 → 2줄로)
    mdContent = mdContent.replace(/\n{3,}/g, '\n\n');

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

    const finalPath = path.join(reviewDir, filename);
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
