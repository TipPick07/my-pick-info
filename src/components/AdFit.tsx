"use client";

import { useEffect, useRef } from "react";

interface AdFitProps {
  unit?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
}

/**
 * 카카오 애드핏(Kakao AdFit) 광고 컴포넌트입니다.
 * 
 * Next.js App Router 환경에서는 페이지가 바뀔 때 광고 스크립트가 다시 실행되지 않는
 * 현상이 자주 발생합니다. 이를 방지하기 위해 React의 useEffect를 사용하여 
 * 화면이 켜질 때 광고 요소를 동적으로 만들고, 페이지를 떠날 때 말끔히 지우도록 설계되었습니다.
 */
export default function AdFit({
  unit = "DAN-QfBmTx8He16AouXv", // 단위 코드는 나중에 실제 광고 코드로 교체하시면 됩니다.
  width = "320",
  height = "100",
  disabled = false,
}: AdFitProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 만약 광고를 끄고 싶다면 아무것도 하지 않습니다.
    if (disabled) return;

    // 광고가 들어갈 상자가 준비되지 않았다면 멈춥니다.
    const adContainer = adRef.current;
    if (!adContainer) return;

    // 1. 카카오 애드핏 광고 태그(<ins>)를 직접 만듭니다.
    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", width);
    ins.setAttribute("data-ad-height", height);

    // 2. 카카오 애드핏 광고를 작동시키는 자바스크립트 스크립트(<script>)를 만듭니다.
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://t1.daumcdn.net/kas/static/ba.min.js";

    // 3. 만든 태그들을 상자(div) 안에 쏙 집어넣습니다.
    adContainer.appendChild(ins);
    adContainer.appendChild(script);

    // [중요] 컴포넌트가 화면에서 사라지거나 페이지가 이동할 때 실행되는 청소부(Clean-up) 함수입니다.
    return () => {
      if (adContainer) {
        // 상자 내부를 깨끗이 비워 찌꺼기가 남지 않게 만듭니다.
        adContainer.innerHTML = "";
      }
    };
  }, [unit, width, height, disabled]);

  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== 'true') return null;

  return (
    // 광고가 가운데에 예쁘게 오도록 정렬하고, 마진(여백)을 줍니다.
    <div className="flex justify-center my-6 w-full overflow-hidden">
      <div ref={adRef} />
    </div>
  );
}
