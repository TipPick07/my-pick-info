#!/usr/bin/env node
/**
 * RSS 2.0 피드 생성기 (2026-08-07 신설)
 * ─────────────────────────────────────────────────────────────
 * `public/rss.xml` 을 만든다. **전체 글을 최신순으로** 담는다(개수 제한 없음).
 *
 * ▷ 왜 라우트 핸들러가 아니라 빌드 스크립트인가
 *   이 프로젝트는 `output: "export"` 정적 내보내기다. sitemap-news·llms.txt 와
 *   같은 방식(prebuild → public/)으로 맞춰 두면 동작 경로가 하나로 통일된다.
 *
 * ▷ 담는 것: src/content/posts/*.md 중 공개 카테고리 글 전부.
 *   가이드(/guides/)·계산기(/tools/)는 발행일 개념이 없어 제외한다.
 *
 * 실행: prebuild 단계에서 자동. 수동은 `node scripts/build-rss.js`.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE = 'https://tip-pick.com';
const FEED_TITLE = '팁픽 (TIP-PICK)';
const FEED_DESC =
  '정부 지원금·세금·생활금융을 직접 계산해서 확인하는 정보 사이트. 모든 글에 자체 계산 예시를 넣습니다.';
const LANG = 'ko-KR';

/** 승인 모드에서 숨기는 카테고리 — src/config/categories.ts 와 같은 기준. */
const HIDDEN_CATEGORIES = new Set(['hot', 'tips', 'festival', 'festivals']);

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const OUT = path.join(process.cwd(), 'public/rss.xml');

/** XML 특수문자 이스케이프. */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** YAML 은 따옴표 없는 `date: 2026-08-07` 을 Date 객체로 파싱한다. */
function toYmd(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v || '').slice(0, 10);
}

/** RFC 822 (RSS pubDate 규격). 발행일 09:00 KST = 00:00 UTC 로 본다. */
function rfc822(ymd) {
  const d = new Date(`${ymd}T00:00:00Z`);
  return isNaN(d.getTime()) ? null : d.toUTCString();
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('[rss] posts 디렉터리 없음 — 건너뜀');
    return;
  }

  const items = [];
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith('.md')) continue;
    let fm;
    try {
      fm = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')).data;
    } catch {
      continue;
    }
    if (!fm || !fm.title || !fm.date) continue;
    if (HIDDEN_CATEGORIES.has(String(fm.category || ''))) continue;

    const ymd = toYmd(fm.date);
    const pub = rfc822(ymd);
    if (!pub) continue;

    items.push({
      slug: file.replace(/\.md$/, ''),
      title: fm.title,
      description: fm.description || fm.summary || '',
      category: fm.category === '경제' ? '경제·세금' : '정부 지원금',
      ymd,
      pub,
    });
  }

  // 최신순. 같은 날이면 슬러그 역순으로 안정 정렬(빌드마다 순서가 흔들리지 않게).
  items.sort((a, b) => (a.ymd === b.ymd ? (a.slug < b.slug ? 1 : -1) : a.ymd < b.ymd ? 1 : -1));

  const lastBuild = items.length ? items[0].pub : new Date(0).toUTCString();

  const body = items
    .map(
      (it) => `    <item>
      <title>${esc(it.title)}</title>
      <link>${SITE}/blog/${it.slug}/</link>
      <guid isPermaLink="true">${SITE}/blog/${it.slug}/</guid>
      <description>${esc(it.description)}</description>
      <category>${esc(it.category)}</category>
      <pubDate>${it.pub}</pubDate>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(FEED_TITLE)}</title>
    <link>${SITE}/</link>
    <description>${esc(FEED_DESC)}</description>
    <language>${LANG}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${body}
  </channel>
</rss>
`;

  fs.writeFileSync(OUT, xml, 'utf8');
  console.log(`[rss] ${items.length}건 기록 → public/rss.xml (최신 ${items[0]?.ymd ?? '-'})`);
}

main();
