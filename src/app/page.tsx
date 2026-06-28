import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { getSortedPostsData } from "@/lib/posts";
import { isPostCategoryLive, isCategoryLive } from "@/config/categories";
import HomeClient from "@/components/HomeClient";
import bannerConfig from "@/data/banner-config.json";

export const metadata: Metadata = {
  title: "팁픽 (TIP-PICK) | 정부 지원금·경제·생활정보 가이드",
  description: "정부 지원금부터 경제·세금, 실생활 계산기까지. 돈 되는 정보를 비전문가 눈높이로 쉽게 정리해 드립니다.",
};

export default function Home() {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'pick-info.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(fileContents);

  const allPosts = getSortedPostsData();
  const posts = allPosts.filter((p) => isPostCategoryLive(p.category)).slice(0, 6);
  const weatherApiKey = process.env.PUBLIC_DATA_API_KEY || "";

  const kstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const kstYear = kstNow.getFullYear();
  const kstMonth = String(kstNow.getMonth() + 1).padStart(2, '0');
  const kstDay = String(kstNow.getDate()).padStart(2, '0');
  const todayStr = `${kstYear}-${kstMonth}-${kstDay}`;

  const latestDate = allPosts.length > 0 ? allPosts[0].date : todayStr;
  const recentPosts = allPosts.filter(post => post.date === latestDate);
  const todayFestivals = recentPosts.filter(post => post.category === 'festival' || post.category === 'festivals');
  const todayBenefits = recentPosts.filter(post => post.category === 'benefit' || post.category === 'benefits');

  const todayUpdates = {
    festivals: todayFestivals,
    benefits: todayBenefits,
    totalCount: recentPosts.length,
    isToday: latestDate === todayStr,
    // 히어로 '업데이트 날짜'는 빌드일(KST) 기준. 크론 제거(손글 전환) 후엔
    // push·수동 배포일과 같다. (옛 'latestDate(최신 블로그 글 date)'는 자동발행 셸브 후 6/4에 고정되는 버그였음.)
    date: todayStr,
  };

  const eventSchema = (isCategoryLive('festivals') ? data.festivals : []).map((f: any) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": f.title,
    "startDate": f.date,
    "location": {
      "@type": "Place",
      "name": f.location,
      "address": f.region
    },
    "description": f.description,
    "image": f.image
  }));

  const benefitSchema = data.benefits.map((b: any) => ({
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    "name": b.title,
    "description": b.details,
    "provider": {
      "@type": "GovernmentOrganization",
      "name": b.region
    }
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(benefitSchema) }}
      />
      <HomeClient data={data} posts={posts} weatherApiKey={weatherApiKey} todayUpdates={todayUpdates} bannerConfig={bannerConfig} />
    </>
  );
}
