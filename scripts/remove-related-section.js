const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const PROTECTED_KEYWORDS = ['쿠팡', '파트너스', '👉', '🛒', 'iryan', 'coupang', '라쿠텐', '수수료'];

function isProtected(sectionText) {
  return PROTECTED_KEYWORDS.some(kw => sectionText.includes(kw));
}

function isLinkOnlySection(sectionBody) {
  const lines = sectionBody.split('\n').map(l => l.trim()).filter(l => l !== '');
  if (lines.length === 0) return false;
  if (lines.length > 8) return false;
  return lines.every(line =>
    // - [제목](링크)
    line.match(/^[-*]\s*\[.+\]\(.+\)/) ||
    // - **[제목](링크)** — 설명
    line.match(/^[-*]\s*\*{0,2}\[.+\]\(.+\)\*{0,2}/)
  );
}

let count = 0;
files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  const parts = content.split(/(?=\n## )/);
  const filtered = parts.filter(part => {
    const trimmed = part.trim();
    if (!trimmed.startsWith('## ')) return true;
    if (isProtected(part)) return true;

    const bodyStart = part.indexOf('\n', part.indexOf('## '));
    const body = bodyStart !== -1 ? part.slice(bodyStart) : '';

    if (isLinkOnlySection(body)) {
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
