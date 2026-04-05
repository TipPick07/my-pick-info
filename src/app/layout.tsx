import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "수도권N라이프 | 서울·인천·경기 생활 정보 큐레이션",
  description: "서울, 인천, 경기 지역의 행사, 축제, 지원금 혜택과 에디터의 생생한 로컬 리뷰를 매일 업데이트합니다.",
  openGraph: {
    title: "수도권N라이프 | 서울·인천·경기 생활 정보 큐레이션",
    description: "서울, 인천, 경기 지역의 행사, 축제, 지원금 혜택과 에디터의 생생한 로컬 리뷰를 매일 업데이트합니다.",
    url: "https://my-pick-info.pages.dev",
    siteName: "수도권N라이프",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && process.env.NEXT_PUBLIC_ADSENSE_ID !== "나중에_입력" && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Structured Data: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "수도권N라이프",
              "url": "https://my-pick-info.pages.dev",
              "description": "수도권 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보"
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
