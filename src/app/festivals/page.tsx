import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import FestivalsClient from "@/components/FestivalsClient";

export const metadata: Metadata = {
  title: "이번 주말 어디 가? | 수도권 축제·행사 가이드 - 팁픽(Tip-Pick)",
  description: "서울, 인천, 경기 지역의 이번 주말 축제와 행사 정보를 확인하세요. 팁픽이 엄선한 최고의 나들이 장소들입니다.",
  openGraph: {
    title: "이번 주말 어디 가? | 수도권 축제·행사 가이드 - 팁픽(Tip-Pick)",
    description: "팁픽이 엄선한 수도권 축제·행사 정보를 지금 확인하세요!",
    url: "https://tip-pick.com/festivals/",
  }
};

export default function FestivalsPage() {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'pick-info.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(fileContents);
  const weatherApiKey = process.env.PUBLIC_DATA_API_KEY || "";

  return <FestivalsClient data={data} weatherApiKey={weatherApiKey} />;
}
