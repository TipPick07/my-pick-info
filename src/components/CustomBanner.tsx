"use client";

import { useState } from "react";

interface BannerConfig {
  isActive: boolean;
  imageUrl: string;
  linkUrl: string;
}

interface CustomBannerProps {
  config: BannerConfig | undefined | null;
}

/**
 * 직접 광고 영업 및 스폰서십 유치용 고정 가로 배너 컴포넌트입니다.
 * 
 * - isActive가 true일 때만 노출됩니다.
 * - 1200x200 등 가로로 긴 비율(Aspect Ratio)을 모바일과 PC 화면에서 찌그러짐 없이 완벽한 비율로 렌더링합니다.
 * - 이미지가 로드되지 않거나 placeholder 단계일 때는 '광고 문의 안내' 형태의 대안형 Sponsor Card 디자인으로 자동 전환되어 프로페셔널한 느낌을 줍니다.
 */
export default function CustomBanner({ config }: CustomBannerProps) {
  const [imageError, setImageError] = useState(false);

  // 설정이 없거나 비활성화(isActive: false) 상태라면 화면에 아무것도 그리지 않습니다.
  if (!config || !config.isActive) return null;

  // placeholder나 임시 주소 검출 로직
  const isPlaceholder = 
    config.imageUrl.includes("via.placeholder.com") || 
    config.imageUrl.trim() === "" || 
    imageError;

  return (
    <div className="w-full">
      <a
        href={config.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        {!isPlaceholder ? (
          // 🖼️ 실제 스폰서 광고 이미지 배너 렌더링
          <div className="relative w-full aspect-[6/1] overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm group-hover:shadow-md transition-all duration-300 bg-slate-100">
            <img
              src={config.imageUrl}
              alt="스폰서 배너"
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-75"
              onError={() => setImageError(true)} // 만약 이미지 로드 실패 시 안내 카드로 대체!
            />
          </div>
        ) : (
          // 📢 광고 모집용 예쁜 그라데이션 카드형 배너 (이미지 준비 전 활성화 상태일 때)
          <div className="w-full py-5 px-6 rounded-[2rem] border-2 border-dashed border-cyan-200 bg-gradient-to-r from-cyan-50/40 via-white to-emerald-50/40 shadow-sm group-hover:shadow-md group-hover:border-cyan-400 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="bg-cyan-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider">
                    SPONSORSHIP
                  </span>
                  <span className="text-slate-700 font-bold text-sm md:text-base">
                    📢 팁픽의 파트너가 되어주세요!
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  일 평균 수천 명의 정보 탐색가들이 방문하는 팁픽 대문에 직접 고정 광고를 실어보세요.
                </p>
              </div>

              {/* 우측 연락 버튼 */}
              <div className="shrink-0 bg-slate-900 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow group-hover:bg-cyan-600 transition-all duration-300">
                광고 영업/제휴 제안하기 →
              </div>
            </div>
          </div>
        )}
      </a>
    </div>
  );
}
