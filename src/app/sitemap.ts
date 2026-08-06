export const dynamic = 'force-static';
export const revalidate = false;

import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { GUIDES } from '@/lib/guides';
import { TOPICS } from '@/lib/topics';
import { visibleCategories, isCategoryLive, isPostCategoryLive } from '@/config/categories';
import { getSortedPostsData } from '@/lib/posts';

/**
 * lastmod 정책 (2026-07-27 개정)
 * ─────────────────────────────────────────────────────────────
 * 이전에는 모든 URL에 `new Date()`(빌드 시각)를 넣어, 글 하나만 발행해도
 * 사이트맵 전체가 "오늘 수정됨"으로 표시됐다. 구글은 lastmod가 부정확하면
 * 아예 무시하므로, 실제로 바뀐 페이지를 먼저 크롤링하게 만드는 신호를 잃는다.
 *
 * 지금은 ① git 이력의 '해당 파일 마지막 커밋 시각'을 1순위로 쓰고,
 * ② git을 못 쓰는 환경이면 글은 frontmatter 발행일, 가이드는 파일 안 UPDATED 상수,
 * ③ 그래도 없으면 빌드 시각으로 폴백한다.
 * 목록형 허브(/·/blog/·/money/·/benefits/·/guides/·/tools/)는 그 안의
 * 최신 항목 시각과 자기 파일 시각 중 늦은 쪽을 쓴다(새 글이 실리면 허브도 바뀌므로).
 */

const BUILD_TIME = new Date();

