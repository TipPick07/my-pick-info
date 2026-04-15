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
      if (description.length < 50 || !image) continue;
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
      // 품질 필터: 설명 50자 미만은 제외하되, 이미지는 폴백 허용
      if (description.length < 50) continue;
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

// ─── 1순위: 인천 문화행사 (공공데이터포털) ──────────────────────────────────
async function fetchIncheonEvents(apiKey) {
  const results = [];
  if (!apiKey) { console.warn('[인천] INCHEON_API_KEY 없음, 건너뜀'); return results; }
  try {
    const url = `https://apis.data.go.kr/6280000/icfCulturalEvent/getCulturalEventList?serviceKey=${apiKey}&numOfRows=50&pageNo=1&_type=json`;
    const res = await fetchWithRetry(url);
    if (!res.ok) { console.warn(`[인천] HTTP ${res.status}`); return results; }
    const json = await res.json();
    const raw = json?.response?.body?.items?.item || [];
    const items = Array.isArray(raw) ? raw : [raw];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (const item of items) {
      if (item.endDt && new Date(item.endDt) < today) continue;
      const description = (item.eventDc || '').trim();
      const image = item.firstimage || item.thumbnail || '';
      if (description.length < 50 || !image) continue;
      const startDate = item.startDt ? String(item.startDt).replace(/-/g, '.') : '';
      const endDate = item.endDt ? String(item.endDt).replace(/-/g, '.') : '';
      const dateStr = startDate && endDate && startDate !== endDate ? `${startDate}~${endDate}` : startDate || '상시';
      results.push({
        _source: '인천',
        id: `fest-ic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        region: '인천',
        title: item.eventNm || item.title || '',
        date: dateStr,
        _dateKey: item.startDt || '',
        tag: '신규',
        image,
        location: item.eventPlce || item.addr || '인천',
        description,
        link: item.hmpgAddr || '',
        mapx: item.mapx || '',
        mapy: item.mapy || '',
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
  return {
    서비스명: item.서비스명 || item.svcNm || item.servNm || item.pbanc_nm || item.pbancNm || item.지원사업명 || item.biz_nm || '',
    서비스목적요약: item.서비스목적요약 || item.svcPurposSumry || item.svcPurps || item.jiwon_cntnt || item.지원내용 || item.biz_cn || '',
    지원대상: item.지원대상 || item.trgter || item.aply_trgt || item.aplyTrgt || item.trgt_nm || '',
    소관기관명: item.소관부처명 || item.소관기관명 || item.blnfcInsttNm || item.excl_instt_nm || item.exclInsttNm || item.기관명 || item.sprt_instt_nm || '',
    지원내용: item.지원내용 || item.givBnfCn || item.jiwon_cntnt || item.biz_cn || '',
    신청URL: item.신청URL || item.aplyUrl || item.dtl_url || item.dtlUrl || item.pbanc_url || '',
    신청기한: item.신청기한 || item.aplyEndDt || item.pbanc_rcept_end_dt || item.pbancRceptEndDt || item.rcept_end_de || '',
    _source: source,
  };
}

// 표준 data.go.kr JSON 응답에서 아이템 배열 추출
function extractItems(json) {
  const raw = json?.response?.body?.items?.item
    || json?.data
    || json?.items
    || json?.response?.body?.items
    || [];
  return Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? [raw] : []);
}

// ─── 1순위: 복지로 중앙부처 복지서비스 (한국사회보장정보원) ──────────────────
// API: data.go.kr → 한국사회보장정보원_중앙부처복지서비스목록조회서비스 (B554287)
// serviceKey: encodeURIComponent 적용 (일반 인증키 기준, +/= 문자 처리)
async function fetchBokjiroCentral(apiKey) {
  const results = [];
  const encodedKey = encodeURIComponent(apiKey);
  const url = `https://apis.data.go.kr/B554287/NationalWelfareInformationsV2/getNationalWelfarelistV2?serviceKey=${encodedKey}&pageNo=1&numOfRows=10&_type=json`;
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      const errBody = await res.text();
      console.warn(`[복지로중앙] HTTP ${res.status} - ${errBody.substring(0, 500)}`);
      return results;
    }
    const json = await res.json();
    const items = extractItems(json);
    for (const item of items) {
      const norm = normalizeItem(item, '복지로중앙');
      if (norm.서비스명) results.push(norm);
    }
    console.log(`[복지로중앙] ${items.length}건 수집`);
  } catch (err) {
    console.warn(`[복지로중앙] 오류: ${err.message}`);
  }
  return results;
}

// ─── 1순위: 복지로 지자체 복지서비스 (한국사회보장정보원) ────────────────────
// API: data.go.kr → 한국사회보장정보원_지자체복지서비스목록조회서비스 (B554287)
// serviceKey: encodeURIComponent 적용 (일반 인증키 기준, +/= 문자 처리)
async function fetchBokjiroLocal(apiKey) {
  const regionNames = ['서울', '인천', '경기'];
  const results = [];
  const encodedKey = encodeURIComponent(apiKey);
  for (const region of regionNames) {
    if (results.length >= 10) break;
    const url = `https://apis.data.go.kr/B554287/LocalWelfareService2/getLocalWelfareSrvList?serviceKey=${encodedKey}&pageNo=1&numOfRows=5&ctpvNm=${encodeURIComponent(region)}&_type=json`;
    try {
      const res = await fetchWithRetry(url);
      if (!res.ok) {
        const errBody = await res.text();
        console.warn(`[복지로지자체:${region}] HTTP ${res.status} - ${errBody.substring(0, 500)}`);
        continue;
      }
      const json = await res.json();
      const items = extractItems(json);
      for (const item of items) {
        const norm = normalizeItem(item, '복지로지자체');
        if (norm.서비스명) results.push(norm);
      }
      console.log(`[복지로지자체:${region}] ${items.length}건 수집`);
    } catch (err) {
      console.warn(`[복지로지자체:${region}] 오류: ${err.message}`);
    }
  }
  return results;
}

// ─── 1순위: 기업마당 중소기업 지원사업 공고 (중소벤처기업부) ────────────────
// API: data.go.kr → 중소벤처기업부_중소기업지원사업 공고 조회 서비스 (1421000/kisedOpenAPI)
// serviceKey: encodeURIComponent 적용 (일반 인증키 기준, +/= 문자 처리)
// 엔드포인트: /kisedOpenAPI/getAnnouncementList (공식 명세 기준)
async function fetchBizinfo(apiKey) {
  const results = [];
  const encodedKey = encodeURIComponent(apiKey);
  // 1차 시도: 공식 명세 엔드포인트
  const urls = [
    `https://apis.data.go.kr/1421000/kisedOpenAPI/getAnnouncementList?serviceKey=${encodedKey}&pageNo=1&numOfRows=10&returnType=json`,
    `https://apis.data.go.kr/1421000/bizinfo/getBizinfoList?serviceKey=${encodedKey}&pageNo=1&numOfRows=10&returnType=json`,
  ];
  for (const url of urls) {
    try {
      const res = await fetchWithRetry(url);
      if (!res.ok) {
        const errBody = await res.text();
        console.warn(`[기업마당] HTTP ${res.status} (${url.split('?')[0].split('/').pop()}) - ${errBody.substring(0, 500)}`);
        continue;
      }
      const json = await res.json();
      const items = extractItems(json);
      for (const item of items) {
        const norm = normalizeItem(item, '기업마당');
        if (norm.서비스명) results.push(norm);
      }
      if (items.length > 0) {
        console.log(`[기업마당] ${items.length}건 수집`);
        break;
      }
    } catch (err) {
      console.warn(`[기업마당] 오류: ${err.message}`);
    }
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

    // 날씨 정보 업데이트 (항상 실행)
    console.log('날씨 정보 수집 중...');
    const weatherData = await fetchWeatherData();
    if (weatherData) {
      existingData.weather = weatherData;
      console.log('날씨 정보 업데이트 성공');
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
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
        if (title && !existingTitles.has(title) && !collectedTitles.has(title)) {
          newItems.push(item);
          collectedTitles.add(title);
          console.log(`  ✓ 신규: ${title} [${item._source}]`);
        }
      }
    };

    // ① 1순위: 복지로 중앙부처 (중장년·노년 생애주기)
    console.log('\n[지원금] 1순위 수집 - 복지로 중앙부처...');
    addItems(await fetchBokjiroCentral(govApiKey));
    console.log(`  소계: ${newItems.length}건`);

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
            text: `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 랜덤숫자, region: '서울', '인천', '경기', '전국' 중 택1, type: 'festival' 또는 'benefit', title: 서비스명, date: 'YYYY.MM.DD~YYYY.MM.DD' 또는 마감일, target: 지원대상, summary: 2~3문장 요약 (행사라면 행사 특징·볼거리·즐길거리 중심, 지원금이라면 핵심 혜택 중심), location: '행사 장소명 또는 주소 (festival일 때만. benefit이면 빈 문자열)', link: 상세URL, tag: '추천/마감임박/상시 등 짧은태그', imagePrompt: '축제/행사라면 이 축제의 분위기를 파스텔톤 3D 일러스트 스타일로 표현하는 영문 프롬프트 1문장 (pastel 3D illustration, soft mint and warm colors, clean white background, flat perspective, professional)', requirements: ['필요서류1', '필요서류2'], howToApply: ['신청방법1', '신청방법2'], eligibilityQuiz: ['자격 요건 질문1', '자격 요건 질문2'], tip: '사용자를 위한 한 줄 꿀팁'}
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
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
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
      // 설명 50자 미만이면 제외 (이미지는 폴백 허용)
      if (description.length < 50) return null;
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

    const existingFestTitles = new Set(existingData.festivals.map(f => f.title));

    for (const fest of allFestItems) {
      const title = (fest.title || '').trim();
      if (!title || existingFestTitles.has(title)) continue;

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
      fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
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
