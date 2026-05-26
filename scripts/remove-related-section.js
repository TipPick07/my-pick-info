const fs = require('fs');
const path = require('path');
const postsDir = path.join(process.cwd(), 'src/content/posts');

const targets = [
  // 파일명: 삭제할 섹션 키워드
  { file: '2026-05-16-gyeonggi-education-care-voucher-policy.md', keyword: '선거와 무관하게 지금 당장' },
  { file: '2026-05-18-election-welfare-benefit-preview.md', keyword: '선거와 무관하게 지금 당장' },
  { file: '2026-05-26-early-voting-practical-guide.md', keyword: '투표 인증 혜택도 챙기세요' },
];

// 중장년 파일은 파일명 확인 후 처리
const allFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
const midlifeFile = allFiles.find(f => {
  const content = fs.readFileSync(path.join(postsDir, f), 'utf8');
  return content.includes('중장년 경력지원제') && content.includes('함께 확인하면 좋은 중장년 지원');
});
if (midlifeFile) {
  targets.push({ file: midlifeFile, keyword: '함께 확인하면 좋은 중장년 지원' });
  console.log(`중장년 파일 감지: ${midlifeFile}`);
}

let count = 0;
targets.forEach(({ file, keyword }) => {
  const filePath = path.join(postsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 파일 없음: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // ## 또는 ### 섹션 단위로 분리
  const parts = content.split(/(?=\n#{2,3} )/);
  const filtered = parts.filter(part => {
    if (!part.trim().match(/^#{2,3} /)) return true;
    if (part.includes(keyword)) {
      console.log(`  🗑 제거: [${file}] ${part.trim().split('\n')[0].slice(0, 60)}`);
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
