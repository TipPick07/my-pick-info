#!/usr/bin/env node
/**
 * llms.txt / llms-full.txt 생성기 (2026-08-06 신설)
 * ─────────────────────────────────────────────────────────────
 * AI 답변엔진(ChatGPT·Perplexity·Claude 등)이 사이트 구조를 한 번에 파악하도록
 * 마크다운 목차를 제공한다. robots.txt 의 AI 크롤러 허용과 짝을 이룬다.
 *
 *  - public/llms.txt      : 정체성 + 섹션별 링크 목차(짧게)
 *  - public/llms-full.txt : 위 + 전 글·가이드·계산기 전체 목록(제목+설명)
 *
 * 실행: prebuild 단계에서 자동. 수동은 `node scripts/build-llms-txt.js`.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE = 'https://tip-pick.com';
const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const GUIDES_TS = path.join(process.cwd(), 'src/lib/guides.ts');
const TOOLS_DIR = path.join(process.cwd(), 'src/app/tools');

/** guides.ts 에서 slug/title/description 을 정규식으로 뽑는다(파싱 최소화). */
function readGuides() {
  if (!fs.existsSync(GUIDES_TS)) return [];
  const src = fs.readFileSync(GUIDES_TS, 'utf8');
  const out = [];
  const re = /slug:\s*"([^"]+)",\s*\n\s*title:\s*"([^"]+)",\s*\n\s*description:\s*\n?\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) out.push({ slug: m[1], title: m[2], description: m[3] });
  return out;
}

function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const out = [];
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith('.md')) continue;
    let fm;
    try {
      fm = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')).data;
    } catch {
      continue;
    }
    if (!fm || !fm.title) continue;
    // ⚠️ YAML 은 따옴표 없는 `date: 2026-08-06` 을 Date 객체로 파싱한다.
    const date =
      fm.date instanceof Date
        ? fm.date.toISOString().slice(0, 10)
        : String(fm.date || '').slice(0, 10);
    out.push({
      slug: file.replace(/\.md$/, ''),
      title: fm.title,
      description: fm.description || '',
      category: fm.category || '',
      date,
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 계산기 슬러그 + page.tsx metadata.title 의 첫 조각(" | " 앞)을 이름으로 쓴다. */
function readTools() {
  if (!fs.existsSync(TOOLS_DIR)) return [];
  return fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const slug = d.name;
      let title = slug;
      try {
        const src = fs.readFileSync(path.join(TOOLS_DIR, slug, 'page.tsx'), 'utf8');
        const m = src.match(/title:\s*"([^"]+)"/);
        if (m) title = m[1].split('|')[0].trim();
      } catch {
        /* page.tsx 가 없으면 슬러그를 그대로 쓴다 */
      }
      return { slug, title };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const HEADER = `# 팁픽 (TIP-PICK)

> 정부 지원금·세금·생활금융을 **직접 계산해서** 확인하는 정보 사이트입니다.
> 공식 자료를 옮겨 적는 대신, 모든 글에 구체적인 인물·소득·상황을 세운
> 자체 계산 예시와 검산 결과를 넣는 것을 원칙으로 합니다.

- 사이트: ${SITE}
- 언어: 한국어 (ko-KR)
- 기준 연도: 2026년
- 성격: 개인이 운영하는 정보 안내 사이트. 공공기관이 아니며 신청 대행을 하지 않습니다.

## 인용 안내

수치를 인용할 때는 **확인 시점(글에 표기된 기준일)**을 함께 밝혀 주세요.
제도·요율은 해마다 바뀌므로, 최종 판단은 각 제도의 공식 창구 안내를 따라야 합니다.

## 주요 진입점

- [전체 글](${SITE}/blog/)
- [정부 지원금](${SITE}/benefits/)
- [경제·세금](${SITE}/money/)
- [심층 가이드](${SITE}/guides/)
- [계산기](${SITE}/tools/)
- [사이트 소개](${SITE}/about/)
`;

function main() {
  const posts = readPosts();
  const guides = readGuides();
  const tools = readTools();

  // ── llms.txt (짧은 목차) ──────────────────────────────────
  const short = `${HEADER}
## 계산기 (${tools.length}종)

${tools.map((t) => `- [${t.title}](${SITE}/tools/${t.slug}/)`).join('\n')}

## 심층 가이드 (${guides.length}편)

${guides.map((g) => `- [${g.title}](${SITE}/guides/${g.slug}/)`).join('\n')}

## 최근 글 20편 (전체 ${posts.length}편)

${posts.slice(0, 20).map((p) => `- [${p.title}](${SITE}/blog/${p.slug}/) — ${p.date}`).join('\n')}

전체 목록은 [llms-full.txt](${SITE}/llms-full.txt) 를 참고하세요.
`;

  // ── llms-full.txt (전체 + 설명) ───────────────────────────
  const full = `${HEADER}
## 계산기 (${tools.length}종)

${tools.map((t) => `- [${t.title}](${SITE}/tools/${t.slug}/)`).join('\n')}

## 심층 가이드 (${guides.length}편)

${guides.map((g) => `### ${g.title}\n${SITE}/guides/${g.slug}/\n${g.description}\n`).join('\n')}

## 전체 글 (${posts.length}편)

${posts.map((p) => `### ${p.title}\n${SITE}/blog/${p.slug}/ · ${p.date} · ${p.category}\n${p.description}\n`).join('\n')}
`;

  fs.writeFileSync(path.join(process.cwd(), 'public/llms.txt'), short, 'utf8');
  fs.writeFileSync(path.join(process.cwd(), 'public/llms-full.txt'), full, 'utf8');
  console.log(
    `[llms-txt] 글 ${posts.length} · 가이드 ${guides.length} · 계산기 ${tools.length} → public/llms.txt, llms-full.txt`,
  );
}

main();
