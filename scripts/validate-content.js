#!/usr/bin/env node
/**
 * 콘텐츠 검증·정규화 게이트 (preflight)
 * ------------------------------------------------------------------
 * 블로그 글(src/content/posts/*.md) + pick-info(festivals/benefits)를
 * 발행 전에 일괄 검사하고, 자동 교정 가능한 위반은 고친다.
 * 규칙을 "한 곳"에 모아 생성·렌더가 같은 규격을 공유하게 하는 단일 게이트.
 *
 * 사용:
 *   node scripts/validate-content.js        # 리포트만 (위반 있으면 exit 1)
 *   node scripts/validate-content.js --fix  # 자동 교정 후 파일 기록, 남은 BLOCKING만 exit 1
 *   node scripts/validate-content.js --quarantine  # 교정 불가 글을 _quarantine 폴더로 격리
 *
 * 규칙 종류:
 *   [AUTO]  자동 교정 가능 (--fix 시 수정)
 *   [BLOCK] 자동 교정 불가 → 발행 차단 대상 (regenerate/수기 필요)
 */
const fs = require('fs');
const path = require('path');
let yaml;
try { yaml = require('js-yaml'); } catch { yaml = null; }

const FIX = process.argv.includes('--fix');
const QUARANTINE = process.argv.includes('--quarantine');
const POSTS_DIR = path.join('src', 'content', 'posts');
const QUAR_DIR = path.join('src', 'content', '_quarantine');
const PICK = path.join('public', 'data', 'pick-info.json');

// ── 공통 유틸 (생성기·크롤러와 동일 규격) ──────────────────────────────
const PROMPT_ECHO_SIGS = [
  'This is a general support curation blog post.',
  'You are a professional editor and SEO expert',
  'Selected Theme (Persona):',
  'Information Dataset (Array):',
  '이 글은 일반 지원금 테마별 큐레이션',
  '이 글은 주거/임대 지원 테마별 큐레이션',
  '이 글은 축제/행사 테마별 큐레이션',
  '당신은 수도권 생활 정보 큐레이션 서비스',
  '정보 데이터 세트(배열):',
  '[타겟 및 톤앤매너]',
  '[작성 가이드라인 - 본문 구조 강제]',
];

