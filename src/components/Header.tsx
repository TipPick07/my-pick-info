"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/festivals/", label: "이번 주 나들이" },
    { href: "/situations/", label: "상황별 혜택" },
    { href: "/guides/", label: "가이드" },
    { href: "/blog/", label: "팁픽 인사이트" },
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
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_12px_rgba(0,204,255,0.35)] group-hover:shadow-[0_0_22px_rgba(0,204,255,0.55)] transition-shadow duration-300">
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
                className={`relative group transition-colors flex items-center gap-1 ${
                  active
                    ? "text-brand-dark font-bold"
                    : "font-semibold text-slate-500 hover:text-brand-dark"
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
          
          {/* CTA 버튼 */}
          <Link href="/eligibility" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-full hover:scale-105 transition-transform shadow-md flex items-center gap-2">
            🔍 1분 맞춤 혜택 찾기
          </Link>
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
                className={`border-b border-slate-50 pb-3 transition-colors flex items-center justify-between ${
                  active
                    ? "font-extrabold text-brand-dark"
                    : "font-bold text-slate-800 hover:text-brand-dark"
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          {/* 모바일 CTA 버튼 */}
          <Link href="/eligibility" onClick={() => setIsMenuOpen(false)} className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded-full hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform">
            🔍 1분 맞춤 혜택 찾기
          </Link>
        </nav>
      </div>
    </header>
  );
}
