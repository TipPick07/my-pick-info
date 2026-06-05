const fs = require('fs');
const path = require('path');
const fallbacks = require('../src/lib/image-fallbacks.json');
const { isFestivalExpired: _isFestivalExpired } = require('./lib/festival-date');

// ─── 결정적(안정) ID 생성 ────────────────────────────────────────────────────
// URL churn 방지: 같은 행사/지원금은 재수집돼도 항상 같은 ID(=같은 URL)를 갖도록
// 원본 안정 키(제목·서비스명·source 고유번호)에서 결정적으로 ID를 만든다.
// Date.now()/random은 안정 키가 전혀 없을 때만 마지막 폴백으로 사용.
function _hashKey(str) {
  let h = 5381;
  const s = String(str == null ? '' : str);
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) >>> 0; // djb2
  return h.toString(36);
}
function sid(prefix, key) {
  const k = String(key == null ? '' : key).trim();
  if (!k) return `${prefix}-${Date.now().toString(36)}`; // 안정 키 없을 때만(드묾) 비안정 폴백
  return `${prefix}-${_hashKey(k)}`;
}

// ─── 네이버 DataLab + 계절 키워드 ─────────────────────────────────────────
const SEASONAL_KEYWORDS = {
  1: { festival: ['설날행사', '겨울축제', '눈꽃축제'], benefit: ['난방비지원', '에너지바우처', '설맞이지원금'] },
  2: { festival: ['봄맞이축제', '매화축제', '실내전시'], benefit: ['청년취업지원', '복지급여', '근로장려금신청준비'] },
  3: { festival: ['벚꽃축제', '봄꽃축제', '봄나들이'], benefit: ['청년창업지원', '소상공인지원', '취업성공패키지'] },
  4: { festival: ['벚꽃축제', '튤립축제', '봄축제'], benefit: ['근로장려금', '자녀장려금', '청년주거지원'] },
  5: { festival: ['어린이날행사', '장미축제', '연등회'], benefit: ['근로장려금신청', '자녀장려금신청', '가정의달지원금'] },
  6: { festival: ['여름축제', '물축제', '한강축제'], benefit: ['청년지원금', '에너지바우처', '취업지원'] },
  7: { festival: ['여름축제', '물놀이행사', '워터페스티벌'], benefit: ['에너지취약계층지원', '청년주거지원', '여름방학지원'] },
  8: { festival: ['여름축제', '해변축제', '별빛축제'], benefit: ['개학맞이지원', '주거급여', '저소득층지원'] },
  9: { festival: ['추석행사', '가을축제', '단풍축제'], benefit: ['추석명절지원금', '복지급여', '노인복지혜택'] },
  10: { festival: ['단풍축제', '핼러윈행사', '문화행사'], benefit: ['난방비지원신청', '에너지바우처신청', '노후준비지원'] },
  11: { festival: ['빛축제', '크리스마스마켓', '겨울준비행사'], benefit: ['에너지바우처', '난방비지원', '연말정산준비'] },
  12: { festival: ['크리스마스행사', '연말축제', '겨울빛축제'], benefit: ['연말정산', '겨울난방지원', '신년복지혜택'] }
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
    const endDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startDate = `${weekAgo.getFullYear()}-${pad(weekAgo.getMonth() + 1)}-${pad(weekAgo.getDate())}`;

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

// 제목 정규화: [지역] prefix 제거 + 연도(4자리+년) 제거 + 특수문자/공백 전부 제거 → 중복 감지용
function normTitle(title) {
  return (title || '')
    .replace(/^\[[^\]]+\]\s*/, '')
    .replace(/\d{4}년?/g, '')
    .replace(/[^가-힣a-zA-Z0-9]/g, '')
    .toLowerCase();
}

// ─── 지역-구분 시맨틱 중복 판정 ────────────────────────────────────────────────
// bokjiro 링크가 전부 동일 URL이라 링크 키가 무용 + 기존 prefix-5 검사는
// "[서울] 관악구..." vs "[서울 관악구]..." 처럼 지역명 위치가 달라지면 회피됨.
// → 지역(구/시/군)은 하드 식별자로 유지하고, 사업 핵심명사 bigram Jaccard로 판정.
// 수도권 자치구/시 명칭(접미사 '구/시/군' 없이 쓰이는 경우 대비) — "[서울 용산]"처럼
// '구'가 생략돼도 지역을 인식하기 위한 별칭 목록. 1글자(중·서·동 등)는 오탐 위험으로 제외.
const METRO_DISTRICTS = /(종로|용산|성동|광진|동대문|중랑|성북|강북|도봉|노원|은평|서대문|마포|양천|강서|구로|금천|영등포|동작|관악|서초|강남|송파|강동|미추홀|연수|남동|부평|계양|강화|옹진|수원|성남|의정부|안양|부천|광명|평택|동두천|안산|고양|과천|구리|남양주|오산|시흥|군포|의왕|하남|용인|파주|이천|안성|김포|화성|양주|포천|여주|연천|가평|양평)/;
function benefitDistrict(title) {
  // 광역 단위(서울/인천/경기)는 자치구가 아니므로 먼저 제거 → "서울시"가 구로 오인되는 것 방지
  const t = (title || '').replace(/서울특별시|인천광역시|경기도|서울시|인천시|서울|인천|경기/g, ' ');
  const m = t.match(/([가-힣]{2,4}구|[가-힣]{2,4}시|[가-힣]{2,3}군)/);
  if (m) return m[1].replace(/(구|시|군)$/, ''); // 접미사 제거해 stem 통일 → "용산구"=="용산"
  const a = t.match(METRO_DISTRICTS); // 접미사 없는 자치구명("용산") 인식
  return a ? a[1] : '';
}
function benefitCore(title) {
  return (title || '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[가-힣]{2,4}구|[가-힣]{2,4}시|[가-힣]{2,3}군|서울|인천|경기|전국|수도권|특별시|광역시/g, ' ')
    .replace(METRO_DISTRICTS, ' ') // 접미사 없는 자치구명도 핵심명사에서 제외("용산가정출산"→"가정출산")
    .replace(/\d{4}년?|\d+세|\d+개월|\d+분기|\d+만원|\d+원|최대|매월|월별/g, ' ')
    .replace(/신청|지원금|지원|자격|방법|가이드|총정리|완벽\s*분석|혜택|안내|지급|받기|확인|경제적|부담|경감|구비|서류|및/g, ' ')
    .replace(/[^가-힣]/g, '');
}
function _bigrams(s) {
  const set = new Set();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}
function _jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
// existingTitles(raw 제목 배열/셋)와 비교해 같은 지역·같은 사업이면 매칭 제목 반환
function findBenefitDuplicate(title, existingTitles, threshold = 0.42) {
  const d = benefitDistrict(title);
  const ca = benefitCore(title);
  const cb = _bigrams(ca);
  if (cb.size === 0) return null;
  for (const et of existingTitles) {
    if (benefitDistrict(et) !== d) continue; // 지역 다르면 별개 사업
    const ce = benefitCore(et);
    const eb = _bigrams(ce);
    // 핵심명사 문자열 포함(짧은 쪽이 긴 쪽에 통째로 들어감)
    if (ca.length >= 4 && ce.length >= 4 && (ca.includes(ce) || ce.includes(ca))) return et;
    // bigram 포함률: 짧은 쪽 핵심명사가 긴 쪽에 70%+ 포함되면 동일 사업(AI가 군더더기 덧붙인 경우 포착)
    const small = cb.size <= eb.size ? cb : eb;
    const large = cb.size <= eb.size ? eb : cb;
    if (small.size >= 3) {
      let inter = 0; for (const x of small) if (large.has(x)) inter++;
      if (inter / small.size >= 0.7) return et;
    }
    if (_jaccard(cb, eb) >= threshold) return et;
  }
  return null;
}

// ─── 핫 키워드 공공데이터 매칭 여부 확인 + Gemini 보완 ──────────────────────
async function supplementWithGemini(hotKeywords, type, existingTitles, geminiApiKey) {
  const results = [];
  if (!geminiApiKey) return results;

  // 핫 키워드 중 현재 데이터에 없는 것만 추출
  // 핵심 명사 추출: 신청/지원/안내 등 동작어 제거 후 기존 정규화 제목과 비교
  const missingKeywords = hotKeywords.slice(0, 3).filter(kw => {
    const coreKw = normTitle(kw).replace(/신청(준비)?|지원|안내|혜택|조회|접수|방법|총정리/g, '');
    if (coreKw.length < 2) return false;
    return ![...existingTitles].some(t => normTitle(t).includes(coreKw));
  });

  if (missingKeywords.length === 0) {
    console.log('[Gemini 보완] 핫 키워드 모두 데이터 있음 → 보완 불필요');
    return results;
  }

  console.log(`[Gemini 보완] 공공데이터 없는 핫 키워드: ${missingKeywords.join(', ')} → Gemini 구글검색으로 보완`);

  for (const keyword of missingKeywords) {
    try {
      const promptText = type === 'festival'
        ? `구글 검색으로 "${keyword}" 관련 2026년 수도권(서울·인천·경기) 축제/행사 정보를 찾아서 아래 JSON 형식으로 1건만 출력해줘. 반드시 JSON만 출력.
{
  "id": "gemini-${Date.now()}",
  "region": "서울 또는 인천 또는 경기",
  "type": "festival",
  "title": "[지역명] 행사명",
  "date": "YYYY.MM.DD~YYYY.MM.DD",
  "location": "장소명",
  "description": "행사 설명 3~4문장",
  "link": "공식 URL",
  "tag": "신규",
  "image": ""
}`
        : `구글 검색으로 "${keyword}" 관련 2026년 수도권(서울·인천·경기) 지원금/혜택 정보를 찾아서 아래 JSON 형식으로 1건만 출력해줘. 반드시 JSON만 출력.
{
  "id": "gemini-${Date.now()}",
  "region": "서울 또는 인천 또는 경기 또는 전국",
  "type": "benefit",
  "title": "[지역명] 혜택명",
  "deadline": "YYYY.MM.DD 또는 상시",
  "target": "지원대상",
  "summary": "구글 검색 결과에 노출되는 메타 디스크립션. 반드시 구체적 날짜나 금액 수치 포함. 형식: 언제/어디서 + 무엇을 + 얼마나 + 지금 확인하세요 순서로 작성. 반드시 ~하세요 또는 ~확인하세요로 끝낼 것. 100자 이내.",
  "detailedExplanation": "지원금을 신청자가 빠르게 파악하도록 소제목 구조로 작성. ■로 시작하는 텍스트 소제목 3개(예: ■ 무엇을 지원하나 / ■ 얼마나 받나 / ■ 누가 받으면 유리한가 — 문구는 내용에 맞게 자연스럽게)를 각 줄 맨 앞에 두고, 각 소제목 아래 2~3줄의 짧은 문단을 쓸 것. 소제목 줄과 본문, 각 블록 사이는 반드시 \\n\\n으로 분리. 전체 400~600자로 짧고 명확하게(억지로 늘리거나 같은 내용 반복 금지). Markdown 금지: ## , ** , 단독 - 불릿, 백틱 사용하지 말 것 — 강조·구분은 ■ 텍스트 기호와 줄바꿈으로만.",
  "link": "공식 URL",
  "tag": "신규",
  "image": "",
  "requirements": ["필요서류1", "필요서류2"],
  "howToApply": ["신청방법1", "신청방법2"],
  "targetPersona": "이 정보를 가장 필요로 할 구체적인 대상 (예: 영유아 자녀를 둔 3040 부모)",
  "coreValue": "이 정보가 주는 핵심 가치 요약 (예: 청년 주거비 절감)",
  "eligibilityQuiz": ["자격 요건 O/X 질문1", "자격 요건 O/X 질문2", "질문3", "질문4"],
  "simulation": "타겟 페르소나를 가정한 구체적인 연간 체감 혜택이나 예상 절약 금액 시뮬레이션",
  "practicalTip": "관공서 서류 제출 시 누락하기 쉬운 점 등 실무적이고 디테일한 팁",
  "highlight": "목록 카드에 강조할 핵심 금액/혜택 한 줄. 예: 최대 330만원, 월 20만원, 1인당 100만원. 금액 혜택이 없으면 빈 문자열."
}`;

      const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.7 }
        })
      });

      if (!res.ok) { console.warn(`[Gemini 보완] ${keyword} 실패 (${res.status})`); continue; }

      const json = await res.json();
      let text = json.candidates[0].content.parts[0].text;
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(text);
      if (!parsed.title) continue;

      results.push(parsed);
      console.log(`[Gemini 보완] ✓ "${keyword}" → ${parsed.title}`);

    } catch (err) {
      console.warn(`[Gemini 보완] "${keyword}" 처리 실패:`, err.message);
    }
  }
  return results;
}
// ──────────────────────────────────────────────────────────────────────────────

