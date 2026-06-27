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
  title: "팁픽 (TIP-PICK) | 정부 지원금·경제·생활정보 가이드",
  description: "정부 지원금부터 경제·세금, 실생활 계산기까지. 돈 되는 정보를 비전문가 눈높이로 쉽게 정리해 드립니다.",
  keywords: ["팁픽", "tip-pick", "정부지원금", "지원금", "경제", "세금", "연봉 실수령액", "대출 계산기", "생활정보"],
  openGraph: {
    title: "팁픽 (TIP-PICK) | 정부 지원금·경제·생활정보 가이드",
    description: "정부 지원금부터 경제·세금, 실생활 계산기까지. 돈 되는 정보를 쉽게 골라드립니다.",
    url: "https://tip-pick.com",
    siteName: "팁픽",
    locale: "ko_KR",
    type: "website",
    images: [{ url: 'https://tip-pick.com/og-image.png', width: 1200, height: 630, alt: '팁픽 - 정부 지원금·경제·생활정보 가이드' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://tip-pick.com/og-image.png'],
  },
  icons: {
    icon: '/images/logo-tippick.png',
    shortcut: '/images/logo-tippick.png',
    apple: '/images/logo-tippick.png',
  },
  verification: {
    google: "saxx0TmyMt0GPQutygmlIFVX649KYJY1Db3lAbfBx9c",
    other: {
      "naver-site-verification": "ac2cd7f1d67042249594921d1128330332bd7b27",
    },
  },
};

import StickyCtaBar from "@/components/StickyCtaBar";

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
              "name": "팁픽",
              "url": "https://tip-pick.com",
              "description": "정부 지원금·경제·세금·생활정보를 비전문가 눈높이로 정리하는 생활정보 가이드"
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <StickyCtaBar />
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
