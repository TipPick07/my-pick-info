"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/festivals/", label: "이번 주말 어디 가?" },
    { href: "/weekly/", label: "이번 주 행사" },
    { href: "/benefits/", label: "내 돈 찾는 지원금" },
    { href: "/deadline/", label: "마감 임박" },
    { href: "/blog/", label: "팁픽 인사이트" },
    { href: "/about/", label: "팁픽은 왜 만들었나" },
    { href: "/contact/", label: "광고 문의" },
  ];

  const normalize = (p: string) => p.replace(/\/$/, "") || "/";
  const isActive = (href: string) => {
    const norm = normalize(pathname);
    const normHref = normalize(href);
    return norm === normHref || norm.startsWith(normHref + "/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">

        {/* ── 로고 ── */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="relative w-10 h-10 rounded-xl overflow-hidden transition-all duration-300"
            style={{ boxShadow: "0 0 12px rgba(0,204,255,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 22px rgba(0,204,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 12px rgba(0,204,255,0.35)")}
          >
            <Image
              src="/images/logo-tippick.png"
              alt="수도권 팁픽 로고"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-xs text-slate-400 font-medium tracking-wide">수도권</span>
            <span className="text-xl font-bold text-slate-900 tracking-tight">팁픽</span>
          </div>
        </Link>

        {/* ── 데스크톱 네비게이션 ── */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative group transition-colors ${
                  active
                    ? "text-[#00CCFF] font-bold"
                    : "font-semibold text-slate-500 hover:text-[#00CCFF]"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 rounded-full ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                  style={{ background: "linear-gradient(to right, #00CCFF, #33FF99)" }}
                />
              </Link>
            );
          })}
        </nav>

        {/* ── 모바일 햄버거 버튼 ── */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-slate-900 transition-transform ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-slate-900 transition-opacity ${isMenuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-slate-900 transition-transform ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* ── 모바일 메뉴 ── */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl transition-all duration-300 transform ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}>
        <nav className="flex flex-col p-6 space-y-4 text-lg">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`border-b border-slate-50 pb-3 transition-colors ${
                  active
                    ? "font-extrabold text-[#00CCFF]"
                    : "font-bold text-slate-800 hover:text-[#00CCFF]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
