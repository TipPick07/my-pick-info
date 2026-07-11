export const dynamic = 'force-static';
export const revalidate = false;

import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { GUIDES } from '@/lib/guides';
import { visibleCategories, isCategoryLive, isPostCategoryLive } from '@/config/categories';
import { getSortedPostsData } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tip-pick.com';

  // 1. 기본 정적 경로 (trailingSlash: true 설정에 맞춰 trailing slash 포함)
  //    기존 자산(festivals 등) 유지 + 카테고리 SSOT의 공개 카테고리·계산기 추가.
  //    승인 모드에선 숨김 카테고리(/hot·/tips)가 visibleCategories에서 자동 제외됨.
  const basePaths = [
    '/', '/benefits/', '/blog/', '/guides/',
    '/tools/', '/tools/salary/', '/tools/loan/',
    '/tools/income-tax/', '/tools/insurance/',
    '/tools/retirement-pay/', '/tools/hourly-wage/', '/tools/car-tax/', '/tools/savings-interest/', '/tools/rent-conversion/', '/tools/brokerage-fee/', '/tools/annual-leave-allowance/', '/tools/overseas-stock-tax/', '/tools/median-income/', '/tools/k-pass-refund/', '/tools/parental-leave-pay/', '/tools/electricity-bill/', '/tools/unemployment-benefit/',
  ];
  const categoryPaths = visibleCategories().map((c) => c.href);
  const staticRoutes = Array.from(new Set([...basePaths, ...categoryPaths])).map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '/' ? 1 : 0.8,
  }));

  // 1-c. 가이드 상세 페이지 (GUIDES 매니페스트 = SSOT)
  const guideRoutes = GUIDES.map((g) => ({
    url: `${baseUrl}/guides/${g.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 2. JSON 데이터에서 동적 경로 (축제, 혜택) 가져오기
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(fileContents);

  const festivalRoutes = (isCategoryLive('festivals') ? data.festivals : []).map((f: any) => ({
    url: `${baseUrl}/festival/${f.id}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const benefitRoutes = data.benefits.map((b: any) => ({
    url: `${baseUrl}/benefit/${b.id}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 3. 블로그 동적 경로 (승인 모드면 숨김 카테고리 글 제외)
  const blogRoutes = getSortedPostsData()
    .filter((bp) => isPostCategoryLive(bp.category))
    .map((bp) => ({
      url: `${baseUrl}/blog/${bp.slug}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [...staticRoutes, ...guideRoutes, ...festivalRoutes, ...benefitRoutes, ...blogRoutes];
}
