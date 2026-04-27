const fs = require('fs');
const path = require('path');
const fallbacks = require('../src/lib/image-fallbacks.json');

// ─── 방법3: 월별 계절 키워드 자동 주입 ────────────────────────────────────
const SEASONAL_KEYWORDS = {
  1:  {
    festival: ['설날행사', '겨울축제', '눈꽃축제', '얼음축제', '신년행사'],
    benefit:  ['난방비지원', '에너지바우처', '설맞이지원금', '취업지원금', '청년수당']
  },
  2:  {
    festival: ['봄맞이축제', '매화축제', '겨울끝자락', '실내전시'],
    benefit:  ['청년취업지원', '설연휴혜택', '복지급여', '근로장려금신청준비']
  },
  3:  {
    festival: ['벚꽃축제', '봄꽃축제', '개나리축제', '봄나들이'],
    benefit:  ['청년창업지원', '소상공인지원', '봄학기장학금', '취업성공패키지']
  },
  4:  {
    festival: ['벚꽃축제', '봄축제', '튤립축제', '어린이날준비행사'],
    benefit:  ['근로장려금', '자녀장려금', '봄맞이지원금', '청년주거지원']
  },
  5:  {
    festival: ['어린이날행사', '장미축제', '가정의달축제', '봄꽃축제', '연등회'],
    benefit:  ['근로장려금신청', '자녀장려금신청', '어린이날혜택', '가정의달지원금']
  },
  6:  {
    festival: ['여름축제', '물축제', '한강축제', '야외공연'],
    benefit:  ['청년지원금', '에너지바우처', '여름방학프로그램', '취업지원']
  },
  7:  {
    festival: ['여름축제', '물놀이행사', '워터페스티벌', '야외영화제'],
    benefit:  ['에너지취약계층지원', '여름방학지원', '청년주거지원', '소상공인여름지원']
  },
  8:  {
    festival: ['여름축제', '해변축제', '피서지행사', '별빛축제'],
    benefit:  ['개학맞이지원', '청년지원금', '주거급여', '저소득층지원']
  },
  9:  {
    festival: ['추석행사', '가을축제', '단풍축제', '한가위문화행사'],
    benefit:  ['추석명절지원금', '복지급여', '가을학기장학금', '노인복지혜택']
  },
  10: {
    festival: ['단풍축제', '핼러윈행사', '가을꽃축제', '문화행사'],
    benefit:  ['난방비지원신청', '에너지바우처신청', '복지급여', '노후준비지원']
  },
  11: {
    festival: ['겨울준비행사', '김장축제', '빛축제', '크리스마스마켓'],
    benefit:  ['에너지바우처', '난방비지원', '연말정산준비', '겨울복지지원']
  },
  12: {
    festival: ['크리스마스행사', '연말축제', '겨울빛축제', '새해맞이행사'],
    benefit:  ['연말정산', '연말지원금', '겨울난방지원', '신년복지혜택']
  }
};

// 현재 월 기준 계절 키워드 반환
function getSeasonalKeywords(postType) {
  const month = new Date().getMonth() + 1;
  const keywords = SEASONAL_KEYWORDS[month] || SEASONAL_KEYWORDS[5];
  return postType === 'festival' ? keywords.festival : keywords.benefit;
}
// ──────────────────────────────────────────────────────────────────────────────

