import fs from 'fs';
import path from 'path';
import { getSortedPostsData } from "@/lib/posts";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'pick-info.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(fileContents);
  
  // 최근 3개의 게시글만 가져오기
  const posts = getSortedPostsData().slice(0, 3);
  const weatherApiKey = process.env.PUBLIC_DATA_API_KEY || "";

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
      <HomeClient data={data} posts={posts} weatherApiKey={weatherApiKey} />
    </>
  );
}
