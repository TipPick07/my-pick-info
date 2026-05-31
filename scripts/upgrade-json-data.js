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

  if (!data.benefits || !Array.isArray(data.benefits)) {
    console.log('benefits 배열이 없습니다.');
    return;
  }

  const originalCount = data.benefits.length;
  console.log(`[업그레이드 시작] 총 ${originalCount}개의 지원금 데이터를 검사합니다...`);

  // 1. 단어 규칙 필터링 (가짜 지원금 삭제)
  const filteredBenefits = data.benefits.filter(item => {
    const isQuality = isBenefitQuality(item);
    if (!isQuality) {
      console.log(`  ✗ 삭제 (단어 필터링 미달): ${item.title || item.서비스명}`);
    }
    return isQuality;
  });

  console.log(`\n[필터링 완료] ${originalCount - filteredBenefits.length}개 삭제, ${filteredBenefits.length}개 생존`);

  // 2. 살아남은 지원금 데이터 보완 (4대 원칙)
  console.log(`\n[데이터 보완] 살아남은 ${filteredBenefits.length}개 데이터에 4대 원칙 적용 시작...`);
  let updatedCount = 0;

  for (let i = 0; i < filteredBenefits.length; i++) {
    const item = filteredBenefits[i];
    
    // 이미 보완된 필드가 충분히 있는지 확인 (재실행 시 스킵 목적)
    if (item.detailedExplanation && item.eligibilityQuiz && item.simulation) {
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
      updatedCount++;
    }
  }

  // 3. pick-info.json 덮어쓰기
  data.benefits = filteredBenefits;
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

  console.log(`\n🎉 [업그레이드 완료]`);
  console.log(` - 최종 유지된 지원금 수: ${filteredBenefits.length}개`);
  console.log(` - 새롭게 보완된 지원금 수: ${updatedCount}개`);
  console.log(` - public/data/pick-info.json 업데이트 완료!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
