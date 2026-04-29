import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import DeadlineClient from "@/components/DeadlineClient";

export const metadata: Metadata = {
  title: "마감 임박 지원금 | 놓치면 끝! D-30 이내 혜택 - 팁픽(Tip-Pick)",
  description: "신청 기간이 얼마 남지 않은 지원금을 팁픽이 모아드립니다. 지금 바로 확인하고 혜택을 챙기세요!",
  openGraph: {
    title: "마감 임박 지원금 | 놓치면 끝! D-30 이내 혜택 - 팁픽(Tip-Pick)",
    description: "신청 기간이 얼마 남지 않은 지원금을 팁픽이 모아드립니다. 지금 바로 확인하고 혜택을 챙기세요!",
    url: "https://tip-pick.com/deadline/",
  }
};

function parseEndDate(deadline: string): Date | null {
  if (!deadline) return null;
  const matches = [...deadline.matchAll(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  return new Date(parseInt(last[1]), parseInt(last[2]) - 1, parseInt(last[3]));
}

export default function DeadlinePage() {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  today.setHours(0, 0, 0, 0);
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const deadlineItems = (data.benefits || []).filter((b: any) => {
    if (b.isEmergency) return true;
    const end = parseEndDate(b.deadline);
    if (!end) return false;
    return end >= today && end <= thirtyDaysLater;
  });

  return <DeadlineClient items={deadlineItems} />;
}
