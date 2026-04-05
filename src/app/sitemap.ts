export const dynamic = 'force-static';
export const revalidate = false;

import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://my-pick-info.pages.dev';

  // 1. 기본 정적 경로
  const staticRoutes = ['', '/festivals', '/benefits', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. JSON 데이터에서 동적 경로 (축제, 혜택) 가져오기
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(fileContents);

  const festivalRoutes = data.festivals.map((f: any) => ({
    url: `${baseUrl}/festival/${f.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const benefitRoutes = data.benefits.map((b: any) => ({
    url: `${baseUrl}/benefit/${b.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 3. 블로그 마크다운 파일에서 동적 경로 가져오기
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  const blogFiles = fs.existsSync(postsDir) ? fs.readdirSync(postsDir) : [];
  
  const blogRoutes = blogFiles
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      url: `${baseUrl}/blog/${file.replace('.md', '')}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [...staticRoutes, ...festivalRoutes, ...benefitRoutes, ...blogRoutes];
}
