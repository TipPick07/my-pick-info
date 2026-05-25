"use client";

import { useEffect, useState } from "react";

interface RedirectClientProps {
  targetUrl: string;
}

/**
 * 3초간 머무르며 세련된 로딩 화면과 진행 상황(Progress Bar)을 보여준 뒤
 * 안전하게 외부 URL로 리다이렉트 시키는 클라이언트 전용 컴포넌트입니다.
 */
export default function RedirectClient({ targetUrl }: RedirectClientProps) {
  // 3초 동안 차오르는 게이지 바 애니메이션용 상태값입니다.
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. 3초간 게이지 바가 조금씩 부드럽게 차오르도록 설정합니다. (30ms 간격으로 게이지 증가)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 28); // 약 3초 동안 100%에 이르도록 주기를 28ms로 세팅

    // 2. 3초 뒤 실제 광고주 링크나 해당 정보 상세 페이지로 화면을 전환합니다.
    const timer = setTimeout(() => {
      window.location.href = targetUrl;
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [targetUrl]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100/80 text-center space-y-8">
        
        {/* 팁픽 브랜드 아이콘과 회전 스피너 */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* 세련된 회전 민트-블루 그라데이션 스피너 */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-cyan-500 border-r-emerald-500 animate-spin" />
            
            {/* 중앙에 위치하는 브랜드 아이콘 이모지 */}
            <span className="text-4xl animate-bounce">💡</span>
          </div>
        </div>

        {/* 안내 텍스트 */}
        <div className="space-y-3">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            안전하게 이동 중입니다
          </h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            수도권 팁픽(Tip-Pick) 가이드가 추천하는<br />
            유용한 정보 사이트로 안전하게 연결하고 있습니다.
          </p>
        </div>

        {/* 3초 동안 부드럽게 차오르는 진행 바 */}
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-75 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider">
            <span>TIP-PICK SAFETY ROUTE</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* 로딩 풋노트 */}
        <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-widest pt-2 border-t border-slate-50">
          SECURED BY TIP-PICK
        </p>

      </div>
    </div>
  );
}
