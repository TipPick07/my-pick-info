"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import KakaoChannelBanner from "@/components/KakaoChannelBanner";
import AdFit from "@/components/AdFit";

export default function Footer() {
  const pathname = usePathname();

  const normalize = (p: string) => p.replace(/\/$/, "") || "/";
  const isActive = (href: string) => normalize(pathname) === normalize(href);

  const contentLinks = [
    { href: "/benefits/", label: "내 돈 찾는 지원금" },
    { href: "/festivals/", label: "이번 주 나들이·축제" },
    { href: "/situations/", label: "상황별 맞춤 혜택" },
    { href: "/eligibility/", label: "🔍 1분 맞춤 혜택 찾기" },
    { href: "/blog/", label: "팁픽 인사이트" },
  ];

  const footerLinks = [
    { href: "/about", label: "팁픽은 왜 만들었나" },
    { href: "/terms", label: "이용약관" },
    { href: "/privacy", label: "개인정보처리방침" },
    { href: "/disclaimer", label: "면책공고" },
    { href: "/contact", label: "광고 문의" },
  ];

  const colLink = (active: boolean) =>
    `transition-colors ${active ? "text-[#00CCFF] font-semibold" : "text-slate-500 hover:text-[#00CCFF]"}`;

  return (
    <>
      {/* 공통 하단 카카오 애드핏 광고 */}
      <AdFit width="320" height="100" />
      
      <footer className="bg-slate-50 border-t border-slate-200/60 py-16 px-6 mt-auto">
      <div className="container mx-auto max-w-4xl space-y-10 text-center">

        {/* 사이트맵: 콘텐츠 · 사이트 정보 */}
        <nav className="grid grid-cols-2 gap-x-6 gap-y-8 text-left max-w-md mx-auto">
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-700 tracking-wider">콘텐츠</p>
            <ul className="space-y-2.5 text-sm">
              {contentLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={colLink(isActive(link.href))}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-700 tracking-wider">사이트 정보</p>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={colLink(isActive(link.href))}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Middle Row: Operation & Data Source */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-600 font-medium">
            <Mail className="w-4 h-4 text-cyan-500" />
            <span>운영자 문의: </span>
            <a href="mailto:jeepno1ykr1@gmail.com" className="hover:text-cyan-600 transition-colors">jeepno1ykr1@gmail.com</a>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            본 서비스는 <span className="font-bold text-slate-700">공공데이터포털(data.go.kr)</span>의 API를 활용하여 실시간 정보를 제공합니다.
          </p>
        </div>

        <KakaoChannelBanner />

        {/* Business Info */}
        <div className="space-y-1 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-500">사업자 정보</p>
          <p>상호: 야미야미 &nbsp;|&nbsp; 대표자: 염경록</p>
          <p>사업자등록번호: 258-02-03600</p>
          <p>통신판매업 신고번호: 2025-인천서구-4579</p>
          <p>이메일: jeepno1ykr1@gmail.com</p>
        </div>

        {/* Bottom Row: Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-200/60 space-y-4">
          <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
            팁픽은 정보의 정확성을 위해 최선을 다하나, 실제 공고와 차이가 있을 수 있습니다.
            모든 신청 전 반드시 해당 기관의 공식 공고문을 재확인하시기 바랍니다.
          </p>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Copyright © 2026 수도권 팁픽(TIP-PICK). All rights reserved.
          </p>
        </div>

      </div>
    </footer>
    </>
  );
}
