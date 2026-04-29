/**
 * 카카오 채널 소식 자동 발행 스크립트
 * 오늘 생성된 축제 글 + 지원금 글 각 1개씩 발행
 *
 * 필요 환경변수:
 *   KAKAO_REST_API_KEY - 카카오 개발자 콘솔 REST API 키
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const CHANNEL_PUBLIC_ID = '_nxjSjX';
const BASE_URL = 'https://tip-pick.com';

// ─── 오늘 생성된 포스트 읽기 ──────────────────────────────────────────────────
function getTodayPosts() {
  // KST 기준 오늘 날짜
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const today = kst.toISOString().split('T')[0];

  const postsDir = path.join(__dirname, '../src/content/posts');
  const files = fs.readdirSync(postsDir)
    .filter(f => f.startsWith(today) && f.endsWith('.md'));

  console.log(`[카카오] ${today} 포스트 ${files.length}개 탐색 중...`);

  return files.map(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = matter(content);
    const slug = file.replace(/\.md$/, '');
    return { ...data, slug, _filename: file };
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

// ─── 핵심 bullet 추출 ────────────────────────────────────────────────────────
function extractBullets(post, type) {
  const bullets = [];

  if (type === 'festival') {
    // 기간
    if (post.officialDeadline && post.officialDeadline !== '상시') {
      bullets.push(`• 기간: ${post.officialDeadline}`);
    }
    // 장소 (officialDetails에서 추출)
    if (post.officialDetails) {
      const locMatch = post.officialDetails.match(/([가-힣]+(구|시|동|로|길|공원|광장)[가-힣0-9\s]*)/);
      if (locMatch) bullets.push(`• 장소: ${locMatch[0].substring(0, 30)}`);
    }
    // 대상
    if (post.officialTarget && post.officialTarget !== '정보 없음') {
      bullets.push(`• 대상: ${post.officialTarget.substring(0, 25)}`);
    }
  } else {
    // 대상
    if (post.officialTarget && post.officialTarget !== '정보 없음') {
      bullets.push(`• 대상: ${post.officialTarget.substring(0, 35)}`);
    }
    // 금액 (officialDetails에서 숫자+원 패턴 추출)
    if (post.officialDetails) {
      const amtMatch = post.officialDetails.match(/월?\s*최대?\s*[\d,]+만?원/);
      if (amtMatch) bullets.push(`• 금액: ${amtMatch[0]}`);
    }
    // 마감
    if (post.officialDeadline) {
      bullets.push(`• 마감: ${post.officialDeadline}`);
    }
  }

  // bullet 부족하면 summary에서 보충
  if (bullets.length < 3 && post.summary) {
    const parts = post.summary.split(/[,。.!?]/).map(s => s.trim()).filter(s => s.length > 5);
    for (const part of parts) {
      if (bullets.length >= 3) break;
      const candidate = `• ${part.substring(0, 40)}`;
      if (!bullets.includes(candidate)) bullets.push(candidate);
    }
  }

  return bullets.slice(0, 3);
}

// ─── 메시지 포맷 ─────────────────────────────────────────────────────────────
function formatFestival(post) {
  const url = `${BASE_URL}/blog/${post.slug}`;
  const tags = (post.tags || []).slice(0, 3).map(t => `#${t}`).join(' ');
  const bullets = extractBullets(post, 'festival');

  return `📍 ${post.title}

${bullets.join('\n')}

👉 전체 정보 보러가기
${url}

${tags}`;
}

function formatBenefit(post) {
  const url = `${BASE_URL}/blog/${post.slug}`;
  const tags = (post.tags || []).slice(0, 3).map(t => `#${t}`).join(' ');
  const bullets = extractBullets(post, 'benefit');

  return `💰 ${post.title}

${bullets.join('\n')}

👉 신청방법 확인하기
${url}

${tags}`;
}

// ─── 카카오 채널 소식 발행 API ───────────────────────────────────────────────
async function sendKakaoChannelMessage(message) {
  const params = new URLSearchParams({
    channel_public_id: CHANNEL_PUBLIC_ID,
    message: message,
  });

  const response = await fetch('https://kapi.kakao.com/v1/channel', {
    method: 'POST',
    headers: {
      'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const text = await response.text();
  let result;
  try { result = JSON.parse(text); } catch { result = { raw: text }; }

  if (!response.ok) {
    throw new Error(`Kakao API ${response.status}: ${JSON.stringify(result)}`);
  }

  console.log('[카카오] 응답:', JSON.stringify(result));
  return result;
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!KAKAO_REST_API_KEY) {
    console.error('[카카오] KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const posts = getTodayPosts();

  if (posts.length === 0) {
    console.log('[카카오] 오늘 발행된 포스트가 없습니다. 스킵.');
    return;
  }

  const festivalPost = posts.find(p => isFestival(p));
  const benefitPost = posts.find(p => !isFestival(p));

  let successCount = 0;

  if (festivalPost) {
    const msg = formatFestival(festivalPost);
    console.log('\n[카카오] ── 축제 메시지 ──────────────────────');
    console.log(msg);
    console.log('──────────────────────────────────────────');
    try {
      await sendKakaoChannelMessage(msg);
      console.log(`[카카오] ✅ 축제 소식 발행 완료: ${festivalPost.slug}`);
      successCount++;
    } catch (err) {
      console.error(`[카카오] ❌ 축제 소식 발행 실패: ${err.message}`);
    }
  } else {
    console.log('[카카오] 오늘 축제 포스트 없음 — 스킵');
  }

  // 연속 발행 시 딜레이
  if (festivalPost && benefitPost) {
    await new Promise(r => setTimeout(r, 2000));
  }

  if (benefitPost) {
    const msg = formatBenefit(benefitPost);
    console.log('\n[카카오] ── 지원금 메시지 ────────────────────');
    console.log(msg);
    console.log('──────────────────────────────────────────');
    try {
      await sendKakaoChannelMessage(msg);
      console.log(`[카카오] ✅ 지원금 소식 발행 완료: ${benefitPost.slug}`);
      successCount++;
    } catch (err) {
      console.error(`[카카오] ❌ 지원금 소식 발행 실패: ${err.message}`);
    }
  } else {
    console.log('[카카오] 오늘 지원금 포스트 없음 — 스킵');
  }

  console.log(`\n[카카오] 완료: ${successCount}개 발행`);
}

main().catch(err => {
  console.error('[카카오] 예상치 못한 오류:', err.message);
  process.exit(1);
});
