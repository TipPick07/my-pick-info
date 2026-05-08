const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../public/data/pick-info.json');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(item, apiKey, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = `아래 지원금 데이터의 title과 details를 SEO에 최적화된 버전으로 개선해줘.

title 규칙:
- 반드시 [지역명] + 지원금명 + 구체적 금액이나 혜택 키워드 조합
- 예: [서울] 청년 월세 20만원 지원 2026 - 신청 자격 총정리
- 검색자가 "바로 이게 내가 찾던 것!"이라고 느껴야 함
- 절대 뭉뚱그린 제목 금지

details 규칙:
- 구글 검색 결과에 노출되는 메타 디스크립션
- 반드시 대상자 + 혜택금액 + 신청방법 + ~하세요로 끝내기
- 예: 서울 거주 만 19~39세 청년이라면 월 최대 20만원 월세 지원 받을 수 있습니다. 신청 자격과 서류를 지금 바로 확인하세요.
- 100자 이내

원본 데이터: ${JSON.stringify(item)}

반드시 JSON만 출력. 형식: {"title": "...", "details": "..."}`;

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
  const total = data.benefits.length;
  console.log(`지원금 항목 총 ${total}개 처리 시작\n`);

  for (let i = 0; i < total; i++) {
    const item = data.benefits[i];
    console.log(`[${i + 1}/${total}] ${item.title} 처리 중...`);

    const result = await callGemini(item, apiKey, model);
    if (result && result.title && result.details) {
      data.benefits[i].title = result.title;
      data.benefits[i].details = result.details;
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
