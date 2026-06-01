/**
 * add-curation-note.js
 * officialCurationNote 필드가 없는 블로그 포스트에 자동 생성 후 주입
 * Gemini API 호출 없이 기존 frontmatter 데이터만으로 생성
 *
 * 사용법:
 *   node scripts/add-curation-note.js           # 전체 실행
 *   node scripts/add-curation-note.js --dry-run  # 변경 없이 미리보기만
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../src/content/posts');
const DRY_RUN = process.argv.includes('--dry-run');

// frontmatter 파싱 (gray-matter 없이 순수 정규식)
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\n---/);
  if (!match) return null;
  const raw = match[1];
  const data = {};

  for (const line of raw.split('\n')) {
    const m = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    // 따옴표 제거
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }
  return { raw, data };
}

// officialDetails / title 에서 핵심 숫자(금액·%) 추출
function extractKeyNumber(text) {
  if (!text) return null;
  // 최대 N만원 우선
  const maxWon = text.match(/최대\s*([\d,]+만원)/);
  if (maxWon) return `최대 ${maxWon[1]}`;
  // N만원
  const won = text.match(/([\d,]+만원)/);
  if (won) return won[1];
  // N억원
  const eok = text.match(/([\d,]+억원)/);
  if (eok) return eok[1];
  // N%
  const pct = text.match(/([\d]+%)/);
  if (pct) return pct[1];
  // N천원
  const cheon = text.match(/([\d,]+천원)/);
  if (cheon) return cheon[1];
  return null;
}

// officialTarget 정제 (50자 초과 시 앞부분만)
function cleanTarget(target) {
  if (!target) return null;
  const t = target.replace(/\(.*?\)/g, '').replace(/·/g, ', ').trim();
  return t.length > 50 ? t.substring(0, 48) + '…' : t;
}

// officialDeadline 이 실제 의미있는 날짜인지 (상시·정보없음·먼미래 제외)
function isSpecificDeadline(deadline) {
  if (!deadline) return false;
  const lower = deadline.toLowerCase();
  if (lower.includes('상시') || lower.includes('정보') || lower.includes('없음') || lower.trim() === '') return false;
  // 연도가 없으면 false
  if (!/\d{4}/.test(deadline)) return false;
  // 2099 같은 먼 미래 or 범위가 수십년이면 제외
  if (/2099|2080|2070|2060|2050/.test(deadline)) return false;
  // 범위(~) 포함 시 시작~끝 연도 차이가 2년 이상이면 제외
  if (deadline.includes('~')) {
    const years = deadline.match(/\d{4}/g);
    if (years && years.length >= 2 && parseInt(years[1]) - parseInt(years[0]) >= 2) return false;
  }
  return true;
}

// curation note 생성 핵심 함수
function generateCurationNote(data) {
  const title = data.title || '';
  const target = cleanTarget(data.officialTarget) || cleanTarget(data.target);
  const details = data.officialDetails || data.details || '';
  const deadline = data.officialDeadline || data.deadline || '';
  const category = (data.category || '').toLowerCase();

  const keyNum = extractKeyNumber(details) || extractKeyNumber(title);
  const hasDeadline = isSpecificDeadline(deadline);

  // 대상 없으면 title에서 유추
  const audience = target || '해당 조건에 맞는 수도권 시민';

  if (category === 'festival') {
    // 축제/행사 타입
    if (hasDeadline) {
      const dateShort = deadline.replace('2026.', '').replace('2025.', '');
      return `이런 분께 강력 추천합니다: ${audience}. ${dateShort}까지 진행되는 행사이므로, 지금 바로 일정을 확인하고 방문 계획을 세우세요.`;
    }
    return `이런 분께 강력 추천합니다: ${audience}. 자세한 일정·장소·프로그램을 미리 확인해 가장 알찬 나들이를 계획해보세요.`;
  }

  // benefit / 기타 타입
  if (keyNum && hasDeadline) {
    const dateShort = deadline.replace('2026.', '').replace('2025.', '');
    return `이런 분께 강력 추천합니다: ${audience}. ${keyNum} 혜택을 ${dateShort}까지 신청할 수 있으니, 자격 조건을 지금 바로 확인하고 놓치지 마세요.`;
  }
  if (keyNum) {
    return `이런 분께 강력 추천합니다: ${audience}. ${keyNum} 혜택을 상시 신청할 수 있으며, 조건에 해당된다면 지금 바로 신청하세요.`;
  }
  if (hasDeadline) {
    const dateShort = deadline.replace('2026.', '').replace('2025.', '');
    return `이런 분께 강력 추천합니다: ${audience}. ${dateShort}이 마감이니 지금 바로 신청 조건을 확인하고 서두르세요.`;
  }

  // fallback — 깔끔한 일반 문장 (제목 인용 없이)
  return `이런 분께 강력 추천합니다: ${audience}. 신청 기간을 놓치면 다음 기회를 기다려야 하니 오늘 바로 자격 조건을 확인하고 신청하세요.`;
}

// frontmatter 에 officialCurationNote 삽입 (tags: 바로 뒤)
function insertCurationNote(content, note) {
  // 이미 있으면 스킵
  if (/^officialCurationNote:/m.test(content)) return null;

  const escaped = note.replace(/"/g, '\\"');
  const line = `officialCurationNote: "${escaped}"`;

  // tags: 줄 바로 뒤에 삽입
  if (/^tags:/m.test(content)) {
    return content.replace(/^(tags:.*)/m, `$1\n${line}`);
  }
  // tags 없으면 --- 닫기 바로 앞에 삽입
  return content.replace(/\n---\n/, `\n${line}\n---\n`);
}

function main() {
  if (DRY_RUN) console.log('[DRY RUN] 파일 저장 없이 미리보기만 출력합니다.\n');

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // 이미 필드 있으면 스킵
    if (/^officialCurationNote:/m.test(content)) {
      skipped++;
      continue;
    }

    const parsed = parseFrontmatter(content);
    if (!parsed) {
      console.warn(`[경고] frontmatter 파싱 실패: ${file}`);
      errors++;
      continue;
    }

    const note = generateCurationNote(parsed.data);
    const newContent = insertCurationNote(content, note);

    if (!newContent) {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`[미리보기] ${file}`);
      console.log(`  → ${note}\n`);
    } else {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    updated++;
  }

  console.log(`\n완료: ${updated}개 업데이트 / ${skipped}개 이미 있음 / ${errors}개 오류`);
  if (DRY_RUN) console.log('\n실제 적용하려면: node scripts/add-curation-note.js');
}

main();
