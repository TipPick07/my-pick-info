const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../src/content/posts');

function normTitle(title) {
  return (title || '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/2026|2025/g, '')
    .replace(/[^가-힣a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function isDuplicate(na, nb) {
  if (!na || !nb) return false;
  if (na.includes(nb) || nb.includes(na)) return true;
  if (na.length >= 10 && nb.length >= 10 && na.slice(0, 10) === nb.slice(0, 10)) return true;
  return false;
}

function extractOriginalTitle(content) {
  const m = content.match(/originalTitle:\s*["']?(.+?)["']?\s*$/m);
  if (m) return m[1].trim();
  const m2 = content.match(/title:\s*["']?(.+?)["']?\s*$/m);
  return m2 ? m2[1].trim() : null;
}

function getFileDateStr(filename) {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '0000-00-00';
}

function buildGroups(posts) {
  const groupId = new Array(posts.length).fill(-1);
  let nextGroup = 0;

  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      if (!isDuplicate(posts[i].norm, posts[j].norm)) continue;

      const gi = groupId[i], gj = groupId[j];
      if (gi === -1 && gj === -1) {
        groupId[i] = groupId[j] = nextGroup++;
      } else if (gi === -1) {
        groupId[i] = gj;
      } else if (gj === -1) {
        groupId[j] = gi;
      } else if (gi !== gj) {
        const keep = Math.min(gi, gj), drop = Math.max(gi, gj);
        for (let k = 0; k < posts.length; k++) {
          if (groupId[k] === drop) groupId[k] = keep;
        }
      }
    }
  }

  const groups = new Map();
  for (let i = 0; i < posts.length; i++) {
    const g = groupId[i] === -1 ? `solo-${i}` : `g-${groupId[i]}`;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(posts[i]);
  }
  return groups;
}

function pickWinner(members) {
  return members.slice().sort((a, b) => {
    const bodyDiff = b.bodyLen - a.bodyLen;
    if (bodyDiff !== 0) return bodyDiff;
    return b.dateStr.localeCompare(a.dateStr);
  })[0];
}

function main() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const before = files.length;
  console.log(`\n=== 포스트 중복 제거: 전체 ${before}건 ===\n`);

  const posts = files.map(file => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const origTitle = extractOriginalTitle(content);
    const norm = normTitle(origTitle);
    // body = frontmatter 이후 본문 길이
    const bodyMatch = content.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
    const bodyLen = bodyMatch ? bodyMatch[1].trim().length : 0;
    return { file, origTitle, norm, bodyLen, dateStr: getFileDateStr(file), content };
  });

  const groups = buildGroups(posts);
  const toDelete = [];

  for (const [, members] of groups) {
    if (members.length === 1) continue;

    const winner = pickWinner(members);
    const losers = members.filter(m => m !== winner);

    console.log(`  [그룹 ${members.length}건] 유지: ${winner.file}`);
    for (const l of losers) {
      console.log(`    제거: ${l.file}`);
      toDelete.push(l.file);
    }
  }

  if (toDelete.length === 0) {
    console.log('중복 없음.');
  } else {
    for (const file of toDelete) {
      fs.unlinkSync(path.join(POSTS_DIR, file));
    }
  }

  const after = before - toDelete.length;
  console.log(`\n중복 제거: ${before} → ${after}건 (${toDelete.length}건 삭제)\n`);
}

main();
