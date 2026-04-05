const fs = require('fs');
const path = require('path');

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
    const allItems = [...(data.festivals || []), ...(data.benefits || [])];
    
    if (allItems.length === 0) {
      console.log('가져올 데이터가 없습니다.');
      return;
    }

    // "마지막 항목" - 사용자 요청대로 배열의 마지막 항목을 가져옴
    // (보통 unshift로 추가했다면 첫 번째가 최신이지만, 명시적 요청에 따름)
    const latestItem = allItems[allItems.length - 1];
    const title = latestItem.title;

    // 기존 파일 확인
    const postsDir = path.join(process.cwd(), 'src/content/posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    const existingFiles = fs.readdirSync(postsDir);
    const alreadyExists = existingFiles.some(file => {
      if (!file.endsWith('.md')) return false;
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      return content.includes(`title: "${title}"`) || content.includes(`title: ${title}`);
    });

    if (alreadyExists) {
      console.log('이미 작성된 글입니다');
      return;
    }

    // 2. Gemini AI로 블로그 글 생성
    const today = new Date().toISOString().split('T')[0];
    const prompt = {
      contents: [{
        parts: [{
          text: `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`
        }]
      }]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw new Error(`Gemini API 호출 실패: ${response.status}`);
    }

    const result = await response.json();
    let fullText = result.candidates[0].content.parts[0].text;

    // FILENAME 추출
    const filenameMatch = fullText.match(/FILENAME:\s*([^\s\n]+)/i);
    if (!filenameMatch) {
      throw new Error('FILENAME을 찾을 수 없습니다.');
    }
    const filename = filenameMatch[1].trim() + '.md';
    
    // FILENAME 라인 제거
    let mdContent = fullText.replace(/FILENAME:.*$/im, '').trim();
    
    // 마크다운 코드 블록 제거
    mdContent = mdContent.replace(/^```markdown\n/i, '').replace(/```$/g, '').trim();

    // 3. 파일 저장
    const finalPath = path.join(postsDir, filename);
    fs.writeFileSync(finalPath, mdContent, 'utf8');

    console.log(`생성 완료: ${filename}`);

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

main();
