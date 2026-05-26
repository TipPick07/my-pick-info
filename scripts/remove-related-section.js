const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const patterns = [
  // "## 🔗 함께 챙기면 좋은 정보" 형태 섹션
  /\n##\s*[^\n]*함께 챙기면 좋은[^\n]*\n[\s\S]*?(?=\n##\s|$)/g,
  // "## 💰 선거와 무관하게 당장 챙겨야 할 지원금" 형태
  /\n##\s*[^\n]*당장 챙겨야 할[^\n]*\n[\s\S]*?(?=\n##\s|$)/g,
  // "## 🔗 함께 보면 도움되는 팁픽 글" 형태
  /\n##\s*[^\n]*함께 보면 도움[^\n]*\n[\s\S]*?(?=\n##\s|$)/g,
  // "## 함께 읽으면 좋은" 형태
  /\n##\s*[^\n]*함께 읽으면 좋은[^\n]*\n[\s\S]*?(?=\n##\s|$)/g,
  // "## 함께 보면 좋은" 형태
  /\n##\s*[^\n]*함께 보면 좋은[^\n]*\n[\s\S]*?(?=\n##\s|$)/g,
];

let count = 0;
files.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  patterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });

  content = content.trimEnd() + '\n';

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}`);
    count++;
  }
});

console.log(`\n총 ${count}개 파일 처리 완료`);
