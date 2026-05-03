/**
 * Threads 자동 게시 스크립트
 * 오늘 생성된 축제 글 + 지원금 글 각 1개씩 Threads에 발행
 *
 * 필요 환경변수:
 *   THREADS_ACCESS_TOKEN - Threads Graph API 액세스 토큰
 *   THREADS_USER_ID      - Threads 사용자 ID (숫자)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const THREADS_USER_ID = process.env.THREADS_USER_ID;
const BASE_URL = 'https://tip-pick.com';
const API_BASE = 'https://graph.threads.net/v1.0';

// ─── 토큰 관리 ────────────────────────────────────────────────────────────────
async function getValidToken() {
  const tokenFile = '.threads-token.json';
  let tokenData = {};

  if (fs.existsSync(tokenFile)) {
    tokenData = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
  }

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (!tokenData.longLivedToken || !tokenData.expiresAt ||
      tokenData.expiresAt - now < sevenDays) {

    const currentToken = tokenData.longLivedToken || process.env.THREADS_ACCESS_TOKEN;

    const refreshRes = await fetch(
      `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${currentToken}`
    );
    const refreshData = await refreshRes.json();

    if (refreshData.access_token) {
      tokenData.longLivedToken = refreshData.access_token;
      tokenData.expiresAt = now + refreshData.expires_in * 1000;
      fs.writeFileSync(tokenFile, JSON.stringify(tokenData, null, 2));
      console.log('[Threads] 토큰 갱신 완료, 만료일:', new Date(tokenData.expiresAt).toLocaleDateString());
    } else {
      console.error('[Threads] 토큰 갱신 실패:', refreshData.error);
    }
  }

  return tokenData.longLivedToken || process.env.THREADS_ACCESS_TOKEN;
}

// ─── 오늘 생성된 포스트 읽기 ──────────────────────────────────────────────────
function getTodayPosts() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const today = kst.toISOString().split('T')[0];

  const postsDir = path.join(__dirname, '../src/content/posts');
  const files = fs.readdirSync(postsDir)
    .filter(f => f.startsWith(today) && f.endsWith('.md'));

  console.log(`[Threads] ${today} 포스트 ${files.length}개 탐색 중...`);

  return files.map(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = matter(content);
    const slug = file.replace(/\.md$/, '');
    return { ...data, slug };
  });
}

// ─── 축제/지원금 구분 ─────────────────────────────────────────────────────────
function isFestival(post) {
  const img = (post.image || '').toLowerCase();
  const slug = (post.slug || '').toLowerCase();
  const title = (post.title || '').toLowerCase();
  if (img.includes('/festival-') || img.includes('festival')) return true;
  if (slug.includes('festival') || slug.includes('축제') || slug.includes('행사')) return true;
  if (title.includes('축제') || title.includes('페스티벌') || title.includes('festival')) return true;
  if (post.category === 'festival') return true;
  return false;
}

// ─── 지역명 추출 ──────────────────────────────────────────────────────────────
const REGIONS = ['서울', '인천', '경기', '수도권', '부산', '대구', '광주', '대전', '울산', '제주', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '세종'];

function extractRegion(post) {
  const sources = [
    ...(post.tags || []),
    post.title || '',
    post.officialDetails || '',
  ].join(' ');

  for (const region of REGIONS) {
    if (sources.includes(region)) return region;
  }
  return '수도권';
}

// ─── 축제 핵심 포인트 추출 ────────────────────────────────────────────────────
function extractFestivalPoint(post) {
  const parts = [];

  if (post.officialDeadline && post.officialDeadline !== '상시') {
    parts.push(`📅 ${post.officialDeadline}`);
  }

  if (post.officialDetails) {
    const loc = post.officialDetails.match(/([가-힣]+(구|시|동|로|길|공원|광장|체육관|센터)[가-힣0-9\s]*)/);
    if (loc) parts.push(`📍 ${loc[0].substring(0, 20).trim()}`);
  }

  if (parts.length === 0 && post.summary) {
    const first = post.summary.split(/[.。!?]/)[0].trim();
    if (first) parts.push(first.substring(0, 45));
  }

  return parts.slice(0, 2).join('\n');
}

// ─── 지원금 핵심 포인트 추출 ──────────────────────────────────────────────────
function extractBenefitPoint(post) {
  const parts = [];

  if (post.officialDetails) {
    const amt = post.officialDetails.match(/월?\s*최대?\s*[\d,]+만?원[^,\n]*/);
    if (amt) parts.push(`- ${amt[0].trim().substring(0, 40)}`);
  }

  if (post.officialDeadline) {
    parts.push(`- 마감: ${post.officialDeadline}`);
  }

  if (parts.length < 2 && post.officialTarget) {
    const target = post.officialTarget.substring(0, 30);
    parts.unshift(`- 대상: ${target}`);
  }

  return parts.slice(0, 2).join('\n');
}

// ─── 해시태그 생성 ────────────────────────────────────────────────────────────
function buildHashtags(post, type) {
  const tags = (post.tags || []).map(t => t.replace(/\s+/g, ''));

  if (type === 'festival') {
    const region = extractRegion(post);
    const fixed = [`${region}나들이`, '주말나들이'];
    const extras = tags.filter(t => !fixed.some(f => t.includes(f))).slice(0, 2);
    return [...fixed, ...extras].slice(0, 4).map(t => `#${t}`).join(' ');
  } else {
    const fixed = ['지원금', '혜택정보'];
    const extras = tags.filter(t => !fixed.some(f => t.includes(f))).slice(0, 2);
    return [...fixed, ...extras].slice(0, 4).map(t => `#${t}`).join(' ');
  }
}

