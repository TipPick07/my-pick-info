const fs = require('fs');
const path = require('path');
const fallbacks = require('../src/lib/image-fallbacks.json');

// 마감일 만료 여부 확인 (날짜 범위의 마지막 날짜 기준)
function isDeadlineExpired(deadline) {
  if (!deadline) return false;
  const matches = [...String(deadline).matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (matches.length === 0) return false;
  const last = matches[matches.length - 1];
  const endDate = new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return endDate < today;
}

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
// 문장을 질문형(~이신가요?)으로 변환하는 함수
function asQuestion(text) {
  if (!text) return "";
  let q = text.trim();
  if (q.endsWith('?')) return q;
  // 동사 어미 처리 (단순화된 규칙)
  q = q.replace(/자$/, '자이신가요?')
       .replace(/자$/g, '자이신가요?')
       .replace(/가구$/g, '가구에 속하시나요?')
       .replace(/대상$/g, '대상에 해당하시나요?')
       .replace(/충족$/g, '충족하시나요?');
  
  if (!q.endsWith('?') && !q.endsWith('요')) {
    q += '이신가요?';
  }
  return q;
}

// 재시도 가능한 fetch 함수
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 2000) {
  let lastResponse;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        console.warn(`[재시도 ${i + 1}/${retries}] API 오류 (${response.status}). ${backoff}ms 후 다시 시도합니다.`);
        lastResponse = response;
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
        continue;
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[재시도 ${i + 1}/${retries}] 네트워크 오류: ${err.message}. ${backoff}ms 후 다시 시도합니다.`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
  // 모든 재시도 실패 시 마지막 응답 반환 (undefined 반환 버그 수정)
  if (lastResponse) return lastResponse;
  throw new Error(`최대 재시도 횟수(${retries})를 초과했습니다.`);
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

// 수도권 축제/행사 데이터 수집 (한국관광공사 TourAPI)
async function fetchFestivalData(apiKey) {
  const areaCodes = [
    { code: '1', name: '서울' },
    { code: '2', name: '인천' },
    { code: '31', name: '경기' }
  ];

  // 진행 중인 축제도 포함하기 위해 1개월 전부터 조회
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  const eventStartDate = from.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(/-/g, '');

  const festivals = [];

  for (const area of areaCodes) {
    const url = `https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${encodeURIComponent(apiKey)}&numOfRows=10&pageNo=1&MobileApp=TipPick&MobileOS=ETC&eventStartDate=${eventStartDate}&areaCode=${area.code}&_type=json`;
    try {
      const res = await fetchWithRetry(url);
      if (!res.ok) {
        console.warn(`[축제] ${area.name} 데이터 수집 실패: HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      const raw = json?.response?.body?.items?.item;
      if (!raw) { console.log(`[축제] ${area.name} 결과 없음`); continue; }
      const items = Array.isArray(raw) ? raw : [raw];
      for (const item of items) {
        festivals.push({ ...item, _region: area.name });
      }
      console.log(`[축제] ${area.name} ${items.length}건 수집`);
    } catch (err) {
      console.warn(`[축제] ${area.name} 수집 오류:`, err.message);
    }
  }
  return festivals;
}

// 축제 날짜 포맷 변환 (YYYYMMDD → YYYY.MM.DD)
function formatFestivalDate(startDate, endDate) {
  const fmt = (d) => d ? `${d.slice(0,4)}.${d.slice(4,6)}.${d.slice(6,8)}` : '';
  const s = fmt(String(startDate || ''));
  const e = fmt(String(endDate || ''));
  if (!s) return '상시';
  return e && e !== s ? `${s}~${e}` : s;
}