async function generateFestivalContent(fest, geminiApiKey, geminiModel) {
  if (!geminiApiKey) return '';
  const model = geminiModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

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
5. 분량 강제: 공백 제외 반드시 1,000자 이상 작성. 짧은 문장을 피하고 내용을 깊이 있게 다룰 것.
6. 구조화 강제: 반드시 ## (H2), ### (H3) 태그를 사용하여 서론, 본론, 결론의 체계적인 구조로 작성할 것.
7. 반드시 JSON만 출력: {"content": "마크다운 내용"}`;

  const maxRetries = 3;
  let delay = 10000;
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
        console.warn(`[content 생성] ${fest.title} 재시도 ${attempt}/${maxRetries} (HTTP ${res.status}) - ${delay / 1000}초 대기`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      if (!res.ok) {
        console.warn(`[content 생성] ${fest.title} 실패 (HTTP ${res.status})`);
        return '';
      }

      const json = await res.json();
      let text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      return parsed.content || '';
    } catch (err) {
      console.warn(`[content 생성] ${fest.title} 오류 (시도 ${attempt}/${maxRetries}):`, err.message);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
  return '';
}
// ──────────────────────────────────────────────────────────────────────────────

// 마감일 만료 여부 확인 (날짜 범위의 마지막 날짜 기준)
// 공용 파서(scripts/lib/festival-date.js)에 위임 — 컴팩트(YYYYMMDD)·점·하이픈 모두 처리.
// (기존 정규식은 구분자 필수라 컴팩트 날짜를 0매칭→'만료 아님' 오통과시키던 버그가 있었음)
function isDeadlineExpired(deadline) {
  return _isFestivalExpired(deadline, new Date());
}

// 신규 접수가 끝난(종료/폐지 안내) 제도를 걸러낸다.
// '보호종료'(자립준비청년 등) 같은 제도명은 오탐하지 않도록
// '지원/접수/사업/모집/운영 종료', '종료 안내', '폐지' 맥락만 매칭한다.
function isProgramTerminated(item) {
  const text = `${(item && item.title) || ''} ${(item && item.deadline) || ''}`;
  return /(신규지원\s*종료|지원\s*종료|접수\s*종료|사업\s*종료|모집\s*종료|운영\s*종료|종료\s*안내|폐지되었|폐지\s*안내)/.test(text);
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

  // [Step 1 개편] 강력한 필터링 - 화이트리스트 & 블랙리스트
  const fullText = title + ' ' + desc;

  // 블랙리스트 (행정적 공고 등 실질 가치가 떨어지는 것 배제)
  const blacklist = ['상담', '교육', '캠페인', '대회', '멘토링'];
  if (blacklist.some(keyword => fullText.includes(keyword))) {
    return false;
  }

  // [대상 필터] 개인(수도권 주민)이 아닌 기업·사업주가 수혜자인 사업 배제
  // 팁픽은 개인 대상 복지 정보 사이트 → 기업 고용지원금/사업주 지원 등은 정체성 불일치
  const targetText = (item.지원대상 || '') + ' ' + (item.소관기관명 || '') + ' ' + fullText;
  const bizRecipient = ['사업주', '우선지원대상기업', '중견기업', '상시근로자', '근로자를 고용', '구직자를 고용', '를 채용', '사업장 대표', '고용보험 가입 사업'];
  if (bizRecipient.some(keyword => targetText.includes(keyword))) {
    return false;
  }

  // 화이트리스트 (현금성 지원이나 확실한 혜택)
  const whitelist = ['수당', '환급', '바우처', '월세', '캐시백', '장려금', '지원금'];
  if (!whitelist.some(keyword => fullText.includes(keyword))) {
    return false;
  }

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

  const fullText = title + ' ' + desc;

  // 5. 블랙리스트 (학술, 행정, 비대중적 행사 배제)
  const blacklist = [
    '포럼', '세미나', '학술', '간담회', '총회', '워크숍', '연수', '위원회', 
    '발대식', '위촉식', '공모전', '설명회', '캠페인', '토론회', '심포지엄'
  ];
  if (blacklist.some(keyword => fullText.includes(keyword))) {
    return false;
  }

  // 6. 화이트리스트 (대중적이고 인기 있는 키워드 1개 이상 포함 필수)
  const whitelist = [
    // 타겟
    '어린이', '가족', '아이', '키즈', '연인', '커플', '데이트', '청년',
    // 볼거리/계절
    '꽃', '벚꽃', '단풍', '장미', '불꽃', '야경', '미디어아트', '빛축제', '눈꽃',
    // 엔터테인먼트
    '페스티벌', '콘서트', '음악', '공연', '뮤직', '버스킹', '전시', '뮤지컬', '연극',
    // 먹거리/나들이
    '푸드', '야시장', '먹거리', '맛집', '맥주', '와인', '바비큐', '체험', '문화제', '피크닉', '나들이', '캠핑', '플리마켓',
    // 액티비티
    '물놀이', '워터', '걷기', '마라톤', '요가'
  ];
  
  if (!whitelist.some(keyword => fullText.includes(keyword))) {
    return false;
  }

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
        id: sid('fest-seoul', item.TITLE),
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
        id: sid('fest-gg', title),
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
        id: sid('fest-ic', item.idx || item.title),
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

// 두 축제가 중복인지 여부를 강력하게 판별하는 헬퍼 함수
function isFestivalDuplicate(fest, existingFestivals) {
  const normNew = normTitle(fest.title);
  const dateNew = (fest.date || '').trim();
  const locNew = (fest.location || fest.region || '').trim();

  for (const existing of existingFestivals) {
    const normExist = normTitle(existing.title);
    const dateExist = (existing.date || '').trim();
    const locExist = (existing.location || existing.region || '').trim();

    // 1. 완벽히 같은 제목인 경우
    if (existing.title === fest.title || normExist === normNew) return true;

    // 2. 제목이 부분 포함 관계이거나 매우 유사하면서 날짜가 겹치는 경우
    if (normNew.includes(normExist) || normExist.includes(normNew)) {
      // 날짜가 같으면 중복
      if (dateNew === dateExist) return true;
    }

    // 3. 날짜가 정확히 같으면서 위치에 공통 랜드마크 키워드가 들어가고, 제목의 키워드도 겹치는 경우 (강력한 스마트 필터)
    if (dateNew && dateExist && dateNew === dateExist) {
      const sharedLocs = ['전곡항', '제부도', '궁평', '임진각', '동탄', '수원역', '혜화역', '마로니에', '체부홀', '상상캠퍼스', '예술가의집', '여의도', '창경궁'];
      const hasSharedLoc = sharedLocs.some(kw => locNew.includes(kw) && locExist.includes(kw));

      if (locNew === locExist || locNew.includes(locExist) || locExist.includes(locNew) || hasSharedLoc) {
        const titleKeywords = ['뱃놀이', '연등', '빛', '드론', '장미', '가족', '어린이', '음악극', '연극', '재즈', '콘서트', '독주회', '페스티벌', '축제'];
        const hasSharedTitle = titleKeywords.some(kw => fest.title.includes(kw) && existing.title.includes(kw));
        if (hasSharedTitle) return true;
      }
    }
  }

  return false;
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
    지원대상: item.지원대상 || item.trgter || trgter || item.trgterIndvdlArray || item.lifeArray || item.aply_trgt || item.aplyTrgt || item.trgt_nm || '',
    소관기관명: item.소관부처명 || item.소관기관명 || item.bizChrDeptNm || item.jurMnofNm || item.jurOrgNm || item.blnfcInsttNm || item.excl_instt_nm || item.exclInsttNm || item.기관명 || item.sprt_instt_nm || '',
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
  // <item>(기존 소스) + <servList>(복지로 중앙부처 V001) 양쪽 래퍼 지원
  const itemRx = /<(item|servList)>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const block = m[2];
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
    const msgMatch = raw.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/);
    const codeMap = {
      '10': '잘못된요청파라미터', '11': '필수요청파라미터없음',
      '12': '해당OpenAPI서비스없음', '20': '서비스접근거부',
      '30': '등록되지않은서비스키', '31': '기한만료된서비스키',
      '32': '등록되지않은IP', '99': '서버오류',
    };
    const code = codeMatch ? codeMatch[1] : null;
    const msg = msgMatch ? msgMatch[1] : '(메시지 없음)';

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
  // V001은 JSON 요청 시 EFWSV00001 에러 → Accept 헤더 없이 XML로 수신
  const reqOptions = {};
  const safeKey = /%[0-9A-Fa-f]{2}/.test(apiKey) ? apiKey : encodeURIComponent(apiKey);

  const endpoints = [
    {
      name: 'V001',
      url: `https://apis.data.go.kr/B554287/NationalWelfareInformationsV001/NationalWelfarelistV001?serviceKey=${safeKey}&callTp=L&srchKeyCode=003&pageNo=1&numOfRows=20`,
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
      const centralItems = [];
      for (const item of items) {
        const norm = normalizeItem(item, '복지로중앙');
        if (norm.서비스명) centralItems.push(norm);
      }
      // 마감일 있는 데이터 우선 정렬
      centralItems.sort((a, b) => {
        const aHas = a.신청기한 ? 1 : 0;
        const bHas = b.신청기한 ? 1 : 0;
        return bHas - aHas;
      });
      results.push(...centralItems);
      console.log(`[복지로중앙:${ep.name}] ${centralItems.length}건 수집 (마감일 있는 항목 우선 정렬)`);
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
    const url = `https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist?serviceKey=${safeKey}&pageNo=1&numOfRows=20&ctpvNm=${ctpv}&_type=json`;
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
      const regionItems = [];
      for (const item of items) {
        const norm = normalizeItem(item, '복지로지자체');
        if (norm.서비스명) regionItems.push(norm);
      }
      // 마감일 있는 데이터 우선 정렬 (신청기한 비어있으면 뒤로)
      regionItems.sort((a, b) => {
        const aHas = a.신청기한 ? 1 : 0;
        const bHas = b.신청기한 ? 1 : 0;
        return bHas - aHas;
      });
      results.push(...regionItems);
      console.log(`[복지로지자체:${region}] ${regionItems.length}건 수집 (마감일 있는 항목 우선 정렬)`);
    } catch (err) {
      console.log(`[복지로지자체:${region}] 네트워크 오류: ${err.message}`);
    }
  }
  return results;
}

