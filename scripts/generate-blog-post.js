const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fallbacks = require('../src/lib/image-fallbacks.json');
const matter = require('gray-matter');
const { isFestivalExpired } = require('./lib/festival-date');
const { calcScore } = require('./lib/festival-score');
const { selectFestivalBundle } = require('./lib/festival-bundle');

// ─── 핫키워드: scripts/lib/hot-keywords.js(SSOT)로 추출(Phase 3a-2). 반환 { keywords, source }. ───
// SEASONAL_KEYWORDS·DataLab 호출·병합 산식 일체를 보고서와 공유(드리프트 해소).
const { getTodayHotKeywords } = require('./lib/hot-keywords');
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

// ─── 후보 점수: scripts/lib/festival-score.js로 추출(Phase 2a) ────────────────
// calcScore(item, postType, hotKeywords, today)는 import. festival 시작일 파싱은 festival-date SSOT 사용.

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
// bundleMode: 축제 '시기 묶음' 글 전용. 묶음 글은 제목이 매주 고정 라벨('주말 수도권 가족축제')+주차라
//   의도적으로 서로 유사하다 — 제목 유사도 검사(rule2 포함·rule3 앞10자·rule4 Jaccard·rule5 program)는
//   1:1 글 전용이라 묶음엔 부적합(둘째 주부터 오차단). 묶음 중복방지는 sourceIds 직전제외(셀렉터)가
//   담당하므로(플레이북 §1), 묶음 모드에선 rule1(normTitle 완전일치)만 '같은 주 중복발행' 안전망으로
//   유지하고 rule2~5는 전부 건너뛴다. 1:1 글·benefit 경로(bundleMode=false)는 rule1~5 전부 수행(현행).
function isDuplicate(newNorm, newKeywords, newPrograms, existingPosts, bundleMode = false) {
  if (!newNorm || newNorm.length < 4) return false;
  for (const existing of existingPosts) {
    const existNorm = existing.norm;
    if (!existNorm || existNorm.length < 4) continue;
    // 1. 정규화 제목 완전 일치 (묶음·1:1 공통 — 같은 주 중복발행 안전망)
    if (newNorm === existNorm) return true;
    // ↓ rule2~5는 제목 유사도 기반 = 1:1 전용. 묶음(bundleMode)은 의도적 유사라 면제.
    if (bundleMode) continue;
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

// ─── §4-15 Phase 3a: 시기 묶음 보조 ──────────────────────────────────────────
// 시기 제목 라벨: "M월 W주 주말 수도권 가족축제" (W = 그 달 몇째 주, 1일~7일=1주).
function seasonalBundleTitle(d) {
  const month = d.getMonth() + 1;
  const week = Math.ceil(d.getDate() / 7);
  return `${month}월 ${week}주 주말 수도권 가족축제`;
}

// 직전 festival 글의 sourceIds 읽기(재탕 방지). posts에서 category=festival인 .md 중
// 파일명 날짜(YYYY-MM-DD) 최신 1편을 골라 frontmatter.sourceIds를 반환. 없으면 ids:[].
function readLatestFestivalSourceIds(dir) {
  if (!fs.existsSync(dir)) return { ids: [], file: null };
  const fest = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    try {
      const data = matter(fs.readFileSync(path.join(dir, f), 'utf8')).data || {};
      if (data.category === 'festival' || data.category === 'festivals') fest.push({ file: f, data });
    } catch (_) { /* 깨진 글 1개가 전체 막지 않게 */ }
  }
  if (!fest.length) return { ids: [], file: null };
  fest.sort((a, b) => b.file.localeCompare(a.file)); // 파일명 'YYYY-MM-DD…' 사전순 = 시간순
  const latest = fest[0];
  const ids = Array.isArray(latest.data.sourceIds) ? latest.data.sourceIds.map(String) : [];
  return { ids, file: latest.file };
}

async function main() {
  const DRY_RUN = process.env.DRY_RUN === 'true';
  const BUNDLE_DRY = process.env.BUNDLE_DRY === 'true';
  // (Phase 3a-3) PREVIEW_DIR 설정 시: 실제 Gemini 생성하되 posts 대신 이 경로에 쓰고 종료(라이브 발행 0).
  const previewDir = process.env.PREVIEW_DIR ? path.resolve(process.cwd(), process.env.PREVIEW_DIR) : null;
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

    // ─── 오늘의 핫 키워드 수집 (lib SSOT — DataLab TOP2 + 계절 키워드 병합) ───────────────────────────
    const { keywords: hotKeywords } = await getTodayHotKeywords(postType);
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
    if (previewDir && !fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true });
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

    let targetItems, topThemeName, publishCategory;
    let bundleTitleLabel = null;   // festival 전용: 시기 제목 라벨(후처리에서 title 덮어쓰기)
    let bundleSourceIds = [];      // festival 전용: 묶음 id(후처리에서 sourceIds 주입)

    if (postType === 'festival') {
      // ─── §4-15 Phase 3a: 시기 묶음 셀렉터(발행·보고서 공유 SSOT) ──────────────
      const nowKst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      // 직전 festival 글의 sourceIds 제외(재탕 방지). 직전 글/필드 없으면 제외 0.
      const prev = readLatestFestivalSourceIds(postsDir);
      // allItems(:위 reverse)가 data.festivals를 in-place .reverse() 했으므로, 보고서(원본 파일 순서)와
      // 점수 동점 tie-break까지 동일한 묶음을 내려면 원본 순서를 복원해 셀렉터에 넘긴다.
      const festSource = [...(data.festivals || [])].reverse();
      const pool = festSource.filter(f => !prev.ids.includes(String(f.id)));
      const bundle = selectFestivalBundle(pool, nowKst, hotKeywords);
      bundleTitleLabel = seasonalBundleTitle(nowKst);

      if (BUNDLE_DRY) {
        console.log('\n===== [BUNDLE_DRY] 발행 OFF — 묶음 미리보기(파일·네트워크 0) =====');
        console.log(`① 시기 제목 라벨: ${bundleTitleLabel}`);
        console.log(`② skipped=${bundle.skipped} · eligibleCount=${bundle.eligibleCount}`);
        console.log(`③ 묶일 items (${bundle.items.length}건, calcScore 순):`);
        bundle.items.forEach((c, i) => console.log(`   ${i + 1}. [${c.score}점] ${c.title} (${c.date}) id=${c.id}`));
        console.log(`④ 직전 글(${prev.file || '없음'}) 제외 id: ${prev.ids.length ? prev.ids.join(', ') : '(없음)'}`);
        console.log('================================================================\n');
        return;
      }

      if (bundle.skipped) {
        console.log(`[축제] 시작 임박 ${bundle.eligibleCount}건(<5) → 이번 주 발행 스킵`);
        return;
      }

      targetItems = bundle.items;
      bundleSourceIds = bundle.items.map(t => String(t.id));
      topThemeName = '시기 묶음(이번 주말 수도권 가족 나들이)';
      publishCategory = '축제/행사';

      console.log(`[블로그] 시기 묶음: "${bundleTitleLabel}" (적격 ${bundle.eligibleCount}건 중 상위 ${targetItems.length})`);
      console.log(`[블로그] 선정된 데이터 세트 (총 ${targetItems.length}건):`);
      targetItems.forEach((t, i) => console.log(`  ${i + 1}. [${t.score}점] ${t.title}`));

    } else {
      // ─── benefit: 기존 로직(중복 제외 → 3분할 → 페르소나 그룹핑 → 상위 4) ──────
      const unpostedItems = allItems.filter(item => {
        const normItem = normTitle(item.title);
        const itemKeywords = new Set(extractKeywords(item.title));
        const itemPrograms = extractProgramNames(item.title);
        if (isDuplicate(normItem, itemKeywords, itemPrograms, allExistingPosts)) {
          console.log(`  [중복 스킵] ${item.title}`);
          return false;
        }
        return true;
      });

      if (unpostedItems.length === 0) {
        console.log('모든 데이터가 이미 블로그에 작성되었습니다.');
        return;
      }

      // ─── Step 3: 2분할 카테고리 분기 (주거/임대 지원 · 일반 지원금) ──
      const PUBLISH_THRESHOLD = 3;
      let categoryFilteredItems = unpostedItems;
      publishCategory = '일반 지원금';

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
      topThemeName = sortedGroups[0][0];
      const topThemeGroup = sortedGroups[0][1];

      // 해당 테마 내에서 개별 점수가 높은 순으로 정렬 후 3~4개 추출
      topThemeGroup.items.sort((a, b) => calcScore(b, postType, hotKeywords) - calcScore(a, postType, hotKeywords));
      targetItems = topThemeGroup.items.slice(0, 4);

      console.log(`[블로그] 큐레이션 최우수 테마: "${topThemeName}" (그룹 총점: ${topThemeGroup.score}점)`);
      console.log(`[블로그] 선정된 데이터 세트 (총 ${targetItems.length}건):`);
      targetItems.forEach((t, i) => console.log(`  ${i + 1}. ${t.title}`));
    }
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
아래 제공된 ${targetItems.length}개의 공공서비스 데이터 세트를 바탕으로, 구글/네이버 검색 상위 노출이 가능한 프리미엄 비교/분석 큐레이션 블로그 글을 작성해줘.

선정된 테마(페르소나): ${topThemeName}
정보 데이터 세트(배열): ${JSON.stringify(targetItems, null, 2)}

오늘의 핫 키워드: ${hotKeywords.slice(0, 5).join(', ')}

[타겟 및 톤앤매너]
${publishCategory === '축제/행사'
              ? '- 타겟: 수도권 가족(영유아·초등 자녀 동반) 중심, 연인·나들이객 포함\n- 말투: 밝고 경쾌하게\n- 주제: 이번 주말~다가오는 주에 갈 만한 임박 행사 중심(먼 미래 아님). 지금 당장 계획 가능한 가족 나들이'
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
   - ⚠️ 제공된 ${targetItems.length}개 데이터를 **하나도 빠짐없이 전부** 다뤄라. 상위 일부만 쓰지 말 것. ${targetItems.length}개 각각에 대해 **개별 소개 문단(또는 소제목 블록)을 ${targetItems.length}개** 작성하라.
   - 단순 나열은 금지 — 각 항목이 어떤 점이 좋고, 누가 신청/방문하면 좋을지 서로 **비교·분석**하는 형태로 서술하세요.
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
4. 표(Table) 1개 이상 필수 — 비교표에 제공된 **${targetItems.length}개 데이터 행을 모두 포함**(누락 금지, 행 수 = ${targetItems.length}). 단, 아래 표 작성 규칙을 반드시 지킬 것:
   - 표는 컬럼 3~4개 이내로 제한(6개 이상 금지).
   - 각 셀은 짧은 핵심 어구로만 작성. 긴 쉼표 나열(프로그램 목록·대상 상세 설명 등)은 셀에 넣지 말고, 표 아래 문단이나 불릿(-)으로 풀어 쓸 것.
   - 표에는 반드시 **헤더 행**을 포함하고, 그 아래 구분선(| :--- | :--- |), 그 아래 데이터 행 순서로 작성. 헤더 없이 구분선부터 시작 금지.
   - 어떤 표 행도 한 줄이 과도하게 길지 않게(한 행 500자 근처 금지). 길어지면 셀 내용을 줄이거나 표 밖 문단으로 옮길 것.
   - 표 행 사이에 빈 줄을 넣지 말 것(헤더·구분선·데이터 행은 빈 줄 없이 연속).
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

    // (Phase 3a) 축제 시기 묶음: title을 시기 라벨로 덮고(originalTitle은 보존), sourceIds(묶음 id)를 주입.
    if (postType === 'festival' && bundleTitleLabel) {
      mdContent = mdContent.replace(/^title:.*$/m, `title: "${bundleTitleLabel}"`);
    }
    if (postType === 'festival' && bundleSourceIds.length) {
      const idsLine = `sourceIds: ${JSON.stringify(bundleSourceIds)}`;
      if (/^sourceIds:.*$/m.test(mdContent)) {
        mdContent = mdContent.replace(/^sourceIds:.*$/m, idsLine);
      } else {
        mdContent = mdContent.replace(/^(date:.*)$/m, `$1\n${idsLine}`);
      }
    }

    // Gemini 내부 reasoning 텍스트 제거 (멀티라인 포함)
    mdContent = mdContent.replace(/The user wants[\s\S]*?(?=따뜻한|새로운|봄|이번|서울|경기|인천)/g, '');
    mdContent = mdContent.replace(/Let me break down[\s\S]*?(?=따뜻한|새로운|봄|이번|서울|경기|인천)/g, '');
    mdContent = mdContent.replace(/\*\*1\. YAML[\s\S]*?(?=따뜻한|새로운|봄|이번|서울|경기|인천)/g, '');

    // 표 구분선 대시 폭주 정리: Gemini가 수십~수만 개 대시를 토하는 사고 방지 (연속 대시 40개 이상 → 표준 '---')
    mdContent = mdContent.replace(/-{40,}/g, '---');
    // 표(table) 인식 후처리: 일괄 정규식이 긴 표 행(헤더·데이터)을 통째 삭제해 표가 깨지던 사고 방지.
    //  · 연속된 '|' 행 묶음을 '표 블록'으로 인식 → 표 블록 안의 행은 절대 삭제하지 않고, 과도하게 긴 셀만 잘라 컬럼 수·파이프 구조를 보존.
    //  · 표 블록 '밖'의 런어웨이(garbage) 단일 '|' 행만 기존처럼 제거.
    mdContent = (() => {
      const lines = mdContent.split('\n');
      const isPipe = (l) => /^\s*\|/.test(l || '');
      const isSeparator = (l) => /^\s*\|[\s:|-]+\|\s*$/.test(l || ''); // | :--- | :--- | 형태
      // 표 블록 = 연속된 '|' 시작 행 2줄 이상 (앞 또는 뒤 줄도 '|')
      const inTable = lines.map((l, i) => isPipe(l) && (isPipe(lines[i - 1]) || isPipe(lines[i + 1])));
      const MAX_CELL = 200; // 표 셀 1개 최대 길이 (초과 시 행 삭제가 아니라 셀만 절단)
      const out = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (inTable[i]) {
          // 표 행: 삭제 금지. 구분선은 그대로 두고, 데이터/헤더 행은 셀 단위로 과도하게 긴 셀만 절단.
          if (isSeparator(line) || line.length <= MAX_CELL) {
            out.push(line);
            continue;
          }
          const cells = line.split('|');
          const fixed = cells.map((c) => {
            if (c.trim().length > MAX_CELL) {
              return ' ' + c.trim().slice(0, MAX_CELL).replace(/[,\s]+$/, '') + '… ';
            }
            return c;
          });
          out.push(fixed.join('|')); // 파이프(컬럼) 개수 보존
        } else {
          // 표 밖: 런어웨이 단일 '|' 행만 제거 (기존 동작 유지)
          if (/^\|[^\n]{500,}\|$/.test(line)) continue;  // 500자+ 단일 행
          if (/^\|[^\n|]{200,}$/.test(line)) continue;   // 닫는 파이프 없는 200자+ 단일 셀
          out.push(line);
        }
      }
      return out.join('\n');
    })();

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
    // PREVIEW 모드는 육안 검수용이라 중복 게이트를 우회(충돌해도 강제 출력). 발행(posts) 경로는 그대로 검사.
    if (!previewDir) {
      const finalTitleMatch = mdContent.match(/^title:\s*(.+)$/m);
      if (finalTitleMatch) {
        const finalTitle = finalTitleMatch[1].replace(/^["']|["']$/g, '').trim();
        const finalNorm = normTitle(finalTitle);
        const finalKeywords = new Set(extractKeywords(finalTitle));
        const finalPrograms = extractProgramNames(finalTitle);
        // 축제 묶음(postType==='festival')은 bundleMode — 제목 유사도(rule2~5) 면제, rule1 완전일치만. 중복은 sourceIds가 담당.
        if (isDuplicate(finalNorm, finalKeywords, finalPrograms, allExistingPosts, postType === 'festival')) {
          console.warn(`[중복 차단·생성후] 최종 제목이 기존 글과 중복 → 발행 취소: "${finalTitle}"`);
          return;
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    // (Phase 3a-3) PREVIEW 모드: posts 대신 PREVIEW_DIR에만 쓰고 종료(라이브 발행 0).
    if (previewDir) {
      const previewPath = path.join(previewDir, filename);
      // posts 보호: 출력 경로가 반드시 PREVIEW_DIR 하위인지 단언.
      const rel = path.relative(previewDir, previewPath);
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        throw new Error(`[PREVIEW] 출력 경로가 PREVIEW_DIR 밖이라 중단: ${previewPath}`);
      }
      fs.writeFileSync(previewPath, mdContent, 'utf8');
      console.log(`[PREVIEW] 미리보기 글 작성(posts 미기록): ${path.resolve(previewPath)}`);
      return;
    }

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
