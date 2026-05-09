const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../public/data/pick-info.json');
const PUBLIC_DIR = path.join(__dirname, '../public');
const BLOGS_DIR = path.join(PUBLIC_DIR, 'images/blogs');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function detectFallbacks() {
  const files = fs.readdirSync(BLOGS_DIR);
  const festival = files
    .filter(f => f.startsWith('fallback-festival') && f.endsWith('.png'))
    .map(f => `/images/blogs/${f}`);
  if (festival.length > 0) return festival;

  const welfare = files
    .filter(f => f.startsWith('korea-welfare-benefit') && f.endsWith('.png'))
    .map(f => `/images/blogs/${f}`);
  return welfare;
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const festivals = data.festivals;

  const fallbacks = detectFallbacks();
  if (fallbacks.length === 0) {
    console.error('fallback 이미지를 찾을 수 없습니다. 종료합니다.');
    process.exit(1);
  }
  console.log(`fallback 이미지 ${fallbacks.length}개 감지: ${fallbacks[0]} 외`);

  const targets = festivals
    .map((f, i) => ({ fest: f, idx: i }))
    .filter(({ fest }) => !fest.image || fest.image.startsWith('http'));

  console.log(`\n확인 대상: ${targets.length}건 (외부 URL or 비어있음)\n`);

  let fixedCount = 0;
  let fbIdx = 0;

  for (let i = 0; i < targets.length; i++) {
    const { fest, idx } = targets[i];
    const url = fest.image || '';

    if (!url) {
      const fallback = fallbacks[fbIdx++ % fallbacks.length];
      console.log(`[${i + 1}/${targets.length}] ✗ 이미지 없음 → ${fallback}`);
      data.festivals[idx].image = fallback;
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
      fixedCount++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${targets.length}] ${url.slice(0, 60)}... 확인 중`);
    const ok = await checkUrl(url);

    if (ok) {
      console.log(' ✓ 정상');
    } else {
      const fallback = fallbacks[fbIdx++ % fallbacks.length];
      console.log(` ✗ 깨짐 → ${fallback}`);
      data.festivals[idx].image = fallback;
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
      fixedCount++;
    }

    if (i < targets.length - 1) await sleep(500);
  }

  console.log(`\n완료: ${fixedCount}건 교체 / ${targets.length - fixedCount}건 정상`);
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
