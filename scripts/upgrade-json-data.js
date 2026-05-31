const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

function isBenefitQuality(item) {
  const title = (item.title || item.서비스명 || '').trim();
  const desc = (item.details || item.description || item.서비스목적요약 || item.지원내용 || item.서비스내용 || '').trim();
  const fullText = title + ' ' + desc;

  // 블랙리스트 (행정적 공고 등 실질 가치가 떨어지는 것 배제)
  const blacklist = ['상담', '교육', '캠페인', '대회', '멘토링'];
  if (blacklist.some(keyword => fullText.includes(keyword))) {
    return false;
  }

  // 화이트리스트 (현금성 지원이나 확실한 혜택)
  const whitelist = ['수당', '환급', '바우처', '월세', '캐시백', '장려금', '지원금'];
  if (!whitelist.some(keyword => fullText.includes(keyword))) {
    return false;
  }

  return true;
}

// 지원금 데이터 보완용 Gemini 호출
async function supplementItemWithGemini(item, geminiApiKey) {
  const title = item.title || item.서비스명 || '';
  const desc = item.details || item.description || item.서비스목적요약 || '';
  const link = item.link || item.상세조회URL || '';

  const promptText = `
다음은 수집된 공공 지원금 정보입니다.
이 정보를 바탕으로, 웹사이트 상세 페이지에 노출될 수 있도록 부족한 데이터를 꼼꼼하게 채워 JSON 형식으로만 응답해주세요.
절대 마크다운 백틱(\`\`\`) 없이 순수 JSON 객체만 출력해야 합니다.

[원본 데이터]
- 제목: ${title}
- 설명: ${desc}
- 링크: ${link}

[출력 JSON 구조]
{
  "detailedExplanation": "지원금의 목적, 혜택 내용, 기대 효과 등을 포함하여 아주 구체적이고 상세하게 풀어서 설명하는 글 (공백 포함 최소 1,000자 이상). 친절한 말투로 아주 길고 유익하게 작성할 것",
  "targetPersona": "이 정보가 가장 필요한 구체적인 타겟 (예: 여유자금이 부족한 3040 부부)",
  "coreValue": "이 정보가 주는 핵심 가치 요약 (예: 생활비 절감)",
  "eligibilityQuiz": ["자격 요건 O/X 질문1", "자격 요건 O/X 질문2", "질문3", "질문4"],
  "simulation": "해당 페르소나를 가정한 구체적인 연간 체감 혜택이나 예상 절약 금액 시뮬레이션",
  "practicalTip": "관공서 서류 제출 시 누락하기 쉬운 부분이나 실무적이고 디테일한 꿀팁"
}`;

  const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status}: ${txt}`);
      }

      const json = await response.json();
      let textResult = json.candidates[0].content.parts[0].text.trim();
      textResult = textResult.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');

      const parsed = JSON.parse(textResult);
      return parsed;
    } catch (err) {
      console.warn(`[Gemini 보완 시도 ${attempt + 1}/3 실패] ${title}: ${err.message}`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  return null;
}

// 축제 데이터 보완용 Gemini 호출
async function supplementFestivalWithGemini(item, geminiApiKey) {
  const title = item.title || '';
  const desc = item.description || '';
  const location = item.location || item.region || '';
  const date = item.date || '';

  const promptText = `
