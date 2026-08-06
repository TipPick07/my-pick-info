"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdFit from "@/components/AdFit";
import { visibleCategories } from "@/config/categories";

export default function Footer() {
  const pathname = usePathname();
  const normalize = (p: string) => p.replace(/\/$/, "") || "/";
  const isActive = (href: string) => normalize(pathname) === normalize(href);

  const contentLinks = [
    ...visibleCategories().map((c) => ({ href: c.href, label: c.label })),
    { href: "/guides/", label: "가이드" },
    { href: "/topics/", label: "주제별 모아보기" },
    { href: "/blog/", label: "전체 글" },
  ];
  const siteLinks = [
    { href: "/about/", label: "소개" },
    { href: "/terms/", label: "이용약관" },
    { href: "/privacy/", label: "개인정보처리방침" },
    { href: "/disclaimer/", label: "면책공고" },
    { href: "/contact/", label: "문의" },
  ];
  const colLink = (active: boolean) =>
    `transition-colors ${active ? "text-brand-dark font-semibold" : "text-slate-500 hover:text-brand-dark"}`;

  return (
    <>
      <AdFit width="320" height="100" />

      <footer className="bg-slate-50 border-t border-slate-200/60 py-14 px-6 mt-auto">
        <div className="container mx-auto max-w-3xl space-y-8">
          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-md mx-auto">
            <div className="space-y-2.5">
              <p className="text-xs font-black text-slate-700 tracking-wider">콘텐츠</p>
              <ul className="space-y-2 text-sm">
                {contentLinks.map((l) => (
                  <li key={l.href}><Link href={l.href} className={colLink(isActive(l.href))}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-black text-slate-700 tracking-wider">사이트 정보</p>
              <ul className="space-y-2 text-sm">
                {siteLinks.map((l) => (
                  <li key={l.href}><Link href={l.href} className={colLink(isActive(l.href))}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="pt-6 border-t border-slate-200/60 text-center space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
            <p>문의 · 광고: <a href="mailto:jeepno1ykr1@gmail.com" className="hover:text-brand-dark">jeepno1ykr1@gmail.com</a></p>
            <p>상호 야미야미 · 사업자등록번호 258-02-03600 · 통신판매업 2025-인천서구-4579</p>
            <p>팁픽의 정보는 참고용이며, 신청 전 반드시 해당 기관의 공식 공고를 확인하시기 바랍니다.</p>
            <p className="pt-2 font-bold text-slate-400">© 2026 팁픽(TIP-PICK). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
