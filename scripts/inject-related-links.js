// 임시 스크립트: 블로그 글 말미에 내부 링크 블록 삽입 (재실행 가능 / idempotent)
// 사용 후 삭제 예정.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/content/posts');
const d = require('../public/data/pick-info.json');
const MARK = '<!-- related-block -->';

function splitFM(raw) {
  raw = raw.replace(/\r/g, '');
  const end = raw.indexOf('\n---', 4); // 두 번째 --- 위치
  const headEnd = raw.indexOf('---', end + 1); // 안전장치
  // 표준 형태: ---\n ... \n---\n
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { head: '', body: raw };
  return { head: m[0], headBody: m[1], body: raw.slice(m[0].length) };
}

function fmStr(headBody, key) {
  const m = headBody.match(new RegExp('^' + key + ':\\s*(.*)$', 'm'));
  if (!m) return '';
  let v = m[1].trim();
  // 양쪽 따옴표 제거 (반복)
  v = v.replace(/^["']+/, '').replace(/["']+$/, '').trim();
  return v;
}

function fmTags(headBody) {
  const m = headBody.match(/^tags:\s*\[(.*)\]/m);
  if (!m) return [];
  return m[1].split(',').map(x => x.trim().replace(/^["']+/, '').replace(/["']+$/, '')).filter(Boolean);
}

// 매칭 유틸
const stop = /지원금|지원|신청|방법|총정리|가이드|안내|혜택|자격|대상|완벽|분석|및|관련|서울|경기|인천|전국|수도권|2026|최대|원|꿀팁|정리|위한|모든/g;
function toks(s) {
  return new Set((s || '').replace(/\[[^\]]*\]/g, ' ').replace(stop, ' ')
    .replace(/[^가-힣a-zA-Z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 2));
}
function jac(a, b) {
  const A = toks(a), B = toks(b);
  if (!A.size || !B.size) return 0;
  let i = 0; for (const x of A) if (B.has(x)) i++;
  return i / (A.size + B.size - i);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
const posts = files.map(f => {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8');
  const { head, headBody, body } = splitFM(raw);
  const category = fmStr(headBody, 'category');
  return {
    f, slug: f.replace(/\.md$/, ''), head, body,
    title: fmStr(headBody, 'title'),
    orig: fmStr(headBody, 'originalTitle'),
    category,
    tags: fmTags(headBody),
    bucket: /festival/.test(category) ? 'festival' : 'benefit',
  };
});

function bestDetail(p) {
  const pool = p.bucket === 'festival' ? d.festivals : d.benefits;
  let best = null, bs = 0;
  for (const it of pool) {
    const s = jac(p.orig || p.title, it.title);
    if (s > bs) { bs = s; best = it; }
  }
  return bs >= 0.4 ? best : null;
}

function related(p) {
  const cand = posts.filter(q => q.slug !== p.slug && q.bucket === p.bucket);
  cand.forEach(q => q.__ov = q.tags.filter(t => p.tags.includes(t)).length);
  let r = cand.filter(q => q.__ov > 0).sort((a, b) => b.__ov - a.__ov);
  if (r.length < 2) {
    const more = cand.filter(q => !r.includes(q)).sort((a, b) => (a.slug < b.slug ? 1 : -1));
    r = r.concat(more);
  }
  return r.slice(0, 2);
}

function stripOldBlock(body) {
  // 기존 블록 제거: "---" + MARK 이후 전부
  const idx = body.indexOf(MARK);
  if (idx === -1) return body;
  // MARK 앞의 구분선/공백까지 함께 제거
  return body.slice(0, idx).replace(/\n+(?:---\s*\n+)*\s*$/,'');
}

let applied = 0, withDetail = 0;
for (const p of posts) {
  let body = stripOldBlock(p.body);
  body = body.replace(/\s+$/, ''); // 끝 공백 정리
  const isFest = p.bucket === 'festival';
  const sec = isFest ? '/festivals/' : '/benefits/';
  const secLabel = isFest ? '이번 주 축제·나들이 전체 보기' : '전체 지원금 한눈에 보기';
  const det = bestDetail(p);

  let block = '\n\n---\n\n' + MARK + '\n### 👉 함께 보면 좋은 정보\n\n';
  if (det) {
    const dpath = (isFest ? '/festival/' : '/benefit/') + det.id + '/';
    const cleanTitle = det.title.replace(/^\[[^\]]*\]\s*/, '').replace(/\s*-\s.*$/, '');
    block += `- [${cleanTitle} 자세히 보기 →](${dpath})\n`;
    withDetail++;
  }
  block += `- [${secLabel}](${sec})\n`;
  for (const r of related(p)) block += `- [${r.title}](/blog/${r.slug}/)\n`;

  fs.writeFileSync(path.join(dir, p.f), p.head + body + block + '\n', 'utf8');
  applied++;
}
console.log(`내부 링크 블록 재삽입: ${applied}개 / 상세페이지 직접링크: ${withDetail}개`);
