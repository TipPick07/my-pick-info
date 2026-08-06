#!/usr/bin/env node
/**
 * select-topic.mjs — 일일 자동 발행 루틴의 주제 발굴·실측·중복체크 유틸 (2026-08-06 신설)
 *
 * 네이버 오픈 API를 MCP 없이 직접 호출한다 → 클라우드 예약 실행·로컬·타 AI 툴 어디서든 동일 동작.
 * 키: 환경변수 NAVER_CLIENT_ID / NAVER_CLIENT_SECRET, 없으면 저장소 루트 .env.local에서 읽음.
 *
 * 사용법 (전부 JSON을 stdout으로 출력):
 *   node scripts/auto-publish/select-topic.mjs news [days]        # 최근 N일(기본 3) 지원금·정책 뉴스 스캔
 *   node scripts/auto-publish/select-topic.mjs measure "kw1,kw2"  # 데이터랩 실측 — 기준어(실업급여=100) 자동 동봉·정규화
 *   node scripts/auto-publish/select-topic.mjs dedup "질의어"      # 기존 글·가이드·계산기·토픽 전수 대조 (오프라인)
 *
 * 실패 시 exit 2 + {"error": ...} → 루틴은 docs/AUTO-PUBLISH.md §5 폴백으로 전환한다.
 * 규칙 근거: WRITING-GUIDE §1-8(키워드 실측·기준어), §1-7 7(카니벌라이제이션), HANDOVER §7 0단계(뉴스 기반 선정).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BASE_KEYWORD = "실업급여"; // §1-8 고정 기준어 — 배치 간 비교의 축. 바꾸면 기존 실측 대장과 비교 불가.
const NEWS_QUERIES = ["지원금", "수당 인상", "세액공제", "급여 지급", "시행 예정", "환급", "보조금"]; // HANDOVER §7 0단계 검색어 세트

// ---------- 공통 ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripTags = (s) =>
  String(s)
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
const norm = (s) => String(s).toLowerCase().replace(/[\s·,()[\]"'‘’“”—\-–~]+/g, "");

function loadKeys() {
  let id = process.env.NAVER_CLIENT_ID;
  let secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) {
    try {
      const env = readFileSync(join(ROOT, ".env.local"), "utf8");
      const pick = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();
      id = id || pick("NAVER_CLIENT_ID");
      secret = secret || pick("NAVER_CLIENT_SECRET");
    } catch {
      /* .env.local 없음 — 아래에서 에러 처리 */
    }
  }
  if (!id || !secret) throw new Error("NAVER_CLIENT_ID/SECRET 없음 — 환경변수 또는 .env.local 필요");
  return { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret };
}

async function api(url, { method = "GET", body } = {}) {
  const headers = loadKeys();
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`API ${res.status} ${url.slice(0, 60)} :: ${(await res.text()).slice(0, 180)}`);
  return res.json();
}

