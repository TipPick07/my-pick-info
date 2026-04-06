"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/60 py-16 px-6 mt-auto">
      <div className="container mx-auto max-w-4xl space-y-10 text-center">
        
        {/* Top Row: Essential Menus */}
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
          <Link href="/terms" className="hover:text-slate-900 transition-colors">이용약관</Link>
          <span className="text-slate-300">|</span>
          <Link href="/privacy" className="text-slate-900 font-semibold hover:text-cyan-600 transition-colors">개인정보처리방침</Link>
          <span className="text-slate-300">|</span>
          <Link href="/disclaimer" className="hover:text-slate-900 transition-colors">면책공고</Link>
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
  );
}
