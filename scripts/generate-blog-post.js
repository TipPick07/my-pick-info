const fs = require('fs');
const path = require('path');
const fallbacks = require('../src/lib/image-fallbacks.json');

// 블로그 주제 우선 선정 키워드
const TARGET_KEYWORDS = ['중장년', '노후준비', '노후대비', '노후설계', '연금', '소상공인', '정부지원금', '건강보험', '세액공제'];

// 포스트 유형별 추천 상품 키워드 매핑
const AFFILIATE_CONFIG = {
  festival: ['피크닉 돗자리', '휴대용 접이식 의자', '보조배터리', '휴대용 선풍기'],
  benefit: ['재테크 도서', '사무용품/플래너', '멀티비타민', '노트북 거치대'],
};

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
    // 최신순으로 정렬 (보통 unshift로 추가하므로 역순으로 확인)
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

    // 기존 포스트 디렉토리 확인
    const postsDir = path.join(process.cwd(), 'src/content/posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    // 아직 글이 작성되지 않은 항목 수집
    const existingFiles = fs.readdirSync(postsDir);
    const existingPostsList = existingFiles.filter(f => f.endsWith('.md')).map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const originalTitleMatch = content.match(/originalTitle:\s*"(.*)"/) || content.match(/originalTitle:\s*(.*)\r?\n/);
      let title = originalTitleMatch ? originalTitleMatch[1].replace(/"/g, '').trim() : null;

      // 구 버전 파일은 일반 제목으로 체크
      if (!title) {
        const titleMatch = content.match(/title:\s*"(.*)"/) || content.match(/title:\s*(.*)\r?\n/);
        title = titleMatch ? titleMatch[1].replace(/"/g, '').trim() : null;
      }
      return { title, filename: file.replace('.md', '') };
    }).filter(p => p.title);

    const alreadyPostedTitles = existingPostsList.map(p => p.title);

    // 내부 링크 추천용 후보 리스트 (최신 30개)
    existingPostsList.sort((a, b) => b.filename.localeCompare(a.filename));
    const recentPostsForLinking = existingPostsList.slice(0, 30).map(p => `- [${p.title}](/posts/${p.filename})`).join('\n');

    const unpostedItems = allItems.filter(item => !alreadyPostedTitles.includes(item.title));

    if (unpostedItems.length === 0) {
      console.log('모든 데이터가 이미 블로그에 작성되었습니다.');
      return;
    }

    // ① 키워드 매칭 항목 우선 선정
    const keywordMatched = unpostedItems.filter(item => {
      const text = [item.title, item.details, item.description, item.target, item.summary].join(' ');
      return TARGET_KEYWORDS.some(kw => text.includes(kw));
    });

    let targetItem;
    if (keywordMatched.length > 0) {
      targetItem = keywordMatched[Math.floor(Math.random() * keywordMatched.length)];
      console.log(`[블로그] 키워드 우선 선정: ${targetItem.title}`);
    } else {
      // ② Fallback: 전체 미발행 항목 중 무작위 선택
      targetItem = unpostedItems[Math.floor(Math.random() * unpostedItems.length)];
      console.log(`[블로그] Fallback 무작위 선정: ${targetItem.title}`);
    }

    // 이미지 보정
    if (!targetItem.image || targetItem.image.includes('default.png')) {
      const guideFallbacks = fallbacks.GUIDE;
      targetItem.image = guideFallbacks[Math.floor(Math.random() * guideFallbacks.length)];
      console.log(`[보정] 이미지 누락 데이터에 스톡 이미지를 할당했습니다: ${targetItem.image}`);
    }

    console.log(`발행 대상 발견: ${targetItem.title}`);

    // 2. Gemini AI로 블로그 글 생성
    // 한국 시간(KST) 기준으로 오늘 날짜 가져오기
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
    const prompt = {
      contents: [{
        parts: [{
          text: `이 글은 ${postType === 'festival' ? '축제/행사 정보' : '지원금/혜택 정보'} 블로그 포스트입니다.
당신은 수도권 생활 정보 큐레이션 서비스 '수도권 팁픽(Tip-Pick)'의 전문 에디터이자 SEO 전문가입니다.
아래 공공서비스 정보를 바탕으로 구글/네이버 검색 상위 노출이 가능한 프리미엄 블로그 글을 작성해줘.

정보: ${JSON.stringify(targetItem)}

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

[카카오톡 채널 유입 박스 - 반드시 포함]
본문 내용이 끝나고 '추천 아이템 섹션'이 시작되기 바로 직전에 아래 형태의 카카오톡 채널 유도 박스를 HTML 코드로 작성하여 시각적으로 강조된 박스(테두리 및 연한 배경색)가 렌더링되게 할 것:

<div style="border: 2px solid #FEE500; background-color: #FFFAEA; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
  <p style="font-size: 1.1em; font-weight: bold; color: #333; margin-bottom: 10px;">📢 매일 아침 가장 빠르게, 유용한 혜택 정보를 카톡으로 확인하세요!</p>
  <p style="color: #666; margin-bottom: 20px;">${postType === 'festival' ? '이번 주말 어디 갈지 고민 끝! 유용한 나들이 정보를 매주 카톡으로 보내드립니다.' : '나만 몰랐던 정부 지원금 소식, 이제 카톡 알림으로 편하게 받아보세요.'}</p>
  <a href="http://pf.kakao.com/_wwSjX" style="display: inline-block; background-color: #FEE500; color: #111; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px;">👉 채널 추가하고 알림 받기</a>
</div>

[추천 아이템 섹션 - 반드시 포함]
본문 후반부에 아래 형식으로 '### 💡 팁픽 에디터의 추천 아이템' 섹션을 추가할 것.
- 글의 분위기(말투)에 맞게 텍스트 톤앤매너를 조절해서 상품을 추천해줘.
- 이 글의 독자에게 실제로 도움될 상품 2개를 다음 키워드 중에서 선정: ${(AFFILIATE_CONFIG[postType] || AFFILIATE_CONFIG.benefit).join(', ')}
- 각 상품마다 '에디터의 한마디'(왜 이 글의 독자에게 필요한지 1문장)를 작성할 것.
- 각 상품 하단에 [👉 최저가 확인하기](https://link.coupang.com/a/AF6155387) 링크를 반드시 포함할 것.
- 단순 광고가 아닌 '추천 정보'처럼 보이도록 아래 마크다운 형식을 따를 것:

---
### 💡 팁픽 에디터의 추천 아이템

> 이 글을 읽는 분들께 도움이 될 만한 아이템을 엄선했습니다.

#### 1. [상품명]
> 에디터의 한마디: (이 글의 독자에게 왜 필요한지 1문장)

[👉 최저가 확인하기](https://link.coupang.com/a/AF6155387)

---

#### 2. [상품명]
> 에디터의 한마디: (이 글의 독자에게 왜 필요한지 1문장)

[👉 최저가 확인하기](https://link.coupang.com/a/AF6155387)

---
※ 이 링크는 쿠팡 파트너스 활동의 일환으로, 구매 시 일정액의 수수료를 제공받을 수 있습니다.

[하단 연결 섹션 - 반드시 포함]
본문 맨 마지막에 다음 내용을 반드시 포함할 것:
${postType === 'festival'
              ? '### 🚀 이번 주말 또 다른 가볼만한 곳\n이번 주말, 여기 말고도 재밌는 축제가 더 궁금하다면 팁픽의 다른 글도 확인해보세요!'
              : '> **복잡한 경제 상식, 더 쉽게 풀어서 듣고 싶다면?**\n> 유튜브 \\\'짠한경제학\\\'에서 확인하세요!\n> [👉 짠한경제학 유튜브 바로가기](https://www.youtube.com/@zzaneconomy)'}

### 🔗 함께 보시면 도움되는 추천 정보
현재 작성 중인 글과 '지역'이나 '주제'가 가장 유사한 기존 포스팅을 아래 목록에서 2개 선별하여 자연스러운 추천 텍스트와 함께 연결해줄 것. 연결 방식은 [포스트 제목](/posts/파일명)과 같은 마크다운 링크를 유지할 것.
(후보 목록:
${recentPostsForLinking}
)

[하단의 마무리 브랜드 문구 - 반드시 포함]
모든 본문, 링크, 섹션이 다 끝난 글의 맨 마지막 줄에 아래 브랜드 문구를 반드시 포함할 것:
"매일 아침, 일상을 풍요롭게 만드는 정보를 엄선하여 배달합니다."

아래 형식으로 출력. 반드시 이 형식(YAML Frontmatter 포함)만 출력하고 다른 설명 제외:
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

FILENAME: YYYY-MM-DD-keyword 형식으로 마지막에 파일명도 출력. 키워드는 영문으로.`
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

    // FILENAME 추출
    const filenameMatch = fullText.match(/FILENAME:\s*([^\s\n]+)/i);
    if (!filenameMatch) {
      throw new Error('FILENAME을 찾을 수 없습니다.');
    }
    // Gemini가 날짜를 잘못 생성할 수 있으므로 날짜 부분을 오늘 날짜로 강제 교체
    const rawFilename = filenameMatch[1].trim().replace(/\.md$/i, '').replace(/\.+$/, '');
    const keyword = rawFilename.replace(/^\d{4}-\d{2}-\d{2}-?/, '');
    const filename = `${today}-${keyword}.md`;

    // FILENAME 라인 제거
    let mdContent = fullText.replace(/FILENAME:.*$/im, '').trim();

    // 마크다운 코드 블록 제거
    mdContent = mdContent.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();

    // Gemini가 date 필드를 훈련 데이터 기반으로 잘못 출력할 수 있으므로 강제 교체
    mdContent = mdContent.replace(/^date:.*$/m, `date: ${today}`);

    // 3-a. YAML frontmatter 값에 콜론이 포함된 경우 자동으로 따옴표 처리
    mdContent = mdContent.replace(
      /^(---\r?\n)([\s\S]*?)(---)/,
      (_, open, frontmatter, close) => {
        const fixed = frontmatter.replace(
          /^([a-zA-Z][a-zA-Z0-9_]*):\s+(.+)$/gm,
          (line, key, value) => {
            const trimmed = value.trim();
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
              (trimmed.startsWith("'") && trimmed.endsWith("'"))) return line;
            // [ 또는 { 로 시작하고 동시에 ] 또는 } 로 끝나면 배열/객체 (tags 등) — 건너뜀
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
              (trimmed.startsWith('{') && trimmed.endsWith('}'))) return line;
            // [ 로 시작하지만 ] 로 끝나지 않으면 문자열 — 따옴표 처리
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              return `${key}: "${trimmed.replace(/"/g, '\\"')}"`;
            }
            // ': ' (콜론+공백)만 YAML 파싱 위험 — URL의 '://' 패턴은 안전하므로 제외
            if (trimmed.includes(': ')) {
              return `${key}: "${trimmed.replace(/"/g, '\\"')}"`;
            }
            return line;
          }
        );
        return open + fixed + close;
      }
    );

    // 3-b. 파일 저장 (image 비어있으면 로컬 폴백 강제 주입)
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

    // ─── 네이버 블로그 티저 원고 생성 (실패해도 배포에 영향 없음) ────────────
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
    // ────────────────────────────────────────────────────────────────────────

  } catch (error) {
    // 블로그 생성 실패는 배포를 막지 않음 — 기존 콘텐츠로 사이트는 계속 배포
    console.warn('[경고] 블로그 자동 생성 실패, 배포는 계속 진행됩니다:', error.message);
    process.exit(0);
  }
}

main();