function isDeadlineExpired(deadline) {
  if (!deadline) return false;
  const m = [...String(deadline).matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (!m.length) return false;
  const last = m[m.length - 1];
  const end = new Date(+last[1], +last[2] - 1, +last[3]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return end < today;
}
function isProgramTerminated(item) {
  const text = `${(item && item.title) || ''} ${(item && item.deadline) || ''}`;
  return /(신규지원\s*종료|지원\s*종료|접수\s*종료|사업\s*종료|모집\s*종료|운영\s*종료|종료\s*안내|폐지되었|폐지\s*안내)/.test(text);
}
const collapseDashes = s => String(s).replace(/-{40,}/g, '---');
function normalizeOfficialTip(v) {
  return String(v)
    .replace(/\*\*/g, '')
    .replace(/(^|\s)-\s+(?=\d+\.)/g, '$1')
    .replace(/(^|\s)\d+\.\s+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
// 표 행의 셀 개수 (| a | b | c | → 3)
function cellCount(row) {
  return row.split('|').slice(1, -1).length || row.split('|').filter(Boolean).length;
}
const isSepRow = l => /^\s*\|?[\s:|-]+\|?\s*$/.test(l) && /-/.test(l);

// 표 셀 안 줄바꿈(실제 \n)으로 깨진 행을 한 행으로 병합 (셀 내 줄바꿈 → <br>) + 폭주 대시 축소
// GFM 표는 셀 안에 줄바꿈을 못 넣어, 멀티라인 셀이 별도 행으로 깨지는 문제를 교정한다.
function fixTableCells(text) {
  if (!text || !text.includes('|')) return text;
  const lines = String(text).replace(/-{10,}/g, '---').split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i], tr = ln.trim();
    if (tr.startsWith('|') && !tr.endsWith('|')) {       // | 로 시작하는데 닫히지 않은 셀
      let merged = ln.replace(/\s+$/, '');
      let steps = 0;
      while (i + 1 < lines.length && steps < 10) {
        i++; steps++;
        const nt = lines[i].trim();
        if (/^\|.*\|$/.test(nt) || /^#{1,6}\s/.test(nt)) { i--; break; } // 새 행/헤딩이면 멈춤
        if (nt === '') continue;                          // 셀 내 빈 줄은 건너뜀
        merged = merged + '<br>' + nt;
        if (nt.endsWith('|')) break;                      // 셀이 닫히면 종료
      }
      if (!merged.trim().endsWith('|')) merged = merged.replace(/<br>$/, '') + ' |'; // 안전: 강제 닫기
      out.push(merged);
    } else out.push(ln);
  }
  return out.join('\n');
}

// ── 결과 수집 ──────────────────────────────────────────────────────
const report = { fixed: [], blocked: [], warned: [], ok: 0, files: 0, willFix: 0 };
function logFix(where, msg) { report.fixed.push(`[FIX] ${where}: ${msg}`); }
function logBlock(where, msg) { report.blocked.push(`[BLOCK] ${where}: ${msg}`); }   // 치명: 발행 차단
function logWarn(where, msg) { report.warned.push(`[WARN] ${where}: ${msg}`); }       // 비치명: 품질 경고

// ── 1) 블로그 글 검사 ───────────────────────────────────────────────
function checkPost(file) {
  const fp = path.join(POSTS_DIR, file);
  const orig = fs.readFileSync(fp, 'utf8');
  const where = file;
  let blocking = false;

  const fmMatch = orig.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) { logBlock(where, '프론트매터(---) 없음'); return { blocking: true }; }
  // 머리(프론트매터 포함)와 본문을 바이트 그대로 분리 — 실제 교정 부분만 바뀌게 한다.
  const head0 = orig.slice(0, fmMatch[0].length);
  const body0 = orig.slice(fmMatch[0].length);
  let head = head0, body = body0;

  // (AUTO) 본문 대시 폭주
  if (/-{40,}/.test(body)) { body = collapseDashes(body); logFix(where, '본문 대시 폭주(40+) → ---'); }

  // (AUTO) 프롬프트 에코 제거
  for (const sig of PROMPT_ECHO_SIGS) {
    const idx = body.indexOf(sig);
    if (idx !== -1) {
      const ls = body.lastIndexOf('\n', idx);
      body = body.slice(0, ls > 0 ? ls : idx).trimEnd() + '\n';
      logFix(where, `프롬프트 에코 제거 ("${sig.slice(0, 20)}…")`);
    }
  }

  // (AUTO) 표 무결성: 헤더-구분선 컬럼 수 일치 + 데이터행 존재
  {
    const lines = body.split('\n');
    const out = [];
    let touched = false;
    for (let i = 0; i < lines.length; i++) {
      const cur = lines[i], next = lines[i + 1];
      if (/\|/.test(cur) && next != null && isSepRow(next)) {
        const headCols = cellCount(cur), sepCols = cellCount(next);
        const dataAfter = lines[i + 2] != null && /\|/.test(lines[i + 2]) && !isSepRow(lines[i + 2]);
        if (!dataAfter) { logFix(where, '데이터행 없는 깨진 표 제거'); touched = true; i++; continue; }
        if (headCols !== sepCols) {
          out.push(cur);
          out.push('| ' + Array(headCols).fill(':---').join(' | ') + ' |');
          logFix(where, `표 구분선 컬럼 수 보정 (${sepCols}→${headCols})`);
          touched = true; i++; continue;
        }
      }
      out.push(cur);
    }
    if (touched) body = out.join('\n');
  }

  // (AUTO) officialTip 평문화 (프론트매터)
  head = head.replace(/^(officialTip):[ \t]*(.+)$/m, (m, k, v) => {
    let raw = v.trim();
    // 따옴표로 감싼 값은 벗겨서 내부를 정규화 (선두 "1." 등이 따옴표에 가려 안 지워지는 문제 방지)
    let quoted = false;
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      quoted = true; raw = raw.slice(1, -1);
    }
    const nv = normalizeOfficialTip(raw);
    if (nv === raw && !quoted) return m;       // 변화 없음
    if (nv === raw && quoted) return m;          // 내부 동일 → 그대로
    logFix(where, 'officialTip 평문화(별표·번호 제거)');
    return `${k}: "${nv.replace(/"/g, '\\"')}"`; // 평문화 후 YAML 안전하게 큰따옴표로 감쌈
  });

  // (AUTO) 프론트매터 스칼라 YAML 안전화: 따옴표/지시자 문자로 시작하거나 ': '를 포함한
  // 미따옴표 스칼라(예: officialDetails가 '…'는 … 형태)를 큰따옴표로 감싸 파싱 에러를 자동 수리.
  head = head.replace(/^(---\r?\n)([\s\S]*?)(\r?\n---)/, (m, open, fmBody, close) => {
    const fixed = fmBody.replace(/^([a-zA-Z][a-zA-Z0-9_]*):[ \t]+(\S.*)$/gm, (line, key, value) => {
      const t = value.trim();
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return line; // 정상 따옴표
      if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) return line; // 배열/객체
      if (/^['"\-?:,&*!|>@%`#[\]{}]/.test(t) || t.includes(': ')) {
        logFix(where, `프론트매터 '${key}' YAML 안전 따옴표 처리`);
        return `${key}: "${t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return line;
    });
    return open + fixed + close;
  });

  // (BLOCK) 프론트매터 YAML 파싱
  const fmText = (head.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [, ''])[1];
  if (yaml) { try { yaml.load(fmText); } catch (e) { logBlock(where, `프론트매터 YAML 파싱 실패: ${e.reason || e.message}`); blocking = true; } }
  // (BLOCK) 필수 필드
  for (const key of ['title', 'date', 'category']) {
    if (!new RegExp(`^${key}:`, 'm').test(fmText)) { logBlock(where, `필수 필드 누락: ${key}`); blocking = true; }
  }
  // (WARN) officialDetails 과다 길이 — '상세 내용' 카드는 간결해야 한다(상세 설명은 본문).
  // 너무 길면 카드 시인성이 떨어지고 글마다 형식이 들쭉날쭉해진다.
  const odM = fmText.match(/^officialDetails:\s*(.+)$/m);
  if (odM) {
    const od = odM[1].trim().replace(/^["']|["']$/g, '');
    if (od.length > 300) logWarn(where, `officialDetails 과다 길이 ${od.length}자 (권장 ~200자 이내, 상세 설명은 본문으로) — 카드 시인성 저하`);
  }

  // 제목 형식([지역] 접두)은 자동생성 단일항목 글에만 적용되는 규칙이라
  // 라운드업·기획 글이 많은 블로그 전체엔 강제하지 않는다(오탐 방지).

  // 실제 교정이 있을 때만 기록
  const next = head + body;
  if (next !== orig) {
    if (FIX) fs.writeFileSync(fp, next, 'utf8');
    else report.willFix++;
  }
  if (blocking && QUARANTINE && FIX) {
    if (!fs.existsSync(QUAR_DIR)) fs.mkdirSync(QUAR_DIR, { recursive: true });
    fs.renameSync(fp, path.join(QUAR_DIR, file));
    report.blocked.push(`  → 격리됨: ${file} → _quarantine/`);
  }
  return { blocking };
}

// ── 2) pick-info 검사 ──────────────────────────────────────────────
function checkPickInfo() {
  if (!fs.existsSync(PICK)) return;
  const rawTxt = fs.readFileSync(PICK, 'utf8');
  const hadNL = rawTxt.endsWith('\n');
  const data = JSON.parse(rawTxt);
  let changed = false;

  // 종료/만료 제도 제거 (AUTO)
  const bBefore = (data.benefits || []).length;
  data.benefits = (data.benefits || []).filter(b => {
    if (isProgramTerminated(b)) { logFix('pick-info', `종료 제도 제거: ${b.title}`); changed = true; return false; }
    if (b.deadline && b.deadline !== '상시' && isDeadlineExpired(b.deadline)) { logFix('pick-info', `만료 지원금 제거: ${b.title}`); changed = true; return false; }
    return true;
  });
  // 종료 축제 제거 (AUTO)
  data.festivals = (data.festivals || []).filter(f => {
    if (f.date && f.date !== '상시' && isDeadlineExpired(f.date)) { logFix('pick-info', `종료 축제 제거: ${f.title}`); changed = true; return false; }
    return true;
  });

  // 텍스트 필드 대시 폭주 정리 + benefit 품질 경고 (AUTO/WARN)
  for (const b of data.benefits) {
    for (const k of ['details', 'detailedExplanation', 'tip', 'practicalTip', 'simulation', 'target']) {
      if (typeof b[k] === 'string' && /-{40,}/.test(b[k])) { b[k] = collapseDashes(b[k]); logFix('pick-info', `benefit '${b.title?.slice(0,20)}' ${k} 대시 폭주 정리`); changed = true; }
    }
    if (!b.detailedExplanation || !b.detailedExplanation.trim()) logWarn('pick-info', `benefit detailedExplanation 비어있음(상세페이지 폴백): ${b.title}`);
  }

  // 축제 content: 표 셀 줄바꿈으로 깨진 마크다운 표 교정 (AUTO)
  for (const f of (data.festivals || [])) {
    if (typeof f.content === 'string' && f.content.includes('|')) {
      const fixed = fixTableCells(f.content);
      if (fixed !== f.content) { f.content = fixed; logFix('pick-info', `festival '${(f.title || '').slice(0, 20)}' 표 셀 줄바꿈 교정`); changed = true; }
    }
  }

  if (changed && FIX) fs.writeFileSync(PICK, JSON.stringify(data, null, 2) + (hadNL ? '\n' : ''), 'utf8');
  else if (changed && !FIX) report.willFix++;
}

// ── 실행 ───────────────────────────────────────────────────────────
function main() {
  const posts = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')) : [];
  report.files = posts.length;
  let blockingCount = 0;
  for (const f of posts) { const r = checkPost(f); if (r.blocking) blockingCount++; }
  checkPickInfo();

  console.log(`\n=== 콘텐츠 검증 게이트 (${FIX ? 'FIX' : 'REPORT'} 모드) ===`);
  console.log(`블로그 글 ${report.files}개 검사`);
  if (report.fixed.length) { console.log(`\n[교정 ${report.fixed.length}건]`); report.fixed.forEach(s => console.log('  ' + s)); }
  if (!FIX && report.willFix) console.log(`\n(REPORT 모드) 교정 대상 파일 ${report.willFix}개 — '--fix'로 반영`);
  if (report.warned.length) { console.log(`\n[품질 경고 ${report.warned.length}건 (비치명)]`); report.warned.forEach(s => console.log('  ' + s)); }
  if (report.blocked.length) { console.log(`\n[발행 차단 ${report.blocked.length}건]`); report.blocked.forEach(s => console.log('  ' + s)); }
  if (!report.fixed.length && !report.blocked.length && !report.warned.length) console.log('✓ 위반 없음 — 전부 규격 통과');

  // 차단 오류가 남으면 비정상 종료 (FIX 모드에서 격리까지 했으면 0)
  const hardBlock = report.blocked.filter(s => s.startsWith('[BLOCK]')).length;
  if (hardBlock > 0 && !(QUARANTINE && FIX)) {
    console.error(`\n✗ 교정 불가 BLOCKING ${hardBlock}건 — 발행 전 처리 필요`);
    process.exit(1);
  }
  console.log('\n✓ 게이트 통과');
}
main();
