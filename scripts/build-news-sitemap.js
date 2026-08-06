#!/usr/bin/env node
/**
 * 뉴스 사이트맵 생성기 (2026-08-06 신설)
 * ─────────────────────────────────────────────────────────────
 * `public/sitemap-news.xml` 을 만든다. 최근 2일 이내 발행 글만 담는다
 * (구글 뉴스 사이트맵 규격: 2일 초과 항목은 무시됨).
 *
 * ⚠️ 전제: 뉴스 사이트맵은 **Google 뉴스(Publisher Center)에 등록된 사이트**에서만
 *    효과가 있다. 등록 전이라도 파일이 있는 것 자체는 해가 없고,
 *    등록 시 즉시 동작하도록 미리 갖춰 두는 것이 목적이다.
 *    일반 검색 색인은 기존 /sitemap.xml 과 GSC 요청이 담당한다.
 *
 * 실행: prebuild 단계에서 자동. 수동은 `node scripts/build-news-sitemap.js`.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE = 'https://tip-pick.com';
const PUB_NAME = '팁픽';
const PUB_LANG = 'ko';
const WINDOW_DAYS = 2;

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const OUT = path.join(process.cwd(), 'public/sitemap-news.xml');

/** XML 특수문자 이스케이프 (제목에 & < > 가 들어갈 수 있다). */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('[news-sitemap] posts 디렉터리 없음 — 건너뜀');
    return;
  }

  const cutoff = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const items = [];

  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    let fm;
    try {
      fm = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')).data;
    } catch {
      continue;
    }
    if (!fm || !fm.date || !fm.title) continue;

    // ⚠️ YAML 은 따옴표 없는 `date: 2026-08-06` 을 Date 객체로 파싱한다.
    //    String() 을 바로 쓰면 "Thu Aug 06 ..." 이 되어 slice(0,10) 이 깨진다.
    const ymd =
      fm.date instanceof Date
        ? fm.date.toISOString().slice(0, 10)
        : String(fm.date).slice(0, 10);
    // 발행일 09:00 KST(= 00:00Z) 로 간주.
    const pub = new Date(`${ymd}T00:00:00Z`);
    if (isNaN(pub.getTime()) || pub < cutoff) continue;

    items.push({ slug, title: fm.title, pub });
  }

  items.sort((a, b) => b.pub - a.pub);

  const body = items
    .map(
      (it) => `  <url>
    <loc>${SITE}/blog/${it.slug}/</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(PUB_NAME)}</news:name>
        <news:language>${PUB_LANG}</news:language>
      </news:publication>
      <news:publication_date>${it.pub.toISOString()}</news:publication_date>
      <news:title>${esc(it.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>
`;

  fs.writeFileSync(OUT, xml, 'utf8');
  console.log(`[news-sitemap] ${items.length}건 기록 → public/sitemap-news.xml`);
}

main();
