const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../public/data/pick-info.json');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(item, apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = `아래 축제 데이터의 title과 description을 SEO에 최적화된 버전으로 개선해줘.

title 규칙:
- 반드시 [지역명] + 축제명 + 연도(2026) + 구체적 키워드 조합
- 예: [서울] 중랑 장미축제 2026 - 5월 무료입장 완벽 가이드
- 검색자가 "바로 이게 내가 찾던 것!"이라고 느껴야 함

description 규칙:
- 구글 검색 결과에 노출되는 메타 디스크립션
- 반드시 날짜 + 장소 + 핵심 볼거리 + ~하세요로 끝내기
- 예: 5월 15~23일 중랑장미공원에서 천만 송이 장미 무료 관람! 주차 꿀팁까지 한번에 확인하세요.
- 100자 이내

원본 데이터: ${JSON.stringify(item)}

반드시 JSON만 출력. 형식: {"title": "...", "description": "..."}`;

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

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const total = data.festivals.length;
  console.log(`축제 항목 총 ${total}개 처리 시작\n`);

  for (let i = 0; i < total; i++) {
    const item = data.festivals[i];
    console.log(`[${i + 1}/${total}] ${item.title} 처리 중...`);

    const result = await callGemini(item, apiKey, model);
    if (result && result.title && result.description) {
      data.festivals[i].title = result.title;
      data.festivals[i].description = result.description;
      console.log(`  ✓ title: ${result.title}`);
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } else {
      console.log(`  - 실패: 원본 유지`);
    }

    if (i < total - 1) await delay(1000);
  }

  console.log(`\n완료! ${DATA_PATH} 저장됨`);
}

main().catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
