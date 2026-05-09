const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../public/data/pick-info.json');

function normTitle(title) {
  return (title || '')
    .replace(/^\[[^\]]+\]\s*/, '')
    .replace(/2026/g, '')
    .replace(/[^가-힣a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const before = data.festivals.length;
  console.log(`중복 제거 전: ${before}건`);

  const kept = [];

  for (const fest of data.festivals) {
    const normA = normTitle(fest.title);
    if (!normA) { kept.push(fest); continue; }

    let isDuplicate = false;
    let replacedIdx = -1;

    for (let i = 0; i < kept.length; i++) {
      const normB = normTitle(kept[i].title);
      if (!normB) continue;

      if (normA.includes(normB) || normB.includes(normA)) {
        isDuplicate = true;

        const aHasContent = !!(fest.content && fest.content.trim().length > 10);
        const bHasContent = !!(kept[i].content && kept[i].content.trim().length > 10);

        if (aHasContent && !bHasContent) {
          replacedIdx = i;
          console.log(`  교체: "${kept[i].title}" → "${fest.title}" (content 우선)`);
        } else if (!aHasContent && bHasContent) {
          console.log(`  제거: "${fest.title}" (기존 content 있는 "${kept[i].title}" 유지)`);
        } else if (fest.title.length > kept[i].title.length) {
          replacedIdx = i;
          console.log(`  교체: "${kept[i].title}" → "${fest.title}" (긴 제목 우선)`);
        } else {
          console.log(`  제거: "${fest.title}" (기존 "${kept[i].title}" 유지)`);
        }
        break;
      }
    }

    if (!isDuplicate) {
      kept.push(fest);
    } else if (replacedIdx !== -1) {
      kept[replacedIdx] = fest;
    }
  }

  data.festivals = kept;
  const after = kept.length;
  console.log(`\n중복 제거 후: ${after}건 (${before - after}건 제거)`);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log('저장 완료');
}

main();