// ---------- news: 최근 N일 지원금·정책 뉴스 스캔 ----------
async function cmdNews(days) {
  const seen = new Map();
  for (const q of NEWS_QUERIES) {
    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(q)}&display=15&sort=date`;
    const j = await api(url);
    for (const it of j.items || []) {
      const pub = new Date(it.pubDate);
      if (isNaN(pub) || Date.now() - pub.getTime() > days * 86400e3) continue;
      const key = it.originallink || it.link;
      if (!seen.has(key))
        seen.set(key, { title: stripTags(it.title), link: it.link, originallink: it.originallink, pubDate: it.pubDate, queries: [] });
      if (!seen.get(key).queries.includes(q)) seen.get(key).queries.push(q);
    }
    await sleep(120);
  }
  const items = [...seen.values()].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return { days, count: items.length, note: "후보 선정 시 반드시 공식 출처(정책브리핑·부처·공단) 원문으로 재검증할 것 — 뉴스만 근거로 발행 금지", items };
}

// ---------- measure: 데이터랩 실측 (기준어 정규화) ----------
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
async function cmdMeasure(csv) {
  const kws = [...new Set(csv.split(",").map((s) => s.trim()).filter(Boolean).filter((k) => k !== BASE_KEYWORD))];
  if (!kws.length) throw new Error('키워드 없음 — measure "키워드1,키워드2" 형식');
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 전월 1일
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); // 어제
  const primaryMonth = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`; // 전월(완결월) = 대장과 비교 축
  const results = [];
  for (let i = 0; i < kws.length; i += 4) {
    const chunk = kws.slice(i, i + 4); // 데이터랩 요청당 그룹 5개 한도 → 기준어 1 + 후보 4
    const j = await api("https://openapi.naver.com/v1/datalab/search", {
      method: "POST",
      body: {
        startDate: fmtDate(start),
        endDate: fmtDate(end),
        timeUnit: "month",
        keywordGroups: [{ groupName: BASE_KEYWORD, keywords: [BASE_KEYWORD] }, ...chunk.map((k) => ({ groupName: k, keywords: [k] }))],
      },
    });
    const baseRow = (j.results || []).find((r) => r.title === BASE_KEYWORD);
    const baseBy = Object.fromEntries((baseRow?.data || []).map((d) => [d.period.slice(0, 7), d.ratio]));
    if (!baseBy[primaryMonth]) throw new Error("기준어 데이터 없음 — API 응답 이상, 실측 불가");
    for (const k of chunk) {
      const row = (j.results || []).find((r) => r.title === k);
      const by = Object.fromEntries((row?.data || []).map((d) => [d.period.slice(0, 7), d.ratio]));
      const months = {};
      for (const [m, v] of Object.entries(by)) if (baseBy[m]) months[m] = +((v / baseBy[m]) * 100).toFixed(1);
      results.push({
        keyword: k,
        normalized: months[primaryMonth] ?? null, // 기준어=100 기준 상대값 — §1-8-1 대장과 직접 비교 가능
        months,
        ...(Object.keys(by).length ? {} : { note: "no-data — 검색량 극소 '또는 오타'. §1-8 2에 따라 오타부터 의심할 것" }),
      });
    }
    await sleep(150);
  }
  results.sort((a, b) => (b.normalized ?? -1) - (a.normalized ?? -1));
  return { base: `${BASE_KEYWORD}=100`, primaryMonth, results };
}

// ---------- dedup: 기존 콘텐츠 전수 대조 (오프라인) ----------
async function loadCorpus() {
  // gray-matter는 지연 로드 — news·measure가 node_modules 없이도 돌게 한다(클라우드 새 세션 대비).
  // dedup 시점에 없으면 exit 2 → SOP §5 폴백(grep 전수)으로 전환된다.
  const { default: matter } = await import("gray-matter");
  const items = [];
  const postsDir = join(ROOT, "src", "content", "posts");
  for (const f of readdirSync(postsDir).filter((f) => f.endsWith(".md"))) {
    const fm = matter(readFileSync(join(postsDir, f), "utf8")).data || {};
    items.push({
      type: "post",
      slug: f.replace(/\.md$/, ""),
      title: String(fm.title || ""),
      tags: (Array.isArray(fm.tags) ? fm.tags : []).map(String),
      desc: [fm.description || "", fm.summary || ""].join(" "),
    });
  }
  const guides = readFileSync(join(ROOT, "src", "lib", "guides.ts"), "utf8");
  for (const m of guides.matchAll(/\{[^{}]*?slug:\s*"([^"]+)"[^{}]*?\}/g)) {
    items.push({
      type: "guide",
      slug: m[1],
      title: (/title:\s*"([^"]+)"/.exec(m[0]) || [])[1] || "",
      tags: [],
      desc: (/description:\s*"([^"]+)"/.exec(m[0]) || [])[1] || "",
    });
  }
  const tools = readFileSync(join(ROOT, "src", "app", "tools", "page.tsx"), "utf8");
  for (const m of tools.matchAll(/\{[^{}]*?href:\s*"\/tools\/([^"]+?)\/?"[^{}]*?\}/g)) {
    items.push({
      type: "tool",
      slug: m[1],
      title: (/title:\s*"([^"]+)"/.exec(m[0]) || [])[1] || "",
      tags: [],
      desc: (/desc:\s*"([^"]+)"/.exec(m[0]) || [])[1] || "",
    });
  }
  const topics = readFileSync(join(ROOT, "src", "lib", "topics.ts"), "utf8");
  for (const m of topics.matchAll(/slug:\s*"([^"]+)",\s*[\r\n]+\s*keyword:\s*"([^"]+)",\s*[\r\n]+\s*title:\s*"([^"]+)"/g)) {
    items.push({ type: "topic", slug: m[1], title: m[3], tags: [m[2]], desc: "" });
  }
  return items;
}

