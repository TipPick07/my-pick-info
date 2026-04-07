import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import BenefitsClient from "@/components/BenefitsClient";

export const metadata: Metadata = {
  title: "내 돈 찾는 지원금 | 수도권 혜택 정보 큐레이션 - 팁픽(Tip-Pick)",
  description: "서울, 인천, 경기 지역의 꼭 필요한 지원금과 혜택 정보를 확인하세요. 팁픽이 당신에게 꼭 맞는 이득만 골라드립니다.",
  openGraph: {
    title: "내 돈 찾는 지원금 | 수도권 혜택 정보 큐레이션 - 팁픽(Tip-Pick)",
    description: "오늘 당신이 놓칠 뻔한 현금 혜택, 팁픽이 대신 골라드립니다!",
    url: "https://tip-pick.com/benefits/",
  }
};

export default function BenefitsPage() {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  return <BenefitsClient data={data} />;
}
