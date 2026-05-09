const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../public/data/pick-info.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

const FALLBACK_IMAGES = [
  '/images/blogs/fallback-festival-1.png',
  '/images/blogs/fallback-festival-2.png',
  '/images/blogs/fallback-festival-3.png',
  '/images/blogs/fallback-festival-4.png',
  '/images/blogs/fallback-festival-5.png',
];

function normTitle(title) {
  return (title || '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/2026|2025/g, '')
    .replace(/[^가-힣a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function isSameGroup(a, b) {
  const na = normTitle(a.title);
  const nb = normTitle(b.title);
  if (!na || !nb) return false;

  if (na.includes(nb) || nb.includes(na)) return true;

  if (na.length >= 10 && nb.length >= 10 && na.slice(0, 10) === nb.slice(0, 10)) return true;

  if (
    a.location && b.location && a.date && b.date &&
    a.location.trim() === b.location.trim() &&
    a.date.trim() === b.date.trim()
  ) return true;

  return false;
}

function pickWinner(group) {
  return group.slice().sort((a, b) => {
    const aContent = a.content && a.content.trim().length >= 100;
    const bContent = b.content && b.content.trim().length >= 100;
    if (aContent && !bContent) return -1;
    if (!aContent && bContent) return 1;
    return b.title.length - a.title.length;
  })[0];
}

function buildGroups(festivals) {
  const groupId = new Array(festivals.length).fill(-1);
  let nextGroup = 0;

  for (let i = 0; i < festivals.length; i++) {
    for (let j = i + 1; j < festivals.length; j++) {
      if (!isSameGroup(festivals[i], festivals[j])) continue;

      const gi = groupId[i];
      const gj = groupId[j];

      if (gi === -1 && gj === -1) {
        groupId[i] = groupId[j] = nextGroup++;
      } else if (gi === -1) {
        groupId[i] = gj;
      } else if (gj === -1) {
        groupId[j] = gi;
      } else if (gi !== gj) {
        // merge two groups
        const target = Math.min(gi, gj);
        const replace = Math.max(gi, gj);
        for (let k = 0; k < festivals.length; k++) {
          if (groupId[k] === replace) groupId[k] = target;
        }
      }
    }
  }

  const groups = new Map();
  for (let i = 0; i < festivals.length; i++) {
    const g = groupId[i] === -1 ? `solo-${i}` : `g-${groupId[i]}`;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push({ idx: i, fest: festivals[i] });
  }
  return groups;
}

function dedup(festivals) {
  const groups = buildGroups(festivals);
  const kept = [];

  for (const [, members] of groups) {
    if (members.length === 1) {
      kept.push(members[0].fest);
      continue;
    }

    const winner = pickWinner(members.map(m => m.fest));
    kept.push(winner);

    const losers = members.map(m => m.fest).filter(f => f !== winner);
    console.log(`  [그룹 ${members.length}건] 유지: "${winner.title}"`);
    for (const l of losers) console.log(`    제거: "${l.title}"`);
  }

  return kept;
}

function checkImages(festivals) {
  // verify which fallback images actually exist
  const validFallbacks = FALLBACK_IMAGES.filter(f =>
    fs.existsSync(path.join(PUBLIC_DIR, f))
  );
  if (validFallbacks.length === 0) {
    console.warn('  경고: fallback 이미지 파일이 하나도 없습니다. 이미지 보정 건너뜀.');
    return 0;
  }

  let fixed = 0;
  let fallbackIdx = 0;

  for (const fest of festivals) {
    const img = fest.image || '';
    let needsFix = false;

    if (!img) {
      needsFix = true;
    } else if (img.startsWith('/images/blogs/')) {
      const absPath = path.join(PUBLIC_DIR, img);
      if (!fs.existsSync(absPath)) needsFix = true;
    }

    if (needsFix) {
      const assigned = validFallbacks[fallbackIdx % validFallbacks.length];
      console.log(`  이미지 보정: "${fest.title}" → ${assigned}`);
      fest.image = assigned;
      fallbackIdx++;
      fixed++;
    }
  }

  return fixed;
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const before = data.festivals.length;
  console.log(`\n=== 중복 제거 시작: ${before}건 ===\n`);

  const deduped = dedup(data.festivals);
  const afterDedup = deduped.length;
  console.log(`\n중복 제거: ${before} → ${afterDedup}건 (${before - afterDedup}건 제거)\n`);

  console.log('=== 이미지 깨짐 처리 ===\n');
  const fixedImages = checkImages(deduped);
  console.log(`\n이미지 보정: ${fixedImages}건\n`);

  data.festivals = deduped;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log(`=== 저장 완료: ${afterDedup}건 ===`);
}

main();