/** 저장소 전체의 '파일 → 마지막 커밋 시각' 맵 (git log 1회 호출). */
let gitDateCache: Map<string, string> | null = null;
function gitDates(): Map<string, string> {
  if (gitDateCache) return gitDateCache;
  const map = new Map<string, string>();
  try {
    const out = execFileSync(
      'git',
      ['log', '--pretty=format:@%cI', '--name-only', '--no-renames'],
      { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    let current = '';
    for (const raw of out.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith('@')) {
        current = line.slice(1);
      } else if (current && !map.has(line)) {
        // git log는 최신순 → 파일의 첫 등장이 마지막 수정 커밋
        map.set(line, current);
      }
    }
  } catch {
    // git이 없거나 이력이 얕은 환경 → 폴백 경로로 처리
  }
  gitDateCache = map;
  return map;
}

/** 저장소 기준 상대경로(POSIX)의 마지막 커밋 시각. 없으면 null. */
function gitDateOf(relPath: string): Date | null {
  const iso = gitDates().get(relPath.split(path.sep).join('/'));
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/** 가이드 page.tsx 안의 `const UPDATED = "YYYY-MM-DD"` 파싱(폴백용). */
function updatedConstOf(relPath: string): Date | null {
  try {
    const src = fs.readFileSync(path.join(process.cwd(), relPath), 'utf8');
    const m = src.match(/const UPDATED = "(\d{4}-\d{2}-\d{2})"/);
    if (!m) return null;
    const d = new Date(`${m[1]}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function newest(dates: (Date | null)[], fallback: Date): Date {
  const valid = dates.filter((d): d is Date => !!d);
  if (!valid.length) return fallback;
  return valid.reduce((a, b) => (a > b ? a : b));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tip-pick.com';

  // ── 콘텐츠 목록 (lastmod 계산에 재사용) ─────────────────────────
  const posts = getSortedPostsData().filter((bp) => isPostCategoryLive(bp.category));

  const postDate = (slug: string, dateStr: string): Date => {
    const fromDate = dateStr ? new Date(`${dateStr}T00:00:00Z`) : null;
    return (
      gitDateOf(`src/content/posts/${slug}.md`) ??
      (fromDate && !isNaN(fromDate.getTime()) ? fromDate : BUILD_TIME)
    );
  };
  const guideDate = (slug: string): Date => {
    const rel = `src/app/guides/${slug}/page.tsx`;
    return gitDateOf(rel) ?? updatedConstOf(rel) ?? BUILD_TIME;
  };
  /** 정적 라우트('/tools/salary/' 등) → 그 라우트의 page.tsx 커밋 시각. */
  const routeDate = (route: string): Date | null => {
    const rel = path.posix.join('src/app', route === '/' ? '' : route, 'page.tsx');
    return gitDateOf(rel);
  };

  const newestPost = newest(posts.map((p) => postDate(p.slug, p.date)), BUILD_TIME);
  const newestGuide = newest(GUIDES.map((g) => guideDate(g.slug)), BUILD_TIME);

  // 1. 기본 정적 경로 (trailingSlash: true 설정에 맞춰 trailing slash 포함)
  //    승인 모드에선 숨김 카테고리(/hot·/tips)가 visibleCategories에서 자동 제외됨.
  const basePaths = [
    '/', '/benefits/', '/blog/', '/guides/', '/topics/',
    '/tools/', '/tools/salary/', '/tools/loan/',
    '/tools/income-tax/', '/tools/insurance/',
    '/tools/retirement-pay/', '/tools/hourly-wage/', '/tools/car-tax/', '/tools/savings-interest/', '/tools/rent-conversion/', '/tools/brokerage-fee/', '/tools/annual-leave-allowance/', '/tools/overseas-stock-tax/', '/tools/median-income/', '/tools/k-pass-refund/', '/tools/parental-leave-pay/', '/tools/electricity-bill/', '/tools/unemployment-benefit/', '/tools/youth-savings-account/', '/tools/childcare-service/', '/tools/reduced-work-hours-pay/', '/tools/medical-cost-cap/', '/tools/longterm-care-copay/', '/tools/tax-refund-claim/',
  ];
  const categoryPaths = visibleCategories().map((c) => c.href);

  // 목록형 허브는 그 안의 최신 항목 시각도 함께 본다(새 글이 실리면 허브도 바뀜).
  const HUB_FEED: Record<string, Date> = {
    '/': newest([newestPost, newestGuide], BUILD_TIME),
    '/blog/': newestPost,
    '/money/': newestPost,
    '/benefits/': newestPost,
    '/guides/': newestGuide,
  };

  const staticRoutes = Array.from(new Set([...basePaths, ...categoryPaths])).map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: newest([routeDate(route), HUB_FEED[route] ?? null], BUILD_TIME),
    changeFrequency: (route in HUB_FEED ? 'daily' : 'monthly') as 'daily' | 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));

  // 1-b. 토픽 허브 상세 (TOPICS 매니페스트 = SSOT, 2026-08-06 신설)
  //      lastmod 는 그 토픽이 묶은 글 중 가장 최근 것 — 글이 갱신되면 허브도 갱신된다.
  const topicRoutes = TOPICS.map((t) => ({
    url: `${baseUrl}/topics/${t.slug}/`,
    lastModified: newest(
      t.posts.map((s) => {
        const p = posts.find((x) => x.slug === s);
        return p ? postDate(p.slug, p.date) : null;
      }),
      BUILD_TIME,
    ),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 1-c. 가이드 상세 페이지 (GUIDES 매니페스트 = SSOT)
  const guideRoutes = GUIDES.map((g) => ({
    url: `${baseUrl}/guides/${g.slug}/`,
    lastModified: guideDate(g.slug),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 2. JSON 데이터에서 동적 경로 (축제, 혜택) — 크롤 시대 잔재. 현재 둘 다 0건.
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(fileContents);
  const dataDate = gitDateOf('public/data/pick-info.json') ?? BUILD_TIME;

  const festivalRoutes = (isCategoryLive('festivals') ? data.festivals : []).map((f: any) => ({
    url: `${baseUrl}/festival/${f.id}/`,
    lastModified: dataDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const benefitRoutes = data.benefits.map((b: any) => ({
    url: `${baseUrl}/benefit/${b.id}/`,
    lastModified: dataDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 3. 블로그 동적 경로 (승인 모드면 숨김 카테고리 글 제외)
  const blogRoutes = posts.map((bp) => ({
    url: `${baseUrl}/blog/${bp.slug}/`,
    lastModified: postDate(bp.slug, bp.date),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...topicRoutes, ...guideRoutes, ...festivalRoutes, ...benefitRoutes, ...blogRoutes];
}