다음은 수집된 축제/행사 정보입니다.
이 정보를 바탕으로, 웹사이트 상세 페이지 상단에 표시될 핵심 메타데이터를 JSON 형식으로만 응답해주세요.
절대 마크다운 백틱(\`\`\`) 없이 순수 JSON 객체만 출력해야 합니다.

[원본 데이터]
- 제목: ${title}
- 설명: ${desc}
- 장소: ${location}
- 일정: ${date}

[출력 JSON 구조]
{
  "targetPersona": "이 축제에 가장 어울리는 구체적인 방문객 유형 (예: 아이와 함께 주말 나들이를 즐기는 3040 가족). 15자 이내로 간결하게",
  "coreValue": "이 축제/행사의 핵심 매력 한 마디 (예: 무료 야외 공연, 가족 체험 천국, 한국 전통문화 체험). 15자 이내로 간결하게",
  "practicalTip": "방문자가 실제로 유용하게 쓸 수 있는 꿀팁 (주차 팁, 최적 방문 시간, 준비물 등)"
}`;

  const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status}: ${txt}`);
      }

      const json = await response.json();
      let textResult = json.candidates[0].content.parts[0].text.trim();
      textResult = textResult.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');

      const parsed = JSON.parse(textResult);
      return parsed;
    } catch (err) {
      console.warn(`[축제 Gemini 보완 시도 ${attempt + 1}/3 실패] ${title}: ${err.message}`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  return null;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY가 없습니다.');
    process.exit(1);
  }

  const dataPath = path.join(__dirname, '../public/data/pick-info.json');
  if (!fs.existsSync(dataPath)) {
    console.error('pick-info.json 파일이 존재하지 않습니다.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);

  // ─────────────────────────────────────────────────────────────
  // [1단계] 지원금 처리
  // ─────────────────────────────────────────────────────────────
  if (!data.benefits || !Array.isArray(data.benefits)) {
    console.log('benefits 배열이 없습니다. 지원금 처리 건너뜀.');
  } else {
    const originalCount = data.benefits.length;
    console.log(`\n[지원금 업그레이드 시작] 총 ${originalCount}개 검사...`);

    // 단어 규칙 필터링
    const filteredBenefits = data.benefits.filter(item => {
      const isQuality = isBenefitQuality(item);
      if (!isQuality) {
        console.log(`  ✗ 삭제 (단어 필터링 미달): ${item.title || item.서비스명}`);
      }
      return isQuality;
    });

    console.log(`\n[지원금 필터링 완료] ${originalCount - filteredBenefits.length}개 삭제, ${filteredBenefits.length}개 생존`);
    console.log(`\n[지원금 데이터 보완] 4대 원칙 적용 시작...`);
    let benefitUpdatedCount = 0;

    for (let i = 0; i < filteredBenefits.length; i++) {
      const item = filteredBenefits[i];

      // detailedExplanation이 충분히 있으면 스킵
      if (item.detailedExplanation && item.detailedExplanation.length > 100) {
        console.log(`  ✓ 이미 보완된 데이터 스킵: ${item.title || item.서비스명}`);
        continue;
      }

      console.log(`  ▶ 보완 중 (${i + 1}/${filteredBenefits.length}): ${item.title || item.서비스명}`);
      const supplementedData = await supplementItemWithGemini(item, apiKey);

      if (supplementedData) {
        item.detailedExplanation = supplementedData.detailedExplanation || item.detailedExplanation;
        item.targetPersona = supplementedData.targetPersona || item.targetPersona;
        item.coreValue = supplementedData.coreValue || item.coreValue;
        item.eligibilityQuiz = supplementedData.eligibilityQuiz || item.eligibilityQuiz || [];
        item.simulation = supplementedData.simulation || item.simulation;
        item.practicalTip = supplementedData.practicalTip || item.practicalTip;
        benefitUpdatedCount++;
      }
    }

    data.benefits = filteredBenefits;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\n✅ [지원금 완료] 유지: ${filteredBenefits.length}개, 새로 보완: ${benefitUpdatedCount}개`);
  }

  // ─────────────────────────────────────────────────────────────
  // [2단계] 축제 처리
  // ─────────────────────────────────────────────────────────────
  if (!data.festivals || !Array.isArray(data.festivals)) {
    console.log('\nfestivals 배열이 없습니다. 축제 처리 건너뜀.');
  } else {
    console.log(`\n[축제 업그레이드 시작] 총 ${data.festivals.length}개 검사...`);
    let festUpdatedCount = 0;

    for (let i = 0; i < data.festivals.length; i++) {
      const item = data.festivals[i];

      // targetPersona와 coreValue가 둘 다 있으면 스킵
      if (item.targetPersona && item.coreValue) {
        console.log(`  ✓ 이미 보완된 축제 스킵: ${item.title}`);
        continue;
      }

      console.log(`  ▶ 축제 보완 중 (${i + 1}/${data.festivals.length}): ${item.title}`);
      const supplementedData = await supplementFestivalWithGemini(item, apiKey);

      if (supplementedData) {
        item.targetPersona = supplementedData.targetPersona || item.targetPersona;
        item.coreValue = supplementedData.coreValue || item.coreValue;
        item.practicalTip = supplementedData.practicalTip || item.practicalTip;
        festUpdatedCount++;

        // 1건 처리 후 즉시 저장 (중간에 끊겨도 데이터 유실 방지)
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
      }
    }

    console.log(`\n✅ [축제 완료] 새로 보완: ${festUpdatedCount}개`);
  }

  console.log(`\n🎉 [전체 업그레이드 완료] public/data/pick-info.json 업데이트!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