// ─── 메시지 포맷 ─────────────────────────────────────────────────────────────
function formatFestival(post) {
  const url = `${BASE_URL}/blog/${post.slug}`;
  const point = extractFestivalPoint(post);
  const hashtags = buildHashtags(post, 'festival');

  return `이번 주말 갈 곳 고민 중이라면?

${post.title} 놓치면 진짜 후회함
${point}
→ ${url}

${hashtags}`;
}

function formatBenefit(post) {
  const url = `${BASE_URL}/blog/${post.slug}`;
  const target = (post.officialTarget || '').replace(/\n/g, ' ').substring(0, 25) || '이 조건 해당되면';
  const point = extractBenefitPoint(post);
  const hashtags = buildHashtags(post, 'benefit');

  return `${target} 이거 신청 안 하면 진짜 손해임

${post.title}
${point}
몰라서 못 받는 사람 너무 많음
→ ${url}

${hashtags}`;
}

// ─── 이미지 URL 인코딩 (한글 파일명 대응) ────────────────────────────────────
function encodeImageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.pathname = u.pathname
      .split('/')
      .map(seg => encodeURIComponent(decodeURIComponent(seg)))
      .join('/');
    return u.toString();
  } catch {
    return url;
  }
}

// ─── Threads API ──────────────────────────────────────────────────────────────
async function createContainer(text, accessToken, imageUrl = null) {
  const params = new URLSearchParams({
    media_type: imageUrl ? 'IMAGE' : 'TEXT',
    text,
    access_token: accessToken,
  });

  if (imageUrl) params.append('image_url', imageUrl);

  const res = await fetch(`${API_BASE}/${THREADS_USER_ID}/threads?${params}`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`컨테이너 생성 실패 ${res.status}: ${JSON.stringify(data)}`);
  return data.id;
}

async function publishContainer(creationId, accessToken) {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const res = await fetch(`${API_BASE}/${THREADS_USER_ID}/threads_publish?${params}`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`발행 실패 ${res.status}: ${JSON.stringify(data)}`);
  return data.id;
}

async function postToThreads(text, label, accessToken, imageUrl = null) {
  console.log(`\n[Threads] ── ${label} ──────────────────────`);
  console.log(text);
  console.log('──────────────────────────────────────────');

  const encodedImageUrl = encodeImageUrl(imageUrl);
  const MAX_RETRY = 3;

  if (encodedImageUrl) {
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        const containerId = await createContainer(text, accessToken, encodedImageUrl);
        console.log(`[Threads] 컨테이너 생성: ${containerId}`);
        await new Promise(r => setTimeout(r, 3000));
        const postId = await publishContainer(containerId, accessToken);
        console.log(`[Threads] ✅ 발행 완료 (post ID: ${postId})`);
        return postId;
      } catch (err) {
        if (attempt < MAX_RETRY) {
          console.warn(`[Threads] ⚠️ ${attempt}차 실패, 30초 후 재시도... (${err.message})`);
          await new Promise(r => setTimeout(r, 30000));
        } else {
          console.warn(`[Threads] ⚠️ 이미지 포함 발행 최종 실패 → 텍스트 전용으로 재시도`);
        }
      }
    }
  }

  try {
    const containerId = await createContainer(text, accessToken, null);
    console.log(`[Threads] 컨테이너 생성 (텍스트 전용): ${containerId}`);
    await new Promise(r => setTimeout(r, 3000));
    const postId = await publishContainer(containerId, accessToken);
    console.log(`[Threads] ✅ 발행 완료 — 텍스트 전용 (post ID: ${postId})`);
    return postId;
  } catch (err) {
    throw err;
  }
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.THREADS_ACCESS_TOKEN) {
    console.error('[Threads] THREADS_ACCESS_TOKEN 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }
  if (!THREADS_USER_ID) {
    console.error('[Threads] THREADS_USER_ID 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const accessToken = await getValidToken();

  const posts = getTodayPosts();
  if (posts.length === 0) {
    console.log('[Threads] 오늘 발행된 포스트가 없습니다. 스킵.');
    return;
  }

  const festivalPost = posts.find(p => isFestival(p));
  const benefitPost = posts.find(p => !isFestival(p));
  let successCount = 0;

  if (festivalPost) {
    try {
      const festImageUrl = festivalPost.image?.startsWith('http')
        ? festivalPost.image
        : festivalPost.image ? `https://tip-pick.com${festivalPost.image}` : null;
      await postToThreads(formatFestival(festivalPost), '축제 게시물', accessToken, festImageUrl);
      successCount++;
    } catch (err) {
      console.error(`[Threads] ❌ 축제 발행 실패: ${err.message}`);
    }
  } else {
    console.log('[Threads] 오늘 축제 포스트 없음 — 스킵');
  }

  if (festivalPost && benefitPost) {
    await new Promise(r => setTimeout(r, 5000));
  }

  if (benefitPost) {
    try {
      const benefitImageUrl = benefitPost.image?.startsWith('http')
        ? benefitPost.image
        : benefitPost.image ? `https://tip-pick.com${benefitPost.image}` : null;
      await postToThreads(formatBenefit(benefitPost), '지원금 게시물', accessToken, benefitImageUrl);
      successCount++;
    } catch (err) {
      console.error(`[Threads] ❌ 지원금 발행 실패: ${err.message}`);
    }
  } else {
    console.log('[Threads] 오늘 지원금 포스트 없음 — 스킵');
  }

  console.log(`\n[Threads] 완료: ${successCount}개 발행`);
}

main().catch(err => {
  console.error('[Threads] 예상치 못한 오류:', err.message);
  process.exit(1);
});
