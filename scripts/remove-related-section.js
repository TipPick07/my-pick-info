const fs = require('fs');
const path = require('path');

const electionDir = path.join(process.cwd(), 'src/content/election');
const files = fs.readdirSync(electionDir).filter(f => f.endsWith('.md'));

const PROTECTED_KEYWORDS = ['쿠팡', '파트너스', '👉', '🛒', 'iryan', 'coupang', '라쿠텐', '수수료'];

let count = 0;
files.forEach(file => {
  const filePath = path.join(electionDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  const parts = content.split(/(?=\n#{2,3} )/);
  const filtered = parts.filter(part => {
    const trimmed = part.trim();
    if (!trimmed.match(/^#{2,3} /)) return true;
    if (PROTECTED_KEYWORDS.some(kw => part.includes(kw))) return true;
    if (
      part.includes('선거와 무관하게') ||
      part.includes('당장 챙겨야') ||
      part.includes('당장 챙길') ||
      part.includes('함께 챙기면') ||
      part.includes('함께 보면 도움') ||
      part.includes('함께 읽으면')
    ) {
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
