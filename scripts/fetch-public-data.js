const fs = require('fs');
const path = require('path');

// 날씨 코드 변환 함수
function parseWeather(code) {
  if (code === 0) return { status: '맑음', icon: '☀️' };
  if ([1, 2, 3].includes(code)) return { status: '구름 조금', icon: '⛅' };
  if ([45, 48].includes(code)) return { status: '안개', icon: '🌫️' };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { status: '비', icon: '🌧️' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { status: '눈', icon: '❄️' };
  if ([95, 96, 99].includes(code)) return { status: '천둥번개', icon: '⚡' };
  return { status: '흐림', icon: '☁️' };
}

async function fetchWeatherData() {
  try {
    const latlons = [
      { name: '서울', lat: 37.5665, lon: 126.9780 },
      { name: '인천', lat: 37.4563, lon: 126.7052 },
      { name: '경기', lat: 37.2636, lon: 127.0286 }
    ];
    
    const results = [];
    for (const loc of latlons) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true&timezone=Asia%2FSeoul`;
      const res = await fetch(url);
      const json = await res.json();
      const current = json.current_weather;
      const { status, icon } = parseWeather(current.weathercode);
      
      results.push({
        region: loc.name,
        temp: `${Math.round(current.temperature)}°`,
        status: status,
        icon: icon
      });
    }
    return results;
  } catch (err) {
    console.error('날씨 수집 실패:', err.message);
    return null;
  }
}

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

    // 날씨 정보 업데이트 (항상 실행)
    console.log('날씨 정보 수집 중...');
    const weatherData = await fetchWeatherData();
    if (weatherData) {
      existingData.weather = weatherData;
      console.log('날씨 정보 업데이트 성공');
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
    }

    const titleToCheck = selectedData.서비스명;
    const isDuplicate = 
      existingData.festivals?.some(f => f.title === titleToCheck) ||
      existingData.benefits?.some(b => b.title === titleToCheck);

    if (isDuplicate) {
      console.log('새로운 공공데이터가 없습니다. (날씨만 업데이트 완료)');
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
{id: 랜덤숫자, region: '서울', '인천', '경기', '전국' 중 택1, type: 'festival' 또는 'benefit', title: 서비스명, date: 'YYYY.MM.DD~YYYY.MM.DD' 또는 마감일, target: 지원대상, summary: 한줄요약, link: 상세URL, tag: '추천/마감임박/상시 등 짧은태그', imagePrompt: '축제/행사라면 이 축제 분위기를 가장 잘 나타내는 화려하고 사실적인 영문 이미지 생성 프롬프트 1문장'}
내용을 보고 행사/축제면 type을 'festival', 지원금/서비스면 'benefit'으로 판단해.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(selectedData)}`
        }]
      }]
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
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

    const seed = Math.floor(Math.random() * 1000);
    const safePrompt = (parsedParams.imagePrompt || parsedParams.title)
      .replace(/[^a-zA-Z0-9 ]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-'); // 공백을 대시로 치환
    const externalImageUrl = `https://pollinations.ai/p/${safePrompt}?width=800&height=600&seed=${seed}&nologo=true`;
    
    // 💡 이미지 다운로드 및 로컬 저장
    const localImageName = `${safePrompt.substring(0, 30).toLowerCase()}-${seed}.png`;
    const localImagePath = `/images/blogs/${localImageName}`;
    const absoluteImagePath = path.join(__dirname, '../public', localImagePath);
    
    console.log(`이미지 다운로드 시작: ${externalImageUrl}`);
    let finalImageUrl = externalImageUrl;
    try {
      const imgRes = await fetch(externalImageUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        fs.writeFileSync(absoluteImagePath, Buffer.from(arrayBuffer));
        console.log(`이미지 다운로드 성공: ${localImagePath}`);
        finalImageUrl = localImagePath;
      } else {
        console.log('이미지 다운로드 에러, 외부 URL 사용');
      }
    } catch (e) {
      console.error('이미지 로컬 저장 실패:', e.message);
    }

    if (parsedParams.type === 'festival') {
      existingData.festivals.unshift({
        id: newId,
        region: parsedParams.region || '전국',
        title: parsedParams.title || titleToCheck,
        date: parsedParams.date || '상시',
        tag: parsedParams.tag || '신규',
        image: finalImageUrl
      });
    } else {
      existingData.benefits.unshift({
        id: newId,
        region: parsedParams.region || '전국',
        title: parsedParams.title || titleToCheck,
        target: parsedParams.target || '누구나',
        deadline: parsedParams.date || '상시',
        image: finalImageUrl,
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
