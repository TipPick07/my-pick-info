const fs = require('fs');
const path = require('path');
const fallbacks = require('../src/lib/image-fallbacks.json');

// ─── 네이버 DataLab + 계절 키워드 ─────────────────────────────────────────
const SEASONAL_KEYWORDS = {
  1:  { festival: ['설날행사','겨울축제','눈꽃축제'], benefit: ['난방비지원','에너지바우처','설맞이지원금'] },
  2:  { festival: ['봄맞이축제','매화축제','실내전시'], benefit: ['청년취업지원','복지급여','근로장려금신청준비'] },
  3:  { festival: ['벚꽃축제','봄꽃축제','봄나들이'], benefit: ['청년창업지원','소상공인지원','취업성공패키지'] },
  4:  { festival: ['벚꽃축제','튤립축제','봄축제'], benefit: ['근로장려금','자녀장려금','청년주거지원'] },
  5:  { festival: ['어린이날행사','장미축제','연등회'], benefit: ['근로장려금신청','자녀장려금신청','가정의달지원금'] },
  6:  { festival: ['여름축제','물축제','한강축제'], benefit: ['청년지원금','에너지바우처','취업지원'] },
  7:  { festival: ['여름축제','물놀이행사','워터페스티벌'], benefit: ['에너지취약계층지원','청년주거지원','여름방학지원'] },
  8:  { festival: ['여름축제','해변축제','별빛축제'], benefit: ['개학맞이지원','주거급여','저소득층지원'] },
  9:  { festival: ['추석행사','가을축제','단풍축제'], benefit: ['추석명절지원금','복지급여','노인복지혜택'] },
  10: { festival: ['단풍축제','핼러윈행사','문화행사'], benefit: ['난방비지원신청','에너지바우처신청','노후준비지원'] },
  11: { festival: ['빛축제','크리스마스마켓','겨울준비행사'], benefit: ['에너지바우처','난방비지원','연말정산준비'] },
  12: { festival: ['크리스마스행사','연말축제','겨울빛축제'], benefit: ['연말정산','겨울난방지원','신년복지혜택'] }
};

async function getTodayHotKeywords(type) {
  const month = new Date().getMonth() + 1;
  const seasonal = (SEASONAL_KEYWORDS[month] || SEASONAL_KEYWORDS[5])[type] || [];

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.log('[DataLab] API 키 없음 → 계절 키워드만 사용');
    return seasonal;
  }

  try {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const endDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startDate = `${weekAgo.getFullYear()}-${pad(weekAgo.getMonth()+1)}-${pad(weekAgo.getDate())}`;

    const keywordGroups = type === 'festival'
      ? [
          { groupName: '축제', keywords: ['축제'] },
          { groupName: '행사', keywords: ['행사'] },
          { groupName: '나들이', keywords: ['나들이'] },
          { groupName: '공연', keywords: ['공연'] }
        ]
      : [
          { groupName: '지원금', keywords: ['지원금'] },
          { groupName: '혜택', keywords: ['혜택'] },
          { groupName: '복지', keywords: ['복지'] },
          { groupName: '보조금', keywords: ['보조금'] }
        ];

    const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      body: JSON.stringify({ startDate, endDate, timeUnit: 'date', keywordGroups })
    });

    if (!res.ok) { console.warn(`[DataLab] 오류 (${res.status}) → 계절 키워드만 사용`); return seasonal; }

    const json = await res.json();
    const scored = json.results.map(g => {
      const recent = g.data.slice(-3);
      const avg = recent.reduce((s, d) => s + d.ratio, 0) / recent.length;
      return { name: g.title, score: avg };
    }).sort((a, b) => b.score - a.score);

    const hotKeywords = scored.slice(0, 2).map(g => g.name);
    console.log(`[DataLab] 핫 키워드 TOP2 (${type}): ${hotKeywords.join(', ')}`);
    return [...new Set([...hotKeywords, ...seasonal])];
  } catch (err) {
    console.warn('[DataLab] 호출 실패 → 계절 키워드만 사용:', err.message);
    return seasonal;
  }
}

function calcHotScore(item, hotKeywords) {
  let score = 0;
  const text = [item.title, item.description, item.서비스명, item.서비스목적요약].filter(Boolean).join(' ');
  hotKeywords.forEach((kw, idx) => {
    const weight = idx < 2 ? 30 : 15;
    if ((item.title || item.서비스명 || '').includes(kw)) score += weight;
    if (text.includes(kw)) score += Math.floor(weight / 2);
  });
  return score;
}
// ──────────────────────────────────────────────────────────────────────────────

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

function isBenefitQuality(item) {
  // 1. 제목(서비스명) 없거나 너무 짧으면 탈락
  const title = (item.서비스명 || '').trim();
  if (!title || title.length < 5) return false;

  // 2. 설명이 전혀 없으면 탈락
  const desc = (item.서비스목적요약 || item.지원내용 || item.서비스목적 || '').trim();
  if (!desc || desc.length < 10) return false;

  // 3. 마감일이 이미 지난 공고는 탈락
  const deadline = item.신청기한 || '';
  if (deadline && isDeadlineExpired(deadline)) return false;

  // 4. 의미없는 값만 있는 경우 탈락 ('-', '해당없음', '직접입력' 등)
  const meaningless = ['-', '해당없음', '직접입력', 'N/A', '없음', '미정'];
  if (meaningless.includes(title)) return false;

  return true;
}

