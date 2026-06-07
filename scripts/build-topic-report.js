#!/usr/bin/env node
'use strict';
/**
 * 일일 후보 보고서 생성기 — docs/daily-topic-report.md '하나만' 쓰는 읽기전용 도구.
 *
 * 목적: 크롤·dedup된 축제·지원금 후보를 기존 핫스코어 알고리즘으로 랭킹해, 운영자가
 *       손글 .md 글감을 직접 고르도록 돕는다. ★ 이 스크립트는 글을 발행하지 않는다.
 *
 * ── 절대 금지 ─────────────────────────────────────────────────────────────────
 *   · posts/ 쓰기 금지 · public/data/pick-info.json 쓰기 금지
 *   · generate-blog-post.js(자동발행) 호출/활성화 금지
 *   이 스크립트가 쓰는 파일은 docs/daily-topic-report.md 단 하나뿐이다.
 *
 * ── 크론 안전(가드1) ──────────────────────────────────────────────────────────
 *   치명 오류(pick-info 파싱 실패 등)에도 throw로 죽지 않고, 보고서에 "생성 실패: <이유>"
 *   한 줄을 쓴 뒤 exit 0 으로 정상 종료한다. deploy.yml 본류(fetch→dedup→validate→deploy)를
 *   절대 막지 않는다.
 *
 * 실행: node scripts/build-topic-report.js   (크론·수동 동일)
 */

const fs = require('fs');
const path = require('path');
try { require('dotenv').config({ path: '.env.local' }); } catch (_) { /* dotenv 없거나 키 없어도 무방 */ }
const matter = require('gray-matter');
const { isFestivalExpired, parseFestivalStartDate, parseFestivalEndDate, festivalSpanDays, isRecurring } = require('./lib/festival-date');
const { calcScore: calcFestScore } = require('./lib/festival-score');
const { selectFestivalBundle } = require('./lib/festival-bundle');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'public/data/pick-info.json');
const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const OUT = path.join(ROOT, 'docs/daily-topic-report.md');

// ─── 핫키워드: scripts/lib/hot-keywords.js(SSOT)로 추출(Phase 3a-2). 반환 { keywords, source }. ───
// (g·f 결정 B안) 이 보고서는 fetch와 별개 프로세스라 DataLab을 자체 호출한다(festival·benefit 2회/일).
const { getTodayHotKeywords } = require('./lib/hot-keywords');

// 후보별 점수 (⚠️ 동기화 필수 — fetch-public-data.js calcHotScore 와 동일). 저장된 점수가 없어
// fetch가 정렬에 쓴 것과 같은 알고리즘으로 '재계산'한다(pick-info엔 hotScore 미저장).
function calcHotScore(item, hotKeywords) {
  let score = 0;
  const text = [item.title, item.description, item.서비스명, item.서비스목적요약].filter(Boolean).join(' ');
  hotKeywords.forEach((kw, idx) => {
    const weight = idx < 2 ? 30 : 15;
    if ((item.title || item.서비스명 || '').includes(kw)) score += weight;
    if (text.includes(kw)) score += Math.floor(weight / 2);
  });
  return score;
}

// 제목 정규화 (⚠️ 동기화 필수 — fetch-public-data.js normTitle 와 일치). '이미 작성됨' 매칭용.
function normTitle(title) {
  return (title || '')
    .replace(/^\[[^\]]+\]\s*/, '')
    .replace(/\d{4}년?/g, '')
    .replace(/[^가-힣a-zA-Z0-9]/g, '')
    .toLowerCase();
}

