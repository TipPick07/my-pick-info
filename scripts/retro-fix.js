const fs = require('fs');
const path = require('path');

// 문장을 질문형(~이신가요?)으로 변환하는 함수
function asQuestion(text) {
  if (!text) return "";
  let q = text.trim();
  if (q.endsWith('?')) return q;
  
  q = q.replace(/자$/, '자이신가요?')
       .replace(/가구$/g, '가구에 속하시나요?')
       .replace(/대상$/g, '대상에 해당하시나요?')
       .replace(/충족$/g, '충족하시나요?');
  
  if (!q.endsWith('?') && !q.endsWith('요')) {
    q += '이신가요?';
  }
  return q;
}

async function main() {
  const dataPath = path.join(__dirname, '../public/data/pick-info.json');
  if (!fs.existsSync(dataPath)) {
    console.error('pick-info.json을 찾을 수 없습니다.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let fixCount = 0;

  if (data.benefits) {
    data.benefits = data.benefits.map(b => {
      let isFixed = false;

      // 1. eligibilityQuiz 보정
      if (!b.eligibilityQuiz || b.eligibilityQuiz.length === 0 || b.eligibilityQuiz[0] === '-') {
        const raw = b.target || "해당 지원 사업의 대상자이신가요?";
        b.eligibilityQuiz = [asQuestion(raw)];
        isFixed = true;
      } else {
        // 기존 퀴즈도 질문형으로 보정
        b.eligibilityQuiz = b.eligibilityQuiz.map(q => asQuestion(q));
      }

      // 2. requirements 폴백
      if (!b.requirements || b.requirements.length === 0 || b.requirements[0] === '-') {
        b.requirements = ["지원금별로 필요한 서류가 다를 수 있습니다. 정확한 서류는 하단의 공식 사이트에서 반드시 확인해 주세요."];
        isFixed = true;
      }

      // 3. howToApply 폴백
      if (!b.howToApply || b.howToApply.length === 0 || b.howToApply[0] === '-') {
        b.howToApply = ["온라인 신청 또는 관할 주민센터 방문 신청 (상세 내용은 공식 사이트 참조)"];
        isFixed = true;
      }

      // 4. details/link 등 필수 필드 누락 시 보정
      if (!b.details) {
        b.details = b.summary || "상세 정보는 공식 홈페이지를 참조하세요.";
        isFixed = true;
      }
      if (b.link === undefined) {
        b.link = "";
        isFixed = true;
      }

      if (isFixed) fixCount++;
      return b;
    });
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ JSON 데이터 보정 완료: 총 ${fixCount}개의 항목이 업데이트되었습니다.`);

  // 2. 기존 MDX (블로그 포스트) 보정
  const postsDir = path.join(__dirname, '../src/content/posts');
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    let mdxFixCount = 0;

    for (const file of files) {
      const fullPath = path.join(postsDir, file);
      let content = fs.readFileSync(fullPath, 'utf8');
      let isFixed = false;

      // Frontmatter 추출 (단순화된 방식)
      const fmMatch = content.match(/^---([\s\S]*?)---/);
      if (fmMatch) {
        let fm = fmMatch[1];
        
        // 1분 자격 진단기(officialEligibilityQuiz) 누락 시 보정
        if (!fm.includes('officialEligibilityQuiz:')) {
          const targetMatch = fm.match(/officialTarget:\s*(.*)/);
          const target = targetMatch ? targetMatch[1].trim() : "지원 대상자";
          const quiz = [asQuestion(target)];
          fm += `officialEligibilityQuiz: ${JSON.stringify(quiz)}\n`;
          isFixed = true;
        }

        // 구비서류(officialRequirements) 누락 시 보정
        if (!fm.includes('officialRequirements:')) {
          const requirements = ["지원금별로 필요한 서류가 다를 수 있습니다. 정확한 서류는 하단의 공식 사이트에서 반드시 확인해 주세요."];
          fm += `officialRequirements: ${JSON.stringify(requirements)}\n`;
          isFixed = true;
        }

        // 신청방법(officialHowToApply) 누락 시 보정
        if (!fm.includes('officialHowToApply:')) {
          const howToApply = ["온라인 신청 또는 관할 주민센터 방문 신청 (상세 내용은 공식 사이트 참조)"];
          fm += `officialHowToApply: ${JSON.stringify(howToApply)}\n`;
          isFixed = true;
        }

        if (isFixed) {
          content = content.replace(fmMatch[1], fm);
          fs.writeFileSync(fullPath, content, 'utf8');
          mdxFixCount++;
        }
      }
    }
    console.log(`✓ MDX 데이터 보정 완료: 총 ${mdxFixCount}개의 파일이 업데이트되었습니다.`);
  }
}

main();
