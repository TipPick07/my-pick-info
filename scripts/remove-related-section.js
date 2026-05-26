const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = [
  '2026-04-15-small-business-pension-support.md',
  '2026-04-20-disability-pension-additional-support.md',
  '2026-04-28-seoul-childcare-support.md',
  '2026-04-29-seoul-selfemployed-paternity-leave-support.md',
  '2026-04-30-youth-rent-support.md',
];

const PROTECTED_KEYWORDS = ['쿠팡', '파트너스', '👉', '🛒', 'iryan', 'coupang', '라쿠텐', '수수료'];

let count = 0;
files.forEach(file => {
  const filePath = path.join(postsDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // ## 와 ### 모두 섹션 단위로 분리
  const parts = content.split(/(?=\n#{2,3} )/);
  const filtered = parts.filter(part => {
    const trimmed = part.trim();
    if (!trimmed.match(/^#{2,3} /)) return true;
    if (PROTECTED_KEYWORDS.some(kw => part.includes(kw))) return true;
    if (part.includes('매일 아침') || part.includes('풍요롭게') || part.includes('함께 보시면')) {
      console.log(`  🗑 제거: [${file}] ${trimmed.split('\n')[0].slice(0, 60)}`);
      return false;
    }
    return true;
  });

  content = filtered.join('').trimEnd() + '\n';

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}`);
    count++;
  }
});

console.log(`\n총 ${count}개 파일 처리 완료`);
