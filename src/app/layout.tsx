import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL('https://tip-pick.com'),
  title: "수도권 팁픽 (TIP-PICK) | 내 돈 찾는 지원금 & 축제 가이드",
  description: "오늘 당신이 놓칠 뻔한 현금 혜택, 팁픽이 대신 골라드립니다! 서울·인천·경기 지역 지원금, 축제, 행사 정보를 매일 업데이트합니다.",
  keywords: ["팁픽", "tip-pick", "지원금", "혜택", "축제", "서울", "인천", "경기", "수도권"],
  openGraph: {
    title: "수도권 팁픽 (TIP-PICK) | 내 돈 찾는 지원금 & 축제 가이드",
    description: "오늘 당신이 놓칠 뻔한 현금 혜택, 팁픽이 대신 골라드립니다!",
    url: "https://tip-pick.com",
    siteName: "수도권 팁픽",
    locale: "ko_KR",
    type: "website",
  },
  verification: {
    google: "saxx0TmyMt0GPQutygmlIFVX649KYJY1Db3lAbfBx9c",
    other: {
      "naver-site-verification": "ac2cd7f1d67042249594921d1128330332bd7b27",
    },
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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8471539268153543"
          crossOrigin="anonymous"
        />
        {/* Structured Data: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "수도권 팁픽",
              "url": "https://tip-pick.com",
              "description": "오늘 당신이 놓칠 뻔한 현금 혜택, 팁픽이 대신 골라드립니다. 수도권 지원금·혜택·축제 정보 큐레이션"
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5N4Y71B3ZQ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5N4Y71B3ZQ');
          `}
        </Script>
      </body>
    </html>
  );
}
