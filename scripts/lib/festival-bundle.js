'use strict';
/**
 * 축제 묶음 선정 셀렉터 — §4-15 Phase 2b. 발행·보고서가 공유하는 단일 진실 공급원(SSOT).
 *
 * selectFestivalBundle(festivals, today, hotKeywords):
 *   · 제외: 만료(isFestivalExpired) + 상설(festivalSpanDays ≥ 90 또는 isRecurring)
 *   · 포함: 시작 임박만 — parseFestivalStartDate 기준 dStart 0~21 (진행중·미래>21·상설 배제)
 *   · 정렬: calcScore(festival-score, 시작근접·주말·키워드 반영) 내림차순
 *   · 슬라이스: 상위 8
 *   · 스킵: 적격 후보 5건 미만이면 발행 안 함(플레이북 §1: 5개 미만 스킵)
 *
 * 날짜는 전부 festival-date 파서 경유(인라인 정규식 금지). RECURRING도 festival-date SSOT.
 */

const { isFestivalExpired, parseFestivalStartDate, festivalSpanDays, isRecurring } = require('./festival-date');
const { calcScore } = require('./festival-score');

const PERENNIAL_SPAN_DAYS = 90; // 연중상설 임계(festTimeliness와 동일 기준 — 동기화 필수)
const BUNDLE_MIN = 5;           // 묶음 최소 건수(미만이면 스킵)
const BUNDLE_MAX = 8;           // 묶음 상위 슬라이스
const START_WINDOW_DAYS = 21;   // 시작 임박 창(0~21일)

function startOffsetDays(dateStr, today) {
  const start = parseFestivalStartDate(dateStr);
  if (!start) return null;
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  return Math.round((s - t) / (24 * 60 * 60 * 1000));
}

function isPerennial(dateStr) {
  const span = festivalSpanDays(dateStr);
  return (span !== null && span >= PERENNIAL_SPAN_DAYS) || isRecurring(dateStr);
}

function selectFestivalBundle(festivals, today = new Date(), hotKeywords = []) {
  const list = Array.isArray(festivals) ? festivals : [];

  const eligible = list.filter((f) => {
    if (isFestivalExpired(f.date, today)) return false;   // 만료 제외
    if (isPerennial(f.date)) return false;                 // 상설 제외
    const dStart = startOffsetDays(f.date, today);
    return dStart !== null && dStart >= 0 && dStart <= START_WINDOW_DAYS; // 시작 임박만
  });

  const eligibleCount = eligible.length;

  if (eligibleCount < BUNDLE_MIN) {
    return { items: [], skipped: true, eligibleCount };
  }

  const items = eligible
    .map((f) => ({ ...f, score: calcScore(f, 'festival', hotKeywords, today), tag: '✅' }))
    .sort((a, b) => b.score - a.score)
    .slice(0, BUNDLE_MAX);

  return { items, skipped: false, eligibleCount };
}

module.exports = { selectFestivalBundle, PERENNIAL_SPAN_DAYS, BUNDLE_MIN, BUNDLE_MAX, START_WINDOW_DAYS };
