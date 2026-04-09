const fs = require('fs');
const path = require('path');
const fallbacks = require('../src/lib/image-fallbacks.json');

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

    // 아직 글이 작성되지 않은 항목 찾기
    let targetItem = null;
    const existingFiles = fs.readdirSync(postsDir);
    const alreadyPostedTitles = existingFiles.filter(f => f.endsWith('.md')).map(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const originalTitleMatch = content.match(/originalTitle:\s*"(.*)"/) || content.match(/originalTitle:\s*(.*)\r?\n/);
      if (originalTitleMatch) return originalTitleMatch[1].replace(/"/g, '').trim();

      // 구 버전 파일은 일반 제목으로 체크
      const titleMatch = content.match(/title:\s*"(.*)"/) || content.match(/title:\s*(.*)\r?\n/);
      return titleMatch ? titleMatch[1].replace(/"/g, '').trim() : null;
    });

    for (const item of allItems) {
      if (!alreadyPostedTitles.includes(item.title)) {
        targetItem = item;
        // 💡 만약 이미지 URL이 유효하지 않으면 여기서 즉시 폴백 적용 후 진행
        if (!targetItem.image || targetItem.image.includes('default.png')) {
          const guideFallbacks = fallbacks.GUIDE;
          targetItem.image = guideFallbacks[Math.floor(Math.random() * guideFallbacks.length)];
          console.log(`[보정] 이미지 누락 데이터에 스톡 이미지를 할당했습니다: ${targetItem.image}`);
        }
        break;
      }
    }

    if (!targetItem) {
      console.log('모든 데이터가 이미 블로그에 작성되었습니다.');
      return;
    }

    console.log(`발행 대상 발견: ${targetItem.title}`);

    // 2. Gemini AI로 블로그 글 생성
    // 한국 시간(KST) 기준으로 오늘 날짜 가져오기
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
    const prompt = {
      contents: [{
        parts: [{
          text: `당신은 수도권 생활 정보 큐레이션 서비스 '수도권 팁픽(Tip-Pick)'의 전문 에디터입니다. 
아래 공공서비스 정보를 바탕으로 독자들에게 정말 도움이 되는 프리미엄 블로그 글을 작성해줘.

정보: ${JSON.stringify(targetItem)}

[작성 가이드라인]
1. 서비스명: '수도권 팁픽' 또는 '팁픽(Tip-Pick)'을 자연스럽게 언급해줘.
2. 톤앤매너: 친절하고 다정하지만, 전문성과 신뢰감이 느껴지는 '프리미엄 로컬 매거진' 스타일.
3. 구성: 
   - 도입부에 이 정보가 왜 중요한지 강조.
   - 본문에 '팁픽이 꼽은 추천 포인트 3가지'를 포함.
   - 신청 방법 및 대상자를 명확하게 안내.
4. 길이: 공백 제외 800자 이상의 풍부한 내용.

아래 형식으로 출력해줘. 반드시 이 형식(YAML Frontmatter 포함)만 출력하고 다른 설명 제발 없이:
---
title: (친근하고 호기심을 자극하는 제목)
originalTitle: ${targetItem.title}
link: ${targetItem.link || ''}
officialTarget: ${targetItem.target || '정보 없음'}
officialDetails: ${targetItem.details || targetItem.description || '정보 없음'}
officialDeadline: ${targetItem.deadline || targetItem.date || '상시'}
date: ${today}
summary: (전체 내용을 관통하는 매력적인 한 줄 요약)
category: 정보
image: ${targetItem.image || ''}
tags: [태그1, 태그2, 태그3]
officialRequirements: ${JSON.stringify(targetItem.requirements || [])}
officialHowToApply: ${JSON.stringify(targetItem.howToApply || [])}
officialEligibilityQuiz: ${JSON.stringify(targetItem.eligibilityQuiz || [])}
officialTip: ${targetItem.tip || ''}
---

(본문 내용 시작...)

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
    const filename = filenameMatch[1].trim().replace(/\.md$/i, '').replace(/\.+$/, '') + '.md';
    
    // FILENAME 라인 제거
    let mdContent = fullText.replace(/FILENAME:.*$/im, '').trim();
    
    // 마크다운 코드 블록 제거
    mdContent = mdContent.replace(/^```markdown\n/i, '').replace(/```$/g, '').trim();

    // 3. 파일 저장 (image 비어있으면 로컬 폴백 강제 주입)
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

  } catch (error) {
    console.error('치명적 오류 발생(자동 배포 중단을 위해 exit 1 호출):', error);
    process.exit(1);
  }
}

main();
