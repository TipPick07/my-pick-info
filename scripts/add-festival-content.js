const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../public/data/pick-info.json');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function generateContent(fest) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const promptText = `구글 검색으로 아래 축제의 실제 정보를 찾아서 방문자가 유용하게 읽을 수 있는 본문을 마크다운으로 작성해줘.

축제 정보:
- 이름: ${fest.title}
- 날짜: ${fest.date}
- 장소: ${fest.location}
- 설명: ${fest.description}
- 링크: ${fest.link}

작성 규칙:
1. 도입부: 이 축제만의 특징을 생동감 있게 2~3문장. generic 표현 절대 금지.
2. ## 핵심 정보: 날짜/장소/입장료/교통편을 표(table)로 정리. 교통편은 지하철 몇 호선 몇 번 출구까지 구체적으로.
3. ## 이런 분께 추천해요: 가족/연인/혼자 등 구체적 추천 대상과 이유 3가지.
4. ## 방문 꿀팁: 최적 방문 시간대, 주차 현실, 준비물 등 실용적 팁 3가지.
5. 분량: 600자 이상.
6. 반드시 JSON만 출력: {"content": "마크다운 내용"}`;

  const maxRetries = 3;
  let delay = 15000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.8 }
        })
      });

      if (res.status === 503 || res.status === 429) {
        console.warn(`  재시도 ${attempt}/${maxRetries} (HTTP ${res.status}) - ${delay/1000}초 대기`);
        await sleep(delay);
        delay *= 2;
        continue;
      }

      if (!res.ok) {
        console.warn(`  Gemini 오류 HTTP ${res.status}`);
        return null;
      }

      const json = await res.json();
      let text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      return parsed.content || null;
    } catch (err) {
      console.warn(`  오류 (시도 ${attempt}/${maxRetries}): ${err.message}`);
      if (attempt < maxRetries) {
        await sleep(delay);
        delay *= 2;
      }
    }
  }
  return null;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const targets = data.festivals.filter(f => !f.content || f.content.trim() === '');
  const total = targets.length;

  console.log(`content 없는 축제: ${total}건 처리 시작`);

  for (let i = 0; i < total; i++) {
    const fest = targets[i];
    console.log(`[${i + 1}/${total}] ${fest.title} 처리 중...`);

    const content = await generateContent(fest);

    // pick-info.json의 해당 항목에 직접 반영
    const idx = data.festivals.findIndex(f => f.id === fest.id);
    if (idx !== -1) {
      if (content) {
        data.festivals[idx].content = content;
        console.log(`  ✓ 완료`);
      } else {
        data.festivals[idx].content = '';
        console.log(`  ✗ 실패 (원본 유지)`);
      }
      // 1건 처리마다 즉시 저장
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    }

    // 마지막 건이 아니면 2초 딜레이
    if (i < total - 1) await sleep(2000);
  }

  const done = data.festivals.filter(f => f.content && f.content.trim() !== '').length;
  console.log(`\n완료: ${done}/${data.festivals.length}건 content 보유`);
}

main().catch(err => {
  console.error('치명적 오류:', err.message);
  process.exit(1);
});
