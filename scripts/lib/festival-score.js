'use strict';
/**
 * 후보 점수 계산 — generate-blog-post.js에서 추출(Phase 2a).
 * 발행 선정·보고서가 공유할 수 있도록 lib로 분리. 날짜 '파싱'은 festival-date.js(SSOT)에 위임.
 *
 * ⚠️ festival 시작일 파싱은 parseFestivalStartDate(컴팩트 YYYYMMDD·~범위·점·하이픈 모두 대응)를 쓴다.
 *   (옛 인라인 정규식은 구분자 필수라 컴팩트 날짜를 못 읽어 시작근접 보너스가 0이던 버그가 있었음.)
 *   benefit 경로의 deadline 처리는 추출 시점 로직을 그대로 보존(festival 외엔 손대지 않음).
 */

const { parseFestivalStartDate } = require('./festival-date');

const DAY = 1000 * 60 * 60 * 24;

function calcScore(item, postType, hotKeywords = [], today = new Date()) {
  let score = 0;
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const text = [item.title, item.details, item.description, item.target, item.summary, item.deadline, item.date].join(' ');

  hotKeywords.forEach((kw, idx) => {
    const weight = idx < 2 ? 30 : 15;
    if (item.title?.includes(kw)) score += weight;
    if (text.includes(kw)) score += Math.floor(weight / 2);
  });

  if (postType === 'festival') {
    // 시작일 = festival-date SSOT 파서(컴팩트·~범위 대응). 파싱 실패 시 옛 동작과 동일하게 +5.
    const startDate = parseFestivalStartDate(item.date);
    if (startDate) {
      const diffDays = Math.ceil((startDate - t) / DAY);

      if (diffDays >= 0 && diffDays <= 3) score += 60;
      else if (diffDays >= 0 && diffDays <= 7) score += 50;
      else if (diffDays < 0 && diffDays >= -14) score += 40;
      else if (diffDays > 7 && diffDays <= 14) score += 20;

      const tempDate = new Date(startDate);
      for (let i = 0; i < 7; i++) {
        const day = tempDate.getDay();
        if (day === 0 || day === 6) { score += 20; break; }
        tempDate.setDate(tempDate.getDate() + 1);
      }
    } else {
      score += 5;
    }

    if (text.includes('무료')) score += 15;
    if (text.includes('서울')) score += 10;
    if (text.includes('인천') || text.includes('경기')) score += 5;

  } else {
    const deadlineMatches = [...String(item.deadline || item.date || '').matchAll(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/g)];
    if (deadlineMatches.length > 0) {
      const last = deadlineMatches[deadlineMatches.length - 1];
      const deadlineDate = new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
      const diffDays = Math.ceil((deadlineDate - t) / DAY);

      if (diffDays >= 0 && diffDays <= 7) score += 60;
      else if (diffDays >= 0 && diffDays <= 30) score += 30;
      else if (diffDays > 30) score += 10;
    } else {
      score += 5;
    }

    if (text.includes('서울')) score += 10;
    if (text.includes('인천') || text.includes('경기')) score += 5;
    if (item.isEmergency) score += 20;
  }

  return score;
}

module.exports = { calcScore };
