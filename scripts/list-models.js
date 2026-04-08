const fs = require('fs');

async function main() {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY가 없습니다.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`;
    const response = await fetch(url);
    const result = await response.json();
    
    console.log('--- 가용한 Gemini 모델 목록 ---');
    if (result.models) {
      result.models.forEach(m => {
        console.log(`- ${m.name} (지원 기능: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log('모델 목록을 가져오지 못했습니다:', JSON.stringify(result, null, 2));
    }
    console.log('------------------------------');

  } catch (error) {
    console.error('모델 목록 조회 중 오류 발생:', error.message);
  }
}

main();