async function cmdDedup(query, top) {
  if (!query.trim()) throw new Error('질의어 없음 — dedup "키워드 또는 주제 문구" 형식');
  const corpus = await loadCorpus();
  const nq = norm(query);
  const tokens = query.split(/[\s·,/+]+/).map((s) => s.trim()).filter((t) => t.length >= 2);
  const hits = [];
  for (const it of corpus) {
    const f = { title: norm(it.title), tags: norm(it.tags.join(" ")), desc: norm(it.desc), slug: it.slug.toLowerCase() };
    const strong = nq.length >= 4 && (f.title.includes(nq) || f.tags.includes(nq));
    const matched = [];
    let w = 0;
    for (const t of tokens) {
      const nt = norm(t);
      if (!nt) continue;
      if (f.title.includes(nt)) { w += 2; matched.push(`${t}@title`); }
      else if (f.tags.includes(nt)) { w += 1.5; matched.push(`${t}@tags`); }
      else if (f.desc.includes(nt)) { w += 1; matched.push(`${t}@desc`); }
      else if (f.slug.includes(nt)) { w += 1; matched.push(`${t}@slug`); }
    }
    if (!strong && !matched.length) continue;
    const score = strong ? 100 : Math.min(99, Math.round((w / (Math.max(tokens.length, 1) * 2)) * 100));
    hits.push({ type: it.type, slug: it.slug, title: it.title, score, strong, matched });
  }
  hits.sort((a, b) => b.score - a.score);
  const verdict = hits.some((h) => h.strong || h.score >= 70)
    ? "STRONG-DUP-RISK"
    : hits.some((h) => h.score >= 40)
      ? "CHECK-ANGLE"
      : "CLEAR-ISH";
  const hint = {
    "STRONG-DUP-RISK": "같은 키워드 정면 타깃이 이미 있음 — 발행 스킵 또는 각도 전면 변경(§1-7 7). 자동 루틴에서는 스킵이 기본.",
    "CHECK-ANGLE": "부분 겹침 — 타깃 검색어·독자 상황이 기존 글과 실제로 다른지 판단하고, 다르면 상호 링크로 클러스터화.",
    "CLEAR-ISH": "강한 겹침 없음 — 본문 수준 확인(grep -rl)을 1회 더 하고 진행.",
  }[verdict];
  return { query, corpusSize: corpus.length, verdict, hint, hits: hits.slice(0, top) };
}

// ---------- main ----------
const [cmd, a1, a2] = process.argv.slice(2);
try {
  let out;
  if (cmd === "news") out = await cmdNews(Number(a1) || 3);
  else if (cmd === "measure") out = await cmdMeasure(a1 || "");
  else if (cmd === "dedup") out = await cmdDedup(a1 || "", Number(a2) || 10);
  else {
    console.error("usage: select-topic.mjs news [days] | measure \"kw1,kw2\" | dedup \"질의어\" [top]");
    process.exit(1);
  }
  console.log(JSON.stringify(out, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: String(e?.message || e) }));
  process.exit(2);
}