// ─── 방법1: 네이버 DataLab 연동 ──────────────────────────────────────────────
async function getNaverDataLabKeywords(postType) {
  const clientId     = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log('[DataLab] 네이버 API 키 없음 → 계절 키워드만 사용');
    return [];
  }

  try {
    const today = new Date();
    const endDate = today.toISOString().slice(0, 10);
    const startDate = new Date(today - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // 포스트 타입별 조회할 키워드 그룹
    const keywordGroups = postType === 'festival'
      ? [
          { groupName: '축제',   keywords: [{ name: '축제' }] },
          { groupName: '행사',   keywords: [{ name: '행사' }] },
          { groupName: '나들이', keywords: [{ name: '나들이' }] },
          { groupName: '공연',   keywords: [{ name: '공연' }] }
        ]
      : [
          { groupName: '지원금',   keywords: [{ name: '지원금' }] },
          { groupName: '혜택',     keywords: [{ name: '혜택' }] },
          { groupName: '복지',     keywords: [{ name: '복지' }] },
          { groupName: '보조금',   keywords: [{ name: '보조금' }] }
        ];

    const body = {
      startDate,
      endDate,
      timeUnit: 'date',
      keywordGroups
    };

    const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'X-Naver-Client-Id':     clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.warn(`[DataLab] API 응답 오류 (${response.status}) → 계절 키워드만 사용`);
      return [];
    }

    const result = await response.json();

    // 최근 3일 평균 ratio 기준으로 그룹 정렬
    const scored = result.results.map(group => {
      const recent = group.data.slice(-3);
      const avg = recent.reduce((sum, d) => sum + d.ratio, 0) / recent.length;
      return { name: group.title, score: avg };
    });

    scored.sort((a, b) => b.score - a.score);
    const hotKeywords = scored.slice(0, 2).map(g => g.name);
    console.log(`[DataLab] 핫 키워드 TOP2: ${hotKeywords.join(', ')}`);
    return hotKeywords;

  } catch (err) {
    console.warn('[DataLab] 호출 실패 → 계절 키워드만 사용:', err.message);
    return [];
  }
}

// 계절 키워드 + DataLab 키워드 합산
async function getTodayHotKeywords(postType) {
  const seasonal  = getSeasonalKeywords(postType);
  const datalab   = await getNaverDataLabKeywords(postType);

  // DataLab 키워드를 앞에 배치 (우선순위 높음)
  const merged = [...new Set([...datalab, ...seasonal])];
  console.log(`[핫 키워드] 오늘의 키워드 (${postType}): ${merged.slice(0, 5).join(', ')}`);
  return merged;
}
// ──────────────────────────────────────────────────────────────────────────────

function calcScore(item, postType, hotKeywords = []) {
  let score = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const text = [item.title, item.details, item.description, item.target, item.summary, item.deadline, item.date].join(' ');

  // ─── 핫 키워드 매칭 점수 (신규) ───────────────────────────────────────────
  hotKeywords.forEach((kw, idx) => {
    const weight = idx < 2 ? 30 : 15; // DataLab 상위 2개는 가중치 2배
    if (item.title?.includes(kw))       score += weight;
    if (text.includes(kw))              score += Math.floor(weight / 2);
  });
  // ──────────────────────────────────────────────────────────────────────────

  if (postType === 'festival') {
    const dateMatches = [...String(item.date || '').matchAll(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/g)];
    if (dateMatches.length > 0) {
      const first = dateMatches[0];
      const startDate = new Date(parseInt(first[1]), parseInt(first[2]) - 1, parseInt(first[3]));
      const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3)        score += 60;
      else if (diffDays >= 0 && diffDays <= 7)   score += 50;
      else if (diffDays < 0 && diffDays >= -14)  score += 40;
      else if (diffDays > 7 && diffDays <= 14)   score += 20;

      const tempDate = new Date(startDate);
      for (let i = 0; i < 7; i++) {
        const day = tempDate.getDay();
        if (day === 0 || day === 6) { score += 20; break; }
        tempDate.setDate(tempDate.getDate() + 1);
      }
    } else {
      score += 5;
    }

    if (text.includes('무료'))           score += 15;
    if (text.includes('서울'))           score += 10;
    if (text.includes('인천') || text.includes('경기')) score += 5;

  } else {
    const deadlineMatches = [...String(item.deadline || item.date || '').matchAll(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/g)];
    if (deadlineMatches.length > 0) {
      const last = deadlineMatches[deadlineMatches.length - 1];
      const deadlineDate = new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
      const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7)        score += 60;
      else if (diffDays >= 0 && diffDays <= 30)  score += 30;
      else if (diffDays > 30)                    score += 10;
    } else {
      score += 5;
    }

    if (text.includes('서울'))           score += 10;
    if (text.includes('인천') || text.includes('경기')) score += 5;
    if (item.isEmergency)                score += 20;
  }

  return score;
}

