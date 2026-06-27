'use strict';
/**
 * 축제/공고 날짜 파서 — 단일 진실 공급원(SSOT).
 * 컴팩트(YYYYMMDD)·점(YYYY.MM.DD)·하이픈(YYYY-MM-DD)·슬래시(YYYY/MM/DD)를 '모두' 파싱한다.
 * 범위("A~B")면 ~ 뒤(마지막) 날짜를 종료일로 본다. 파싱 불가/상시면 null.
 *
 * ⚠️ 동기화 필수(3+1곳): 이 모듈을 require 하는 곳 —
 *   - scripts/fetch-public-data.js  (isDeadlineExpired)
 *   - scripts/generate-blog-post.js (발행 만료 가드)
 *   - scripts/validate-content.js   (만료 재발 감시 게이트)
 *   그리고 동일 로직을 ESM으로 '미러링'한 곳(브라우저 번들이라 require 불가):
 *   - src/components/FestivalsClient.tsx (parseFestivalDates)  ← 한쪽 고치면 반드시 같이 고칠 것.
 */

// 단일 날짜 토큰 1개를 Date로. 실패 시 null.
function parseDateToken(s) {
  if (!s) return null;
  const str = String(s).trim();
  // 1) 구분자 있는 형식 우선: YYYY[. - /]M[. - /]D
  let m = str.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  // 2) 구분자 없는 컴팩트 YYYYMMDD (8자리)
  m = str.match(/(\d{4})(\d{2})(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  return null;
}

// 시작일(범위면 ~ 앞). 실패 null.
function parseFestivalStartDate(dateStr) {
  if (!dateStr || dateStr === '상시') return null;
  const parts = String(dateStr).split('~');
  return parseDateToken(parts[0]);
}

// 종료일(범위면 ~ 뒤, 단일이면 그 날짜). 실패 null.
function parseFestivalEndDate(dateStr) {
  if (!dateStr || dateStr === '상시') return null;
  const parts = String(dateStr).split('~');
  return parseDateToken(parts[parts.length - 1]);
}

// 종료일이 기준일(자정)보다 과거면 true. 파싱 불가/상시면 false(만료 아님으로 통과).
function isFestivalExpired(dateStr, today) {
  const end = parseFestivalEndDate(dateStr);
  if (!end) return false;
  const t = today ? new Date(today) : new Date();
  t.setHours(0, 0, 0, 0);
  return end < t;
}

// '상시류'(종료일 없는 지속/반복) 표기 패턴 — 연중상설 식별의 텍스트 신호. SSOT.
const RECURRING = /상시|수시|연중|매월|매년|정기|모집중/;
function isRecurring(dateStr) {
  return RECURRING.test(dateStr || '');
}

// 행사 기간 폭(일수) = 종료 − 시작. 둘 다 파싱돼야 산정(하나라도 null이면 null).
// 단일 날짜는 시작=종료라 0. 연중상설 식별(폭 ≥ N일) 등에 쓰는 SSOT.
function festivalSpanDays(dateStr) {
  const start = parseFestivalStartDate(dateStr);
  const end = parseFestivalEndDate(dateStr);
  if (!start || !end) return null;
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  const e = new Date(end); e.setHours(0, 0, 0, 0);
  return Math.round((e - s) / (24 * 60 * 60 * 1000));
}

module.exports = {
  parseDateToken,
  parseFestivalStartDate,
  parseFestivalEndDate,
  isFestivalExpired,
  festivalSpanDays,
  RECURRING,
  isRecurring,
};
