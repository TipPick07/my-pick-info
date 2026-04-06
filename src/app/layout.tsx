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
  title: "팁픽(Tip-Pick) | 수도권 현금 혜택과 축제 정보 큐레이션",
  description: "오늘 당신이 놓칠 뻔한 현금 혜택, 팁픽이 대신 골라드립니다! 서울·인천·경기 지역 지원금, 축제, 행사 정보를 매일 업데이트합니다.",
  keywords: ["팁픽", "tip-pick", "지원금", "혜택", "축제", "서울", "인천", "경기", "수도권"],
  openGraph: {
    title: "팁픽(Tip-Pick) | 수도권 현금 혜택 큐레이션",
    description: "오늘 당신이 놓칠 뻔한 현금 혜택, 팁픽이 대신 골라드립니다!",
    url: "https://my-pick-info.pages.dev",
    siteName: "팁픽(Tip-Pick)",
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
              "name": "팁픽(Tip-Pick)",
              "url": "https://my-pick-info.pages.dev",
              "description": "오늘 당신이 놓칠 뻔한 현금 혜택, 팁픽이 대신 골라드립니다. 수도권 지원금·혜택·축제 정보 큐레이션"
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
