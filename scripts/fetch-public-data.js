const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const govApiKey = process.env.PUBLIC_DATA_API_KEY;
    if (!govApiKey) {
      throw new Error('PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${encodeURIComponent(govApiKey)}`;
    const govRes = await fetch(url);
    if (!govRes.ok) {
      throw new Error(`공공데이터포털 API 호출 실패: ${govRes.status}`);
    }

    const govJson = await govRes.json();
    const dataList = govJson.data || [];
    
    if (dataList.length === 0) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    const validRegions = ['서울', '인천', '경기'];
    let selectedData = null;

    for (const item of dataList) {
      const textToSearch = [
        item.서비스명,
        item.서비스목적요약,
        item.지원대상,
        item.소관기관명
      ].join(' ');

      const hasRegion = validRegions.some(r => textToSearch?.includes(r));
      if (hasRegion) {
        selectedData = item;
        break;
      }
    }

    if (!selectedData) {
      selectedData = dataList[0];
    }

    const dataPath = path.join(__dirname, '../public/data/pick-info.json');
    let existingData;
    try {
      existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
      throw new Error('pick-info.json 파일을 읽을 수 없습니다.');
    }

    const titleToCheck = selectedData.서비스명;
    const isDuplicate = 
      existingData.festivals?.some(f => f.title === titleToCheck) ||
      existingData.benefits?.some(b => b.title === titleToCheck);

    if (isDuplicate) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    const promptObj = {
      contents: [{
        parts: [{
          text: `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 랜덤숫자, region: '서울', '인천', '경기', '전국' 중 택1, type: 'festival' 또는 'benefit', title: 서비스명, date: 'YYYY.MM.DD~YYYY.MM.DD' 또는 마감일, target: 지원대상, summary: 한줄요약, link: 상세URL, tag: '추천/마감임박/상시 등 짧은태그'}
내용을 보고 행사/축제면 type을 'festival', 지원금/서비스면 'benefit'으로 판단해.
date나 마감일이 명확하지 않으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(selectedData)}`
        }]
      }]
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptObj)
    });

    if (!geminiRes.ok) {
      throw new Error(`Gemini API 호출 실패: ${geminiRes.status}`);
    }

    const geminiJson = await geminiRes.json();
    let textResult = geminiJson.candidates[0].content.parts[0].text;
    textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsedParams = JSON.parse(textResult);
    const newId = String(parsedParams.id || Date.now());

    if (parsedParams.type === 'festival') {
      existingData.festivals.unshift({
        id: newId,
        region: parsedParams.region || '전국',
        title: parsedParams.title || titleToCheck,
        date: parsedParams.date || '상시',
        tag: parsedParams.tag || '신규',
        image: 'https://images.unsplash.com/photo-1533174000243-ea40ced1c828?q=80&w=640&auto=format&fit=crop'
      });
    } else {
      existingData.benefits.unshift({
        id: newId,
        region: parsedParams.region || '전국',
        title: parsedParams.title || titleToCheck,
        target: parsedParams.target || '누구나',
        deadline: parsedParams.date || '상시',
        isEmergency: parsedParams.tag === '마감임박'
      });
    }

    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log(`새로운 항목 추가 성공: ${titleToCheck}`);

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

main();