// ─── 1순위: 마이홈포털 주거 지원 공고 (LH·SH·GH 임대주택 모집) ─────────────────
// Endpoint: https://apis.data.go.kr/1613000/HWSPR02/rsdtRcritNtcList
// ENV: PUBLIC_DATA_API_KEY (기존 재사용)
async function fetchMyHomeData(apiKey) {
  const results = [];
  const regions = [
    { code: '11', name: '서울' },
    { code: '28', name: '인천' },
    { code: '41', name: '경기' },
  ];

  for (const region of regions) {
    const url = buildDataGoKrUrl(
      'https://apis.data.go.kr/1613000/HWSPR02/rsdtRcritNtcList',
      apiKey,
      { pageNo: 1, numOfRows: 20, srhRegion: region.code, returnType: 'json' }
    );
    try {
      const res = await fetchWithRetry(url);
      const { json, xmlItems } = await readAndParse(`마이홈포털:${region.name}`, res);
      if (!res.ok) { console.log(`[마이홈포털:${region.name}] HTTP ${res.status} — 위 RAW 참조`); continue; }

      const raw = json
        ? (json?.response?.body?.items?.item || json?.items || json?.data || [])
        : (xmlItems || []);
      const items = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? [raw] : []);

      let regionCount = 0;
      for (const item of items) {
        const houseName   = item.HOUSE_NM      || item.houseNm      || item.house_nm      || '';
        const houseType   = item.HOUSE_SECD_NM || item.houseSecdNm  || item.house_secd_nm
                         || item.HOUSE_TY      || item.houseTy      || item.house_ty      || '';
        const bizName     = item.BSNS_MBY_NM   || item.bsnsMbyNm   || item.bsns_mby_nm   || '';
        const areaName    = item.SUBSCRPT_AREA_CODE_NM || item.subscrptAreaCodeNm || region.name;
        const rceptEnd    = item.RCEPT_ENDDE    || item.rceptEndde   || item.rcept_endde   || '';
        const hmpgAdres   = item.HMPG_ADRES     || item.hmpgAdres    || item.hmpg_adres    || 'https://www.myhome.go.kr';

        if (!houseName && !houseType) continue;

        const title = houseName
          ? `[${areaName}] ${houseName}${houseType ? ` (${houseType})` : ''} 모집 공고`
          : `[${areaName}] ${houseType}${bizName ? ` (${bizName})` : ''} 모집 공고`;

        const deadlineFormatted = rceptEnd && rceptEnd.length === 8
          ? `${rceptEnd.slice(0, 4)}.${rceptEnd.slice(4, 6)}.${rceptEnd.slice(6, 8)}`
          : '';

        results.push({
          서비스명: title.trim(),
          서비스목적요약: `${houseType || '주거 지원'} 수도권 모집 공고. 무주택 세대구성원 대상 임대주택 공급.`,
          지원대상: '무주택 세대구성원',
          소관기관명: bizName || '마이홈포털',
          지원내용: `${houseType || '임대주택'} 공급 모집`,
          신청URL: hmpgAdres,
          신청기한: deadlineFormatted,
          _source: '마이홈포털',
          _raw: item,
        });
        regionCount++;
      }
      console.log(`[마이홈포털:${region.name}] ${items.length}건 수신, ${regionCount}건 정규화`);
    } catch (err) {
      console.warn(`[마이홈포털:${region.name}] 오류: ${err.message}`);
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
  const fmt = (d) => d ? `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}` : '';
  const s = fmt(String(startDate || ''));
  const e = fmt(String(endDate || ''));
  if (!s) return '상시';
  return e && e !== s ? `${s}~${e}` : s;
}

// ─── 폴백 이미지 중복 방지 헬퍼 ─────────────────────────────────────────────
function pickFallback(id, type, usedSet) {
  const hash = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  let num = (hash % 5) + 1;
  if (usedSet.size < 5) {
    while (usedSet.has(num)) {
      num = (num % 5) + 1;
    }
  } else {
    usedSet.clear(); // 5개 모두 사용된 경우 초기화 후 재사용
  }
  usedSet.add(num);
  return num;
}

// ─── 폴백 이미지 경로 헬퍼 (.webp 우선, 없으면 .png) ─────────────────────────
function getFallbackPath(num, type) {
  const webpPath = path.join(__dirname, `../public/images/blogs/fallback-${type}-${num}.webp`);
  const ext = fs.existsSync(webpPath) ? 'webp' : 'png';
  return `/images/blogs/fallback-${type}-${num}.${ext}`;
}

// ─── 테마 매칭 폴백 (무비용): 이미지가 없을 때 generic fallback-festival-N 대신
//     레포의 기존 festival 이미지 풀에서 '제목 주제'에 맞는 미사용 이미지를 골라 배정.
//     경기/인천 등 이미지 미제공 출처의 카드가 동일 이미지로 중복되는 문제를 차단한다.
let _festThemePool = null;
function festThemePool() {
  if (_festThemePool) return _festThemePool;
  try {
    _festThemePool = fs.readdirSync(path.join(__dirname, '../public/images/blogs'))
      .filter(f => /^festival-/i.test(f) && !/^fallback-festival-\d/i.test(f) && /\.(png|webp|jpe?g)$/i.test(f));
  } catch { _festThemePool = []; }
  return _festThemePool;
}
const FEST_THEME_MAP = [
  [/뮤지컬|음악극|오케스트라|콘서트|합창|독주회|밴드|락페|음악|가요|포크|재즈|관현악/, ['오케스트라', '뮤지컬', '음악극', '합창', '독주회', '락페', '펜타포트', '피아노', '바이올린', '클라리넷', 'rapbeat']],
  [/불꽃|미디어아트|빛축제|빛의|야경|루나/, ['미디어아트', '빛과모래', '석조전', '창경궁야연']],
  [/영화|다큐/, ['디아스포라영', '영화']],
  [/연극|거리공연|거리극|공연예술/, ['거리극', '거리공연', '수원연극축제']],
  [/반려|유기견|입양/, ['우리동네사람들', '동물']],
  [/튤립|가든|꽃|숲|정원|산나물|임산물|수목|자연/, ['벚꽃', '정원학교', '산나물', '임산물숲']],
  [/능행차|정조|효문화|왕실|문화제|역사|남사당|바우덕이|산성|구석기|풍물|국악|정약용|포은|회암사|동학|종묘|선농/, ['수원화성문화제', '회암사지왕실', '왕가의산책', '국악', '구석기', '선농대제', '풍물', '정순왕후문화제', '종묘', '동학농민']],
  [/콩|장터|특산물|식품|먹거리|5일장|수확|걷이|빵|요리|도자|시장|마켓/, ['빈티지마켓', '빵지자랑', '수라간시식', '캠핑요리', '도자기', '꼬마농부', '산나물']],
  [/어린이|꼬마|올림픽|학생|청소년|걷기|가족|놀터|동요|유아|동아리|키즈/, ['가족의달어린이', '어린이', '유아', '까치까치', '꼬마농부', '동화', '어린이철도', '어린이과학관']],
  [/책|도서|독서|북앤|출판|일러스트/, ['도서관', '출판도시', '일러스트']],
  [/수상|마린|뱃놀이|물놀이|갯골|물빛|호수/, ['뱃놀이', '갯골']],
  [/어울림|화합|복지|한마당|시민/, ['지구촌어울림', '우리동네사람들', '어울']],
];
function pickThemedFestivalImage(title, usedBasenames) {
  const pool = festThemePool();
  if (!pool.length) return null;
  const t = String(title || '');
  let kws = [];
  for (const [re, list] of FEST_THEME_MAP) if (re.test(t)) { kws = list; break; }
  // 1) 주제 키워드 매칭(미사용 우선)
  for (const kw of kws) {
    const hit = pool.find(f => !usedBasenames.has(f) && f.toLowerCase().includes(kw.toLowerCase()));
    if (hit) { usedBasenames.add(hit); return `/images/blogs/${hit}`; }
  }
  // 2) 주제 없음/소진 → 제목 해시로 결정적 고유 선택
  const avail = pool.filter(f => !usedBasenames.has(f));
  if (!avail.length) return null; // 풀 고갈 → 호출측 generic fallback 사용
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = (((h << 5) + h) + t.charCodeAt(i)) >>> 0;
  const choice = avail[h % avail.length];
  usedBasenames.add(choice);
  return `/images/blogs/${choice}`;
}

// ─── 축제 제목 SEO 정규화 (결정적·무비용) ─────────────────────────────────────
// 문화행사 API(서울/경기/인천/KTO) 원본 제목은 [지역]태그·연도가 없어 SEO 포맷이 들쑥날쑥.
// 모든 축제 제목을 "[지역] 행사명 연도" 로 통일 + 강한 클리셰 제거(키워드는 보존).
function seoFestivalTitle(rawTitle, region, date) {
  let name = String(rawTitle || '').trim();
  if (!name) return name;
  const REGION = ['서울', '인천', '경기', '전국'];
  const tag = REGION.includes(region) ? region : '전국';
  let cityPrefix = '';
  const m = name.match(/^\[([^\]]+)\]\s*/);
  if (m) {
    name = name.slice(m[0].length).trim();
    const extra = m[1].replace(/서울특별시|인천광역시|경기도|서울|인천|경기|전국/g, '').trim();
    if (extra) cityPrefix = extra + ' '; // 도시/주최명은 이름 앞에 보존
  }
  name = name.replace(/\s*(완벽\s*가이드|완벽\s*분석|완벽\s*정리|총정리|A-?Z|한방에)\s*$/i, '').trim();
  name = name.replace(/[\s\-–—,&·]+$/, '').trim();
  name = (cityPrefix + name).replace(/\s{2,}/g, ' ').trim();
  const yr = (String(date || '').match(/20\d\d/) || [])[0];
  if (yr && !/20\d\d/.test(name)) name = `${name} ${yr}`;
  return `[${tag}] ${name}`.replace(/\s{2,}/g, ' ').trim();
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
      if (isProgramTerminated(b)) return false; // 신규접수 종료/폐지 안내 제도 제거
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

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }

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
    const usedBenefitFallbacks = new Set();
    const usedFestFallbacks = new Set();
    // 테마 매칭 폴백에서 이미 배정된(또는 기존 데이터에서 사용 중인) 이미지를 추적 → 카드 간 중복 방지
    const usedFestImages = new Set(
      (existingData.festivals || []).map(f => (f.image ? path.basename(f.image) : '')).filter(Boolean)
    );

    // 중복 체크를 위한 기존 타이틀 셋 구성
    const existingTitles = new Set([
      ...existingData.festivals.map(f => f.title),
      ...existingData.benefits.map(b => b.title)
    ]);
    const existingBenefitNorm = new Set(existingData.benefits.map(b => normTitle(b.title)));
    // 시맨틱 중복 판정용 raw 제목 목록(지역 가드 + 핵심명사 Jaccard). 삽입마다 갱신.
    const existingBenefitTitles = existingData.benefits.map(b => b.title);

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
        // prefix 5자 기반 유사 중복 검사
        const _normT = normTitle(title);
        const _prefix = _normT.slice(0, 5);
        if (_prefix.length >= 4 && [...existingBenefitNorm].some(n => n.startsWith(_prefix))) continue;
        // 시맨틱 중복(같은 지역·같은 사업, AI 변형 제목) 차단
        const _dupHit = findBenefitDuplicate(title, [...existingBenefitTitles, ...collectedTitles]);
        if (_dupHit) { console.log(`  ✗ 시맨틱 중복 스킵: ${title} ≈ ${_dupHit}`); continue; }

        // ─── 수도권 외 지역 필터링 ───────────────────────────────────────────────
        const itemText = [item.서비스명, item.서비스목적요약, item.지원대상, item.소관기관명].filter(Boolean).join(' ');
        const nonMetroRegions = ['부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '사천', '창원', '진주', '통영', '거제', '포항', '경주', '안동', '구미', '여수', '순천', '목포', '전주', '청주', '천안', '아산', '경상남도', '경상북도', '전라남도', '전라북도', '충청남도', '충청북도', '강원도', '제주도'];
        // 지원대상까지 검사 → '전국' 라벨이라도 비수도권 지자체가 실제 자격지역이면 적발
        const hasNonMetro = nonMetroRegions.some(r => item.소관기관명?.includes(r) || item.서비스명?.includes(r) || item.지원대상?.includes(r));
        // '전국'은 metro 통과 사유에서 제외 → 비수도권 지자체 한정 사업이 '전국'에 묻어 통과되는 구멍 차단
        const hasMetro = ['서울', '인천', '경기', '수도권'].some(r => itemText.includes(r));

        if (hasNonMetro && !hasMetro) {
          console.log(`  ✗ 수도권 외 지역 스킵: ${item.서비스명} [${item.소관기관명 || ''}]`);
          continue;
        }
        // ──────────────────────────────────────────────────────────────────────────

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

    // ① 1순위: 마이홈포털 주거 지원 공고 (LH·SH·GH 임대주택)
    if (newItems.length < DAILY_LIMIT) {
      console.log('\n[지원금] 1순위 수집 - 마이홈포털 주거 지원...');
      addItems(await fetchMyHomeData(govApiKey));
      console.log(`  소계: ${newItems.length}건`);
    }

    // ① 1순위: 복지로 중앙부처 (한국사회보장정보원 V001)
    if (newItems.length < DAILY_LIMIT) {
      console.log('\n[지원금] 1순위 수집 - 복지로 중앙부처...');
      addItems(await fetchBokjiroCentral(govApiKey));
      console.log(`  소계: ${newItems.length}건`);
    }

    // ① 1순위: 복지로 지자체 (서울·인천·경기, 중장년·노년)
    if (newItems.length < DAILY_LIMIT) {
      console.log('\n[지원금] 1순위 수집 - 복지로 지자체...');
      addItems(await fetchBokjiroLocal(govApiKey));
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

    let skipBenefit = false;
    if (newItems.length < 3) {
      console.log(`[지원금] 오늘 수집된 고가치 데이터가 3개 미만(${newItems.length}건)이므로 품질 유지를 위해 지원금 수집 및 발행 처리를 스킵합니다.`);
      skipBenefit = true;
    }

    if (!skipBenefit) {
      // ─── 핫 키워드 기준으로 지원금 데이터 정렬 ──────────────────────────────────
      const benefitHotKeywords = await getTodayHotKeywords('benefit');
      console.log(`[지원금] 핫 키워드 반영 정렬 시작 (키워드: ${benefitHotKeywords.slice(0, 3).join(', ')})`);
      newItems.sort((a, b) => calcHotScore(b, benefitHotKeywords) - calcHotScore(a, benefitHotKeywords));
      // ──────────────────────────────────────────────────────────────────────────────

      // ─── Gemini 구글검색 보완 (지원금) ───────────────────────────────────────
      const benefitSupplements = await supplementWithGemini(
        benefitHotKeywords,
        'benefit',
        new Set(existingData.benefits.map(b => b.title)),
        geminiApiKey
      );
      for (const item of benefitSupplements) {
        const norm = normTitle(item.title);
        // prefix 5자 기반 유사 중복 검사: 같은 주제의 다른 표현 제목 차단
        const normPrefix = norm.slice(0, 5);
        const isPrefixDup = normPrefix.length >= 4 && [...existingBenefitNorm].some(n => n.startsWith(normPrefix));
        const semDup = findBenefitDuplicate(item.title, existingBenefitTitles);
        if (!existingTitles.has(item.title) && !existingBenefitNorm.has(norm) && !isPrefixDup && !semDup && !isProgramTerminated(item)) {
          const _benefitId = sid('gemini-benefit', item.title);
          const _benefitFallbackNum = pickFallback(_benefitId, 'benefit', usedBenefitFallbacks);
          existingData.benefits.unshift({
            id: _benefitId,
            region: item.region || '전국',
            title: item.title,
            target: item.target || '누구나',
            deadline: item.deadline || '상시',
            image: getFallbackPath(_benefitFallbackNum, 'benefit'),
            isEmergency: false,
            details: item.details || '',
            detailedExplanation: item.detailedExplanation || '', // 상세페이지 "지원 내용" 본문 (6/1 형식)
            link: item.link || '',
            requirements: item.requirements || [],
            howToApply: item.howToApply || [],
            eligibilityQuiz: item.eligibilityQuiz || [],
            tip: item.practicalTip || item.tip || '',
            practicalTip: item.practicalTip || '', // 블로그 생성기 참조 필드 (6/1 형식)
            targetPersona: item.targetPersona || '누구나',
            coreValue: item.coreValue || '유용한 혜택',
            simulation: item.simulation || '',
            highlight: item.highlight || '', // 목록 카드 금액 강조 (없으면 클라이언트가 본문에서 추출)
            faq: Array.isArray(item.faq) ? item.faq.filter(f => f && f.q && f.a) : [],
            rejectionReasons: Array.isArray(item.rejectionReasons) ? item.rejectionReasons.filter(Boolean) : [],
            addedAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
          });
          existingTitles.add(item.title);
          existingBenefitNorm.add(norm);
          existingBenefitTitles.push(item.title);
          if (!DRY_RUN) fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
          console.log(`✓ [Gemini 보완 지원금] 추가됨: ${item.title}`);
        } else {
          console.log(`  ✗ [Gemini 보완 지원금] 중복 스킵: ${item.title}`);
        }
      }
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

      // 💡 이미지 생성 시 너무 빠른 API 요청으로 인한 실패(Rate Limit) 방지 지연 함수
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      // 이미지 경로 중복 방지: 기존 pick-info.json에 이미 등록된 이미지 경로 셋
      const existingImagePaths = new Set([
        ...existingData.festivals.map(f => f.image).filter(Boolean),
        ...existingData.benefits.map(b => b.image).filter(Boolean),
      ]);

      for (const [index, selectedData] of selectedDataItems.entries()) {
        const titleToCheck = selectedData.서비스명;
        console.log(`[${index + 1}/${selectedDataItems.length}] 데이터 처리 시작: ${titleToCheck}`);

        // 지연 (첫번째는 제외) - 자동 배포 안정성 확보 (봇 의심 및 IP 차단 방지)
        if (index > 0) {
          console.log('안정적인 API 처리를 위해 1.5초 대기 중...');
          await delay(1500);
        }

        // ─── Step 2: 마이홈포털 부동산 특화 프롬프트 분기 ───────────────────────
        const isHousingSource = selectedData._source === '마이홈포털';
        const geminiPromptText = isHousingSource
          ? `아래 공공데이터 1건은 LH·SH·GH 등의 임대주택 모집 공고입니다. 부동산/주거 특화 JSON으로 변환해줘.
무주택 서민·청년·신혼부부가 실질적으로 유용하게 읽을 수 있어야 하며, 구글/네이버 SEO를 위해 독창적 가공이 매우 중요해.

형식:
{
  id: 랜덤숫자,
  region: '서울', '인천', '경기', '전국' 중 택1,
  type: 'benefit',
  title: '반드시 LH, SH, GH, 주거, 임대 중 하나 포함. [지역명] + 주거키워드 + 주택유형 + 핵심정보 조합. 예: [서울] LH 행복주택 청년 전용 2026 소득 기준과 신청 일정 / [경기] SH 국민임대 신혼부부 보증금 얼마까지 가능할까. ⚠️ 제목 끝에 "총정리/완벽 가이드/완벽 분석/A-Z/한방에" 같은 상투적 표현 사용 금지. 검색자가 궁금해할 구체 포인트(소득 기준·보증금 액수·신청 일정·자격 조건 등)로 매번 다르게 마무리할 것.',
  date: '공고 마감일 YYYY.MM.DD 또는 상시',
  target: '반드시 무주택, 임대, 주거 중 하나 포함. 예: 무주택 세대구성원, 무주택 청년, 소득 5분위 이하 무주택 신혼부부.',
  summary: '보증금·월세 예상 금액 + 신청 자격(소득 기준) + 지금 확인하세요 순서로 작성. 반드시 ~하세요 또는 ~확인하세요로 끝낼 것. 100자 이내.',
  detailedExplanation: '임대주택 공고를 신청자가 빠르게 파악하도록 소제목 구조로 작성. ■로 시작하는 텍스트 소제목 3개(예: ■ 어떤 주택인가 / ■ 보증·대출 조건 / ■ 신청하면 유리한 경우 — 문구는 내용에 맞게 자연스럽게)를 각 줄 맨 앞에 두고, 각 소제목 아래 2~3줄의 짧은 문단을 쓸 것. 소제목 줄과 본문, 각 블록 사이는 반드시 \\n\\n으로 분리. 전체 400~600자로 짧고 명확하게(억지로 늘리거나 같은 내용 반복 금지). Markdown 금지: ## , ** , 단독 - 불릿, 백틱 사용하지 말 것 — 강조·구분은 ■ 텍스트 기호와 줄바꿈으로만.',
  location: '',
  link: '공식 사이트 URL. 없으면 https://www.myhome.go.kr',
  tag: '마감일이 30일 이내이면 마감임박, 상시 모집이면 상시, 그 외엔 추천',
  imagePrompt: 'Korean public housing apartment complex modern building exterior, flat illustration, no people, no faces, blue sky background',
  requirements: ['무주택확인서 (정부24 온라인 발급 가능)', '소득증명원 (최근 3개월)', '주민등록등본', '청약통장 사본 (해당 시)'],
  howToApply: ['마이홈포털(www.myhome.go.kr) 온라인 청약 신청', '청약홈(applyhome.co.kr)에서 공고 확인', '현장 접수 또는 우편 접수 (공고문 확인)'],
  targetPersona: '이 공고를 가장 필요로 할 구체적인 대상. 예: 소득 5분위 이하 무주택 청년, 결혼 7년 이내 신혼부부.',
  coreValue: '이 공고의 핵심 가치. 예: 시세 대비 30~50% 저렴한 임대료로 수도권 주거 안정.',
  eligibilityQuiz: [
    '세대원 전원이 무주택자입니까?',
    '해당 지역(서울·인천·경기)에 거주하거나 직장이 있으십니까?',
    '도시근로자 월평균 소득 100% 이하에 해당하십니까?',
    '부동산·자동차 등 자산 기준을 충족하십니까?'
  ],
  simulation: '전용면적별 보증금·월 임대료 예상 시뮬레이션. 예: 전용 36㎡ 기준 보증금 약 3,000만원·월 임대료 약 15만원, 시세 대비 약 40% 절감. 연간 약 180만원·5년 약 900만원 절약 효과.',
  highlight: '목록 카드에 강조할 핵심 금액/혜택 한 줄. 예: 보증금 3,000만원·월 15만원, 시세 대비 40% 절감. 금액 혜택이 없으면 빈 문자열.',
  practicalTip: '임대주택 신청 실무 팁. 예: 무주택확인서는 정부24에서 무료 발급. 소득·자산 기준은 전년도 기준 적용. 청약통장 납입 횟수가 당첨 순위에 직접 영향. 사전청약·본청약 일정 차이 필수 확인.',
  faq: [{ q: '무주택 요건은 세대원 전원이 충족해야 하나요?', a: '구체적 답변 1~2문장' }, { q: '소득·자산 기준은 어떻게 되나요?', a: '답변' }, { q: '청약통장이 꼭 필요한가요?', a: '답변' }],
  rejectionReasons: ['소득·자산 기준 초과', '무주택 요건 미충족(세대원 중 주택 보유)', '거주·청약통장 등 우선순위 요건 미달']
}

반드시 JSON 객체만 출력해. 다른 텍스트 없이.
공공데이터:
${JSON.stringify(selectedData)}`
          : `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘.
이 데이터는 웹사이트에 상세 페이지로 자동 배포되므로, 구글/네이버 검색 노출(SEO)을 위해 '유사 문서'로 분류되지 않는 독창적인 가공이 매우 중요해.

형식:
{
  id: 랜덤숫자,
  region: '서울', '인천', '경기', '전국' 중 택1,
  type: 'festival' 또는 'benefit',
  title: '구글 검색자가 실제로 입력할 법한 제목으로 작성. 반드시 [지역명] + 핵심혜택 또는 행사명 + 구체적 수치나 연도 조합. 예: [서울] 중랑 장미축제 2026 무료입장·주차 정보 / [경기] 청년 월세 20만원, 소득 얼마면 받을까. 검색자가 이 제목을 보고 바로 이게 내가 찾던 것이라고 느껴야 함. 절대 뭉뚱그린 제목 금지. ⚠️ 제목 끝에 "총정리/완벽 가이드/완벽 분석/A-Z/한방에" 같은 상투적 표현 사용 금지 — 검색 의도에 맞춰 매번 다른 방식(자격·금액·일정·대상·후기)으로 마무리할 것.',
  date: 'YYYY.MM.DD~YYYY.MM.DD' 또는 마감일,
  target: 지원대상,
  summary: '구글 검색 결과에 노출되는 메타 디스크립션. 반드시 구체적 날짜나 금액 수치 포함. 형식: 언제/어디서 + 무엇을 + 얼마나 + 지금 확인하세요 순서로 작성. 예시(축제): 5월 15~23일 중랑장미공원 천만 송이 장미 무료 관람! 인생샷 스팟과 주차 꿀팁까지 한번에 확인하세요. 예시(지원금): 서울 청년이라면 월 최대 20만원 월세 지원 받을 수 있습니다. 신청 자격과 서류를 2분 만에 확인하세요. 반드시 ~하세요 또는 ~확인하세요로 끝낼 것. 100자 이내.',
  detailedExplanation: '지원금을 신청자가 빠르게 파악하도록 소제목 구조로 작성. ■로 시작하는 텍스트 소제목 3개(예: ■ 무엇을 지원하나 / ■ 얼마나 받나 / ■ 누가 받으면 유리한가 — 문구는 내용에 맞게 자연스럽게)를 각 줄 맨 앞에 두고, 각 소제목 아래 2~3줄의 짧은 문단을 쓸 것. 소제목 줄과 본문, 각 블록 사이는 반드시 \\n\\n으로 분리. 전체 400~600자로 짧고 명확하게(억지로 늘리거나 같은 내용 반복 금지). Markdown 금지: ## , ** , 단독 - 불릿, 백틱 사용하지 말 것 — 강조·구분은 ■ 텍스트 기호와 줄바꿈으로만.',
  location: '행사 장소명 또는 주소 (festival일 때만. benefit이면 빈 문자열)',
  link: 상세URL,
  tag: '마감일이 오늘로부터 30일 이내이면 반드시 마감임박, 마감일이 없거나 상시 모집이면 상시, 그 외엔 추천',
  imagePrompt: 'Create a short descriptive English prompt (max 10 words) for an AI image generator. Focus on objects, scenery and atmosphere only. No text, no faces, no people, no characters. Return only the English prompt, nothing else.',
  requirements: ['필요서류1', '필요서류2'],
  howToApply: ['신청방법1', '신청방법2'],
  targetPersona: '이 정보를 가장 필요로 할 구체적인 대상 (예: 영유아 자녀를 둔 3040 부모)',
  coreValue: '이 정보가 주는 핵심 가치 요약 (예: 가성비 주말 나들이, 청년 주거비 절감)',
  eligibilityQuiz: ['자격 요건 O/X 질문1', '자격 요건 O/X 질문2', '질문3', '질문4'],
  simulation: '타겟 페르소나를 가정한 구체적인 연간 체감 혜택이나 예상 절약 금액 시뮬레이션 (지원금인 경우 필수, 축제는 빈 문자열)',
  highlight: '목록 카드에 강조할 핵심 금액/혜택 한 줄. 예: 최대 330만원, 월 20만원. 지원금이고 금액 혜택이 있을 때만, 없으면 빈 문자열 (축제는 빈 문자열)',
  practicalTip: '관공서 서류 제출 시 누락하기 쉬운 점이나 축제 현장의 주차/편의성 등 실무적이고 디테일한 팁',
  faq: [{ q: '신청자가 실제로 궁금해할 질문', a: '구체적이고 정확한 답변 1~2문장' }, { q: '질문2', a: '답변2' }, { q: '질문3', a: '답변3' }],
  rejectionReasons: ['이 지원금에서 자주 탈락/거절되는 실제 사유1 (예: 소득 기준 초과, 거주 기간 미달)', '사유2', '사유3']
}

내용을 보고 행사/축제면 type을 'festival', 지원금/서비스면 'benefit'으로 판단해.
eligibilityQuiz는 지원 대상을 분석해서 1분 자격 진단기 연동을 위한 구체적인 O/X 퀴즈 형식으로 3~4개 세분화해서 만들어줘.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.
공공데이터:
${JSON.stringify(selectedData)}`;

        const promptObj = {
          contents: [{
            parts: [{
              text: geminiPromptText
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
        } catch (e) {
          console.error('Gemini 응답 JSON 파싱 에러:', textResult);
          continue; // 파싱 실패해도 다음 데이터 처리는 계속 진행
        }

        // 마이홈포털 주거 키워드 강제 검증: title·target에 주거 키워드 없으면 접두 보완
        if (isHousingSource) {
          const housingKws = ['LH', 'SH', 'GH', '주거', '임대', '청약', '행복주택', '국민임대'];
          const titleHasKw = housingKws.some(kw => (parsedParams.title || '').includes(kw));
          const targetHasKw = housingKws.some(kw => (parsedParams.target || '').includes(kw));
          if (!titleHasKw) {
            parsedParams.title = `[임대주택] ${parsedParams.title || selectedData.서비스명}`;
          }
          if (!targetHasKw) {
            parsedParams.target = `무주택 세대구성원 (${parsedParams.target || '수도권 거주자'})`;
          }
        }

        // Gemini가 생성한 id는 충돌 위험 → 원본 공공데이터의 안정 키(서비스명+소관기관명)로
        // 결정적 ID 생성. 같은 제도는 재수집돼도 같은 URL을 유지(churn 방지).
        const _stableKey = `${selectedData.서비스명 || ''}|${selectedData.소관기관명 || ''}`;
        const newId = sid(parsedParams.type === 'festival' ? 'fest' : 'b', _stableKey);
        const seed = Math.floor(Math.random() * 1000) + index;
        let rawPrompt = (parsedParams.imagePrompt || parsedParams.title);

        // 한글 포함 여부 확인 후 기본값으로 교체
        const hasKorean = /[가-힣]/.test(rawPrompt);
        if (hasKorean) {
          rawPrompt = isHousingSource
            ? 'korean-public-housing-apartment-complex-modern-exterior'
            : parsedParams.type === 'festival' ? 'korean-festival-colorful-outdoor-event' : 'korean-government-welfare-benefit-support';
          console.log(`[안내] 프롬프트에 한글 포함 → 기본 영문으로 교체: ${rawPrompt}`);
        }

        let safePrompt = rawPrompt
          .replace(/[^\w\s-]/g, '') // 한글·특수문자 제거 (영숫자·공백·대시만 유지)
          .replace(/\s+/g, '-')
          .toLowerCase()
          .trim();

        // 프롬프트가 비어있거나 5자 미만이면 타입별 기본값 사용
        if (!safePrompt || safePrompt.length < 5) {
          safePrompt = parsedParams.type === 'festival' ? 'korean-festival-colorful-outdoor-event' : 'korean-government-welfare-benefit-support';
          console.log(`[안내] 프롬프트가 비어있어 기본 키워드로 변경되었습니다: ${safePrompt}`);
        }

        // 숫자·특수문자로만 구성된 경우 기본값으로 교체
        if (/^[\d\-_]+$/.test(safePrompt)) {
          safePrompt = parsedParams.type === 'festival' ? 'korean-festival-colorful-outdoor-event' : 'korean-government-welfare-benefit-support';
          console.log(`[안내] 프롬프트가 숫자/특수문자만으로 구성되어 기본 키워드로 변경: ${safePrompt}`);
        }

        // 타입별 구체적 prefix 추가 (Gemini 생성 프롬프트 앞에 붙이기)
        const typePrefix = parsedParams.type === 'festival'
          ? 'south-korean-outdoor-festival-scene-colorful-cheerful-'
          : 'south-korean-government-support-concept-warm-helpful-';
        safePrompt = typePrefix + safePrompt;

        // 인물/얼굴 방지 + 인포그래픽 스타일 강제
        const noPersonSuffix = '-no-people-no-face-no-character-infographic-style-flat-illustration';
        safePrompt = safePrompt + noPersonSuffix;

        // 이미지 중복 방지: 동일 경로 존재 시 seed +100 재시도 (최대 3회)
        let currentSeed = seed;
        let localImagePath = `/images/blogs/${safePrompt.substring(0, 30).toLowerCase()}-${currentSeed}.webp`;
        let externalImageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=800&height=600&seed=${currentSeed}&nologo=true&format=webp`;

        for (let dupAttempt = 0; dupAttempt < 3; dupAttempt++) {
          if (!existingImagePaths.has(localImagePath)) break;
          console.log(`[중복] 이미지 경로 중복 감지 → seed +100 재시도 (${dupAttempt + 1}/3): ${localImagePath}`);
          currentSeed += 100;
          localImagePath = `/images/blogs/${safePrompt.substring(0, 30).toLowerCase()}-${currentSeed}.webp`;
          externalImageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=800&height=600&seed=${currentSeed}&nologo=true&format=webp`;
        }

        // 3회 모두 중복이면 타임스탬프 기반 고유 파일명 사용
        if (existingImagePaths.has(localImagePath)) {
          const typePrefix = parsedParams.type === 'festival' ? 'festival' : 'benefit';
          localImagePath = `/images/blogs/${typePrefix}-${Date.now()}.webp`;
          console.log(`[중복] 3회 모두 중복 → 타임스탬프 파일명 사용: ${localImagePath}`);
        }

        const absoluteImagePath = path.join(__dirname, '../public', localImagePath);

        console.log(`이미지 다운로드 시도: ${externalImageUrl}`);
        let finalImageUrl = localImagePath;

        try {
          const imgRes = await fetch(externalImageUrl);
          const contentType = imgRes.headers.get('content-type');

          if (imgRes.ok && contentType && contentType.startsWith('image/')) {
            const arrayBuffer = await imgRes.arrayBuffer();
            if (!DRY_RUN) {
              fs.writeFileSync(absoluteImagePath, Buffer.from(arrayBuffer));
              if (fs.existsSync(absoluteImagePath)) {
                console.log(`이미지 로컬 저장 성공: ${localImagePath}`);
              } else {
                console.log(`이미지 저장 후 파일 없음 — 폴백 사용: ${localImagePath}`);
                const _verifyFallback = pickFallback(newId, parsedParams.type, parsedParams.type === 'festival' ? usedFestFallbacks : usedBenefitFallbacks);
                finalImageUrl = (parsedParams.type === 'festival' ? pickThemedFestivalImage(parsedParams.title, usedFestImages) : null) || getFallbackPath(_verifyFallback, parsedParams.type === 'festival' ? 'festival' : 'benefit');
              }
            } else {
              console.log(`[DRY RUN] 이미지 저장 건너뜀: ${localImagePath}`);
            }
          } else {
            console.log(`이미지 생성 실패(Type: ${contentType}), 폴백 이미지로 대체`);
            const _fallbackNum1 = pickFallback(newId, parsedParams.type, parsedParams.type === 'festival' ? usedFestFallbacks : usedBenefitFallbacks);
            finalImageUrl = (parsedParams.type === 'festival' ? pickThemedFestivalImage(parsedParams.title, usedFestImages) : null) || getFallbackPath(_fallbackNum1, parsedParams.type === 'festival' ? 'festival' : 'benefit');
          }
        } catch (e) {
          console.log('이미지 처리 중 간헐적 오류 발생, 폴백 이미지로 대체:', e.message);
          const _fallbackNum2 = pickFallback(newId, parsedParams.type, parsedParams.type === 'festival' ? usedFestFallbacks : usedBenefitFallbacks);
          finalImageUrl = (parsedParams.type === 'festival' ? pickThemedFestivalImage(parsedParams.title, usedFestImages) : null) || getFallbackPath(_fallbackNum2, parsedParams.type === 'festival' ? 'festival' : 'benefit');
        }

        // Gemini가 변환한 제목으로 한 번 더 중복 검사 (원본 API 제목과 달라진 경우 대비)
        const _transformedTitle = (parsedParams.title || titleToCheck).trim();
        const _transformedNorm = normTitle(_transformedTitle);
        const _transformedPrefix = _transformedNorm.slice(0, 5);
        const _semDup2 = parsedParams.type !== 'festival' ? findBenefitDuplicate(_transformedTitle, existingBenefitTitles) : null;
        if (existingTitles.has(_transformedTitle) || existingBenefitNorm.has(_transformedNorm) || _semDup2 ||
            (_transformedPrefix.length >= 4 && [...existingBenefitNorm].some(n => n.startsWith(_transformedPrefix)))) {
          console.log(`  ✗ [스킵] Gemini 변환 후 중복 감지: ${_transformedTitle}${_semDup2 ? ' ≈ ' + _semDup2 : ''}`);
          continue;
        }

        if (parsedParams.type === 'festival') {
          existingData.festivals.unshift({
            id: newId,
            region: parsedParams.region || '전국',
            title: _transformedTitle,
            date: parsedParams.date || '상시',
            tag: parsedParams.tag || '신규',
            image: finalImageUrl,
            location: parsedParams.location || '',
            description: parsedParams.summary || '',
            targetPersona: parsedParams.targetPersona || '누구나',
            coreValue: parsedParams.coreValue || '유용한 정보',
            practicalTip: parsedParams.practicalTip || ''
          });
          existingTitles.add(_transformedTitle);
        } else {
          // 만료된 공고 스킵
          if (isDeadlineExpired(parsedParams.date)) {
            console.log(`[스킵] 만료된 공고 건너뜀: ${titleToCheck} (마감: ${parsedParams.date})`);
            continue;
          }
          // 신규접수 종료/폐지 안내 제도 스킵
          if (isProgramTerminated({ title: parsedParams.title || titleToCheck, deadline: parsedParams.date })) {
            console.log(`[스킵] 종료된 제도 건너뜀: ${titleToCheck}`);
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
            title: _transformedTitle,
            target: parsedParams.target || '누구나',
            deadline: parsedParams.date || '상시',
            image: finalImageUrl,
            isEmergency: parsedParams.tag === '마감임박' && !isDeadlineExpired(parsedParams.date),
            details: parsedParams.summary || '상세 정보는 공식 홈페이지를 참조하세요.',
            detailedExplanation: parsedParams.detailedExplanation || '', // 상세페이지 "지원 내용" 본문 (6/1 형식)
            link: parsedParams.link || '',
            requirements: requirements,
            howToApply: howToApply,
            eligibilityQuiz: eligibilityQuiz,
            tip: parsedParams.practicalTip || parsedParams.tip || "신청 기간이 지나기 전에 미리 확인하고 혜택을 챙기세요!",
            practicalTip: parsedParams.practicalTip || '', // 블로그 생성기 참조 필드 (6/1 형식)
            targetPersona: parsedParams.targetPersona || '누구나',
            coreValue: parsedParams.coreValue || '유용한 혜택',
            simulation: parsedParams.simulation || '',
            highlight: parsedParams.highlight || '', // 목록 카드 금액 강조 (없으면 클라이언트가 본문에서 추출)
            faq: Array.isArray(parsedParams.faq) ? parsedParams.faq.filter(f => f && f.q && f.a) : [],
            rejectionReasons: Array.isArray(parsedParams.rejectionReasons) ? parsedParams.rejectionReasons.filter(Boolean) : [],
            addedAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
          });
          // 같은 실행 내 후속 항목에서도 중복 방지: 즉시 셋 갱신
          existingTitles.add(_transformedTitle);
          existingBenefitNorm.add(_transformedNorm);
          existingBenefitTitles.push(_transformedTitle);
        }

        // 1건 처리될 때마다 파일에 동기화하여 중간에 다운되어도 데이터 유실 방지
        if (DRY_RUN) { console.log('[DRY RUN] 파일 저장 건너뜀'); } else {
          fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
        }
        console.log(`✓ 정상 추가됨: ${titleToCheck}`);
      }
    } // End of !skipBenefit

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
        ? `${fest.eventenddate.slice(0, 4)}.${fest.eventenddate.slice(4, 6)}.${fest.eventenddate.slice(6, 8)}`
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
        id: fest.contentid ? `fest-${fest.contentid}` : sid('fest', title),
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

    const validFests = allFestItems.filter(fest => isFestivalQuality(fest));
    let skipFestival = false;
    if (validFests.length < 3) {
      console.log(`[축제] 오늘 수집된 고가치 데이터가 3개 미만(${validFests.length}건)이므로 품질 유지를 위해 축제 수집 및 발행 처리를 스킵합니다.`);
      skipFestival = true;
    }

    if (!skipFestival) {
      // ─── 핫 키워드 기준으로 축제 데이터 정렬 ────────────────────────────────────
      const festHotKeywords = await getTodayHotKeywords('festival');
      console.log(`[축제] 핫 키워드 반영 정렬 시작 (키워드: ${festHotKeywords.slice(0, 3).join(', ')})`);
      allFestItems.sort((a, b) => calcHotScore(b, festHotKeywords) - calcHotScore(a, festHotKeywords));
      // ──────────────────────────────────────────────────────────────────────────────

      const existingFestTitles = new Set(existingData.festivals.map(f => f.title));
      const existingFestNorm = new Set(existingData.festivals.map(f => normTitle(f.title)));
      // 장소+날짜 조합으로도 중복 감지 (제목이 달라도 같은 행사인 경우 방지)
      const existingFestLocDate = new Set(
        existingData.festivals
          .filter(f => f.location && f.date)
          .map(f => `${f.location.trim()}|${f.date.trim()}`)
      );

      // ─── Gemini 구글검색 보완 (축제) ─────────────────────────────────────────
      const festSupplements = await supplementWithGemini(
        festHotKeywords,
        'festival',
        new Set(existingData.festivals.map(f => f.title)),
        geminiApiKey
      );
      for (const item of festSupplements) {
        item.title = seoFestivalTitle(item.title, item.region, item.date); // SEO 제목 정규화
        if (!isFestivalDuplicate(item, existingData.festivals)) {
          const _festId = sid('gemini-fest', item.title);
          const _festFallbackNum = pickFallback(_festId, 'festival', usedFestFallbacks);
          existingData.festivals.unshift({
            id: _festId,
            region: item.region || '전국',
            title: item.title,
            date: item.date || '상시',
            tag: item.tag || '신규',
            image: pickThemedFestivalImage(item.title, usedFestImages) || getFallbackPath(_festFallbackNum, 'festival'),
            location: item.location || '',
            description: item.description || '',
            link: item.link || '',
          });
          existingFestTitles.add(item.title);
          existingFestNorm.add(normTitle(item.title));
          if (!DRY_RUN) fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
          console.log(`✓ [Gemini 보완 축제] 추가됨: ${item.title}`);
        } else {
          console.log(`  ✗ [Gemini 보완 축제] 유사 중복 스킵: ${item.title}`);
        }
      }
      // ──────────────────────────────────────────────────────────────────────────────

      for (const fest of allFestItems) {
        const title = seoFestivalTitle(fest.title, fest.region, fest.date); // SEO 제목 정규화
        if (!title) continue;
        fest.title = title; // 중복검사·콘텐츠생성·저장 모두 정규화 제목으로 일관

        if (isFestivalDuplicate(fest, existingData.festivals)) {
          console.log(`  ✗ [축제] 유사 중복 스킵: ${title}`);
          continue;
        }

        // ─── 수도권 외 지역 축제 필터링 ─────────────────────────────────────────
        const festText = [fest.title, fest.description, fest.location, fest.region].filter(Boolean).join(' ');
        const festNonMetro = ['부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '사천', '창원', '진주', '통영', '거제', '포항', '경주', '안동', '구미', '여수', '순천', '목포', '전주', '청주', '천안', '아산'];
        const isFestNonMetro = festNonMetro.some(r => fest.region?.includes(r) || fest.location?.includes(r));
        const isFestMetro = ['서울', '인천', '경기', '수도권'].some(r => festText.includes(r));

        if (isFestNonMetro && !isFestMetro) {
          console.log(`  ✗ [축제] 수도권 외 지역 스킵: ${title}`);
          continue;
        }
        // ──────────────────────────────────────────────────────────────────────────

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
          const localImageName = `festival-${String(title).replace(/[^\w\uAC00-\uD7A3]/g, '').slice(0, 10)}-${seed}.png`;
          const localImagePath = `/images/blogs/${localImageName}`;
          const absoluteImagePath = path.join(__dirname, '../public', localImagePath);
          try {
            const imgRes = await fetch(imageUrl);
            const contentType = imgRes.headers.get('content-type');
            if (imgRes.ok && contentType && contentType.startsWith('image/')) {
              const buf = await imgRes.arrayBuffer();
              if (!DRY_RUN) {
                fs.writeFileSync(absoluteImagePath, Buffer.from(buf));
                console.log(`[축제] 이미지 저장: ${localImagePath}`);
              } else {
                console.log(`[DRY RUN] 축제 이미지 저장 건너뜀: ${localImagePath}`);
              }
              finalImageUrl = localImagePath;
            } else {
              throw new Error(`이미지 타입 불일치: ${contentType}`);
            }
          } catch (e) {
            console.warn(`[축제] 이미지 다운로드 실패, 폴백 사용: ${e.message}`);
            finalImageUrl = pickThemedFestivalImage(title, usedFestImages) || getFallbackPath(pickFallback(fest.id || fest.servId || title, 'festival', usedFestFallbacks), 'festival');
          }
        } else if (imageUrl) {
          finalImageUrl = imageUrl; // 이미 로컬 경로인 경우
        } else {
          finalImageUrl = pickThemedFestivalImage(title, usedFestImages) || getFallbackPath(pickFallback(fest.id || fest.servId || title, 'festival', usedFestFallbacks), 'festival');
        }

        const generatedContent = await generateFestivalContent(
          { title, date: fest.date, location: fest.location, description: fest.description, link: fest.link },
          geminiApiKey,
          process.env.GEMINI_MODEL
        );

        const newFest = {
          id: fest.id || sid('fest', fest.title),
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
          content: generatedContent,
        };

        const festLocDateKey = (newFest.location && newFest.date) ? `${newFest.location.trim()}|${newFest.date.trim()}` : null;
        existingData.festivals.unshift(newFest);
        existingFestTitles.add(title);
        existingFestNorm.add(normTitle(title));
        if (festLocDateKey) existingFestLocDate.add(festLocDateKey);
        if (DRY_RUN) { console.log('[DRY RUN] 파일 저장 건너뜀'); } else {
          fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
        }
        console.log(`✓ [축제] 추가됨: ${title} (${newFest.region}, ${newFest.date}) [${fest._source}]`);
      }
    } // End of !skipFestival
    // ──────────────────────────────────────────────────────────────────────

    // 만약 둘 다 스킵되었다면 프로세스 종료 코드를 다르게 주거나 로그를 남길 수 있습니다.
    if (skipBenefit && skipFestival) {
      console.log('✅ 오늘 등록할 양질의 데이터가 없어(모두 3개 미만) 파이프라인 처리를 종료합니다.');
      process.exit(0);
    }

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
