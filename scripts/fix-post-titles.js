const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../src/content/posts');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const block = match[1];

  function getField(name) {
    // match quoted: field: "..." or field: '...'
    const quoted = block.match(new RegExp(`^${name}:\\s*["']([\\s\\S]*?)["']\\s*$`, 'm'));
    if (quoted) return quoted[1];
    // match unquoted: field: value
    const unquoted = block.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
    if (unquoted) return unquoted[1].trim();
    return '';
  }

  return {
    title: getField('title'),
    summary: getField('summary'),
    category: getField('category'),
    officialDetails: getField('officialDetails'),
    officialDeadline: getField('officialDeadline'),
  };
}

function replaceFrontmatterField(content, fieldName, newValue) {
  const escaped = newValue.replace(/"/g, '\\"');
  // Replace the entire field line (handles quoted/unquoted, CRLF-safe)
  return content.replace(
    new RegExp(`^${fieldName}:[^\r\n]*`, 'm'),
    `${fieldName}: "${escaped}"`
  );
}

async function callGemini(fields, apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = `아래 블로그 포스트 데이터의 title과 summary를 SEO 최적화 버전으로 개선해줘.

category가 festival이면:
- title: [지역명] + 축제명 + 연도 + 구체적 키워드 (날짜나 무료 등)
- summary: 날짜 + 장소 + 핵심 볼거리 + ~하세요로 끝내기. 100자 이내.

category가 benefit이면:
- title: [지역명] + 지원금명 + 구체적 금액이나 혜택
- summary: 대상자 + 혜택금액 + ~확인하세요로 끝내기. 100자 이내.

원본 데이터:
- title: ${fields.title}
- summary: ${fields.summary}
- category: ${fields.category}
- details: ${fields.officialDetails}
- deadline: ${fields.officialDeadline}

반드시 JSON만 출력. 형식: {"title": "...", "summary": "..."}`;

  let backoff = 10000;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      if (res.status === 503 || res.status === 429) {
        console.log(`  ⚠ Gemini API 과부하 (${res.status}) — ${backoff / 1000}초 후 재시도 (${attempt + 1}/3)`);
        await delay(backoff);
        backoff *= 2;
        continue;
      }

      if (!res.ok) {
        const errBody = await res.text();
        console.log(`  ✗ Gemini API 실패 (${res.status}): ${errBody.substring(0, 200)}`);
        return null;
      }

      const json = await res.json();
      let text = json.candidates[0].content.parts[0].text;
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (err) {
      console.log(`  ✗ 통신 에러 (${attempt + 1}/3): ${err.message}`);
      if (attempt < 2) await delay(backoff);
      backoff *= 2;
    }
  }
  return null;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  console.log(`모델: ${model}`);

  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  const total = files.length;
  console.log(`포스트 파일 총 ${total}개 처리 시작\n`);

  for (let i = 0; i < total; i++) {
    const filename = files[i];
    const filePath = path.join(POSTS_DIR, filename);
    console.log(`[${i + 1}/${total}] ${filename} 처리 중...`);

    let content = fs.readFileSync(filePath, 'utf-8');
    const fields = parseFrontmatter(content);

    if (!fields || !fields.title) {
      console.log(`  - frontmatter 파싱 실패: 건너뜀`);
      if (i < total - 1) await delay(1000);
      continue;
    }

    const result = await callGemini(fields, apiKey, model);
    if (result && result.title && result.summary) {
      content = replaceFrontmatterField(content, 'title', result.title);
      content = replaceFrontmatterField(content, 'summary', result.summary);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ title: ${result.title}`);
    } else {
      console.log(`  - 실패: 원본 유지`);
    }

    if (i < total - 1) await delay(1000);
  }

  console.log(`\n완료! ${total}개 파일 처리됨`);
}

main().catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
