"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">
            수도권<span className="text-indigo-600">N</span>라이프
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/festivals/" className="hover:text-indigo-600 transition-colors">축제/행사</Link>
          <Link href="/benefits/" className="hover:text-indigo-600 transition-colors">지원금 혜택</Link>
          <Link href="/blog/" className="hover:text-indigo-600 transition-colors">블로그</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-slate-900 transition-transform ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-slate-900 transition-opacity ${isMenuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-slate-900 transition-transform ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl transition-all duration-300 transform ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}>
        <nav className="flex flex-col p-6 space-y-4 text-lg font-bold text-slate-800">
          <Link href="/festivals/" onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-600 border-b border-slate-50 pb-2">축제/행사</Link>
          <Link href="/benefits/" onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-600 border-b border-slate-50 pb-2">지원금 혜택</Link>
          <Link href="/blog/" onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-600 pb-2">블로그</Link>
        </nav>
      </div>
    </header>
  );
}