// 5개 생애주기 분류 (⚠️ 동기화 필수 — src/lib/situations.ts SITUATIONS[].titleStem/compound 와 1:1 일치).
// 다중소속(독립 판정)·우선순위 없음. 소속은 '제목'에서: titleStem은 제목에만, compound는 본문(target+details)까지.
const LIFECYCLE = [
  { key: 'parenting', label: '임신·출산·육아', emoji: '👶',
    titleStem: /육아|출산|영유아|아동|부모급여|자녀|어린이|임산부|양육|유아|보육|누리|한부모/,
    compound: /가족돌봄|아이돌봄|돌봄수당|돌봄비|아동수당|양육수당|출산축하금|출산장려금|육아휴직|보육료|유아학비/ },
  { key: 'youth', label: '청년', emoji: '🧑‍🎓',
    titleStem: /청년|대학생|취준|사회초년생|기본소득|미래.?저축|도약계좌|학자금/,
    compound: /청년월세|청년수당|청년내일채움|청년도약/ },
  { key: 'senior', label: '중장년·은퇴', emoji: '🧓',
    titleStem: /중장년|신중년|어르신|노인|은퇴|퇴직|고령|4060|국민연금|노후|중년/,
    compound: /기초연금|노인일자리/ },
  { key: 'housing', label: '주거·전월세', emoji: '🏠',
    titleStem: /주거|월세|전세|임대|보증금|이사|전월세|주택|LH|SH/,
    compound: /전세자금|전세대출|월세대출|월세지원|임대주택|공공임대|국민임대|영구임대|행복주택|매입임대|전세임대|보증금지원/ },
  { key: 'disability', label: '장애인·돌봄', emoji: '♿',
    titleStem: /장애/,
    compound: /장애인연금|활동지원/ },
];
// 다중소속: 한 지원금이 0~다수 situation에 동시 소속. (situations.ts benefitBelongsTo 미러)
function situationsOf(b) {
  const all = `${b.title || ''} ${b.target || ''} ${b.details || ''}`;
  return LIFECYCLE.filter((l) => l.titleStem.test(b.title || '') || l.compound.test(all)).map((l) => l.key);
}

// ─── 만료/마감 판정 ───────────────────────────────────────────────────────────
// (가드2) 혜택 deadline에 festival-date.js를 적용할 때 '확실히 과거로 파싱된 것만' 제외한다.
// isFestivalExpired는 종료일이 실제 파싱되고 오늘 이전일 때만 true; 파싱불가·'상시'류·애매한
// 표기('매년 5.1.~5.31.' 등 연도 없는 것)는 null→false(만료 아님)로 후보에 남는다. → 보수적.
function isExpired(dateStr, today) {
  return isFestivalExpired(dateStr, today);
}
// '상시류' 판정은 festival-date.js의 isRecurring(SSOT)을 사용 — 패턴 미러 금지.
// 마감임박: deadline이 파싱돼 오늘부터 7일 이내(0~7일). 이벤트성: 상시류가 아니며 종료일이 실재하는 단발.
function deadlineInfo(dateStr, today) {
  const end = parseFestivalEndDate(dateStr);
  const recurring = isRecurring(dateStr);
  if (!end) return { hasEnd: false, recurring, daysLeft: null, imminent: false, eventLike: false };
  const t = today ? new Date(today) : new Date();
  t.setHours(0, 0, 0, 0);
  const e = new Date(end); e.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((e - t) / (24 * 60 * 60 * 1000));
  const imminent = daysLeft >= 0 && daysLeft <= 7;
  const eventLike = !recurring; // 종료일 실재 + 상시류 아님 = 단발 이벤트성
  return { hasEnd: true, recurring, daysLeft, imminent, eventLike };
}

// ─── §4-16 콘텐츠 플레이북 딱지 (기존 파서 재활용 — 병렬 파서 신설 금지) ───────────
// [용도] 지원금: 📝블로그 = 실재 미래 종료일 파싱 AND 정기류 아님(deadlineInfo 재활용). 그 외 전부 📚pillar(보수 기본값).
function benefitUsage(dl) {
  return (dl.hasEnd && !dl.recurring) ? '📝' : '📚';
}
// [시의성] 축제: festival-date.js(시작·종료 SSOT)로 오늘 기준 판정. 첫 매치 우선.
// (§4-17) 연중상설 임계 — 기간 폭이 이 일수 이상이면 단발 행사가 아니라 상시 운영처로 보고 추천(✅)에서 분리.
const PERENNIAL_SPAN_DAYS = 90;
function festTimeliness(dateStr, today) {
  const start = parseFestivalStartDate(dateStr);
  const end = parseFestivalEndDate(dateStr);
  const t = today ? new Date(today) : new Date();
  t.setHours(0, 0, 0, 0);
  const DAY = 24 * 60 * 60 * 1000;
  const diff = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return Math.round((x - t) / DAY); };
  const dStart = start ? diff(start) : null;
  const dEnd = end ? diff(end) : null;
  if (start === null && end === null) return { tag: '🌱', unparsed: true, dStart, dEnd }; // 미파싱 → 보수(추천 제외)
  if (dEnd !== null && dEnd >= 0 && dEnd <= 7) return { tag: '⏳', unparsed: false, dStart, dEnd }; // 마감임박
  // (§4-17) 상설 분리: 기간 폭 ≥ 임계 또는 상시류 텍스트면 🔄(상설) — ✅ 추천/묶음 집계에서 제외.
  const span = festivalSpanDays(dateStr);
  const perennial = (span !== null && span >= PERENNIAL_SPAN_DAYS) || isRecurring(dateStr);
  if (perennial) return { tag: '🔄', unparsed: false, dStart, dEnd };                                // 상설(연중 운영)
  const ongoing = (dStart !== null && dStart <= 0) && (dEnd === null || dEnd >= 0);                  // 진행 중
  const startingSoon = (dStart !== null && dStart >= 0 && dStart <= 21);                              // 21일 내 시작
  if (ongoing || startingSoon) return { tag: '✅', unparsed: false, dStart, dEnd };                   // 추천
  return { tag: '🌱', unparsed: false, dStart, dEnd };                                                // 재료보관(미래)
}

