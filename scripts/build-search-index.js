const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../src/content/posts');
const PICK_INFO_FILE = path.join(__dirname, '../public/data/pick-info.json');
const OUTPUT_FILE = path.join(__dirname, '../public/data/search-index.json');

/**
 * 마크다운 기호를 제거하고 평문으로 변환합니다.
 */
function cleanMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/[#*`_~]/g, '') // 기본 마크다운 기호 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 텍스트만 남기기
    .replace(/\n+/g, ' ') // 줄바꿈을 공백으로 변환
    .replace(/\s+/g, ' ') // 연속된 공백 축소
    .trim();
}

function buildIndex() {
  const index = [];

  // 1. pick-info.json 데이터 처리 (축제 및 혜택)
  if (fs.existsSync(PICK_INFO_FILE)) {
    try {
      const pickInfo = JSON.parse(fs.readFileSync(PICK_INFO_FILE, 'utf8'));
      
      // 축제 데이터
      if (pickInfo.festivals && Array.isArray(pickInfo.festivals)) {
        pickInfo.festivals.forEach(item => {
          index.push({
            id: item.id,
            type: 'festival',
            title: item.title || '',
            summary: item.description ? item.description.slice(0, 100) : '',
            content: cleanMarkdown(item.description),
            link: `/festival/${item.id}`
          });
        });
      }

      // 혜택 데이터
      if (pickInfo.benefits && Array.isArray(pickInfo.benefits)) {
        pickInfo.benefits.forEach(item => {
          index.push({
            id: item.id,
            type: 'benefit',
            title: item.title || '',
            summary: item.summary || item.description || '',
            content: cleanMarkdown(item.description || item.summary),
            link: `/benefit/${item.id}`
          });
        });
      }
    } catch (err) {
      console.error('Error parsing pick-info.json:', err.message);
    }
  } else {
    console.warn('pick-info.json not found at:', PICK_INFO_FILE);
  }

  // 2. 블로그 포스트 데이터 처리
  if (fs.existsSync(POSTS_DIR)) {
    try {
      const files = fs.readdirSync(POSTS_DIR);
      files.filter(f => f.endsWith('.md')).forEach(file => {
        const filePath = path.join(POSTS_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        const plainContent = cleanMarkdown(content);
        const snippet = plainContent.slice(0, 500);

        index.push({
          id: file.replace('.md', ''),
          type: 'blog',
          title: data.title || '',
          summary: data.summary || '',
          content: snippet,
          link: `/blog/${file.replace('.md', '')}`
        });
      });
    } catch (err) {
      console.error('Error processing blog posts:', err.message);
    }
  }

  // 3. 인덱스 파일 저장
  try {
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf8');
    console.log(`Search index built: ${index.length} entries`);
  } catch (err) {
    console.error('Error saving search index:', err.message);
  }
}

buildIndex();
