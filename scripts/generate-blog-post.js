const fs = require('fs');
const path = require('path');
const fallbacks = require('../src/lib/image-fallbacks.json');

// 블로그 주제 우선 선정 키워드
const TARGET_KEYWORDS = ['중장년', '노후준비', '노후대비', '노후설계', '연금', '소상공인', '정부지원금', '건강보험', '세액공제'];

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
    const allItems = [...(data.festivals || []), ...(data.benefits || [])].reverse();
    
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
    const alreadyPostedTitles = existingFiles.filter(f => f.endsWith('.md')).map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const originalTitleMatch = content.match(/originalTitle:\s*"(.*)"/) || content.match(/originalTitle:\s*(.*)\r?\n/);
      if (originalTitleMatch) return originalTitleMatch[1].replace(/"/g, '').trim();

      // 구 버전 파일은 일반 제목으로 체크
      const titleMatch = content.match(/title:\s*"(.*)"/) || content.match(/title:\s*(.*)\r?\n/);
      return titleMatch ? titleMatch[1].replace(/"/g, '').trim() : null;
    });

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
          text: `당신은 수도권 생활 정보 큐레이션 서비스 '수도권 팁픽(Tip-Pick)'의 전문 에디터이자 검색 엔진 최적화(SEO) 전문가입니다.
아래 공공서비스 정보를 바탕으로 독자들에게 도움이 되며, 네이버와 구글 검색에서 상위 노출될 수 있는 프리미엄 블로그 글을 작성해줘.

정보: ${JSON.stringify(targetItem)}

[SEO 및 작성 가이드라인]
1. 제목 (title): 원문 제목을 그대로 쓰지 말고, 검색자들이 포털에 입력할 법한 세부 키워드(지역명, 타겟 연령층, 핵심 혜택, 신청방법 등)를 조합하여 구체적이고 클릭을 유도하는 제목으로 가공해줘. (예: "[인천 중장년] 2026 정부지원 기술창업센터 입주 자격 및 신청방법 총정리")
2. 요약 (summary): 구글 검색 결과의 '메타 디스크립션(Meta Description)'으로 사용될 핵심 영역입니다. 핵심 타겟과 혜택을 모두 포함하여 150자 이내의 자연스러운 문장으로 작성해줘.
3. 독창적 콘텐츠(유사 문서 회피): 본문 최상단 도입부에 원문 데이터에는 없는 '팁픽 에디터의 인사이트(주의사항이나 꿀팁)' 2~3문장을 독창적으로 창작하여 배치해줘.
4. 구성:
   - 본문에 '팁픽이 꼽은 추천 포인트 3가지'를 포함.
   - 공공기관 특유의 딱딱한 문체를 친근하고 전문적인 블로그 톤으로 윤문.
   - 신청 방법 및 대상자를 명확하게 안내.
5. 길이: 공백 제외 800자 이상의 풍부한 내용.

아래 형식으로 출력해줘. 반드시 이 형식(YAML Frontmatter 포함)만 출력하고 다른 설명은 제외해:
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

(본문 내용 시작. 최상단에 에디터 인사이트 반드시 포함...)

FILENAME: YYYY-MM-DD-keyword 형식으로 마지막에 파일명도 출력해줘. 키워드는 영문으로.`
        }]
      }]
    };

    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API 호출 실패 (상태 코드: ${response.status}) [모델: ${geminiModel}]: ${errorBody}`);
    }

    const result = await response.json();
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
    mdContent = mdContent.replace(/^```markdown\n/i, '').replace(/```$/g, '').trim();

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
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) return line;
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
        }]
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
