import type { ReactNode } from 'react';

/**
 * 공통 카드 — 흰 배경 · 얇은 보더 · 둥근 모서리. '상황별 혜택' 카드 톤 기준.
 * hover=true 시 CSS만으로 살짝 떠오르는 효과(JS 마우스 핸들러 불필요).
 */
export function Card({
  children,
  hover = false,
  className = '',
}: {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}) {
  const hoverCls = hover
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_28px_rgba(0,204,255,0.14)] hover:border-brand/30'
    : '';
  return (
    <div className={`bg-white rounded-[1.75rem] border border-slate-100 shadow-sm ${hoverCls} ${className}`}>
      {children}
    </div>
  );
}