function isFestivalQuality(item) {
  // 1. 제목 없거나 너무 짧으면 탈락
  const title = (item.title || '').trim();
  if (!title || title.length < 4) return false;

  // 2. 설명이 전혀 없으면 탈락
  const desc = (item.description || '').trim();
  if (!desc || desc.length < 10) return false;

  // 3. 이미 종료된 행사 탈락 (date 필드 기준 마지막 날짜)
  if (item.date && item.date !== '상시') {
    if (isDeadlineExpired(item.date)) return false;
  }

  // 4. 지역 정보가 아예 없으면 탈락
  const location = (item.location || item.region || '').trim();
  if (!location) return false;

  return true;
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

// 재시도 가능한 fetch 함수 (console.log 통일 — stderr/stdout 혼재 방지)
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 2000) {
  let lastResponse;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        console.log(`[재시도 ${i + 1}/${retries}] API 오류 (${response.status}). ${backoff}ms 후 다시 시도합니다.`);
        lastResponse = response;
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
        continue;
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`[재시도 ${i + 1}/${retries}] 네트워크 오류: ${err.message}. ${backoff}ms 후 다시 시도합니다.`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
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

// ─── 1순위: 서울열린데이터광장 문화행사 ─────────────────────────────────────
async function fetchSeoulEvents(apiKey) {
  const results = [];
  if (!apiKey) { console.warn('[서울] SEOUL_API_KEY 없음, 건너뜀'); return results; }
  try {
    const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/culturalEventInfo/1/100/`;
    const res = await fetchWithRetry(url);
    if (!res.ok) { console.warn(`[서울] HTTP ${res.status}`); return results; }
    const json = await res.json();
    const items = json?.culturalEventInfo?.row || [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (const item of items) {
      if (item.END_DATE && new Date(item.END_DATE) < today) continue;
      const description = [item.PROGRAM, item.ETC_DESC].filter(Boolean).join(' ').trim();
      const image = item.MAIN_IMG || '';
      if (description.length < 10) continue;
      const fmtSeoulDate = (d) => d ? d.split(' ')[0].replace(/-/g, '.') : '';
      const startDate = fmtSeoulDate(item.STRTDATE);
      const endDate = fmtSeoulDate(item.END_DATE);
      const dateStr = startDate && endDate && startDate !== endDate ? `${startDate}~${endDate}` : startDate || '상시';
      results.push({
        _source: '서울',
        id: `fest-seoul-${Buffer.from(item.TITLE).toString('base64url').slice(0, 8)}-${Date.now()}`,
        region: '서울',
        title: item.TITLE,
        date: dateStr,
        _dateKey: item.STRTDATE || '',
        tag: item.IS_FREE === '무료' ? '무료' : '신규',
        image,
        location: item.PLACE || item.GUNAME || '서울',
        description,
        link: item.ORG_LINK || item.HMPG_ADDR || '',
        mapx: item.LOT || '',
        mapy: item.LAT || '',
      });
    }
    console.log(`[서울] ${results.length}건 수집 (품질필터 후)`);
  } catch (err) { console.warn(`[서울] 오류: ${err.message}`); }
  return results;
}

// ─── 1순위: 경기데이터드림 문화축제 (CultureFestival) ───────────────────────
// 서비스명: CultureFestival (openapi.gg.go.kr/CultureFestival)
// 필드: FASTVL_NM, FASTVL_BEGIN_DE, FASTVL_END_DE, FASTVL_CONT, OPENMEET_PLC,
//       REFINE_ROADNM_ADDR, HMPG_ADDR, REFINE_WGS84_LOGT, REFINE_WGS84_LAT
async function fetchGyeonggiEvents(apiKey) {
  const results = [];
  if (!apiKey) { console.warn('[경기] GYEONGGI_API_KEY 없음, 건너뜀'); return results; }
  try {
    const url = `https://openapi.gg.go.kr/CultureFestival?KEY=${apiKey}&Type=json&pIndex=1&pSize=100`;
    const res = await fetchWithRetry(url);
    if (!res.ok) { console.warn(`[경기] HTTP ${res.status}`); return results; }
    const json = await res.json();
    const rows = json?.CultureFestival?.[1]?.row || [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (const item of rows) {
      // 종료일 기준 만료 필터
      if (item.FASTVL_END_DE && new Date(item.FASTVL_END_DE) < today) continue;
      const title = (item.FASTVL_NM || '').trim();
      if (!title) continue;
      // 설명: FASTVL_CONT (내용) + 장소 조합
      const place = item.OPENMEET_PLC || item.REFINE_ROADNM_ADDR || '';
      const rawDesc = (item.FASTVL_CONT || '').replace(/\+/g, ' ');
      const description = [rawDesc, place ? `장소: ${place}` : ''].filter(Boolean).join(' | ').trim();
      // 경기데이터드림은 이미지 URL을 제공하지 않음 → 폴백 처리(수집 후 이미지 처리 단계에서)
      // 품질 필터: Gemini Google Search grounding으로 내용 보완 가능하므로 기준 완화
      if (description.length < 10) continue;
      const startDate = item.FASTVL_BEGIN_DE ? String(item.FASTVL_BEGIN_DE).replace(/-/g, '.') : '';
      const endDate = item.FASTVL_END_DE ? String(item.FASTVL_END_DE).replace(/-/g, '.') : '';
      const dateStr = startDate && endDate && startDate !== endDate ? `${startDate}~${endDate}` : startDate || '상시';
      results.push({
        _source: '경기',
        id: `fest-gg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        region: '경기',
        title,
        date: dateStr,
        _dateKey: item.FASTVL_BEGIN_DE || '',
        tag: '신규',
        image: '',   // 이미지 없음 → 폴백 처리
        location: place || item.REFINE_LOTNO_ADDR || '경기',
        description,
        link: item.HMPG_ADDR || '',
        mapx: item.REFINE_WGS84_LOGT || '',
        mapy: item.REFINE_WGS84_LAT || '',
      });
    }
    console.log(`[경기] ${results.length}건 수집 (만료 필터 후, 이미지 폴백 포함)`);
  } catch (err) { console.warn(`[경기] 오류: ${err.message}`); }
  return results;
}

// ─── 1순위: 인천 문화행사 (인천문화재단 OpenAPI) ──────────────────────────────
async function fetchIncheonEvents(apiKey) {
  const results = [];
  if (!apiKey) { console.warn('[인천] INCHEON_API_KEY 없음, 건너뜀'); return results; }
  try {
    // 실제 엔드포인트: https://ifac.or.kr/openAPI/real/search.do
    const url = `https://ifac.or.kr/openAPI/real/search.do?apiKey=${apiKey}&svID=festival&resultType=json&pSize=50&cPage=1`;
    const res = await fetchWithRetry(url);
    if (!res.ok) { console.warn(`[인천] HTTP ${res.status}`); return results; }
    const text = await res.text();
    // XML 응답이면 JSON 파싱 불가 — 오류 없이 건너뜀
    if (text.trim().startsWith('<?xml') || text.trim().startsWith('<q>')) {
      console.warn(`[인천] XML 응답 수신 — resultType=json 미지원. 응답 앞부분: ${text.slice(0, 100)}`);
      return results;
    }
    if (text.trim().startsWith('<')) {
      console.warn(`[인천] HTML 오류 페이지 수신. 응답 앞부분: ${text.slice(0, 200)}`);
      return results;
    }
    const json = JSON.parse(text);
    // 응답 구조: { resultCode, resultMsg, totalCnt, item: [...] }
    const resultCode = json?.resultCode || json?.response?.resultCode;
    if (resultCode && resultCode !== '0000') {
      console.warn(`[인천] API 오류코드 ${resultCode}: ${json?.resultMsg || json?.errorMsg || ''}`);
      return results;
    }
    const raw = json?.item || [];
    const items = Array.isArray(raw) ? raw : [raw];
    for (const item of items) {
      const description = (item.description || '').trim();
      if (description.length < 10) continue;
      // period는 "매년 12월 중" 같은 텍스트 — 날짜 필터 불가, 그대로 사용
      const dateStr = item.period || '상시';
      results.push({
        _source: '인천',
        id: `fest-ic-${item.idx || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        region: '인천',
        title: item.title || '',
        date: dateStr,
        _dateKey: '',
        tag: '신규',
        image: '',
        location: item.organ || '인천',
        description,
        link: item.link || '',
        mapx: '',
        mapy: '',
      });
    }
    console.log(`[인천] ${results.length}건 수집 (품질필터 후)`);
  } catch (err) { console.warn(`[인천] 오류: ${err.message}`); }
  return results;
}

// ─── 2순위: 한국관광공사 TourAPI (searchFestival2 + detailCommon) ─────────
async function fetchKTOEvents(apiKey) {
  const areaCodes = [
    { code: '11', name: '서울' },
    { code: '28', name: '인천' },
    { code: '41', name: '경기' }
  ];
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  const eventStartDate = from.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(/-/g, '');
  const festivals = [];
  for (const area of areaCodes) {
    const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${apiKey}&pageNo=1&numOfRows=20&MobileOS=ETC&MobileApp=TipPick&_type=json&arrange=C&eventStartDate=${eventStartDate}&lDongRegnCd=${area.code}&lclsSystm1=EV`;
    try {
      const res = await fetchWithRetry(url);
      if (!res.ok) { console.warn(`[KTO] ${area.name} HTTP ${res.status}`); continue; }
      const json = await res.json();
      const raw = json?.response?.body?.items?.item;
      if (!raw) { console.log(`[KTO] ${area.name} 결과 없음`); continue; }
      const items = Array.isArray(raw) ? raw : [raw];
      for (const item of items) festivals.push({ ...item, _region: area.name });
      console.log(`[KTO] ${area.name} ${items.length}건 수집`);
    } catch (err) { console.warn(`[KTO] ${area.name} 오류: ${err.message}`); }
  }

  // detailCommon2 호출로 overview + 좌표 보강
  const enriched = [];
  for (const fest of festivals) {
    if (!fest.contentid) { enriched.push(fest); continue; }
    try {
      const detailUrl = `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${apiKey}&contentId=${fest.contentid}&MobileOS=ETC&MobileApp=TipPick&_type=json&defaultYN=Y&firstImageYN=Y&addrinfoYN=Y&overviewYN=Y`;
      const dr = await fetchWithRetry(detailUrl);
      if (dr.ok) {
        const dj = await dr.json();
        const raw = dj?.response?.body?.items?.item;
        const d = Array.isArray(raw) ? raw[0] : raw;
        if (d?.overview) fest._overview = d.overview;
        if (d?.mapx) fest.mapx = d.mapx;
        if (d?.mapy) fest.mapy = d.mapy;
        if (d?.homepage) fest._homepage = d.homepage;
      }
    } catch (e) { console.warn(`[KTO detailCommon] ${fest.contentid} 오류: ${e.message}`); }
    enriched.push(fest);
  }
  return enriched;
}

// 중복 제거: title+날짜 동일 시 설명이 더 긴 쪽 유지
function deduplicateFestivals(festivals) {
  const seen = new Map();
  for (const fest of festivals) {
    const key = `${(fest.title || '').trim()}__${fest._dateKey || fest.date || ''}`;
    if (!seen.has(key)) {
      seen.set(key, fest);
    } else {
      const existing = seen.get(key);
      if ((fest.description || '').length > (existing.description || '').length) {
        seen.set(key, fest);
      }
    }
  }
  return Array.from(seen.values());
}

// ─── API 연동 설정 ────────────────────────────────────────────────────────────

// gov24 fallback 검색 키워드 (2순위)
const GOV24_FALLBACK_KEYWORDS = ['신중년', '중장년', '시니어', '고령자', '퇴직', '은퇴', '재취업', '연금', '건강보험', '세액공제'];

// 응답 아이템을 공통 구조로 정규화 (서비스명 필드 보장)
function normalizeItem(item, source) {
  // 복지로 지자체 trgterIndvdlNmArray는 배열일 수 있음
  const trgter = Array.isArray(item.trgterIndvdlNmArray)
    ? item.trgterIndvdlNmArray.join(', ')
    : (item.trgterIndvdlNmArray || '');
  return {
    서비스명: item.서비스명 || item.svcNm || item.servNm || item.pbanc_nm || item.pbancNm || item.지원사업명 || item.biz_nm || '',
    서비스목적요약: item.서비스목적요약 || item.svcPurposSumry || item.svcPurps || item.servDgst || item.srvPvsnM || item.jiwon_cntnt || item.지원내용 || item.biz_cn || '',
    지원대상: item.지원대상 || item.trgter || trgter || item.aply_trgt || item.aplyTrgt || item.trgt_nm || '',
    소관기관명: item.소관부처명 || item.소관기관명 || item.bizChrDeptNm || item.blnfcInsttNm || item.excl_instt_nm || item.exclInsttNm || item.기관명 || item.sprt_instt_nm || '',
    지원내용: item.지원내용 || item.givBnfCn || item.servDgst || item.jiwon_cntnt || item.biz_cn || '',
    신청URL: item.신청URL || item.aplyUrl || item.servDtlLink || item.dtl_url || item.dtlUrl || item.pbanc_url || '',
    신청기한: item.신청기한 || item.aplyEndDt || item.pbanc_rcept_end_dt || item.pbancRceptEndDt || item.rcept_end_de || '',
    _source: source,
  };
}

// 표준 data.go.kr JSON 응답에서 아이템 배열 추출
function extractItems(json) {
  const raw = json?.response?.body?.items?.item
    || json?.servList          // 복지로 지자체 LcgvWelfarelist
    || json?.data
    || json?.items
    || json?.response?.body?.items
    || [];
  return Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? [raw] : []);
}

// ─── 복지로 XML 응답 파싱 (정규식, 외부 라이브러리 불필요) ──────────────────
// B554287 API 기본 반환 포맷이 XML — <item> 블록에서 모든 필드를 추출
function parseXmlItems(xml) {
  const items = [];
  const itemRx = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const block = m[1];
    const obj = {};
    const fieldRx = /<([^/>\s]+?)>([^<]*)<\/\1>/g;
    let f;
    while ((f = fieldRx.exec(block)) !== null) {
      obj[f[1]] = f[2]
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .trim();
    }
    if (Object.keys(obj).length > 0) items.push(obj);
  }
  return items;
}

// ─── 공통: raw text 추출 → 타입 감지 → 조건부 파싱 ──────────────────────────
// 반환값: { raw, json, xmlItems }
//   json: JSON 파싱 성공 시 객체, 아니면 null
//   xmlItems: XML <item> 파싱 성공 시 배열, 아니면 null
async function readAndParse(label, res) {
  let raw = '';
  try {
    raw = await res.text();
  } catch (e) {
    console.log(`[${label}] 응답 바디 읽기 실패: ${e.message}`);
    return { raw: '', json: null, xmlItems: null };
  }

  // ① 즉시 raw 출력 (항상 최우선)
  console.log(`[디버깅 RAW:${label}] ${raw.substring(0, 500)}`);

  const trimmed = raw.trim();

  // ② XML 감지
  if (trimmed.startsWith('<')) {
    const codeMatch = raw.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/);
    const msgMatch  = raw.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/);
    const codeMap = {
      '10': '잘못된요청파라미터', '11': '필수요청파라미터없음',
      '12': '해당OpenAPI서비스없음', '20': '서비스접근거부',
      '30': '등록되지않은서비스키', '31': '기한만료된서비스키',
      '32': '등록되지않은IP', '99': '서버오류',
    };
    const code = codeMatch ? codeMatch[1] : null;
    const msg  = msgMatch  ? msgMatch[1]  : '(메시지 없음)';

    // 에러 코드가 있고 00이 아니면 → 실패
    if (code && code !== '00') {
      console.log(`[${label}] XML 에러 — 코드: ${code} (${codeMap[code] || '알수없음'}) | ${msg}`);
      return { raw, json: null, xmlItems: null };
    }

    // 에러 없음 → <item> 블록 파싱 시도
    const xmlItems = parseXmlItems(raw);
    console.log(`[${label}] XML 파싱 — ${xmlItems.length}건 추출 | 코드: ${code || '없음'} | ${msg}`);
    return { raw, json: null, xmlItems };
  }

  // ③ 비JSON/비XML
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    console.log(`[${label}] 비JSON/비XML 응답 (첫글자: '${trimmed[0] || '없음'}')`);
    return { raw, json: null, xmlItems: null };
  }

  // ④ JSON 파싱
  try {
    return { raw, json: JSON.parse(trimmed), xmlItems: null };
  } catch (e) {
    console.log(`[${label}] JSON 파싱 실패: ${e.message}`);
    return { raw, json: null, xmlItems: null };
  }
}

// ─── serviceKey URL 삽입 헬퍼 ─────────────────────────────────────────────────
// 포털 발급 인코딩 키(% 포함)는 재인코딩 금지, 디코딩 키(+/=/ 등)는 자동 인코딩
// serviceKey만 URL 직접 삽입, 나머지 파라미터는 URLSearchParams 자동 처리
function buildDataGoKrUrl(base, serviceKey, params) {
  const isAlreadyEncoded = /%[0-9A-Fa-f]{2}/.test(serviceKey);
  const safeKey = isAlreadyEncoded ? serviceKey : encodeURIComponent(serviceKey);
  const qs = new URLSearchParams(params).toString();
  const sanitizedKeyLog = serviceKey.substring(0, 6) + '***';
  console.log(`[URL] ${base.split('/').slice(-1)[0]} ?serviceKey=${sanitizedKeyLog}&${qs} [encoded=${isAlreadyEncoded}]`);
  return `${base}?serviceKey=${safeKey}&${qs}`;
}

// ─── 1순위: 복지로 중앙부처 복지서비스 (한국사회보장정보원) ──────────────────
// Full URL: https://apis.data.go.kr/B554287/NationalWelfareInformations/getNationalWelfarelist
// 기본 포맷 XML — JSON 응답이면 extractItems, XML 응답이면 parseXmlItems 사용
async function fetchBokjiroCentral(apiKey) {
  const results = [];
  const reqOptions = { headers: { 'Accept': 'application/json' } };
  const safeKey = /%[0-9A-Fa-f]{2}/.test(apiKey) ? apiKey : encodeURIComponent(apiKey);

  const endpoints = [
    {
      name: 'V1',
      url: `https://apis.data.go.kr/B554287/NationalWelfareInformations/getNationalWelfarelist?serviceKey=${safeKey}&pageNo=1&numOfRows=10&callTp=L&_type=json`,
    },
    {
      name: 'V2',
      url: `https://apis.data.go.kr/B554287/NationalWelfareInformationsV2/getNationalWelfarelistV2?serviceKey=${safeKey}&pageNo=1&numOfRows=10&_type=json`,
    },
  ];

  for (const ep of endpoints) {
    console.log(`[URL] 복지로중앙:${ep.name} ${ep.url.replace(safeKey, safeKey.substring(0, 6) + '***')}`);
    try {
      const res = await fetchWithRetry(ep.url, reqOptions);
      const { raw, json, xmlItems } = await readAndParse(`복지로중앙:${ep.name}`, res);
      if (!res.ok) {
        console.log(`[복지로중앙:${ep.name}] HTTP ${res.status} — 위 RAW 참조`);
        continue;
      }
      const items = json ? extractItems(json) : (xmlItems || []);
      if (items.length === 0) continue;
      for (const item of items) {
        const norm = normalizeItem(item, '복지로중앙');
        if (norm.서비스명) results.push(norm);
      }
      console.log(`[복지로중앙:${ep.name}] ${items.length}건 수집`);
      break;
    } catch (err) {
      console.log(`[복지로중앙:${ep.name}] 네트워크 오류: ${err.message}`);
    }
  }
  return results;
}

// ─── 1순위: 복지로 지자체 복지서비스 (한국사회보장정보원) ────────────────────
// Full URL: https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist
// 기본 포맷 XML — JSON 응답이면 extractItems, XML 응답이면 parseXmlItems 사용
async function fetchBokjiroLocal(apiKey) {
  const regionNames = ['서울', '인천', '경기'];
  const results = [];
  const reqOptions = { headers: { 'Accept': 'application/json' } };
  const safeKey = /%[0-9A-Fa-f]{2}/.test(apiKey) ? apiKey : encodeURIComponent(apiKey);

  for (const region of regionNames) {
    if (results.length >= 10) break;
    const ctpv = encodeURIComponent(region);
    const url = `https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist?serviceKey=${safeKey}&pageNo=1&numOfRows=5&ctpvNm=${ctpv}&_type=json`;
    console.log(`[URL] 복지로지자체:${region} ${url.replace(safeKey, safeKey.substring(0, 6) + '***')}`);
    try {
      const res = await fetchWithRetry(url, reqOptions);
      const { raw, json, xmlItems } = await readAndParse(`복지로지자체:${region}`, res);
      if (!res.ok) {
        console.log(`[복지로지자체:${region}] HTTP ${res.status} — 위 RAW 참조`);
        continue;
      }
      const items = json ? extractItems(json) : (xmlItems || []);
      if (items.length === 0) continue;
      for (const item of items) {
        const norm = normalizeItem(item, '복지로지자체');
        if (norm.서비스명) results.push(norm);
      }
      console.log(`[복지로지자체:${region}] ${items.length}건 수집`);
    } catch (err) {
      console.log(`[복지로지자체:${region}] 네트워크 오류: ${err.message}`);
    }
  }
  return results;
}

// ─── 1순위: 기업마당 중소기업 지원사업 공고 (bizinfo.go.kr 직접 API) ─────────
// ※ bizinfo.go.kr은 data.go.kr과 별개 시스템 → BIZINFO_API_KEY(crtfcKey) 필요
//   BIZINFO_API_KEY 없는 경우 이 함수는 빈 배열 반환 (gov24 fallback으로 처리)
// API: https://www.bizinfo.go.kr/openapi/getOpenAnnouncementList.do
async function fetchBizinfo(apiKey) {
  const results = [];
  const biziKey = process.env.BIZINFO_API_KEY;
  if (!biziKey) {
    console.log('[기업마당] BIZINFO_API_KEY 환경변수 없음 — bizinfo.go.kr은 data.go.kr과 별개 키 필요. gov24 fallback 사용.');
    return results;
  }
  // bizinfo.go.kr OpenAPI (crtfcKey 사용, 별도 키이므로 encodeURIComponent 적용)
  const url = `https://www.bizinfo.go.kr/openapi/getOpenAnnouncementList.do?crtfcKey=${encodeURIComponent(biziKey)}&dataType=json&pageUnit=10&pageIndex=1`;
  try {
    const res = await fetchWithRetry(url);
    const { raw, json } = await readAndParse('기업마당', res);
    if (!res.ok) {
      console.log(`[기업마당] HTTP ${res.status} — 위 RAW 참조`);
      return results;
    }
    if (!json) return results;
    // bizinfo 응답 구조: { resultCode, pbancList: [ { pbanc_nm, jiwon_cntnt, ... } ] }
    const items = json?.pbancList || json?.items || extractItems(json);
    for (const item of items) {
      const norm = normalizeItem(item, '기업마당');
      if (norm.서비스명) results.push(norm);
    }
    if (items.length > 0) console.log(`[기업마당] ${items.length}건 수집`);
  } catch (err) {
    console.log(`[기업마당] 네트워크 오류: ${err.message}`);
  }
  return results;
}

// ─── 2순위 Fallback: gov24 키워드 검색 (행정안전부) ─────────────────────────
// ENV: PUBLIC_DATA_API_KEY (기존)
async function fetchBenefitsByKeyword(apiKey, keyword) {
  const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=10&returnType=JSON&serviceKey=${encodeURIComponent(apiKey)}&cond[서비스명::LIKE]=${encodeURIComponent(keyword)}`;
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) { console.warn(`[gov24:${keyword}] HTTP ${res.status}`); return []; }
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn(`[gov24:${keyword}] 오류: ${err.message}`);
    return [];
  }
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
  const DRY_RUN = process.env.DRY_RUN === 'true';
  if (DRY_RUN) console.log('[DRY RUN] 테스트 모드 — pick-info.json에 데이터를 저장하지 않습니다.');
  try {
    const govApiKey = process.env.PUBLIC_DATA_API_KEY;
    if (!govApiKey) {
      throw new Error('PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.');
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

    // ─── 만료 데이터 자동 정리 ────────────────────────────────────────────────
    const beforeFestCount = existingData.festivals.length;
    const beforeBenefitCount = existingData.benefits.length;

    // 축제: 종료일이 지난 것 제거 (date 필드 기준 마지막 날짜)
    existingData.festivals = existingData.festivals.filter(f => {
      if (!f.date || f.date === '상시') return true;
      return !isDeadlineExpired(f.date);
    });

    // 지원금: 마감일이 지난 것 제거
    existingData.benefits = existingData.benefits.filter(b => {
      if (!b.deadline || b.deadline === '상시') return true;
      return !isDeadlineExpired(b.deadline);
    });

    const removedFest = beforeFestCount - existingData.festivals.length;
    const removedBenefit = beforeBenefitCount - existingData.benefits.length;
    console.log(`[정리] 만료 축제 ${removedFest}건, 만료 지원금 ${removedBenefit}건 제거됨`);

    if (!DRY_RUN && (removedFest > 0 || removedBenefit > 0)) {
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
      console.log('[정리] pick-info.json 저장 완료');
    }
    // ──────────────────────────────────────────────────────────────────────────────

    // 날씨 정보 업데이트 (항상 실행)
    console.log('날씨 정보 수집 중...');
    const weatherData = await fetchWeatherData();
    if (weatherData) {
      existingData.weather = weatherData;
      console.log('날씨 정보 업데이트 성공');
      if (DRY_RUN) { console.log('[DRY RUN] 파일 저장 건너뜀'); } else {
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
      }
    }

    const DAILY_LIMIT = 5;
    const validRegions = ['서울', '인천', '경기'];

    // 중복 체크를 위한 기존 타이틀 셋 구성
    const existingTitles = new Set([
      ...existingData.festivals.map(f => f.title),
      ...existingData.benefits.map(b => b.title)
    ]);

    // 수집된 신규 항목 추적용 셋 (API 간 중복 방지)
    const collectedTitles = new Set();
    let newItems = [];

    // 4개 API 모두 PUBLIC_DATA_API_KEY(공공데이터포털 공통 인증키) 사용
    const addItems = (results) => {
      for (const item of results) {
        if (newItems.length >= DAILY_LIMIT) break;
        const title = item.서비스명;
        if (!title) continue;
        if (existingTitles.has(title) || collectedTitles.has(title)) continue;

        // 품질 필터
        if (!isBenefitQuality(item)) {
          console.log(`  ✗ 품질 미달 스킵: ${title}`);
          continue;
        }

        newItems.push(item);
        collectedTitles.add(title);
        console.log(`  ✓ 신규: ${title} [${item._source}]`);
      }
    };

    // ① 1순위: 복지로 중앙부처 — 현재 500 에러로 비활성화, 지자체로 대체
    // addItems(await fetchBokjiroCentral(govApiKey));

    // ① 1순위: 복지로 지자체 (서울·인천·경기, 중장년·노년)
    if (newItems.length < DAILY_LIMIT) {
      console.log('\n[지원금] 1순위 수집 - 복지로 지자체...');
      addItems(await fetchBokjiroLocal(govApiKey));
      console.log(`  소계: ${newItems.length}건`);
    }

    // ① 1순위: 기업마당 (소상공인·자영업자 등)
    if (newItems.length < DAILY_LIMIT) {
      console.log('\n[지원금] 1순위 수집 - 기업마당...');
      addItems(await fetchBizinfo(govApiKey));
      console.log(`  소계: ${newItems.length}건`);
    }

    // ② 2순위 Fallback: gov24 타겟 키워드 검색
    if (newItems.length < DAILY_LIMIT) {
      console.log('\n[지원금] 2순위 Fallback - gov24 키워드 검색...');
      for (const keyword of GOV24_FALLBACK_KEYWORDS) {
        if (newItems.length >= DAILY_LIMIT) break;
        addItems(await fetchBenefitsByKeyword(govApiKey, keyword));
      }
      console.log(`  소계: ${newItems.length}건`);
    }

    // ③ 3순위 Fallback: gov24 일반 최신순
    if (newItems.length < DAILY_LIMIT) {
      console.log('\n[지원금] 3순위 Fallback - gov24 일반 최신순...');
      try {
        const fallbackUrl = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=30&returnType=JSON&serviceKey=${encodeURIComponent(govApiKey)}`;
        const fallbackRes = await fetchWithRetry(fallbackUrl);
        if (!fallbackRes.ok) throw new Error(`HTTP ${fallbackRes.status}`);
        addItems((await fallbackRes.json()).data || []);
      } catch (err) {
        console.warn(`[gov24 일반] 오류: ${err.message}`);
      }
      console.log(`  소계: ${newItems.length}건`);
    }

    console.log(`\n[지원금] 최종 수집: ${newItems.length}건`);

    if (newItems.length === 0) {
      console.log('새로운 공공데이터가 없습니다. (날씨만 업데이트 완료)');
      return;
    }

    // ─── 핫 키워드 기준으로 지원금 데이터 정렬 ──────────────────────────────────
    const benefitHotKeywords = await getTodayHotKeywords('benefit');
    console.log(`[지원금] 핫 키워드 반영 정렬 시작 (키워드: ${benefitHotKeywords.slice(0,3).join(', ')})`);
    newItems.sort((a, b) => calcHotScore(b, benefitHotKeywords) - calcHotScore(a, benefitHotKeywords));
    // ──────────────────────────────────────────────────────────────────────────────

    // 수도권 지역 조건 맞는 것 우선 선정
    let selectedDataItems = [];
    for (const item of newItems) {
      const textToSearch = [item.서비스명, item.서비스목적요약, item.지원대상, item.소관기관명].join(' ');
      if (validRegions.some(r => textToSearch?.includes(r))) {
        selectedDataItems.push(item);
      }
      if (selectedDataItems.length >= DAILY_LIMIT) break;
    }

    // 수도권 조건 미충족 항목으로 나머지 채움
    if (selectedDataItems.length < DAILY_LIMIT) {
      for (const item of newItems) {
        if (!selectedDataItems.includes(item)) {
          selectedDataItems.push(item);
        }
        if (selectedDataItems.length >= DAILY_LIMIT) break;
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
            text: `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘.
이 데이터는 웹사이트에 상세 페이지로 자동 배포되므로, 구글/네이버 검색 노출(SEO)을 위해 '유사 문서'로 분류되지 않는 독창적인 가공이 매우 중요해.

형식:
{
  id: 랜덤숫자,
  region: '서울', '인천', '경기', '전국' 중 택1,
  type: 'festival' 또는 'benefit',
  title: '[지역명 명시] + 원문 제목에 직관적인 혜택이나 목적 키워드를 결합한 검색 친화적 제목 (예: [서울] 청년 대중교통비 10만원 지원금 신청)',
  date: 'YYYY.MM.DD~YYYY.MM.DD' 또는 마감일,
  target: 지원대상,
  summary: 원문 텍스트를 단순 복사하지 말고, 대상자·혜택(행사면 즐길거리)을 에디터의 시각에서 재해석한 3~4문장의 독창적인 설명문 (유사 문서 패널티 회피용 필수 항목),
  location: '행사 장소명 또는 주소 (festival일 때만. benefit이면 빈 문자열)',
  link: 상세URL,
  tag: '추천/마감임박/상시 등 짧은태그',
  imagePrompt: '축제/행사라면 이 축제의 분위기를 파스텔톤 3D 일러스트 스타일로 표현하는 영문 프롬프트 1문장 (pastel 3D illustration, soft mint and warm colors, clean white background, flat perspective, professional)',
  requirements: ['필요서류1', '필요서류2'],
  howToApply: ['신청방법1', '신청방법2'],
  eligibilityQuiz: ['자격 요건 질문1', '자격 요건 질문2'],
  tip: '사용자를 위한 한 줄 꿀팁'
}

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

      // Gemini 503/429 지수 백오프 재시도 (최대 3회, 초기 10초)
      let geminiOk = false;
      let geminiBackoff = 10000;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promptObj)
          });

          if (geminiRes.status === 503 || geminiRes.status === 429) {
            console.log(`Gemini API 과부하 (${geminiRes.status}) — ${geminiBackoff / 1000}초 후 재시도 (${attempt + 1}/3)`);
            await delay(geminiBackoff);
            geminiBackoff *= 2;
            continue;
          }

          if (!geminiRes.ok) {
            const errBody = await geminiRes.text();
            console.log(`Gemini API 호출 실패 (상태: ${geminiRes.status}): ${errBody.substring(0, 200)}`);
            break;
          }

          const geminiJson = await geminiRes.json();
          textResult = geminiJson.candidates[0].content.parts[0].text;
          textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
          geminiOk = true;
          break;
        } catch (err) {
          console.log(`Gemini 서버 통신 에러 (${attempt + 1}/3): ${err.message}`);
          if (attempt < 2) await delay(geminiBackoff);
          geminiBackoff *= 2;
        }
      }
      if (!geminiOk) { continue; }

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
        console.log('이미지 처리 중 간헐적 오류 발생, 스톡 이미지로 폴백:', e.message);
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
          image: finalImageUrl,
          location: parsedParams.location || '',
          description: parsedParams.summary || ''
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
      if (DRY_RUN) { console.log('[DRY RUN] 파일 저장 건너뜀'); } else {
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
      }
      console.log(`✓ 정상 추가됨: ${titleToCheck}`);
    }

    // ─── 수도권 축제/행사 수집 (지자체 1순위 + KTO 2순위) ────────────────
    console.log('\n[축제] 수도권 축제/행사 데이터 수집 시작...');

    const seoulApiKey = process.env.SEOUL_API_KEY || '';
    const gyeonggiApiKey = process.env.GYEONGGI_API_KEY || '';
    const incheonApiKey = process.env.INCHEON_API_KEY || '';

    // 1순위: 지자체 API
    const [seoulRaw, gyeonggiRaw, incheonRaw] = await Promise.all([
      fetchSeoulEvents(seoulApiKey),
      fetchGyeonggiEvents(gyeonggiApiKey),
      fetchIncheonEvents(incheonApiKey),
    ]);
    const primaryItems = [...seoulRaw, ...gyeonggiRaw, ...incheonRaw];
    console.log(`[축제] 1순위 지자체 합계: ${primaryItems.length}건`);

    // 2순위: KTO TourAPI (보조) — 지자체로 이미 커버된 지역 보완
    const ktoItems = await fetchKTOEvents(govApiKey);
    console.log(`[축제] 2순위 KTO: ${ktoItems.length}건`);

    // KTO 아이템을 공통 포맷으로 변환
    const ktoFormatted = ktoItems.map(fest => {
      const title = fest.title || fest.contenttitle || '';
      const endDateFormatted = fest.eventenddate
        ? `${fest.eventenddate.slice(0,4)}.${fest.eventenddate.slice(4,6)}.${fest.eventenddate.slice(6,8)}`
        : null;
      if (endDateFormatted && isDeadlineExpired(endDateFormatted)) return null;
      const festLocation = [fest.addr1, fest.addr2].filter(Boolean).join(' ').trim();
      // overview 없으면 addr+title 조합으로 대체
      const description = fest._overview && fest._overview.length >= 50
        ? fest._overview
        : festLocation ? `${title}이(가) ${festLocation}에서 열리는 행사입니다.` : '';
      const image = fest.firstimage || '';
      // Gemini Google Search grounding으로 내용 보완 가능하므로 기준 완화
      if (description.length < 10) return null;
      const link = fest._homepage
        ? fest._homepage.replace(/<[^>]*>/g, '').trim()  // HTML 태그 제거
        : '';
      return {
        _source: 'KTO',
        id: `fest-${fest.contentid || Date.now()}`,
        region: fest._region || '전국',
        title,
        date: formatFestivalDate(fest.eventstartdate, fest.eventenddate),
        _dateKey: fest.eventstartdate || '',
        tag: '신규',
        image,
        location: festLocation || fest._region || '',
        description,
        link,
        mapx: fest.mapx || '',
        mapy: fest.mapy || '',
      };
    }).filter(Boolean);

    // 합산 후 중복 제거 (지자체 우선 — 먼저 들어온 게 우선순위 높음)
    const allFestItems = deduplicateFestivals([...primaryItems, ...ktoFormatted]);
    console.log(`[축제] 중복 제거 후: ${allFestItems.length}건`);

    // ─── 핫 키워드 기준으로 축제 데이터 정렬 ────────────────────────────────────
    const festHotKeywords = await getTodayHotKeywords('festival');
    console.log(`[축제] 핫 키워드 반영 정렬 시작 (키워드: ${festHotKeywords.slice(0,3).join(', ')})`);
    allFestItems.sort((a, b) => calcHotScore(b, festHotKeywords) - calcHotScore(a, festHotKeywords));
    // ──────────────────────────────────────────────────────────────────────────────

    const existingFestTitles = new Set(existingData.festivals.map(f => f.title));

    for (const fest of allFestItems) {
      const title = (fest.title || '').trim();
      if (!title || existingFestTitles.has(title)) continue;

      // 품질 필터
      if (!isFestivalQuality(fest)) {
        console.log(`  ✗ [축제] 품질 미달 스킵: ${title}`);
        continue;
      }

      // 이미지 다운로드 (외부 URL → 로컬 저장)
      let finalImageUrl;
      const imageUrl = fest.image || '';
      if (imageUrl.startsWith('http')) {
        const seed = Math.floor(Math.random() * 1000);
        const localImageName = `festival-${String(title).replace(/[^\w\uAC00-\uD7A3]/g,'').slice(0,10)}-${seed}.png`;
        const localImagePath = `/images/blogs/${localImageName}`;
        const absoluteImagePath = path.join(__dirname, '../public', localImagePath);
        try {
          const imgRes = await fetch(imageUrl);
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
      } else if (imageUrl) {
        finalImageUrl = imageUrl; // 이미 로컬 경로인 경우
      } else {
        const stockImages = fallbacks['FESTIVAL'] || fallbacks['GUIDE'];
        finalImageUrl = stockImages[Math.floor(Math.random() * stockImages.length)];
      }

      const newFest = {
        id: fest.id || `fest-${Date.now()}`,
        region: fest.region || '전국',
        title,
        date: fest.date || '상시',
        tag: fest.tag || '신규',
        image: finalImageUrl,
        location: fest.location || fest.region || '',
        description: fest.description || '',
        link: fest.link || '',
        mapx: fest.mapx || '',
        mapy: fest.mapy || '',
      };

      existingData.festivals.unshift(newFest);
      existingFestTitles.add(title);
      if (DRY_RUN) { console.log('[DRY RUN] 파일 저장 건너뜀'); } else {
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
      }
      console.log(`✓ [축제] 추가됨: ${title} (${newFest.region}, ${newFest.date}) [${fest._source}]`);
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
