import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import WeeklyClient from "@/components/WeeklyClient";

export const metadata: Metadata = {
  title: "이번 주 어디 가? | 수도권 주말 행사 큐레이션 - 팁픽(Tip-Pick)",
  description: "이번 주 서울·인천·경기에서 열리는 행사와 축제를 팁픽이 골라드립니다.",
  openGraph: {
    title: "이번 주 어디 가? | 수도권 주말 행사 큐레이션 - 팁픽(Tip-Pick)",
    description: "이번 주 서울·인천·경기에서 열리는 행사와 축제를 팁픽이 골라드립니다.",
    url: "https://tip-pick.com/weekly/",
  }
};

function parseFestivalDates(dateStr: string): { start: Date | null; end: Date | null } {
  if (!dateStr || dateStr === '상시') return { start: null, end: null };
  const parts = dateStr.split('~');
  const parse = (s: string) => {
    const m = s.trim().match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
    return m ? new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])) : null;
  };
  return { start: parse(parts[0]), end: parse(parts[parts.length - 1]) };
}

export default function WeeklyPage() {
  const dataPath = path.join(process.cwd(), 'public/data/pick-info.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  today.setHours(0, 0, 0, 0);

  // 이번 주 일요일 계산 (일=0 이면 오늘이 일요일)
  const dayOfWeek = today.getDay();
  const thisSunday = new Date(today);
  thisSunday.setDate(today.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek));

  const weeklyItems = (data.festivals || []).filter((f: any) => {
    const { start, end } = parseFestivalDates(f.date);
    // 상시 행사는 포함
    if (!start && !end) return true;
    // 이미 종료된 행사 제외
    if (end && end < today) return false;
    // 이번 주 일요일 이후 시작하는 행사 제외
    if (start && start > thisSunday) return false;
    return true;
  });

  return <WeeklyClient items={weeklyItems} />;
}