// ─── 보조 ────────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }); }
function yesterdayStr() {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}
function loadPostNorms() {
  if (!fs.existsSync(POSTS_DIR)) return new Set();
  const set = new Set();
  for (const f of fs.readdirSync(POSTS_DIR)) {
    if (!f.endsWith('.md')) continue;
    try {
      const fm = matter(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8'));
      if (fm.data && fm.data.title) set.add(normTitle(String(fm.data.title)));
      if (fm.data && fm.data.originalTitle) set.add(normTitle(String(fm.data.originalTitle)));
    } catch (_) { /* 한 글이 깨져도 전체 중단 금지 */ }
  }
  return set;
}
const esc = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();

function writeFailure(reason) {
  const md = `# 팁픽 일일 후보 보고서\n\n> ${todayStr()} 생성\n\n**생성 실패: ${reason}**\n\n` +
    `이 보고서는 읽기전용이며 본 배포(fetch→dedup→validate→deploy)에는 영향이 없습니다. 다음 실행에서 자동 재시도됩니다.\n`;
  try { fs.writeFileSync(OUT, md, 'utf8'); } catch (e) { console.error('보고서 실패 기록도 실패:', e.message); }
  console.log(`[report] 생성 실패 기록 후 정상 종료: ${reason}`);
}

async function main() {
  const today = todayStr();
  const yest = yesterdayStr();

  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  } catch (e) {
    writeFailure(`pick-info.json 파싱 실패 — ${e.message}`);
    process.exit(0);
  }
  const festivals = Array.isArray(data.festivals) ? data.festivals : [];
  const benefits = Array.isArray(data.benefits) ? data.benefits : [];

  // 핫키워드 (B안: 자체 DataLab 2회 + 계절 폴백)
  const fk = await getTodayHotKeywords('festival');
  const bk = await getTodayHotKeywords('benefit');

  const postNorms = loadPostNorms();
  const written = (title) => postNorms.has(normTitle(title));

  // ── 축제 후보: 만료 제외(festival-date SSOT), 수도권 전량 신뢰 ──
  const festCand = festivals
    .filter((f) => !isExpired(f.date, today))
    .map((f) => ({
      title: f.title, region: f.region, period: f.date, id: f.id,
      // (Phase 2b) 축제 점수는 calcScore(festival-score)로 통일 — 시작근접·주말·키워드 반영. benefit은 calcHotScore 유지.
      score: calcFestScore(f, 'festival', fk.keywords, today),
      written: written(f.title),
      dl: deadlineInfo(f.date, today),
      tl: festTimeliness(f.date, today),
    }))
    .sort((a, b) => b.score - a.score);

  // ── 지원금 후보: 만료 제외 + 5생애주기 분류 ──
  const benCand = benefits
    .filter((b) => !isExpired(b.deadline, today))
    .map((b) => ({
      title: b.title, region: b.region, period: b.deadline, id: b.id, target: b.target,
      buckets: situationsOf(b),
      score: calcHotScore({ title: b.title, description: b.details }, bk.keywords),
      isNew: b.addedAt === today || b.addedAt === yest,
      written: written(b.title),
      dl: deadlineInfo(b.deadline, today),
      usage: benefitUsage(deadlineInfo(b.deadline, today)),
    }))
    .sort((a, b) => b.score - a.score);

  // ── 상단 판정 ──
  const verdict = (festCand.length >= 3 || benCand.length >= 3)
    ? `✅ **쓸 거리 있음** — 축제 ${festCand.length}건 · 지원금 ${benCand.length}건 (한쪽이라도 ≥3)`
    : `⏸️ **오늘은 패스 권장** — 축제 ${festCand.length}건 · 지원금 ${benCand.length}건 (양쪽 <3, 케이던스 원칙상 강제 아님)`;

  // ── 마크다운 작성 ──
  const L = [];
  L.push(`# 팁픽 일일 후보 보고서`);
  L.push('');
  L.push(`> ${today} 생성 · 읽기전용(글 발행 안 함) · 손글 .md 글감 선별용`);
  L.push('');
  L.push(verdict);
  L.push('');

  // ── ⭐ 오늘의 추천 글감 (플레이북 §1·2) ──
  L.push(`## ⭐ 오늘의 추천 글감`);
  L.push('');
  // 📝 지원금 블로그 후보: 용도=📝 중 '마감 가까운 순'(점수순 아님) 상위 3
  const blogPicks = benCand
    .filter((b) => b.usage === '📝')
    .sort((a, b) => (a.dl.daysLeft ?? 9e9) - (b.dl.daysLeft ?? 9e9))
    .slice(0, 3);
  L.push(`**📝 지원금 블로그 후보** (마감 가까운 순)`);
  L.push('');
  if (blogPicks.length) {
    blogPicks.forEach((c) => {
      const dday = c.dl.daysLeft != null ? `D-${c.dl.daysLeft}` : '마감미상';
      L.push(`- ${esc(c.title)} (${esc(c.region)}, 마감 ${esc(c.period)} · ${dday}) — [/benefit/${esc(c.id)}/](https://tip-pick.com/benefit/${esc(c.id)}/) · **이 주제로 블로그 글 작성할까요?**`);
    });
  } else {
    L.push(`- 오늘 마감 임박 단발 없음 — 상시 제도는 pillar로.`);
  }
  L.push('');
  // 🎪 축제 묶음 후보: 발행과 공유하는 셀렉터(festival-bundle SSOT)로 산출.
  //   적격 = 만료·상설 제외 + 시작 임박(0~21일), 정렬 = calcScore, 상위 8, 5건 미만이면 스킵.
  // (§4-17) 🔄(상설)은 셀렉터가 제외하고, 표시는 festTimeliness 태그로 별도 카운트만 둔다.
  const festPerennial = festCand.filter((c) => c.tl.tag === '🔄');
  const bundle = selectFestivalBundle(festivals, today, fk.keywords);
  L.push(`**🎪 축제 묶음 후보** (시작 임박 적격 ${bundle.eligibleCount}건 · 🔄 상설 ${festPerennial.length}건 제외)`);
  L.push('');
  if (!bundle.skipped) {
    L.push(`- **이 묶음으로 블로그 1편 작성할까요?** (calcScore 상위 ${bundle.items.length}개 구성)`);
    bundle.items.forEach((c) => {
      L.push(`  - ${esc(c.title)} (${esc(c.region)}, ${esc(c.date)}) · ${c.score}점`);
    });
  } else {
    L.push(`- 이번 주 묶음 기준 미달(시작 임박 ${bundle.eligibleCount}건 < 5) — 플레이북 §1상 5개 미만 스킵.`);
  }
  L.push('');

  L.push(`- **상대점수**: pick-info에 저장된 점수가 없어 재계산한 값(절대치 아님, 후보군 내 상대 비교용). 축제는 발행과 동일한 \`calcScore\`(시작근접·주말·DataLab/계절 핫키워드), 지원금은 \`calcHotScore\`(키워드) 기준입니다.`);
  L.push(`- 핫키워드 출처 — 축제: \`${fk.source}\` (${fk.keywords.slice(0, 4).join(', ')}) / 지원금: \`${bk.source}\` (${bk.keywords.slice(0, 4).join(', ')})`);
  L.push(`- **NEW**: 지원금은 \`addedAt\`(오늘/어제) 기준. 축제는 pick-info에 등록일 필드가 없어 NEW 판정 불가(—).`);
  L.push('');

  // 축제 표
  L.push(`## 🎪 축제·행사 후보 (${festCand.length}건)`);
  L.push('');
  L.push(`> 시의성(오늘 기준) — ✅ 추천(진행 중 또는 21일 내 시작) · 🌱 재료보관(21일 초과 미래) · ⏳ 마감임박(종료 7일 이내) · 🔄 상설(기간 ${PERENNIAL_SPAN_DAYS}일 이상 또는 상시류 — 추천·묶음 제외).`);
  L.push('');
  L.push(`| 순위 | 점수 | 시의성 | 주제 | 지역 | 기간 | 상세 | 권장형태 | 이미작성 |`);
  L.push(`|---:|---:|:-:|---|---|---|---|---|---|`);
  festCand.forEach((c, i) => {
    L.push(`| ${i + 1} | ${c.score} | ${c.tl.tag} | ${esc(c.title)} | ${esc(c.region)} | ${esc(c.period)} | [/festival/${esc(c.id)}/](https://tip-pick.com/festival/${esc(c.id)}/) | 가벼운 .md | ${c.written ? '✅' : ''} |`);
  });
  if (festCand.length === 0) L.push(`| – | – | – | (진행 중 축제 후보 없음) | – | – | – | – | – |`);
  L.push('');

  // 지원금 표 (생애주기 페이지별 노출 건수·다중소속, 임신·출산·육아 최상단)
  L.push(`## 💸 지원금 후보 (${benCand.length}건)`);
  L.push('');
  L.push(`> 분류는 **페이지별 노출 건수·다중소속**입니다 — 한 지원금이 여러 생애주기 페이지에 동시 노출될 수 있어 섹션 합계가 후보 ${benCand.length}건을 초과할 수 있습니다(우선순위 없이 독립 판정).`);
  L.push(`> 용도 — 📝 블로그(실재 미래 마감의 단발·시즌) · 📚 pillar(상시·정기·마감 모호 → /guides 상시 제도). 비교가이드 주제(자녀적금·대출·보험 등)는 크롤 재고가 아니라 기획 — \`docs/keyword-map-parenting.md\` §3 큐 참조.`);
  L.push('');
  const order = ['parenting', 'youth', 'senior', 'housing', 'disability', 'etc'];
  const labelOf = (k) => (LIFECYCLE.find((l) => l.key === k) || { label: '기타(미분류)', emoji: '📌' });
  for (const key of order) {
    const group = key === 'etc'
      ? benCand.filter((b) => b.buckets.length === 0)
      : benCand.filter((b) => b.buckets.includes(key));
    if (group.length === 0) continue;
    const meta = labelOf(key);
    L.push(`### ${meta.emoji} ${meta.label} (${group.length}건)`);
    L.push('');
    L.push(`| 순위 | 점수 | 용도 | 주제 | 지역 | 마감 | 상세 | 권장형태 | NEW | 이미작성 |`);
    L.push(`|---:|---:|:-:|---|---|---|---|---|:-:|:-:|`);
    group.forEach((c, i) => {
      const rec = c.score >= 30 ? '플래그십 후보' : '가벼운 .md';
      L.push(`| ${i + 1} | ${c.score} | ${c.usage} | ${esc(c.title)} | ${esc(c.region)} | ${esc(c.period)} | [/benefit/${esc(c.id)}/](https://tip-pick.com/benefit/${esc(c.id)}/) | ${rec} | ${c.isNew ? '🆕' : ''} | ${c.written ? '✅' : ''} |`);
    });
    L.push('');
  }
  if (benCand.length === 0) { L.push(`(만료 제외 후 지원금 후보 없음)`); L.push(''); }

  // 콜아웃: 마감임박·이벤트성
  L.push(`## ⏰ 마감임박 · 이벤트성 지원금 (매일 발행/패스 판단용)`);
  L.push('');
  L.push(`> 기준 — **마감임박**: deadline이 파싱돼 오늘부터 7일 이내(0~7일). **이벤트성**: '상시·수시·연중·매월·매년·정기'류가 아니며 종료일이 실재하는 단발.`);
  L.push('');
  const imminent = benCand.filter((b) => b.dl.imminent);
  const eventLike = benCand.filter((b) => b.dl.eventLike && b.dl.hasEnd && !b.dl.imminent);
  L.push(`**🔥 마감임박 (${imminent.length}건)**`);
  L.push('');
  if (imminent.length) {
    imminent.sort((a, b) => a.dl.daysLeft - b.dl.daysLeft).forEach((c) => {
      L.push(`- D-${c.dl.daysLeft} · ${esc(c.title)} (${esc(c.region)}, ${esc(c.period)})`);
    });
  } else { L.push(`- (7일 이내 마감 후보 없음)`); }
  L.push('');
  L.push(`**🎟️ 이벤트성·단발 (${eventLike.length}건)**`);
  L.push('');
  if (eventLike.length) {
    eventLike.forEach((c) => { L.push(`- ${esc(c.title)} (${esc(c.region)}, ${esc(c.period)}${c.dl.daysLeft != null ? ` · D-${c.dl.daysLeft}` : ''})`); });
  } else { L.push(`- (상시류 외 단발 이벤트성 후보 없음)`); }
  L.push('');

  fs.writeFileSync(OUT, L.join('\n') + '\n', 'utf8');
  console.log(`[report] 생성 완료 → ${path.relative(ROOT, OUT)} (축제 ${festCand.length} · 지원금 ${benCand.length})`);
}

// 가드1: 어떤 예외도 본 배포를 막지 않게 — 보고서에 실패 기록 후 exit 0
main().catch((e) => {
  writeFailure(`예기치 못한 오류 — ${e && e.message ? e.message : e}`);
  process.exit(0);
});