async function main() {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    // 1. 최신 데이터 확인
    const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('pick-info.json 파일이 존재하지 않습니다.');
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const postType = process.env.POST_TYPE || 'benefit';
    const allItems = (postType === 'festival'
      ? (data.festivals || [])
      : (data.benefits || [])
    ).reverse();
    console.log(`[블로그] 발행 타입: ${postType} (총 ${allItems.length}건)`);

    if (allItems.length === 0) {
      console.log('가져올 데이터가 없습니다.');
      return;
    }

    // ─── 오늘의 핫 키워드 수집 (방법1 + 방법3) ───────────────────────────
    const hotKeywords = await getTodayHotKeywords(postType);
    // ──────────────────────────────────────────────────────────────────────

    // 기존 포스트 디렉토리 확인
    const postsDir = path.join(process.cwd(), 'src/content/posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    const existingFiles = fs.readdirSync(postsDir);
    const existingPostsList = existingFiles.filter(f => f.endsWith('.md')).map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const originalTitleMatch = content.match(/originalTitle:\s*"(.*)"/) || content.match(/originalTitle:\s*(.*)\r?\n/);
      let title = originalTitleMatch ? originalTitleMatch[1].replace(/"/g, '').trim() : null;

      if (!title) {
        const titleMatch = content.match(/title:\s*"(.*)"/) || content.match(/title:\s*(.*)\r?\n/);
        title = titleMatch ? titleMatch[1].replace(/"/g, '').trim() : null;
      }
      return { title, filename: file.replace('.md', '') };
    }).filter(p => p.title);

    const alreadyPostedTitles = existingPostsList.map(p => p.title);

    existingPostsList.sort((a, b) => b.filename.localeCompare(a.filename));
    const recentPostsForLinking = existingPostsList.slice(0, 30).map(p => `- [${p.title}](/blog/${p.filename})`).join('\n');

    const unpostedItems = allItems.filter(item => !alreadyPostedTitles.includes(item.title));

    if (unpostedItems.length === 0) {
      console.log('모든 데이터가 이미 블로그에 작성되었습니다.');
      return;
    }

    // ─── 핫 키워드 반영 스코어링으로 최종 선정 ────────────────────────────
    const scoredItems = unpostedItems
      .map(item => ({ item, score: calcScore(item, postType, hotKeywords) }))
      .sort((a, b) => b.score - a.score);

    const topCandidates = scoredItems.slice(0, 3);
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const targetItem = selected.item;

    console.log(`[블로그] 핫 키워드 반영 TOP3:`);
    topCandidates.forEach((c, i) => console.log(`  ${i+1}위 (${c.score}점): ${c.item.title}`));
    console.log(`[블로그] 최종 선정 (${selected.score}점): ${targetItem.title}`);
    // ──────────────────────────────────────────────────────────────────────

    if (!targetItem.image || targetItem.image.includes('default.png')) {
      const guideFallbacks = fallbacks.GUIDE;
      targetItem.image = guideFallbacks[Math.floor(Math.random() * guideFallbacks.length)];
      console.log(`[보정] 이미지 누락 데이터에 스톡 이미지를 할당했습니다: ${targetItem.image}`);
    }

    console.log(`발행 대상 발견: ${targetItem.title}`);

    // 2. Gemini AI로 블로그 글 생성
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
    const prompt = {
      contents: [{
        parts: [{
          text: `이 글은 ${postType === 'festival' ? '축제/행사 정보' : '지원금/혜택 정보'} 블로그 포스트입니다.
당신은 수도권 생활 정보 큐레이션 서비스 '수도권 팁픽(Tip-Pick)'의 전문 에디터이자 SEO 전문가입니다.
아래 공공서비스 정보를 바탕으로 구글/네이버 검색 상위 노출이 가능한 프리미엄 블로그 글을 작성해줘.

정보: ${JSON.stringify(targetItem)}

오늘의 핫 키워드: ${hotKeywords.slice(0, 5).join(', ')}
(위 키워드를 제목과 본문에 자연스럽게 녹여서 검색 노출 극대화)

[타겟 및 톤앤매너]
${postType === 'festival'
              ? '- 타겟: 전 연령층\n- 말투: 밝고 경쾌하게\n- 주제: 나들이, 즐거움'
              : '- 타겟: 40~60대 중장년층\n- 말투: 신뢰감 있게\n- 주제: 경제적 이득, 생활 안정\n- AI 자율 키워드 삽입: 본문의 주제를 분석해서 4060 세대의 관심사인 금융, 보험, 세금, 연금, 재테크 관련 고단가(CPC) 키워드를 스스로 추출할 것. 추출된 키워드를 독자가 거부감을 느끼지 않도록 문맥 속에 자연스럽게 3~5회 녹여내어 작성할 것.'}

[핵심 금지 사항 - 반드시 지킬 것]
1. 도입부에 "안녕하세요, 수도권 팁픽 에디터입니다" 같은 고정 인사말 금지. 매번 다른 방식으로 시작할 것.
2. 마무리 문단에 "팁픽은 앞으로도 여러분의 생활에..." 같은 고정 문구 금지. 해당 글의 주제와 연결된 자연스러운 마무리로 작성할 것.
3. "지원금별로 필요한 서류가 다를 수 있습니다..." 같은 폴백 텍스트를 본문에 그대로 인용하거나 굵은 글씨로 강조하는 것 금지.
4. "직접 입력" 같은 공공데이터 raw 값을 신청방법으로 그대로 사용 금지. 의미없는 값은 제외하고 실제 신청 방법만 안내할 것.
5. 추천 포인트 3가지 섹션의 구조가 매번 똑같이 반복되는 것 금지. 때로는 표, 때로는 체크리스트, 때로는 스토리텔링 방식 등 다양하게 변형할 것.
6. "복잡한 경제 상식, 더 쉽게 풀어서 듣고 싶다면?" 같은 외부 채널(유튜브 등)로 유도하는 문구 금지. 외부 플랫폼 링크나 홍보 문구는 본문 어디에도 포함하지 말 것.

[SEO 가독성 및 작성 가이드라인]
1. 제목(title): 검색자들이 포털에 입력할 법한 세부 키워드(지역명, 타겟 연령층, 핵심 혜택, 신청방법 등)를 조합한 구체적 제목.
2. 요약(summary): 구글 메타 디스크립션용. 핵심 타겟과 혜택 포함, 150자 이내.
3. 에디터 인사이트: 원문 데이터에 없는 실제 꿀팁이나 주의사항을 독창적으로 2~3문장 작성. ${postType === 'festival' ? '"주차장 꿀팁"이나 "인생샷 포인트"를 강조할 것.' : '"이 혜택 놓치면 손해인 이유"를 강조할 것.'} 공식 데이터 재탕 금지.
4. 필수 포함 정보:
   - 전 연령층 대상이므로 교통/주차/소요시간/추천 관람 포인트 등 실용 정보 포함 (축제/행사일 경우)
   - 4060 대상이므로 신청 자격/방법/주의사항/놓치기 쉬운 포인트 중심 (지원금일 경우)
5. 디자인 및 구조 강조 (필수):
   - 정보의 핵심이 되는 수치(금액, 날짜, 자격요건)는 반드시 **굵게(Bold)** 표시할 것.
   - 검색 엔진이 선호하는 '개조식(불렛 포인트)'과 '표(Table)'를 적절히 섞어서 가독성과 체류 시간을 늘릴 것.
6. 길이: 공백 제외 800자 이상.

[하단 연결 섹션 - 반드시 포함]
본문 맨 마지막에 다음 내용을 반드시 포함할 것:
${postType === 'festival'
              ? '### 🚀 이번 주말 또 다른 가볼만한 곳\n이번 주말, 여기 말고도 재밌는 축제가 더 궁금하다면 팁픽의 다른 글도 확인해보세요!'
              : ''}

### 🔗 함께 보시면 도움되는 추천 정보
현재 작성 중인 글과 '지역'이나 '주제'가 가장 유사한 기존 포스팅을 아래 목록에서 2개 선별하여 자연스러운 추천 텍스트와 함께 연결해줄 것. 연결 방식은 [포스트 제목](/blog/파일명)과 같은 마크다운 링크를 유지할 것.
(후보 목록:
${recentPostsForLinking}
)

[하단의 마무리 브랜드 문구 - 반드시 포함]
모든 본문, 링크, 섹션이 다 끝난 글의 맨 마지막 줄에 아래 브랜드 문구를 반드시 포함할 것:
"매일 아침, 일상을 풍요롭게 만드는 정보를 엄선하여 배달합니다."

아래 형식으로 출력. 반드시 이 형식(YAML Frontmatter 포함)만 출력하고 다른 설명 제외.
반드시 응답 맨 마지막 줄에 'FILENAME: YYYY-MM-DD-영문키워드' 형식으로 파일명을 출력할 것. 이 줄이 없으면 파일 저장이 불가능함.
---
title: (SEO가 적용된 구체적인 제목)
originalTitle: ${targetItem.title}
link: ${targetItem.link || ''}
officialTarget: ${targetItem.target || '정보 없음'}
officialDetails: ${targetItem.details || targetItem.description || '정보 없음'}
officialDeadline: ${targetItem.deadline || targetItem.date || '상시'}
date: ${today}
summary: (검색 노출용 150자 이내 요약문)
category: 정보
image: ${targetItem.image || ''}
tags: [세부키워드1, 세부키워드2, 세부키워드3]
officialRequirements: ${JSON.stringify(targetItem.requirements || [])}
officialHowToApply: ${JSON.stringify(targetItem.howToApply || [])}
officialEligibilityQuiz: ${JSON.stringify(targetItem.eligibilityQuiz || [])}
officialTip: ${targetItem.tip || ''}
---

(본문 시작. 도입부는 매번 다른 방식으로. 에디터 인사이트 반드시 포함.)

---
[필수] 위 마크다운 블록이 완전히 끝난 뒤, 반드시 아래 형식으로 파일명을 출력할 것:
FILENAME: YYYY-MM-DD-영문키워드
(키워드는 영문만 사용, 날짜는 오늘 날짜 ${today} 사용, 이 줄이 없으면 저장 불가)`
        }]
      }],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.9
      }
    };

    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
    let result;
    let geminiBackoff = 30000;
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });

      if (response.status === 503 || response.status === 429) {
        console.warn(`Gemini 과부하 (${response.status}) — ${geminiBackoff / 1000}초 후 재시도 (${attempt + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, geminiBackoff));
        geminiBackoff *= 2;
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API 호출 실패 (상태 코드: ${response.status}) [모델: ${geminiModel}]: ${errorBody}`);
      }

      result = await response.json();
      break;
    }

    if (!result) {
      throw new Error('Gemini API 최대 재시도 횟수 초과');
    }
    let fullText = result.candidates[0].content.parts[0].text;

    const filenameMatch = fullText.match(/FILENAME:\s*([^\s\n]+)/i);
    let filename;
    if (!filenameMatch) {
      const fallbackId = targetItem.id || `${postType}-${Date.now()}`;
      filename = `${today}-${postType}-${fallbackId}.md`;
      console.warn(`[경고] Gemini가 FILENAME을 누락 — 폴백 파일명 사용: ${filename}`);
    } else {
      const rawFilename = filenameMatch[1].trim().replace(/\.md$/i, '').replace(/\.+$/, '');
      const keyword = rawFilename.replace(/^\d{4}-\d{2}-\d{2}-?/, '');
      filename = `${today}-${keyword}.md`;
    }

    let mdContent = fullText.replace(/FILENAME:.*$/im, '').trim();
    mdContent = mdContent.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();
    mdContent = mdContent.replace(/^date:.*$/m, `date: ${today}`);

    mdContent = mdContent.replace(
      /^(---\r?\n)([\s\S]*?)(---)/,
      (_, open, frontmatter, close) => {
        const fixed = frontmatter.replace(
          /^([a-zA-Z][a-zA-Z0-9_]*):\s+(.+)$/gm,
          (line, key, value) => {
            const trimmed = value.trim();
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
              (trimmed.startsWith("'") && trimmed.endsWith("'"))) return line;
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
              (trimmed.startsWith('{') && trimmed.endsWith('}'))) return line;
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              return `${key}: "${trimmed.replace(/"/g, '\\"')}"`;
            }
            if (trimmed.includes(': ')) {
              return `${key}: "${trimmed.replace(/"/g, '\\"')}"`;
            }
            return line;
          }
        );
        return open + fixed + close;
      }
    );

    if (/^image:\s*$/m.test(mdContent)) {
      const localFallbacks = [
        '/images/blogs/korea-welfare-benefit-210.png',
        '/images/blogs/korea-welfare-benefit-212.png',
        '/images/blogs/korea-welfare-benefit-279.png',
        '/images/blogs/korea-welfare-benefit-533.png',
        '/images/blogs/korea-welfare-benefit-843.png',
      ];
      const fallbackImage = localFallbacks[Math.floor(Math.random() * localFallbacks.length)];
      mdContent = mdContent.replace(/^(image:)\s*$/m, `$1 ${fallbackImage}`);
      console.log(`[보정] Gemini가 이미지를 비워 로컬 폴백 이미지를 주입했습니다: ${fallbackImage}`);
    }

    const finalPath = path.join(postsDir, filename);
    fs.writeFileSync(finalPath, mdContent, 'utf8');
    console.log(`생성 완료: ${filename}`);

    // ─── 네이버 블로그 티저 원고 생성 ────────────────────────────────────────
    try {
      const naverPromptObj = {
        contents: [{
          parts: [{
            text: `당신은 수도권 생활 정보 큐레이션 서비스 '팁픽(Tip-Pick)'의 네이버 블로그 전담 에디터입니다.
아래 공공데이터를 활용해 네이버 블로그 방문자를 팁픽(tip-pick.com) 웹사이트로 강력하게 유도하기 위한 '티저(Teaser)' 원고를 작성해 줘.

데이터: ${JSON.stringify(targetItem)}

[작성 규칙]
1. 제목: 네이버 검색 노출에 유리한 형태 ([지역/대상] + 직관적 혜택/행사명 중심)
2. 도입부(Hook): 데이터가 '지원금(benefit)'인 경우 40~60대의 관심사(노후 준비, 생활비 방어 등)를 건드리고, '축제/행사(festival)'인 경우 전 연령층이 공감할 수 있는 주말 나들이, 데이트, 가족 여행 등의 키워드로 시작할 것.
3. 본문(Teaser): 정보의 핵심(지원 대상, 행사 기간 등)만 간략히 요약하고, 상세 자격 요건이나 구체적인 팁, 예매 방법 등은 의도적으로 감출 것.
4. 행동 유도(CTA): 글 하단에 '👉 상세 정보 및 온라인 신청(예매) 바로가기: https://tip-pick.com/${targetItem.type === 'festival' ? 'festival' : 'benefit'}/${targetItem.id || ''}' 문구를 반드시 추가하여 백링크를 유도할 것.
5. 이미지 안내: 글 최상단과 최하단에 '[여기에 팁픽 고유 마스터 캐릭터 썸네일 삽입]'이라는 안내 문구를 텍스트로 적어줄 것.

다른 부연 설명 없이, 바로 복사해서 붙여넣을 수 있는 순수 텍스트로만 출력해 줘.`
          }]
        }],
        tools: [{ googleSearch: {} }]
      };

      const naverGeminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
      const naverRes = await fetch(naverGeminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(naverPromptObj)
      });

      if (!naverRes.ok) {
        const errBody = await naverRes.text();
        throw new Error(`Gemini 응답 오류 (${naverRes.status}): ${errBody.substring(0, 200)}`);
      }

      const naverResult = await naverRes.json();
      const naverText = naverResult.candidates[0].content.parts[0].text.trim();

      const naverDraftsDir = path.join(process.cwd(), 'src/content/naver_drafts');
      if (!fs.existsSync(naverDraftsDir)) {
        fs.mkdirSync(naverDraftsDir, { recursive: true });
      }

      const naverFilename = `${filename.replace('.md', '')}-naver.txt`;
      const naverFilePath = path.join(naverDraftsDir, naverFilename);
      fs.writeFileSync(naverFilePath, naverText, 'utf8');
      console.log(`[네이버 티저] 생성 완료: ${naverFilename}`);

    } catch (error) {
      console.warn('[경고] 네이버 블로그 원고 생성 실패:', error.message);
    }
    // ──────────────────────────────────────────────────────────────────────────

  } catch (error) {
    console.warn('[블로그 자동 생성 실패, 배포는 계속 진행됩니다:', error.message);
    process.exit(0);
  }
}

main();
