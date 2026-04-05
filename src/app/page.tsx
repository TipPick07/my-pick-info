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

  return <HomeClient data={data} posts={posts} weatherApiKey={weatherApiKey} />;
}
