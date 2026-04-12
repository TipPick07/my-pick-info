'use client';

import { useEffect, useRef } from 'react';

export default function CoupangBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const partnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID || 'AF6155387';

  useEffect(() => {
    // 1. 이미 스크립트가 로드되었는지 확인
    const scriptId = 'coupang-partners-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeBanner = () => {
      if (window.PartnersCoupang && containerRef.current) {
        containerRef.current.innerHTML = ''; // 중복 생성 방지
        new window.PartnersCoupang.G({
          id: 980253,
          template: 'carousel',
          trackingCode: partnerId,
          width: '100%', // 화면 크기에 맞게 자동 조절
          height: 140,
          tsource: '',
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://ads-partners.coupang.com/g.js';
      script.async = true;
      script.onload = initializeBanner;
      document.head.appendChild(script);
    } else {
      initializeBanner();
    }
  }, [partnerId]);

  if (!partnerId) return null;

  return (
    <div className="my-4 w-full">
      <div ref={containerRef} className="flex justify-center" />
      <p className="mt-2 text-center text-[10px] text-gray-400">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
}

// Window 인터페이스 확장 (타입스크립트 에러 방지)
declare global {
  interface Window {
    PartnersCoupang: any;
  }
}
