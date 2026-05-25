import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { getSortedPostsData } from "@/lib/posts";
import HomeClient from "@/components/HomeClient";
import bannerConfig from "@/data/banner-config.json";

export const metadata: Metadata = {
  title: "수도권 팁픽 (TIP-PICK) | 내 돈 찾는 지원금 & 축제 가이드",
  description: "오늘 당신이 놓칠 뻔한 현금 혜택, 팁픽이 대신 골라드립니다! 서울·인천·경기 지역 지원금, 축제, 행사 정보를 매일 업데이트합니다.",
};

export default function Home() {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'pick-info.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(fileContents);

  const allPosts = getSortedPostsData();
  const posts = allPosts.slice(0, 3);
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
    date: latestDate,
  };

  const eventSchema = data.festivals.map((f: any) => ({
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
