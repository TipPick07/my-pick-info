"use client";

import { useState } from "react";
import { COUPANG_DISCLOSURE } from "@/config/affiliate";

// 💰 금융(CPA) 배너 설정 정보
// 🔴 2026-09-01: enabled=false 로 꺼 뒀다. 마스터 스위치(NEXT_PUBLIC_ADS_ENABLED)를 켜도
//    이 배너는 안 나온다. 이유 — ⓐ 매칭 키워드(지원금·적금·수당·청년)가 글 101편 대부분에
//    걸려 사실상 전면 노출이고 ⓑ 링크(iryan.kr)가 어떤 상품인지 검증되지 않았다.
//    YMYL 사이트라 검증 전 전면 노출은 위험하다. 확인한 뒤 true 로 바꿀 것.
export const FINANCE_BANNER = {
  enabled: false,
  href: "https://iryan.kr/t8glymw9zw", // 👈 금융 제휴 마케팅 링크로 변경하세요.
  imgSrc: "", // 👈 실제 배너 이미지 경로로 변경하세요. (예: "/images/banners/finance.png")
  title: "💰 [추천] 나만 몰랐던 정부 지원금 & 고금리 혜택 확인하기",
  description: "내 조건에 맞는 숨은 금융 혜택과 특별 수당을 1분 만에 실시간으로 조회하고 신청해 보세요!",
};

// ✈️ 여행/쿠팡(CPS) 배너 설정 정보
// 🔴 2026-09-01: enabled=false 로 껐다. 이 배너가 겨냥한 축제·나들이 콘텐츠는
//    2026-08-09 축 분리로 이 사이트에서 전부 삭제됐고(글 101편이 benefit·경제뿐),
//    남은 것은 오탐뿐이다 — text.includes("행사")가 「권리를 행사한다」에 걸려
//    퇴직연금 미납 글에 "감성 숙소" 배너가 붙었다(2026-09-01 빌드 실측 7편).
//    2글자 한글 키워드 부분일치의 한계이며, 맥락 기반 <AffiliateBox>(src/config/affiliate.ts)가
//    이 역할을 대체한다. 축제 콘텐츠를 되살리는 날 다시 검토할 것.
export const TRAVEL_BANNER = {
  enabled: false,
  href: "https://link.coupang.com/a/d2iVnkYZmC", // 👈 여행/쿠팡 제휴 마케팅 링크로 변경하세요.
  imgSrc: "", // 👈 실제 배너 이미지 경로로 변경하세요. (예: "/images/banners/travel.png")
  title: "✈️ [특가] 이번 주말 힐링 보장! 인기 축제 & 감성 숙소 모음",
  description: "팁픽이 직접 엄선한 드라이브 코스 정보와 최대 50% 특가 할인 숙소 혜택을 지금 만나보세요.",
};

interface AffiliateBannerProps {
  textContext: string | undefined | null;
}

/**
 * 본문 키워드 감지 기반 제휴 마케팅 배너 컴포넌트입니다.
 * 
 * - textContext에 '지원금', '적금', '수당', '청년'이 포함되어 있으면 -> 금융 배너
 * - textContext에 '축제', '드라이브', '여행', '행사'가 포함되어 있으면 -> 여행 배너
 * - 조건이 충족되지 않으면 아무것도 그리지 않습니다.
 * - 이미지가 누락되거나 에러가 나면 엑스박스 대신 고급스러운 Tailwind 그라데이션 카드 배너를 렌더링합니다.
 */
export default function AffiliateBanner({ textContext }: AffiliateBannerProps) {
  const [imageError, setImageError] = useState(false);

  // 본문 내용이 아예 비어있으면 렌더링하지 않습니다.
  if (!textContext) return null;

  const text = textContext;

  // 1. 금융(CPA) 배너 매칭 기준 단어
  const financeKeywords = ["지원금", "적금", "수당", "청년"];
  const hasFinance = financeKeywords.some((keyword) => text.includes(keyword));

  // 2. 쿠팡/여행(CPS) 배너 매칭 기준 단어
  const travelKeywords = ["축제", "드라이브", "여행", "행사"];
  const hasTravel = travelKeywords.some((keyword) => text.includes(keyword));

  // 두 가지 키워드 중 우선순위에 따라 띄울 배너 데이터를 고릅니다. (금융 우선)
  let bannerData = null;
  let bgGradient = "";
  let accentColor = "";

  if (hasFinance && FINANCE_BANNER.enabled) {
    bannerData = FINANCE_BANNER;
    bgGradient = "from-emerald-50 to-teal-50 border-emerald-100/80 hover:border-emerald-300";
    accentColor = "bg-emerald-500 text-white";
  } else if (hasTravel && TRAVEL_BANNER.enabled) {
    bannerData = TRAVEL_BANNER;
    bgGradient = "from-cyan-50 to-blue-50 border-cyan-100/80 hover:border-cyan-300";
    accentColor = "bg-cyan-500 text-white";
  }

  // 매칭되는 단어가 없다면 배너를 아예 렌더링하지 않습니다.
  if (!bannerData) return null;

  // 이미지가 정상적으로 지정되어 있고 에러가 안 났다면 이미지 배너를 보여줍니다.
  const showImage = bannerData.imgSrc && bannerData.imgSrc.trim() !== "" && !imageError;

  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== 'true') return null;

  return (
    <div className="w-full my-8">
      <a
        href={bannerData.href}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="block group"
      >
        {showImage ? (
          // 🖼️ 이미지 배너 렌더링
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-slate-200 shadow-md group-hover:shadow-lg transition-all duration-300">
            <img
              src={bannerData.imgSrc}
              alt={bannerData.title}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              onError={() => setImageError(true)} // 만약 이미지 로드 실패 시 텍스트 그라데이션 카드로 변환!
            />
          </div>
        ) : (
          // 🎨 이미지 파일이 아직 없거나 로드에 실패했을 때 나타나는 우아한 그라데이션 텍스트 카드 배너
          <div
            className={`w-full p-6 md:p-8 rounded-[2.5rem] border-2 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 bg-gradient-to-r ${bgGradient} transition-all duration-300`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${accentColor}`}>
                  {hasFinance ? "SPECIAL BENEFIT" : "HOT PLACE"}
                </span>
                <h3 className="text-base md:text-lg font-black text-slate-800 leading-snug group-hover:text-cyan-600 transition-colors">
                  {bannerData.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  {bannerData.description}
                </p>
              </div>

              {/* 우측 바로가기 버튼 */}
              <div
                className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${accentColor} shadow-sm group-hover:scale-105`}
              >
                바로가기 →
              </div>
            </div>
          </div>
        )}
      </a>
      {/* 대가성 표기 — 쿠팡 파트너스 필수. 링크와 같은 화면에 반드시 함께 노출한다. */}
      <p className="mt-2 px-2 text-[11px] leading-relaxed text-slate-400">
        {COUPANG_DISCLOSURE}
      </p>
    </div>
  );
}
