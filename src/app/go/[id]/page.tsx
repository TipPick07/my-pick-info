import redirects from "@/data/redirects.json";
import RedirectClient from "@/components/RedirectClient";
import { redirect } from "next/navigation";

// 타입 안전성을 위해 JSON 데이터를 매핑형(Record)으로 지정합니다.
export const metadata = {
  robots: { index: false, follow: false },
};

const redirectMap = redirects as Record<string, string>;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// 🌐 Next.js 정적 내보내기(Static Export, output: export) 환경 대응용 설정입니다.
// 빌드할 때 redirects.json에 기록된 모든 단축어(event1, coupang1 등) 경로들을 
// Next.js 빌드 엔진에게 제공하여 미리 정적 HTML 파일들로 구워낼 수 있도록 돕습니다.
export async function generateStaticParams() {
  const keys = Object.keys(redirectMap);
  return keys.map((key) => ({
    id: key,
  }));
}

/**
 * 카카오톡 알림방 유입 트랙킹 및 외부 연결 라우터 (서버 측 진입점)입니다.
 * 
 * - Next.js 16 App Router 표준 규격에 맞춰 Promise 형태의 params를 안전하게 비동기(await) 처리합니다.
 * - 단축어가 등록되어 있으면 클라이언트 단 이동용 RedirectClient 컴포넌트를 띄워줍니다.
 * - 등록되지 않은 오타나 빈 단축어라면 즉각 메인 홈("/")으로 안전하게 서버 리다이렉트 처리합니다.
 */
export default async function GoPage({ params }: PageProps) {
  // Next.js 16 동적 라우팅 표준에 맞춰 params를 안전하게 기다려(await) 꺼냅니다.
  const resolvedParams = await params;
  const targetUrl = redirectMap[resolvedParams.id];

  // 만약 존재하지 않는 잘못된 단축어로 접속을 시도했다면, 
  // 3초 대기 없이 즉각 사이트의 메인 대문("/")으로 자동 강제 이동시킵니다.
  if (!targetUrl) {
    redirect("/");
  }

  // 올바른 경로일 때만 3초간 머물며 예쁜 로딩바를 보여주는 클라이언트 단 이동 컴포넌트를 띄웁니다.
  return <RedirectClient targetUrl={targetUrl} />;
}