async function main() {
  try {
    const govApiKey = process.env.PUBLIC_DATA_API_KEY;
    if (!govApiKey) {
      throw new Error('PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${encodeURIComponent(govApiKey)}`;
    const govRes = await fetchWithRetry(url);
    if (!govRes.ok) {
      throw new Error(`공공데이터포털 API 호출 실패: ${govRes.status}`);
    }

    const govJson = await govRes.json();
    const dataList = govJson.data || [];
    
    if (dataList.length === 0) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    const dataPath = path.join(__dirname, '../public/data/pick-info.json');
    let existingData;
    try {
      existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      existingData.festivals = existingData.festivals || [];
      existingData.benefits = existingData.benefits || [];
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

    const validRegions = ['서울', '인천', '경기'];
    let newItems = [];

    // 중복 체크를 위한 기존 타이틀 셋 구성
    const existingTitles = new Set([
      ...existingData.festivals.map(f => f.title),
      ...existingData.benefits.map(b => b.title)
    ]);

    // 기존에 없는 새로운 데이터만 추출
    for (const item of dataList) {
      if (!existingTitles.has(item.서비스명)) {
        newItems.push(item);
      }
    }

    if (newItems.length === 0) {
      console.log('새로운 공공데이터가 없습니다. (날씨만 업데이트 완료)');
      return;
    }

    // 최대 5개 선정 (수도권 지역 조건 맞는 것 우선)
    let selectedDataItems = [];
    for (const item of newItems) {
      const textToSearch = [item.서비스명, item.서비스목적요약, item.지원대상, item.소관기관명].join(' ');
      if (validRegions.some(r => textToSearch?.includes(r))) {
        selectedDataItems.push(item);
      }
      if (selectedDataItems.length >= 5) break; 
    }

    // 5개가 안 찼다면 나머지 최신 데이터로 채움
    if (selectedDataItems.length < 5) {
      for (const item of newItems) {
        if (!selectedDataItems.includes(item)) {
          selectedDataItems.push(item);
        }
        if (selectedDataItems.length >= 5) break;
      }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    // 💡 이미지 생성 시 너무 빠른 API 요청으로 인한 실패(Rate Limit) 방지 지연 함수
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const [index, selectedData] of selectedDataItems.entries()) {
      const titleToCheck = selectedData.서비스명;
      console.log(`[${index + 1}/${selectedDataItems.length}] 데이터 처리 시작: ${titleToCheck}`);

      // 지연 (첫번째는 제외) - 자동 배포 안정성 확보 (봇 의심 및 IP 차단 방지)
      if (index > 0) {
        console.log('안정적인 API 처리를 위해 1.5초 대기 중...');
        await delay(1500);
      }

      const promptObj = {
        contents: [{
          parts: [{
            text: `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 랜덤숫자, region: '서울', '인천', '경기', '전국' 중 택1, type: 'festival' 또는 'benefit', title: 서비스명, date: 'YYYY.MM.DD~YYYY.MM.DD' 또는 마감일, target: 지원대상, summary: 한줄요약, link: 상세URL, tag: '추천/마감임박/상시 등 짧은태그', imagePrompt: '축제/행사라면 이 축제의 분위기를 파스텔톤 3D 일러스트 스타일로 표현하는 영문 프롬프트 1문장 (pastel 3D illustration, soft mint and warm colors, clean white background, flat perspective, professional)', requirements: ['필요서류1', '필요서류2'], howToApply: ['신청방법1', '신청방법2'], eligibilityQuiz: ['자격 요건 질문1', '자격 요건 질문2'], tip: '사용자를 위한 한 줄 꿀팁'}
내용을 보고 행사/축제면 type을 'festival', 지원금/서비스면 'benefit'으로 판단해.
eligibilityQuiz는 지원 대상을 분석해서 "~이신가요?" 형태의 질문으로 최소 2개 만들어줘.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(selectedData)}`
          }]
        }]
      };

      const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
      let textResult;
      
      try {
        const geminiRes = await fetchWithRetry(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promptObj)
        });

        if (!geminiRes.ok) {
          const errBody = await geminiRes.text();
          console.error(`Gemini API 호출 실패 (상태: ${geminiRes.status}): ${errBody}`);
          console.error(`실패한 모델: ${geminiModel}`);
          continue;
        }

        const geminiJson = await geminiRes.json();
        textResult = geminiJson.candidates[0].content.parts[0].text;
        textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
      } catch (err) {
        console.error('Gemini 서버 통신 에러:', err.message);
        continue;
      }

      let parsedParams;
      try {
        parsedParams = JSON.parse(textResult);
      } catch(e) {
        console.error('Gemini 응답 JSON 파싱 에러:', textResult);
        continue; // 파싱 실패해도 다음 데이터 처리는 계속 진행
      }

      const newId = String(parsedParams.id || Date.now() + index);
      const seed = Math.floor(Math.random() * 1000) + index;
      let rawPrompt = (parsedParams.imagePrompt || parsedParams.title);
      let safePrompt = rawPrompt
        .replace(/[^a-zA-Z0-9 ]/g, '') // 특수문자 및 한글 제거
        .replace(/\s+/g, '-'); // 공백을 대시로 치환
      
      // 만약 정규식으로 인해 프롬프트가 다 날아갔다면(한글만 있었던 경우 등) 기본 영문 키워드로 폴백
      if (!safePrompt || safePrompt.length < 2) {
        safePrompt = parsedParams.type === 'festival' ? 'korea-festival-event' : 'korea-welfare-benefit';
        console.log(`[안내] 프롬프트가 비어있어 기본 키워드로 변경되었습니다: ${safePrompt}`);
      }

      const externalImageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=800&height=600&seed=${seed}&nologo=true`;
      
      const localImageName = `${safePrompt.substring(0, 30).toLowerCase()}-${seed}.png`;
      const localImagePath = `/images/blogs/${localImageName}`;
      const absoluteImagePath = path.join(__dirname, '../public', localImagePath);
      
      console.log(`이미지 다운로드 시도: ${externalImageUrl}`);
      let finalImageUrl = localImagePath; 

      try {
        const imgRes = await fetch(externalImageUrl);
        const contentType = imgRes.headers.get('content-type');
        
        if (imgRes.ok && contentType && contentType.startsWith('image/')) {
          const arrayBuffer = await imgRes.arrayBuffer();
          fs.writeFileSync(absoluteImagePath, Buffer.from(arrayBuffer));
          console.log(`이미지 로컬 저장 성공: ${localImagePath}`);
        } else {
          console.log(`이미지 생성 실패(Type: ${contentType}), 스톡 이미지로 폴백`);
          const category = parsedParams.type === 'festival' ? 'FESTIVAL' : 'SUBSIDY';
          const stockImages = fallbacks[category] || fallbacks.GUIDE;
          finalImageUrl = stockImages[Math.floor(Math.random() * stockImages.length)];
        }
      } catch (e) {
        console.error('이미지 처리 중 간헐적 오류 발생, 스톡 이미지로 폴백:', e.message);
        const category = parsedParams.type === 'festival' ? 'FESTIVAL' : 'SUBSIDY';
        const stockImages = fallbacks[category] || fallbacks.GUIDE;
        finalImageUrl = stockImages[Math.floor(Math.random() * stockImages.length)];
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
        // 만료된 공고 스킵
        if (isDeadlineExpired(parsedParams.date)) {
          console.log(`[스킵] 만료된 공고 건너뜀: ${titleToCheck} (마감: ${parsedParams.date})`);
          continue;
        }

        // 혜택(Benefit) 데이터 보강 및 폴백 적용
        const requirements = (parsedParams.requirements && parsedParams.requirements.length > 0)
          ? parsedParams.requirements 
          : ["지원금별로 필요한 서류가 다를 수 있습니다. 정확한 서류는 하단의 공식 사이트에서 반드시 확인해 주세요."];
        
        const howToApply = (parsedParams.howToApply && parsedParams.howToApply.length > 0 && parsedParams.howToApply[0] !== '-')
          ? parsedParams.howToApply
          : ["온라인 신청 또는 관할 주민센터 방문 신청 (상세 내용은 공식 사이트 참조)"];

        const rawQuiz = parsedParams.eligibilityQuiz || [parsedParams.target || "해당 지원 사업의 대상자이신가요?"];
        const eligibilityQuiz = rawQuiz.map(q => asQuestion(q));

        existingData.benefits.unshift({
          id: newId,
          region: parsedParams.region || '전국',
          title: parsedParams.title || titleToCheck,
          target: parsedParams.target || '누구나',
          deadline: parsedParams.date || '상시',
          image: finalImageUrl,
          isEmergency: parsedParams.tag === '마감임박' && !isDeadlineExpired(parsedParams.date),
          details: parsedParams.summary || '상세 정보는 공식 홈페이지를 참조하세요.',
          link: parsedParams.link || '',
          requirements: requirements,
          howToApply: howToApply,
          eligibilityQuiz: eligibilityQuiz,
          tip: parsedParams.tip || "신청 기간이 지나기 전에 미리 확인하고 혜택을 챙기세요!"
        });
      }

      // 1건 처리될 때마다 파일에 동기화하여 중간에 다운되어도 데이터 유실 방지
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
      console.log(`✓ 정상 추가됨: ${titleToCheck}`);
    }

    // ─── 수도권 축제/행사 수집 (한국관광공사 TourAPI) ───────────────────
    console.log('\n[축제] 수도권 축제/행사 데이터 수집 시작...');
    const festivalItems = await fetchFestivalData(govApiKey);
    console.log(`[축제] 총 ${festivalItems.length}건 수집 완료`);

    const existingFestTitles = new Set(existingData.festivals.map(f => f.title));

    for (const fest of festivalItems) {
      const title = fest.title || fest.contenttitle;
      if (!title || existingFestTitles.has(title)) continue;

      // 만료된 축제 스킵 (종료일 기준)
      const endDateFormatted = fest.eventenddate ? `${fest.eventenddate.slice(0,4)}.${fest.eventenddate.slice(4,6)}.${fest.eventenddate.slice(6,8)}` : null;
      if (endDateFormatted && isDeadlineExpired(endDateFormatted)) {
        console.log(`[축제 스킵] 종료된 행사: ${title}`);
        continue;
      }

      const dateStr = formatFestivalDate(fest.eventstartdate, fest.eventenddate);
      const region = fest._region || '전국';

      // 이미지: TourAPI 제공 이미지 우선, 없으면 폴백
      let finalImageUrl;
      if (fest.firstimage) {
        // 외부 이미지를 로컬에 다운로드
        const seed = Math.floor(Math.random() * 1000);
        const localImageName = `festival-${String(fest.contentid || Date.now()).slice(-6)}-${seed}.png`;
        const localImagePath = `/images/blogs/${localImageName}`;
        const absoluteImagePath = path.join(__dirname, '../public', localImagePath);
        try {
          const imgRes = await fetch(fest.firstimage);
          const contentType = imgRes.headers.get('content-type');
          if (imgRes.ok && contentType && contentType.startsWith('image/')) {
            const buf = await imgRes.arrayBuffer();
            fs.writeFileSync(absoluteImagePath, Buffer.from(buf));
            finalImageUrl = localImagePath;
            console.log(`[축제] 이미지 저장: ${localImagePath}`);
          } else {
            throw new Error(`이미지 타입 불일치: ${contentType}`);
          }
        } catch (e) {
          console.warn(`[축제] 이미지 다운로드 실패, 폴백 사용: ${e.message}`);
          const stockImages = fallbacks['FESTIVAL'] || fallbacks['GUIDE'];
          finalImageUrl = stockImages[Math.floor(Math.random() * stockImages.length)];
        }
      } else {
        const stockImages = fallbacks['FESTIVAL'] || fallbacks['GUIDE'];
        finalImageUrl = stockImages[Math.floor(Math.random() * stockImages.length)];
      }

      const newFest = {
        id: `fest-${fest.contentid || Date.now()}`,
        region,
        title,
        date: dateStr,
        tag: '신규',
        image: finalImageUrl
      };

      existingData.festivals.unshift(newFest);
      existingFestTitles.add(title);
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
      console.log(`✓ [축제] 추가됨: ${title} (${region}, ${dateStr})`);
    }
    // ──────────────────────────────────────────────────────────────────────

  } catch (error) {
    console.error('----------------------------------------------------');
    console.error('치명적 오류 발생 (공공데이터 수집 중 중단)');
    console.error('에러 메시지:', error.message);
    if (error.stack) console.error('스택 트레이스:', error.stack);
    console.error('----------------------------------------------------');
    process.exit(1);
  }
}

main();
